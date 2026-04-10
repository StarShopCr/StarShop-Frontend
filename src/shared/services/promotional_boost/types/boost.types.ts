import type { u32, u64 } from '@stellar/stellar-sdk';

/**
 * Boost status enumeration
 */
export enum BoostStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
}

/**
 * Boost tier enumeration
 */
export enum BoostTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ELITE = 'elite',
}

/**
 * Boost target type
 */
export enum BoostTargetType {
  PRODUCT = 'product',
  SHOP = 'shop',
  COLLECTION = 'collection',
  CATEGORY = 'category',
}

/**
 * Core boost data structure
 */
export interface BoostData {
  /** Unique boost identifier */
  boostId: u32;
  /** Owner/creator address */
  owner: Address;
  /** Target entity ID to boost */
  targetId: u32;
  /** Type of target being boosted */
  targetType: BoostTargetType;
  /** Boost tier level */
  tier: BoostTier;
  /** Current boost status */
  status: BoostStatus;
  /** Boost start timestamp */
  startTime: u64;
  /** Boost end timestamp */
  endTime: u64;
  /** Amount paid for the boost */
  amountPaid: u64;
  /** Token used for payment */
  paymentToken: Address;
  /** Priority score (higher = more visible) */
  priorityScore: u32;
  /** Creation timestamp */
  createdAt: u64;
  /** Last update timestamp */
  updatedAt: u64;
}

/**
 * Request to create a new boost
 */
export interface CreateBoostRequest {
  /** Target entity ID to boost */
  targetId: u32;
  /** Type of target being boosted */
  targetType: BoostTargetType;
  /** Boost tier level */
  tier: BoostTier;
  /** Duration in seconds */
  durationSeconds: u64;
  /** Payment token address */
  paymentToken: Address;
  /** Optional custom priority score */
  priorityScore?: u32;
}

/**
 * Request to update an existing boost
 */
export interface UpdateBoostRequest {
  /** Boost ID to update */
  boostId: u32;
  /** New tier (if changing) */
  tier?: BoostTier;
  /** Extension duration in seconds */
  extensionSeconds?: u64;
  /** New priority score */
  priorityScore?: u32;
}

/**
 * Request to cancel a boost
 */
export interface CancelBoostRequest {
  /** Boost ID to cancel */
  boostId: u32;
  /** Reason for cancellation */
  reason?: string;
}

/**
 * Request to activate a boost
 */
export interface ActivateBoostRequest {
  /** Boost ID to activate */
  boostId: u32;
  /** Admin address authorizing activation */
  admin?: Address;
}

/**
 * Boost filter options for querying
 */
export interface BoostFilter {
  /** Filter by owner */
  owner?: Address;
  /** Filter by status */
  status?: BoostStatus;
  /** Filter by tier */
  tier?: BoostTier;
  /** Filter by target type */
  targetType?: BoostTargetType;
  /** Filter by target ID */
  targetId?: u32;
  /** Filter by active boosts only */
  activeOnly?: boolean;
  /** Maximum results */
  limit?: u32;
  /** Pagination offset */
  offset?: u32;
}

/**
 * Boost search result
 */
export interface BoostSearchResult {
  /** Boost ID */
  boostId: u32;
  /** Boost data */
  boost: BoostData;
  /** Visibility stats */
  visibility?: VisibilityStats;
}

/**
 * Boost statistics summary
 */
export interface BoostStats {
  /** Total active boosts */
  totalActive: u32;
  /** Total boosts created */
  totalCreated: u32;
  /** Total boosts completed */
  totalCompleted: u32;
  /** Total boosts cancelled */
  totalCancelled: u32;
  /** Total revenue generated */
  totalRevenue: u64;
}

/**
 * Standardized response wrapper for all boost service operations
 */
export interface BoostResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if operation failed */
  error?: string;
  /** Error code if operation failed */
  errorCode?: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** Timestamp of response */
  timestamp?: number;
}

/**
 * Transaction execution result
 */
export interface TransactionResult {
  /** Transaction hash */
  hash: string;
  /** Whether transaction was successful */
  success: boolean;
  /** Error message if transaction failed */
  error?: string;
  /** Gas used */
  gasUsed?: number;
  /** Transaction fee */
  fee?: number;
  /** Result data */
  data?: any;
}

