import type { u32, u64, u128 } from '@stellar/stellar-sdk';

export type Address = string;
export type ProductId = string;
export type VoteId = string;

export enum VoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

export enum VoteStatus {
  ACTIVE = 'active',
  REMOVED = 'removed',
  EXPIRED = 'expired',
}

export interface Vote {
  voteId: VoteId;
  productId: ProductId;
  voter: Address;
  voteType: VoteType;
  weight: number;
  timestamp: number;
  status: VoteStatus;
}

export interface VoteRequest {
  productId: ProductId;
  voter: Address;
  voteType: VoteType;
}

export interface VotingResults {
  productId: ProductId;
  totalUpvotes: number;
  totalDownvotes: number;
  netScore: number;
  totalVoters: number;
  weightedScore: number;
  lastUpdated: number;
}

export interface VotingStats {
  productId: ProductId;
  totalVotes: number;
  uniqueVoters: number;
  upvotePercentage: number;
  downvotePercentage: number;
  averageVotingPower: number;
  lastVoteTimestamp: number;
}

export interface UserVotingHistory {
  voter: Address;
  votes: Vote[];
  totalVotesCast: number;
  totalUpvotes: number;
  totalDownvotes: number;
}

export interface VotingTrend {
  timestamp: number;
  totalVotes: number;
  netScore: number;
  uniqueVoters: number;
}

export interface VotingServiceConfig {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  defaultVotingPower?: number;
  maxVotesPerUser?: number;
  votingCooldownMs?: number;
}

export interface VotingResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface VotingEventType {
  VOTE_CAST: 'vote_cast';
  VOTE_UPDATED: 'vote_updated';
  VOTE_REMOVED: 'vote_removed';
  RANKING_UPDATED: 'ranking_updated';
}

export interface VotingEventData {
  type: string;
  productId: ProductId;
  voter?: Address;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface VotingEventListener {
  (event: VotingEventData): void;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  listener: VotingEventListener;
  unsubscribe: () => void;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  contractConnected: boolean;
  lastBlockTimestamp: number;
  responseTimeMs: number;
}

export interface PerformanceMetrics {
  averageResponseTimeMs: number;
  totalRequests: number;
  failedRequests: number;
  cacheHitRate: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
