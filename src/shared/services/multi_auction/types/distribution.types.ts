export type DistributionStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'PROCESSED'
  | 'FAILED'
  | 'CLAIMED';

export type ClaimType = 'ITEM' | 'PAYOUT' | 'REFUND';

export interface DistributionDetails {
  auctionId: string;
  winner: string | null;
  winningBid: number;
  seller: string;
  sellerPayout: number;
  platformFee: number;
  platformFeePercentage: number;
  quantity: number;
  assetAddress: string;
  status: DistributionStatus;
  distributedAt?: number;
  claimedByWinner: boolean;
  claimedBySeller: boolean;
  txHash?: string;
}

export interface DistributionResult {
  success: boolean;
  auctionId: string;
  winner: string | null;
  seller: string;
  sellerPayout: number;
  platformFee: number;
  status: DistributionStatus;
  txHash: string;
}

export interface ClaimResult {
  success: boolean;
  auctionId: string;
  claimant: string;
  claimType: ClaimType;
  amount: number;
  assetAddress: string;
  txHash: string;
}
