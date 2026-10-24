/**
 * Tier levels for drop access control
 */
export type AccessTier = 'VIP' | 'EARLY_BIRD' | 'WHITELIST' | 'PUBLIC';

/**
 * Registry entry representing a user's granted access
 */
export interface AccessEntry {
  /** User address (Stellar public key G... or hex format) */
  user: string;
  /** Granted access tier */
  tier: AccessTier;
  /** Maximum allocation allowed for this user */
  maxAllocation: number;
  /** Timestamp when access was granted */
  grantedAt: number;
  /** Optional granter identifier */
  grantedBy?: string;
  /** Whether the access is currently active/valid */
  isActive: boolean;
}

/**
 * Result of checking a user's access eligibility for a drop
 */
export interface AccessCheckResult {
  /** Whether user is eligible to participate */
  hasAccess: boolean;
  /** User's assigned access tier */
  tier: AccessTier;
  /** Maximum amount user can claim in total */
  maxAllocation: number;
  /** Current amount user has claimed so far */
  currentClaimed: number;
  /** Remaining amount user can claim */
  remainingAllocation: number;
  /** Human-readable explanation or rejection reason */
  reason?: string;
}

/**
 * Parameters for granting access to a user
 */
export interface GrantAccessParams {
  /** Target user address */
  user: string;
  /** Access tier (default: WHITELIST) */
  tier?: AccessTier;
  /** Custom max allocation override */
  customAllocation?: number;
  /** Granter address / admin ID */
  grantedBy?: string;
}
