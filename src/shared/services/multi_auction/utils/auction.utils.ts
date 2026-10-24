import { TIME_CONSTANTS, AUCTION_DEFAULTS } from '../constants/auction.constants';

/**
 * Validates Stellar public key (G...), Soroban contract address (C...), or 0x hex address
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  const trimmed = address.trim();
  const stellarRegex = /^[GC][A-Z2-7]{55}$/;
  const ethRegex = /^0x[a-fA-F0-9]{40,64}$/;
  return stellarRegex.test(trimmed) || ethRegex.test(trimmed);
}

/**
 * Generates unique auction identifier
 */
export function generateAuctionId(): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `auc_${timestamp}_${rand}`;
}

/**
 * Generates unique bid identifier
 */
export function generateBidId(): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `bid_${timestamp}_${rand}`;
}

/**
 * Generates a mock Stellar transaction hash (64 hex characters)
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
 * Computes minimum next bid amount based on current highest bid and increment rules
 */
export function calculateMinNextBid(
  currentHighestBid: number,
  startingBid: number,
  minIncrement: number = AUCTION_DEFAULTS.DEFAULT_MIN_BID_INCREMENT,
  incrementType: 'FIXED' | 'PERCENTAGE' = 'FIXED'
): number {
  if (currentHighestBid <= 0) {
    return Math.max(0, startingBid);
  }

  if (incrementType === 'PERCENTAGE') {
    const increment = (currentHighestBid * minIncrement) / 100;
    return Number((currentHighestBid + increment).toFixed(4));
  }

  return Number((currentHighestBid + minIncrement).toFixed(4));
}

/**
 * Computes platform fee and net seller payout
 */
export function calculatePlatformFee(
  winningBid: number,
  feePercentage: number = AUCTION_DEFAULTS.DEFAULT_PLATFORM_FEE_PERCENTAGE
): { sellerPayout: number; platformFee: number } {
  if (winningBid <= 0) {
    return { sellerPayout: 0, platformFee: 0 };
  }
  const platformFee = Number(((winningBid * feePercentage) / 100).toFixed(4));
  const sellerPayout = Number((winningBid - platformFee).toFixed(4));
  return { sellerPayout, platformFee };
}

/**
 * Formats seconds into human-readable duration
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  const d = Math.floor(seconds / TIME_CONSTANTS.SECONDS_IN_DAY);
  const h = Math.floor((seconds % TIME_CONSTANTS.SECONDS_IN_DAY) / TIME_CONSTANTS.SECONDS_IN_HOUR);
  const m = Math.floor((seconds % TIME_CONSTANTS.SECONDS_IN_HOUR) / TIME_CONSTANTS.SECONDS_IN_MINUTE);
  const s = Math.floor(seconds % TIME_CONSTANTS.SECONDS_IN_MINUTE);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}
