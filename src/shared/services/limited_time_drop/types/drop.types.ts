import type { u32, u64 } from '@stellar/stellar-sdk';

/**
 * Drop status enumeration
 */
export enum DropStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
  SOLD_OUT = 'sold_out',
}

/**
 * Drop event types for the event system
 */
export enum DropEventType {
  DROP_CREATED = 'drop_created',
  DROP_UPDATED = 'drop_updated',
  DROP_CANCELLED = 'drop_cancelled',
  DROP_ACTIVATED = 'drop_activated',
  DROP_ENDED = 'drop_ended',
  DROP_EXTENDED = 'drop_extended',
  PARTICIPATION_RECORDED = 'participation_recorded',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_REVOKED = 'access_revoked',
  ERROR = 'error',
}

/**
 * Core drop metadata structure stored on chain
 */
export interface DropMetadata {
  /** Display name of the drop */
  name: string;
  /** Detailed description */
  description: string;
  /** URL to the drop's image/banner */
  imageUrl?: string;
  /** External URL for more info */
  externalUrl?: string;
  /** Tags/categories for classification */
  tags?: string[];
  /** Custom attributes */
  attributes?: DropAttribute[];
}

/**
 * A single attribute of a drop
 */
export interface DropAttribute {
  /** Attribute display label */
  traitType: string;
  /** Attribute value */
  value: string | number | boolean;
  /** Type hint */
  displayType?: 'string' | 'number' | 'boost_number' | 'boost_percentage' | 'date';
}

/**
 * Pricing configuration for a drop
 */
export interface DropPricing {
  /** Price per unit in stroops */
  pricePerUnit: u64;
  /** Token address for payment (empty = native XLM) */
  paymentToken: string;
  /** Discount percentage (0-100) */
  discountPercentage?: u32;
  /** Minimum purchase amount */
  minPurchaseAmount?: u64;
  /** Maximum purchase amount */
  maxPurchaseAmount?: u64;
}

/**
 * Time-related configuration for a drop
 */
export interface DropTimeConfig {
  /** Unix timestamp (seconds) when the drop starts */
  startTime: u64;
  /** Unix timestamp (seconds) when the drop ends */
  endTime: u64;
  /** Maximum duration extension allowed in seconds */
  maxExtensionSeconds?: u64;
  /** Cooldown period after participation in seconds */
  cooldownPeriodSeconds?: u64;
}

/**
 * Supply configuration for a drop
 */
export interface DropSupply {
  /** Total available units */
  totalSupply: u32;
  /** Currently claimed/sold units */
  claimedSupply: u32;
  /** Maximum units per participant */
  maxPerParticipant: u32;
  /** Reserved units (e.g. for whitelist) */
  reservedSupply?: u32;
}

/**
 * Full drop record as stored on chain
 */
export interface Drop {
  /** Unique drop identifier */
  dropId: u32;
  /** Creator/admin address */
  creator: string;
  /** Drop metadata */
  metadata: DropMetadata;
  /** Pricing info */
  pricing: DropPricing;
  /** Time configuration */
  timeConfig: DropTimeConfig;
  /** Supply info */
  supply: DropSupply;
  /** Current status */
  status: DropStatus;
  /** Block ledger sequence at creation */
  createdAt: u64;
  /** Block ledger sequence of last update */
  updatedAt: u64;
}

/**
 * Request to create a new drop
 */
export interface CreateDropRequest {
  /** Creator address */
  creator: string;
  /** Drop metadata */
  metadata: DropMetadata;
  /** Pricing info */
  pricing: DropPricing;
  /** Time configuration */
  timeConfig: DropTimeConfig;
  /** Supply info */
  supply: Omit<DropSupply, 'claimedSupply'>;
}

/**
 * Request to update an existing drop
 */
export interface UpdateDropRequest {
  /** Drop ID to update */
  dropId: u32;
  /** Caller must be admin or creator */
  admin: string;
  /** Updated metadata (partial allowed) */
  metadata?: Partial<DropMetadata>;
  /** Updated pricing (partial allowed) */
  pricing?: Partial<DropPricing>;
  /** Updated time config (partial allowed) */
  timeConfig?: Partial<DropTimeConfig>;
  /** Updated supply (partial allowed) */
  supply?: Partial<Omit<DropSupply, 'claimedSupply'>>;
}

/**
 * Request to cancel a drop
 */
export interface CancelDropRequest {
  /** Drop ID to cancel */
  dropId: u32;
  /** Admin or creator address */
  admin: string;
  /** Reason for cancellation */
  reason?: string;
}

/**
 * Request to participate in a drop
 */
export interface ParticipateInDropRequest {
  /** Drop ID */
  dropId: u32;
  /** Participant address */
  participant: string;
  /** Number of units to claim */
  quantity: u32;
  /** Optional referral address */
  referralAddress?: string;
}

