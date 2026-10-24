/**
 * Points transaction category/action
 */
export type PointsTransactionType =
  | 'PURCHASE'
  | 'BONUS'
  | 'ANNIVERSARY'
  | 'MILESTONE'
  | 'REDEMPTION'
  | 'EXPIRY'
  | 'ADMIN_ADJUSTMENT';

/**
 * Record of a points ledger entry
 */
export interface PointsTransaction {
  id: string;
  user: string;
  amount: number;
  type: PointsTransactionType;
  description: string;
  timestamp: number;
  expiresAt?: number;
  isExpired?: boolean;
  metadata?: Record<string, unknown>;
  txHash: string;
}

/**
 * Detailed balance report including active and expiring points
 */
export interface PointsBalance {
  user: string;
  availablePoints: number;
  lifetimePoints: number;
  expiringPointsSoon: number;
  nextExpiryTimestamp?: number;
}

/**
 * Parameters for recording purchase points
 */
export interface RecordPurchaseParams {
  user: string;
  amount: number;
  productId?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Paginated points history result
 */
export interface PointsHistory {
  user: string;
  transactions: PointsTransaction[];
  totalCount: number;
}
