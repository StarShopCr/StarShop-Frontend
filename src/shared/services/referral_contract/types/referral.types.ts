import type { u32, i128, u64, i64 } from '@stellar/stellar-sdk';

/**
 * User verification status in the system
 */
export type VerificationStatus = 
  | { tag: "Pending"; values: void } 
  | { tag: "Verified"; values: void } 
  | { tag: "Rejected"; values: readonly [string] };

/**
 * User levels with increasing benefits
 * Higher levels require stricter criteria and offer better rewards
 */
export enum UserLevel {
  Basic = 0,
  Silver = 1,
  Gold = 2,
  Platinum = 3,
}

/**
 * Core user data structure containing all user-related information
 */
export interface UserData {
  address: string;
  direct_referrals: Array<string>;
  identity_proof: string;
  join_date: u64;
  level: UserLevel;
  pending_rewards: i128;
  referrer: string | null;
  team_size: u32;
  total_rewards: i128;
  verification_status: VerificationStatus;
}

/**
 * Milestone achievement criteria and rewards
 */
export interface Milestone {
  description: string;
  required_level: UserLevel;
  requirement: MilestoneRequirement;
  reward_amount: i128;
}

/**
 * Different types of milestone requirements
 */
export type MilestoneRequirement = 
  | { tag: "DirectReferrals"; values: readonly [u32] }
  | { tag: "TeamSize"; values: readonly [u32] }
  | { tag: "TotalRewards"; values: readonly [i128] }
  | { tag: "ActiveDays"; values: readonly [u64] };

/**
 * Commission rates for different referral levels
 */
export interface RewardRates {
  level1: u32;
  level2: u32;
  level3: u32;
  max_reward_per_referral: i128;
}

/**
 * Criteria for level upgrades
 */
export interface LevelCriteria {
  required_direct_referrals: u32;
  required_team_size: u32;
  required_total_rewards: i128;
}

/**
 * Requirements for each level upgrade
 */
export interface LevelRequirements {
  gold: LevelCriteria;
  platinum: LevelCriteria;
  silver: LevelCriteria;
}

/**
 * Standardized response wrapper for all service operations
 */
export interface ReferralResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if operation failed */
  error?: string;
  /** Error code if operation failed */
  errorCode?: string;
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
export interface ReferralServiceConfig {
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
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** Whether monitoring is enabled */
  enabled: boolean;
  /** Performance tracking interval */
  trackingInterval: number;
  /** Error reporting enabled */
  errorReporting: boolean;
}

/**
 * Type-safe address type
 */
export type Address = string;

/**
 * User registration request
 */
export interface RegistrationRequest {
  /** User address */
  user: Address;
  /** Referrer address */
  referrerAddress: Address;
  /** Identity proof */
  identityProof: string;
}

/**
 * Milestone creation request
 */
export interface MilestoneRequest {
  /** Milestone description */
  description: string;
  /** Required user level */
  requiredLevel: UserLevel;
  /** Milestone requirement */
  requirement: MilestoneRequirement;
  /** Reward amount */
  rewardAmount: i128;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  /** Total users */
  totalUsers: u32;
  /** Total distributed rewards */
  totalDistributedRewards: i128;
  /** Average reward per user */
  averageRewardPerUser: i128;
  /** Conversion rate */
  conversionRate: u32;
}

/**
 * User statistics
 */
export interface UserStats {
  /** User address */
  address: Address;
  /** Direct referrals count */
  directReferrals: u32;
  /** Team size */
  teamSize: u32;
  /** User level */
  level: UserLevel;
  /** Pending rewards */
  pendingRewards: i128;
  /** Total rewards */
  totalRewards: i128;
  /** Verification status */
  verificationStatus: VerificationStatus;
  /** Join date */
  joinDate: u64;
  /** Referrer address */
  referrer: Address | null;
}

/**
 * Team analytics
 */
export interface TeamAnalytics {
  /** Direct referrals */
  directReferrals: Array<Address>;
  /** Team size */
  teamSize: u32;
  /** Conversion rate */
  conversionRate: u32;
  /** Active referrals */
  activeReferrals: u32;
  /** Verified referrals */
  verifiedReferrals: u32;
  /** Team growth rate */
  growthRate: number;
}

/**
 * Milestone progress
 */
export interface MilestoneProgress {
  /** Milestone ID */
  milestoneId: u32;
  /** Milestone description */
  description: string;
  /** Current progress */
  currentProgress: number;
  /** Required progress */
  requiredProgress: number;
  /** Progress percentage */
  progressPercentage: number;
  /** Is completed */
  isCompleted: boolean;
  /** Reward amount */
  rewardAmount: i128;
}

/**
 * Referral service event types
 */
export enum ReferralEventType {
  USER_REGISTERED = 'user_registered',
  USER_VERIFIED = 'user_verified',
  USER_LEVEL_UPGRADED = 'user_level_upgraded',
  REWARD_DISTRIBUTED = 'reward_distributed',
  REWARD_CLAIMED = 'reward_claimed',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  CONTRACT_PAUSED = 'contract_paused',
  CONTRACT_RESUMED = 'contract_resumed',
  ADMIN_CHANGED = 'admin_changed',
  ERROR = 'error',
}

/**
 * Referral service event data
 */
