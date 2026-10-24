export type DisputeStatus =
  | 'NONE'
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'DISMISSED';

export type DisputeResolution =
  | 'RELEASE_TO_SELLER'
  | 'REFUND_TO_BUYER'
  | 'SPLIT_PROPORTIONAL';

export interface DisputeDetails {
  id: string;
  escrowId: string;
  initiator: string;
  reason: string;
  status: DisputeStatus;
  arbitrator: string | null;
  resolution?: DisputeResolution;
  splitBuyerAmount?: number;
  splitSellerAmount?: number;
  createdAt: number;
  resolvedAt?: number;
  notes?: string;
  txHash?: string;
}
