import {
  DROP_ERROR_CODES,
  ERROR_MESSAGES,
  TIME_CONSTANTS,
  DROP_STATUS,
} from '../constants/drop.constants';
import type {
  DropConfig,
  DropStatus,
  CreateDropParams,
  UpdateDropParams,
  TimeRemainingResult,
  ParticipationMetrics,
} from '../types/drop.types';

/**
 * Validates Stellar public address (G... format, 56 chars base32) or generic 0x address
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  const trimmed = address.trim();

  // Stellar public key standard: 'G' followed by 55 base32 chars (A-Z, 2-7)
  const stellarRegex = /^G[A-Z2-7]{55}$/;
  if (stellarRegex.test(trimmed)) {
    return true;
  }

  // Also support Soroban Contract address standard: 'C' followed by 55 base32 chars
  const contractRegex = /^C[A-Z2-7]{55}$/;
  if (contractRegex.test(trimmed)) {
    return true;
  }

  // Generic hex address support for evm / bridge accounts
  const hexRegex = /^0x[a-fA-F0-9]{40,64}$/;
  if (hexRegex.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Generates a unique cryptographically secure or pseudo-random drop identifier
 */
export function generateDropId(prefix = 'drop'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Generates mock/deterministic transaction hash
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
 * Validates create drop parameters
 */
export function validateCreateDropParams(
  params: CreateDropParams,
  nowSeconds = Math.floor(Date.now() / 1000)
): { isValid: boolean; error?: string; errorCode?: number } {
  if (!params) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_PARAMS],
      errorCode: DROP_ERROR_CODES.INVALID_PARAMS,
    };
  }

  if (!params.name || !params.name.trim()) {
    return {
      isValid: false,
      error: 'Drop name is required.',
      errorCode: DROP_ERROR_CODES.INVALID_PARAMS,
    };
  }

  if (!params.tokenAddress || !isValidStellarAddress(params.tokenAddress)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ADDRESS],
      errorCode: DROP_ERROR_CODES.INVALID_ADDRESS,
    };
  }

  if (
    typeof params.totalAllocation !== 'number' ||
    params.totalAllocation <= 0 ||
    !Number.isFinite(params.totalAllocation)
  ) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ALLOCATION],
      errorCode: DROP_ERROR_CODES.INVALID_ALLOCATION,
    };
  }

  if (
    typeof params.maxPerUser !== 'number' ||
    params.maxPerUser <= 0 ||
    !Number.isFinite(params.maxPerUser)
  ) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_MAX_PER_USER],
      errorCode: DROP_ERROR_CODES.INVALID_MAX_PER_USER,
    };
  }

  if (params.maxPerUser > params.totalAllocation) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_MAX_PER_USER],
      errorCode: DROP_ERROR_CODES.INVALID_MAX_PER_USER,
    };
  }

  // Start time validation with clock drift tolerance
  const minAllowedStartTime =
    nowSeconds - TIME_CONSTANTS.CLOCK_DRIFT_TOLERANCE_SECONDS;
  if (params.startTime < minAllowedStartTime) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_START_TIME],
      errorCode: DROP_ERROR_CODES.INVALID_START_TIME,
    };
  }

  if (params.endTime <= params.startTime) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_END_TIME],
      errorCode: DROP_ERROR_CODES.INVALID_END_TIME,
    };
  }

  return { isValid: true };
}

/**
 * Validates updates against an existing drop configuration
 */
export function validateUpdateDropParams(
  current: DropConfig,
  updates: UpdateDropParams,
  nowSeconds = Math.floor(Date.now() / 1000)
): { isValid: boolean; error?: string; errorCode?: number } {
  // Disallow updates on ended or cancelled drops
  const dynamicStatus = computeDynamicStatus(current, nowSeconds);
  if (
    dynamicStatus === DROP_STATUS.CANCELLED ||
    dynamicStatus === DROP_STATUS.ENDED
  ) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.DROP_CANNOT_BE_MODIFIED],
      errorCode: DROP_ERROR_CODES.DROP_CANNOT_BE_MODIFIED,
    };
  }

  if (
    updates.tokenAddress !== undefined &&
    !isValidStellarAddress(updates.tokenAddress)
  ) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ADDRESS],
      errorCode: DROP_ERROR_CODES.INVALID_ADDRESS,
    };
  }

  if (updates.totalAllocation !== undefined) {
    if (
      updates.totalAllocation <= 0 ||
      !Number.isFinite(updates.totalAllocation)
    ) {
      return {
        isValid: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ALLOCATION],
        errorCode: DROP_ERROR_CODES.INVALID_ALLOCATION,
      };
    }
    // Cannot reduce totalAllocation below what has already been claimed
    if (updates.totalAllocation < current.claimedAllocation) {
      return {
        isValid: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.ALLOCATION_REDUCTION_TOO_LOW],
        errorCode: DROP_ERROR_CODES.ALLOCATION_REDUCTION_TOO_LOW,
      };
    }
  }

  const effectiveTotal = updates.totalAllocation ?? current.totalAllocation;
  if (updates.maxPerUser !== undefined) {
    if (updates.maxPerUser <= 0 || updates.maxPerUser > effectiveTotal) {
      return {
        isValid: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_MAX_PER_USER],
        errorCode: DROP_ERROR_CODES.INVALID_MAX_PER_USER,
      };
    }
  }

  const effectiveStart = updates.startTime ?? current.startTime;
  const effectiveEnd = updates.endTime ?? current.endTime;

  if (effectiveEnd <= effectiveStart) {
    return {
      isValid: false,
      error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_END_TIME],
      errorCode: DROP_ERROR_CODES.INVALID_END_TIME,
    };
  }

  return { isValid: true };
}

