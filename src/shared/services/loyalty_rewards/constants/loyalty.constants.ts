import type { LevelConfig } from '../types/loyalty.types';
import type { RewardType } from '../types/rewards.types';

/**
 * Standard error codes for the loyalty rewards contract service
 */
export const LOYALTY_ERROR_CODES = {
  // Authorization & Initialization (100 - 199)
  UNAUTHORIZED: 100,
  NOT_INITIALIZED: 101,
  ALREADY_INITIALIZED: 102,
  INVALID_ADMIN: 103,
  INVALID_ADDRESS: 104,

  // User & Profile errors (200 - 299)
  USER_NOT_FOUND: 200,
  USER_ALREADY_REGISTERED: 201,
  INVALID_PARAMETERS: 202,
  ANNIVERSARY_NOT_REACHED: 203,
  ANNIVERSARY_ALREADY_CLAIMED: 204,

  // Points & Balance errors (300 - 399)
  INVALID_POINTS_AMOUNT: 300,
  INSUFFICIENT_POINTS: 301,
  POINTS_EXPIRED: 302,
  REDEMPTION_PERCENTAGE_EXCEEDED: 303,
  PURCHASE_AMOUNT_TOO_LOW: 304,

  // Levels & Milestones errors (400 - 499)
  INVALID_LEVEL_CONFIG: 400,
  LEVEL_NOT_FOUND: 401,
  MILESTONE_NOT_FOUND: 402,
  MILESTONE_ALREADY_COMPLETED: 403,
  MILESTONE_CONDITION_NOT_MET: 404,

  // Rewards catalog errors (500 - 599)
  REWARD_NOT_FOUND: 500,
  REWARD_INACTIVE: 501,
  REWARD_OUT_OF_STOCK: 502,
  INVALID_REWARD_CONFIG: 503,
} as const;

/**
 * User-facing error message mapping
 */
export const ERROR_MESSAGES: Record<number, string> = {
  [LOYALTY_ERROR_CODES.UNAUTHORIZED]:
    'Unauthorized: Admin privileges required.',
  [LOYALTY_ERROR_CODES.NOT_INITIALIZED]: 'Contract is not initialized.',
  [LOYALTY_ERROR_CODES.ALREADY_INITIALIZED]:
    'Contract has already been initialized.',
  [LOYALTY_ERROR_CODES.INVALID_ADMIN]: 'Invalid admin address provided.',
  [LOYALTY_ERROR_CODES.INVALID_ADDRESS]: 'Invalid Stellar address format.',

  [LOYALTY_ERROR_CODES.USER_NOT_FOUND]: 'User loyalty profile not found.',
  [LOYALTY_ERROR_CODES.USER_ALREADY_REGISTERED]:
    'User is already registered in the loyalty program.',
  [LOYALTY_ERROR_CODES.INVALID_PARAMETERS]: 'Invalid parameters provided.',
  [LOYALTY_ERROR_CODES.ANNIVERSARY_NOT_REACHED]:
    'Account has not reached the 1-year anniversary threshold.',
  [LOYALTY_ERROR_CODES.ANNIVERSARY_ALREADY_CLAIMED]:
    'Anniversary bonus already claimed for the current year.',

  [LOYALTY_ERROR_CODES.INVALID_POINTS_AMOUNT]:
    'Points amount must be greater than zero.',
  [LOYALTY_ERROR_CODES.INSUFFICIENT_POINTS]:
    'Insufficient available points balance.',
  [LOYALTY_ERROR_CODES.POINTS_EXPIRED]: 'Selected points have expired.',
  [LOYALTY_ERROR_CODES.REDEMPTION_PERCENTAGE_EXCEEDED]:
    'Redemption exceeds maximum allowed percentage for purchase.',
  [LOYALTY_ERROR_CODES.PURCHASE_AMOUNT_TOO_LOW]:
    'Purchase amount is below the required minimum for this reward.',

  [LOYALTY_ERROR_CODES.INVALID_LEVEL_CONFIG]:
    'Invalid tier level configuration requirements.',
  [LOYALTY_ERROR_CODES.LEVEL_NOT_FOUND]:
    'Specified loyalty tier level not found.',
  [LOYALTY_ERROR_CODES.MILESTONE_NOT_FOUND]: 'Milestone achievement not found.',
  [LOYALTY_ERROR_CODES.MILESTONE_ALREADY_COMPLETED]:
    'Milestone has already been completed by this user.',
  [LOYALTY_ERROR_CODES.MILESTONE_CONDITION_NOT_MET]:
    'User does not meet milestone completion threshold.',

  [LOYALTY_ERROR_CODES.REWARD_NOT_FOUND]: 'Reward not found in catalog.',
  [LOYALTY_ERROR_CODES.REWARD_INACTIVE]: 'Reward is currently inactive.',
  [LOYALTY_ERROR_CODES.REWARD_OUT_OF_STOCK]: 'Reward is out of stock.',
  [LOYALTY_ERROR_CODES.INVALID_REWARD_CONFIG]: 'Invalid reward configuration.',
};

/**
 * Default tier level requirements hierarchy
 */
export const DEFAULT_LEVELS: ReadonlyArray<LevelConfig> = [
  {
    level: 'Bronze',
    minPoints: 0,
    multiplier: 1.0,
    discountPercentage: 0,
    description: 'Starting tier for all new StarShop members',
  },
  {
    level: 'Silver',
    minPoints: 1000,
    multiplier: 1.15,
    discountPercentage: 5,
    description:
      'Silver tier: 15% points boost and 5% discount on select items',
  },
  {
    level: 'Gold',
    minPoints: 5000,
    multiplier: 1.3,
    discountPercentage: 10,
    description: 'Gold tier: 30% points boost and 10% discount on select items',
  },
  {
    level: 'Platinum',
    minPoints: 15000,
    multiplier: 1.5,
    discountPercentage: 15,
    description: 'Platinum tier: 50% points boost, 15% discount, and VIP perks',
  },
];

/**
 * Reward catalog category types
 */
export const REWARD_TYPES: Record<RewardType, RewardType> = {
  DISCOUNT_VOUCHER: 'DISCOUNT_VOUCHER',
  PERCENTAGE_OFF: 'PERCENTAGE_OFF',
  FREE_SHIPPING: 'FREE_SHIPPING',
  PHYSICAL_ITEM: 'PHYSICAL_ITEM',
} as const;

/**
 * Time and calculation constants
 */
export const TIME_CONSTANTS = {
  SECONDS_IN_DAY: 86400,
  DAYS_IN_YEAR: 365,
  ANNIVERSARY_BONUS_POINTS: 500,
  DEFAULT_POINTS_RATIO: 10, // 10 points per 1 USD
  DEFAULT_MAX_REDEMPTION_PCT: 50, // 50% maximum purchase deduction
  DEFAULT_EXPIRY_DAYS: 365, // 1 year points expiration
} as const;
