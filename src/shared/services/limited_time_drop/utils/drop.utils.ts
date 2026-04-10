import type { u32, u64 } from '../types/drop.types';
import {
  DropStatus,
  AccessTier,
  type Drop,
  type DropMetadata,
  type DropPricing,
  type DropTimeConfig,
  type DropSupply,
  type DropValidation,
  type DropStatusSummary,
  type ParticipationRecord,
} from '../types/drop.types';
import {
  type AccessRecord,
  type AccessValidation,
} from '../types/access.types';
import {
  VALIDATION,
  ERROR_TYPES,
  DEFAULT_DROP_METADATA,
} from '../constants/drop.constants';

// ==================== ADDRESS VALIDATION ====================

/**
 * Validate a Stellar account address (starts with G, 56 chars)
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const stellarAddressRegex = /^G[A-Z2-7]{55}$/;
  return stellarAddressRegex.test(address);
}

/**
 * Validate a Soroban contract address (starts with C, 56 chars)
 */
export function isValidContractAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const contractAddressRegex = /^C[A-Z2-7]{55}$/;
  return contractAddressRegex.test(address);
}

/**
 * Accept either a Stellar account or contract address
 */
export function isValidAddress(address: string): boolean {
  return isValidStellarAddress(address) || isValidContractAddress(address);
}

// ==================== DROP ID VALIDATION ====================

/**
 * Validate a drop ID (u32, >= 1)
 */
export function isValidDropId(dropId: any): dropId is u32 {
  return (
    typeof dropId === 'number' &&
    Number.isInteger(dropId) &&
    dropId >= 1 &&
    dropId <= 0xffffffff
  );
}

// ==================== DROP METADATA VALIDATION ====================

/**
 * Validate drop metadata fields
 */
