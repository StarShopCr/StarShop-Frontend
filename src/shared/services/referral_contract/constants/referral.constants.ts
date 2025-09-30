import type { u32, i128 } from '../types/referral.types';
import { UserLevel } from '../types/referral.types';

/**
 * Error codes for the Referral Contract
 */
export const REFERRAL_ERROR_CODES = {
  NOT_INITIALIZED: 1,
  ALREADY_INITIALIZED: 2,
  UNAUTHORIZED: 3,
  ALREADY_REGISTERED: 4,
  USER_NOT_FOUND: 5,
  MILESTONE_NOT_FOUND: 6,
  INVALID_AMOUNT: 7,
  VERIFICATION_REQUIRED: 8,
  ALREADY_VERIFIED: 9,
  INVALID_IDENTITY_PROOF: 10,
  INSUFFICIENT_REWARDS: 11,
  INVALID_REWARD_RATES: 12,
  MAX_REWARD_EXCEEDED: 13,
  REFERRER_NOT_VERIFIED: 14,
  REFERRER_NOT_FOUND: 15,
  INVALID_LEVEL_REQUIREMENTS: 16,
  CONTRACT_PAUSED: 17,
  INVALID_REWARD_TOKEN: 18,
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [REFERRAL_ERROR_CODES.NOT_INITIALIZED]: 'Contract has not been initialized',
  [REFERRAL_ERROR_CODES.ALREADY_INITIALIZED]: 'Contract has already been initialized',
  [REFERRAL_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access - admin privileges required',
  [REFERRAL_ERROR_CODES.ALREADY_REGISTERED]: 'User is already registered',
  [REFERRAL_ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [REFERRAL_ERROR_CODES.MILESTONE_NOT_FOUND]: 'Milestone not found',
  [REFERRAL_ERROR_CODES.INVALID_AMOUNT]: 'Invalid amount provided',
  [REFERRAL_ERROR_CODES.VERIFICATION_REQUIRED]: 'User verification is required',
  [REFERRAL_ERROR_CODES.ALREADY_VERIFIED]: 'User is already verified',
  [REFERRAL_ERROR_CODES.INVALID_IDENTITY_PROOF]: 'Invalid identity proof provided',
  [REFERRAL_ERROR_CODES.INSUFFICIENT_REWARDS]: 'Insufficient rewards available',
  [REFERRAL_ERROR_CODES.INVALID_REWARD_RATES]: 'Invalid reward rates provided',
  [REFERRAL_ERROR_CODES.MAX_REWARD_EXCEEDED]: 'Maximum reward per referral exceeded',
  [REFERRAL_ERROR_CODES.REFERRER_NOT_VERIFIED]: 'Referrer is not verified',
  [REFERRAL_ERROR_CODES.REFERRER_NOT_FOUND]: 'Referrer not found',
  [REFERRAL_ERROR_CODES.INVALID_LEVEL_REQUIREMENTS]: 'Invalid level requirements provided',
  [REFERRAL_ERROR_CODES.CONTRACT_PAUSED]: 'Contract is currently paused',
  [REFERRAL_ERROR_CODES.INVALID_REWARD_TOKEN]: 'Invalid reward token address',
} as const;

/**
 * Network configurations
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CCHXSA6WFERL3VE4K4TEHFYOYIEFIP5CXWY6OGMKUHXBQG3HTRCMZRO6',
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
  /** Default monitoring configuration */
  MONITORING: {
    enabled: true,
    trackingInterval: 60000, // 1 minute
    errorReporting: true,
  },
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Maximum identity proof length */
  MAX_IDENTITY_PROOF_LENGTH: 1000,
  /** Maximum description length */
  MAX_DESCRIPTION_LENGTH: 500,
  /** Maximum milestone description length */
  MAX_MILESTONE_DESCRIPTION_LENGTH: 1000,
  /** Maximum batch size for operations */
  MAX_BATCH_SIZE: 100,
  /** Minimum reward amount */
  MIN_REWARD_AMOUNT: 1,
  /** Maximum reward amount */
  MAX_REWARD_AMOUNT: 1000000000000,
  /** Maximum direct referrals */
  MAX_DIRECT_REFERRALS: 10000,
  /** Maximum team size */
  MAX_TEAM_SIZE: 100000,
  /** Maximum level requirements */
  MAX_LEVEL_REQUIREMENTS: 1000,
  /** Maximum milestone requirements */
  MAX_MILESTONE_REQUIREMENTS: 1000,
  /** Maximum pending verifications */
  MAX_PENDING_VERIFICATIONS: 1000,
  /** Maximum referral tree depth */
  MAX_REFERRAL_TREE_DEPTH: 10,
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  /** Admin cache key */
  ADMIN: 'referral:admin',
  /** Contract paused state cache key */
  PAUSED_STATE: 'referral:paused_state',
  /** Total users cache key */
  TOTAL_USERS: 'referral:total_users',
  /** Total distributed rewards cache key */
  TOTAL_DISTRIBUTED_REWARDS: 'referral:total_distributed_rewards',
  /** Reward token cache key */
  REWARD_TOKEN: 'referral:reward_token',
  /** Reward rates cache key */
  REWARD_RATES: 'referral:reward_rates',
  /** Level requirements cache key */
  LEVEL_REQUIREMENTS: 'referral:level_requirements',
  /** User data cache key */
  USER_DATA: (user: string) => `referral:user:${user}`,
  /** User verification status cache key */
  USER_VERIFICATION: (user: string) => `referral:verification:${user}`,
  /** User referrals cache key */
  USER_REFERRALS: (user: string) => `referral:referrals:${user}`,
  /** User team size cache key */
  USER_TEAM_SIZE: (user: string) => `referral:team_size:${user}`,
  /** User level cache key */
  USER_LEVEL: (user: string) => `referral:level:${user}`,
  /** User rewards cache key */
  USER_REWARDS: (user: string) => `referral:rewards:${user}`,
  /** Milestone cache key */
  MILESTONE: (milestoneId: u32) => `referral:milestone:${milestoneId}`,
  /** Pending verifications cache key */
  PENDING_VERIFICATIONS: 'referral:pending_verifications',
  /** System metrics cache key */
  SYSTEM_METRICS: 'referral:system_metrics',
  /** Referral tree cache key */
  REFERRAL_TREE: (user: string) => `referral:tree:${user}`,
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
  /** User errors */
  USER_ERROR: 'user_error',
  /** Referral errors */
  REFERRAL_ERROR: 'referral_error',
  /** Reward errors */
  REWARD_ERROR: 'reward_error',
  /** Milestone errors */
  MILESTONE_ERROR: 'milestone_error',
  /** Verification errors */
  VERIFICATION_ERROR: 'verification_error',
  /** Authorization errors */
  AUTHORIZATION_ERROR: 'authorization_error',
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
 * Referral contract method names
 */
export const CONTRACT_METHODS = {
  INITIALIZE: 'initialize',
  GET_ADMIN: 'get_admin',
  TRANSFER_ADMIN: 'transfer_admin',
  PAUSE_CONTRACT: 'pause_contract',
  RESUME_CONTRACT: 'resume_contract',
  GET_PAUSED_STATE: 'get_paused_state',
  SET_REWARD_TOKEN: 'set_reward_token',
  SET_REWARD_RATES: 'set_reward_rates',
  SET_LEVEL_REQUIREMENTS: 'set_level_requirements',
  SUBMIT_VERIFICATION: 'submit_verification',
  APPROVE_VERIFICATION: 'approve_verification',
  REJECT_VERIFICATION: 'reject_verification',
  GET_VERIFICATION_STATUS: 'get_verification_status',
  GET_PENDING_VERIFICATIONS: 'get_pending_verifications',
  REGISTER_WITH_REFERRAL: 'register_with_referral',
  IS_USER_VERIFIED: 'is_user_verified',
  IS_USER_REGISTERED: 'is_user_registered',
  GET_USER_INFO: 'get_user_info',
  GET_DIRECT_REFERRALS: 'get_direct_referrals',
  GET_TEAM_SIZE: 'get_team_size',
  DISTRIBUTE_REWARDS: 'distribute_rewards',
  CLAIM_REWARDS: 'claim_rewards',
  GET_PENDING_REWARDS: 'get_pending_rewards',
  GET_TOTAL_REWARDS: 'get_total_rewards',
  ADD_MILESTONE: 'add_milestone',
  REMOVE_MILESTONE: 'remove_milestone',
  UPDATE_MILESTONE: 'update_milestone',
  CHECK_AND_REWARD_MILESTONE: 'check_and_reward_milestone',
  GET_TOTAL_USERS: 'get_total_users',
  GET_TOTAL_DISTRIBUTED_REWARDS: 'get_total_distributed_rewards',
  GET_SYSTEM_METRICS: 'get_system_metrics',
  GET_REFERRAL_CONVERSION_RATE: 'get_referral_conversion_rate',
  GET_USER_LEVEL: 'get_user_level',
} as const;

/**
 * Event names for Referral contract
 */
export const CONTRACT_EVENTS = {
  USER_REGISTERED: 'UserRegistered',
  USER_VERIFIED: 'UserVerified',
  USER_LEVEL_UPGRADED: 'UserLevelUpgraded',
  REWARD_DISTRIBUTED: 'RewardDistributed',
  REWARD_CLAIMED: 'RewardClaimed',
  MILESTONE_ACHIEVED: 'MilestoneAchieved',
  CONTRACT_PAUSED: 'ContractPaused',
  CONTRACT_RESUMED: 'ContractResumed',
  ADMIN_CHANGED: 'AdminChanged',
  REWARD_RATES_CHANGED: 'RewardRatesChanged',
  LEVEL_REQUIREMENTS_CHANGED: 'LevelRequirementsChanged',
  MILESTONE_ADDED: 'MilestoneAdded',
  MILESTONE_REMOVED: 'MilestoneRemoved',
  MILESTONE_UPDATED: 'MilestoneUpdated',
} as const;

/**
 * Default reward rates
 */
export const DEFAULT_REWARD_RATES = {
  level1: 10, // 10%
  level2: 5,  // 5%
  level3: 2,  // 2%
  max_reward_per_referral: 1000000000, // 1000 tokens
} as const;

/**
 * Default level requirements
 */
export const DEFAULT_LEVEL_REQUIREMENTS = {
  silver: {
    required_direct_referrals: 5,
    required_team_size: 10,
    required_total_rewards: 1000000000, // 1000 tokens
  },
  gold: {
    required_direct_referrals: 20,
    required_team_size: 50,
    required_total_rewards: 5000000000, // 5000 tokens
  },
  platinum: {
    required_direct_referrals: 50,
    required_team_size: 200,
    required_total_rewards: 20000000000, // 20000 tokens
  },
} as const;

/**
 * Default milestone templates
 */
export const DEFAULT_MILESTONE_TEMPLATES = {
  FIRST_REFERRAL: {
    name: 'First Referral',
    description: 'Refer your first user',
    requiredLevel: UserLevel.Basic,
    requirement: { tag: 'DirectReferrals', values: [1] },
    rewardAmount: 100000000, // 100 tokens
    category: 'referral',
    difficulty: 'easy',
  },
  REFERRAL_MILESTONE_5: {
    name: 'Referral Milestone - 5',
    description: 'Refer 5 users',
    requiredLevel: UserLevel.Basic,
    requirement: { tag: 'DirectReferrals', values: [5] },
    rewardAmount: 500000000, // 500 tokens
    category: 'referral',
    difficulty: 'medium',
  },
  REFERRAL_MILESTONE_10: {
    name: 'Referral Milestone - 10',
    description: 'Refer 10 users',
    requiredLevel: UserLevel.Silver,
    requirement: { tag: 'DirectReferrals', values: [10] },
    rewardAmount: 1000000000, // 1000 tokens
    category: 'referral',
    difficulty: 'medium',
  },
  TEAM_MILESTONE_50: {
    name: 'Team Milestone - 50',
    description: 'Build a team of 50 members',
    requiredLevel: UserLevel.Silver,
    requirement: { tag: 'TeamSize', values: [50] },
    rewardAmount: 2000000000, // 2000 tokens
    category: 'team_building',
    difficulty: 'hard',
  },
  REWARD_MILESTONE_1000: {
    name: 'Reward Milestone - 1000',
    description: 'Earn 1000 tokens in rewards',
    requiredLevel: UserLevel.Basic,
    requirement: { tag: 'TotalRewards', values: [1000000000] },
    rewardAmount: 500000000, // 500 tokens
    category: 'reward_accumulation',
    difficulty: 'medium',
  },
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
  /** Referral tree max depth */
  MAX_REFERRAL_TREE_DEPTH: 10,
  /** Max concurrent operations */
  MAX_CONCURRENT_OPERATIONS: 10,
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
  /** Cache health check interval in milliseconds */
  CACHE_CHECK: 120000, // 2 minutes
} as const;

/**
 * Default user settings
 */
export const DEFAULT_USER_SETTINGS = {
  /** Default display name */
  DISPLAY_NAME: 'Anonymous User',
  /** Default bio */
  BIO: 'Welcome to StarShop Referral Program!',
  /** Default language */
  LANGUAGE: 'en',
  /** Default timezone */
  TIMEZONE: 'UTC',
  /** Default theme */
  THEME: 'auto',
  /** Default notification preferences */
  NOTIFICATIONS: {
    email: true,
    push: true,
    referral: true,
    reward: true,
  },
} as const;

/**
 * Referral program limits
 */
export const REFERRAL_LIMITS = {
  /** Maximum referrals per user */
  MAX_REFERRALS_PER_USER: 1000,
  /** Maximum team size */
  MAX_TEAM_SIZE: 100000,
  /** Maximum referral tree depth */
  MAX_TREE_DEPTH: 10,
  /** Maximum pending verifications */
  MAX_PENDING_VERIFICATIONS: 1000,
  /** Maximum milestones per user */
  MAX_MILESTONES_PER_USER: 100,
  /** Maximum reward per referral */
  MAX_REWARD_PER_REFERRAL: 10000000000, // 10000 tokens
  /** Minimum reward amount */
  MIN_REWARD_AMOUNT: 1,
  /** Maximum reward amount */
  MAX_REWARD_AMOUNT: 1000000000000, // 1000000 tokens
} as const;

/**
 * Milestone categories
 */
export const MILESTONE_CATEGORIES = {
  REFERRAL: 'referral',
  TEAM_BUILDING: 'team_building',
  REWARD_ACCUMULATION: 'reward_accumulation',
  ACTIVITY: 'activity',
  ACHIEVEMENT: 'achievement',
  SPECIAL_EVENT: 'special_event',
  SEASONAL: 'seasonal',
  COMMUNITY: 'community',
} as const;

/**
 * Milestone difficulty levels
 */
export const MILESTONE_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
  LEGENDARY: 'legendary',
} as const;

/**
 * User level names
 */
export const USER_LEVEL_NAMES = {
  [UserLevel.Basic]: 'Basic',
  [UserLevel.Silver]: 'Silver',
  [UserLevel.Gold]: 'Gold',
  [UserLevel.Platinum]: 'Platinum',
} as const;

/**
 * User level colors
 */
export const USER_LEVEL_COLORS = {
  [UserLevel.Basic]: '#6B7280', // Gray
  [UserLevel.Silver]: '#9CA3AF', // Silver
  [UserLevel.Gold]: '#F59E0B', // Gold
  [UserLevel.Platinum]: '#8B5CF6', // Purple
} as const;

/**
 * Verification status names
 */
export const VERIFICATION_STATUS_NAMES = {
  Pending: 'Pending',
  Verified: 'Verified',
  Rejected: 'Rejected',
} as const;

/**
 * Verification status colors
 */
export const VERIFICATION_STATUS_COLORS = {
  Pending: '#F59E0B', // Yellow
  Verified: '#10B981', // Green
  Rejected: '#EF4444', // Red
} as const;

/**
 * Reward distribution levels
 */
export const REWARD_DISTRIBUTION_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
} as const;

