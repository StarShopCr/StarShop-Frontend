export type Address = string;
export type u32 = number;
export type u64 = number;
export type i128 = bigint;

export enum UserLevel {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond',
}

export enum LoyaltyEventType {
  PointsEarned = 'PointsEarned',
  PointsRedeemed = 'PointsRedeemed',
  LevelUp = 'LevelUp',
  MilestoneCompleted = 'MilestoneCompleted',
  RewardCreated = 'RewardCreated',
  RewardRedeemed = 'RewardRedeemed',
  UserRegistered = 'UserRegistered',
  AdminUpdated = 'AdminUpdated',
}

export interface LoyaltyServiceConfig {
  contractAddress: Address;
  networkPassphrase: string;
  rpcUrl: string;
  adminAddress?: Address;
  cache?: CacheConfig;
  retry?: RetryConfig;
}

export interface CacheConfig {
  enabled: boolean;
  defaultTtl: number;
  maxEntries: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  timestamp: number;
}

export interface NetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contractAddress: Address;
}
