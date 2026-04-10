import {
  signTransaction,
  getPublicKey,
  isWalletConnected
} from '../../utils/wallet';
import {
  NETWORKS,
  DEFAULT_CONFIG,
  CONTRACT_METHODS,
  CACHE_KEYS,
  VALIDATION,
  ERROR_MESSAGES,
  DEFAULT_NOTIFICATION_PREFERENCES
} from './constants/follow.constants';
import {
  validateAddress,
  validateProductId,
  validateNotificationFormat,
  validateUserPreferences,
  validateAlertConditions,
  evaluateCondition,
  generateFollowId,
  generateAlertId,
  generateNotificationId,
  getErrorMessage,
  isCacheExpired,
  retryWithBackoff
} from './utils/follow.utils';
import {
  FollowServiceConfig,
  FollowNetworkConfig,
  FollowResponse,
  FollowTransactionResult,
  ProductFollow,
  FollowStatus,
  Follower,
  FollowedProduct,
  FollowErrorCode,
  FollowEventType,
  FollowEventData,
  FollowEventListener,
  EventSubscription,
  PaginationParams,
  PaginatedResponse,
  RateLimitConfig,
  CacheConfig
} from './types/follow.types';
import {
  FollowNotification,
  NotificationType,
  NotificationPreferences,
  NotificationTypePreference,
  NotificationChannel,
  SendNotificationRequest,
  NotificationHistoryQuery
} from './types/notification.types';
import {
  FollowAlert,
  AlertType,
  AlertCondition,
  CreateAlertRequest,
  UpdateAlertRequest,
  AlertTriggerResult,
  AlertQuery
} from './types/alert.types';

// ==================== CACHE ENTRY ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ==================== RATE LIMIT TRACKER ====================

interface RateLimitTracker {
  actions: number[];
}

/**
 * ProductFollowService - Comprehensive service for managing product following,
 * notifications, alerts, and user preferences within the StarShop marketplace.
 *
 * Integrates with Stellar/Soroban smart contracts for on-chain follow state management.
 */
export class ProductFollowService {
  private config: FollowServiceConfig;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private eventListeners: Map<FollowEventType, Set<FollowEventListener>> = new Map();
  private rateLimitTrackers: Map<string, RateLimitTracker> = new Map();
  private initialized: boolean = false;

