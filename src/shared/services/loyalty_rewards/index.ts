// Main service class
export { LoyaltyRewardsService } from './loyalty.service';
export type { LoyaltyRewardsServiceOptions } from './loyalty.service';

// Types
export type {
  LoyaltyLevelName,
  LoyaltyResponse,
  LoyaltyConfig,
  LevelConfig,
  UserLoyaltyProfile,
  LevelUpdateResult,
} from './types/loyalty.types';

export type {
  PointsTransactionType,
  PointsTransaction,
  PointsBalance,
  RecordPurchaseParams,
  PointsHistory,
} from './types/points.types';

export type {
  RewardType,
  RewardItem,
  RedeemResult,
  MilestoneConfig,
} from './types/rewards.types';

// Constants
export {
  LOYALTY_ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULT_LEVELS,
  REWARD_TYPES,
  TIME_CONSTANTS,
} from './constants/loyalty.constants';

// Utilities
export {
  isValidStellarAddress,
  generateTxHash,
  generateVoucherCode,
  calculateLevelForPoints,
  calculatePurchasePoints,
  calculateRewardDiscount,
  isAnniversaryEligible,
} from './utils/loyalty.utils';
