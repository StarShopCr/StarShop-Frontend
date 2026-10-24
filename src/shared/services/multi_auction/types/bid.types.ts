export type BidStatus =
  | 'ACTIVE'
  | 'OUTBID'
  | 'WON'
  | 'WITHDRAWN'
  | 'REFUNDED';

export interface BidEntry {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: number;
  status: BidStatus;
  txHash: string;
}

export interface PlaceBidParams {
  auctionId: string;
  amount: number;
  bidder: string;
}

export interface HighestBidResult {
  bid: BidEntry | null;
  minNextBid: number;
  bidder: string | null;
  amount: number;
}
