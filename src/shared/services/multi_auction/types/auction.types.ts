export type Address = string;
export type AuctionId = string;
export type BidderId = string;

export enum AuctionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
  DISTRIBUTED = 'distributed',
}

export enum AuctionType {
  ENGLISH = 'english',
  DUTCH = 'dutch',
  SEALED_BID = 'sealed_bid',
  RESERVE = 'reserve',
}

export interface AuctionConfig {
  title: string;
  description: string;
  productId: string;
  auctionType: AuctionType;
  startPrice: bigint;
  reservePrice?: bigint;
  minBidIncrement: bigint;
  startTime: number;
  endTime: number;
  maxBidders?: number;
  allowBidWithdrawal: boolean;
  autoDistribute: boolean;
  creator: Address;
}

export interface Auction {
  id: AuctionId;
  config: AuctionConfig;
  status: AuctionStatus;
  highestBid: bigint;
  highestBidder: Address | null;
  totalBids: number;
  totalBidders: number;
  createdAt: number;
  updatedAt: number;
  endedAt?: number;
}

export interface AuctionUpdate {
  title?: string;
  description?: string;
  endTime?: number;
  reservePrice?: bigint;
  maxBidders?: number;
}

export interface AuctionListFilter {
  status?: AuctionStatus;
  auctionType?: AuctionType;
  creator?: Address;
  limit?: number;
  offset?: number;
}

export interface AuctionResults {
  auctionId: AuctionId;
  winner: Address | null;
  winningBid: bigint;
  totalBids: number;
  totalBidders: number;
  startPrice: bigint;
  finalPrice: bigint;
  duration: number;
  distributed: boolean;
}

export interface AuctionServiceConfig {
  networkPassphrase: string;
  contractAddress: Address;
  defaultTimeout: number;
  maxRetries: number;
  cacheEnabled: boolean;
  cacheTtl: number;
}

export interface AuctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  fee: bigint;
  timestamp: number;
}

export interface AuctionEventData {
  type: string;
  auctionId: AuctionId;
  data: unknown;
  timestamp: number;
}

export type AuctionEventListener = (event: AuctionEventData) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface HealthCheck {
  connected: boolean;
  contractAddress: Address;
  network: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  totalAuctions: number;
  activeAuctions: number;
  totalVolume: bigint;
  averageBidCount: number;
  successRate: number;
}
