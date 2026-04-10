import type { DisputeResolution } from './dispute.types';
import type { i128 } from './escrow.types';

// ==================== ARBITRATOR TYPES ====================

/**
 * Arbitrator status
 */
export enum ArbitratorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval',
}

/**
 * Arbitrator info
 */
export interface ArbitratorInfo {
  address: string;
  name: string;
  status: ArbitratorStatus;
  reputation: number;
  totalCases: number;
  resolvedCases: number;
  averageResolutionTime: number;
  specializations: string[];
  feePercentage: number;
  registeredAt: number;
  lastActiveAt: number;
  metadata?: Record<string, unknown>;
}

/**
 * Arbitrator assignment request
 */
export interface ArbitratorAssignmentRequest {
  escrowId: string;
  arbitratorAddress: string;
  assigner: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Arbitrator decision
 */
export interface ArbitratorDecision {
  disputeId: string;
  arbitratorAddress: string;
  resolution: DisputeResolution;
  buyerAmount: i128;
  sellerAmount: i128;
  reason: string;
  evidence: string[];
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Arbitrator registration request
 */
export interface ArbitratorRegistrationRequest {
  address: string;
  name: string;
  specializations: string[];
  feePercentage: number;
  metadata?: Record<string, unknown>;
}

/**
 * Arbitrator performance metrics
 */
export interface ArbitratorPerformance {
  address: string;
  totalCases: number;
  resolvedCases: number;
  averageResolutionTime: number;
  satisfactionRate: number;
  resolutionBreakdown: Record<DisputeResolution, number>;
  recentCases: ArbitratorCaseHistory[];
}

/**
 * Arbitrator case history entry
 */
export interface ArbitratorCaseHistory {
  disputeId: string;
  escrowId: string;
  resolution: DisputeResolution;
  resolutionTime: number;
  timestamp: number;
}
