import {
  LOYALTY_ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULT_LEVELS,
  TIME_CONSTANTS,
} from './constants/loyalty.constants';
import type {
  LoyaltyConfig,
  LevelConfig,
  UserLoyaltyProfile,
  LevelUpdateResult,
  LoyaltyResponse,
} from './types/loyalty.types';
import type { PointsTransaction } from './types/points.types';
import type {
  RewardItem,
  RedeemResult,
  MilestoneConfig,
} from './types/rewards.types';
import {
  isValidStellarAddress,
  generateTxHash,
  generateVoucherCode,
  calculateLevelForPoints,
  calculatePurchasePoints,
  calculateRewardDiscount,
  isAnniversaryEligible,
} from './utils/loyalty.utils';

export interface LoyaltyRewardsServiceOptions {
  /** Optional custom time provider in seconds (useful for deterministic tests) */
  nowProvider?: () => number;
  /** Optional initial admin */
  initialAdmin?: string;
}

/**
 * Main service class for StarShop Loyalty Rewards Contract.
 * Manages admin configuration, multi-tier levels, points ledger, milestones, and reward redemptions.
 */
export class LoyaltyRewardsService {
  /** Global contract state */
  private config: LoyaltyConfig;

  /** Level requirements */
  private levels: LevelConfig[] = [...DEFAULT_LEVELS];

  /** User profiles: userAddress -> UserLoyaltyProfile */
  private users: Map<string, UserLoyaltyProfile> = new Map();

  /** Points ledger: userAddress -> PointsTransaction[] */
  private transactions: Map<string, PointsTransaction[]> = new Map();

  /** Milestone definitions: milestoneId -> MilestoneConfig */
  private milestones: Map<string, MilestoneConfig> = new Map();

  /** Reward catalog: rewardId -> RewardItem */
  private rewards: Map<string, RewardItem> = new Map();

  /** User purchase count for milestone tracking */
  private userPurchaseCounts: Map<string, number> = new Map();

  /** Time provider in seconds */
  private nowProvider: () => number;

  constructor(options?: LoyaltyRewardsServiceOptions) {
    this.nowProvider =
      options?.nowProvider ?? (() => Math.floor(Date.now() / 1000));

    this.config = {
      admin: options?.initialAdmin ?? '',
      pointsExpiryDays: TIME_CONSTANTS.DEFAULT_EXPIRY_DAYS,
      maxRedemptionPercentage: TIME_CONSTANTS.DEFAULT_MAX_REDEMPTION_PCT,
      pointsRatio: TIME_CONSTANTS.DEFAULT_POINTS_RATIO,
      isInitialized: Boolean(options?.initialAdmin),
      updatedAt: this.now(),
    };
  }

  private now(): number {
    return this.nowProvider();
  }

  // ===========================================================================
  // 1. ADMIN MANAGEMENT
  // ===========================================================================

