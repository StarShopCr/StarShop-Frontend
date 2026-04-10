import type { u32, u64 } from '@stellar/stellar-sdk';

// ==================== CORE FOLLOW TYPES ====================

/**
 * Product follow relationship
 */
export interface ProductFollow {
  /** Unique follow ID */
  followId: string;
  /** Product being followed */
  productId: string;
  /** User who follows the product */
  userAddress: string;
  /** When the follow was created */
  createdAt: u64;
  /** Whether the follow is active */
  isActive: boolean;
}

/**
 * Follow status for a user-product pair
 */
export interface FollowStatus {
  /** Whether the user follows the product */
  isFollowing: boolean;
  /** When the follow started (0 if not following) */
  followedAt: u64;
  /** Total followers for this product */
  totalFollowers: u32;
}

/**
 * Follower information
 */
export interface Follower {
  /** User address */
  userAddress: string;
  /** When they started following */
  followedAt: u64;
}

/**
 * Followed product information
 */
export interface FollowedProduct {
  /** Product ID */
  productId: string;
  /** When user started following */
  followedAt: u64;
}

// ==================== SERVICE CONFIGURATION ====================

/**
 * Follow service configuration
 */
export interface FollowServiceConfig {
  /** Network configuration */
  network: FollowNetworkConfig;
  /** Timeout in seconds */
  timeoutInSeconds?: number;
  /** Transaction fee */
  fee?: number;
  /** Whether to simulate transactions */
  simulate?: boolean;
  /** Rate limiting config */
  rateLimit?: RateLimitConfig;
  /** Cache configuration */
  cache?: CacheConfig;
}

/**
 * Network configuration
 */
export interface FollowNetworkConfig {
  /** Contract ID */
  contractId: string;
  /** Network passphrase */
  networkPassphrase: string;
  /** RPC URL */
  rpcUrl: string;
  /** Whether this is testnet */
  isTestnet: boolean;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Maximum follows per hour */
  maxFollowsPerHour: number;
  /** Maximum unfollows per hour */
  maxUnfollowsPerHour: number;
  /** Maximum notifications per hour */
  maxNotificationsPerHour: number;
  /** Window duration in ms */
  windowDurationMs: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether cache is enabled */
  enabled: boolean;
  /** Cache TTL in ms */
  ttl: number;
  /** Maximum cache entries */
  maxSize: number;
}

// ==================== RESPONSE TYPES ====================

/**
 * Standard service response wrapper
 */
export interface FollowResponse<T = any> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message */
  error?: string;
  /** Error code */
  errorCode?: FollowErrorCode;
  /** Timestamp */
  timestamp: u64;
}

/**
 * Transaction result
 */
export interface FollowTransactionResult {
  /** Transaction hash */
  txHash: string;
  /** Whether transaction was successful */
  success: boolean;
  /** Block/ledger number */
  ledger?: number;
  /** Fee charged */
  fee?: number;
}

// ==================== PAGINATION ====================

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  /** Page number (0-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Items for current page */
  items: T[];
  /** Total number of items */
  total: u32;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

// ==================== ENUMS ====================

/**
 * Follow error codes
 */
export enum FollowErrorCode {
  ALREADY_FOLLOWING = 'already_following',
  NOT_FOLLOWING = 'not_following',
  PRODUCT_NOT_FOUND = 'product_not_found',
  USER_NOT_FOUND = 'user_not_found',
  RATE_LIMITED = 'rate_limited',
  INVALID_ADDRESS = 'invalid_address',
  INVALID_PRODUCT_ID = 'invalid_product_id',
  CONTRACT_ERROR = 'contract_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  UNAUTHORIZED = 'unauthorized',
  VALIDATION_ERROR = 'validation_error',
  INTERNAL_ERROR = 'internal_error'
}

/**
 * Follow event types
 */
export enum FollowEventType {
  FOLLOWED = 'followed',
  UNFOLLOWED = 'unfollowed',
  FOLLOWERS_UPDATED = 'followers_updated'
}

// ==================== EVENT TYPES ====================

/**
 * Follow event data
 */
export interface FollowEventData {
  /** Event type */
  type: FollowEventType;
  /** Product ID */
  productId: string;
  /** User address */
  userAddress: string;
  /** Event timestamp */
  timestamp: u64;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Event listener function
 */
export type FollowEventListener = (event: FollowEventData) => void;

/**
 * Event subscription handle
 */
export interface EventSubscription {
  /** Unsubscribe from event */
  unsubscribe: () => void;
  /** Event type being listened to */
  eventType: FollowEventType;
}

// ==================== BRANDED TYPES ====================

export type ProductId = string & { readonly __brand: 'ProductId' };
export type UserAddress = string & { readonly __brand: 'UserAddress' };
export type FollowId = string & { readonly __brand: 'FollowId' };
