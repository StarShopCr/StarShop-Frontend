import type { AuctionConfig, AuctionResponse, Address } from '../types/auction.types';
import type { BidValidation } from '../types/bid.types';
import { VALIDATION, ERROR_MESSAGES } from '../constants/auction.constants';

export function isValidStellarAddress(address: string): boolean {
  return typeof address === 'string' && /^G[A-Z2-7]{55}$/.test(address);
}

export function isValidAuctionId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 64;
}

export function validateAuctionConfig(config: AuctionConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.title || config.title.length > VALIDATION.MAX_TITLE_LENGTH) {
    errors.push(`Title must be between 1 and ${VALIDATION.MAX_TITLE_LENGTH} characters`);
  }

  if (config.description && config.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must not exceed ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (!config.productId || config.productId.length === 0) {
    errors.push('Product ID is required');
  }

  if (config.startPrice < VALIDATION.MIN_START_PRICE) {
    errors.push('Start price must be greater than zero');
  }

  if (config.minBidIncrement <= BigInt(0)) {
    errors.push('Minimum bid increment must be positive');
  }

  const duration = config.endTime - config.startTime;
  if (duration < VALIDATION.MIN_AUCTION_DURATION) {
    errors.push(`Auction duration must be at least ${VALIDATION.MIN_AUCTION_DURATION} seconds`);
  }

  if (duration > VALIDATION.MAX_AUCTION_DURATION) {
    errors.push(`Auction duration must not exceed ${VALIDATION.MAX_AUCTION_DURATION} seconds`);
  }

  if (config.reservePrice !== undefined && config.reservePrice < config.startPrice) {
    errors.push('Reserve price must be greater than or equal to start price');
  }

  if (!isValidStellarAddress(config.creator)) {
    errors.push(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  return { valid: errors.length === 0, errors };
}

export function validateBid(
  amount: bigint,
  currentHighest: bigint,
  minIncrement: bigint,
  auctionStartPrice: bigint
): BidValidation {
  const minRequired = currentHighest > BigInt(0)
    ? currentHighest + minIncrement
    : auctionStartPrice;

  if (amount < minRequired) {
    return {
      valid: false,
      reason: ERROR_MESSAGES.BID_TOO_LOW,
      minRequired,
    };
  }

  return { valid: true };
}

export function calculatePlatformFee(amount: bigint, feePercent: number): bigint {
  return (amount * BigInt(Math.round(feePercent * 100))) / BigInt(10000);
}

export function calculateSellerAmount(totalAmount: bigint, platformFee: bigint): bigint {
  return totalAmount - platformFee;
}

export function sanitizeString(input: string): string {
  return input.replace(/[<>&"']/g, (char) => {
    const escapeMap: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return escapeMap[char] || char;
  });
}

export function generateUniqueId(prefix: string = 'auc'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${random}`;
}

export function createSuccessResponse<T>(data: T): AuctionResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  };
}

export function createErrorResponse<T>(error: string): AuctionResponse<T> {
  return {
    success: false,
    error,
    timestamp: Date.now(),
  };
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function isAuctionActive(startTime: number, endTime: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= startTime && now < endTime;
}

export function getTimeRemaining(endTime: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, endTime - now);
}

export function formatBidAmount(amount: bigint, decimals: number = 7): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = (amount % divisor).toString().padStart(decimals, '0');
  return `${whole}.${fraction}`;
}
