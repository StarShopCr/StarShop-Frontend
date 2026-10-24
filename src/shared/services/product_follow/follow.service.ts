import {
  FOLLOW_ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  TIME_CONSTANTS,
} from './constants/follow.constants';
import type {
  FollowEntry,
  FollowResponse,
  PaginationParams,
} from './types/follow.types';
import type {
  NotificationPreference,
  AlertConfig,
} from './types/notification.types';
import type { FollowStats } from './types/stats.types';
import {
  isValidStellarAddress,
  generateTxHash,
  generateAlertId,
  isUserEligibleForPriceDropAlert,
  paginateArray,
} from './utils/follow.utils';

export interface ProductFollowServiceOptions {
  timeProvider?: () => number;
}

export class ProductFollowService {
  // Map key: `${productId}::${user.toLowerCase()}`
  private follows: Map<string, FollowEntry> = new Map();
  // Map key: productId -> Set of normalized user addresses
  private productFollowers: Map<string, Set<string>> = new Map();
  // Map key: user.toLowerCase() -> Set of productIds
  private userFollowing: Map<string, Set<string>> = new Map();
  // Alert history: alertId -> AlertConfig
  private alerts: Map<string, AlertConfig> = new Map();
  private timeProvider?: () => number;

  constructor(options?: ProductFollowServiceOptions) {
    this.timeProvider = options?.timeProvider;
  }

  public setTimeProvider(provider: () => number): void {
    this.timeProvider = provider;
  }

  private now(): number {
    return this.timeProvider
      ? this.timeProvider()
      : Math.floor(Date.now() / 1000);
  }

  private makeKey(productId: string, user: string): string {
    return `${productId.trim()}::${user.trim().toLowerCase()}`;
  }

  // ===========================================================================
  // 1. FOLLOW OPERATIONS
  // ===========================================================================

