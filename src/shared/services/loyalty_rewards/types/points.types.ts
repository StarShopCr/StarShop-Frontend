import type { Address, u32, u64, i128, UserLevel } from './loyalty.types';

export interface PointsBalance {
  user: Address;
  currentPoints: i128;
  lifetimePoints: i128;
  pendingPoints: i128;
  expiringPoints: i128;
  expiryDate?: u64;
}

export interface PointsTransaction {
  id: string;
  user: Address;
  amount: i128;
  type: PointsTransactionType;
  description: string;
  productId?: string;
  category?: string;
  timestamp: u64;
  expiresAt?: u64;
}

export enum PointsTransactionType {
  Purchase = 'Purchase',
  Redemption = 'Redemption',
  Bonus = 'Bonus',
  Anniversary = 'Anniversary',
  Referral = 'Referral',
  AdminAdjustment = 'AdminAdjustment',
  Expiration = 'Expiration',
}

export interface PointsConfig {
  ratio: u32;
  expiryDays: u32;
  maxRedemptionPercentage: u32;
  bonusMultipliers: Record<UserLevel, number>;
}

export interface PurchasePointsRequest {
  user: Address;
  amount: i128;
  productId?: string;
  category?: string;
}

export interface AddPointsRequest {
  user: Address;
  amount: i128;
  description: string;
}
