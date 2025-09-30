import type { u32, u64, i128 } from '@stellar/stellar-sdk';

/**
 * Crowdfunding campaign configuration
 */
export interface CampaignConfig {
  /** Campaign title */
  title: string;
  /** Campaign description */
  description: string;
  /** Target funding amount */
  targetAmount: i128;
  /** Campaign deadline timestamp */
  deadline: u64;
  /** Minimum contribution amount */
  minContribution: i128;
  /** Maximum contribution amount */
  maxContribution: i128;
  /** Campaign creator address */
  creator: string;
  /** Campaign category */
  category: string;
  /** Campaign image URL */
  imageUrl?: string;
  /** Campaign external URL */
  externalUrl?: string;
}

/**
 * Reward tier configuration
 */
export interface RewardTier {
  /** Tier ID */
  id: u32;
  /** Tier name */
  name: string;
  /** Tier description */
  description: string;
  /** Minimum contribution required for this tier */
  minContribution: i128;
  /** Maximum contribution for this tier */
  maxContribution?: i128;
  /** Reward details */
  reward: string;
  /** Number of rewards available */
  quantity: u32;
  /** Whether this tier is limited */
  isLimited: boolean;
  /** Delivery date for rewards */
  deliveryDate?: u64;
}

/**
 * Campaign milestone
 */
export interface Milestone {
  /** Milestone ID */
  id: u32;
  /** Milestone title */
  title: string;
  /** Milestone description */
  description: string;
  /** Target amount for this milestone */
  targetAmount: i128;
  /** Whether milestone is achieved */
  isAchieved: boolean;
  /** Achievement date */
  achievedAt?: u64;
  /** Milestone order */
  order: u32;
}

/**
 * User contribution to a campaign
 */
export interface Contribution {
  /** Contribution ID */
  id: u32;
  /** Contributor address */
  contributor: string;
  /** Contribution amount */
  amount: i128;
  /** Contribution timestamp */
  timestamp: u64;
  /** Campaign ID */
  campaignId: u32;
  /** Reward tier claimed */
  rewardTierId?: u32;
  /** Whether contribution is refunded */
  isRefunded: boolean;
}

/**
 * Campaign status enumeration
 */
