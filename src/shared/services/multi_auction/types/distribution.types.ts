export interface DistributionDetails {
  auctionId: number;
  totalAmount: number;
  sellerAddress: string;
  platformFee: number;
  netAmount: number;
  status: 'Pending' | 'Processed' | 'Claimed';
}

export interface DistributionStatus {
  isProcessed: boolean;
  lastUpdated: number;
}
