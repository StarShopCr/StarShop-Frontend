import type { i128 } from '@stellar/stellar-sdk';

// ==================== CORE TYPES ====================

/**
 * Standardized response wrapper for all payment operations
 */
export interface PaymentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: PaymentErrorCode;
  transactionHash?: string;
  gasUsed?: number;
  fee?: number;
}

/**
 * Transaction execution result
 */
export interface TransactionResult {
  hash: string;
  success: boolean;
  gasUsed?: number;
  fee?: number;
  error?: string;
  data?: any;
}

/**
 * Payment processing parameters
 */
export interface PaymentRequest {
  tokenId: string;
  signer: string;
  to: string;
  amount: i128;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Refund processing parameters
 */
export interface RefundRequest {
  tokenId: string;
  signer: string;
  to: string;
  refundAmount: i128;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Dispute creation parameters
 */
export interface DisputeRequest {
  tokenId: string;
  arbitrator: string;
  buyer: string;
  seller: string;
  refundAmount: i128;
  decision: DisputeDecision;
  reason?: string;
  evidence?: string[];
}

/**
 * Dispute resolution types
 */
export enum DisputeDecision {
  FAVOR_BUYER = 'favor_buyer',
  FAVOR_SELLER = 'favor_seller',
  PARTIAL_REFUND = 'partial_refund',
  NO_REFUND = 'no_refund'
}

/**
 * Payment status enumeration
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled'
}

/**
 * Dispute status enumeration
 */
export enum DisputeStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

/**
 * Payment history entry
 */
export interface PaymentHistory {
  id: string;
  tokenId: string;
  from: string;
  to: string;
  amount: i128;
  status: PaymentStatus;
  timestamp: number;
  transactionHash: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Dispute information
 */
export interface DisputeInfo {
  id: string;
  tokenId: string;
  buyer: string;
  seller: string;
  arbitrator: string;
  status: DisputeStatus;
  refundAmount: i128;
  decision?: DisputeDecision;
  reason?: string;
  evidence?: string[];
  createdAt: number;
  resolvedAt?: number;
  transactionHash?: string;
}

/**
 * Balance information
 */
export interface BalanceInfo {
  tokenId: string;
  availableBalance: i128;
  pendingBalance: i128;
  totalBalance: i128;
  lastUpdated: number;
}

/**
 * Deposit information
 */
export interface DepositInfo {
  tokenId: string;
  amount: i128;
  signer: string;
  recipient: string;
  timestamp: number;
  transactionHash: string;
  status: PaymentStatus;
}

/**
 * Refund information
 */
export interface RefundInfo {
  id: string;
  tokenId: string;
  amount: i128;
  recipient: string;
  reason?: string;
  timestamp: number;
  transactionHash: string;
  status: PaymentStatus;
}

// ==================== CONFIGURATION TYPES ====================

/**
 * Payment service configuration
 */
export interface PaymentServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds?: number;
  fee?: number;
  simulate?: boolean;
  retryConfig?: RetryConfig;
  cache?: CacheConfig;
  monitoring?: MonitoringConfig;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  isTestnet: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  healthCheckInterval: number;
}

// ==================== VALIDATION TYPES ====================

/**
 * Payment validation result
 */
export interface PaymentValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Refund validation result
 */
export interface RefundValidation {
  isValid: boolean;
  error?: string;
  availableBalance?: i128;
  maxRefundAmount?: i128;
}

/**
 * Dispute validation result
 */
export interface DisputeValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ==================== ERROR TYPES ====================

/**
 * Payment-specific error codes
 */
export enum PaymentErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_TOKEN_ID = 'INVALID_TOKEN_ID',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  DISPUTE_NOT_FOUND = 'DISPUTE_NOT_FOUND',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

/**
 * Dispute-specific error codes
 */
export enum DisputeErrorCode {
  DISPUTE_NOT_FOUND = 'DISPUTE_NOT_FOUND',
  DISPUTE_ALREADY_RESOLVED = 'DISPUTE_ALREADY_RESOLVED',
  INVALID_ARBITRATOR = 'INVALID_ARBITRATOR',
  INVALID_DECISION = 'INVALID_DECISION',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
  UNAUTHORIZED_ARBITRATOR = 'UNAUTHORIZED_ARBITRATOR'
}

/**
 * Refund-specific error codes
 */
export enum RefundErrorCode {
  REFUND_NOT_ELIGIBLE = 'REFUND_NOT_ELIGIBLE',
  REFUND_AMOUNT_EXCEEDS_BALANCE = 'REFUND_AMOUNT_EXCEEDS_BALANCE',
  REFUND_ALREADY_PROCESSED = 'REFUND_ALREADY_PROCESSED',
  INVALID_REFUND_AMOUNT = 'INVALID_REFUND_AMOUNT',
  REFUND_PERIOD_EXPIRED = 'REFUND_PERIOD_EXPIRED'
}

// ==================== ADMIN TYPES ====================

/**
 * Admin information
 */
export interface AdminInfo {
  address: string;
  permissions: AdminPermission[];
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
}

/**
 * Admin permissions
 */
export enum AdminPermission {
  INITIALIZE_CONTRACT = 'INITIALIZE_CONTRACT',
  TRANSFER_ADMIN = 'TRANSFER_ADMIN',
  UPGRADE_CONTRACT = 'UPGRADE_CONTRACT',
  PROCESS_REFUNDS = 'PROCESS_REFUNDS',
  RESOLVE_DISPUTES = 'RESOLVE_DISPUTES',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS'
}

/**
 * Contract upgrade information
 */
export interface ContractUpgrade {
  newWasmHash: Buffer;
  version: string;
  description?: string;
  timestamp: number;
  adminAddress: string;
  transactionHash: string;
}

// ==================== UTILITY TYPES ====================

/**
 * Address validation result
 */
export interface AddressValidation {
  isValid: boolean;
  address: string;
  type?: 'stellar' | 'contract';
  error?: string;
}

/**
 * Amount formatting options
 */
export interface AmountFormatOptions {
  decimals: number;
  symbol?: string;
  locale?: string;
}

/**
 * Formatted amount
 */
export interface FormattedAmount {
  raw: i128;
  formatted: string;
  decimals: number;
  symbol?: string;
}

/**
 * Fee calculation result
 */
export interface FeeCalculation {
  baseFee: number;
  gasFee: number;
  totalFee: number;
  estimatedGas: number;
}

// ==================== EVENT TYPES ====================

/**
 * Payment event types
 */
export enum PaymentEventType {
  CONTRACT_INITIALIZED = 'contract_initialized',
  ADMIN_CHANGED = 'admin_changed',
  CONTRACT_UPGRADED = 'contract_upgraded',
  DEPOSIT_PROCESSED = 'deposit_processed',
  REFUND_PROCESSED = 'refund_processed',
  DISPUTE_CREATED = 'dispute_created',
  DISPUTE_RESOLVED = 'dispute_resolved',
  PAYMENT_STATUS_CHANGED = 'payment_status_changed',
  BALANCE_UPDATED = 'balance_updated',
  ERROR = 'error'
}

/**
 * Payment event data
 */
export interface PaymentEventData {
  type: PaymentEventType;
  timestamp: number;
  transactionHash?: string;
  error?: string;
  operation?: string;
  // Event-specific data
  tokenId?: string;
  amount?: i128;
  from?: string;
  to?: string;
  admin?: string;
  disputeId?: string;
  disputeStatus?: DisputeStatus;
  paymentStatus?: PaymentStatus;
  balance?: i128;
  [key: string]: any;
}

/**
 * Event listener function
 */
export type PaymentEventListener = (event: PaymentEventData) => void;

/**
 * Event listener options
 */
export interface EventListenerOptions {
  tokenId?: string;
  from?: string;
  to?: string;
  admin?: string;
  eventTypes?: PaymentEventType[];
}

/**
 * Event subscription
 */
export interface EventSubscription {
  id: string;
  eventTypes: PaymentEventType[];
  listener: PaymentEventListener;
  active: boolean;
  options?: EventListenerOptions;
}

// ==================== HEALTH CHECK TYPES ====================

/**
 * Health check result
 */
export interface HealthCheck {
  isHealthy: boolean;
  contractConnected: boolean;
  networkConnected: boolean;
  walletConnected: boolean;
  errors: string[];
  timestamp: number;
  responseTime?: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  averageResponseTime: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  cacheHitRate: number;
  lastUpdated: number;
}

// ==================== BATCH OPERATION TYPES ====================

/**
 * Batch operation result
 */
export interface BatchOperationResult<T = any> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
    errorCode?: PaymentErrorCode;
  }>;
  totalProcessed: number;
  successRate: number;
}

/**
 * Batch deposit parameters
 */
export interface BatchDepositParams {
  deposits: PaymentRequest[];
  maxBatchSize?: number;
  continueOnError?: boolean;
}

/**
 * Batch refund parameters
 */
export interface BatchRefundParams {
  refunds: RefundRequest[];
  maxBatchSize?: number;
  continueOnError?: boolean;
}

// ==================== SEARCH AND FILTER TYPES ====================

/**
 * Payment filter options
 */
export interface PaymentFilter {
  tokenId?: string;
  from?: string;
  to?: string;
  status?: PaymentStatus[];
  minAmount?: i128;
  maxAmount?: i128;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

/**
 * Dispute filter options
 */
export interface DisputeFilter {
  tokenId?: string;
  buyer?: string;
  seller?: string;
  arbitrator?: string;
  status?: DisputeStatus[];
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

/**
 * Search result
 */
export interface PaymentSearchResult<T = any> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// ==================== EXPORT TYPES ====================

export type TokenId = string;
export type Address = string;
export type ContractAddress = string;
export type TransactionHash = string;
export type DisputeId = string;
export type PaymentId = string;
export type RefundId = string;

// Re-export Buffer type for Node.js compatibility
export type Buffer = any; // Will be properly typed when buffer types are available
