import { UserLevel, type Address, type CacheEntry } from '../types/loyalty.types';
import { LEVEL_THRESHOLDS, ERROR_MESSAGES } from '../constants/loyalty.constants';

/**
 * Validate a Stellar address format (G... public key or C... contract)
 */
export function validateAddress(address: string): boolean {
  if (typeof address !== 'string' || address.length !== 56) return false;
  if (!address.startsWith('G') && !address.startsWith('C')) return false;
  // Validate base32 character set (A-Z, 2-7)
  return /^[A-Z2-7]{56}$/.test(address);
}

/**
 * Validate that an amount is positive
 */
export function validateAmount(amount: bigint): boolean {
  return typeof amount === 'bigint' && amount > BigInt(0);
}

/**
 * Validate percentage is between 0 and 100
 */
export function validatePercentage(percentage: number): boolean {
  return typeof percentage === 'number' && percentage >= 0 && percentage <= 100;
}

/**
 * Validate days is a positive integer
 */
export function validateDays(days: number): boolean {
  return Number.isInteger(days) && days > 0;
}

/**
 * Determine user level based on lifetime points
 */
export function calculateLevel(lifetimePoints: bigint): UserLevel {
  if (lifetimePoints >= LEVEL_THRESHOLDS[UserLevel.Diamond]) return UserLevel.Diamond;
  if (lifetimePoints >= LEVEL_THRESHOLDS[UserLevel.Platinum]) return UserLevel.Platinum;
  if (lifetimePoints >= LEVEL_THRESHOLDS[UserLevel.Gold]) return UserLevel.Gold;
  if (lifetimePoints >= LEVEL_THRESHOLDS[UserLevel.Silver]) return UserLevel.Silver;
  return UserLevel.Bronze;
}

/**
 * Calculate progress to next level as a percentage
 */
export function calculateLevelProgress(lifetimePoints: bigint): {
  currentLevel: UserLevel;
  nextLevel: UserLevel | null;
  progress: number;
  pointsToNext: bigint;
} {
  const currentLevel = calculateLevel(lifetimePoints);
  const levels = Object.values(UserLevel);
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === levels.length - 1) {
    return { currentLevel, nextLevel: null, progress: 100, pointsToNext: BigInt(0) };
  }

  const nextLevel = levels[currentIndex + 1] as UserLevel;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  const range = nextThreshold - currentThreshold;
  const progressPoints = lifetimePoints - currentThreshold;
  const progress = range > BigInt(0) ? Number((progressPoints * BigInt(100)) / range) : 0;
  const pointsToNext = nextThreshold - lifetimePoints;

  return { currentLevel, nextLevel, progress: Math.min(progress, 100), pointsToNext };
}

/**
 * Calculate discount amount for a reward redemption
 */
export function calculateDiscountAmount(
  purchaseAmount: bigint,
  discountPercentage: number,
  maxDiscountAmount?: bigint
): bigint {
  const discount = (purchaseAmount * BigInt(discountPercentage)) / BigInt(100);
  if (maxDiscountAmount && discount > maxDiscountAmount) {
    return maxDiscountAmount;
  }
  return discount;
}

/**
 * Format points for display
 */
export function formatPoints(points: bigint): string {
  const sign = points < 0n ? '-' : '';
  const abs = points < 0n ? -points : points;

  const formatScaled = (value: bigint, divisor: bigint, suffix: string) => {
    const whole = value / divisor;
    const decimal = (value % divisor) / (divisor / 10n);
    return `${sign}${whole.toString()}.${decimal.toString()}${suffix}`;
  };

  if (abs >= 1_000_000n) return formatScaled(abs, 1_000_000n, 'M');
  if (abs >= 1_000n) return formatScaled(abs, 1_000n, 'K');
  return `${sign}${abs.toString()}`;
}

/**
 * Generate a unique ID
 */
export function generateUniqueId(prefix: string = 'loy'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Check if a cache entry is still valid
 */
export function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10_000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if points have expired
 */
export function isPointsExpired(earnedAt: number, expiryDays: number): boolean {
  const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
  return Date.now() - earnedAt > expiryMs;
}
