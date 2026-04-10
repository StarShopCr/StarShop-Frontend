import type { Address, u32, u64, i128 } from './loyalty.types';

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: i128;
  type: RewardType;
  discountPercentage?: u32;
  maxDiscountAmount?: i128;
  isActive: boolean;
  stock?: u32;
  expiresAt?: u64;
  createdAt: u64;
  minLevel?: string;
}

export enum RewardType {
  Discount = 'Discount',
  FreeShipping = 'FreeShipping',
  FreeProduct = 'FreeProduct',
  CashBack = 'CashBack',
  ExclusiveAccess = 'ExclusiveAccess',
  PointsMultiplier = 'PointsMultiplier',
}

export interface RewardRedemption {
  id: string;
  user: Address;
  rewardId: string;
  pointsSpent: i128;
  discountApplied?: i128;
  purchaseAmount?: i128;
  timestamp: u64;
}

export interface CreateRewardRequest {
  name: string;
  description: string;
  pointsCost: i128;
  type: RewardType;
  discountPercentage?: u32;
  maxDiscountAmount?: i128;
  stock?: u32;
  expiresAt?: u64;
  minLevel?: string;
}

export interface RedeemRewardRequest {
  user: Address;
  rewardId: string;
  purchaseAmount?: i128;
}

export interface DiscountCalculation {
  rewardId: string;
  purchaseAmount: i128;
  discountAmount: i128;
  finalAmount: i128;
  pointsCost: i128;
}

export interface LevelRequirements {
  level: string;
  minLifetimePoints: i128;
  minPurchaseCount?: u32;
  benefits: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetPoints?: i128;
  targetPurchases?: u32;
  bonusPoints: i128;
  isActive: boolean;
  createdAt: u64;
}

export interface MilestoneCompletion {
  user: Address;
  milestoneId: string;
  completedAt: u64;
  bonusAwarded: i128;
}

export interface UserLoyaltyData {
  user: Address;
  currentPoints: i128;
  lifetimePoints: i128;
  level: string;
  registeredAt: u64;
  lastActivityAt: u64;
  purchaseCount: u32;
  completedMilestones: string[];
  redeemedRewards: string[];
}