/**
 * Default milestone requirements
 */
export const DEFAULT_MILESTONE_REQUIREMENTS = {
  DIRECT_REFERRALS: {
    min: 1,
    max: 1000,
    step: 1,
  },
  TEAM_SIZE: {
    min: 1,
    max: 100000,
    step: 1,
  },
  TOTAL_REWARDS: {
    min: 1,
    max: 1000000000000,
    step: 1000000,
  },
  ACTIVE_DAYS: {
    min: 1,
    max: 365,
    step: 1,
  },
} as const;

/**
 * Cache TTL values (in milliseconds)
 */
export const CACHE_TTL = {
  /** User data cache TTL */
  USER_DATA: 300000, // 5 minutes
  /** System metrics cache TTL */
  SYSTEM_METRICS: 60000, // 1 minute
  /** Referral tree cache TTL */
  REFERRAL_TREE: 600000, // 10 minutes
  /** Milestone data cache TTL */
  MILESTONE_DATA: 1800000, // 30 minutes
  /** Admin data cache TTL */
  ADMIN_DATA: 3600000, // 1 hour
  /** Contract state cache TTL */
  CONTRACT_STATE: 30000, // 30 seconds
} as const;

/**
 * Batch operation limits
 */
export const BATCH_LIMITS = {
  /** Maximum batch size for user operations */
  MAX_USER_BATCH_SIZE: 50,
  /** Maximum batch size for milestone operations */
  MAX_MILESTONE_BATCH_SIZE: 20,
  /** Maximum batch size for reward operations */
  MAX_REWARD_BATCH_SIZE: 100,
  /** Maximum batch size for verification operations */
  MAX_VERIFICATION_BATCH_SIZE: 30,
} as const;

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  /** Maximum requests per minute */
  REQUESTS_PER_MINUTE: 100,
  /** Maximum requests per hour */
  REQUESTS_PER_HOUR: 1000,
  /** Maximum requests per day */
  REQUESTS_PER_DAY: 10000,
  /** Burst limit */
  BURST_LIMIT: 20,
  /** Rate limit window in milliseconds */
  RATE_LIMIT_WINDOW: 60000, // 1 minute
} as const;
