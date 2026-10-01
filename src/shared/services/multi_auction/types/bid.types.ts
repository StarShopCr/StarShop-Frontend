export interface Bid {
  bidder: string;
  amount: number;
  timestamp: number;
  auctionId: number;
}

export interface BidResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}
