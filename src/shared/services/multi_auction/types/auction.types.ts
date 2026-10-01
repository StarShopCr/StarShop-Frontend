export interface AuctionConfig {
  price: number;
  duration: number;
  seller: string;
}

export interface Auction {
  id: number;
  price: number;
  duration: number;
  seller: string;
  endTime: number;
  isActive: boolean;
}

export interface AuctionUpdate {
  price?: number;
  duration?: number;
}

export interface AuctionResult {
  winner: string;
  finalPrice: number;
  timestamp: number;
}
