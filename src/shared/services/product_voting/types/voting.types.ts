/**
 * Product Voting Contract Service - Voting Types
 * Defines core entities, statuses, round configurations, and request/response interfaces.
 */

export type RoundStatus = 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface CreateRoundParams {
  title: string;
  description?: string;
  startTime?: number;
  endTime: number;
  category?: string;
  quorum?: number;
  maxVotesPerUser?: number;
  rewardPool?: number;
  eligibleProducts?: string[];
  allowRetract?: boolean;
}

export interface VotingRound {
  roundId: string;
  title: string;
  description: string;
  status: RoundStatus;
  startTime: number;
  endTime: number;
  category?: string;
  quorum: number;
  maxVotesPerUser: number;
  totalVotes: number;
  totalWeight: number;
  rewardPool: number;
  eligibleProducts: string[];
  allowRetract: boolean;
  rewardsDistributed: boolean;
  finalized: boolean;
  finalizedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CastVoteParams {
  roundId: string;
  productId: string;
  voter: string;
  weight?: number;
}

export interface VoteResult {
  voteId: string;
  roundId: string;
  productId: string;
  voter: string;
  weight: number;
  timestamp: number;
  txHash: string;
}

export interface UserVoteEntry {
  voteId: string;
  roundId: string;
  productId: string;
  voter: string;
  weight: number;
  timestamp: number;
  active: boolean;
  txHash: string;
}

export interface RoundResults {
  roundId: string;
  status: RoundStatus;
  totalVotes: number;
  totalWeight: number;
  winningProductId: string | null;
  quorumReached: boolean;
  rankings: any[];
  endedAt: number;
  txHash?: string;
}

export interface VotingResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  txHash?: string;
}
