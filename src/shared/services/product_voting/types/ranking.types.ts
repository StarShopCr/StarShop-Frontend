/**
 * Product Voting Contract Service - Ranking & Leaderboard Types
 */

export interface ProductRank {
  productId: string;
  rank: number;
  voteCount: number;
  totalWeight: number;
  percentage: number;
  category?: string;
}

export interface LeaderboardEntry {
  productId: string;
  rank: number;
  totalWeight: number;
  voteCount: number;
}

export interface CategoryRanking {
  category: string;
  rankings: ProductRank[];
}
