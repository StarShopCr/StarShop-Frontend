export { LoyaltyService, LoyaltyError } from './loyalty.service';

export type {
  Address,
  LoyaltyServiceConfig,
  CacheConfig,
  RetryConfig,
  TransactionResult,
  NetworkConfig,
} from './types/loyalty.types';

export { UserLevel, LoyaltyEventType } from './types/loyalty.types';

export type {
  PointsBalance,
  PointsTransaction,
  PointsConfig,
  PurchasePointsRequest,
  AddPointsRequest,
} from './types/points.types';

export { PointsTransactionType } from './types/points.types';

export type {
  Reward,
  RewardRedemption,
  CreateRewardRequest,
  RedeemRewardRequest,
  DiscountCalculation,
  LevelRequirements,
  Milestone,
  MilestoneCompletion,
  UserLoyaltyData,
} from './types/rewards.types';

export { RewardType } from './types/rewards.types';

export {
  NETWORKS,
  POINTS_CONFIG,
  LEVEL_THRESHOLDS,
  CONTRACT_METHODS,
  ERROR_MESSAGES,
  LOYALTY_ERROR_CODES,
} from './constants/loyalty.constants';

export {
  validateAddress,
  validateAmount,
  calculateLevel,
  calculateLevelProgress,
  calculateDiscountAmount,
  formatPoints,
  generateUniqueId,
} from './utils/loyalty.utils';
