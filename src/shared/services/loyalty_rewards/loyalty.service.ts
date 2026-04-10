import type {
  Address,
  u32,
  i128,
  LoyaltyServiceConfig,
  CacheConfig,
  RetryConfig,
  CacheEntry,
  TransactionResult,
  LoyaltyEventType,
} from './types/loyalty.types';

import { UserLevel } from './types/loyalty.types';

import type {
  PointsBalance,
  PointsTransaction,
  PointsConfig,
  PurchasePointsRequest,
  AddPointsRequest,
} from './types/points.types';

import { PointsTransactionType } from './types/points.types';

import type {
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

import {
  DEFAULT_CONFIG,
  CONTRACT_METHODS,
  ERROR_MESSAGES,
  LOYALTY_ERROR_CODES,
  CACHE_KEYS,
  POINTS_CONFIG,
} from './constants/loyalty.constants';

import {
  validateAddress,
  validateAmount,
  validatePercentage,
  validateDays,
  calculateLevel,
  calculateLevelProgress,
  calculateDiscountAmount,
  formatPoints,
  generateUniqueId,
  isCacheValid,
  retryWithBackoff,
} from './utils/loyalty.utils';

/**
 * Loyalty Rewards Service for managing customer loyalty programs on Stellar/Soroban
 *
 * Provides a comprehensive interface for:
 * - Admin management and configuration
 * - Points earning, tracking, and expiration
 * - Level management and progression
 * - Milestone creation and completion
 * - Reward creation and redemption
 */
export class LoyaltyService {
  private config: LoyaltyServiceConfig;
  private cacheConfig: CacheConfig;
  private retryConfig: RetryConfig;
  private contractClient: any;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private isInitialized: boolean = false;

  constructor(config: LoyaltyServiceConfig) {
    this.config = config;
    this.cacheConfig = { ...DEFAULT_CONFIG.cache, ...config.cache };
    this.retryConfig = { ...DEFAULT_CONFIG.retry, ...config.retry };
  }

  // ─── Admin Management ────────────────────────────────────────────────

  /**
   * Initialize the loyalty contract with an admin address
   */
  async initializeLoyaltyContract(admin: Address): Promise<TransactionResult> {
    if (!validateAddress(admin)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.INITIALIZE, { admin });
    if (result.success) {
      this.isInitialized = true;
    }
    return result;
  }

  /**
   * Transfer admin rights to a new address
   */
  async updateAdmin(newAdmin: Address): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(newAdmin)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    return this.callContract(CONTRACT_METHODS.UPDATE_ADMIN, { new_admin: newAdmin });
  }

  /**
   * Set points expiration period in days
   */
  async setPointsExpiry(days: u32): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateDays(days)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_DAYS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    return this.callContract(CONTRACT_METHODS.SET_POINTS_EXPIRY, { days });
  }

  /**
   * Set the maximum percentage of a purchase that can be paid with points
   */
  async setMaxRedemptionPercentage(percentage: u32): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validatePercentage(percentage)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_PERCENTAGE, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    return this.callContract(CONTRACT_METHODS.SET_MAX_REDEMPTION_PERCENTAGE, { percentage });
  }

  /**
   * Set the points earning ratio (points per unit spent)
   */
  async setPointsRatio(ratio: u32): Promise<TransactionResult> {
    this.ensureInitialized();
    if (ratio <= 0) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_AMOUNT, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    this.clearCache(CACHE_KEYS.POINTS_BALANCE);
    return this.callContract(CONTRACT_METHODS.SET_POINTS_RATIO, { ratio });
  }

  // ─── Points Management ───────────────────────────────────────────────

  /**
   * Register a new user in the loyalty program
   */
  async registerUser(user: Address): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.REGISTER_USER, { user });
    if (result.success) {
      this.clearCache(`${CACHE_KEYS.USER_DATA}_${user}`);
    }
    return result;
  }

  /**
   * Get the current points balance for a user
   */
  async getPointsBalance(user: Address): Promise<PointsBalance> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const cacheKey = `${CACHE_KEYS.POINTS_BALANCE}_${user}`;
    const cached = this.getFromCache<PointsBalance>(cacheKey);
    if (cached) return cached;

    const result = await this.queryContract(CONTRACT_METHODS.GET_POINTS_BALANCE, { user });
    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get the lifetime points for a user
   */
  async getLifetimePoints(user: Address): Promise<i128> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    return this.queryContract(CONTRACT_METHODS.GET_LIFETIME_POINTS, { user });
  }

  /**
   * Record purchase points for a user
   */
  async recordPurchasePoints(request: PurchasePointsRequest): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(request.user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }
    if (!validateAmount(request.amount)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_AMOUNT, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.RECORD_PURCHASE_POINTS, {
      user: request.user,
      amount: request.amount,
      product_id: request.productId,
      category: request.category,
    });

    if (result.success) {
      this.clearCache(`${CACHE_KEYS.POINTS_BALANCE}_${request.user}`);
      this.clearCache(`${CACHE_KEYS.USER_LEVEL}_${request.user}`);
    }
    return result;
  }

  /**
   * Admin manual points adjustment
   */
  async addPoints(request: AddPointsRequest): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(request.user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }
    if (!validateAmount(request.amount)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_AMOUNT, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.ADD_POINTS, {
      user: request.user,
      amount: request.amount,
      description: request.description,
    });

    if (result.success) {
      this.clearCache(`${CACHE_KEYS.POINTS_BALANCE}_${request.user}`);
    }
    return result;
  }

  // ─── Level Management ────────────────────────────────────────────────

  /**
   * Initialize level requirements for the loyalty program
   */
  async initLevelRequirements(requirements: LevelRequirements[]): Promise<TransactionResult> {
    this.ensureInitialized();
    return this.callContract(CONTRACT_METHODS.INIT_LEVEL_REQUIREMENTS, { requirements });
  }

  /**
   * Check and update a user's level based on current points
   */
  async checkAndUpdateLevel(user: Address): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.CHECK_AND_UPDATE_LEVEL, { user });
    if (result.success) {
      this.clearCache(`${CACHE_KEYS.USER_LEVEL}_${user}`);
    }
    return result;
  }

  /**
   * Get user's current level
   */
  async getUserLevel(user: Address): Promise<UserLevel> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const cacheKey = `${CACHE_KEYS.USER_LEVEL}_${user}`;
    const cached = this.getFromCache<UserLevel>(cacheKey);
    if (cached) return cached;

    const result = await this.queryContract(CONTRACT_METHODS.GET_USER_LEVEL, { user });
    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Award anniversary bonus to a user
   */
  async awardAnniversaryBonus(user: Address): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.AWARD_ANNIVERSARY_BONUS, { user });
    if (result.success) {
      this.clearCache(`${CACHE_KEYS.POINTS_BALANCE}_${user}`);
    }
    return result;
  }

  // ─── Milestone Management ────────────────────────────────────────────

  /**
   * Create a new milestone
   */
  async createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt'>): Promise<TransactionResult> {
    this.ensureInitialized();
    const id = generateUniqueId('mls');

    const result = await this.callContract(CONTRACT_METHODS.CREATE_MILESTONE, {
      id,
      ...milestone,
      created_at: Date.now(),
    });

    if (result.success) {
      this.clearCache(CACHE_KEYS.MILESTONES);
    }
    return result;
  }

  /**
   * Complete a milestone for a user
   */
  async completeMilestone(user: Address, milestoneId: string): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.COMPLETE_MILESTONE, {
      user,
      milestone_id: milestoneId,
    });

    if (result.success) {
      this.clearCache(`${CACHE_KEYS.POINTS_BALANCE}_${user}`);
      this.clearCache(`${CACHE_KEYS.USER_DATA}_${user}`);
    }
    return result;
  }

  /**
   * Auto-check and complete milestones for a user
   */
  async checkAndCompleteMilestones(user: Address): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.CHECK_AND_COMPLETE_MILESTONES, { user });
    if (result.success) {
      this.clearCache(`${CACHE_KEYS.POINTS_BALANCE}_${user}`);
      this.clearCache(`${CACHE_KEYS.USER_DATA}_${user}`);
    }
    return result;
  }

  // ─── Rewards Management ──────────────────────────────────────────────

  /**
   * Create a new reward
   */
  async createReward(request: CreateRewardRequest): Promise<TransactionResult> {
    this.ensureInitialized();
    const id = generateUniqueId('rwd');

    const result = await this.callContract(CONTRACT_METHODS.CREATE_REWARD, {
      id,
      ...request,
      is_active: true,
      created_at: Date.now(),
    });

    if (result.success) {
      this.clearCache(CACHE_KEYS.AVAILABLE_REWARDS);
    }
    return result;
  }

  /**
   * Redeem a reward for a user
   */
  async redeemReward(request: RedeemRewardRequest): Promise<TransactionResult> {
    this.ensureInitialized();
    if (!validateAddress(request.user)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_ADDRESS, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    const result = await this.callContract(CONTRACT_METHODS.REDEEM_REWARD, {
      user: request.user,
      reward_id: request.rewardId,
      purchase_amount: request.purchaseAmount,
    });

    if (result.success) {
      this.clearCache(`${CACHE_KEYS.POINTS_BALANCE}_${request.user}`);
      this.clearCache(CACHE_KEYS.AVAILABLE_REWARDS);
    }
    return result;
  }

  /**
   * Get all available rewards
   */
  async getAvailableRewards(): Promise<Reward[]> {
    this.ensureInitialized();

    const cached = this.getFromCache<Reward[]>(CACHE_KEYS.AVAILABLE_REWARDS);
    if (cached) return cached;

    const result = await this.queryContract(CONTRACT_METHODS.GET_AVAILABLE_REWARDS, {});
    this.setCache(CACHE_KEYS.AVAILABLE_REWARDS, result);
    return result;
  }

  /**
   * Calculate discount for a reward redemption
   */
  async calculateDiscount(rewardId: string, purchaseAmount: i128): Promise<DiscountCalculation> {
    this.ensureInitialized();
    if (!validateAmount(purchaseAmount)) {
      throw new LoyaltyError(ERROR_MESSAGES.INVALID_AMOUNT, LOYALTY_ERROR_CODES.INVALID_INPUT);
    }

    return this.queryContract(CONTRACT_METHODS.CALCULATE_DISCOUNT, {
      reward_id: rewardId,
      purchase_amount: purchaseAmount,
    });
  }

  // ─── Utility Methods ─────────────────────────────────────────────────

  /**
   * Get user's level progress information
   */
  async getUserLevelProgress(user: Address) {
    const lifetimePoints = await this.getLifetimePoints(user);
    return calculateLevelProgress(lifetimePoints);
  }

  /**
   * Format points for display
   */
  formatPoints(points: i128): string {
    return formatPoints(points);
  }

  // ─── Private Methods ─────────────────────────────────────────────────

  private ensureInitialized(): void {
    if (!this.config.contractAddress || !this.isInitialized) {
      throw new LoyaltyError(ERROR_MESSAGES.NOT_INITIALIZED, LOYALTY_ERROR_CODES.NOT_INITIALIZED);
    }
  }

  private getContractClient() {
    if (!this.contractClient) {
      throw new LoyaltyError(ERROR_MESSAGES.CONTRACT_ERROR, LOYALTY_ERROR_CODES.CONTRACT_ERROR);
    }
    return this.contractClient;
  }

  private async callContract(method: string, params: Record<string, any>): Promise<TransactionResult> {
    return retryWithBackoff(
      async () => {
        const client = this.getContractClient();
        const tx = await client.call(method, params);
        return {
          success: true,
          hash: tx?.hash,
          timestamp: Date.now(),
        };
      },
      this.retryConfig.maxRetries,
      this.retryConfig.baseDelay,
      this.retryConfig.maxDelay
    );
  }

  private async queryContract(method: string, params: Record<string, any>): Promise<any> {
    return retryWithBackoff(
      async () => {
        const client = this.getContractClient();
        return client.query(method, params);
      },
      this.retryConfig.maxRetries,
      this.retryConfig.baseDelay,
      this.retryConfig.maxDelay
    );
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;
    const entry = this.cache.get(key);
    if (isCacheValid(entry)) return entry!.data as T;
    if (entry) this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttl?: number): void {
    if (!this.cacheConfig.enabled) return;
    if (this.cache.size >= this.cacheConfig.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttl || this.cacheConfig.defaultTtl });
  }

  private clearCache(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }
}

/**
 * Custom error class for Loyalty Service
 */
export class LoyaltyError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = 'LoyaltyError';
    this.code = code;
  }
}
