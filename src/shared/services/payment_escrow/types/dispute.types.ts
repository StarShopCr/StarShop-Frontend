export interface DisputeDetails {
  id: string;
  escrowId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: number;
  resolution?: string;
}

export type DisputeResolution = 'REFUND_BUYER' | 'RELEASE_TO_SELLER' | 'PARTIAL_REFUND';
