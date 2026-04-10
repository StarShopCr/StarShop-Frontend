import type { u32, u64 } from '@stellar/stellar-sdk';
import type { Address, BoostId } from './boost.types';

/**
 * Visibility level enumeration
 */
export enum VisibilityLevel {
  HIDDEN = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  FEATURED = 4,
  SPOTLIGHT = 5,
}

/**
 * Visibility placement type
 */
export enum PlacementType {
  SEARCH_RESULTS = 'search_results',
  CATEGORY_PAGE = 'category_page',
  HOME_FEATURED = 'home_featured',
  SIDEBAR = 'sidebar',
  BANNER = 'banner',
  POPUP = 'popup',
}

/**
 * Visibility configuration for a boost
 */
export interface VisibilityConfig {
  /** Boost ID this config belongs to */
  boostId: BoostId;
  /** Current visibility level */
  level: VisibilityLevel;
  /** Placement types enabled */
  placements: PlacementType[];
  /** Whether to show in search results */
  showInSearch: boolean;
  /** Whether to show in featured section */
  showInFeatured: boolean;
  /** Custom display priority */
  displayPriority: u32;
  /** Geographic targeting (empty = global) */
  geoTargets: string[];
  /** Category targeting */
  categoryTargets: string[];
}

/**
 * Visibility statistics
 */
export interface VisibilityStats {
  /** Boost ID */
  boostId: BoostId;
  /** Total impressions */
  totalImpressions: u64;
  /** Unique impressions */
  uniqueImpressions: u64;
  /** Total clicks */
  totalClicks: u64;
  /** Click-through rate (0-100) */
  clickThroughRate: number;
  /** Current visibility score */
  visibilityScore: u32;
  /** Active duration in seconds */
  activeDurationSeconds: u64;
  /** Peak visibility time */
  peakVisibilityTime: u64;
  /** Average position in search results */
  averagePosition: number;
  /** Conversion rate (0-100) */
  conversionRate: number;
}

/**
 * Request to set visibility level
 */
export interface SetVisibilityLevelRequest {
  /** Boost ID */
  boostId: BoostId;
  /** New visibility level */
  level: VisibilityLevel;
  /** Caller/admin address */
  caller: Address;
}

/**
 * Request to boost visibility
 */
export interface BoostVisibilityRequest {
  /** Boost ID */
  boostId: BoostId;
  /** Visibility multiplier (1-10) */
  multiplier: u32;
  /** Duration in seconds for the visibility boost */
  durationSeconds: u64;
  /** Caller address */
  caller: Address;
}

/**
 * Visibility snapshot for historical tracking
 */
export interface VisibilitySnapshot {
  /** Snapshot timestamp */
  timestamp: u64;
  /** Visibility level at snapshot */
  level: VisibilityLevel;
  /** Impressions at snapshot */
  impressions: u64;
  /** Score at snapshot */
  score: u32;
}

/**
 * Visibility history
 */
export interface VisibilityHistory {
  /** Boost ID */
  boostId: BoostId;
  /** Historical snapshots */
  snapshots: VisibilitySnapshot[];
  /** Total history duration in seconds */
  totalDurationSeconds: u64;
}

/**
 * Visibility report
 */
export interface VisibilityReport {
  /** Boost ID */
  boostId: BoostId;
  /** Owner address */
  owner: Address;
  /** Target ID */
  targetId: u32;
  /** Current stats */
  currentStats: VisibilityStats;
  /** History */
  history: VisibilityHistory;
  /** Performance grade (A-F) */
  performanceGrade: string;
  /** Recommendations */
  recommendations: string[];
}

/**
 * Visibility level upgrade request
 */
export interface UpgradeVisibilityRequest {
  /** Boost ID */
  boostId: BoostId;
  /** Target level */
  targetLevel: VisibilityLevel;
  /** Additional payment amount */
  additionalPayment: u64;
  /** Caller address */
  caller: Address;
}

/**
 * Visibility comparison result
 */
export interface VisibilityComparison {
  /** Current level */
  currentLevel: VisibilityLevel;
  /** Target level */
  targetLevel: VisibilityLevel;
  /** Estimated impression increase (percentage) */
  impressionIncrease: number;
  /** Additional cost */
  additionalCost: u64;
  /** Estimated ROI */
  estimatedROI: number;
}

/**
 * Visibility tier pricing
 */
export interface VisibilityPricing {
  /** Visibility level */
  level: VisibilityLevel;
  /** Base price per day */
  basePricePerDay: u64;
  /** Multiplier applied to base boost cost */
  costMultiplier: number;
  /** Features included at this level */
  features: string[];
  /** Maximum duration available */
  maxDurationDays: u32;
}

/**
 * Visibility score calculation result
 */
export interface VisibilityScoreResult {
  /** Base score from tier */
  baseScore: u32;
  /** Bonus from engagement */
  engagementBonus: u32;
  /** Bonus from activity */
  activityBonus: u32;
  /** Time decay factor */
  timeDecayFactor: number;
  /** Final calculated score */
  finalScore: u32;
  /** Score components explanation */
  components: VisibilityScoreComponent[];
}

/**
 * Visibility score component
 */
export interface VisibilityScoreComponent {
  /** Component name */
  name: string;
  /** Component value */
  value: u32;
  /** Component weight */
  weight: number;
  /** Weighted contribution */
  contribution: u32;
}

/**
 * Placement availability
 */
export interface PlacementAvailability {
  /** Placement type */
  placement: PlacementType;
  /** Whether placement is available */
  available: boolean;
  /** Number of available slots */
  availableSlots: u32;
  /** Current occupancy percentage */
  occupancyPercentage: number;
  /** Estimated wait time in seconds (if unavailable) */
  estimatedWaitSeconds?: u64;
}
