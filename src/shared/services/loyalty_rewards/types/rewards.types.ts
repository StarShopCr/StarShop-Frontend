/**
 * Reward item types
 */
export type RewardType =
  'DISCOUNT_VOUCHER' | 'PERCENTAGE_OFF' | 'FREE_SHIPPING' | 'PHYSICAL_ITEM';

/**
 * Reward catalog item
 */
export interface RewardItem {
  id: string;
  title: string;
  description: string;
  type: RewardType;
  /** Points required to redeem */
  pointsCost: number;
  /** Value depending on type (e.g. 15 for 15% off, or 10 for $10 off) */
  value: number;
  /** Maximum discount cap in USD/XLM */
  maxDiscount?: number;
  /** Minimum purchase amount required to use */
  minPurchaseAmount?: number;
  /** Available inventory stock (-1 for infinite) */
  stock: number;
  /** Whether the reward is currently active */
  isActive: boolean;
}

/**
 * Result of redeeming a reward
 */
export interface RedeemResult {
  redemptionId: string;
  rewardId: string;
  user: string;
  pointsDeducted: number;
  remainingPoints: number;
  discountApplied: number;
  voucherCode: string;
  timestamp: number;
}

/**
 * Milestone achievement criteria and rewards
 */
export interface MilestoneConfig {
  id: string;
  title: string;
  description: string;
  /** Condition metric: e.g. 'PURCHASES_COUNT' | 'LIFETIME_POINTS' | 'DAYS_ACTIVE' */
  metric: 'PURCHASES_COUNT' | 'LIFETIME_POINTS' | 'DAYS_ACTIVE';
  threshold: number;
  bonusPoints: number;
  isActive: boolean;
}
