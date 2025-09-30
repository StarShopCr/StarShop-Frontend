import type { u32, u64, i128, Option, Map } from '@stellar/stellar-sdk';

// ==================== CORE SUBSCRIPTION TYPES ====================

/**
 * Subscription plan structure
 */
export interface Plan {
  /** Unique plan identifier */
  planId: string;
  /** Plan name */
  name: string;
  /** Plan duration in seconds */
  duration: u64;
  /** Plan price in base units */
  price: i128;
  /** Plan benefits/features */
  benefits: string[];
  /** Plan version */
  version: u32;
  /** Plan tier (Basic, Silver, Gold, Platinum) */
  tier: PlanTier;
  /** Whether plan is active */
  isActive: boolean;
  /** Plan creation timestamp */
  createdAt: u64;
  /** Plan last update timestamp */
  updatedAt: u64;
}

/**
 * NFT-based subscription representation
 */
export interface SubscriptionNFT {
  /** Subscription NFT token ID */
  tokenId: u32;
  /** User address */
  user: string;
  /** Plan ID */
  planId: string;
  /** Subscription start time */
  startTime: u64;
  /** Subscription expiry time */
  expiryTime: u64;
  /** Whether subscription is active */
  isActive: boolean;
  /** Subscription metadata */
  metadata: Map<string, string>;
}

/**
 * Subscription state enumeration
 */
export enum SubscriptionState {
  ACTIVE = 'active',
  GRACE = 'grace',
  EXPIRED = 'expired',
  NOT_FOUND = 'not_found'
}

/**
 * Plan tier enumeration
 */
export enum PlanTier {
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

/**
 * Plan creation parameters
 */
export interface PlanConfig {
  /** Plan ID */
  planId: string;
  /** Plan name */
  name: string;
  /** Plan duration in seconds */
  duration: u64;
  /** Plan price in base units */
  price: i128;
  /** Plan benefits/features */
  benefits: string[];
  /** Plan version */
  version: u32;
  /** Plan tier */
  tier: PlanTier;
}

/**
 * Standardized response wrapper for all subscription operations
 */
export interface SubscriptionResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if operation failed */
  error?: string;
  /** Error code if operation failed */
  errorCode?: SubscriptionErrorCode;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** Gas used */
  gasUsed?: number;
  /** Transaction fee */
  fee?: number;
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
  /** Response data */
  data?: any;
}

// ==================== SUBSCRIPTION MANAGEMENT TYPES ====================

/**
 * Subscription creation request
 */
export interface SubscriptionRequest {
  /** User address */
  user: string;
  /** Plan ID */
  planId: string;
  /** Optional metadata */
  metadata?: Map<string, string>;
}

/**
 * Subscription renewal request
 */
export interface RenewalRequest {
  /** User address */
  user: string;
  /** Plan ID */
  planId: string;
  /** Renewal duration (optional, uses plan default if not provided) */
  duration?: u64;
}

/**
 * Subscription reset request (admin only)
 */
export interface ResetSubscriptionRequest {
  /** Admin address */
  admin: string;
  /** Target user address */
  targetUser: string;
  /** Plan ID */
  planId: string;
  /** Reason for reset */
  reason?: string;
}

/**
 * Detailed subscription information
 */
export interface SubscriptionInfo {
  /** User address */
  user: string;
  /** Plan ID */
  planId: string;
  /** Subscription state */
  state: SubscriptionState;
  /** Start time */
  startTime: u64;
  /** Expiry time */
  expiryTime: u64;
  /** Grace period end time */
  gracePeriodEnd?: u64;
  /** Whether subscription is active */
  isActive: boolean;
  /** Subscription metadata */
  metadata: Map<string, string>;
  /** Plan details */
  plan: Plan;
}

/**
 * Subscription status check result
 */
export interface SubscriptionStatus {
  /** Whether subscription is active */
  isActive: boolean;
  /** Whether subscription is expired */
  isExpired: boolean;
  /** Whether subscription is in grace period */
  isInGrace: boolean;
  /** Time until expiry (seconds) */
  timeUntilExpiry: u64;
  /** Grace period remaining (seconds) */
  gracePeriodRemaining?: u64;
}

// ==================== FEATURE ACCESS TYPES ====================

/**
 * Feature access request
 */
export interface FeatureAccessRequest {
  /** User address */
  user: string;
  /** Plan ID */
  planId: string;
  /** Feature name */
  feature: string;
}

/**
 * Feature usage information
 */
