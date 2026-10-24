export interface FollowStats {
  productId: string;
  totalFollowers: number;
  activeFollowers: number;
  priceAlertSubscribers: number;
  restockAlertSubscribers: number;
  lastFollowedAt?: number;
}

export interface ProductPopularityMetrics {
  productId: string;
  followersCount: number;
  rank: number;
}
