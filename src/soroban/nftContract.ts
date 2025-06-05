import { Contract, xdr } from "@stellar/stellar-sdk";

interface NFTContract {
  mint: (user: string, metadata: string) => Promise<string>;
  transfer: (tokenId: string, to: string) => Promise<void>;
  getTokenUri: (tokenId: string) => Promise<string>;
  balanceOf: (address: string) => Promise<number>;
}

const contractId = process.env.VITE_CONTRACT_ID_NFT;

if (!contractId) {
  throw new Error("NFT Contract ID not found in environment variables");
}

const contract = new Contract(contractId);

const toXDR = (value: string): xdr.ScVal => {
  return xdr.ScVal.scvString(value);
};

export const nftContract: NFTContract = {
  mint: async (user: string, metadata: string) => {
    try {
      const result = await contract.call("mint", toXDR(user), toXDR(metadata));
      return result.toString();
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  },

  transfer: async (tokenId: string, to: string) => {
    try {
      await contract.call("transfer", toXDR(tokenId), toXDR(to));
    } catch (error) {
      console.error("Error transferring NFT:", error);
      throw error;
    }
  },

  getTokenUri: async (tokenId: string) => {
    try {
      const result = await contract.call("get_token_uri", toXDR(tokenId));
      return result.toString();
    } catch (error) {
      console.error("Error getting token URI:", error);
      throw error;
    }
  },

  balanceOf: async (address: string) => {
    try {
      const result = await contract.call("balance_of", toXDR(address));
      return Number(result);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  },
};
