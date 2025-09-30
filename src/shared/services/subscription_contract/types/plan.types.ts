import type { u32, u64, i128, Map } from '@stellar/stellar-sdk';
import { PlanTier, Plan } from './subscription.types';

// ==================== PLAN MANAGEMENT TYPES ====================

/**
 * Plan creation request
 */
export interface CreatePlanRequest {
  /** Plan ID */
  planId: string;
  /** Plan name */
  name: string;
  /** Plan duration in seconds */
  duration: u64;
  /** Plan price in base units */
  price: i128;
  /** Plan benefits/features */
  benefits: string[];
  /** Plan version */
  version: u32;
  /** Plan tier */
  tier: PlanTier;
  /** Optional metadata */
  metadata?: Map<string, string>;
}

/**
 * Plan update request
 */
export interface UpdatePlanRequest {
  /** Plan ID */
  planId: string;
  /** New plan name (optional) */
  name?: string;
  /** New plan duration in seconds (optional) */
  duration?: u64;
  /** New plan price in base units (optional) */
  price?: i128;
  /** New plan benefits/features (optional) */
  benefits?: string[];
  /** New plan version (optional) */
  version?: u32;
  /** New plan tier (optional) */
  tier?: PlanTier;
  /** New metadata (optional) */
  metadata?: Map<string, string>;
}

/**
 * Plan disable request
 */
export interface DisablePlanRequest {
  /** Plan ID */
  planId: string;
  /** Reason for disabling */
  reason?: string;
}

/**
 * Plan query request
 */
export interface PlanQueryRequest {
  /** Plan ID */
  planId: string;
  /** Whether to include metadata */
  includeMetadata?: boolean;
}

/**
 * Plan list request
 */
export interface PlanListRequest {
  /** Filter by tier */
  tier?: PlanTier;
  /** Filter by active status */
  isActive?: boolean;
  /** Maximum number of results */
  limit?: u32;
  /** Offset for pagination */
  offset?: u32;
}

/**
 * Plan list result
 */
export interface PlanListResult {
  /** List of plans */
  plans: Plan[];
  /** Total number of plans */
  total: u32;
  /** Whether there are more results */
  hasMore: boolean;
  /** Next offset for pagination */
  nextOffset?: u32;
}

/**
 * Plan with detailed information
 */
export interface PlanDetail extends Plan {
  /** Plan metadata */
  metadata: Map<string, string>;
  /** Number of active subscriptions */
  activeSubscriptions: u32;
  /** Total revenue from this plan */
  totalRevenue: i128;
  /** Plan popularity score */
  popularityScore: number;
}

/**
 * Plan comparison result
 */
export interface PlanComparison {
  /** Plan A */
  planA: Plan;
  /** Plan B */
  planB: Plan;
  /** Comparison metrics */
  comparison: {
    /** Price difference */
    priceDifference: i128;
    /** Duration difference */
    durationDifference: u64;
    /** Feature difference */
    featureDifference: string[];
    /** Value score (features per price) */
    valueScore: number;
  };
}

/**
 * Plan recommendation request
 */
export interface PlanRecommendationRequest {
  /** User address */
  user: string;
  /** User preferences */
  preferences: {
    /** Preferred tier */
    preferredTier?: PlanTier;
    /** Maximum price */
    maxPrice?: i128;
    /** Minimum duration */
    minDuration?: u64;
    /** Required features */
    requiredFeatures?: string[];
  };
}

/**
 * Plan recommendation result
 */
export interface PlanRecommendation {
  /** Recommended plan */
  plan: Plan;
  /** Recommendation score (0-100) */
  score: number;
  /** Recommendation reasons */
  reasons: string[];
  /** Alternative plans */
  alternatives: Plan[];
}

// ==================== PLAN VALIDATION TYPES ====================

/**
 * Plan validation request
 */
export interface PlanValidationRequest {
  /** Plan configuration to validate */
  planConfig: CreatePlanRequest;
  /** Validation options */
  options?: {
    /** Whether to check for conflicts */
    checkConflicts?: boolean;
    /** Whether to validate pricing */
    validatePricing?: boolean;
    /** Whether to validate features */
    validateFeatures?: boolean;
  };
}

/**
 * Plan validation result
 */
export interface PlanValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Validation suggestions */
  suggestions: string[];
  /** Conflict information */
  conflicts?: {
    /** Conflicting plan IDs */
    conflictingPlans: string[];
    /** Conflict reasons */
    reasons: string[];
  };
}

/**
 * Plan conflict information
 */
export interface PlanConflict {
  /** Conflicting plan ID */
  planId: string;
  /** Conflict type */
  conflictType: PlanConflictType;
  /** Conflict description */
  description: string;
  /** Severity level */
  severity: ConflictSeverity;
}

