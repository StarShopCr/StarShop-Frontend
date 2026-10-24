import type { DropConfig, DropStatus } from '../types/drop.types';
import type { AccessTier } from '../types/access.types';

/**
 * Standard error codes for the limited time drop contract service
 */
export const DROP_ERROR_CODES = {
  // General validation errors (100 - 199)
  INVALID_PARAMS: 100,
  INVALID_START_TIME: 101,
  INVALID_END_TIME: 102,
  INVALID_ALLOCATION: 103,
  INVALID_MAX_PER_USER: 104,
  INVALID_DURATION: 105,
  INVALID_ADDRESS: 106,
  INVALID_AMOUNT: 107,

  // Drop state errors (200 - 299)
  DROP_NOT_FOUND: 200,
  DROP_NOT_ACTIVE: 201,
  DROP_ALREADY_STARTED: 202,
  DROP_ALREADY_ENDED: 203,
  DROP_ALREADY_CANCELLED: 204,
  DROP_CANNOT_BE_MODIFIED: 205,
  DROP_SOLD_OUT: 206,
  DROP_PAUSED: 207,
  ALLOCATION_REDUCTION_TOO_LOW: 208,

  // Access control errors (300 - 399)
  UNAUTHORIZED: 300,
  ACCESS_DENIED: 301,
  USER_NOT_WHITELISTED: 302,
  USER_ALLOCATION_EXCEEDED: 303,
  ACCESS_ALREADY_GRANTED: 304,
  ACCESS_NOT_FOUND: 305,

  // Execution & Pool errors (400 - 499)
  INSUFFICIENT_POOL_ALLOCATION: 400,
  CLAIM_EXCEEDS_REMAINING: 401,
  CLAIM_EXCEEDS_USER_MAX: 402,
  CONCURRENT_UPDATE_CONFLICT: 403,
  TRANSACTION_FAILED: 404,
} as const;

/**
 * User-facing error message mapping
 */
export const ERROR_MESSAGES: Record<number, string> = {
  [DROP_ERROR_CODES.INVALID_PARAMS]: 'Invalid parameters provided.',
  [DROP_ERROR_CODES.INVALID_START_TIME]:
    'Start time must be before end time and not in the past.',
  [DROP_ERROR_CODES.INVALID_END_TIME]:
    'End time must be in the future and after start time.',
  [DROP_ERROR_CODES.INVALID_ALLOCATION]:
    'Total allocation must be greater than zero.',
  [DROP_ERROR_CODES.INVALID_MAX_PER_USER]:
    'Max per user must be greater than zero and cannot exceed total allocation.',
  [DROP_ERROR_CODES.INVALID_DURATION]:
    'Additional duration must be greater than zero seconds.',
  [DROP_ERROR_CODES.INVALID_ADDRESS]:
    'Invalid Stellar public address or account format.',
  [DROP_ERROR_CODES.INVALID_AMOUNT]:
    'Participation amount must be greater than zero.',

  [DROP_ERROR_CODES.DROP_NOT_FOUND]: 'Drop was not found.',
  [DROP_ERROR_CODES.DROP_NOT_ACTIVE]: 'Drop is not currently active.',
  [DROP_ERROR_CODES.DROP_ALREADY_STARTED]: 'Drop has already started.',
  [DROP_ERROR_CODES.DROP_ALREADY_ENDED]: 'Drop has already ended.',
  [DROP_ERROR_CODES.DROP_ALREADY_CANCELLED]: 'Drop is already cancelled.',
  [DROP_ERROR_CODES.DROP_CANNOT_BE_MODIFIED]:
    'Ended or cancelled drops cannot be modified.',
  [DROP_ERROR_CODES.DROP_SOLD_OUT]: 'Drop allocation is completely sold out.',
  [DROP_ERROR_CODES.DROP_PAUSED]: 'Drop is currently paused.',
  [DROP_ERROR_CODES.ALLOCATION_REDUCTION_TOO_LOW]:
    'Cannot reduce total allocation below already claimed volume.',

  [DROP_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access.',
  [DROP_ERROR_CODES.ACCESS_DENIED]:
    'User does not meet eligibility requirements for this drop.',
  [DROP_ERROR_CODES.USER_NOT_WHITELISTED]:
    'User is not included in the whitelist for this drop.',
  [DROP_ERROR_CODES.USER_ALLOCATION_EXCEEDED]:
    'User has reached maximum claim allocation limit.',
  [DROP_ERROR_CODES.ACCESS_ALREADY_GRANTED]:
    'Access has already been granted to this user.',
  [DROP_ERROR_CODES.ACCESS_NOT_FOUND]: 'No access entry found for this user.',

  [DROP_ERROR_CODES.INSUFFICIENT_POOL_ALLOCATION]:
    'Insufficient remaining allocation in drop pool.',
  [DROP_ERROR_CODES.CLAIM_EXCEEDS_REMAINING]:
    'Requested claim amount exceeds available pool allocation.',
  [DROP_ERROR_CODES.CLAIM_EXCEEDS_USER_MAX]:
    'Requested amount exceeds user allowed limit.',
  [DROP_ERROR_CODES.CONCURRENT_UPDATE_CONFLICT]:
    'Concurrent update conflict detected. Please retry.',
  [DROP_ERROR_CODES.TRANSACTION_FAILED]: 'Transaction processing failed.',
};

/**
 * Drop status enumeration constants
 */
export const DROP_STATUS: Record<DropStatus, DropStatus> = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED',
  SOLD_OUT: 'SOLD_OUT',
} as const;

/**
 * Access tier constants
 */
export const ACCESS_TIERS: Record<AccessTier, AccessTier> = {
  VIP: 'VIP',
  EARLY_BIRD: 'EARLY_BIRD',
  WHITELIST: 'WHITELIST',
  PUBLIC: 'PUBLIC',
} as const;

/**
 * Multipliers for tier-based allocation limits relative to standard maxPerUser
 */
export const TIER_ALLOCATION_MULTIPLIERS: Record<AccessTier, number> = {
  VIP: 3.0,
  EARLY_BIRD: 1.5,
  WHITELIST: 1.0,
  PUBLIC: 0.5,
};

/**
 * Time constants in seconds and milliseconds
 */
export const TIME_CONSTANTS = {
  SECOND_IN_MS: 1000,
  MINUTE_IN_SECONDS: 60,
  HOUR_IN_SECONDS: 3600,
  DAY_IN_SECONDS: 86400,
  WEEK_IN_SECONDS: 604800,
  CLOCK_DRIFT_TOLERANCE_SECONDS: 60, // 1 minute allowable clock skew for start time validation
} as const;

/**
 * Default fallback drop configuration template
 */
export const DEFAULT_DROP_CONFIG: Readonly<
  Omit<
    DropConfig,
    'dropId' | 'startTime' | 'endTime' | 'createdAt' | 'updatedAt'
  >
> = {
  name: 'Standard Limited Time Drop',
  description: 'Limited time drop on StarShop Soroban smart contract network',
  tokenAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  totalAllocation: 10000,
  claimedAllocation: 0,
  remainingAllocation: 10000,
  maxPerUser: 100,
  status: 'SCHEDULED',
  isPublic: false,
};
