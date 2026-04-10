export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED_BUYER = 'resolved_buyer',
  RESOLVED_SELLER = 'resolved_seller',
  RESOLVED_SPLIT = 'resolved_split',
  DISMISSED = 'dismissed',
}

export enum DisputeReason {
  ITEM_NOT_RECEIVED = 'item_not_received',
  ITEM_NOT_AS_DESCRIBED = 'item_not_as_described',
  UNAUTHORIZED_TRANSACTION = 'unauthorized_transaction',
  QUALITY_ISSUE = 'quality_issue',
  OTHER = 'other',
}

export interface DisputeConfig {
  escrowId: string;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
}

export interface DisputeDetails {
  disputeId: string;
  escrowId: string;
  initiatorAddress: string;
  reason: DisputeReason;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  createdAt: number;
  resolvedAt?: number;
  resolution?: DisputeResolution;
}

export interface DisputeResolution {
  decision: DisputeStatus;
  buyerAmount?: bigint;
  sellerAmount?: bigint;
  notes: string;
  resolvedBy: string;
}

export interface DisputeStatusResponse {
  disputeId: string;
  status: DisputeStatus;
  createdAt: number;
  resolvedAt?: number;
}
