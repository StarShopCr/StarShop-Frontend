/**
 * Promotional Boost Contract Service for StarShop Frontend
 * Staff-level implementation of promotional boosts, visibility multipliers, slot reservations, and payments.
 */

import type {
  BoostConfig,
  CreateBoostParams,
  UpdateBoostParams,
  BoostResponse,
} from './types/boost.types';
import type {
  VisibilityLevel,
  VisibilityStats,
} from './types/visibility.types';
import type {
  BoostCostParams,
} from './types/payments.types';
import {
  BOOST_STATUS,
  VISIBILITY_LEVELS,
  VISIBILITY_MULTIPLIERS,
  SLOT_TYPES,
  MAX_SLOTS_PER_TYPE,
  PAYMENT_STATUS,
  BOOST_ERROR_CODES,
  ERROR_MESSAGES,
} from './constants/boost.constants';
import {
  isValidStellarAddress,
  generateTxHash,
  generateId,
  calculateBoostCost,
  isValidSlotType,
} from './utils/boost.utils';

interface SlotRecord {
  slotId: string;
  slotType: string;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';
  expiresAt: number;
  boostId?: string;
}

export class PromotionalBoostService {
  private boosts: Map<string, BoostConfig> = new Map();
  private productStats: Map<string, VisibilityStats> = new Map();
  private slots: Map<string, SlotRecord> = new Map();

  private timeProvider: () => number = () => Date.now();

  constructor() {
    this.initializeSlots();
  }

  /**
   * Initializes slot pool based on MAX_SLOTS_PER_TYPE.
   */
  private initializeSlots(): void {
    this.slots.clear();
    for (const [slotType, max] of Object.entries(MAX_SLOTS_PER_TYPE)) {
      for (let i = 1; i <= max; i++) {
        const slotId = `${slotType.toLowerCase()}_slot_${i}`;
        this.slots.set(slotId, {
          slotId,
          slotType,
          status: 'AVAILABLE',
          expiresAt: 0,
        });
      }
    }
  }

  /**
   * Override time provider for deterministic testing of temporal logic.
   */
  public setTimeProvider(provider: () => number): void {
    this.timeProvider = provider;
  }

  /**
   * Resets all internal in-memory stores.
   */
  public resetState(): void {
    this.boosts.clear();
    this.productStats.clear();
    this.initializeSlots();
    this.timeProvider = () => Date.now();
  }

  // ===========================================================================
  // 1. BOOST MANAGEMENT
  // ===========================================================================

