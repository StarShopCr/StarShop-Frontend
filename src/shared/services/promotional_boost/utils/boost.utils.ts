import type { u32, u64 } from '@stellar/stellar-sdk';
import {
  VALIDATION,
  ERROR_TYPES,
  TIER_PRICING,
  PLATFORM_FEES,
  DURATION_DISCOUNTS,
  SUPPORTED_TOKENS,
} from '../constants/boost.constants';
import type {
  BoostData,
  BoostValidation,
  Address,
  BoostId,
  CreateBoostRequest,
  UpdateBoostRequest,
  BoostTier,
  BoostStatus,
} from '../types/boost.types';
import type {
  BoostCostCalculation,
  CostBreakdownItem,
  PaymentValidation,
  RefundValidation,
} from '../types/payments.types';
import type {
  VisibilityScoreResult,
  VisibilityScoreComponent,
} from '../types/visibility.types';
import { BoostStatus as BoostStatusEnum } from '../types/boost.types';

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const stellarAddressRegex = /^[G-ZA-Z2-7]{56}$/;
  return stellarAddressRegex.test(address);
}

/**
 * Validate contract address format
 */
export function isValidContractAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const contractAddressRegex = /^[C-ZA-Z2-7]{56}$/;
  return contractAddressRegex.test(address);
}

/**
 * Validate either a Stellar or contract address
 */
export function isValidAddress(address: string): boolean {
  return isValidStellarAddress(address) || isValidContractAddress(address);
}

/**
 * Validate boost ID
 */
export function isValidBoostId(boostId: any): boostId is u32 {
  return (
    typeof boostId === 'number' &&
    Number.isInteger(boostId) &&
    boostId >= 0 &&
    boostId <= 0xffffffff
  );
}

/**
 * Validate boost duration
 */
export function isValidDuration(durationSeconds: number): boolean {
  return (
    typeof durationSeconds === 'number' &&
    Number.isInteger(durationSeconds) &&
    durationSeconds >= VALIDATION.MIN_DURATION_SECONDS &&
    durationSeconds <= VALIDATION.MAX_DURATION_SECONDS
  );
}

/**
 * Validate boost amount
 */
export function isValidBoostAmount(amount: number): boolean {
  return (
    typeof amount === 'number' &&
    amount >= VALIDATION.MIN_BOOST_AMOUNT &&
    amount <= VALIDATION.MAX_BOOST_AMOUNT
  );
}

/**
 * Validate priority score
 */
export function isValidPriorityScore(score: number): boolean {
  return (
    typeof score === 'number' &&
    Number.isInteger(score) &&
    score >= VALIDATION.MIN_PRIORITY_SCORE &&
    score <= VALIDATION.MAX_PRIORITY_SCORE
  );
}

/**
 * Validate create boost request
 */
