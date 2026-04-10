import type { ProductId, Address } from './voting.types';

export enum RankingCategory {
  OVERALL = 'overall',
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
  SERVICES = 'services',
  OTHER = 'other',
}

export interface ProductRanking {
  productId: ProductId;
  rank: number;
  score: number;
  previousRank: number;
  rankChange: number;
  category: RankingCategory;
  lastUpdated: number;
}

export interface RankingEntry {
  productId: ProductId;
  score: number;
  rank: number;
  totalVotes: number;
  weightedScore: number;
}

export interface RankingHistory {
  productId: ProductId;
  entries: RankingHistoryEntry[];
}

export interface RankingHistoryEntry {
  rank: number;
  score: number;
  timestamp: number;
  totalVoters: number;
}

export interface LeaderboardEntry {
  voter: Address;
  totalVotesCast: number;
  votingPower: number;
  rank: number;
  reputation: number;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: number;
}

export interface TopProductsRequest {
  limit: number;
  category?: RankingCategory;
  offset?: number;
}

export interface TopProductsResult {
  products: RankingEntry[];
  total: number;
  hasMore: boolean;
}
