import type { Address, AuctionId } from './auction.types';

export enum BidStatus {
  ACTIVE = 'active',
  OUTBID = 'outbid',
  WITHDRAWN = 'withdrawn',
  WON = 'won',
  LOST = 'lost',
}

export interface Bid {
  auctionId: AuctionId;
  bidder: Address;
  amount: bigint;
  status: BidStatus;
  placedAt: number;
  updatedAt: number;
  transactionHash: string;
}

export interface BidRequest {
  auctionId: AuctionId;
  amount: bigint;
  bidder: Address;
}

export interface BidUpdate {
  auctionId: AuctionId;
  newAmount: bigint;
  bidder: Address;
}

export interface BidHistory {
  auctionId: AuctionId;
  bids: Bid[];
  totalBids: number;
  highestBid: bigint;
  lowestBid: bigint;
}

export interface BidderProfile {
  address: Address;
  totalBidsPlaced: number;
  totalAuctionsWon: number;
  totalSpent: bigint;
  activeBids: number;
  reputation: number;
}

export interface BidValidation {
  valid: boolean;
  reason?: string;
  minRequired?: bigint;
  maxAllowed?: bigint;
}
