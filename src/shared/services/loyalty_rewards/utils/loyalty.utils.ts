import type { LevelConfig } from '../types/loyalty.types';
import type { RewardItem } from '../types/rewards.types';
import { TIME_CONSTANTS, DEFAULT_LEVELS } from '../constants/loyalty.constants';

/**
 * Validates Stellar public key (G...), Soroban contract (C...), or 0x hex address
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  const trimmed = address.trim();

  // Stellar public key (56 chars base32 starting with G)
  const stellarRegex = /^G[A-Z2-7]{55}$/;
  if (stellarRegex.test(trimmed)) {
    return true;
  }

  // Soroban Contract address (56 chars base32 starting with C)
  const contractRegex = /^C[A-Z2-7]{55}$/;
  if (contractRegex.test(trimmed)) {
    return true;
  }

  // Generic hex account format
  const hexRegex = /^0x[a-fA-F0-9]{40,64}$/;
  if (hexRegex.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Generates mock transaction hash
 */
export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Generates unique promotional voucher code
 */
export function generateVoucherCode(prefix = 'STARS'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = `${prefix}-`;
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Determines appropriate level based on cumulative lifetime points
 */
export function calculateLevelForPoints(
  lifetimePoints: number,
  levels: LevelConfig[] = [...DEFAULT_LEVELS]
): LevelConfig {
  const sorted = [...levels].sort((a, b) => b.minPoints - a.minPoints);
  for (let i = 0; i < sorted.length; i++) {
    if (lifetimePoints >= sorted[i].minPoints) {
      return sorted[i];
    }
  }
  return sorted[sorted.length - 1] || DEFAULT_LEVELS[0];
}

/**
 * Calculates awarded points for a purchase with tier multiplier
 */
export function calculatePurchasePoints(
  amount: number,
  ratio: number = TIME_CONSTANTS.DEFAULT_POINTS_RATIO,
  multiplier = 1.0
): number {
  if (amount <= 0) return 0;
  const rawPoints = amount * ratio * multiplier;
  return Math.floor(rawPoints);
}

/**
 * Calculates absolute discount value for a reward applied to a purchase amount
 */
export function calculateRewardDiscount(
  reward: RewardItem,
  purchaseAmount: number
): number {
  if (!reward.isActive || purchaseAmount <= 0) {
    return 0;
  }

  if (reward.minPurchaseAmount && purchaseAmount < reward.minPurchaseAmount) {
    return 0;
  }

  let discount = 0;
  switch (reward.type) {
    case 'DISCOUNT_VOUCHER':
      discount = reward.value;
      break;
    case 'PERCENTAGE_OFF':
      discount = (purchaseAmount * reward.value) / 100;
      break;
    case 'FREE_SHIPPING':
      discount = reward.value; // Fixed flat shipping fee waiver
      break;
    case 'PHYSICAL_ITEM':
      discount = reward.value;
      break;
    default:
      discount = 0;
  }

  if (reward.maxDiscount && reward.maxDiscount > 0) {
    discount = Math.min(discount, reward.maxDiscount);
  }

  return Math.min(discount, purchaseAmount);
}

/**
 * Checks whether an account has reached an anniversary milestone for the current year
 */
export function isAnniversaryEligible(
  joinedAtSeconds: number,
  nowSeconds: number,
  lastClaimedYear?: number
): { eligible: boolean; currentYear: number } {
  const elapsedSeconds = nowSeconds - joinedAtSeconds;
  const elapsedYears = Math.floor(
    elapsedSeconds /
      (TIME_CONSTANTS.SECONDS_IN_DAY * TIME_CONSTANTS.DAYS_IN_YEAR)
  );

  if (elapsedYears < 1) {
    return { eligible: false, currentYear: elapsedYears };
  }

  if (lastClaimedYear !== undefined && lastClaimedYear >= elapsedYears) {
    return { eligible: false, currentYear: elapsedYears };
  }

  return { eligible: true, currentYear: elapsedYears };
}
