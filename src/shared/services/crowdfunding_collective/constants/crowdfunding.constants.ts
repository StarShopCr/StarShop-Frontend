import type { u32, u64, i128 } from '../types/crowdfunding.types';

/**
 * Error codes for the Crowdfunding Collective Contract
 */
export const CROWDFUNDING_ERROR_CODES = {
  // Contract initialization errors
  ALREADY_INITIALIZED: 1,
  CONTRACT_NOT_INITIALIZED: 2,
  UNAUTHORIZED: 3,
  INVALID_ADMIN: 4,

  // Campaign errors
  CAMPAIGN_NOT_FOUND: 101,
  CAMPAIGN_ALREADY_EXISTS: 102,
  INVALID_CAMPAIGN_CONFIG: 103,
  CAMPAIGN_NOT_ACTIVE: 104,
  CAMPAIGN_ALREADY_COMPLETED: 105,
  CAMPAIGN_ALREADY_CANCELLED: 106,
  INVALID_CAMPAIGN_STATUS: 107,
  CAMPAIGN_DEADLINE_PASSED: 108,
  CAMPAIGN_GOAL_ALREADY_REACHED: 109,

  // Contribution errors
  INVALID_CONTRIBUTION_AMOUNT: 201,
  CONTRIBUTION_TOO_SMALL: 202,
  CONTRIBUTION_TOO_LARGE: 203,
  CONTRIBUTION_EXCEEDS_LIMIT: 204,
  CONTRIBUTION_ALREADY_REFUNDED: 205,
  INVALID_CONTRIBUTOR: 206,
  CONTRIBUTION_NOT_FOUND: 207,

  // Reward errors
  REWARD_TIER_NOT_FOUND: 301,
  REWARD_ALREADY_CLAIMED: 302,
  REWARD_NOT_AVAILABLE: 303,
  INVALID_REWARD_TIER: 304,
  REWARD_QUANTITY_EXCEEDED: 305,
  INVALID_DELIVERY_ADDRESS: 306,

  // Milestone errors
  MILESTONE_NOT_FOUND: 401,
  MILESTONE_ALREADY_ACHIEVED: 402,
  INVALID_MILESTONE_ORDER: 403,
  MILESTONE_TARGET_NOT_MET: 404,

  // Fund distribution errors
  INSUFFICIENT_FUNDS: 501,
  INVALID_DISTRIBUTION_AMOUNT: 502,
  DISTRIBUTION_NOT_ALLOWED: 503,
  INVALID_RECIPIENT: 504,

  // Refund errors
  REFUND_NOT_ALLOWED: 601,
  INVALID_REFUND_AMOUNT: 602,
  REFUND_ALREADY_PROCESSED: 603,

  // Validation errors
  INVALID_ADDRESS: 701,
  INVALID_AMOUNT: 702,
  INVALID_TIMESTAMP: 703,
  INVALID_STRING_LENGTH: 704,
  INVALID_CATEGORY: 705,
  INVALID_IMAGE_URL: 706,
  INVALID_EXTERNAL_URL: 707,

  // System errors
  CONTRACT_UPGRADE_FAILED: 801,
  STORAGE_OVERFLOW: 802,
  INSUFFICIENT_GAS: 803,
  TRANSACTION_FAILED: 804,
  NETWORK_ERROR: 805,
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [CROWDFUNDING_ERROR_CODES.ALREADY_INITIALIZED]: 'Contract has already been initialized',
  [CROWDFUNDING_ERROR_CODES.CONTRACT_NOT_INITIALIZED]: 'Contract not initialized',
  [CROWDFUNDING_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access - admin privileges required',
  [CROWDFUNDING_ERROR_CODES.INVALID_ADMIN]: 'Invalid admin address',

  [CROWDFUNDING_ERROR_CODES.CAMPAIGN_NOT_FOUND]: 'Campaign not found',
  [CROWDFUNDING_ERROR_CODES.CAMPAIGN_ALREADY_EXISTS]: 'Campaign already exists',
  [CROWDFUNDING_ERROR_CODES.INVALID_CAMPAIGN_CONFIG]: 'Invalid campaign configuration',
  [CROWDFUNDING_ERROR_CODES.CAMPAIGN_NOT_ACTIVE]: 'Campaign is not active',
  [CROWDFUNDING_ERROR_CODES.CAMPAIGN_ALREADY_COMPLETED]: 'Campaign already completed',
  [CROWDFUNDING_ERROR_CODES.CAMPAIGN_ALREADY_CANCELLED]: 'Campaign already cancelled',
  [CROWDFUNDING_ERROR_CODES.INVALID_CAMPAIGN_STATUS]: 'Invalid campaign status',
  [CROWDFUNDING_ERROR_CODES.CAMPAIGN_DEADLINE_PASSED]: 'Campaign deadline has passed',
  [CROWDFUNDING_ERROR_CODES.CAMPAIGN_GOAL_ALREADY_REACHED]: 'Campaign goal already reached',

  [CROWDFUNDING_ERROR_CODES.INVALID_CONTRIBUTION_AMOUNT]: 'Invalid contribution amount',
  [CROWDFUNDING_ERROR_CODES.CONTRIBUTION_TOO_SMALL]: 'Contribution amount too small',
  [CROWDFUNDING_ERROR_CODES.CONTRIBUTION_TOO_LARGE]: 'Contribution amount too large',
  [CROWDFUNDING_ERROR_CODES.CONTRIBUTION_EXCEEDS_LIMIT]: 'Contribution exceeds maximum limit',
  [CROWDFUNDING_ERROR_CODES.CONTRIBUTION_ALREADY_REFUNDED]: 'Contribution already refunded',
  [CROWDFUNDING_ERROR_CODES.INVALID_CONTRIBUTOR]: 'Invalid contributor address',
  [CROWDFUNDING_ERROR_CODES.CONTRIBUTION_NOT_FOUND]: 'Contribution not found',

  [CROWDFUNDING_ERROR_CODES.REWARD_TIER_NOT_FOUND]: 'Reward tier not found',
  [CROWDFUNDING_ERROR_CODES.REWARD_ALREADY_CLAIMED]: 'Reward already claimed',
  [CROWDFUNDING_ERROR_CODES.REWARD_NOT_AVAILABLE]: 'Reward not available',
  [CROWDFUNDING_ERROR_CODES.INVALID_REWARD_TIER]: 'Invalid reward tier',
  [CROWDFUNDING_ERROR_CODES.REWARD_QUANTITY_EXCEEDED]: 'Reward quantity exceeded',
  [CROWDFUNDING_ERROR_CODES.INVALID_DELIVERY_ADDRESS]: 'Invalid delivery address',

  [CROWDFUNDING_ERROR_CODES.MILESTONE_NOT_FOUND]: 'Milestone not found',
  [CROWDFUNDING_ERROR_CODES.MILESTONE_ALREADY_ACHIEVED]: 'Milestone already achieved',
  [CROWDFUNDING_ERROR_CODES.INVALID_MILESTONE_ORDER]: 'Invalid milestone order',
  [CROWDFUNDING_ERROR_CODES.MILESTONE_TARGET_NOT_MET]: 'Milestone target not met',

  [CROWDFUNDING_ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds for distribution',
  [CROWDFUNDING_ERROR_CODES.INVALID_DISTRIBUTION_AMOUNT]: 'Invalid distribution amount',
  [CROWDFUNDING_ERROR_CODES.DISTRIBUTION_NOT_ALLOWED]: 'Fund distribution not allowed',
  [CROWDFUNDING_ERROR_CODES.INVALID_RECIPIENT]: 'Invalid recipient address',

  [CROWDFUNDING_ERROR_CODES.REFUND_NOT_ALLOWED]: 'Refund not allowed',
  [CROWDFUNDING_ERROR_CODES.INVALID_REFUND_AMOUNT]: 'Invalid refund amount',
  [CROWDFUNDING_ERROR_CODES.REFUND_ALREADY_PROCESSED]: 'Refund already processed',

  [CROWDFUNDING_ERROR_CODES.INVALID_ADDRESS]: 'Invalid address format',
  [CROWDFUNDING_ERROR_CODES.INVALID_AMOUNT]: 'Invalid amount',
  [CROWDFUNDING_ERROR_CODES.INVALID_TIMESTAMP]: 'Invalid timestamp',
  [CROWDFUNDING_ERROR_CODES.INVALID_STRING_LENGTH]: 'Invalid string length',
  [CROWDFUNDING_ERROR_CODES.INVALID_CATEGORY]: 'Invalid category',
  [CROWDFUNDING_ERROR_CODES.INVALID_IMAGE_URL]: 'Invalid image URL',
  [CROWDFUNDING_ERROR_CODES.INVALID_EXTERNAL_URL]: 'Invalid external URL',

  [CROWDFUNDING_ERROR_CODES.CONTRACT_UPGRADE_FAILED]: 'Contract upgrade failed',
  [CROWDFUNDING_ERROR_CODES.STORAGE_OVERFLOW]: 'Storage overflow',
  [CROWDFUNDING_ERROR_CODES.INSUFFICIENT_GAS]: 'Insufficient gas',
  [CROWDFUNDING_ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed',
  [CROWDFUNDING_ERROR_CODES.NETWORK_ERROR]: 'Network error',
} as const;

/**
 * Network configurations
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CROWDFUNDING_TESTNET_CONTRACT_ID', // To be set when deployed
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true,
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    contractId: '', // To be set when deployed to mainnet
    rpcUrl: 'https://soroban-mainnet.stellar.org',
    isTestnet: false,
  },
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  /** Default transaction timeout in seconds */
  TIMEOUT_SECONDS: 30,
  /** Default transaction fee in stroops */
  FEE: 100000,
  /** Default simulation enabled */
  SIMULATE: true,
  /** Default retry configuration */
  RETRY: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  /** Default cache configuration */
  CACHE: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000,
  },
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Maximum campaign title length */
  MAX_TITLE_LENGTH: 200,
  /** Maximum campaign description length */
  MAX_DESCRIPTION_LENGTH: 2000,
  /** Maximum category length */
  MAX_CATEGORY_LENGTH: 50,
  /** Maximum image URL length */
  MAX_IMAGE_URL_LENGTH: 500,
  /** Maximum external URL length */
  MAX_EXTERNAL_URL_LENGTH: 500,
  /** Maximum reward description length */
  MAX_REWARD_DESCRIPTION_LENGTH: 500,
  /** Maximum milestone description length */
  MAX_MILESTONE_DESCRIPTION_LENGTH: 500,
  /** Maximum reason length */
  MAX_REASON_LENGTH: 200,
  /** Minimum campaign target amount */
  MIN_TARGET_AMOUNT: 1000000, // 1 XLM (7 decimals)
  /** Maximum campaign target amount */
  MAX_TARGET_AMOUNT: 100000000000000, // 10M XLM (7 decimals)
  /** Minimum contribution amount */
  MIN_CONTRIBUTION_AMOUNT: 100000, // 0.1 XLM (7 decimals)
  /** Maximum contribution amount */
  MAX_CONTRIBUTION_AMOUNT: 10000000000000, // 1M XLM (7 decimals)
  /** Minimum campaign duration in seconds */
  MIN_CAMPAIGN_DURATION: 86400, // 1 day
  /** Maximum campaign duration in seconds */
  MAX_CAMPAIGN_DURATION: 31536000, // 1 year
  /** Maximum number of reward tiers per campaign */
  MAX_REWARD_TIERS: 10,
  /** Maximum number of milestones per campaign */
  MAX_MILESTONES: 20,
  /** Maximum reward quantity */
  MAX_REWARD_QUANTITY: 10000,
  /** Maximum batch size for operations */
  MAX_BATCH_SIZE: 100,
  /** Maximum number of contributions per campaign */
  MAX_CONTRIBUTIONS_PER_CAMPAIGN: 100000,
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  /** Campaign cache key */
  CAMPAIGN: (campaignId: u32) => `crowdfunding:campaign:${campaignId}`,
  /** Campaign list cache key */
  CAMPAIGN_LIST: (filter?: string) => filter ? `crowdfunding:campaigns:${filter}` : 'crowdfunding:campaigns:all',
  /** Contribution cache key */
  CONTRIBUTION: (contributionId: u32) => `crowdfunding:contribution:${contributionId}`,
  /** Contribution list cache key */
  CONTRIBUTION_LIST: (campaignId: u32) => `crowdfunding:contributions:${campaignId}`,
  /** Reward tier cache key */
  REWARD_TIER: (campaignId: u32, tierId: u32) => `crowdfunding:reward_tier:${campaignId}:${tierId}`,
  /** Reward tiers cache key */
  REWARD_TIERS: (campaignId: u32) => `crowdfunding:reward_tiers:${campaignId}`,
  /** Milestone cache key */
  MILESTONE: (campaignId: u32, milestoneId: u32) => `crowdfunding:milestone:${campaignId}:${milestoneId}`,
  /** Milestones cache key */
  MILESTONES: (campaignId: u32) => `crowdfunding:milestones:${campaignId}`,
  /** Admin cache key */
  ADMIN: 'crowdfunding:admin',
  /** Contract initialization cache key */
  INITIALIZED: 'crowdfunding:initialized',
  /** Campaign stats cache key */
  CAMPAIGN_STATS: 'crowdfunding:campaign_stats',
  /** Contributor stats cache key */
  CONTRIBUTOR_STATS: (contributor: string) => `crowdfunding:contributor_stats:${contributor}`,
} as const;

/**
 * Common error types
 */
export const ERROR_TYPES = {
  /** Network/connection errors */
  NETWORK_ERROR: 'network_error',
  /** Contract/transaction errors */
  CONTRACT_ERROR: 'contract_error',
  /** Validation errors */
  VALIDATION_ERROR: 'validation_error',
  /** Wallet errors */
  WALLET_ERROR: 'wallet_error',
  /** Campaign errors */
  CAMPAIGN_ERROR: 'campaign_error',
  /** Contribution errors */
  CONTRIBUTION_ERROR: 'contribution_error',
  /** Reward errors */
  REWARD_ERROR: 'reward_error',
  /** Milestone errors */
  MILESTONE_ERROR: 'milestone_error',
  /** Fund distribution errors */
  DISTRIBUTION_ERROR: 'distribution_error',
  /** Refund errors */
  REFUND_ERROR: 'refund_error',
  /** Unknown errors */
  UNKNOWN_ERROR: 'unknown_error',
} as const;

/**
 * API endpoints for external services
 */
export const API_ENDPOINTS = {
  /** Stellar Horizon API */
  HORIZON_TESTNET: 'https://horizon-testnet.stellar.org',
  HORIZON_MAINNET: 'https://horizon.stellar.org',
  /** Soroban RPC */
  SOROBAN_TESTNET: 'https://soroban-testnet.stellar.org',
  SOROBAN_MAINNET: 'https://soroban-mainnet.stellar.org',
} as const;

/**
 * Wallet provider IDs
 */
export const WALLET_PROVIDERS = {
  FREIGHTER: 'freighter',
  RABET: 'rabet',
  XBULL: 'xbull',
  LOBSTR: 'lobstr',
} as const;

/**
 * Crowdfunding contract method names
 */
export const CONTRACT_METHODS = {
  // Contract initialization & admin management
  INITIALIZE: 'initialize',
  GET_ADMIN: 'get_admin',
  SET_ADMIN: 'set_admin',
  IS_INITIALIZED: 'is_initialized',

  // Campaign management
  CREATE_CAMPAIGN: 'create_campaign',
  GET_CAMPAIGN: 'get_campaign',
  GET_CAMPAIGN_STATUS: 'get_campaign_status',
  UPDATE_CAMPAIGN: 'update_campaign',
  CANCEL_CAMPAIGN: 'cancel_campaign',
  COMPLETE_CAMPAIGN: 'complete_campaign',

  // Reward management
  GET_REWARD_TIERS: 'get_reward_tiers',
  ADD_REWARD_TIER: 'add_reward_tier',
  UPDATE_REWARD_TIER: 'update_reward_tier',
  REMOVE_REWARD_TIER: 'remove_reward_tier',
  CLAIM_REWARD: 'claim_reward',

  // Milestone management
  GET_MILESTONES: 'get_milestones',
  ADD_MILESTONE: 'add_milestone',
  UPDATE_MILESTONE: 'update_milestone',
  REMOVE_MILESTONE: 'remove_milestone',

  // Funding operations
  CONTRIBUTE: 'contribute',
  GET_CONTRIBUTIONS: 'get_contributions',
  DISTRIBUTE_FUNDS: 'distribute_funds',
  REFUND_CONTRIBUTORS: 'refund_contributors',

  // Statistics
  GET_CAMPAIGN_STATS: 'get_campaign_stats',
  GET_CONTRIBUTOR_STATS: 'get_contributor_stats',
} as const;

/**
 * Event names for crowdfunding contract
 */
export const CONTRACT_EVENTS = {
  CAMPAIGN_CREATED: 'CampaignCreated',
  CAMPAIGN_UPDATED: 'CampaignUpdated',
  CAMPAIGN_CANCELLED: 'CampaignCancelled',
  CAMPAIGN_COMPLETED: 'CampaignCompleted',
  CONTRIBUTION_MADE: 'ContributionMade',
  FUNDS_DISTRIBUTED: 'FundsDistributed',
  REFUND_PROCESSED: 'RefundProcessed',
  REWARD_CLAIMED: 'RewardClaimed',
  MILESTONE_ACHIEVED: 'MilestoneAchieved',
  ADMIN_CHANGED: 'AdminChanged',
  CONTRACT_INITIALIZED: 'ContractInitialized',
} as const;

/**
 * Campaign categories
 */
export const CAMPAIGN_CATEGORIES = {
  TECHNOLOGY: 'technology',
  ART: 'art',
  MUSIC: 'music',
  GAMING: 'gaming',
  SPORTS: 'sports',
  EDUCATION: 'education',
  HEALTH: 'health',
  ENVIRONMENT: 'environment',
  SOCIAL: 'social',
  BUSINESS: 'business',
  OTHER: 'other',
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Maximum response time in milliseconds */
  MAX_RESPONSE_TIME: 5000,
  /** Maximum cache size */
  MAX_CACHE_SIZE: 10000,
  /** Cache TTL in milliseconds */
  CACHE_TTL: 300000, // 5 minutes
  /** Maximum retry attempts */
  MAX_RETRY_ATTEMPTS: 5,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 1000,
  /** Batch operation timeout in milliseconds */
  BATCH_TIMEOUT: 30000,
} as const;

/**
 * Health check intervals
 */
export const HEALTH_CHECK_INTERVALS = {
  /** Contract health check interval in milliseconds */
  CONTRACT_CHECK: 30000, // 30 seconds
  /** Network health check interval in milliseconds */
  NETWORK_CHECK: 60000, // 1 minute
  /** Wallet health check interval in milliseconds */
  WALLET_CHECK: 15000, // 15 seconds
} as const;

/**
 * Default campaign values
 */
export const DEFAULT_CAMPAIGN = {
  TITLE: 'Untitled Campaign',
  DESCRIPTION: 'No description provided',
  CATEGORY: CAMPAIGN_CATEGORIES.OTHER,
  IMAGE_URL: '',
  EXTERNAL_URL: '',
  MIN_CONTRIBUTION: VALIDATION.MIN_CONTRIBUTION_AMOUNT,
  MAX_CONTRIBUTION: VALIDATION.MAX_CONTRIBUTION_AMOUNT,
} as const;

/**
 * Campaign validation rules
 */
export const CAMPAIGN_VALIDATION_RULES = {
  maxTitleLength: VALIDATION.MAX_TITLE_LENGTH,
  maxDescriptionLength: VALIDATION.MAX_DESCRIPTION_LENGTH,
  maxCategoryLength: VALIDATION.MAX_CATEGORY_LENGTH,
  maxImageUrlLength: VALIDATION.MAX_IMAGE_URL_LENGTH,
  maxExternalUrlLength: VALIDATION.MAX_EXTERNAL_URL_LENGTH,
  minTargetAmount: VALIDATION.MIN_TARGET_AMOUNT,
  maxTargetAmount: VALIDATION.MAX_TARGET_AMOUNT,
  minContributionAmount: VALIDATION.MIN_CONTRIBUTION_AMOUNT,
  maxContributionAmount: VALIDATION.MAX_CONTRIBUTION_AMOUNT,
  minCampaignDuration: VALIDATION.MIN_CAMPAIGN_DURATION,
  maxCampaignDuration: VALIDATION.MAX_CAMPAIGN_DURATION,
  maxRewardTiers: VALIDATION.MAX_REWARD_TIERS,
  maxMilestones: VALIDATION.MAX_MILESTONES,
  maxRewardQuantity: VALIDATION.MAX_REWARD_QUANTITY,
  requiredFields: ['title', 'description', 'targetAmount', 'deadline', 'creator'],
  allowedCategories: Object.values(CAMPAIGN_CATEGORIES),
} as const;

/**
 * Contribution validation rules
 */
export const CONTRIBUTION_VALIDATION_RULES = {
  minAmount: VALIDATION.MIN_CONTRIBUTION_AMOUNT,
  maxAmount: VALIDATION.MAX_CONTRIBUTION_AMOUNT,
  maxContributionsPerCampaign: VALIDATION.MAX_CONTRIBUTIONS_PER_CAMPAIGN,
  requiredFields: ['campaignId', 'contributor', 'amount'],
} as const;

/**
 * Reward tier validation rules
 */
export const REWARD_VALIDATION_RULES = {
  maxDescriptionLength: VALIDATION.MAX_REWARD_DESCRIPTION_LENGTH,
  maxQuantity: VALIDATION.MAX_REWARD_QUANTITY,
  maxTiersPerCampaign: VALIDATION.MAX_REWARD_TIERS,
  requiredFields: ['name', 'description', 'minContribution', 'reward'],
} as const;

/**
 * Milestone validation rules
 */
export const MILESTONE_VALIDATION_RULES = {
  maxDescriptionLength: VALIDATION.MAX_MILESTONE_DESCRIPTION_LENGTH,
  maxMilestonesPerCampaign: VALIDATION.MAX_MILESTONES,
  requiredFields: ['title', 'description', 'targetAmount', 'order'],
} as const;
