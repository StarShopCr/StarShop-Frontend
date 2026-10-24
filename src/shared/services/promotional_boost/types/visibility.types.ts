/**
 * Promotional Boost Contract Service - Visibility Types
 */

export type VisibilityLevel = 'STANDARD' | 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT';

export interface VisibilityStats {
  productId: string;
  currentLevel: VisibilityLevel;
  isBoosted: boolean;
  boostExpiresAt?: number;
  impressionsMultiplier: number;
  totalBoostsCount: number;
  lastBoostedAt?: number;
}
