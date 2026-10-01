export interface ProductRanking {
  productId: string;
  rank: number;
  score: number;
}

export interface RankingHistory {
  timestamp: number;
  rank: number;
  score: number;
}
