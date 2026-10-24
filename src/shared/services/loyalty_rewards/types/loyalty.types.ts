/**
 * Loyalty tier levels
 */
export type LoyaltyLevelName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

/**
 * Standard response wrapper for loyalty service operations
 */
export interface LoyaltyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
  transactionHash?: string;
}

/**
 * Global configuration parameters for the loyalty contract service
 */
export interface LoyaltyConfig {
  /** Admin address */
  admin: string;
  /** Days after which earned points expire (0 means never) */
  pointsExpiryDays: number;
  /** Maximum percentage of a purchase that can be paid via points (e.g. 50 = 50%) */
  maxRedemptionPercentage: number;
  /** Points awarded per unit currency spent (e.g. 1 USD = 10 points) */
  pointsRatio: number;
  /** Whether the contract is initialized */
  isInitialized: boolean;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Level requirement and tier configuration
 */
export interface LevelConfig {
  level: LoyaltyLevelName;
  /** Minimum lifetime points required to attain this tier */
  minPoints: number;
  /** Percentage bonus multiplier on earned points (e.g. 1.25 = 25% bonus) */
  multiplier: number;
  /** Exclusive discount percentage on select rewards (0 - 100) */
  discountPercentage: number;
  /** Human-readable perk description */
  description?: string;
}

/**
 * User loyalty profile representation
 */
export interface UserLoyaltyProfile {
  user: string;
  currentLevel: LoyaltyLevelName;
  currentPoints: number;
  lifetimePoints: number;
  joinedAt: number;
  lastActiveAt: number;
  lastAnniversaryClaimedYear?: number;
  completedMilestones: string[];
}

/**
 * Result of checking and updating user tier level
 */
export interface LevelUpdateResult {
  user: string;
  previousLevel: LoyaltyLevelName;
  newLevel: LoyaltyLevelName;
  hasUpgraded: boolean;
  lifetimePoints: number;
}