  public async initializeLoyaltyContract(
    admin: string
  ): Promise<LoyaltyResponse<boolean>> {
    if (!admin || !isValidStellarAddress(admin)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (this.config.isInitialized) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.ALREADY_INITIALIZED],
        errorCode: LOYALTY_ERROR_CODES.ALREADY_INITIALIZED,
      };
    }

    this.config.admin = admin.trim();
    this.config.isInitialized = true;
    this.config.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async updateAdmin(
    newAdmin: string
  ): Promise<LoyaltyResponse<boolean>> {
    if (!this.config.isInitialized) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.NOT_INITIALIZED],
        errorCode: LOYALTY_ERROR_CODES.NOT_INITIALIZED,
      };
    }

    if (!newAdmin || !isValidStellarAddress(newAdmin)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    this.config.admin = newAdmin.trim();
    this.config.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async setPointsExpiry(
    days: number
  ): Promise<LoyaltyResponse<boolean>> {
    if (typeof days !== 'number' || days < 0 || !Number.isFinite(days)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    this.config.pointsExpiryDays = Math.floor(days);
    this.config.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async setMaxRedemptionPercentage(
    percentage: number
  ): Promise<LoyaltyResponse<boolean>> {
    if (
      typeof percentage !== 'number' ||
      percentage < 0 ||
      percentage > 100 ||
      !Number.isFinite(percentage)
    ) {
      return {
        success: false,
        error: 'Percentage must be between 0 and 100.',
        errorCode: LOYALTY_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    this.config.maxRedemptionPercentage = percentage;
    this.config.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async setPointsRatio(
    ratio: number
  ): Promise<LoyaltyResponse<boolean>> {
    if (typeof ratio !== 'number' || ratio <= 0 || !Number.isFinite(ratio)) {
      return {
        success: false,
        error: 'Points ratio must be greater than zero.',
        errorCode: LOYALTY_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    this.config.pointsRatio = ratio;
    this.config.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  // ===========================================================================
  // 2. POINTS MANAGEMENT
  // ===========================================================================

  public async registerUser(
    user: string
  ): Promise<LoyaltyResponse<UserLoyaltyProfile>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalized = user.trim();
    if (this.users.has(normalized)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.USER_ALREADY_REGISTERED],
        errorCode: LOYALTY_ERROR_CODES.USER_ALREADY_REGISTERED,
      };
    }

    const currentNow = this.now();
    const profile: UserLoyaltyProfile = {
      user: normalized,
      currentLevel: 'Bronze',
      currentPoints: 0,
      lifetimePoints: 0,
      joinedAt: currentNow,
      lastActiveAt: currentNow,
      completedMilestones: [],
    };

    this.users.set(normalized, profile);
    this.transactions.set(normalized, []);
    this.userPurchaseCounts.set(normalized, 0);

    return {
      success: true,
      data: { ...profile },
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Helper that returns profile or registers user lazily if valid
   */
  public async getOrCreateUser(
    user: string
  ): Promise<UserLoyaltyProfile | null> {
    if (!user || !isValidStellarAddress(user)) {
      return null;
    }
    const normalized = user.trim();
    let profile = this.users.get(normalized);
    if (!profile) {
      await this.registerUser(normalized);
      profile = this.users.get(normalized);
    }
    return profile || null;
  }

  /**
   * Evicts expired points from user balance before queries
   */
  private processPointsExpiry(user: string): void {
    const profile = this.users.get(user);
    if (!profile || this.config.pointsExpiryDays <= 0) return;

    const currentNow = this.now();
    const txs = this.transactions.get(user) || [];
    let expiredSum = 0;

    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      if (
        !tx.isExpired &&
        tx.expiresAt &&
        currentNow > tx.expiresAt &&
        tx.amount > 0
      ) {
        tx.isExpired = true;
        expiredSum += tx.amount;
      }
    }

    if (expiredSum > 0) {
      profile.currentPoints = Math.max(0, profile.currentPoints - expiredSum);
      this.users.set(user, profile);

      txs.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user,
        amount: -expiredSum,
        type: 'EXPIRY',
        description: `Expired ${expiredSum} points past ${this.config.pointsExpiryDays} days limit`,
        timestamp: currentNow,
        txHash: generateTxHash(),
      });
    }
  }

  public async getPointsBalance(user: string): Promise<number> {
    if (!user || !isValidStellarAddress(user)) return 0;
    const normalized = user.trim();
    this.processPointsExpiry(normalized);
    const profile = this.users.get(normalized);
    return profile ? profile.currentPoints : 0;
  }

  public async getLifetimePoints(user: string): Promise<number> {
    if (!user || !isValidStellarAddress(user)) return 0;
    const profile = this.users.get(user.trim());
    return profile ? profile.lifetimePoints : 0;
  }

  public async recordPurchasePoints(
    user: string,
    amount: number,
    productId?: string,
    category?: string
  ): Promise<LoyaltyResponse<number>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    const normalized = user.trim();
    const profile = await this.getOrCreateUser(normalized);
    if (!profile) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.USER_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.USER_NOT_FOUND,
      };
    }

    // Determine tier multiplier
    const currentTier = calculateLevelForPoints(
      profile.lifetimePoints,
      this.levels
    );
    const earnedPoints = calculatePurchasePoints(
      amount,
      this.config.pointsRatio,
      currentTier.multiplier
    );

    const currentNow = this.now();
    const expiresAt =
      this.config.pointsExpiryDays > 0
        ? currentNow +
          this.config.pointsExpiryDays * TIME_CONSTANTS.SECONDS_IN_DAY
        : undefined;

    profile.currentPoints += earnedPoints;
    profile.lifetimePoints += earnedPoints;
    profile.lastActiveAt = currentNow;
    this.users.set(normalized, profile);

    // Increment purchases count
    const pCount = (this.userPurchaseCounts.get(normalized) || 0) + 1;
    this.userPurchaseCounts.set(normalized, pCount);

    // Record ledger transaction
    const tx: PointsTransaction = {
      id: `tx_pur_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user: normalized,
      amount: earnedPoints,
      type: 'PURCHASE',
      description: `Purchase of $${amount.toFixed(2)} (${currentTier.level} tier x${currentTier.multiplier})`,
      timestamp: currentNow,
      expiresAt,
      isExpired: false,
      metadata: { amount, productId, category },
      txHash: generateTxHash(),
    };

    const userTxs = this.transactions.get(normalized) || [];
    userTxs.push(tx);
    this.transactions.set(normalized, userTxs);

    // Update level if threshold reached
    await this.checkAndUpdateLevel(normalized);

    return {
      success: true,
      data: earnedPoints,
      transactionHash: tx.txHash,
    };
  }

  public async addPoints(
    user: string,
    amount: number,
    description: string
  ): Promise<LoyaltyResponse<number>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_POINTS_AMOUNT],
        errorCode: LOYALTY_ERROR_CODES.INVALID_POINTS_AMOUNT,
      };
    }

    const normalized = user.trim();
    const profile = await this.getOrCreateUser(normalized);
    if (!profile) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.USER_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.USER_NOT_FOUND,
      };
    }

    const currentNow = this.now();
    profile.currentPoints += Math.floor(amount);
    profile.lifetimePoints += Math.floor(amount);
    profile.lastActiveAt = currentNow;
    this.users.set(normalized, profile);

    const tx: PointsTransaction = {
      id: `tx_add_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user: normalized,
      amount: Math.floor(amount),
      type: 'BONUS',
      description: description || 'Bonus points adjustment',
      timestamp: currentNow,
      txHash: generateTxHash(),
    };

    const userTxs = this.transactions.get(normalized) || [];
    userTxs.push(tx);
    this.transactions.set(normalized, userTxs);

    await this.checkAndUpdateLevel(normalized);

    return {
      success: true,
      data: profile.currentPoints,
      transactionHash: tx.txHash,
    };
  }

  // ===========================================================================
  // 3. LEVEL MANAGEMENT
  // ===========================================================================

  public async initLevelRequirements(
    requirements: LevelConfig[]
  ): Promise<LoyaltyResponse<boolean>> {
    if (
      !requirements ||
      !Array.isArray(requirements) ||
      requirements.length === 0
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_LEVEL_CONFIG],
        errorCode: LOYALTY_ERROR_CODES.INVALID_LEVEL_CONFIG,
      };
    }

    this.levels = [...requirements].sort((a, b) => a.minPoints - b.minPoints);

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async checkAndUpdateLevel(
    user: string
  ): Promise<LoyaltyResponse<LevelUpdateResult>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalized = user.trim();
    const profile = this.users.get(normalized);
    if (!profile) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.USER_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.USER_NOT_FOUND,
      };
    }

    const currentTier = calculateLevelForPoints(
      profile.lifetimePoints,
      this.levels
    );
    const previousLevel = profile.currentLevel;
    const hasUpgraded = currentTier.level !== previousLevel;

    profile.currentLevel = currentTier.level;
    this.users.set(normalized, profile);

    return {
      success: true,
      data: {
        user: normalized,
        previousLevel,
        newLevel: currentTier.level,
        hasUpgraded,
        lifetimePoints: profile.lifetimePoints,
      },
    };
  }

  public async getUserLevel(user: string): Promise<string> {
    if (!user || !isValidStellarAddress(user)) return 'Bronze';
    const profile = this.users.get(user.trim());
    return profile ? profile.currentLevel : 'Bronze';
  }

  public async awardAnniversaryBonus(
    user: string
  ): Promise<LoyaltyResponse<number>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalized = user.trim();
    const profile = this.users.get(normalized);
    if (!profile) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.USER_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.USER_NOT_FOUND,
      };
    }

    const currentNow = this.now();
    const eligibility = isAnniversaryEligible(
      profile.joinedAt,
      currentNow,
      profile.lastAnniversaryClaimedYear
    );

    if (!eligibility.eligible) {
      const code =
        eligibility.currentYear < 1
          ? LOYALTY_ERROR_CODES.ANNIVERSARY_NOT_REACHED
          : LOYALTY_ERROR_CODES.ANNIVERSARY_ALREADY_CLAIMED;

      return {
        success: false,
        error: ERROR_MESSAGES[code],
        errorCode: code,
      };
    }

    const bonus = TIME_CONSTANTS.ANNIVERSARY_BONUS_POINTS;
    profile.currentPoints += bonus;
    profile.lifetimePoints += bonus;
    profile.lastAnniversaryClaimedYear = eligibility.currentYear;
    profile.lastActiveAt = currentNow;

    const tx: PointsTransaction = {
      id: `tx_ann_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user: normalized,
      amount: bonus,
      type: 'ANNIVERSARY',
      description: `Anniversary Year ${eligibility.currentYear} Bonus Award`,
      timestamp: currentNow,
      txHash: generateTxHash(),
    };

    const userTxs = this.transactions.get(normalized) || [];
    userTxs.push(tx);
    this.transactions.set(normalized, userTxs);

    await this.checkAndUpdateLevel(normalized);

    return {
      success: true,
      data: bonus,
      transactionHash: tx.txHash,
    };
  }

  // ===========================================================================
  // 4. MILESTONE MANAGEMENT
  // ===========================================================================

  public async createMilestone(
    milestone: MilestoneConfig
  ): Promise<LoyaltyResponse<string>> {
    if (
      !milestone ||
      !milestone.id ||
      !milestone.title ||
      milestone.threshold <= 0 ||
      milestone.bonusPoints < 0
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    this.milestones.set(milestone.id, { ...milestone });

    return {
      success: true,
      data: milestone.id,
      transactionHash: generateTxHash(),
    };
  }

  public async completeMilestone(
    user: string,
    milestoneId: string
  ): Promise<LoyaltyResponse<boolean>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalized = user.trim();
    const profile = this.users.get(normalized);
    if (!profile) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.USER_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.USER_NOT_FOUND,
      };
    }

    const milestone = this.milestones.get(milestoneId);
    if (!milestone || !milestone.isActive) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.MILESTONE_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.MILESTONE_NOT_FOUND,
      };
    }

    if (profile.completedMilestones.includes(milestoneId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.MILESTONE_ALREADY_COMPLETED],
        errorCode: LOYALTY_ERROR_CODES.MILESTONE_ALREADY_COMPLETED,
      };
    }

    // Validate milestone condition
    let metricValue = 0;
    if (milestone.metric === 'LIFETIME_POINTS') {
      metricValue = profile.lifetimePoints;
    } else if (milestone.metric === 'PURCHASES_COUNT') {
      metricValue = this.userPurchaseCounts.get(normalized) || 0;
    } else if (milestone.metric === 'DAYS_ACTIVE') {
      metricValue = Math.floor(
        (this.now() - profile.joinedAt) / TIME_CONSTANTS.SECONDS_IN_DAY
      );
    }

    if (metricValue < milestone.threshold) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.MILESTONE_CONDITION_NOT_MET],
        errorCode: LOYALTY_ERROR_CODES.MILESTONE_CONDITION_NOT_MET,
      };
    }

    // Award bonus
    profile.completedMilestones.push(milestoneId);
    if (milestone.bonusPoints > 0) {
      profile.currentPoints += milestone.bonusPoints;
      profile.lifetimePoints += milestone.bonusPoints;

      const tx: PointsTransaction = {
        id: `tx_ms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user: normalized,
        amount: milestone.bonusPoints,
        type: 'MILESTONE',
        description: `Milestone completed: ${milestone.title}`,
        timestamp: this.now(),
        txHash: generateTxHash(),
      };

      const userTxs = this.transactions.get(normalized) || [];
      userTxs.push(tx);
    }

    this.users.set(normalized, profile);
    await this.checkAndUpdateLevel(normalized);

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async checkAndCompleteMilestones(
    user: string
  ): Promise<LoyaltyResponse<string[]>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const completedNow: string[] = [];
    const milestoneEntries = Array.from(this.milestones.values());

    for (let i = 0; i < milestoneEntries.length; i++) {
      const ms = milestoneEntries[i];
      const res = await this.completeMilestone(user, ms.id);
      if (res.success) {
        completedNow.push(ms.id);
      }
    }

    return {
      success: true,
      data: completedNow,
    };
  }

  // ===========================================================================
  // 5. REWARDS MANAGEMENT
  // ===========================================================================

  public async createReward(
    reward: RewardItem
  ): Promise<LoyaltyResponse<string>> {
    if (
      !reward ||
      !reward.id ||
      !reward.title ||
      reward.pointsCost <= 0 ||
      reward.value <= 0
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_REWARD_CONFIG],
        errorCode: LOYALTY_ERROR_CODES.INVALID_REWARD_CONFIG,
      };
    }

    this.rewards.set(reward.id, { ...reward });

    return {
      success: true,
      data: reward.id,
      transactionHash: generateTxHash(),
    };
  }

  public async getAvailableRewards(): Promise<RewardItem[]> {
    const list: RewardItem[] = [];
    this.rewards.forEach(r => {
      if (r.isActive && (r.stock === -1 || r.stock > 0)) {
        list.push({ ...r });
      }
    });
    return list;
  }

  public async calculateDiscount(
    rewardId: string,
    purchaseAmount: number
  ): Promise<number> {
    const reward = this.rewards.get(rewardId);
    if (!reward || purchaseAmount <= 0) return 0;
    return calculateRewardDiscount(reward, purchaseAmount);
  }

  public async redeemReward(
    user: string,
    rewardId: string,
    purchaseAmount?: number
  ): Promise<LoyaltyResponse<RedeemResult>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INVALID_ADDRESS],
        errorCode: LOYALTY_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalized = user.trim();
    this.processPointsExpiry(normalized);

    const profile = this.users.get(normalized);
    if (!profile) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.USER_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.USER_NOT_FOUND,
      };
    }

    const reward = this.rewards.get(rewardId);
    if (!reward) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.REWARD_NOT_FOUND],
        errorCode: LOYALTY_ERROR_CODES.REWARD_NOT_FOUND,
      };
    }

    if (!reward.isActive) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.REWARD_INACTIVE],
        errorCode: LOYALTY_ERROR_CODES.REWARD_INACTIVE,
      };
    }

    if (reward.stock !== -1 && reward.stock <= 0) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.REWARD_OUT_OF_STOCK],
        errorCode: LOYALTY_ERROR_CODES.REWARD_OUT_OF_STOCK,
      };
    }

    if (profile.currentPoints < reward.pointsCost) {
      return {
        success: false,
        error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.INSUFFICIENT_POINTS],
        errorCode: LOYALTY_ERROR_CODES.INSUFFICIENT_POINTS,
      };
    }

    // Check purchase amount constraints
    let discount = 0;
    if (purchaseAmount !== undefined) {
      if (
        reward.minPurchaseAmount &&
        purchaseAmount < reward.minPurchaseAmount
      ) {
        return {
          success: false,
          error: ERROR_MESSAGES[LOYALTY_ERROR_CODES.PURCHASE_AMOUNT_TOO_LOW],
          errorCode: LOYALTY_ERROR_CODES.PURCHASE_AMOUNT_TOO_LOW,
        };
      }

      discount = calculateRewardDiscount(reward, purchaseAmount);

      // Check maxRedemptionPercentage constraint
      const maxAllowedDiscount =
        (purchaseAmount * this.config.maxRedemptionPercentage) / 100;
      if (discount > maxAllowedDiscount) {
        return {
          success: false,
          error:
            ERROR_MESSAGES[LOYALTY_ERROR_CODES.REDEMPTION_PERCENTAGE_EXCEEDED],
          errorCode: LOYALTY_ERROR_CODES.REDEMPTION_PERCENTAGE_EXCEEDED,
        };
      }
    } else {
      discount = reward.value;
    }

    // Atomic execution
    profile.currentPoints -= reward.pointsCost;
    profile.lastActiveAt = this.now();

    if (reward.stock > 0) {
      reward.stock -= 1;
      this.rewards.set(rewardId, reward);
    }

    const voucherCode = generateVoucherCode('STAR');
    const redemptionId = `red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const tx: PointsTransaction = {
      id: `tx_red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user: normalized,
      amount: -reward.pointsCost,
      type: 'REDEMPTION',
      description: `Redeemed reward: ${reward.title} (voucher: ${voucherCode})`,
      timestamp: this.now(),
      txHash: generateTxHash(),
    };

    const userTxs = this.transactions.get(normalized) || [];
    userTxs.push(tx);
    this.transactions.set(normalized, userTxs);
    this.users.set(normalized, profile);

    const result: RedeemResult = {
      redemptionId,
      rewardId,
      user: normalized,
      pointsDeducted: reward.pointsCost,
      remainingPoints: profile.currentPoints,
      discountApplied: discount,
      voucherCode,
      timestamp: this.now(),
    };

    return {
      success: true,
      data: result,
      transactionHash: tx.txHash,
    };
  }

  // ===========================================================================
  // 6. UTILITY & RESET
  // ===========================================================================

  public getUserProfile(user: string): UserLoyaltyProfile | null {
    if (!user || !isValidStellarAddress(user)) return null;
    this.processPointsExpiry(user.trim());
    const profile = this.users.get(user.trim());
    return profile ? { ...profile } : null;
  }

  public getTransactionHistory(user: string): PointsTransaction[] {
    if (!user || !isValidStellarAddress(user)) return [];
    return [...(this.transactions.get(user.trim()) || [])];
  }

  public getConfig(): LoyaltyConfig {
    return { ...this.config };
  }

  public getLevelRequirements(): LevelConfig[] {
    return this.levels.map(l => ({ ...l }));
  }

  public reset(): void {
    this.users.clear();
    this.transactions.clear();
    this.milestones.clear();
    this.rewards.clear();
    this.userPurchaseCounts.clear();
    this.levels = [...DEFAULT_LEVELS];
    this.config.isInitialized = false;
    this.config.admin = '';
  }

  public resetState(): void {
    this.reset();
  }
}
