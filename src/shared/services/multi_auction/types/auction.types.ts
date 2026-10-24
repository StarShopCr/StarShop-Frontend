export type AuctionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'ENDED'
  | 'CANCELLED'
  | 'DISTRIBUTED';

export type AuctionType = 'STANDARD_ENGLISH' | 'MULTI_UNIT' | 'RESERVE_PRICE';

export interface AuctionConfig {
  id: string;
  title: string;
  description: string;
  seller: string;
  assetAddress: string;
  quantity: number;
  currency: string;
  startingBid: number;
  reservePrice: number;
  minBidIncrement: number;
  minBidIncrementType: 'FIXED' | 'PERCENTAGE';
  startTime: number;
  endTime: number;
  status: AuctionStatus;
  auctionType: AuctionType;
  antiSnipeTimeWindowSeconds?: number;
  antiSnipeExtensionSeconds?: number;
  allowBidWithdrawal: boolean;
  totalBids: number;
  totalVolume: number;
  highestBid: number;
  highestBidder: string | null;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export interface CreateAuctionParams {
  title: string;
  description?: string;
  seller: string;
  assetAddress: string;
  quantity?: number;
  currency?: string;
  startingBid: number;
  reservePrice?: number;
  minBidIncrement?: number;
  minBidIncrementType?: 'FIXED' | 'PERCENTAGE';
  startTime?: number;
  durationSeconds?: number;
  endTime?: number;
  auctionType?: AuctionType;
  antiSnipeTimeWindowSeconds?: number;
  antiSnipeExtensionSeconds?: number;
  allowBidWithdrawal?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateAuctionParams {
  title?: string;
  description?: string;
  reservePrice?: number;
  minBidIncrement?: number;
  minBidIncrementType?: 'FIXED' | 'PERCENTAGE';
  endTime?: number;
  metadata?: Record<string, unknown>;
}

export interface AuctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
  transactionHash?: string;
}

export interface AuctionResults {
  auctionId: string;
  status: AuctionStatus;
  winner: string | null;
  winningBid: number;
  reserveMet: boolean;
  totalBids: number;
  totalVolume: number;
  endedAt: number;
}
