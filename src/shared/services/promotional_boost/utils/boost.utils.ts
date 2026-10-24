/**
 * Promotional Boost Contract Service - Utility Functions
 */

import type { VisibilityLevel } from '../types/visibility.types';
import {
  BASE_RATES_PER_HOUR,
  SLOT_MULTIPLIERS,
  SLOT_TYPES,
} from '../constants/boost.constants';

/**
 * Validates whether a string is a valid Stellar/Soroban public key or EVM address.
 */
export function isValidStellarAddress(address?: string | null): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  const stellarRegex = /^[GC][A-Z2-7]{55}$/i;
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  return stellarRegex.test(trimmed) || evmRegex.test(trimmed);
}

/**
 * Generates pseudo-random 64-character hex transaction hash.
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
 * Generates unique identifiers with prefixes (e.g., boost_..., slot_...).
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Calculates total cost in USDC for a promotional boost.
 */
export function calculateBoostCost(
  level: VisibilityLevel,
  durationSeconds: number,
  slotType?: string
): number {
  if (durationSeconds <= 0) return 0;
  const hours = durationSeconds / 3600;
  const baseRate = BASE_RATES_PER_HOUR[level] || BASE_RATES_PER_HOUR.STANDARD;
  const slotMult = slotType && SLOT_MULTIPLIERS[slotType] ? SLOT_MULTIPLIERS[slotType] : 1.0;
  const rawCost = hours * baseRate * slotMult;
  return Math.round(rawCost * 100) / 100;
}

/**
 * Validates slot type against known supported slot configurations.
 */
export function isValidSlotType(slotType?: string | null): boolean {
  if (!slotType) return false;
  return Object.values(SLOT_TYPES).includes(slotType as any);
}