export interface FeatureUsage {
  /** Feature name */
  feature: string;
  /** Usage count */
  usageCount: u32;
  /** Usage limit */
  usageLimit: u32;
  /** Last used timestamp */
  lastUsed: u64;
  /** Whether limit is reached */
  isLimitReached: boolean;
}

/**
 * User role information
 */
export interface UserRole {
  /** User address */
  user: string;
  /** Role name */
  role: string;
  /** Role permissions */
  permissions: string[];
  /** Role assigned timestamp */
  assignedAt: u64;
  /** Role expiry timestamp (optional) */
  expiresAt?: u64;
}

/**
 * Role assignment request
 */
export interface RoleAssignmentRequest {
  /** Role name */
  role: string;
  /** User address */
  user: string;
  /** Optional expiry timestamp */
  expiresAt?: u64;
}

// ==================== CONFIGURATION TYPES ====================

/**
 * Subscription service configuration
 */
export interface SubscriptionServiceConfig {
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
  /** Monitoring configuration */
  monitoring?: MonitoringConfig;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  /** Contract ID */
  contractId: string;
  /** Network passphrase */
  networkPassphrase: string;
  /** RPC endpoint URL */
  rpcUrl: string;
  /** Whether this is a testnet */
  isTestnet: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
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
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** Whether monitoring is enabled */
  enabled: boolean;
  /** Metrics collection interval in milliseconds */
  metricsInterval: number;
  /** Health check interval in milliseconds */
  healthCheckInterval: number;
}

// ==================== VALIDATION TYPES ====================

/**
 * Plan validation result
 */
export interface PlanValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings?: string[];
}

/**
 * Subscription validation result
 */
export interface SubscriptionValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings?: string[];
}

/**
 * Feature access validation result
 */
export interface FeatureAccessValidation {
  /** Whether access is granted */
  hasAccess: boolean;
  /** Access reason */
  reason?: string;
  /** Usage information */
  usage?: FeatureUsage;
}

// ==================== ERROR TYPES ====================

/**
 * Subscription-specific error codes
 */
export enum SubscriptionErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  PLAN_DISABLED = 'PLAN_DISABLED',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_ALREADY_ACTIVE = 'SUBSCRIPTION_ALREADY_ACTIVE',
  INVALID_PLAN_ID = 'INVALID_PLAN_ID',
  INVALID_USER_ADDRESS = 'INVALID_USER_ADDRESS',
  INVALID_FEATURE = 'INVALID_FEATURE',
  FEATURE_ACCESS_DENIED = 'FEATURE_ACCESS_DENIED',
  USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

/**
 * Plan-specific error codes
 */
export enum PlanErrorCode {
  PLAN_ALREADY_EXISTS = 'PLAN_ALREADY_EXISTS',
  PLAN_NOT_ACTIVE = 'PLAN_NOT_ACTIVE',
  INVALID_PLAN_CONFIG = 'INVALID_PLAN_CONFIG',
  PLAN_UPDATE_FAILED = 'PLAN_UPDATE_FAILED'
}

/**
 * Feature access error codes
 */
export enum FeatureAccessErrorCode {
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ROLE_NOT_ASSIGNED = 'ROLE_NOT_ASSIGNED',
  USAGE_TRACKING_FAILED = 'USAGE_TRACKING_FAILED'
}

// ==================== ADMIN TYPES ====================

/**
 * Admin information
 */
export interface AdminInfo {
  /** Admin address */
  address: string;
  /** Admin permissions */
  permissions: AdminPermission[];
  /** Whether admin is active */
  isActive: boolean;
  /** Admin creation timestamp */
  createdAt: u64;
  /** Last activity timestamp */
  lastActivity: u64;
}

/**
 * Admin permissions
 */
export enum AdminPermission {
  MANAGE_PLANS = 'MANAGE_PLANS',
  MANAGE_SUBSCRIPTIONS = 'MANAGE_SUBSCRIPTIONS',
  RESET_SUBSCRIPTIONS = 'RESET_SUBSCRIPTIONS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_FEATURES = 'MANAGE_FEATURES',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  UPGRADE_CONTRACT = 'UPGRADE_CONTRACT'
}

// ==================== ANALYTICS TYPES ====================

/**
 * Subscription analytics
 */
export interface SubscriptionAnalytics {
  /** Total active subscriptions */
  totalActiveSubscriptions: u32;
  /** Total expired subscriptions */
  totalExpiredSubscriptions: u32;
  /** Total plans */
  totalPlans: u32;
  /** Active plans */
  activePlans: u32;
  /** Revenue metrics */
  revenue: RevenueMetrics;
  /** Usage metrics */
  usage: UsageMetrics;
}

