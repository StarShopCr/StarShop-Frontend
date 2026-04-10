// ==================== ESCROW CORE TYPES ====================

export type i128 = bigint;

/**
 * Escrow status enum
 */
export enum EscrowStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PARTIALLY_RELEASED = 'partially_released',
}

/**
 * Escrow configuration for creation
 */
export interface EscrowConfig {
  buyer: string;
  seller: string;
  amount: i128;
  tokenAddress: string;
  description?: string;
  expiresAt?: number;
  autoRelease?: boolean;
  autoReleaseDelay?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Escrow details
 */
export interface EscrowInfo {
  id: string;
  buyer: string;
  seller: string;
  amount: i128;
  depositedAmount: i128;
  tokenAddress: string;
  status: EscrowStatus;
  description: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  autoRelease: boolean;
  autoReleaseDelay: number;
  arbitrator?: string;
  disputeId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Escrow update request
 */
export interface EscrowUpdateRequest {
  description?: string;
  expiresAt?: number;
  autoRelease?: boolean;
  autoReleaseDelay?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Payment deposit request
 */
export interface DepositRequest {
  escrowId: string;
  amount: i128;
  sender: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payment release request
 */
export interface ReleaseRequest {
  escrowId: string;
  amount?: i128;
  releaser: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payment refund request
 */
export interface RefundRequest {
  escrowId: string;
  amount?: i128;
  reason: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payment status response
 */
export interface PaymentStatusInfo {
  escrowId: string;
  status: EscrowStatus;
  totalAmount: i128;
  depositedAmount: i128;
  releasedAmount: i128;
  refundedAmount: i128;
  lastUpdated: number;
}

/**
 * Escrow transaction record
 */
export interface EscrowTransaction {
  id: string;
  escrowId: string;
  type: EscrowTransactionType;
  amount: i128;
  from: string;
  to: string;
  timestamp: number;
  transactionHash?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Escrow transaction types
 */
export enum EscrowTransactionType {
  DEPOSIT = 'deposit',
  RELEASE = 'release',
  REFUND = 'refund',
  PARTIAL_RELEASE = 'partial_release',
  PARTIAL_REFUND = 'partial_refund',
  FEE_DEDUCTION = 'fee_deduction',
}

/**
 * Escrow service configuration
 */
export interface EscrowServiceConfig {
  network: string;
  contractAddress: string;
  defaultTimeout: number;
  maxRetries: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  feePercentage: number;
}

/**
 * Escrow service response wrapper
 */
export interface EscrowResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  timestamp: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  hash: string;
  status: 'success' | 'failed' | 'pending';
  blockNumber?: number;
  gasUsed?: string;
  timestamp: number;
}

/**
 * Escrow event types
 */
export enum EscrowEventType {
  ESCROW_CREATED = 'escrow_created',
  ESCROW_FUNDED = 'escrow_funded',
  ESCROW_RELEASED = 'escrow_released',
  ESCROW_REFUNDED = 'escrow_refunded',
  ESCROW_DISPUTED = 'escrow_disputed',
  ESCROW_CANCELLED = 'escrow_cancelled',
  ESCROW_EXPIRED = 'escrow_expired',
  PAYMENT_DEPOSITED = 'payment_deposited',
  ARBITRATOR_ASSIGNED = 'arbitrator_assigned',
  DISPUTE_RESOLVED = 'dispute_resolved',
}

/**
 * Escrow event data
 */
export interface EscrowEventData {
  type: EscrowEventType;
  escrowId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * Escrow event listener
 */
export type EscrowEventListener = (event: EscrowEventData) => void;

/**
 * Event listener options
 */
export interface EventListenerOptions {
  once?: boolean;
  filter?: (event: EscrowEventData) => boolean;
}

/**
 * Event subscription handle
 */
export interface EventSubscription {
  id: string;
  unsubscribe: () => void;
}

/**
 * Escrow analytics
 */
export interface EscrowAnalytics {
  totalEscrows: number;
  activeEscrows: number;
  completedEscrows: number;
  disputedEscrows: number;
  totalVolume: i128;
  averageAmount: i128;
  disputeRate: number;
  averageResolutionTime: number;
}

/**
 * Health check response
 */
export interface HealthCheck {
  contractConnected: boolean;
  walletConnected: boolean;
  networkStatus: string;
  lastBlockTime: number;
  version: string;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  networkId: string;
  rpcUrl: string;
  networkPassphrase: string;
  contractAddress: string;
}