export interface ReferralEventData {
  /** Event type */
  type: ReferralEventType;
  /** Event timestamp */
  timestamp: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** User address if applicable */
  user?: Address;
  /** Referrer address if applicable */
  referrer?: Address;
  /** Admin address if applicable */
  admin?: Address;
  /** Error message if applicable */
  error?: string;
  /** User data if applicable */
  userData?: UserData;
  /** Milestone data if applicable */
  milestone?: Milestone;
  /** Reward amount if applicable */
  rewardAmount?: i128;
  /** User level if applicable */
  userLevel?: UserLevel;
}

/**
 * Event listener function type
 */
export type ReferralEventListener = (event: ReferralEventData) => void;

/**
 * Event subscription
 */
export interface EventSubscription {
  /** Subscription ID */
  id: string;
  /** Event types to listen for */
  eventTypes: ReferralEventType[];
  /** Event listener function */
  listener: ReferralEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Event listener options */
  options?: EventListenerOptions;
}

/**
 * Event listener options
 */
export interface EventListenerOptions {
  /** Filter by user address */
  user?: Address;
  /** Filter by referrer address */
  referrer?: Address;
  /** Filter by admin address */
  admin?: Address;
  /** Filter by user level */
  userLevel?: UserLevel;
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
  lastUpdated: number;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T> {
  /** Successful operations */
  successful: T[];
  /** Failed operations */
  failed: Array<{
    item: T;
    error: string;
    errorCode?: string;
  }>;
  /** Total operations processed */
  totalProcessed: number;
  /** Success rate (0-1) */
  successRate: number;
}

/**
 * User filter options
 */
export interface UserFilter {
  /** Filter by user level */
  level?: UserLevel;
  /** Filter by verification status */
  verificationStatus?: VerificationStatus;
  /** Filter by referrer */
  referrer?: Address;
  /** Filter by join date range */
  joinDateFrom?: u64;
  joinDateTo?: u64;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Milestone filter options
 */
export interface MilestoneFilter {
  /** Filter by required level */
  requiredLevel?: UserLevel;
  /** Filter by milestone type */
  requirementType?: 'DirectReferrals' | 'TeamSize' | 'TotalRewards' | 'ActiveDays';
  /** Filter by reward amount range */
  minRewardAmount?: i128;
  maxRewardAmount?: i128;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * User search result
 */
export interface UserSearchResult {
  /** User address */
  address: Address;
  /** User data */
  userData: UserData;
  /** User statistics */
  stats: UserStats;
}

/**
 * Milestone search result
 */
export interface MilestoneSearchResult {
  /** Milestone ID */
  milestoneId: u32;
  /** Milestone data */
  milestone: Milestone;
  /** Progress for current user */
  progress?: MilestoneProgress;
}

/**
 * Reward distribution info
 */
export interface RewardDistributionInfo {
  /** User address */
  user: Address;
  /** Reward amount */
  amount: i128;
  /** Distribution level */
  level: number;
  /** Referrer address */
  referrer: Address | null;
  /** Timestamp */
  timestamp: number;
}

/**
 * Level upgrade criteria validation
 */
export interface LevelUpgradeValidation {
  /** Whether upgrade is valid */
  isValid: boolean;
  /** Current criteria met */
  currentCriteria: Partial<LevelCriteria>;
  /** Required criteria */
  requiredCriteria: LevelCriteria;
  /** Missing criteria */
  missingCriteria: string[];
  /** Next level */
  nextLevel: UserLevel;
}

/**
 * Referral tree node
 */
export interface ReferralTreeNode {
  /** User address */
  address: Address;
  /** User level */
  level: UserLevel;
  /** Direct referrals */
  directReferrals: ReferralTreeNode[];
  /** Team size */
  teamSize: u32;
  /** Is verified */
  isVerified: boolean;
  /** Join date */
  joinDate: u64;
}

/**
 * Referral tree
 */
export interface ReferralTree {
  /** Root user */
  root: ReferralTreeNode;
  /** Total nodes */
  totalNodes: u32;
  /** Max depth */
  maxDepth: number;
  /** Total team size */
  totalTeamSize: u32;
}

/**
 * Contract state info
 */
export interface ContractStateInfo {
  /** Whether contract is paused */
  isPaused: boolean;
  /** Admin address */
  admin: Address;
  /** Total users */
  totalUsers: u32;
  /** Total distributed rewards */
  totalDistributedRewards: i128;
  /** Reward token address */
  rewardToken: Address;
  /** Contract version */
  version: string;
}

/**
 * Wallet integration info
 */
export interface WalletInfo {
  /** Wallet provider */
  provider: string;
  /** Public key */
  publicKey: Address;
  /** Is connected */
  isConnected: boolean;
  /** Network */
  network: string;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  /** Transaction fee */
  fee?: number;
  /** Timeout in seconds */
  timeoutInSeconds?: number;
  /** Whether to simulate */
  simulate?: boolean;
  /** Retry configuration */
  retry?: RetryConfig;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages */
  errors: string[];
  /** Warnings */
  warnings?: string[];
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  /** Cached data */
  data: T;
  /** Timestamp when cached */
  timestamp: number;
  /** TTL in milliseconds */
  ttl: number;
}

/**
 * Service status
 */
export interface ServiceStatus {
  /** Whether service is initialized */
  isInitialized: boolean;
  /** Whether service is healthy */
  isHealthy: boolean;
  /** Current network */
  network: NetworkConfig;
  /** Performance metrics */
  performance: PerformanceMetrics;
  /** Cache status */
  cache: {
    enabled: boolean;
    size: number;
    hitRate: number;
  };
}
