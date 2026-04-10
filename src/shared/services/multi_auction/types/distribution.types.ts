import type { Address, AuctionId } from './auction.types';

export enum DistributionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Distribution {
  auctionId: AuctionId;
  status: DistributionStatus;
  winner: Address;
  winnerAmount: bigint;
  sellerAmount: bigint;
  platformFee: bigint;
  platformFeePercent: number;
  processedAt?: number;
  transactionHash?: string;
}

export interface DistributionBreakdown {
  totalAmount: bigint;
  sellerShare: bigint;
  platformFee: bigint;
  refunds: DistributionRefund[];
}

export interface DistributionRefund {
  bidder: Address;
  amount: bigint;
  status: 'pending' | 'processed' | 'failed';
  transactionHash?: string;
}

export interface ClaimResult {
  auctionId: AuctionId;
  claimer: Address;
  amount: bigint;
  itemTransferred: boolean;
  transactionHash: string;
  timestamp: number;
}

export interface DistributionConfig {
  platformFeePercent: number;
  autoRefund: boolean;
  refundTimeout: number;
  minDistributionAmount: bigint;
}
