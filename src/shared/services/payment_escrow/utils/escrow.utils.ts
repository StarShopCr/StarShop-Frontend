import { ethers } from 'ethers';

export const formatEtherAmount = (amount: string): string => {
  return ethers.utils.formatEther(amount);
};

export const parseEtherAmount = (amount: string): string => {
  return ethers.utils.parseEther(amount).toString();
};

export const validateAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address);
};
