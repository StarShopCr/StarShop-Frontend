import * as Client from "crowdfunding_collective";
import { PUBLIC_STELLAR_RPC_URL } from "$env/static/public";

/**
 * Client for interacting with the Crowdfunding Collective Smart Contract.
 * Provides type-safe methods for product creation, contributions, and fund management.
 */
const crowdfundingClient = new Client.Client({
  ...Client.networks.testnet,
  rpcUrl: PUBLIC_STELLAR_RPC_URL,
});

export default crowdfundingClient;
