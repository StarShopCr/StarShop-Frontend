import type { i128 } from './escrow.types';

// ==================== DISPUTE TYPES ====================

/**
 * Dispute status
 */
export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  AWAITING_EVIDENCE = 'awaiting_evidence',
  ARBITRATION = 'arbitration',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

/**
 * Dispute resolution outcome
 */
export enum DisputeResolution {
  FULL_REFUND = 'full_refund',
  PARTIAL_REFUND = 'partial_refund',
  RELEASE_TO_SELLER = 'release_to_seller',
  SPLIT = 'split',
  CUSTOM = 'custom',
}

/**
 * Dispute creation request
 */
export interface CreateDisputeRequest {
  escrowId: string;
  reason: string;
  disputant: string;
  evidence?: string[];
  requestedResolution?: DisputeResolution;
  requestedRefundAmount?: i128;
  metadata?: Record<string, unknown>;
}

/**
 * Dispute info
 */
export interface DisputeInfo {
  id: string;
  escrowId: string;
  disputant: string;
  respondent: string;
  reason: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  arbitrator?: string;
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEntry[];
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  refundAmount?: i128;
  metadata?: Record<string, unknown>;
}

/**
 * Dispute resolution request
 */
export interface ResolveDisputeRequest {
  disputeId: string;
  arbitrator: string;
  resolution: DisputeResolution;
  refundAmount?: i128;
  sellerAmount?: i128;
  reason: string;
  evidence?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Dispute evidence
 */
export interface DisputeEvidence {
  id: string;
  type: EvidenceType;
  content: string;
  submittedBy: string;
  submittedAt: number;
  verified: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Evidence types
 */
export enum EvidenceType {
  TEXT_DESCRIPTION = 'text_description',
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  TRANSACTION_PROOF = 'transaction_proof',
  COMMUNICATION_LOG = 'communication_log',
  DELIVERY_PROOF = 'delivery_proof',
}

/**
 * Dispute timeline entry
 */
export interface DisputeTimelineEntry {
  id: string;
  type: DisputeTimelineType;
  timestamp: number;
  actor: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dispute timeline types
 */
export enum DisputeTimelineType {
  DISPUTE_CREATED = 'dispute_created',
  EVIDENCE_SUBMITTED = 'evidence_submitted',
  ARBITRATOR_ASSIGNED = 'arbitrator_assigned',
  ARBITRATOR_REVIEW = 'arbitrator_review',
  DECISION_MADE = 'decision_made',
  DISPUTE_RESOLVED = 'dispute_resolved',
  DISPUTE_CLOSED = 'dispute_closed',
  STATUS_CHANGED = 'status_changed',
  ESCALATED = 'escalated',
}

/**
 * Dispute statistics
 */
export interface DisputeStats {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  averageResolutionTime: number;
  resolutionBreakdown: Record<DisputeResolution, number>;
}
