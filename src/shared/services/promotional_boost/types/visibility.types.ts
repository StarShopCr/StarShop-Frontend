import { ProductId, VisibilityLevel, BoostId } from './boost.types';

// ==================== VISIBILITY CONFIGURATION ====================

export interface VisibilityConfig {
  level: VisibilityLevel;
  multiplier: number;
  maxDuration: number;
  features: string[];
  priority: number;
}

export interface VisibilityTierConfig {
  [VisibilityLevel.STANDARD]: VisibilityConfig;
  [VisibilityLevel.ENHANCED]: VisibilityConfig;
  [VisibilityLevel.PREMIUM]: VisibilityConfig;
  [VisibilityLevel.FEATURED]: VisibilityConfig;
}

// ==================== VISIBILITY REQUESTS ====================

export interface SetVisibilityRequest {
  productId: ProductId;
  level: VisibilityLevel;
  duration?: number;
  boostId?: BoostId;
}

export interface BoostVisibilityRequest {
  productId: ProductId;
  duration: number;
  targetLevel?: VisibilityLevel;
}

export interface VisibilityStatsRequest {
  productId: ProductId;
  fromTimestamp?: number;
  toTimestamp?: number;
}

// ==================== VISIBILITY RESULTS ====================

export interface VisibilityChangeResult {
  productId: ProductId;
  previousLevel: VisibilityLevel;
  newLevel: VisibilityLevel;
  effectiveAt: number;
  expiresAt?: number;
}

export interface VisibilityReport {
  productId: ProductId;
  currentLevel: VisibilityLevel;
  history: VisibilityHistoryEntry[];
  metrics: VisibilityMetrics;
}

export interface VisibilityHistoryEntry {
  level: VisibilityLevel;
  startTime: number;
  endTime: number;
  source: 'boost' | 'manual' | 'system';
  boostId?: BoostId;
}

export interface VisibilityMetrics {
  totalImpressions: number;
  impressionsByLevel: Record<VisibilityLevel, number>;
  averagePosition: number;
  positionByLevel: Record<VisibilityLevel, number>;
  clicksByLevel: Record<VisibilityLevel, number>;
  ctrByLevel: Record<VisibilityLevel, number>;
}