export enum CampaignStatus {
  ACTIVE = 'active',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

/**
 * Campaign information
 */
export interface Campaign {
  /** Campaign ID */
  id: u32;
  /** Campaign configuration */
  config: CampaignConfig;
  /** Current status */
  status: CampaignStatus;
  /** Total amount raised */
  totalRaised: i128;
  /** Number of contributors */
  contributorCount: u32;
  /** Creation timestamp */
  createdAt: u64;
  /** Last update timestamp */
  updatedAt: u64;
  /** Whether campaign is active */
  isActive: boolean;
  /** Whether campaign reached its goal */
  isGoalReached: boolean;
  /** Campaign completion percentage */
  completionPercentage: number;
}

/**
 * Campaign creation request
 */
export interface CreateCampaignRequest {
  /** Campaign configuration */
  config: CampaignConfig;
  /** Reward tiers */
  rewardTiers: RewardTier[];
  /** Campaign milestones */
  milestones: Milestone[];
  /** Admin address (required for creation) */
  admin: string;
}

/**
 * Contribution request
 */
export interface ContributionRequest {
  /** Campaign ID */
  campaignId: u32;
  /** Contributor address */
  contributor: string;
  /** Contribution amount */
  amount: i128;
  /** Selected reward tier ID (optional) */
  rewardTierId?: u32;
}

/**
 * Fund distribution request
 */
export interface DistributeFundsRequest {
  /** Campaign ID */
  campaignId: u32;
  /** Admin address */
  admin: string;
  /** Distribution amount */
  amount: i128;
  /** Recipient address */
  recipient: string;
  /** Distribution reason */
  reason: string;
}

/**
 * Refund request
 */
export interface RefundRequest {
  /** Campaign ID */
  campaignId: u32;
  /** Admin address */
  admin: string;
  /** Contributor address to refund */
  contributor: string;
  /** Refund amount */
  amount: i128;
  /** Refund reason */
  reason: string;
}

/**
 * Reward claim request
 */
export interface ClaimRewardRequest {
  /** Campaign ID */
  campaignId: u32;
  /** Contributor address */
  contributor: string;
  /** Reward tier ID */
  rewardTierId: u32;
  /** Delivery address */
  deliveryAddress: string;
}

/**
 * Milestone update request
 */
export interface UpdateMilestoneRequest {
  /** Campaign ID */
  campaignId: u32;
  /** Milestone ID */
  milestoneId: u32;
  /** Admin address */
  admin: string;
  /** New milestone status */
  isAchieved: boolean;
  /** Achievement timestamp */
  achievedAt?: u64;
}

/**
 * Standardized response wrapper for all service operations
 */
export interface CrowdfundingResponse<T = any> {
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
export interface CrowdfundingServiceConfig {
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
 * Type-safe campaign ID
 */
export type CampaignId = u32;

/**
 * Type-safe address type
 */
export type Address = string;

/**
 * Campaign statistics
 */
export interface CampaignStats {
  /** Total campaigns created */
  totalCampaigns: u32;
  /** Active campaigns */
  activeCampaigns: u32;
  /** Successful campaigns */
  successfulCampaigns: u32;
  /** Failed campaigns */
  failedCampaigns: u32;
  /** Total amount raised across all campaigns */
  totalAmountRaised: i128;
  /** Average campaign duration in seconds */
  averageDuration: u64;
  /** Success rate percentage */
  successRate: number;
}

/**
 * Contributor statistics
 */
export interface ContributorStats {
  /** Total contributions made */
  totalContributions: u32;
  /** Total amount contributed */
  totalAmountContributed: i128;
  /** Average contribution amount */
  averageContribution: i128;
  /** Number of campaigns contributed to */
  campaignsContributed: u32;
  /** Total rewards claimed */
  rewardsClaimed: u32;
}

/**
 * Campaign filter options for querying campaigns
 */
export interface CampaignFilter {
  /** Filter by status */
  status?: CampaignStatus;
  /** Filter by creator */
  creator?: Address;
  /** Filter by category */
  category?: string;
  /** Filter by minimum target amount */
  minTargetAmount?: i128;
  /** Filter by maximum target amount */
  maxTargetAmount?: i128;
  /** Filter by active status */
  isActive?: boolean;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Campaign search result
 */
export interface CampaignSearchResult {
  /** Campaign ID */
  campaignId: CampaignId;
  /** Campaign details */
  campaign: Campaign;
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
  /** Filter by campaign ID */
  campaignId?: CampaignId;
  /** Filter by contributor */
  contributor?: Address;
  /** Filter by admin */
  admin?: Address;
}

/**
 * Crowdfunding service event types
 */
export enum CrowdfundingEventType {
  CAMPAIGN_CREATED = 'campaign_created',
  CAMPAIGN_UPDATED = 'campaign_updated',
  CAMPAIGN_CANCELLED = 'campaign_cancelled',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  CONTRIBUTION_MADE = 'contribution_made',
  FUNDS_DISTRIBUTED = 'funds_distributed',
  REFUND_PROCESSED = 'refund_processed',
  REWARD_CLAIMED = 'reward_claimed',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  ADMIN_CHANGED = 'admin_changed',
  CONTRACT_INITIALIZED = 'contract_initialized',
  ERROR = 'error',
}

/**
 * Crowdfunding service event data
 */
export interface CrowdfundingEventData {
  /** Event type */
  type: CrowdfundingEventType;
  /** Event timestamp */
  timestamp: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** Campaign ID if applicable */
  campaignId?: CampaignId;
  /** Contributor address if applicable */
  contributor?: Address;
  /** Admin address if applicable */
  admin?: Address;
  /** Error message if applicable */
  error?: string;
  /** Campaign data if applicable */
  campaign?: Campaign;
  /** Contribution data if applicable */
  contribution?: Contribution;
  /** Milestone data if applicable */
  milestone?: Milestone;
  /** Amount if applicable */
  amount?: i128;
}

/**
 * Event listener function type
 */
export type CrowdfundingEventListener = (event: CrowdfundingEventData) => void;

/**
 * Event subscription
 */
export interface EventSubscription {
  /** Subscription ID */
  id: string;
  /** Event types to listen for */
  eventTypes: CrowdfundingEventType[];
  /** Event listener function */
  listener: CrowdfundingEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Event listener options */
  options?: EventListenerOptions;
}

/**
 * Campaign validation result
 */
export interface CampaignValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages */
  errors: string[];
}

/**
 * Contribution validation result
 */
export interface ContributionValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
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