/**
 * Plan conflict types
 */
export enum PlanConflictType {
  DUPLICATE_ID = 'duplicate_id',
  SIMILAR_PRICING = 'similar_pricing',
  OVERLAPPING_FEATURES = 'overlapping_features',
  TIER_MISMATCH = 'tier_mismatch'
}

/**
 * Conflict severity levels
 */
export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ==================== PLAN ANALYTICS TYPES ====================

/**
 * Plan analytics request
 */
export interface PlanAnalyticsRequest {
  /** Plan ID */
  planId: string;
  /** Time range */
  timeRange: {
    /** Start timestamp */
    start: u64;
    /** End timestamp */
    end: u64;
  };
  /** Analytics options */
  options?: {
    /** Whether to include revenue data */
    includeRevenue?: boolean;
    /** Whether to include usage data */
    includeUsage?: boolean;
    /** Whether to include subscription data */
    includeSubscriptions?: boolean;
  };
}

/**
 * Plan analytics result
 */
export interface PlanAnalytics {
  /** Plan information */
  plan: Plan;
  /** Analytics time range */
  timeRange: {
    start: u64;
    end: u64;
  };
  /** Revenue analytics */
  revenue?: {
    /** Total revenue */
    totalRevenue: i128;
    /** Revenue by period */
    revenueByPeriod: Map<string, i128>;
    /** Revenue growth rate */
    growthRate: number;
  };
  /** Usage analytics */
  usage?: {
    /** Total usage */
    totalUsage: u32;
    /** Usage by feature */
    usageByFeature: Map<string, u32>;
    /** Usage trends */
    usageTrends: Map<string, u32>;
  };
  /** Subscription analytics */
  subscriptions?: {
    /** Total subscriptions */
    totalSubscriptions: u32;
    /** Active subscriptions */
    activeSubscriptions: u32;
    /** New subscriptions */
    newSubscriptions: u32;
    /** Cancelled subscriptions */
    cancelledSubscriptions: u32;
    /** Subscription growth rate */
    growthRate: number;
  };
}

/**
 * Plan performance metrics
 */
