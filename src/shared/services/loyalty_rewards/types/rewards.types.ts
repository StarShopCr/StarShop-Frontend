export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountPercentage?: number;
  fixedDiscount?: number;
  isActive: boolean;
}

export interface RedemptionRequest {
  rewardId: string;
  userAddress: string;
  purchaseAmount?: number;
}
