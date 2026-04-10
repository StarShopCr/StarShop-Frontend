import {
  BoostConfig,
  Boost,
  BoostStatus,
  BoostErrorCode,
  BoostError,
  VisibilityLevel,
  SlotType,
  BoostCostEstimate,
  CostBreakdownItem,
  BoostId,
  ProductId,
  UserAddress
} from '../types/boost.types';
import {
  VALIDATION,
  VISIBILITY_TIERS,
  SLOT_CONFIG,
  ERROR_MESSAGES,
  FEE_CALCULATION
} from '../constants/boost.constants';

// ==================== VALIDATION UTILITIES ====================

export function validateAddress(address: string): boolean {
  return (
    typeof address === 'string' &&
    address.length >= VALIDATION.ADDRESS.MIN_LENGTH &&
    address.length <= VALIDATION.ADDRESS.MAX_LENGTH &&
    VALIDATION.ADDRESS.PATTERN.test(address)
  );
}

export function validateProductId(productId: string): boolean {
  return (
    typeof productId === 'string' &&
    productId.length >= VALIDATION.PRODUCT_ID.MIN_LENGTH &&
    productId.length <= VALIDATION.PRODUCT_ID.MAX_LENGTH &&
    VALIDATION.PRODUCT_ID.PATTERN.test(productId)
  );
}

export function validateBoostConfig(config: BoostConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.productId || !validateProductId(config.productId as string)) {
    errors.push('Invalid product ID');
  }

  if (!config.visibilityLevel || !Object.values(VisibilityLevel).includes(config.visibilityLevel)) {
    errors.push('Invalid visibility level');
  }

  if (config.slotType && !Object.values(SlotType).includes(config.slotType)) {
    errors.push('Invalid slot type');
  }

  if (
    typeof config.duration !== 'number' ||
    config.duration < VALIDATION.BOOST.DURATION.MIN ||
    config.duration > VALIDATION.BOOST.DURATION.MAX
  ) {
    errors.push(`Duration must be between ${VALIDATION.BOOST.DURATION.MIN} and ${VALIDATION.BOOST.DURATION.MAX} seconds`);
  }

  if (
    typeof config.budget !== 'number' ||
    config.budget < VALIDATION.BOOST.BUDGET.MIN ||
    config.budget > VALIDATION.BOOST.BUDGET.MAX
  ) {
    errors.push(`Budget must be between ${VALIDATION.BOOST.BUDGET.MIN} and ${VALIDATION.BOOST.BUDGET.MAX}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateSlotDuration(duration: number): boolean {
  return (
    typeof duration === 'number' &&
    duration >= VALIDATION.SLOT.DURATION.MIN &&
    duration <= VALIDATION.SLOT.DURATION.MAX
  );
}

// ==================== COST CALCULATION ====================

export function calculateBoostCost(
  visibilityLevel: VisibilityLevel,
  duration: number,
  slotType?: SlotType
): BoostCostEstimate {
  const tier = VISIBILITY_TIERS[visibilityLevel];
  const durationHours = duration / 3600;

  const baseCost = tier.costPerHour * durationHours;
  const breakdown: CostBreakdownItem[] = [
    {
      label: 'Visibility Boost',
      amount: baseCost,
      description: `${tier.level} visibility for ${durationHours.toFixed(1)} hours`
    }
  ];

  let slotCost = 0;
  if (slotType) {
    const slotConfig = SLOT_CONFIG[slotType];
    slotCost = slotConfig.basePrice * durationHours;
    breakdown.push({
      label: 'Slot Reservation',
      amount: slotCost,
      description: `${slotType} slot for ${durationHours.toFixed(1)} hours`
    });
  }

  const subtotal = baseCost + slotCost;
  const platformFee = subtotal * (FEE_CALCULATION.PLATFORM_FEE_PERCENT / 100);
  breakdown.push({
    label: 'Platform Fee',
    amount: platformFee,
    description: `${FEE_CALCULATION.PLATFORM_FEE_PERCENT}% platform fee`
  });

  return {
    baseCost,
    slotCost,
    visibilityMultiplier: tier.multiplier,
    totalCost: subtotal + platformFee,
    duration,
    breakdown
  };
}

// ==================== STATUS UTILITIES ====================

export function isBoostActive(boost: Boost): boolean {
  return boost.status === BoostStatus.ACTIVE && Date.now() / 1000 < boost.endTime;
}

export function isBoostExpired(boost: Boost): boolean {
  return boost.status === BoostStatus.EXPIRED || Date.now() / 1000 >= boost.endTime;
}

export function canActivateBoost(boost: Boost): boolean {
  return boost.status === BoostStatus.PENDING || boost.status === BoostStatus.PAUSED;
}

export function canCancelBoost(boost: Boost): boolean {
  return boost.status === BoostStatus.PENDING ||
    boost.status === BoostStatus.ACTIVE ||
    boost.status === BoostStatus.PAUSED;
}

export function getTimeRemaining(boost: Boost): number {
  if (!isBoostActive(boost)) return 0;
  return Math.max(0, boost.endTime - Math.floor(Date.now() / 1000));
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '0m';
}

// ==================== CACHE UTILITIES ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function isCacheExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

export function generateCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}

// ==================== ERROR UTILITIES ====================

export function createBoostError(code: BoostErrorCode, details?: Record<string, unknown>): BoostError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    details
  };
}

export function mapContractError(error: unknown): BoostError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('not found')) {
      return createBoostError(BoostErrorCode.BOOST_NOT_FOUND);
    }
    if (message.includes('unauthorized') || message.includes('permission')) {
      return createBoostError(BoostErrorCode.UNAUTHORIZED);
    }
    if (message.includes('insufficient') || message.includes('funds')) {
      return createBoostError(BoostErrorCode.INSUFFICIENT_FUNDS);
    }
    if (message.includes('timeout')) {
      return createBoostError(BoostErrorCode.TIMEOUT_ERROR);
    }
    return createBoostError(BoostErrorCode.CONTRACT_ERROR, { originalMessage: error.message });
  }
  return createBoostError(BoostErrorCode.CONTRACT_ERROR);
}

export function getErrorMessage(code: BoostErrorCode): string {
  return ERROR_MESSAGES[code];
}

// ==================== RETRY UTILITIES ====================

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ==================== CTR CALCULATION ====================

export function calculateCTR(impressions: number, clicks: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

export function calculateROI(spent: number, revenue: number): number {
  if (spent === 0) return 0;
  return ((revenue - spent) / spent) * 100;
}
