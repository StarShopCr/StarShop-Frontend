import { EscrowStatus } from '../types/escrow.types';
import { DisputeStatus } from '../types/dispute.types';
import { ESCROW_ERROR_CODES, DEFAULT_CONFIG } from '../constants/escrow.constants';
import type { CacheEntry } from '../types/escrow.types';

export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return address.length === 56 && (address.startsWith('G') || address.startsWith('C'));
}

export function validateAmount(amount: bigint): boolean {
  return typeof amount === 'bigint' && amount >= DEFAULT_CONFIG.minEscrowAmount;
}

export function validateEscrowId(escrowId: string): boolean {
  return typeof escrowId === 'string' && escrowId.length > 0;
}

export function validateDisputeId(disputeId: string): boolean {
  return typeof disputeId === 'string' && disputeId.length > 0;
}

export function validateExpirationDays(days: number): boolean {
  return Number.isInteger(days) && days > 0 && days <= DEFAULT_CONFIG.maxExpirationDays;
}

export function isEscrowActive(status: EscrowStatus): boolean {
  return status === EscrowStatus.CREATED || status === EscrowStatus.FUNDED;
}

export function isEscrowFinalized(status: EscrowStatus): boolean {
  return (
    status === EscrowStatus.RELEASED ||
    status === EscrowStatus.REFUNDED ||
    status === EscrowStatus.CANCELLED
  );
}

export function canDeposit(status: EscrowStatus): boolean {
  return status === EscrowStatus.CREATED;
}

export function canRelease(status: EscrowStatus): boolean {
  return status === EscrowStatus.FUNDED;
}

export function canRefund(status: EscrowStatus): boolean {
  return status === EscrowStatus.FUNDED || status === EscrowStatus.DISPUTED;
}

export function canDispute(status: EscrowStatus): boolean {
  return status === EscrowStatus.FUNDED;
}

export function canCancel(status: EscrowStatus): boolean {
  return status === EscrowStatus.CREATED;
}

export function isDisputeResolved(status: DisputeStatus): boolean {
  return (
    status === DisputeStatus.RESOLVED_BUYER ||
    status === DisputeStatus.RESOLVED_SELLER ||
    status === DisputeStatus.RESOLVED_SPLIT ||
    status === DisputeStatus.DISMISSED
  );
}

export function calculateExpirationTimestamp(days: number): number {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function generateEscrowId(buyerAddress: string, sellerAddress: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const addressPart = buyerAddress.substring(0, 4) + sellerAddress.substring(0, 4);
  return `escrow_${addressPart}_${timestamp}_${random}`;
}

export function generateDisputeId(escrowId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `dispute_${escrowId.substring(0, 8)}_${timestamp}_${random}`;
}

export function mapContractError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('not found')) return ESCROW_ERROR_CODES.ESCROW_NOT_FOUND;
    if (message.includes('unauthorized')) return ESCROW_ERROR_CODES.UNAUTHORIZED;
    if (message.includes('expired')) return ESCROW_ERROR_CODES.ESCROW_EXPIRED;
    if (message.includes('invalid amount')) return ESCROW_ERROR_CODES.INVALID_AMOUNT;
    return error.message;
  }
  return ESCROW_ERROR_CODES.TRANSACTION_FAILED;
}

export function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    [ESCROW_ERROR_CODES.ESCROW_NOT_FOUND]: 'Escrow not found',
    [ESCROW_ERROR_CODES.ESCROW_ALREADY_FUNDED]: 'Escrow is already funded',
    [ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED]: 'Escrow has not been funded',
    [ESCROW_ERROR_CODES.ESCROW_EXPIRED]: 'Escrow has expired',
    [ESCROW_ERROR_CODES.ESCROW_CANCELLED]: 'Escrow has been cancelled',
    [ESCROW_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized operation',
    [ESCROW_ERROR_CODES.INVALID_AMOUNT]: 'Invalid escrow amount',
    [ESCROW_ERROR_CODES.INVALID_ADDRESS]: 'Invalid address',
    [ESCROW_ERROR_CODES.DISPUTE_EXISTS]: 'A dispute already exists for this escrow',
    [ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND]: 'Dispute not found',
    [ESCROW_ERROR_CODES.ARBITRATOR_NOT_ASSIGNED]: 'No arbitrator assigned',
    [ESCROW_ERROR_CODES.WALLET_NOT_CONNECTED]: 'Wallet not connected',
    [ESCROW_ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed',
    [ESCROW_ERROR_CODES.CONTRACT_NOT_INITIALIZED]: 'Contract not initialized',
  };
  return messages[code] ?? 'Unknown error';
}

export function createCacheEntry<T>(data: T, ttl: number): CacheEntry<T> {
  return { data, timestamp: Date.now(), ttl };
}

export function isCacheExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = DEFAULT_CONFIG.maxRetries,
  delayMs: number = DEFAULT_CONFIG.retryDelayMs,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export function formatAmount(amount: bigint, decimals: number = 7): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}