/**
 * Participation record
 */
export interface ParticipationRecord {
  /** Drop ID */
  dropId: u32;
  /** Participant address */
  participant: string;
  /** Units claimed */
  quantity: u32;
  /** Ledger sequence when participation occurred */
  participatedAt: u64;
  /** Transaction hash */
  transactionHash: string;
  /** Referral address if any */
  referralAddress?: string;
}

/**
 * Drop status summary returned by getDropStatus
 */
export interface DropStatusSummary {
  /** Drop ID */
  dropId: u32;
  /** Current status */
  status: DropStatus;
  /** Whether the drop is currently accepting participants */
  isActive: boolean;
  /** Whether the drop has ended */
  isEnded: boolean;
  /** Whether supply is exhausted */
  isSoldOut: boolean;
  /** Remaining time in seconds (0 if not active) */
  timeRemainingSeconds: u64;
  /** Remaining supply */
  remainingSupply: u32;
  /** Participation count */
  participantCount: u32;
}

/**
 * Request to extend a drop's end time
 */
export interface ExtendDropRequest {
  /** Drop ID to extend */
  dropId: u32;
  /** Admin address */
  admin: string;
  /** Extension duration in seconds */
  extensionSeconds: u64;
}

/**
 * Standardized response wrapper
 */
export interface DropResponse<T = any> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Response payload */
  data?: T;
  /** Human-readable error message */
  error?: string;
  /** Machine-readable error code */
  errorCode?: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
}

/**
 * Transaction execution result
 */
export interface TransactionResult {
  /** Transaction hash */
  hash: string;
  /** Whether the transaction succeeded */
  success: boolean;
  /** Error if transaction failed */
  error?: string;
  /** Gas used */
  gasUsed?: number;
  /** Transaction fee in stroops */
  fee?: number;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  /** Stellar network passphrase */
  networkPassphrase: string;
  /** Contract ID on this network */
  contractId: string;
  /** Soroban RPC URL */
  rpcUrl: string;
  /** Whether this is a testnet configuration */
  isTestnet: boolean;
}

/**
 * Service configuration options
 */
export interface DropServiceConfig {
  /** Network configuration */
  network: NetworkConfig;
  /** Transaction timeout in seconds */
  timeoutInSeconds?: number;
  /** Default transaction fee in stroops */
  fee?: number;
  /** Whether to simulate by default */
  simulate?: boolean;
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** Cache configuration */
  cache?: CacheConfig;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
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
  /** TTL in milliseconds */
  ttl: number;
  /** Maximum number of entries */
  maxSize: number;
}

/**
 * Health check result
 */
export interface HealthCheck {
  /** Whether service is healthy */
  isHealthy: boolean;
  /** Contract reachable */
  contractConnected: boolean;
  /** Network reachable */
  networkConnected: boolean;
  /** Wallet connected */
  walletConnected: boolean;
  /** List of errors encountered */
  errors: string[];
  /** Timestamp of the check */
  timestamp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Average response time in ms */
  averageResponseTime: number;
  /** Total operations performed */
  totalOperations: number;
  /** Successful operations */
  successfulOperations: number;
  /** Failed operations */
  failedOperations: number;
  /** Cache hit rate (0 to 1) */
  cacheHitRate: number;
}

/**
 * Event listener options (filters)
 */
export interface DropEventListenerOptions {
  /** Filter by drop ID */
  dropId?: u32;
  /** Filter by participant address */
  participant?: string;
  /** Filter by creator address */
  creator?: string;
}

/**
 * Event data payload
 */
export interface DropEventData {
  /** Event type */
  type: DropEventType;
  /** Timestamp of event */
  timestamp: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** Drop ID if applicable */
  dropId?: u32;
  /** Participant address if applicable */
  participant?: string;
  /** Creator address if applicable */
  creator?: string;
  /** Status change if applicable */
  newStatus?: DropStatus;
  /** Error message if type is ERROR */
  error?: string;
  /** Operation that caused error */
  operation?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Event listener function signature
 */
export type DropEventListener = (event: DropEventData) => void;

/**
 * Event subscription record
 */
export interface DropEventSubscription {
  /** Unique subscription ID */
  id: string;
  /** Event types to listen for */
  eventTypes: DropEventType[];
  /** Callback function */
  listener: DropEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Listener filter options */
  options?: DropEventListenerOptions;
}

/**
 * Filter options when listing drops
 */
export interface DropFilter {
  /** Filter by status */
  status?: DropStatus;
  /** Filter by creator address */
  creator?: string;
  /** Filter active only */
  activeOnly?: boolean;
  /** Pagination limit */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

/**
 * Validation result
 */
export interface DropValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings?: string[];
}

export type { u32, u64 };