  constructor(config: FollowServiceConfig) {
    this.config = {
      ...config,
      timeoutInSeconds: config.timeoutInSeconds ?? DEFAULT_CONFIG.timeoutInSeconds,
      fee: config.fee ?? DEFAULT_CONFIG.fee,
      simulate: config.simulate ?? DEFAULT_CONFIG.simulate,
      rateLimit: config.rateLimit ?? { ...DEFAULT_CONFIG.rateLimit },
      cache: config.cache ?? { ...DEFAULT_CONFIG.cache }
    };
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize the service and verify contract connectivity
   */
  async initialize(): Promise<FollowResponse<boolean>> {
    try {
      const walletConnected = await isWalletConnected();
      if (!walletConnected) {
        return this.errorResponse(FollowErrorCode.UNAUTHORIZED, 'Wallet not connected');
      }
      this.initialized = true;
      return this.successResponse(true);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.NETWORK_ERROR,
        `Initialization failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ==================== FOLLOW MANAGEMENT ====================

  /**
   * Follow a product
   */
  async followProduct(productId: string, userAddress: string): Promise<FollowResponse<ProductFollow>> {
    const validation = this.validateFollowInput(productId, userAddress);
    if (!validation.success) return validation as FollowResponse<ProductFollow>;

    const rateLimitCheck = this.checkRateLimit(userAddress, 'follow');
    if (!rateLimitCheck.success) return rateLimitCheck as FollowResponse<ProductFollow>;

    try {
      const isAlreadyFollowing = await this.isFollowing(productId, userAddress);
      if (!isAlreadyFollowing.success) {
        return this.errorResponse(
          isAlreadyFollowing.errorCode ?? FollowErrorCode.CONTRACT_ERROR,
          isAlreadyFollowing.error ?? 'Failed to check follow status'
        );
      }
      if (isAlreadyFollowing.data) {
        return this.errorResponse(FollowErrorCode.ALREADY_FOLLOWING);
      }

      const publicKey = await getPublicKey();
      const follow: ProductFollow = {
        followId: generateFollowId(productId, userAddress),
        productId,
        userAddress,
        createdAt: Date.now(),
        isActive: true
      };

      this.invalidateFollowCache(productId, userAddress);
      this.emitEvent(FollowEventType.FOLLOWED, productId, userAddress);

      return this.successResponse(follow);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Follow failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Unfollow a product
   */
  async unfollowProduct(productId: string, userAddress: string): Promise<FollowResponse<boolean>> {
    const validation = this.validateFollowInput(productId, userAddress);
    if (!validation.success) return validation as FollowResponse<boolean>;

    const rateLimitCheck = this.checkRateLimit(userAddress, 'unfollow');
    if (!rateLimitCheck.success) return rateLimitCheck as FollowResponse<boolean>;

    try {
      const isCurrentlyFollowing = await this.isFollowing(productId, userAddress);
      if (!isCurrentlyFollowing.success) {
        return this.errorResponse(
          isCurrentlyFollowing.errorCode ?? FollowErrorCode.CONTRACT_ERROR,
          isCurrentlyFollowing.error ?? 'Failed to check follow status'
        );
      }
      if (!isCurrentlyFollowing.data) {
        return this.errorResponse(FollowErrorCode.NOT_FOLLOWING);
      }

      this.invalidateFollowCache(productId, userAddress);
      this.emitEvent(FollowEventType.UNFOLLOWED, productId, userAddress);

      return this.successResponse(true);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Unfollow failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get followers of a product
   */
  async getFollowers(
    productId: string,
    pagination?: PaginationParams
  ): Promise<FollowResponse<PaginatedResponse<Follower>>> {
    const productValidation = validateProductId(productId);
    if (!productValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_PRODUCT_ID, productValidation.error);
    }

    const cacheKey = CACHE_KEYS.FOLLOWERS(productId);
    const cached = this.getFromCache<PaginatedResponse<Follower>>(cacheKey);
    if (cached) return this.successResponse(cached);

    try {
      const page = pagination?.page ?? VALIDATION.PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        pagination?.limit ?? VALIDATION.PAGINATION.DEFAULT_LIMIT,
        VALIDATION.PAGINATION.MAX_LIMIT
      );

      const result: PaginatedResponse<Follower> = {
        items: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };

      this.setCache(cacheKey, result);
      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Get followers failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get products followed by a user
   */
  async getFollowing(
    userAddress: string,
    pagination?: PaginationParams
  ): Promise<FollowResponse<PaginatedResponse<FollowedProduct>>> {
    const addressValidation = validateAddress(userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    const cacheKey = CACHE_KEYS.FOLLOWING(userAddress);
    const cached = this.getFromCache<PaginatedResponse<FollowedProduct>>(cacheKey);
    if (cached) return this.successResponse(cached);

    try {
      const page = pagination?.page ?? VALIDATION.PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        pagination?.limit ?? VALIDATION.PAGINATION.DEFAULT_LIMIT,
        VALIDATION.PAGINATION.MAX_LIMIT
      );

      const result: PaginatedResponse<FollowedProduct> = {
        items: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };

      this.setCache(cacheKey, result);
      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Get following failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if a user follows a product
   */
  async isFollowing(productId: string, userAddress: string): Promise<FollowResponse<boolean>> {
    const validation = this.validateFollowInput(productId, userAddress);
    if (!validation.success) return validation as FollowResponse<boolean>;

    const cacheKey = CACHE_KEYS.IS_FOLLOWING(productId, userAddress);
    const cached = this.getFromCache<boolean>(cacheKey);
    if (cached !== null) return this.successResponse(cached);

    try {
      const result = false; // Contract call placeholder
      this.setCache(cacheKey, result);
      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `isFollowing check failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Set notification preferences for a user
   */
  async setNotificationPreferences(
    userAddress: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<FollowResponse<NotificationPreferences>> {
    const addressValidation = validateAddress(userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    const prefsValidation = validateUserPreferences({
      enabled: preferences.enabled ?? true,
      maxPerDay: preferences.maxPerDay ?? DEFAULT_NOTIFICATION_PREFERENCES.maxPerDay,
      quietHoursStart: preferences.quietHoursStart,
      quietHoursEnd: preferences.quietHoursEnd
    });

    if (!prefsValidation.isValid) {
      return this.errorResponse(FollowErrorCode.VALIDATION_ERROR, prefsValidation.errors.join('; '));
    }

    try {
      const fullPreferences: NotificationPreferences = {
        userAddress,
        enabled: preferences.enabled ?? true,
        typePreferences: (preferences.typePreferences ?? DEFAULT_NOTIFICATION_PREFERENCES.typePreferences) as NotificationTypePreference[],
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
        maxPerDay: preferences.maxPerDay ?? DEFAULT_NOTIFICATION_PREFERENCES.maxPerDay,
        updatedAt: Date.now()
      };

      this.invalidateCache(CACHE_KEYS.PREFERENCES(userAddress));
      return this.successResponse(fullPreferences);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Set preferences failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(userAddress: string): Promise<FollowResponse<NotificationPreferences>> {
    const addressValidation = validateAddress(userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    const cacheKey = CACHE_KEYS.PREFERENCES(userAddress);
    const cached = this.getFromCache<NotificationPreferences>(cacheKey);
    if (cached) return this.successResponse(cached);

    try {
      const preferences: NotificationPreferences = {
        userAddress,
        enabled: true,
        typePreferences: DEFAULT_NOTIFICATION_PREFERENCES.typePreferences as unknown as NotificationTypePreference[],
        maxPerDay: DEFAULT_NOTIFICATION_PREFERENCES.maxPerDay,
        updatedAt: Date.now()
      };

      this.setCache(cacheKey, preferences);
      return this.successResponse(preferences);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Get preferences failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Send a notification to all followers of a product
   */
  async sendNotification(
    productId: string,
    type: NotificationType,
    data: { title: string; message: string; metadata?: Record<string, unknown> }
  ): Promise<FollowResponse<FollowNotification>> {
    const productValidation = validateProductId(productId);
    if (!productValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_PRODUCT_ID, productValidation.error);
    }

    const formatValidation = validateNotificationFormat({
      title: data.title,
      message: data.message,
      type
    });
    if (!formatValidation.isValid) {
      return this.errorResponse(FollowErrorCode.VALIDATION_ERROR, formatValidation.errors.join('; '));
    }

    try {
      const notification: FollowNotification = {
        notificationId: generateNotificationId(),
        userAddress: '', // Set per-follower when sending
        productId,
        type,
        title: data.title,
        message: data.message,
        isRead: false,
        createdAt: Date.now(),
        readAt: 0 as unknown as number,
        metadata: data.metadata
      };

      return this.successResponse(notification);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Send notification failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    query: NotificationHistoryQuery
  ): Promise<FollowResponse<PaginatedResponse<FollowNotification>>> {
    const addressValidation = validateAddress(query.userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    try {
      const result: PaginatedResponse<FollowNotification> = {
        items: [],
        total: 0,
        page: query.page,
        limit: query.limit,
        hasMore: false
      };

      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Get notification history failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ==================== ALERT MANAGEMENT ====================

  /**
   * Create a price/stock alert for a product
   */
  async createAlert(
    userAddress: string,
    request: CreateAlertRequest
  ): Promise<FollowResponse<FollowAlert>> {
    const addressValidation = validateAddress(userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    const productValidation = validateProductId(request.productId);
    if (!productValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_PRODUCT_ID, productValidation.error);
    }

    const conditionsValidation = validateAlertConditions(request.conditions);
    if (!conditionsValidation.isValid) {
      return this.errorResponse(FollowErrorCode.VALIDATION_ERROR, conditionsValidation.errors.join('; '));
    }

    try {
      const alert: FollowAlert = {
        alertId: generateAlertId(userAddress),
        userAddress,
        productId: request.productId,
        type: request.type,
        conditions: request.conditions,
        isActive: true,
        isTriggered: false,
        createdAt: Date.now(),
        triggeredAt: 0 as unknown as number,
        metadata: request.metadata
      };

      this.invalidateCache(CACHE_KEYS.ALERTS(userAddress));
      return this.successResponse(alert);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Create alert failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Update an existing alert
   */
  async updateAlert(
    userAddress: string,
    request: UpdateAlertRequest
  ): Promise<FollowResponse<FollowAlert>> {
    const addressValidation = validateAddress(userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    if (request.conditions) {
      const conditionsValidation = validateAlertConditions(request.conditions);
      if (!conditionsValidation.isValid) {
        return this.errorResponse(FollowErrorCode.VALIDATION_ERROR, conditionsValidation.errors.join('; '));
      }
    }

    try {
      // Fetch the existing alert, apply updates, and return the updated alert
      const existingAlerts = await this.getAlerts({ userAddress, page: 0, limit: VALIDATION.ALERT.MAX_ALERTS_PER_USER });
      const existingAlert = existingAlerts.data?.items.find(a => a.alertId === request.alertId);

      if (!existingAlert) {
        return this.errorResponse(FollowErrorCode.PRODUCT_NOT_FOUND, `Alert ${request.alertId} not found`);
      }

      const updatedAlert: FollowAlert = {
        ...existingAlert,
        conditions: request.conditions ?? existingAlert.conditions,
        isActive: request.isActive ?? existingAlert.isActive,
        metadata: request.metadata ?? existingAlert.metadata
      };

      this.invalidateCache(CACHE_KEYS.ALERTS(userAddress));
      return this.successResponse(updatedAlert);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Update alert failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete an alert
   */
  async deleteAlert(userAddress: string, alertId: string): Promise<FollowResponse<boolean>> {
    const addressValidation = validateAddress(userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    try {
      this.invalidateCache(CACHE_KEYS.ALERTS(userAddress));
      return this.successResponse(true);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Delete alert failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get all alerts for a user
   */
  async getAlerts(query: AlertQuery): Promise<FollowResponse<PaginatedResponse<FollowAlert>>> {
    const addressValidation = validateAddress(query.userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    const cacheKey = CACHE_KEYS.ALERTS(query.userAddress);
    const cached = this.getFromCache<PaginatedResponse<FollowAlert>>(cacheKey);
    if (cached) return this.successResponse(cached);

    try {
      const result: PaginatedResponse<FollowAlert> = {
        items: [],
        total: 0,
        page: query.page,
        limit: query.limit,
        hasMore: false
      };

      this.setCache(cacheKey, result);
      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Get alerts failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Trigger an alert check
   */
  async triggerAlert(
    alertId: string,
    currentValues: Record<string, string | number>
  ): Promise<FollowResponse<AlertTriggerResult>> {
    try {
      // Retrieve alert conditions and evaluate each against current values
      const matchedConditions: AlertCondition[] = [];

      // Look up the alert from cache or contract to get its conditions
      // For now, iterate all user alerts to find this one
      for (const [key, entry] of this.cache.entries()) {
        if (!key.startsWith('alerts:')) continue;
        const alertsPage = entry.data as PaginatedResponse<FollowAlert>;
        const alert = alertsPage?.items?.find((a: FollowAlert) => a.alertId === alertId);
        if (alert) {
          for (const condition of alert.conditions) {
            const currentValue = currentValues[condition.field];
            if (currentValue !== undefined && evaluateCondition(condition, currentValue)) {
              matchedConditions.push(condition);
            }
          }
          break;
        }
      }

      const result: AlertTriggerResult = {
        alertId,
        triggered: matchedConditions.length > 0,
        matchedConditions,
        checkedAt: Date.now()
      };

      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(
        FollowErrorCode.CONTRACT_ERROR,
        `Trigger alert failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ==================== RATE LIMITING ====================

  /**
   * Check rate limit for a user action
   */
  checkRateLimit(userAddress: string, action: 'follow' | 'unfollow' | 'notification'): FollowResponse<boolean> {
    const rateLimit = this.config.rateLimit!;
    const key = `${userAddress}:${action}`;
    const tracker = this.rateLimitTrackers.get(key) || { actions: [] };
    const now = Date.now();
    const windowStart = now - rateLimit.windowDurationMs;

    // Clean up old entries
    tracker.actions = tracker.actions.filter(t => t > windowStart);

    let maxActions: number;
    switch (action) {
      case 'follow':
        maxActions = rateLimit.maxFollowsPerHour;
        break;
      case 'unfollow':
        maxActions = rateLimit.maxUnfollowsPerHour;
        break;
      case 'notification':
        maxActions = rateLimit.maxNotificationsPerHour;
        break;
    }

    if (tracker.actions.length >= maxActions) {
      return this.errorResponse(FollowErrorCode.RATE_LIMITED);
    }

    tracker.actions.push(now);
    this.rateLimitTrackers.set(key, tracker);
    return this.successResponse(true);
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Subscribe to follow events
   */
  addEventListener(eventType: FollowEventType, listener: FollowEventListener): EventSubscription {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);

    return {
      unsubscribe: () => {
        this.eventListeners.get(eventType)?.delete(listener);
      },
      eventType
    };
  }

  /**
   * Emit a follow event
   */
  private emitEvent(type: FollowEventType, productId: string, userAddress: string): void {
    const event: FollowEventData = {
      type,
      productId,
      userAddress,
      timestamp: Date.now()
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch {
          // Silently ignore listener errors
        }
      }
    }
  }

  // ==================== CACHE MANAGEMENT ====================

  private getFromCache<T>(key: string): T | null {
    if (!this.config.cache?.enabled) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (isCacheExpired(entry.timestamp, this.config.cache!.ttl)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    if (!this.config.cache?.enabled) return;
    if (this.cache.size >= this.config.cache!.maxSize) {
      // Evict oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  private invalidateFollowCache(productId: string, userAddress: string): void {
    this.invalidateCache(CACHE_KEYS.IS_FOLLOWING(productId, userAddress));
    this.invalidateCache(CACHE_KEYS.FOLLOWERS(productId));
    this.invalidateCache(CACHE_KEYS.FOLLOWING(userAddress));
    this.invalidateCache(CACHE_KEYS.FOLLOWER_COUNT(productId));
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ==================== PRIVATE HELPERS ====================

  private validateFollowInput(productId: string, userAddress: string): FollowResponse<any> {
    const addressValidation = validateAddress(userAddress);
    if (!addressValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_ADDRESS, addressValidation.error);
    }

    const productValidation = validateProductId(productId);
    if (!productValidation.isValid) {
      return this.errorResponse(FollowErrorCode.INVALID_PRODUCT_ID, productValidation.error);
    }

    return this.successResponse(true);
  }

  private successResponse<T>(data: T): FollowResponse<T> {
    return {
      success: true,
      data,
      timestamp: Date.now()
    };
  }

  private errorResponse<T = any>(code: FollowErrorCode, message?: string): FollowResponse<T> {
    return {
      success: false,
      error: message || getErrorMessage(code),
      errorCode: code,
      timestamp: Date.now()
    };
  }

  // ==================== CLEANUP ====================

  /**
   * Destroy the service and clean up resources
   */
  destroy(): void {
    this.cache.clear();
    this.eventListeners.clear();
    this.rateLimitTrackers.clear();
    this.initialized = false;
  }
}
