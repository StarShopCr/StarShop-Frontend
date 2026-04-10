import { VALIDATION, ERROR_CODES, FEE_CALCULATION, TIMEOUT_CONFIG } from '../constants/escrow.constants';
import type { EscrowConfig, EscrowInfo, CacheEntry, i128 } from '../types/escrow.types';
import { EscrowStatus } from '../types/escrow.types';
import type { CreateDisputeRequest } from '../types/dispute.types';

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate a Stellar address
 */
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return address.length === VALIDATION.ADDRESS_LENGTH && /^[A-Z0-9]+$/.test(address);
}

/**
 * Validate an escrow amount
 */
export function validateAmount(amount: i128): boolean {
  if (typeof amount !== 'bigint') return false;
  return amount >= VALIDATION.MIN_AMOUNT && amount <= VALIDATION.MAX_AMOUNT;
}

/**
 * Validate escrow configuration
 */
export function validateEscrowConfig(config: EscrowConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validateAddress(config.buyer)) {
    errors.push('Invalid buyer address');
  }
  if (!validateAddress(config.seller)) {
    errors.push('Invalid seller address');
  }
  if (config.buyer === config.seller) {
    errors.push('Buyer and seller cannot be the same address');
  }
  if (!validateAmount(config.amount)) {
    errors.push('Invalid escrow amount');
  }
  if (!validateAddress(config.tokenAddress)) {
    errors.push('Invalid token address');
  }
  if (config.description && config.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description exceeds maximum length of ${VALIDATION.MAX_DESCRIPTION_LENGTH}`);
  }
  if (config.expiresAt) {
    const now = Math.floor(Date.now() / 1000);
    const duration = config.expiresAt - now;
    if (duration < VALIDATION.MIN_EXPIRY_DURATION) {
      errors.push('Expiry time too short');
    }
    if (duration > VALIDATION.MAX_EXPIRY_DURATION) {
      errors.push('Expiry time too long');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate dispute creation request
 */
export function validateDisputeRequest(request: CreateDisputeRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.escrowId || typeof request.escrowId !== 'string') {
    errors.push('Invalid escrow ID');
  }
  if (!request.reason || request.reason.length === 0) {
    errors.push('Dispute reason is required');
  }
  if (request.reason && request.reason.length > VALIDATION.MAX_REASON_LENGTH) {
    errors.push(`Reason exceeds maximum length of ${VALIDATION.MAX_REASON_LENGTH}`);
  }
  if (!validateAddress(request.disputant)) {
    errors.push('Invalid disputant address');
  }
  if (request.evidence && request.evidence.length > VALIDATION.MAX_EVIDENCE_ITEMS) {
    errors.push(`Too many evidence items (max ${VALIDATION.MAX_EVIDENCE_ITEMS})`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize a string input
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

// ==================== FEE UTILITIES ====================

/**
 * Calculate platform fee for an escrow amount
 */
export function calculatePlatformFee(amount: i128): i128 {
  const fee = (amount * BigInt(Math.floor(FEE_CALCULATION.PLATFORM_FEE_PERCENTAGE * 100))) / BigInt(10000);
  return fee < FEE_CALCULATION.MIN_FEE ? FEE_CALCULATION.MIN_FEE : fee;
}

/**
 * Calculate arbitrator fee
 */
export function calculateArbitratorFee(amount: i128): i128 {
  return (amount * BigInt(Math.floor(FEE_CALCULATION.ARBITRATOR_FEE_PERCENTAGE * 100))) / BigInt(10000);
}

/**
 * Calculate total fees
 */
export function calculateTotalFees(amount: i128, includeArbitrator: boolean = false): i128 {
  let total = calculatePlatformFee(amount);
  if (includeArbitrator) {
    total += calculateArbitratorFee(amount);
  }
  return total;
}

// ==================== CACHE UTILITIES ====================

/**
 * Check if a cache entry is expired
 */
export function isCacheExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

/**
 * Generate a cache key for an escrow
 */
export function generateEscrowCacheKey(escrowId: string): string {
  return `escrow:${escrowId}`;
}

/**
 * Generate a cache key for a dispute
 */
export function generateDisputeCacheKey(disputeId: string): string {
  return `dispute:${disputeId}`;
}

/**
 * Generate a cache key for an arbitrator
 */
export function generateArbitratorCacheKey(address: string): string {
  return `arbitrator:${address}`;
}

// ==================== ERROR UTILITIES ====================

/**
 * Map a contract error to a service error code
 */
export function mapContractError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('not found')) return ERROR_CODES.ESCROW_NOT_FOUND;
    if (message.includes('insufficient')) return ERROR_CODES.INSUFFICIENT_FUNDS;
    if (message.includes('unauthorized')) return ERROR_CODES.UNAUTHORIZED;
    if (message.includes('expired')) return ERROR_CODES.ESCROW_EXPIRED;
    if (message.includes('cancelled')) return ERROR_CODES.ESCROW_CANCELLED;
    if (message.includes('timeout')) return ERROR_CODES.TIMEOUT;
    if (message.includes('network')) return ERROR_CODES.NETWORK_ERROR;
  }
  return ERROR_CODES.CONTRACT_ERROR;
}

/**
 * Get a human-readable error message for an error code
 */
export function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    [ERROR_CODES.ESCROW_NOT_FOUND]: 'Escrow not found',
    [ERROR_CODES.ESCROW_ALREADY_EXISTS]: 'Escrow already exists',
    [ERROR_CODES.ESCROW_EXPIRED]: 'Escrow has expired',
    [ERROR_CODES.ESCROW_CANCELLED]: 'Escrow has been cancelled',
    [ERROR_CODES.ESCROW_INVALID_STATUS]: 'Invalid escrow status for this operation',
    [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds',
    [ERROR_CODES.PAYMENT_ALREADY_RELEASED]: 'Payment has already been released',
    [ERROR_CODES.PAYMENT_ALREADY_REFUNDED]: 'Payment has already been refunded',
    [ERROR_CODES.INVALID_AMOUNT]: 'Invalid payment amount',
    [ERROR_CODES.DISPUTE_NOT_FOUND]: 'Dispute not found',
    [ERROR_CODES.DISPUTE_ALREADY_EXISTS]: 'Dispute already exists for this escrow',
    [ERROR_CODES.DISPUTE_ALREADY_RESOLVED]: 'Dispute has already been resolved',
    [ERROR_CODES.ARBITRATOR_NOT_FOUND]: 'Arbitrator not found',
    [ERROR_CODES.ARBITRATOR_ALREADY_ASSIGNED]: 'Arbitrator already assigned',
    [ERROR_CODES.UNAUTHORIZED_ARBITRATOR]: 'Unauthorized arbitrator',
    [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access',
    [ERROR_CODES.INVALID_INPUT]: 'Invalid input parameters',
    [ERROR_CODES.CONTRACT_ERROR]: 'Smart contract error',
    [ERROR_CODES.NETWORK_ERROR]: 'Network communication error',
    [ERROR_CODES.WALLET_NOT_CONNECTED]: 'Wallet not connected',
    [ERROR_CODES.TIMEOUT]: 'Operation timed out',
  };
  return messages[errorCode] || 'Unknown error';
}

// ==================== STATUS UTILITIES ====================

/**
 * Check if an escrow can be funded
 */
export function canDeposit(escrow: EscrowInfo): boolean {
  return escrow.status === EscrowStatus.CREATED;
}

/**
 * Check if an escrow payment can be released
 */
export function canRelease(escrow: EscrowInfo): boolean {
  return escrow.status === EscrowStatus.FUNDED;
}

/**
 * Check if an escrow payment can be refunded
 */
export function canRefund(escrow: EscrowInfo): boolean {
  return (
    escrow.status === EscrowStatus.FUNDED ||
    escrow.status === EscrowStatus.DISPUTED
  );
}

/**
 * Check if a dispute can be created for an escrow
 */
export function canDispute(escrow: EscrowInfo): boolean {
  return escrow.status === EscrowStatus.FUNDED;
}

/**
 * Check if an escrow can be cancelled
 */
export function canCancel(escrow: EscrowInfo): boolean {
  return (
    escrow.status === EscrowStatus.CREATED ||
    escrow.status === EscrowStatus.FUNDED
  );
}

/**
 * Check if an escrow has expired
 */
export function isExpired(escrow: EscrowInfo): boolean {
  if (!escrow.expiresAt) return false;
  return Math.floor(Date.now() / 1000) > escrow.expiresAt;
}

// ==================== RETRY UTILITIES ====================

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = TIMEOUT_CONFIG.RETRY_DELAY,
): Promise<T> {
  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * TIMEOUT_CONFIG.BACKOFF_MULTIPLIER, TIMEOUT_CONFIG.MAX_RETRY_DELAY);
      }
    }
  }

  throw lastError;
}

// ==================== FORMAT UTILITIES ====================

/**
 * Convert bigint to display string with decimals
 */
export function formatAmount(amount: i128, decimals: number = 7): string {
  const str = amount.toString();
  if (str.length <= decimals) {
    return '0.' + str.padStart(decimals, '0');
  }
  const intPart = str.slice(0, str.length - decimals);
  const decPart = str.slice(str.length - decimals);
  return `${intPart}.${decPart}`;
}

/**
 * Convert a string amount to bigint
 */
export function parseAmount(amount: string, decimals: number = 7): i128 {
  const parts = amount.split('.');
  const intPart = parts[0] || '0';
  const decPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  return BigInt(intPart + decPart);
}
