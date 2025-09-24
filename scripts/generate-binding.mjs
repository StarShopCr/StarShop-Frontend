#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { input, select, confirm } from "@inquirer/prompts";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Supported networks */
const NETWORKS = {
  testnet: {
    rpc: "https://soroban-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
    fundable: true
  },
  mainnet: {
    rpc: "https://soroban-rpc.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
    fundable: false
  },
  futurenet: {
    rpc: "https://rpc-futurenet.stellar.org:443",
    passphrase: "Test SDF Future Network ; October 2022",
    fundable: false
  }
};

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

function has(cmd) {
  try {
    execSync(process.platform === "win32" ? `where ${cmd}` : `command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch { return false; }
}

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

function slugify(s) {
  return (s || "").trim().toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "contract";
}

(async () => {
  // ---- Read flags (for CI) ----
  let contractId = arg("--contract-id");
  let network = arg("--network");
  let name = slugify(arg("--name"));
  let walletAlias = arg("--wallet-alias");   // optional: skip prompt
  const wantWalletFlag = process.argv.includes("--wallet"); // optional: skip prompt

  // ---- Prompts ----
  if (!contractId) {
    contractId = await input({
      message: "Contract ID (must be deployed):",
      validate: v => v && v.length >= 20 ? true : "Enter a valid contract id"
    });
  }

  if (!network || !NETWORKS[network]) {
    network = await select({
      message: "Select network:",
      choices: [
        { name: "testnet", value: "testnet" },
        { name: "mainnet", value: "mainnet" },
        { name: "futurenet", value: "futurenet" }
      ],
      default: "testnet"
    });
  }

  if (!name || name === "contract") {
    name = slugify(await input({
      message: "Package name (slug, e.g. pool-credit):",
      default: "contract"
    }));
  }

  const cfg = NETWORKS[network];
  if (!cfg) {
    console.error(`❌ Unknown network: ${network}`);
    process.exit(1);
  }

  // ---- Detect CLI for bindings ----
  const cli = has("stellar") ? "stellar" : (has("soroban") ? "soroban" : null);
  if (!cli) {
    console.error("❌ Need `stellar` or `soroban` CLI in PATH for bindings generation.");
    process.exit(1);
  }

  const root = join(__dirname, "..");
  const outDir = join(root, "packages", "contracts", name);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // ---- Generate TS bindings ----
  const subcmd = cli === "stellar" ? "contract bindings typescript" : "contract bindings ts";
  const genCmd = [
    `${cli} ${subcmd}`,
    `--rpc-url "${cfg.rpc}"`,
    `--network-passphrase "${cfg.passphrase}"`,
    `--contract-id ${contractId}`,
    `--output-dir "${outDir}"`
  ].join(" ");

  console.log("\n▶️ Generating bindings");
  console.log("$ " + genCmd + "\n");
  run(genCmd, { cwd: root });

  // ---- Ensure package.json for generated client ----
  const pkgPath = join(outDir, "package.json");
  if (!existsSync(pkgPath)) {
    const clientPkg = {
      name: `@contracts/${name}`,
      version: "0.1.0",
      type: "module",
      main: "./index.js",
      types: "./index.d.ts",
      files: ["*.js", "*.d.ts", "package.json", "README.md"],
      license: "MIT"
    };
    writeFileSync(pkgPath, JSON.stringify(clientPkg, null, 2));
  }

  // ---- Link into root ----
  const rootPkgPath = join(root, "package.json");
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));
  rootPkg.dependencies ||= {};
  rootPkg.dependencies[`@contracts/${name}`] = `file:./packages/contracts/${name}`;
  writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2));

  console.log("▶️ Installing to link local package...");
  run("npm install", { cwd: root });

  // ---- Optional: create Stellar wallet (requires `stellar` CLI) ----
  let createdWallet = false;
  let address = null;
  const canCreateWallet = has("stellar"); // wallet creation requires the new `stellar` CLI

  const wantWallet = wantWalletFlag || (await confirm({
    message: "Create a Stellar wallet for this network?",
    default: true
  }));

  if (wantWallet && !canCreateWallet) {
    console.warn("⚠️ Wallet creation skipped: `stellar` CLI not found (required for `stellar keys`).");
  }

  if (wantWallet && canCreateWallet) {
    if (!walletAlias) {
      walletAlias = await input({
        message: "Wallet alias (saved in stellar keys):",
        default: `${name}-${network}`
      });
    }

    try {
      const genParts = [
        "stellar keys generate",
        walletAlias,
        `--network ${network}`
      ];
      if (cfg.fundable) genParts.push("--fund"); // only on testnet by default

      console.log("\n▶️ Creating wallet");
      console.log("$ " + genParts.join(" ") + "\n");
      run(genParts.join(" "));

      // read address
      const addrCmd = `stellar keys address ${walletAlias}`;
      console.log("▶️ Reading wallet address:");
      const addrBuf = execSync(addrCmd);
      address = String(addrBuf).trim();
      createdWallet = true;

      // persist to .env.local (non-secret)
      const envPath = join(root, ".env.local");
      const lines = [
        `# Stellar config for ${walletAlias}`,
        `STELLAR_ALIAS=${walletAlias}`,
        `STELLAR_ACCOUNT=${address}`,
        `STELLAR_NETWORK=${network}`,
        `STELLAR_RPC_URL=${cfg.rpc}`,
        `STELLAR_NETWORK_PASSPHRASE=${cfg.passphrase}`,
        ""
      ];
      writeFileSync(envPath, (existsSync(envPath) ? readFileSync(envPath, "utf8") + "\n" : "") + lines.join("\n"));

      console.log(`✅ Wallet saved. Public address: ${address}`);
      console.log(`📝 Wrote non-secret vars to .env.local`);
    } catch (e) {
      console.error("❌ Failed to create/read wallet via `stellar keys`.");
      // do not exit; bindings were already generated
    }
  }

  console.log("\n✅ All done!");
  console.log(`   Package:  @contracts/${name}`);
  console.log(`   Contract: ${contractId} on ${network}`);
  if (createdWallet) {
    console.log(`   Wallet:   ${walletAlias} (${address})`);
  }
  console.log(`   Import:   import { ContractClient } from "@contracts/${name}";\n`);
})();
