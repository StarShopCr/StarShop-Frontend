import type { u32 } from '@stellar/stellar-sdk';

/**
 * NFT metadata structure
 */
export interface NFTMetadata {
  /** NFT name */
  name: string;
  /** NFT description */
  description: string;
  /** Array of attributes */
  attributes: string[];
}

/**
 * Complete NFT information including metadata and ownership
 */
export interface NFTDetail {
  /** NFT metadata */
  metadata: NFTMetadata;
  /** Current owner address */
  owner: string;
}

/**
 * NFT minting request parameters
 */
export interface MintRequest {
  /** Recipient address */
  to: string;
  /** NFT name */
  name: string;
  /** NFT description */
  description: string;
  /** NFT attributes */
  attributes: string[];
}

/**
 * Standardized response wrapper for all service operations
 */
export interface NFTResponse<T = any> {
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
export interface NFTServiceConfig {
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
 * Type-safe token ID
 */
export type TokenId = u32;

/**
 * Type-safe address type
 */
export type Address = string;

/**
 * Supply information
 */
export interface SupplyInfo {
  /** Maximum supply */
  maxSupply: u32;
  /** Current minted supply */
  currentSupply: u32;
  /** Remaining supply */
  remainingSupply: u32;
  /** Supply percentage (0-100) */
  supplyPercentage: number;
}

/**
 * Admin information
 */
export interface AdminInfo {
  /** Admin address */
  address: string;
  /** Whether contract is initialized */
  isInitialized: boolean;
}

/**
 * NFT ownership information
 */
export interface OwnershipInfo {
  /** Token ID */
  tokenId: TokenId;
  /** Owner address */
  owner: Address;
  /** Whether NFT exists */
  exists: boolean;
}

/**
 * Metadata update request
 */
export interface MetadataUpdateRequest {
  /** Token ID to update */
  tokenId: TokenId;
  /** Admin address (required for updates) */
  admin: Address;
  /** New name */
  name: string;
  /** New description */
  description: string;
  /** New attributes */
  attributes: string[];
}

/**
 * Transfer request
 */
export interface TransferRequest {
  /** From address */
  from: Address;
  /** To address */
  to: Address;
  /** Token ID */
  tokenId: TokenId;
}

/**
 * Burn request
 */
export interface BurnRequest {
  /** Owner address */
  owner: Address;
  /** Token ID */
  tokenId: TokenId;
}

/**
 * Supply validation result
 */
export interface SupplyValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Current supply info */
  supplyInfo?: SupplyInfo;
}

/**
 * Metadata validation result
 */
export interface MetadataValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages */
  errors: string[];
}

/**
 * Ownership validation result
 */
export interface OwnershipValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Ownership info */
  ownershipInfo?: OwnershipInfo;
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
 * NFT filter options for querying NFTs
 */
export interface NFTFilter {
  /** Filter by owner */
  owner?: Address;
  /** Filter by name contains */
  nameContains?: string;
  /** Filter by attribute contains */
  attributeContains?: string;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * NFT search result
 */
export interface NFTSearchResult {
  /** Token ID */
  tokenId: TokenId;
  /** NFT details */
  nft: NFTDetail;
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
 * Event listener options
 */
export interface EventListenerOptions {
  /** Filter by token ID */
  tokenId?: TokenId;
  /** Filter by owner */
  owner?: Address;
  /** Filter by admin */
  admin?: Address;
}

/**
 * NFT service event types
 */
export enum NFTEventType {
  NFT_MINTED = 'nft_minted',
  NFT_TRANSFERRED = 'nft_transferred',
  NFT_BURNED = 'nft_burned',
  METADATA_UPDATED = 'metadata_updated',
  SUPPLY_CHANGED = 'supply_changed',
  ADMIN_CHANGED = 'admin_changed',
  CONTRACT_INITIALIZED = 'contract_initialized',
  ERROR = 'error',
}

/**
 * NFT service event data
 */
export interface NFTEventData {
  /** Event type */
  type: NFTEventType;
  /** Event timestamp */
  timestamp: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** Token ID if applicable */
  tokenId?: TokenId;
  /** Owner address if applicable */
  owner?: Address;
  /** From address if applicable */
  from?: Address;
  /** To address if applicable */
  to?: Address;
  /** Admin address if applicable */
  admin?: Address;
  /** Error message if applicable */
  error?: string;
  /** Supply info if applicable */
  supplyInfo?: SupplyInfo;
  /** Metadata if applicable */
  metadata?: NFTMetadata;
}

/**
 * Event listener function type
 */
export type NFTEventListener = (event: NFTEventData) => void;

/**
 * Event subscription
 */
export interface EventSubscription {
  /** Subscription ID */
  id: string;
  /** Event types to listen for */
  eventTypes: NFTEventType[];
  /** Event listener function */
  listener: NFTEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Event listener options */
  options?: EventListenerOptions;
}