/**
 * Revenue metrics
 */
export interface RevenueMetrics {
  /** Total revenue */
  totalRevenue: i128;
  /** Monthly revenue */
  monthlyRevenue: i128;
  /** Revenue by plan */
  revenueByPlan: Map<string, i128>;
  /** Revenue by tier */
  revenueByTier: Map<PlanTier, i128>;
}

/**
 * Usage metrics
 */
export interface UsageMetrics {
  /** Total feature usage */
  totalFeatureUsage: u32;
  /** Usage by feature */
  usageByFeature: Map<string, u32>;
  /** Usage by plan */
  usageByPlan: Map<string, u32>;
  /** Average usage per user */
  averageUsagePerUser: u32;
}

// ==================== EVENT TYPES ====================

/**
 * Subscription event types
 */
export enum SubscriptionEventType {
  PLAN_CREATED = 'plan_created',
  PLAN_UPDATED = 'plan_updated',
  PLAN_DISABLED = 'plan_disabled',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  SUBSCRIPTION_RESET = 'subscription_reset',
  FEATURE_ACCESS_GRANTED = 'feature_access_granted',
  FEATURE_ACCESS_DENIED = 'feature_access_denied',
  ROLE_ASSIGNED = 'role_assigned',
  USAGE_LIMIT_REACHED = 'usage_limit_reached',
  CONTRACT_INITIALIZED = 'contract_initialized',
  ERROR = 'error'
}

/**
 * Subscription event data
 */
export interface SubscriptionEventData {
  /** Event type */
  type: SubscriptionEventType;
  /** Event timestamp */
  timestamp: u64;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** User address if applicable */
  user?: string;
  /** Plan ID if applicable */
  planId?: string;
  /** Feature name if applicable */
  feature?: string;
  /** Role name if applicable */
  role?: string;
  /** Error message if applicable */
  error?: string;
  /** Event metadata */
  metadata?: Map<string, string>;
}

/**
 * Event listener function
 */
export type SubscriptionEventListener = (event: SubscriptionEventData) => void;

/**
 * Event listener options
 */
export interface EventListenerOptions {
  /** Filter by user */
  user?: string;
  /** Filter by plan ID */
  planId?: string;
  /** Filter by feature */
  feature?: string;
  /** Filter by event types */
  eventTypes?: SubscriptionEventType[];
}

/**
 * Event subscription
 */
export interface EventSubscription {
  /** Subscription ID */
  id: string;
  /** Event types to listen for */
  eventTypes: SubscriptionEventType[];
  /** Event listener function */
  listener: SubscriptionEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Event listener options */
  options?: EventListenerOptions;
}

// ==================== HEALTH CHECK TYPES ====================

/**
 * Health check result
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
  /** Check timestamp */
  timestamp: u64;
  /** Response time in milliseconds */
  responseTime?: number;
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
  /** Last updated timestamp */
  lastUpdated: u64;
}

// ==================== UTILITY TYPES ====================

/**
 * Plan ID type
 */
export type PlanId = string;

/**
 * Feature name type
 */
export type FeatureName = string;

/**
 * User address type
 */
export type UserAddress = string;

/**
 * Contract address type
 */
export type ContractAddress = string;

/**
 * Transaction hash type
 */
export type TransactionHash = string;

/**
 * Subscription ID type
 */
export type SubscriptionId = string;

/**
 * Role name type
 */
export type RoleName = string;

/**
 * Plan price formatting options
 */
export interface PriceFormatOptions {
  /** Number of decimals */
  decimals: number;
  /** Currency symbol */
  symbol?: string;
  /** Locale for formatting */
  locale?: string;
}

/**
 * Formatted price
 */
export interface FormattedPrice {
  /** Raw price value */
  raw: i128;
  /** Formatted price string */
  formatted: string;
  /** Number of decimals */
  decimals: number;
  /** Currency symbol */
  symbol?: string;
}

/**
 * Subscription duration calculation result
 */
export interface DurationCalculation {
  /** Duration in seconds */
  duration: u64;
  /** Duration in days */
  days: number;
  /** Duration in months */
  months: number;
  /** Duration in years */
  years: number;
  /** Human-readable duration */
  humanReadable: string;
}

/**
 * Subscription cleanup result
 */
export interface CleanupResult {
  /** Whether cleanup was successful */
  success: boolean;
  /** Number of subscriptions cleaned up */
  cleanedUp: u32;
  /** Cleanup errors */
  errors: string[];
  /** Cleanup timestamp */
  timestamp: u64;
}