  public async followProduct(
    productId: string,
    user: string,
    prefs?: NotificationPreference
  ): Promise<FollowResponse<boolean>> {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalizedUser = user.trim().toLowerCase();
    const pid = productId.trim();
    const key = this.makeKey(pid, user);

    const userFollowsSet = this.userFollowing.get(normalizedUser) || new Set();
    if (userFollowsSet.size >= TIME_CONSTANTS.MAX_USER_FOLLOWS) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.MAX_FOLLOWS_EXCEEDED],
        errorCode: FOLLOW_ERROR_CODES.MAX_FOLLOWS_EXCEEDED,
      };
    }

    if (this.follows.has(key)) {
      const existing = this.follows.get(key)!;
      if (existing.status === 'ACTIVE') {
        return {
          success: false,
          error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.USER_ALREADY_FOLLOWING],
          errorCode: FOLLOW_ERROR_CODES.USER_ALREADY_FOLLOWING,
        };
      }
      // Re-activate if previously unfollowed
      existing.status = 'ACTIVE';
      existing.updatedAt = this.now();
      if (prefs) {
        existing.preferences = { ...prefs };
      }
      const prodFollowers = this.productFollowers.get(pid) || new Set();
      prodFollowers.add(normalizedUser);
      this.productFollowers.set(pid, prodFollowers);

      userFollowsSet.add(pid);
      this.userFollowing.set(normalizedUser, userFollowsSet);

      return {
        success: true,
        data: true,
        transactionHash: generateTxHash(),
      };
    }

    const currentNow = this.now();
    const entry: FollowEntry = {
      productId: pid,
      user: user.trim(),
      status: 'ACTIVE',
      followedAt: currentNow,
      updatedAt: currentNow,
      preferences: prefs ? { ...prefs } : { ...DEFAULT_NOTIFICATION_PREFERENCES },
      txHash: generateTxHash(),
    };

    this.follows.set(key, entry);

    const prodFollowers = this.productFollowers.get(pid) || new Set();
    prodFollowers.add(normalizedUser);
    this.productFollowers.set(pid, prodFollowers);

    userFollowsSet.add(pid);
    this.userFollowing.set(normalizedUser, userFollowsSet);

    return {
      success: true,
      data: true,
      transactionHash: entry.txHash,
    };
  }

  public async unfollowProduct(
    productId: string,
    user: string
  ): Promise<FollowResponse<boolean>> {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalizedUser = user.trim().toLowerCase();
    const pid = productId.trim();
    const key = this.makeKey(pid, user);

    if (!this.follows.has(key)) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING],
        errorCode: FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING,
      };
    }

    const entry = this.follows.get(key)!;
    if (entry.status === 'UNFOLLOWED') {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING],
        errorCode: FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING,
      };
    }

    entry.status = 'UNFOLLOWED';
    entry.updatedAt = this.now();

    const prodFollowers = this.productFollowers.get(pid);
    if (prodFollowers) {
      prodFollowers.delete(normalizedUser);
    }

    const userFollowsSet = this.userFollowing.get(normalizedUser);
    if (userFollowsSet) {
      userFollowsSet.delete(pid);
    }

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async isFollowing(productId: string, user: string): Promise<boolean> {
    if (!productId || !user || !isValidStellarAddress(user)) {
      return false;
    }
    const key = this.makeKey(productId, user);
    const entry = this.follows.get(key);
    return entry ? entry.status === 'ACTIVE' : false;
  }

  public async getFollowers(
    productId: string,
    pagination?: PaginationParams
  ): Promise<FollowResponse<string[]>> {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    const pid = productId.trim();
    const followersSet = this.productFollowers.get(pid) || new Set();
    const allFollowers = Array.from(followersSet);
    const paginated = paginateArray(allFollowers, pagination);

    return {
      success: true,
      data: paginated,
    };
  }

  public async getFollowingProducts(
    user: string,
    pagination?: PaginationParams
  ): Promise<FollowResponse<string[]>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const normalizedUser = user.trim().toLowerCase();
    const followingSet = this.userFollowing.get(normalizedUser) || new Set();
    const allProducts = Array.from(followingSet);
    const paginated = paginateArray(allProducts, pagination);

    return {
      success: true,
      data: paginated,
    };
  }

  // ===========================================================================
  // 2. NOTIFICATION & ALERT MANAGEMENT
  // ===========================================================================

  public async setNotificationPreferences(
    user: string,
    productId: string,
    prefs: NotificationPreference
  ): Promise<FollowResponse<boolean>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    const key = this.makeKey(productId, user);
    if (!this.follows.has(key) || this.follows.get(key)!.status !== 'ACTIVE') {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING],
        errorCode: FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING,
      };
    }

    const entry = this.follows.get(key)!;
    entry.preferences = { ...prefs };
    entry.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async getNotificationPreferences(
    user: string,
    productId: string
  ): Promise<NotificationPreference> {
    if (!user || !productId || !isValidStellarAddress(user)) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }
    const key = this.makeKey(productId, user);
    const entry = this.follows.get(key);
    return entry ? { ...entry.preferences } : { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  public async triggerPriceDropAlert(
    productId: string,
    oldPrice: number,
    newPrice: number
  ): Promise<FollowResponse<number>> {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    if (
      typeof oldPrice !== 'number' ||
      typeof newPrice !== 'number' ||
      oldPrice <= 0 ||
      newPrice < 0 ||
      !Number.isFinite(oldPrice) ||
      !Number.isFinite(newPrice)
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_PRICE],
        errorCode: FOLLOW_ERROR_CODES.INVALID_PRICE,
      };
    }

    const pid = productId.trim();
    const followers = this.productFollowers.get(pid) || new Set();
    let notifiedCount = 0;

    for (const follower of Array.from(followers)) {
      const key = `${pid}::${follower}`;
      const entry = this.follows.get(key);
      if (entry && entry.status === 'ACTIVE') {
        if (isUserEligibleForPriceDropAlert(entry.preferences, oldPrice, newPrice)) {
          notifiedCount++;
        }
      }
    }

    const alertId = generateAlertId();
    this.alerts.set(alertId, {
      id: alertId,
      productId: pid,
      type: 'PRICE_DROP',
      timestamp: this.now(),
      data: { oldPrice, newPrice },
      notifiedUsersCount: notifiedCount,
    });

    return {
      success: true,
      data: notifiedCount,
      transactionHash: generateTxHash(),
    };
  }

  public async triggerRestockAlert(
    productId: string,
    quantity: number
  ): Promise<FollowResponse<number>> {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: FOLLOW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    if (typeof quantity !== 'number' || quantity <= 0 || !Number.isFinite(quantity)) {
      return {
        success: false,
        error: ERROR_MESSAGES[FOLLOW_ERROR_CODES.INVALID_QUANTITY],
        errorCode: FOLLOW_ERROR_CODES.INVALID_QUANTITY,
      };
    }

    const pid = productId.trim();
    const followers = this.productFollowers.get(pid) || new Set();
    let notifiedCount = 0;

    for (const follower of Array.from(followers)) {
      const key = `${pid}::${follower}`;
      const entry = this.follows.get(key);
      if (entry && entry.status === 'ACTIVE' && (entry.preferences.restock || entry.preferences.backInStock)) {
        notifiedCount++;
      }
    }

    const alertId = generateAlertId();
    this.alerts.set(alertId, {
      id: alertId,
      productId: pid,
      type: 'RESTOCK',
      timestamp: this.now(),
      data: { quantity },
      notifiedUsersCount: notifiedCount,
    });

    return {
      success: true,
      data: notifiedCount,
      transactionHash: generateTxHash(),
    };
  }

  // ===========================================================================
  // 3. ANALYTICS & STATS
  // ===========================================================================

  public async getProductFollowStats(productId: string): Promise<FollowStats> {
    const pid = productId.trim();
    const followers = this.productFollowers.get(pid) || new Set();

    let priceAlertSubscribers = 0;
    let restockAlertSubscribers = 0;
    let lastFollowedAt: number | undefined;

    for (const follower of Array.from(followers)) {
      const key = `${pid}::${follower}`;
      const entry = this.follows.get(key);
      if (entry && entry.status === 'ACTIVE') {
        if (entry.preferences.priceDrop) priceAlertSubscribers++;
        if (entry.preferences.restock || entry.preferences.backInStock) restockAlertSubscribers++;
        if (!lastFollowedAt || entry.followedAt > lastFollowedAt) {
          lastFollowedAt = entry.followedAt;
        }
      }
    }

    return {
      productId: pid,
      totalFollowers: followers.size,
      activeFollowers: followers.size,
      priceAlertSubscribers,
      restockAlertSubscribers,
      lastFollowedAt,
    };
  }

  public async getTrendingFollowedProducts(limit: number = 10): Promise<string[]> {
    const counts: Array<{ productId: string; count: number }> = [];

    for (const [pid, followers] of Array.from(this.productFollowers.entries())) {
      counts.push({ productId: pid, count: followers.size });
    }

    counts.sort((a, b) => b.count - a.count);
    return counts.slice(0, Math.max(1, limit)).map((item) => item.productId);
  }

  // ===========================================================================
  // 4. TEST & AUDIT HELPERS
  // ===========================================================================

  public resetState(): void {
    this.follows.clear();
    this.productFollowers.clear();
    this.userFollowing.clear();
    this.alerts.clear();
  }

  public getRawFollows(): FollowEntry[] {
    return Array.from(this.follows.values()).map((e) => ({ ...e }));
  }
}
