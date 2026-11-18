import * as Client from "crowdfunding_collective";

// Stellar Testnet RPC URL configuration
const PUBLIC_STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org";

export const client = new Client.Client({
  ...Client.networks.testnet,
  rpcUrl: PUBLIC_STELLAR_RPC_URL,
});

export default client;
