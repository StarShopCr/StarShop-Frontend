/**
 * Status of a limited time drop
 */
export type DropStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ENDED'
  | 'CANCELLED'
  | 'SOLD_OUT';

/**
 * Core configuration representing a limited time drop
 */
export interface DropConfig {
  /** Unique identifier for the drop */
  dropId: string;
  /** Human-readable title of the drop */
  name: string;
  /** Detailed description of the drop */
  description: string;
  /** Stellar asset or contract address */
  tokenAddress: string;
  /** Total tokens/items allocated to this drop */
  totalAllocation: number;
  /** Total amount claimed so far */
  claimedAllocation: number;
  /** Remaining available allocation */
  remainingAllocation: number;
  /** Maximum allocation allowed per individual user */
  maxPerUser: number;
  /** Unix timestamp in seconds when drop becomes active */
  startTime: number;
  /** Unix timestamp in seconds when drop ends */
  endTime: number;
  /** Current lifecycle status */
  status: DropStatus;
  /** Whether the drop is open to public without explicit whitelist/grant */
  isPublic: boolean;
  /** Optional cancellation reason if cancelled */
  cancellationReason?: string;
  /** Creation timestamp in milliseconds */
  createdAt: number;
  /** Last update timestamp in milliseconds */
  updatedAt: number;
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters required to create a new drop
 */
export interface CreateDropParams {
  name: string;
  description: string;
  tokenAddress: string;
  totalAllocation: number;
  maxPerUser: number;
  startTime: number;
  endTime: number;
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Updatable fields for an existing drop
 */
export interface UpdateDropParams {
  name?: string;
  description?: string;
  tokenAddress?: string;
  totalAllocation?: number;
  maxPerUser?: number;
  startTime?: number;
  endTime?: number;
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Standardized service response wrapper
 */
export interface DropResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
  transactionHash?: string;
}

/**
 * Parameters for participating/claiming from a drop
 */
export interface ParticipationParams {
  user: string;
  amount: number;
  proof?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Result details of a successful participation
 */
export interface ParticipationResult {
  dropId: string;
  user: string;
  amount: number;
  totalClaimedByUser: number;
  remainingAllocation: number;
  timestamp: number;
  txHash: string;
}

/**
 * Aggregate participation metrics for a drop
 */
export interface ParticipationMetrics {
  totalParticipants: number;
  totalClaimed: number;
  remainingAllocation: number;
  participationRate: number; // percentage 0 - 100
  averageClaimPerUser: number;
}

/**
 * Time calculation results for a drop
 */
export interface TimeRemainingResult {
  timeToStartMs: number;
  timeToEndMs: number;
  isStarted: boolean;
  isEnded: boolean;
  formattedRemaining: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}