  /**
   * Creates a new promotional boost request.
   */
  public async createBoost(config: CreateBoostParams): Promise<BoostResponse<BoostConfig>> {
    const now = this.timeProvider();

    // Product ID validation
    if (!config.productId || typeof config.productId !== 'string' || !config.productId.trim()) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_PRODUCT_ID,
          message: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        },
      };
    }
    const productId = config.productId.trim();

    // Seller address validation
    if (!isValidStellarAddress(config.seller)) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_SELLER_ADDRESS,
          message: ERROR_MESSAGES.INVALID_SELLER_ADDRESS,
        },
      };
    }
    const seller = config.seller.trim();

    // Visibility level validation
    if (!config.level || !VISIBILITY_LEVELS[config.level]) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_VISIBILITY_LEVEL,
          message: ERROR_MESSAGES.INVALID_VISIBILITY_LEVEL,
        },
      };
    }
    const level = config.level;

    // Duration validation
    if (!config.durationSeconds || typeof config.durationSeconds !== 'number' || config.durationSeconds <= 0) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_DURATION,
          message: ERROR_MESSAGES.INVALID_DURATION,
        },
      };
    }
    const durationSeconds = Math.floor(config.durationSeconds);

    // Slot type validation
    const slotType = config.slotType ? config.slotType.trim() : SLOT_TYPES.SIDEBAR_BANNER;
    if (!isValidSlotType(slotType)) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_SLOT_TYPE,
          message: ERROR_MESSAGES.INVALID_SLOT_TYPE,
        },
      };
    }

    // Reserve a slot for the boost
    const slotRes = await this.reserveSlot(slotType, durationSeconds);
    if (!slotRes.success || !slotRes.data) {
      return {
        success: false,
        error: slotRes.error,
      };
    }
    const slotId = slotRes.data;

    const cost = calculateBoostCost(level, durationSeconds, slotType);
    const boostId = generateId('boost');
    const txHash = generateTxHash();

    const boost: BoostConfig = {
      boostId,
      productId,
      seller,
      level,
      status: BOOST_STATUS.CREATED,
      durationSeconds,
      slotType,
      slotId,
      cost,
      paymentStatus: PAYMENT_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    // Attach boostId to slot record
    const slot = this.slots.get(slotId);
    if (slot) {
      slot.boostId = boostId;
    }

    this.boosts.set(boostId, boost);

    // Auto-activate if requested and cost is 0 (or bypass)
    if (config.autoActivate && cost === 0) {
      await this.activateBoost(boostId);
    }

    return {
      success: true,
      data: { ...boost },
      txHash,
    };
  }

  /**
   * Retrieves a boost by ID with automatic expiration check.
   */
  public async getBoost(boostId: string): Promise<BoostResponse<BoostConfig>> {
    if (!boostId || typeof boostId !== 'string') {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.BOOST_NOT_FOUND,
          message: ERROR_MESSAGES.BOOST_NOT_FOUND,
        },
      };
    }

    const boost = this.boosts.get(boostId.trim());
    if (!boost) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.BOOST_NOT_FOUND,
          message: ERROR_MESSAGES.BOOST_NOT_FOUND,
        },
      };
    }

    // Auto-expire check
    const now = this.timeProvider();
    if (boost.status === BOOST_STATUS.ACTIVE && boost.endTime && now >= boost.endTime) {
      boost.status = BOOST_STATUS.EXPIRED;
      boost.updatedAt = now;
      if (boost.slotId) {
        await this.releaseSlot(boost.slotId);
      }
    }

    return {
      success: true,
      data: { ...boost },
    };
  }

  /**
   * Updates boost parameters (level, extended duration, slot type).
   */
  public async updateBoost(boostId: string, updates: UpdateBoostParams): Promise<BoostResponse<BoostConfig>> {
    const boostRes = await this.getBoost(boostId);
    if (!boostRes.success || !boostRes.data) {
      return {
        success: false,
        error: boostRes.error,
      };
    }

    const boost = this.boosts.get(boostId.trim())!;
    if (boost.status === BOOST_STATUS.CANCELLED) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.BOOST_ALREADY_CANCELLED,
          message: ERROR_MESSAGES.BOOST_ALREADY_CANCELLED,
        },
      };
    }
    if (boost.status === BOOST_STATUS.EXPIRED) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.BOOST_EXPIRED,
          message: ERROR_MESSAGES.BOOST_EXPIRED,
        },
      };
    }

    const now = this.timeProvider();

    if (updates.level) {
      if (!VISIBILITY_LEVELS[updates.level]) {
        return {
          success: false,
          error: {
            code: BOOST_ERROR_CODES.INVALID_VISIBILITY_LEVEL,
            message: ERROR_MESSAGES.INVALID_VISIBILITY_LEVEL,
          },
        };
      }
      boost.level = updates.level;
    }

    if (updates.extendDurationSeconds) {
      if (updates.extendDurationSeconds <= 0) {
        return {
          success: false,
          error: {
            code: BOOST_ERROR_CODES.INVALID_DURATION,
            message: ERROR_MESSAGES.INVALID_DURATION,
          },
        };
      }
      boost.durationSeconds += Math.floor(updates.extendDurationSeconds);
      if (boost.endTime) {
        boost.endTime += Math.floor(updates.extendDurationSeconds) * 1000;
      }
    }

    if (updates.slotType && updates.slotType !== boost.slotType) {
      if (!isValidSlotType(updates.slotType)) {
        return {
          success: false,
          error: {
            code: BOOST_ERROR_CODES.INVALID_SLOT_TYPE,
            message: ERROR_MESSAGES.INVALID_SLOT_TYPE,
          },
        };
      }
      // Re-reserve slot
      const newSlot = await this.reserveSlot(updates.slotType, boost.durationSeconds);
      if (!newSlot.success || !newSlot.data) {
        return {
          success: false,
          error: newSlot.error,
        };
      }
      if (boost.slotId) {
        await this.releaseSlot(boost.slotId);
      }
      boost.slotType = updates.slotType;
      boost.slotId = newSlot.data;
    }

    boost.cost = calculateBoostCost(boost.level, boost.durationSeconds, boost.slotType);
    boost.updatedAt = now;

    return {
      success: true,
      data: { ...boost },
      txHash: generateTxHash(),
    };
  }

  /**
   * Cancels a promotional boost and releases its reserved slot.
   */
  public async cancelBoost(boostId: string): Promise<BoostResponse<boolean>> {
    const boostRes = await this.getBoost(boostId);
    if (!boostRes.success || !boostRes.data) {
      return {
        success: false,
        error: boostRes.error,
      };
    }

    const boost = this.boosts.get(boostId.trim())!;
    if (boost.status === BOOST_STATUS.CANCELLED) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.BOOST_ALREADY_CANCELLED,
          message: ERROR_MESSAGES.BOOST_ALREADY_CANCELLED,
        },
      };
    }

    const now = this.timeProvider();
    boost.status = BOOST_STATUS.CANCELLED;
    boost.updatedAt = now;

    if (boost.slotId) {
      await this.releaseSlot(boost.slotId);
    }

    // Downgrade visibility if this was the active boost
    const stats = this.productStats.get(boost.productId);
    if (stats && stats.isBoosted) {
      stats.isBoosted = false;
      stats.currentLevel = VISIBILITY_LEVELS.STANDARD;
      stats.impressionsMultiplier = VISIBILITY_MULTIPLIERS.STANDARD;
    }

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  /**
   * Activates a paid promotional boost.
   */
  public async activateBoost(boostId: string): Promise<BoostResponse<boolean>> {
    const boostRes = await this.getBoost(boostId);
    if (!boostRes.success || !boostRes.data) {
      return {
        success: false,
        error: boostRes.error,
      };
    }

    const boost = this.boosts.get(boostId.trim())!;
    if (boost.status === BOOST_STATUS.ACTIVE) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.BOOST_ALREADY_ACTIVE,
          message: ERROR_MESSAGES.BOOST_ALREADY_ACTIVE,
        },
      };
    }

    if (boost.status === BOOST_STATUS.CANCELLED) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.BOOST_ALREADY_CANCELLED,
          message: ERROR_MESSAGES.BOOST_ALREADY_CANCELLED,
        },
      };
    }

    if (boost.paymentStatus !== PAYMENT_STATUS.PAID && boost.cost > 0) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.PAYMENT_REQUIRED,
          message: ERROR_MESSAGES.PAYMENT_REQUIRED,
        },
      };
    }

    const now = this.timeProvider();
    boost.status = BOOST_STATUS.ACTIVE;
    boost.startTime = now;
    boost.endTime = now + boost.durationSeconds * 1000;
    boost.updatedAt = now;

    // Mark slot as OCCUPIED
    if (boost.slotId) {
      const slot = this.slots.get(boost.slotId);
      if (slot) {
        slot.status = 'OCCUPIED';
        slot.expiresAt = boost.endTime;
      }
    }

    // Update product visibility stats
    const currentStats = this.productStats.get(boost.productId) || {
      productId: boost.productId,
      currentLevel: VISIBILITY_LEVELS.STANDARD,
      isBoosted: false,
      impressionsMultiplier: 1.0,
      totalBoostsCount: 0,
    };

    currentStats.currentLevel = boost.level;
    currentStats.isBoosted = true;
    currentStats.boostExpiresAt = boost.endTime;
    currentStats.impressionsMultiplier = VISIBILITY_MULTIPLIERS[boost.level];
    currentStats.totalBoostsCount += 1;
    currentStats.lastBoostedAt = now;

    this.productStats.set(boost.productId, currentStats);

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  // ===========================================================================
  // 2. VISIBILITY MANAGEMENT
  // ===========================================================================

  /**
   * Manually sets visibility level for a product.
   */
  public async setVisibilityLevel(productId: string, level: VisibilityLevel): Promise<BoostResponse<boolean>> {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_PRODUCT_ID,
          message: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        },
      };
    }

    if (!level || !VISIBILITY_LEVELS[level]) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_VISIBILITY_LEVEL,
          message: ERROR_MESSAGES.INVALID_VISIBILITY_LEVEL,
        },
      };
    }

    const cleanProductId = productId.trim();
    const stats = this.productStats.get(cleanProductId) || {
      productId: cleanProductId,
      currentLevel: VISIBILITY_LEVELS.STANDARD,
      isBoosted: false,
      impressionsMultiplier: 1.0,
      totalBoostsCount: 0,
    };

    stats.currentLevel = level;
    stats.impressionsMultiplier = VISIBILITY_MULTIPLIERS[level];
    if (level === VISIBILITY_LEVELS.STANDARD) {
      stats.isBoosted = false;
      stats.boostExpiresAt = undefined;
    }
    this.productStats.set(cleanProductId, stats);

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  /**
   * Retrieves active visibility level of a product.
   */
  public async getVisibilityLevel(productId: string): Promise<VisibilityLevel> {
    if (!productId) return VISIBILITY_LEVELS.STANDARD;
    const stats = await this.getVisibilityStats(productId);
    return stats.currentLevel;
  }

  /**
   * Rapidly applies a visibility boost to a product.
   */
  public async boostVisibility(productId: string, duration: number): Promise<BoostResponse<boolean>> {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_PRODUCT_ID,
          message: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        },
      };
    }

    if (!duration || duration <= 0) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_DURATION,
          message: ERROR_MESSAGES.INVALID_DURATION,
        },
      };
    }

    const cleanProductId = productId.trim();
    const now = this.timeProvider();
    const stats = this.productStats.get(cleanProductId) || {
      productId: cleanProductId,
      currentLevel: VISIBILITY_LEVELS.STANDARD,
      isBoosted: false,
      impressionsMultiplier: 1.0,
      totalBoostsCount: 0,
    };

    stats.currentLevel = VISIBILITY_LEVELS.FEATURED;
    stats.isBoosted = true;
    stats.boostExpiresAt = now + duration * 1000;
    stats.impressionsMultiplier = VISIBILITY_MULTIPLIERS.FEATURED;
    stats.totalBoostsCount += 1;
    stats.lastBoostedAt = now;

    this.productStats.set(cleanProductId, stats);

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  /**
   * Retrieves full visibility stats for a product with automatic expiration handling.
   */
  public async getVisibilityStats(productId: string): Promise<VisibilityStats> {
    const cleanId = (productId || '').trim();
    const now = this.timeProvider();
    const stats = this.productStats.get(cleanId);

    if (!stats) {
      return {
        productId: cleanId,
        currentLevel: VISIBILITY_LEVELS.STANDARD,
        isBoosted: false,
        impressionsMultiplier: 1.0,
        totalBoostsCount: 0,
      };
    }

    // Check expiration
    if (stats.isBoosted && stats.boostExpiresAt && now >= stats.boostExpiresAt) {
      stats.isBoosted = false;
      stats.currentLevel = VISIBILITY_LEVELS.STANDARD;
      stats.impressionsMultiplier = VISIBILITY_MULTIPLIERS.STANDARD;
      stats.boostExpiresAt = undefined;
    }

    return { ...stats };
  }

  // ===========================================================================
  // 3. SLOT MANAGEMENT
  // ===========================================================================

  /**
   * Reserves an available promotional slot.
   */
  public async reserveSlot(slotType: string, duration: number): Promise<BoostResponse<string>> {
    if (!slotType || !isValidSlotType(slotType)) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_SLOT_TYPE,
          message: ERROR_MESSAGES.INVALID_SLOT_TYPE,
        },
      };
    }

    if (!duration || duration <= 0) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INVALID_DURATION,
          message: ERROR_MESSAGES.INVALID_DURATION,
        },
      };
    }

    const now = this.timeProvider();

    // Find first available slot of type
    for (const slot of Array.from(this.slots.values())) {
      if (slot.slotType === slotType) {
        // Auto-expire slot if past expiration
        if (slot.status !== 'AVAILABLE' && slot.expiresAt > 0 && now >= slot.expiresAt) {
          slot.status = 'AVAILABLE';
          slot.expiresAt = 0;
          slot.boostId = undefined;
        }

        if (slot.status === 'AVAILABLE') {
          slot.status = 'RESERVED';
          slot.expiresAt = now + duration * 1000;
          return {
            success: true,
            data: slot.slotId,
            txHash: generateTxHash(),
          };
        }
      }
    }

    return {
      success: false,
      error: {
        code: BOOST_ERROR_CODES.SLOT_NOT_AVAILABLE,
        message: ERROR_MESSAGES.SLOT_NOT_AVAILABLE,
      },
    };
  }

  /**
   * Retrieves list of currently available slot IDs for a slot type.
   */
  public async getAvailableSlots(slotType: string): Promise<string[]> {
    if (!slotType || !isValidSlotType(slotType)) return [];
    const now = this.timeProvider();
    const available: string[] = [];

    for (const slot of Array.from(this.slots.values())) {
      if (slot.slotType === slotType) {
        if (slot.status !== 'AVAILABLE' && slot.expiresAt > 0 && now >= slot.expiresAt) {
          slot.status = 'AVAILABLE';
          slot.expiresAt = 0;
          slot.boostId = undefined;
        }
        if (slot.status === 'AVAILABLE') {
          available.push(slot.slotId);
        }
      }
    }

    return available;
  }

  /**
   * Releases a reserved or occupied slot back to available state.
   */
  public async releaseSlot(slotId: string): Promise<BoostResponse<boolean>> {
    if (!slotId || typeof slotId !== 'string') {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.SLOT_NOT_FOUND,
          message: ERROR_MESSAGES.SLOT_NOT_FOUND,
        },
      };
    }

    const slot = this.slots.get(slotId.trim());
    if (!slot) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.SLOT_NOT_FOUND,
          message: ERROR_MESSAGES.SLOT_NOT_FOUND,
        },
      };
    }

    slot.status = 'AVAILABLE';
    slot.expiresAt = 0;
    slot.boostId = undefined;

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  /**
   * Retrieves status of a slot ('AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'NOT_FOUND').
   */
  public async getSlotStatus(slotId: string): Promise<string> {
    if (!slotId) return 'NOT_FOUND';
    const slot = this.slots.get(slotId.trim());
    if (!slot) return 'NOT_FOUND';

    const now = this.timeProvider();
    if (slot.status !== 'AVAILABLE' && slot.expiresAt > 0 && now >= slot.expiresAt) {
      slot.status = 'AVAILABLE';
      slot.expiresAt = 0;
      slot.boostId = undefined;
    }

    return slot.status;
  }

  // ===========================================================================
  // 4. PAYMENT PROCESSING
  // ===========================================================================

  /**
   * Processes payment for a promotional boost.
   */
  public async processBoostPayment(boostId: string, amount: number): Promise<BoostResponse<boolean>> {
    const boostRes = await this.getBoost(boostId);
    if (!boostRes.success || !boostRes.data) {
      return {
        success: false,
        error: boostRes.error,
      };
    }

    const boost = this.boosts.get(boostId.trim())!;
    if (boost.paymentStatus === PAYMENT_STATUS.PAID) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.PAYMENT_ALREADY_PROCESSED,
          message: ERROR_MESSAGES.PAYMENT_ALREADY_PROCESSED,
        },
      };
    }

    if (amount < boost.cost) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.INSUFFICIENT_PAYMENT,
          message: ERROR_MESSAGES.INSUFFICIENT_PAYMENT,
        },
      };
    }

    boost.paymentStatus = PAYMENT_STATUS.PAID;
    boost.updatedAt = this.timeProvider();

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  /**
   * Returns current payment status for a boost.
   */
  public async getPaymentStatus(boostId: string): Promise<string> {
    const boostRes = await this.getBoost(boostId);
    if (!boostRes.success || !boostRes.data) {
      return BOOST_ERROR_CODES.BOOST_NOT_FOUND;
    }
    return boostRes.data.paymentStatus;
  }

  /**
   * Refunds payment for an unactivated or cancelled boost.
   */
  public async refundBoostPayment(boostId: string): Promise<BoostResponse<boolean>> {
    const boostRes = await this.getBoost(boostId);
    if (!boostRes.success || !boostRes.data) {
      return {
        success: false,
        error: boostRes.error,
      };
    }

    const boost = this.boosts.get(boostId.trim())!;
    if (boost.status === BOOST_STATUS.ACTIVE) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.CANNOT_REFUND_ACTIVE_BOOST,
          message: ERROR_MESSAGES.CANNOT_REFUND_ACTIVE_BOOST,
        },
      };
    }

    if (boost.paymentStatus !== PAYMENT_STATUS.PAID) {
      return {
        success: false,
        error: {
          code: BOOST_ERROR_CODES.PAYMENT_NOT_FOUND,
          message: ERROR_MESSAGES.PAYMENT_NOT_FOUND,
        },
      };
    }

    boost.paymentStatus = PAYMENT_STATUS.REFUNDED;
    boost.updatedAt = this.timeProvider();

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  /**
   * Calculates projected cost for boost configuration.
   */
  public async getBoostCost(config: BoostCostParams): Promise<number> {
    if (!config || !config.level || !config.durationSeconds) return 0;
    return calculateBoostCost(config.level, config.durationSeconds, config.slotType);
  }

  // ===========================================================================
  // TEST & AUDIT HELPERS
  // ===========================================================================

  public getRawBoosts(): BoostConfig[] {
    return Array.from(this.boosts.values()).map((b) => ({ ...b }));
  }
}
