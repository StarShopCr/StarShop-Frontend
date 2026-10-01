import { ethers } from 'ethers';

export const formatAuctionTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const calculateRemainingTime = (endTime: number): number => {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, endTime - now);
};

export const parseEtherAmount = (amount: string | number): string => {
  return ethers.utils.parseEther(amount.toString()).toString();
};