export function validateCreateBoostRequest(request: CreateBoostRequest): BoostValidation {
  if (!request) {
    return { isValid: false, error: 'Request is required' };
  }

  if (!isValidBoostId(request.targetId)) {
    return { isValid: false, error: 'Invalid target ID' };
  }

  if (!request.targetType) {
    return { isValid: false, error: 'Target type is required' };
  }

  if (!request.tier) {
    return { isValid: false, error: 'Boost tier is required' };
  }

  if (!isValidDuration(request.durationSeconds as number)) {
    return {
      isValid: false,
      error: `Duration must be between ${VALIDATION.MIN_DURATION_SECONDS} and ${VALIDATION.MAX_DURATION_SECONDS} seconds`,
    };
  }

  if (!isValidAddress(request.paymentToken)) {
    return { isValid: false, error: 'Invalid payment token address' };
  }

  if (request.priorityScore !== undefined && !isValidPriorityScore(request.priorityScore)) {
    return {
      isValid: false,
      error: `Priority score must be between ${VALIDATION.MIN_PRIORITY_SCORE} and ${VALIDATION.MAX_PRIORITY_SCORE}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate update boost request
 */
export function validateUpdateBoostRequest(request: UpdateBoostRequest): BoostValidation {
  if (!request) {
    return { isValid: false, error: 'Request is required' };
  }

  if (!isValidBoostId(request.boostId)) {
    return { isValid: false, error: 'Invalid boost ID' };
  }

  if (
    request.extensionSeconds !== undefined &&
    !isValidDuration(request.extensionSeconds as number)
  ) {
    return { isValid: false, error: 'Invalid extension duration' };
  }

  if (
    request.priorityScore !== undefined &&
    !isValidPriorityScore(request.priorityScore)
  ) {
    return { isValid: false, error: 'Invalid priority score' };
  }

  return { isValid: true };
}

/**
 * Calculate boost cost
 */
export function calculateBoostCost(
  tier: BoostTier,
  durationSeconds: number
): BoostCostCalculation {
  const tierConfig = TIER_PRICING[tier];
  const durationDays = durationSeconds / 86400;
  const baseCost = Math.floor(tierConfig.baseCostPerDay * durationDays);

  // Calculate duration discount
  let discountPercentage = 0;
  if (durationDays >= 90) {
    discountPercentage = DURATION_DISCOUNTS.QUARTER_DISCOUNT;
  } else if (durationDays >= 30) {
    discountPercentage = DURATION_DISCOUNTS.MONTH_DISCOUNT;
  } else if (durationDays >= 14) {
    discountPercentage = DURATION_DISCOUNTS.TWO_WEEK_DISCOUNT;
  } else if (durationDays >= 7) {
    discountPercentage = DURATION_DISCOUNTS.WEEK_DISCOUNT;
  }

  const discountAmount = Math.floor(baseCost * (discountPercentage / 100));
  const discountedCost = baseCost - discountAmount;

  // Calculate platform fee
  const rawFee = Math.floor((discountedCost * PLATFORM_FEES.FEE_BASIS_POINTS) / 10000);
  const platformFeeAmount = Math.min(
    Math.max(rawFee, PLATFORM_FEES.MIN_FEE),
    PLATFORM_FEES.MAX_FEE
  );

  const totalCost = discountedCost + platformFeeAmount;
  const netCost = discountedCost;

  const breakdown: CostBreakdownItem[] = [
    {
      description: `${tier} tier base cost (${durationDays.toFixed(1)} days)`,
      amount: baseCost,
      isFee: false,
      isDiscount: false,
    },
  ];

  if (discountAmount > 0) {
    breakdown.push({
      description: `Duration discount (${discountPercentage}%)`,
      amount: discountAmount,
      isFee: false,
      isDiscount: true,
    });
  }

  breakdown.push({
    description: `Platform fee (${PLATFORM_FEES.FEE_BASIS_POINTS / 100}%)`,
    amount: platformFeeAmount,
    isFee: true,
    isDiscount: false,
  });

  return {
    tier,
    durationSeconds,
    baseCost,
    tierMultiplier: tierConfig.visibilityMultiplier,
    durationMultiplier: 1 - discountPercentage / 100,
    platformFeePercentage: PLATFORM_FEES.FEE_BASIS_POINTS / 100,
    platformFeeAmount,
    discountAmount,
    discountPercentage,
    totalCost,
    netCost,
    breakdown,
  };
}

/**
 * Validate payment amount against calculated cost
 */
export function validatePaymentAmount(
  amount: number,
  tier: BoostTier,
  durationSeconds: number
): PaymentValidation {
  if (!isValidBoostAmount(amount)) {
    return {
      isValid: false,
      error: `Amount must be between ${VALIDATION.MIN_BOOST_AMOUNT} and ${VALIDATION.MAX_BOOST_AMOUNT} stroops`,
    };
  }

  const calculatedCost = calculateBoostCost(tier, durationSeconds);

  if (amount < calculatedCost.totalCost) {
    return {
      isValid: false,
      error: `Insufficient payment. Required: ${calculatedCost.totalCost}, provided: ${amount}`,
      calculatedCost,
    };
  }

  return {
    isValid: true,
    validatedAmount: amount,
    calculatedCost,
  };
}

/**
 * Validate refund eligibility
 */
export function validateRefundEligibility(
  boost: BoostData,
  currentTimestamp: number
): RefundValidation {
  // Check if boost is in a refundable state
  if (boost.status === BoostStatusEnum.CANCELLED) {
    return { isValid: false, error: 'Boost is already cancelled' };
  }

  if (boost.status === BoostStatusEnum.COMPLETED) {
    return { isValid: false, error: 'Completed boosts are not eligible for refund' };
  }

  if (boost.status === BoostStatusEnum.EXPIRED) {
    return { isValid: false, error: 'Expired boosts are not eligible for refund' };
  }

  // Check refund window
  const refundWindowEnd =
    Number(boost.createdAt) + VALIDATION.REFUND_ELIGIBILITY_WINDOW_SECONDS * 1000;

  if (currentTimestamp > refundWindowEnd) {
    return {
      isValid: false,
      error: 'Refund window has expired',
      timeRemainingSeconds: 0,
    };
  }

  const timeRemainingSeconds = Math.floor((refundWindowEnd - currentTimestamp) / 1000);

  // Calculate refundable amount based on time used
  const totalDuration = Number(boost.endTime) - Number(boost.startTime);
  const usedDuration = Math.max(0, currentTimestamp / 1000 - Number(boost.startTime));
  const usedFraction = totalDuration > 0 ? usedDuration / totalDuration : 0;
  const maxRefundableAmount = Math.floor(Number(boost.amountPaid) * (1 - usedFraction));

  return {
    isValid: true,
    maxRefundableAmount,
    timeRemainingSeconds,
  };
}

/**
 * Check if a token is supported for boost payments
 */
export function isTokenSupported(tokenAddress: string): boolean {
  const supportedList = Object.values(SUPPORTED_TOKENS);
  return supportedList.includes(tokenAddress as any);
}

/**
 * Calculate visibility score for a boost
 */
export function calculateVisibilityScore(
  tier: BoostTier,
  impressions: number,
  clicks: number,
  activeDurationSeconds: number
): VisibilityScoreResult {
  const tierConfig = TIER_PRICING[tier];

  // Base score from tier priority
  const baseScore = tierConfig.priorityScore;

  // Engagement bonus (CTR-based)
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const engagementBonus = Math.floor(ctr * 200); // up to 200 bonus points

  // Activity bonus (based on how long the boost has been active)
  const activeDays = activeDurationSeconds / 86400;
  const activityBonus = Math.min(Math.floor(activeDays * 10), 100); // up to 100 bonus points

  // Time decay factor (reduces score for very old boosts slightly)
  const timeDecayFactor = Math.max(0.8, 1 - activeDays * 0.001);

  const rawScore = (baseScore + engagementBonus + activityBonus) * timeDecayFactor;
  const finalScore = Math.min(Math.floor(rawScore), VALIDATION.MAX_PRIORITY_SCORE);

  const components: VisibilityScoreComponent[] = [
    {
      name: 'Tier Base Score',
      value: baseScore,
      weight: 0.6,
      contribution: Math.floor(baseScore * 0.6),
    },
    {
      name: 'Engagement Bonus',
      value: engagementBonus,
      weight: 0.3,
      contribution: Math.floor(engagementBonus * 0.3),
    },
    {
      name: 'Activity Bonus',
      value: activityBonus,
      weight: 0.1,
      contribution: Math.floor(activityBonus * 0.1),
    },
  ];

  return {
    baseScore,
    engagementBonus,
    activityBonus,
    timeDecayFactor,
    finalScore,
    components,
  };
}

/**
 * Format boost ID for display
 */
export function formatBoostId(boostId: u32): string {
  return `BOOST-${boostId.toString().padStart(8, '0')}`;
}

/**
 * Parse boost ID from display format
 */
export function parseBoostId(displayId: string): u32 {
  const cleanId = displayId.replace('BOOST-', '').replace(/^0+/, '') || '0';
  const id = parseInt(cleanId, 10);
  if (isNaN(id) || id < 0) {
    throw new Error('Invalid boost ID format');
  }
  return id as u32;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format amount in stroops to XLM
 */
export function formatAmountToXLM(amountStroops: number): string {
  const xlm = amountStroops / 10000000;
  return `${xlm.toFixed(2)} XLM`;
}

/**
 * Convert XLM to stroops
 */
export function xlmToStroops(xlm: number): number {
  return Math.floor(xlm * 10000000);
}

/**
 * Convert stroops to XLM
 */
export function stroopsToXLM(stroops: number): number {
  return stroops / 10000000;
}

/**
 * Check if boost is currently active
 */
export function isBoostActive(boost: BoostData, currentTimestamp: number): boolean {
  if (boost.status !== BoostStatusEnum.ACTIVE) return false;
  const nowSeconds = currentTimestamp / 1000;
  return nowSeconds >= Number(boost.startTime) && nowSeconds <= Number(boost.endTime);
}

/**
 * Check if boost has expired
 */
export function isBoostExpired(boost: BoostData, currentTimestamp: number): boolean {
  const nowSeconds = currentTimestamp / 1000;
  return nowSeconds > Number(boost.endTime);
}

/**
 * Calculate remaining time for a boost
 */
export function getRemainingBoostTime(boost: BoostData, currentTimestamp: number): number {
  const nowSeconds = currentTimestamp / 1000;
  const endSeconds = Number(boost.endTime);
  return Math.max(0, endSeconds - nowSeconds);
}

/**
 * Get error type from error message
 */
export function getErrorType(error: string): string {
  if (error.includes('network') || error.includes('connection')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  if (error.includes('contract') || error.includes('transaction')) {
    return ERROR_TYPES.CONTRACT_ERROR;
  }
  if (error.includes('validation') || error.includes('invalid')) {
    return ERROR_TYPES.VALIDATION_ERROR;
  }
  if (error.includes('wallet') || error.includes('signature')) {
    return ERROR_TYPES.WALLET_ERROR;
  }
  if (error.includes('payment') || error.includes('insufficient')) {
    return ERROR_TYPES.PAYMENT_ERROR;
  }
  if (error.includes('slot') || error.includes('capacity')) {
    return ERROR_TYPES.SLOT_ERROR;
  }
  if (error.includes('visibility') || error.includes('level')) {
    return ERROR_TYPES.VISIBILITY_ERROR;
  }
  if (error.includes('boost')) {
    return ERROR_TYPES.BOOST_ERROR;
  }
  return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  exponentialBackoff: boolean = true
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = exponentialBackoff
        ? baseDelay * Math.pow(2, attempt)
        : baseDelay;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique payment ID
 */
export function generatePaymentId(boostId: u32, timestamp: number): string {
  return `pay_${boostId}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique refund ID
 */
export function generateRefundId(paymentId: string): string {
  return `ref_${paymentId}_${Date.now()}`;
}

/**
 * Sanitize string for boost metadata
 */
export function sanitizeString(str: string, maxLength: number = 500): string {
  return str
    .trim()
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, maxLength);
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (obj instanceof Map) {
    const newMap = new Map();
    for (const [k, v] of obj) newMap.set(deepClone(k), deepClone(v));
    return newMap as T;
  }
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Generate unique subscription ID
 */
export function generateSubscriptionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate click-through rate
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return parseFloat(((clicks / impressions) * 100).toFixed(2));
}

/**
 * Determine performance grade based on CTR
 */
export function getPerformanceGrade(ctr: number): string {
  if (ctr >= 10) return 'A';
  if (ctr >= 7) return 'B';
  if (ctr >= 4) return 'C';
  if (ctr >= 2) return 'D';
  return 'F';
}

/**
 * Generate visibility recommendations based on stats
 */
export function generateVisibilityRecommendations(
  ctr: number,
  impressions: number,
  tier: BoostTier
): string[] {
  const recommendations: string[] = [];

  if (ctr < 2) {
    recommendations.push('Consider improving your product images and descriptions to increase click-through rate');
  }
  if (impressions < 100) {
    recommendations.push('Upgrade to a higher boost tier to increase impressions');
  }
  if (tier === 'basic' && ctr > 5) {
    recommendations.push('Your content is performing well - consider upgrading to Standard tier for more reach');
  }
  if (tier === 'standard' && ctr > 7) {
    recommendations.push('Excellent performance - consider Premium tier to maximize your reach');
  }

  return recommendations;
}
