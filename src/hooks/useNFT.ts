import { useSorobanReact } from "@soroban-react/core";
import { useState } from "react";
import { nftContract } from "../soroban/nftContract";

interface NFTState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useNFT = () => {
  const { address } = useSorobanReact();
  const [state, setState] = useState<NFTState>({
    loading: false,
    error: null,
    success: false,
  });

  const mintNFT = async (metadata: string) => {
    if (!address) throw new Error("Wallet not connected");

    setState({ loading: true, error: null, success: false });
    try {
      const tokenId = await nftContract.mint(address, metadata);
      setState({ loading: false, error: null, success: true });
      return tokenId;
    } catch (error) {
      setState({
        loading: false,
        error: (error as Error).message,
        success: false,
      });
      throw error;
    }
  };

  const transferNFT = async (tokenId: string, toAddress: string) => {
    if (!address) throw new Error("Wallet not connected");

    setState({ loading: true, error: null, success: false });
    try {
      await nftContract.transfer(tokenId, toAddress);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: (error as Error).message,
        success: false,
      });
      throw error;
    }
  };

  const getUserNFTs = async () => {
    if (!address) throw new Error("Wallet not connected");

    setState({ loading: true, error: null, success: false });
    try {
      const balance = await nftContract.balanceOf(address);
      const nfts = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = i.toString();
        const uri = await nftContract.getTokenUri(tokenId);
        nfts.push({ tokenId, uri });
      }

      setState({ loading: false, error: null, success: true });
      return nfts;
    } catch (error) {
      setState({
        loading: false,
        error: (error as Error).message,
        success: false,
      });
      throw error;
    }
  };

  return {
    mintNFT,
    transferNFT,
    getUserNFTs,
    ...state,
  };
};