export interface PlanPerformanceMetrics {
  /** Plan ID */
  planId: string;
  /** Performance score (0-100) */
  performanceScore: number;
  /** Key metrics */
  metrics: {
    /** Revenue per subscription */
    revenuePerSubscription: i128;
    /** Average subscription duration */
    averageDuration: u64;
    /** Customer satisfaction score */
    satisfactionScore: number;
    /** Feature utilization rate */
    featureUtilization: number;
  };
  /** Performance trends */
  trends: {
    /** Revenue trend */
    revenueTrend: 'increasing' | 'decreasing' | 'stable';
    /** Subscription trend */
    subscriptionTrend: 'increasing' | 'decreasing' | 'stable';
    /** Usage trend */
    usageTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

// ==================== PLAN TEMPLATE TYPES ====================

/**
 * Plan template
 */
export interface PlanTemplate {
  /** Template ID */
  templateId: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template tier */
  tier: PlanTier;
  /** Default duration */
  defaultDuration: u64;
  /** Default price range */
  defaultPriceRange: {
    min: i128;
    max: i128;
  };
  /** Default features */
  defaultFeatures: string[];
  /** Template metadata */
  metadata: Map<string, string>;
}

/**
 * Plan template creation request
 */
export interface CreatePlanTemplateRequest {
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template tier */
  tier: PlanTier;
  /** Default duration */
  defaultDuration: u64;
  /** Default price range */
  defaultPriceRange: {
    min: i128;
    max: i128;
  };
  /** Default features */
  defaultFeatures: string[];
  /** Template metadata */
  metadata?: Map<string, string>;
}

/**
 * Plan template usage request
 */
export interface UsePlanTemplateRequest {
  /** Template ID */
  templateId: string;
  /** Plan ID */
  planId: string;
  /** Customizations */
  customizations?: {
    /** Custom name */
    name?: string;
    /** Custom duration */
    duration?: u64;
    /** Custom price */
    price?: i128;
    /** Custom features */
    features?: string[];
  };
}

// ==================== PLAN MIGRATION TYPES ====================

/**
 * Plan migration request
 */
export interface PlanMigrationRequest {
  /** Source plan ID */
  sourcePlanId: string;
  /** Target plan ID */
  targetPlanId: string;
  /** Migration options */
  options: {
    /** Whether to migrate active subscriptions */
    migrateActiveSubscriptions?: boolean;
    /** Whether to preserve subscription history */
    preserveHistory?: boolean;
    /** Migration date */
    migrationDate?: u64;
  };
}

/**
 * Plan migration result
 */
export interface PlanMigrationResult {
  /** Whether migration was successful */
  success: boolean;
  /** Number of subscriptions migrated */
  migratedSubscriptions: u32;
  /** Migration errors */
  errors: string[];
  /** Migration timestamp */
  timestamp: u64;
}

/**
 * Plan deprecation request
 */
export interface PlanDeprecationRequest {
  /** Plan ID */
  planId: string;
  /** Deprecation date */
  deprecationDate: u64;
  /** Replacement plan ID */
  replacementPlanId?: string;
  /** Deprecation reason */
  reason: string;
}

/**
 * Plan deprecation result
 */
export interface PlanDeprecationResult {
  /** Whether deprecation was successful */
  success: boolean;
  /** Number of affected subscriptions */
  affectedSubscriptions: u32;
  /** Deprecation timestamp */
  timestamp: u64;
}

// ==================== PLAN BULK OPERATIONS TYPES ====================

/**
 * Bulk plan creation request
 */
export interface BulkPlanCreationRequest {
  /** Plans to create */
  plans: CreatePlanRequest[];
  /** Bulk operation options */
  options?: {
    /** Whether to continue on error */
    continueOnError?: boolean;
    /** Maximum batch size */
    maxBatchSize?: u32;
    /** Validation options */
    validate?: boolean;
  };
}

/**
 * Bulk plan creation result
 */
export interface BulkPlanCreationResult {
  /** Total plans processed */
  totalProcessed: u32;
  /** Successfully created plans */
  successful: CreatePlanRequest[];
  /** Failed plan creations */
  failed: Array<{
    plan: CreatePlanRequest;
    error: string;
  }>;
  /** Success rate */
  successRate: number;
}

/**
 * Bulk plan update request
 */
export interface BulkPlanUpdateRequest {
  /** Plan updates */
  updates: UpdatePlanRequest[];
  /** Bulk operation options */
  options?: {
    /** Whether to continue on error */
    continueOnError?: boolean;
    /** Maximum batch size */
    maxBatchSize?: u32;
  };
}

/**
 * Bulk plan update result
 */
export interface BulkPlanUpdateResult {
  /** Total plans processed */
  totalProcessed: u32;
  /** Successfully updated plans */
  successful: UpdatePlanRequest[];
  /** Failed plan updates */
  failed: Array<{
    update: UpdatePlanRequest;
    error: string;
  }>;
  /** Success rate */
  successRate: number;
}

// ==================== PLAN SEARCH TYPES ====================

/**
 * Plan search request
 */
export interface PlanSearchRequest {
  /** Search query */
  query: string;
  /** Search options */
  options?: {
    /** Filter by tier */
    tier?: PlanTier;
    /** Filter by price range */
    priceRange?: {
      min: i128;
      max: i128;
    };
    /** Filter by duration range */
    durationRange?: {
      min: u64;
      max: u64;
    };
    /** Filter by features */
    features?: string[];
    /** Maximum results */
    limit?: u32;
    /** Result offset */
    offset?: u32;
  };
}

/**
 * Plan search result
 */
export interface PlanSearchResult {
  /** Matching plans */
  plans: Plan[];
  /** Total matches */
  total: u32;
  /** Search relevance scores */
  relevanceScores: Map<string, number>;
  /** Search suggestions */
  suggestions: string[];
}

// ==================== PLAN EXPORT/IMPORT TYPES ====================

/**
 * Plan export request
 */
export interface PlanExportRequest {
  /** Plan IDs to export */
  planIds: string[];
  /** Export format */
  format: 'json' | 'csv' | 'yaml';
  /** Export options */
  options?: {
    /** Whether to include metadata */
    includeMetadata?: boolean;
    /** Whether to include analytics */
    includeAnalytics?: boolean;
  };
}

/**
 * Plan export result
 */
export interface PlanExportResult {
  /** Export data */
  data: string;
  /** Export format */
  format: string;
  /** Number of plans exported */
  planCount: u32;
  /** Export timestamp */
  timestamp: u64;
}

/**
 * Plan import request
 */
export interface PlanImportRequest {
  /** Import data */
  data: string;
  /** Import format */
  format: 'json' | 'csv' | 'yaml';
  /** Import options */
  options?: {
    /** Whether to validate before import */
    validate?: boolean;
    /** Whether to overwrite existing plans */
    overwrite?: boolean;
    /** Whether to create new plan IDs */
    generateNewIds?: boolean;
  };
}

/**
 * Plan import result */
export interface PlanImportResult {
  /** Whether import was successful */
  success: boolean;
  /** Number of plans imported */
  importedPlans: u32;
  /** Import errors */
  errors: string[];
  /** Import warnings */
  warnings: string[];
  /** Import timestamp */
  timestamp: u64;
}
