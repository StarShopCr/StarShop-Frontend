import { UserLevel } from '../types/loyalty.types';

export const NETWORKS = {
  testnet: {
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    rpcUrl: 'https://soroban.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
} as const;

export const DEFAULT_CONFIG = {
  cache: {
    enabled: true,
    defaultTtl: 60_000,
    maxEntries: 500,
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10_000,
  },
};

export const POINTS_CONFIG = {
  defaultRatio: 10,
  defaultExpiryDays: 365,
  defaultMaxRedemptionPercentage: 50,
  bonusMultipliers: {
    [UserLevel.Bronze]: 1.0,
    [UserLevel.Silver]: 1.25,
    [UserLevel.Gold]: 1.5,
    [UserLevel.Platinum]: 2.0,
    [UserLevel.Diamond]: 3.0,
  },
};

export const LEVEL_THRESHOLDS = {
  [UserLevel.Bronze]: BigInt(0),
  [UserLevel.Silver]: BigInt(1_000),
  [UserLevel.Gold]: BigInt(5_000),
  [UserLevel.Platinum]: BigInt(25_000),
  [UserLevel.Diamond]: BigInt(100_000),
};

export const CONTRACT_METHODS = {
  INITIALIZE: 'initialize',
  UPDATE_ADMIN: 'update_admin',
  SET_POINTS_EXPIRY: 'set_points_expiry',
  SET_MAX_REDEMPTION_PERCENTAGE: 'set_max_redemption_percentage',
  SET_POINTS_RATIO: 'set_points_ratio',
  REGISTER_USER: 'register_user',
  GET_POINTS_BALANCE: 'get_points_balance',
  GET_LIFETIME_POINTS: 'get_lifetime_points',
  RECORD_PURCHASE_POINTS: 'record_purchase_points',
  ADD_POINTS: 'add_points',
  INIT_LEVEL_REQUIREMENTS: 'init_level_requirements',
  CHECK_AND_UPDATE_LEVEL: 'check_and_update_level',
  GET_USER_LEVEL: 'get_user_level',
  AWARD_ANNIVERSARY_BONUS: 'award_anniversary_bonus',
  CREATE_MILESTONE: 'create_milestone',
  COMPLETE_MILESTONE: 'complete_milestone',
  CHECK_AND_COMPLETE_MILESTONES: 'check_and_complete_milestones',
  CREATE_REWARD: 'create_reward',
  REDEEM_REWARD: 'redeem_reward',
  GET_AVAILABLE_REWARDS: 'get_available_rewards',
  CALCULATE_DISCOUNT: 'calculate_discount',
} as const;

export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Loyalty service is not initialized',
  INVALID_ADDRESS: 'Invalid Stellar address provided',
  INVALID_AMOUNT: 'Amount must be greater than zero',
  INVALID_PERCENTAGE: 'Percentage must be between 0 and 100',
  INVALID_DAYS: 'Days must be greater than zero',
  INSUFFICIENT_POINTS: 'Insufficient points for redemption',
  REWARD_NOT_FOUND: 'Reward not found',
  REWARD_EXPIRED: 'Reward has expired',
  REWARD_OUT_OF_STOCK: 'Reward is out of stock',
  MILESTONE_NOT_FOUND: 'Milestone not found',
  USER_NOT_REGISTERED: 'User is not registered in loyalty program',
  USER_ALREADY_REGISTERED: 'User is already registered',
  ADMIN_ONLY: 'Only admin can perform this operation',
  CONTRACT_ERROR: 'Contract interaction failed',
  NETWORK_ERROR: 'Network connection failed',
} as const;

export const LOYALTY_ERROR_CODES = {
  NOT_INITIALIZED: 1001,
  INVALID_INPUT: 1002,
  INSUFFICIENT_POINTS: 1003,
  UNAUTHORIZED: 1004,
  NOT_FOUND: 1005,
  ALREADY_EXISTS: 1006,
  EXPIRED: 1007,
  OUT_OF_STOCK: 1008,
  CONTRACT_ERROR: 2001,
  NETWORK_ERROR: 2002,
  CACHE_ERROR: 3001,
} as const;

export const CACHE_KEYS = {
  POINTS_BALANCE: 'points_balance',
  USER_LEVEL: 'user_level',
  USER_DATA: 'user_data',
  AVAILABLE_REWARDS: 'available_rewards',
  MILESTONES: 'milestones',
} as const;