export function validateDropMetadata(metadata: Partial<DropMetadata>): DropValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata.name || metadata.name.trim().length === 0) {
    errors.push('Drop name is required');
  } else if (metadata.name.length > VALIDATION.MAX_NAME_LENGTH) {
    errors.push(`Drop name must be at most ${VALIDATION.MAX_NAME_LENGTH} characters`);
  }

  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push('Drop description is required');
  } else if (metadata.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Drop description must be at most ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (metadata.imageUrl) {
    if (!isValidUrl(metadata.imageUrl)) {
      errors.push('Invalid image URL format');
    } else if (metadata.imageUrl.length > VALIDATION.MAX_IMAGE_URL_LENGTH) {
      errors.push(`Image URL must be at most ${VALIDATION.MAX_IMAGE_URL_LENGTH} characters`);
    }
  }

  if (metadata.externalUrl) {
    if (!isValidUrl(metadata.externalUrl)) {
      errors.push('Invalid external URL format');
    } else if (metadata.externalUrl.length > VALIDATION.MAX_EXTERNAL_URL_LENGTH) {
      errors.push(`External URL must be at most ${VALIDATION.MAX_EXTERNAL_URL_LENGTH} characters`);
    }
  }

  if (metadata.tags) {
    if (!Array.isArray(metadata.tags)) {
      errors.push('Tags must be an array');
    } else {
      if (metadata.tags.length > VALIDATION.MAX_TAGS) {
        errors.push(`Maximum ${VALIDATION.MAX_TAGS} tags allowed`);
      }
      metadata.tags.forEach((tag, i) => {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push(`Tag ${i + 1} must be a non-empty string`);
        } else if (tag.length > VALIDATION.MAX_TAG_LENGTH) {
          errors.push(`Tag ${i + 1} exceeds maximum length of ${VALIDATION.MAX_TAG_LENGTH}`);
        }
      });
    }
  }

  if (metadata.attributes) {
    if (!Array.isArray(metadata.attributes)) {
      errors.push('Attributes must be an array');
    } else {
      if (metadata.attributes.length > VALIDATION.MAX_ATTRIBUTES) {
        errors.push(`Maximum ${VALIDATION.MAX_ATTRIBUTES} attributes allowed`);
      }
      metadata.attributes.forEach((attr, i) => {
        if (!attr.traitType || attr.traitType.trim().length === 0) {
          errors.push(`Attribute ${i + 1} traitType is required`);
        } else if (attr.traitType.length > VALIDATION.MAX_ATTRIBUTE_TRAIT_LENGTH) {
          errors.push(`Attribute ${i + 1} traitType exceeds max length`);
        }
        if (attr.value === undefined || attr.value === null) {
          errors.push(`Attribute ${i + 1} value is required`);
        }
        if (
          typeof attr.value === 'string' &&
          attr.value.length > VALIDATION.MAX_ATTRIBUTE_VALUE_LENGTH
        ) {
          warnings.push(`Attribute ${i + 1} value is very long`);
        }
      });
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ==================== TIME CONFIG VALIDATION ====================

/**
 * Validate a drop's time configuration
 */
export function validateDropTimeConfig(timeConfig: Partial<DropTimeConfig>): DropValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = getCurrentTimestampSeconds();

  if (timeConfig.startTime === undefined) {
    errors.push('startTime is required');
  } else if (timeConfig.startTime < now - 60) {
    warnings.push('startTime is in the past');
  }

  if (timeConfig.endTime === undefined) {
    errors.push('endTime is required');
  }

  if (
    timeConfig.startTime !== undefined &&
    timeConfig.endTime !== undefined
  ) {
    const duration = Number(timeConfig.endTime) - Number(timeConfig.startTime);
    if (duration < VALIDATION.MIN_DURATION_SECONDS) {
      errors.push(`Drop duration must be at least ${VALIDATION.MIN_DURATION_SECONDS} seconds`);
    }
    if (duration > VALIDATION.MAX_DURATION_SECONDS) {
      errors.push(`Drop duration must not exceed ${VALIDATION.MAX_DURATION_SECONDS} seconds`);
    }
  }

  if (
    timeConfig.maxExtensionSeconds !== undefined &&
    Number(timeConfig.maxExtensionSeconds) > VALIDATION.MAX_EXTENSION_SECONDS
  ) {
    errors.push(`Max extension must not exceed ${VALIDATION.MAX_EXTENSION_SECONDS} seconds`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ==================== SUPPLY VALIDATION ====================

/**
 * Validate drop supply configuration
 */
export function validateDropSupply(supply: Partial<Omit<DropSupply, 'claimedSupply'>>): DropValidation {
  const errors: string[] = [];

  if (supply.totalSupply === undefined) {
    errors.push('totalSupply is required');
  } else {
    if (supply.totalSupply < VALIDATION.MIN_TOTAL_SUPPLY) {
      errors.push(`totalSupply must be at least ${VALIDATION.MIN_TOTAL_SUPPLY}`);
    }
    if (supply.totalSupply > VALIDATION.MAX_TOTAL_SUPPLY) {
      errors.push(`totalSupply must not exceed ${VALIDATION.MAX_TOTAL_SUPPLY}`);
    }
  }

  if (supply.maxPerParticipant === undefined) {
    errors.push('maxPerParticipant is required');
  } else {
    if (supply.maxPerParticipant < VALIDATION.MIN_PER_PARTICIPANT) {
      errors.push(`maxPerParticipant must be at least ${VALIDATION.MIN_PER_PARTICIPANT}`);
    }
    if (supply.maxPerParticipant > VALIDATION.MAX_PER_PARTICIPANT) {
      errors.push(`maxPerParticipant must not exceed ${VALIDATION.MAX_PER_PARTICIPANT}`);
    }
    if (supply.totalSupply !== undefined && supply.maxPerParticipant > supply.totalSupply) {
      errors.push('maxPerParticipant cannot exceed totalSupply');
    }
  }

  if (supply.reservedSupply !== undefined && supply.totalSupply !== undefined) {
    if (supply.reservedSupply > supply.totalSupply) {
      errors.push('reservedSupply cannot exceed totalSupply');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ==================== PRICING VALIDATION ====================

/**
 * Validate drop pricing configuration
 */
export function validateDropPricing(pricing: Partial<DropPricing>): DropValidation {
  const errors: string[] = [];

  if (pricing.pricePerUnit === undefined) {
    errors.push('pricePerUnit is required');
  } else if (Number(pricing.pricePerUnit) < VALIDATION.MIN_PRICE_STROOPS) {
    errors.push('pricePerUnit cannot be negative');
  }

  if (pricing.paymentToken === undefined) {
    errors.push('paymentToken is required (use empty string for XLM)');
  } else if (pricing.paymentToken !== '' && !isValidContractAddress(pricing.paymentToken)) {
    errors.push('paymentToken must be a valid contract address or empty string for XLM');
  }

  if (pricing.discountPercentage !== undefined) {
    if (pricing.discountPercentage < 0 || pricing.discountPercentage > 100) {
      errors.push('discountPercentage must be between 0 and 100');
    }
  }

  if (
    pricing.minPurchaseAmount !== undefined &&
    pricing.maxPurchaseAmount !== undefined &&
    Number(pricing.minPurchaseAmount) > Number(pricing.maxPurchaseAmount)
  ) {
    errors.push('minPurchaseAmount cannot exceed maxPurchaseAmount');
  }

  return { isValid: errors.length === 0, errors };
}

// ==================== TIME HELPERS ====================

/**
 * Get the current Unix timestamp in seconds
 */
export function getCurrentTimestampSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check if a drop is currently active based on its time config and status
 */
export function isDropCurrentlyActive(drop: Drop): boolean {
  const now = getCurrentTimestampSeconds();
  return (
    drop.status === DropStatus.ACTIVE &&
    Number(drop.timeConfig.startTime) <= now &&
    Number(drop.timeConfig.endTime) > now
  );
}

/**
 * Calculate time remaining in seconds for a drop (0 if not active)
 */
export function calculateTimeRemainingSeconds(drop: Drop): number {
  const now = getCurrentTimestampSeconds();
  const endTime = Number(drop.timeConfig.endTime);
  if (endTime <= now) return 0;
  return endTime - now;
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ended';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format a Unix timestamp (seconds) to a locale date string
 */
export function formatTimestamp(timestampSeconds: number): string {
  return new Date(timestampSeconds * 1000).toLocaleString();
}

// ==================== SUPPLY HELPERS ====================

/**
 * Calculate remaining supply for a drop
 */
export function calculateRemainingSupply(supply: DropSupply): u32 {
  return Math.max(0, supply.totalSupply - supply.claimedSupply) as u32;
}

/**
 * Check if a drop is sold out
 */
export function isDropSoldOut(supply: DropSupply): boolean {
  return supply.claimedSupply >= supply.totalSupply;
}

/**
 * Get supply percentage (0–100) as a number
 */
export function getSupplyPercentage(supply: DropSupply): number {
  if (supply.totalSupply === 0) return 100;
  return Math.round((supply.claimedSupply / supply.totalSupply) * 100);
}

/**
 * Build a DropStatusSummary from a Drop record
 */
export function buildDropStatusSummary(drop: Drop, participantCount?: u32): DropStatusSummary {
  const remaining = calculateRemainingSupply(drop.supply);
  const timeRemaining = calculateTimeRemainingSeconds(drop);
  const soldOut = isDropSoldOut(drop.supply);
  const active = isDropCurrentlyActive(drop);
  const ended =
    drop.status === DropStatus.ENDED ||
    drop.status === DropStatus.CANCELLED ||
    Number(drop.timeConfig.endTime) <= getCurrentTimestampSeconds();

  return {
    dropId: drop.dropId,
    status: drop.status,
    isActive: active,
    isEnded: ended,
    isSoldOut: soldOut,
    timeRemainingSeconds: timeRemaining as u64,
    remainingSupply: remaining,
    participantCount: participantCount ?? 0 as u32,
  };
}

// ==================== PRICING HELPERS ====================

/**
 * Calculate total cost for a given quantity
 */
export function calculateTotalCost(pricing: DropPricing, quantity: u32): bigint {
  const basePrice = BigInt(pricing.pricePerUnit) * BigInt(quantity);
  if (pricing.discountPercentage && pricing.discountPercentage > 0) {
    const discount = (basePrice * BigInt(pricing.discountPercentage)) / 100n;
    return basePrice - discount;
  }
  return basePrice;
}

/**
 * Format a stroop amount to a human-readable XLM string
 */
export function formatStroopAmount(stroops: bigint | number): string {
  const xlm = Number(BigInt(stroops)) / 1e7;
  return `${xlm.toFixed(7)} XLM`;
}

// ==================== ERROR HANDLING ====================

/**
 * Classify an error message into an error type string
 */
export function getErrorType(error: string): string {
  const lower = error.toLowerCase();
  if (lower.includes('network') || lower.includes('connection') || lower.includes('timeout')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  if (lower.includes('contract') || lower.includes('transaction') || lower.includes('ledger')) {
    return ERROR_TYPES.CONTRACT_ERROR;
  }
  if (lower.includes('validation') || lower.includes('invalid') || lower.includes('required')) {
    return ERROR_TYPES.VALIDATION_ERROR;
  }
  if (lower.includes('wallet') || lower.includes('signature') || lower.includes('freighter')) {
    return ERROR_TYPES.WALLET_ERROR;
  }
  if (lower.includes('access') || lower.includes('unauthorized') || lower.includes('denied')) {
    return ERROR_TYPES.ACCESS_ERROR;
  }
  if (lower.includes('supply') || lower.includes('sold out') || lower.includes('quantity')) {
    return ERROR_TYPES.SUPPLY_ERROR;
  }
  if (lower.includes('time') || lower.includes('expired') || lower.includes('ended') || lower.includes('cooldown')) {
    return ERROR_TYPES.TIME_ERROR;
  }
  if (lower.includes('payment') || lower.includes('fee') || lower.includes('balance')) {
    return ERROR_TYPES.PAYMENT_ERROR;
  }
  return ERROR_TYPES.UNKNOWN_ERROR;
}

// ==================== STRING HELPERS ====================

/**
 * Validate a URL string
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize a string for on-chain storage
 */
export function sanitizeString(str: string, maxLength: number = VALIDATION.MAX_DESCRIPTION_LENGTH): string {
  return str
    .trim()
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, maxLength);
}

/**
 * Truncate string with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// ==================== UTILITY HELPERS ====================

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  exponentialBackoff: boolean = true,
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) throw lastError;

      const delay = exponentialBackoff
        ? baseDelay * Math.pow(2, attempt)
        : baseDelay;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Generate a unique identifier string
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Safely parse JSON, returning defaultValue on failure
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
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
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T;

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Check if a value is empty (null, undefined, empty string, array, or object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}

/**
 * Format a large number with comma separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Compute a percentage (0-100) clamped and rounded
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

/**
 * Merge default metadata with provided metadata
 */
export function mergeWithDefaultMetadata(provided: Partial<DropMetadata>): DropMetadata {
  return {
    name: provided.name ?? DEFAULT_DROP_METADATA.NAME,
    description: provided.description ?? DEFAULT_DROP_METADATA.DESCRIPTION,
    imageUrl: provided.imageUrl,
    externalUrl: provided.externalUrl,
    tags: provided.tags ?? [...DEFAULT_DROP_METADATA.TAGS],
    attributes: provided.attributes ?? [...DEFAULT_DROP_METADATA.ATTRIBUTES],
  };
}

/**
 * Sort participation records by time (most recent first)
 */
export function sortParticipationByRecent(records: ParticipationRecord[]): ParticipationRecord[] {
  return [...records].sort(
    (a, b) => Number(b.participatedAt) - Number(a.participatedAt),
  );
}

/**
 * Filter access records to only currently active ones
 */
export function filterActiveAccessRecords(records: AccessRecord[]): AccessRecord[] {
  const now = getCurrentTimestampSeconds();
  return records.filter(
    (r) =>
      r.isActive &&
      (r.expiresAt === undefined || Number(r.expiresAt) === 0 || Number(r.expiresAt) > now),
  );
}

/**
 * Check if an address has at least the required access tier
 */
export function meetsAccessTier(currentTier: AccessTier, requiredTier: AccessTier): boolean {
  return currentTier >= requiredTier;
}
