import type { NotificationPreference } from '../types/notification.types';
import type { PaginationParams } from '../types/follow.types';
import { TIME_CONSTANTS } from '../constants/follow.constants';

/**
 * Validates Stellar public key (G...), Soroban contract address (C...), or 0x hex address
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  const trimmed = address.trim();
  const stellarRegex = /^[GC][A-Z2-7]{55}$/i;
  const ethRegex = /^0x[a-fA-F0-9]{40,64}$/;
  return stellarRegex.test(trimmed) || ethRegex.test(trimmed);
}

/**
 * Generates mock transaction hash (64 hex characters)
 */
export function generateTxHash(): string {
  const hexChars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += hexChars[Math.floor(Math.random() * hexChars.length)];
  }
  return hash;
}

/**
 * Generates unique alert record ID
 */
export function generateAlertId(): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `alert_${timestamp}_${rand}`;
}

/**
 * Calculates percentage drop between old and new price
 */
export function calculatePriceDropPercentage(oldPrice: number, newPrice: number): number {
  if (oldPrice <= 0 || newPrice >= oldPrice) {
    return 0;
  }
  const drop = ((oldPrice - newPrice) / oldPrice) * 100;
  return Number(drop.toFixed(2));
}

/**
 * Checks if user's notification preferences match price drop event
 */
export function isUserEligibleForPriceDropAlert(
  prefs: NotificationPreference,
  oldPrice: number,
  newPrice: number
): boolean {
  if (!prefs.priceDrop) {
    return false;
  }

  // If user configured a specific target price, check if price dropped to or below target
  if (prefs.targetPrice !== undefined && prefs.targetPrice > 0) {
    return newPrice <= prefs.targetPrice;
  }

  // Otherwise check threshold percentage
  const dropPercentage = calculatePriceDropPercentage(oldPrice, newPrice);
  const minThreshold = prefs.priceDropThresholdPercentage ?? 0;
  return dropPercentage >= minThreshold;
}

/**
 * Applies pagination slice to an array
 */
export function paginateArray<T>(items: T[], pagination?: PaginationParams): T[] {
  if (!pagination) {
    return [...items];
  }

  const limit = Math.min(
    pagination.limit && pagination.limit > 0 ? pagination.limit : TIME_CONSTANTS.DEFAULT_PAGE_SIZE,
    TIME_CONSTANTS.MAX_PAGE_SIZE
  );

  let offset = pagination.offset ?? 0;
  if (pagination.page !== undefined && pagination.page > 0) {
    offset = (pagination.page - 1) * limit;
  }

  return items.slice(offset, offset + limit);
}
