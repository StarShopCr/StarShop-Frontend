import type { u32, u64, i128, Option, Map } from '@stellar/stellar-sdk/contract';

/**
 * Core airdrop event configuration for creating new events
 */
export interface AirdropEventConfig {
  /** Human-readable name for the airdrop event */
  name: string;
  /** Detailed description of the airdrop event */
  description: string;
  /** Map of condition names to minimum required values */
  conditions: Map<string, u64>;
  /** Amount of tokens to distribute to each eligible user */
  amount: i128;
  /** Address of the token contract (XLM or custom token) */
  tokenAddress: string;
  /** Start timestamp (Unix seconds) for the event */
  startTime: u64;
  /** End timestamp (Unix seconds) for the event */
  endTime: u64;
  /** Optional max number of users who can claim */
  maxUsers?: Option<u64>;
  /** Optional max total tokens to distribute */
  maxTotalAmount?: Option<i128>;
}

/**
 * Airdrop event with dynamic eligibility conditions and constraints
 */
export interface AirdropEvent {
  /** Amount of tokens to distribute to each eligible user */
  amount: i128;
  /** Map of condition names to minimum required values */
  conditions: Map<string, u64>;
  /** Detailed description of the airdrop event */
  description: Buffer;
  /** End timestamp (Unix seconds) for the event */
  endTime: u64;
  /** Whether the event is active (not paused or canceled) */
  isActive: boolean;
  /** Optional max total tokens to distribute */
  maxTotalAmount: Option<i128>;
  /** Optional max number of users who can claim */
  maxUsers: Option<u64>;
  /** Human-readable name for the airdrop event */
  name: string;
  /** Start timestamp (Unix seconds) for the event */
  startTime: u64;
  /** Address of the token contract */
  tokenAddress: string;
}

/**
 * Statistics for an airdrop event
 */
export interface EventStats {
  /** Number of users who have claimed */
  recipientCount: u64;
  /** Total tokens distributed */
  totalAmountDistributed: i128;
}

/**
 * Provider registry mapping condition symbols to provider addresses
 */
export interface ProviderRegistry {
  [metric: string]: string;
}

/**
 * Eligibility conditions for dynamic validation
 */
export interface EligibilityConditions {
  [conditionName: string]: u64;
}

/**
 * Standardized response wrapper for all service operations
 */
export interface AirdropResponse<T = any> {
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
}

/**
 * Transaction execution results
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
 * Service configuration options
 */
export interface AirdropServiceConfig {
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
 * User claim status information
 */
export interface ClaimStatus {
  /** Whether user has claimed this event */
  hasClaimed: boolean;
  /** Whether user is eligible for this event */
  isEligible: boolean;
  /** Eligibility reason if not eligible */
  ineligibilityReason?: string;
  /** Amount user would receive if eligible */
  claimAmount?: i128;
}

/**
 * Batch distribution parameters
 */
export interface BatchDistributionParams {
  /** Event ID to distribute for */
  eventId: u64;
  /** List of user addresses to distribute to */
  users: string[];
  /** Optional batch size for processing */
  batchSize?: number;
}

/**
 * Event monitoring configuration
 */
export interface EventMonitoringConfig {
  /** Whether to enable real-time monitoring */
  enabled: boolean;
  /** Polling interval in milliseconds */
  pollInterval: number;
  /** Maximum number of events to monitor */
  maxEvents: number;
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
 * Wallet provider information
 */
export interface WalletProvider {
  /** Provider ID */
  id: string;
  /** Provider name */
  name: string;
  /** Whether provider is available */
  available: boolean;
  /** Provider-specific configuration */
  config?: Record<string, any>;
}

/**
 * Token information
 */
export interface TokenInfo {
  /** Token address */
  address: string;
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Token decimals */
  decimals: number;
  /** Token total supply */
  totalSupply?: i128;
}

/**
 * Event filter options for querying events
 */
export interface EventFilter {
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by token address */
  tokenAddress?: string;
  /** Filter by date range */
  dateRange?: {
    start: u64;
    end: u64;
  };
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Provider contract interface
 */
export interface ProviderContract {
  /** Provider address */
  address: string;
  /** Supported metrics */
  supportedMetrics: string[];
  /** Whether provider is active */
  isActive: boolean;
  /** Provider metadata */
  metadata?: Record<string, any>;
}
