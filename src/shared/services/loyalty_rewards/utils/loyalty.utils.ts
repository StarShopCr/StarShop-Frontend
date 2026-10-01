import { BigNumber } from 'ethers';

export const formatPoints = (points: BigNumber | number): number => {
  if (BigNumber.isBigNumber(points)) {
    return points.toNumber();
  }
  return points;
};

export const calculatePointsFromAmount = (amount: number, ratio: number): number => {
  return Math.floor(amount / ratio);
};