/**
 * Network configuration for the service
 */
export interface NetworkConfig {
  /** Network passphrase */
  networkPassphrase: string;
  /** Contract ID */
  contractId: string;
  /** RPC endpoint URL */
  rpcUrl: string;
  /** Whether this is a testnet */
  isTestnet: boolean;
}

/**
 * Boost service configuration options
 */
export interface BoostServiceConfig {
  /** Network configuration */
  network: NetworkConfig;
  /** Default transaction timeout in seconds */
  timeoutInSeconds?: number;
  /** Default transaction fee */
  fee?: number;
  /** Whether to simulate transactions by default */
  simulate?: boolean;
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** Cache configuration */
  cache?: CacheConfig;
}

/**
 * Retry configuration for failed operations
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean;
  /** Cache TTL in milliseconds */
  ttl: number;
  /** Maximum cache size */
  maxSize: number;
}

/**
 * Admin information
 */
export interface AdminInfo {
  /** Admin address */
  address: Address;
  /** Whether contract is initialized */
  isInitialized: boolean;
}

/**
 * Service health check result
 */
export interface HealthCheck {
  /** Whether service is healthy */
  isHealthy: boolean;
  /** Contract connectivity status */
  contractConnected: boolean;
  /** Network connectivity status */
  networkConnected: boolean;
  /** Wallet connection status */
  walletConnected: boolean;
  /** Error messages */
  errors: string[];
  /** Timestamp of check */
  timestamp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** Total operations performed */
  totalOperations: number;
  /** Successful operations */
  successfulOperations: number;
  /** Failed operations */
  failedOperations: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  /** Total operations attempted */
  total: number;
  /** Successful operations */
  successful: number;
  /** Failed operations */
  failed: number;
  /** Operation results */
  results: TransactionResult[];
  /** Errors */
  errors: string[];
}

/**
 * Boost validation result
 */
export interface BoostValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Boost data if valid */
  boostData?: BoostData;
}

/**
 * Event listener options
 */
export interface EventListenerOptions {
  /** Filter by boost ID */
  boostId?: u32;
  /** Filter by owner */
  owner?: Address;
  /** Filter by target ID */
  targetId?: u32;
}

/**
 * Boost service event types
 */
export enum BoostEventType {
  BOOST_CREATED = 'boost_created',
  BOOST_ACTIVATED = 'boost_activated',
  BOOST_UPDATED = 'boost_updated',
  BOOST_CANCELLED = 'boost_cancelled',
  BOOST_EXPIRED = 'boost_expired',
  BOOST_COMPLETED = 'boost_completed',
  VISIBILITY_CHANGED = 'visibility_changed',
  SLOT_RESERVED = 'slot_reserved',
  SLOT_RELEASED = 'slot_released',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_REFUNDED = 'payment_refunded',
  ERROR = 'error',
}

/**
 * Boost service event data
 */
export interface BoostEventData {
  /** Event type */
  type: BoostEventType;
  /** Event timestamp */
  timestamp: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** Boost ID if applicable */
  boostId?: u32;
  /** Owner address if applicable */
  owner?: Address;
  /** Target ID if applicable */
  targetId?: u32;
  /** Error message if applicable */
  error?: string;
  /** Operation if error */
  operation?: string;
  /** Additional data */
  data?: any;
}

/**
 * Event listener function type
 */
export type BoostEventListener = (event: BoostEventData) => void;

/**
 * Event subscription
 */
export interface EventSubscription {
  /** Subscription ID */
  id: string;
  /** Event types to listen for */
  eventTypes: BoostEventType[];
  /** Event listener function */
  listener: BoostEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Event listener options */
  options?: EventListenerOptions;
}

/**
 * Type-safe boost ID
 */
export type BoostId = u32;

/**
 * Type-safe address type
 */
export type Address = string;

/**
 * Type-safe slot ID
 */
export type SlotId = u32;

/**
 * Visibility stats interface (imported from visibility types)
 */
export interface VisibilityStats {
  /** Total impressions */
  totalImpressions: u64;
  /** Click-through rate */
  clickThroughRate: number;
  /** Current visibility score */
  visibilityScore: u32;
  /** Active duration in seconds */
  activeDurationSeconds: u64;
}
