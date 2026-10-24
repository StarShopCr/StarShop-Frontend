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
 * Generates unique escrow identifier
 */
export function generateEscrowId(): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `esc_${timestamp}_${rand}`;
}

/**
 * Generates unique dispute identifier
 */
export function generateDisputeId(): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `disp_${timestamp}_${rand}`;
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
 * Calculates split amounts between buyer and seller based on percentage
 */
export function calculateSplitAmounts(
  totalAmount: number,
  buyerPercentage: number = 50
): { buyerAmount: number; sellerAmount: number } {
  if (totalAmount <= 0) {
    return { buyerAmount: 0, sellerAmount: 0 };
  }
  const clampedPct = Math.max(0, Math.min(100, buyerPercentage));
  const buyerAmount = Number(((totalAmount * clampedPct) / 100).toFixed(4));
  const sellerAmount = Number((totalAmount - buyerAmount).toFixed(4));
  return { buyerAmount, sellerAmount };
}
