import type {
  Drop as ContractDrop,
  DropStatus as ContractDropStatus,
  PurchaseRecord as ContractPurchaseRecord,
  UserLevel as ContractUserLevel
} from '../../../../../packages/limited_time_drop/src/index';
import type { u32, u64 } from '@stellar/stellar-sdk';
import {
  Drop,
  DropConfig,
  DropId,
  DropLifecycleStatus,
  DropParticipationMetrics,
  DropStatusSummary,
  DropTimeRemaining,
  PurchaseRecord,
  UserAccessLevel
} from '../types/drop.types';
import { AccessCheckResult } from '../types/access.types';
import { CONTRACT_ERROR_CODES, VALIDATION } from '../constants/drop.constants';

export function isValidStellarAddress(address: string): boolean {
  return typeof address === 'string' && VALIDATION.ADDRESS.PATTERN.test(address);
}

export function isValidDropId(dropId: DropId): boolean {
  return typeof dropId === 'number' && Number.isInteger(dropId) && dropId > 0;
}

export function isValidQuantity(quantity: u32): boolean {
  return (
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity >= VALIDATION.PARTICIPATION.MIN_QUANTITY &&
    quantity <= VALIDATION.PARTICIPATION.MAX_QUANTITY
  );
}

export function sanitizeString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function validateDropConfig(config: DropConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.creator && !isValidStellarAddress(config.creator)) {
    errors.push('Creator address is invalid');
  }

  if (!config.title || config.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (config.title.length > VALIDATION.DROP.TITLE_MAX_LENGTH) {
    errors.push(`Title must be ${VALIDATION.DROP.TITLE_MAX_LENGTH} characters or fewer`);
  }

  if (typeof config.productId !== 'bigint' || config.productId <= 0n) {
    errors.push('Product ID must be a positive bigint');
  }

  if (
    typeof config.maxSupply !== 'number' ||
    config.maxSupply < VALIDATION.DROP.MIN_SUPPLY ||
    config.maxSupply > VALIDATION.DROP.MAX_SUPPLY
  ) {
    errors.push(`Max supply must be between ${VALIDATION.DROP.MIN_SUPPLY} and ${VALIDATION.DROP.MAX_SUPPLY}`);
  }

  if (typeof config.startTime !== 'bigint' || typeof config.endTime !== 'bigint') {
    errors.push('Start time and end time must be bigint Unix timestamps');
  } else {
    if (config.endTime <= config.startTime) {
      errors.push('End time must be after start time');
    }

    const duration = config.endTime - config.startTime;
    if (duration < VALIDATION.DROP.MIN_DURATION_SECONDS || duration > VALIDATION.DROP.MAX_DURATION_SECONDS) {
      errors.push(
        `Drop duration must be between ${VALIDATION.DROP.MIN_DURATION_SECONDS} and ${VALIDATION.DROP.MAX_DURATION_SECONDS} seconds`
      );
    }
  }

  if (typeof config.price !== 'bigint' || config.price < VALIDATION.DROP.MIN_PRICE) {
    errors.push('Price must be a non-negative bigint');
  }

  if (
    typeof config.perUserLimit !== 'number' ||
    config.perUserLimit < VALIDATION.DROP.MIN_PER_USER_LIMIT ||
    config.perUserLimit > VALIDATION.DROP.MAX_PER_USER_LIMIT
  ) {
    errors.push(
      `Per-user limit must be between ${VALIDATION.DROP.MIN_PER_USER_LIMIT} and ${VALIDATION.DROP.MAX_PER_USER_LIMIT}`
    );
  }

  if (config.perUserLimit > config.maxSupply) {
    errors.push('Per-user limit cannot exceed max supply');
  }

  if (config.imageUri && config.imageUri.length > VALIDATION.DROP.IMAGE_URI_MAX_LENGTH) {
    errors.push(`Image URI must be ${VALIDATION.DROP.IMAGE_URI_MAX_LENGTH} characters or fewer`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function toContractDropStatus(status: DropLifecycleStatus): ContractDropStatus {
  switch (status) {
    case DropLifecycleStatus.PENDING:
      return { tag: 'Pending', values: undefined };
    case DropLifecycleStatus.ACTIVE:
      return { tag: 'Active', values: undefined };
    case DropLifecycleStatus.COMPLETED:
      return { tag: 'Completed', values: undefined };
    case DropLifecycleStatus.CANCELLED:
      return { tag: 'Cancelled', values: undefined };
    default:
      return { tag: 'Pending', values: undefined };
  }
}

export function fromContractDropStatus(status: ContractDropStatus): DropLifecycleStatus {
  switch (status.tag) {
    case 'Active':
      return DropLifecycleStatus.ACTIVE;
    case 'Completed':
      return DropLifecycleStatus.COMPLETED;
    case 'Cancelled':
      return DropLifecycleStatus.CANCELLED;
    case 'Pending':
    default:
      return DropLifecycleStatus.PENDING;
  }
}

export function toContractUserLevel(level: UserAccessLevel): ContractUserLevel {
  switch (level) {
    case UserAccessLevel.PREMIUM:
      return { tag: 'Premium', values: undefined };
    case UserAccessLevel.VERIFIED:
      return { tag: 'Verified', values: undefined };
    case UserAccessLevel.STANDARD:
    default:
      return { tag: 'Standard', values: undefined };
  }
}

export function fromContractDrop(drop: ContractDrop): Drop {
  return {
    id: drop.id,
    creator: drop.creator,
    title: drop.title,
    productId: drop.product_id,
    maxSupply: drop.max_supply,
    startTime: drop.start_time,
    endTime: drop.end_time,
    price: drop.price,
    perUserLimit: drop.per_user_limit,
    imageUri: drop.image_uri,
    status: fromContractDropStatus(drop.status),
    totalPurchased: drop.total_purchased
  };
}

export function fromContractPurchaseRecord(record: ContractPurchaseRecord): PurchaseRecord {
  return {
    dropId: record.drop_id,
    quantity: record.quantity,
    pricePaid: record.price_paid,
    timestamp: record.timestamp
  };
}

export function getCurrentUnixTimestamp(): u64 {
  return BigInt(Math.floor(Date.now() / 1000));
}

export function isDropWithinWindow(drop: Drop, now: u64 = getCurrentUnixTimestamp()): boolean {
  return now >= drop.startTime && now <= drop.endTime;
}

export function isDropActive(drop: Drop, now: u64 = getCurrentUnixTimestamp()): boolean {
  return (
    drop.status === DropLifecycleStatus.ACTIVE &&
    isDropWithinWindow(drop, now) &&
    drop.totalPurchased < drop.maxSupply
  );
}

export function getDropTimeRemaining(drop: Drop, now: u64 = getCurrentUnixTimestamp()): DropTimeRemaining {
  const isStarted = now >= drop.startTime;
  const isEnded = now >= drop.endTime;
  const startsInSeconds = isStarted ? 0 : Number(drop.startTime - now);
  const remainingSeconds = isEnded ? 0 : Number(drop.endTime - now);

  return {
    dropId: drop.id,
    remainingSeconds,
    isStarted,
    isEnded,
    startsInSeconds,
    endsAt: drop.endTime
  };
}

export function getDropStatusSummary(drop: Drop, now: u64 = getCurrentUnixTimestamp()): DropStatusSummary {
  const remainingSupply = Math.max(0, drop.maxSupply - drop.totalPurchased) as u32;

  return {
    dropId: drop.id,
    status: drop.status,
    isActive: isDropActive(drop, now),
    isPending: drop.status === DropLifecycleStatus.PENDING,
    isCompleted: drop.status === DropLifecycleStatus.COMPLETED,
    isCancelled: drop.status === DropLifecycleStatus.CANCELLED,
    hasStarted: now >= drop.startTime,
    hasEnded: now >= drop.endTime,
    remainingSupply,
  };
}

export function calculateParticipationMetrics(
  drop: Drop,
  totalPurchased: u32,
  buyerCount: u32
): DropParticipationMetrics {
  const remainingSupply = Math.max(0, drop.maxSupply - totalPurchased) as u32;

  return {
    dropId: drop.id,
    totalPurchased,
    buyerCount,
    remainingSupply,
    soldOut: remainingSupply === 0,
    purchaseRate: drop.maxSupply > 0 ? Number(((totalPurchased / drop.maxSupply) * 100).toFixed(2)) : 0
  };
}

export function evaluateAccess(drop: Drop, user: string): AccessCheckResult {
  const status = getDropStatusSummary(drop);

  if (!isValidStellarAddress(user)) {
    return {
      dropId: drop.id,
      user,
      hasAccess: false,
      reason: 'Invalid user address',
      dropStatus: drop.status,
      isWithinDropWindow: status.hasStarted && !status.hasEnded,
      hasAvailableSupply: status.remainingSupply > 0
    };
  }

  if (drop.status === DropLifecycleStatus.CANCELLED) {
    return {
      dropId: drop.id,
      user,
      hasAccess: false,
      reason: 'Drop is cancelled',
      dropStatus: drop.status,
      isWithinDropWindow: false,
      hasAvailableSupply: status.remainingSupply > 0
    };
  }

  if (!status.hasStarted) {
    return {
      dropId: drop.id,
      user,
      hasAccess: false,
      reason: 'Drop has not started',
      dropStatus: drop.status,
      isWithinDropWindow: false,
      hasAvailableSupply: status.remainingSupply > 0
    };
  }

  if (status.hasEnded) {
    return {
      dropId: drop.id,
      user,
      hasAccess: false,
      reason: 'Drop has ended',
      dropStatus: drop.status,
      isWithinDropWindow: false,
      hasAvailableSupply: status.remainingSupply > 0
    };
  }

  if (status.remainingSupply <= 0) {
    return {
      dropId: drop.id,
      user,
      hasAccess: false,
      reason: 'Drop is sold out',
      dropStatus: drop.status,
      isWithinDropWindow: true,
      hasAvailableSupply: false
    };
  }

  return {
    dropId: drop.id,
    user,
    hasAccess: status.isActive,
    reason: status.isActive ? undefined : 'Drop is not active',
    dropStatus: drop.status,
    isWithinDropWindow: true,
    hasAvailableSupply: true
  };
}

export function getErrorType(message: string): string {
  const match = Object.entries(CONTRACT_ERROR_CODES).find(([, value]) => message.includes(value));
  return match ? match[1] : 'UnknownError';
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