/**
 * Dynamically determines the actual lifecycle status of a drop based on current timestamp
 */
export function computeDynamicStatus(
  drop: DropConfig,
  nowSeconds = Math.floor(Date.now() / 1000)
): DropStatus {
  // If explicitly cancelled, stay cancelled
  if (drop.status === DROP_STATUS.CANCELLED) {
    return DROP_STATUS.CANCELLED;
  }

  // If paused, maintain paused status unless ended
  if (drop.status === DROP_STATUS.PAUSED) {
    if (nowSeconds > drop.endTime) {
      return DROP_STATUS.ENDED;
    }
    return DROP_STATUS.PAUSED;
  }

  // If allocation is exhausted
  if (drop.remainingAllocation <= 0) {
    if (nowSeconds > drop.endTime) {
      return DROP_STATUS.ENDED;
    }
    return DROP_STATUS.SOLD_OUT;
  }

  // Time-based progression
  if (nowSeconds < drop.startTime) {
    return DROP_STATUS.SCHEDULED;
  }

  if (nowSeconds >= drop.startTime && nowSeconds <= drop.endTime) {
    return DROP_STATUS.ACTIVE;
  }

  return DROP_STATUS.ENDED;
}

/**
 * Calculates remaining time details for countdown and display
 */
export function calculateTimeRemaining(
  drop: DropConfig,
  nowMs = Date.now()
): TimeRemainingResult {
  const startMs = drop.startTime * 1000;
  const endMs = drop.endTime * 1000;

  const isStarted = nowMs >= startMs;
  const isEnded = nowMs >= endMs;

  const timeToStartMs = Math.max(0, startMs - nowMs);
  const timeToEndMs = Math.max(0, endMs - nowMs);

  const targetDiffMs = isStarted ? timeToEndMs : timeToStartMs;
  const formattedRemaining = formatDuration(Math.floor(targetDiffMs / 1000));

  return {
    timeToStartMs,
    timeToEndMs,
    isStarted,
    isEnded,
    formattedRemaining,
  };
}

/**
 * Formats a duration in seconds to a human-readable string (e.g. "2d 4h 15m 30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return '0s';
  }

  const days = Math.floor(seconds / TIME_CONSTANTS.DAY_IN_SECONDS);
  const hours = Math.floor(
    (seconds % TIME_CONSTANTS.DAY_IN_SECONDS) / TIME_CONSTANTS.HOUR_IN_SECONDS
  );
  const minutes = Math.floor(
    (seconds % TIME_CONSTANTS.HOUR_IN_SECONDS) /
      TIME_CONSTANTS.MINUTE_IN_SECONDS
  );
  const secs = Math.floor(seconds % TIME_CONSTANTS.MINUTE_IN_SECONDS);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Calculates participation metrics
 */
export function calculateParticipationMetrics(
  drop: DropConfig,
  participantCount: number,
  claimedTotal: number
): ParticipationMetrics {
  const totalClaimed = Math.min(
    drop.totalAllocation,
    Math.max(0, claimedTotal)
  );
  const remainingAllocation = Math.max(0, drop.totalAllocation - totalClaimed);
  const participationRate =
    drop.totalAllocation > 0
      ? Number(((totalClaimed / drop.totalAllocation) * 100).toFixed(2))
      : 0;
  const averageClaimPerUser =
    participantCount > 0
      ? Number((totalClaimed / participantCount).toFixed(2))
      : 0;

  return {
    totalParticipants: participantCount,
    totalClaimed,
    remainingAllocation,
    participationRate,
    averageClaimPerUser,
  };
}
