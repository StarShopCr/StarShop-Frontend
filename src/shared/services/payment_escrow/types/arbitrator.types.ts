export enum ArbitratorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface ArbitratorInfo {
  address: string;
  name: string;
  status: ArbitratorStatus;
  casesHandled: number;
  assignedAt: number;
}

export interface ArbitratorDecision {
  disputeId: string;
  decision: 'buyer' | 'seller' | 'split';
  buyerPercentage?: number;
  sellerPercentage?: number;
  notes: string;
}

export interface ArbitratorAssignment {
  escrowId: string;
  arbitratorAddress: string;
}
