import type { u32, u64, i128, Map } from '@stellar/stellar-sdk';

// ==================== USAGE TRACKING TYPES ====================

/**
 * Feature usage tracking information
 */
export interface FeatureUsage {
  /** Feature name */
  feature: string;
  /** Usage count */
  usageCount: u32;
  /** Usage limit */
  usageLimit: u32;
  /** Last used timestamp */
  lastUsed: u64;
  /** Whether limit is reached */
  isLimitReached: boolean;
  /** Usage period start */
  periodStart: u64;
  /** Usage period end */
  periodEnd: u64;
  /** Usage metadata */
  metadata: Map<string, string>;
}

/**
 * User usage summary
 */
export interface UserUsageSummary {
  /** User address */
  user: string;
  /** Total features used */
  totalFeaturesUsed: u32;
  /** Total usage count */
  totalUsageCount: u32;
  /** Usage by feature */
  usageByFeature: Map<string, u32>;
  /** Usage limits by feature */
  limitsByFeature: Map<string, u32>;
  /** Usage period */
  period: {
    start: u64;
    end: u64;
  };
  /** Usage efficiency score */
  efficiencyScore: number;
}

/**
 * Feature usage analytics
 */
export interface FeatureUsageAnalytics {
  /** Feature name */
  feature: string;
  /** Total usage across all users */
  totalUsage: u32;
  /** Unique users who used this feature */
  uniqueUsers: u32;
  /** Average usage per user */
  averageUsagePerUser: number;
  /** Usage trends over time */
  usageTrends: Map<string, u32>;
  /** Most active users */
  topUsers: Array<{
    user: string;
    usageCount: u32;
  }>;
}

/**
 * Usage limit configuration
 */
export interface UsageLimitConfig {
  /** Feature name */
  feature: string;
  /** Usage limit */
  limit: u32;
  /** Limit period in seconds */
  period: u64;
  /** Whether limit resets automatically */
  autoReset: boolean;
  /** Limit type */
  limitType: UsageLimitType;
  /** Limit metadata */
  metadata: Map<string, string>;
}

/**
 * Usage limit types
 */
export enum UsageLimitType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
  CUSTOM = 'custom'
}

/**
 * Usage tracking request
 */
export interface UsageTrackingRequest {
  /** User address */
  user: string;
  /** Feature name */
  feature: string;
  /** Usage count to add */
  usageCount?: u32;
  /** Usage metadata */
  metadata?: Map<string, string>;
}

/**
 * Usage tracking result
 */
export interface UsageTrackingResult {
  /** Whether tracking was successful */
  success: boolean;
  /** Updated usage information */
  usage: FeatureUsage;
  /** Whether limit was exceeded */
  limitExceeded: boolean;
  /** Remaining usage */
  remainingUsage: u32;
  /** Tracking timestamp */
  timestamp: u64;
}

// ==================== USAGE ANALYTICS TYPES ====================

/**
 * Usage analytics request
 */
export interface UsageAnalyticsRequest {
  /** User address (optional) */
  user?: string;
  /** Feature name (optional) */
  feature?: string;
  /** Time range */
  timeRange: {
    start: u64;
    end: u64;
  };
  /** Analytics options */
  options?: {
    /** Whether to include trends */
    includeTrends?: boolean;
    /** Whether to include comparisons */
    includeComparisons?: boolean;
    /** Whether to include predictions */
    includePredictions?: boolean;
  };
}

/**
 * Usage analytics result
 */
export interface UsageAnalytics {
  /** Analytics time range */
  timeRange: {
    start: u64;
    end: u64;
  };
  /** Total usage */
  totalUsage: u32;
  /** Usage by feature */
  usageByFeature: Map<string, u32>;
  /** Usage by user */
  usageByUser: Map<string, u32>;
  /** Usage trends */
  trends?: {
    /** Trend direction */
    direction: 'increasing' | 'decreasing' | 'stable';
    /** Trend strength */
    strength: number;
    /** Trend data points */
    dataPoints: Array<{
      timestamp: u64;
      value: u32;
    }>;
  };
  /** Usage comparisons */
  comparisons?: {
    /** Previous period comparison */
    previousPeriod: {
      usage: u32;
      change: number;
    };
    /** Peer comparison */
    peerComparison: {
      averageUsage: u32;
      userRanking: number;
    };
  };
  /** Usage predictions */
  predictions?: {
    /** Predicted usage for next period */
    predictedUsage: u32;
    /** Prediction confidence */
    confidence: number;
    /** Prediction factors */
    factors: string[];
  };
}

/**
 * Usage report request
 */
export interface UsageReportRequest {
  /** Report type */
  reportType: UsageReportType;
  /** User address (optional) */
  user?: string;
  /** Feature name (optional) */
  feature?: string;
  /** Time range */
  timeRange: {
    start: u64;
    end: u64;
  };
  /** Report format */
  format: 'json' | 'csv' | 'pdf';
  /** Report options */
  options?: {
    /** Whether to include charts */
    includeCharts?: boolean;
    /** Whether to include recommendations */
    includeRecommendations?: boolean;
    /** Report template */
    template?: string;
  };
}

/**
 * Usage report types
 */
export enum UsageReportType {
  USER_USAGE = 'user_usage',
  FEATURE_USAGE = 'feature_usage',
  SYSTEM_USAGE = 'system_usage',
  COMPARATIVE_USAGE = 'comparative_usage',
  PREDICTIVE_USAGE = 'predictive_usage'
}

/**
 * Usage report result
 */
export interface UsageReportResult {
  /** Report data */
  data: string;
  /** Report format */
  format: string;
  /** Report type */
  reportType: UsageReportType;
  /** Report metadata */
  metadata: {
    generatedAt: u64;
    timeRange: {
      start: u64;
      end: u64;
    };
    dataPoints: u32;
  };
}

// ==================== USAGE LIMIT MANAGEMENT TYPES ====================

/**
 * Usage limit creation request
 */
export interface CreateUsageLimitRequest {
  /** Feature name */
  feature: string;
  /** Usage limit */
  limit: u32;
  /** Limit period in seconds */
  period: u64;
  /** Whether limit resets automatically */
  autoReset: boolean;
  /** Limit type */
  limitType: UsageLimitType;
  /** Limit metadata */
  metadata?: Map<string, string>;
}

/**
 * Usage limit update request
 */
export interface UpdateUsageLimitRequest {
  /** Feature name */
  feature: string;
  /** New usage limit */
  limit?: u32;
  /** New limit period */
  period?: u64;
  /** New auto-reset setting */
  autoReset?: boolean;
  /** New limit type */
  limitType?: UsageLimitType;
  /** New metadata */
  metadata?: Map<string, string>;
}

/**
 * Usage limit deletion request
 */
export interface DeleteUsageLimitRequest {
  /** Feature name */
  feature: string;
}

/**
 * Usage limit query request
 */
export interface UsageLimitQueryRequest {
  /** Feature name */
  feature: string;
}

/**
 * Usage limit list request
 */
export interface UsageLimitListRequest {
  /** Filter by limit type */
  limitType?: UsageLimitType;
  /** Maximum results */
  limit?: u32;
  /** Result offset */
  offset?: u32;
}

/**
 * Usage limit list result
 */
export interface UsageLimitListResult {
  /** List of usage limits */
  limits: UsageLimitConfig[];
  /** Total number of limits */
  total: u32;
  /** Whether there are more results */
  hasMore: boolean;
  /** Next offset for pagination */
  nextOffset?: u32;
}

// ==================== USAGE MONITORING TYPES ====================

/**
 * Usage monitoring configuration
 */
export interface UsageMonitoringConfig {
  /** Whether monitoring is enabled */
  enabled: boolean;
  /** Monitoring interval in seconds */
  interval: u64;
  /** Alert thresholds */
  alertThresholds: {
    /** Usage threshold percentage */
    usageThreshold: number;
    /** Limit threshold percentage */
    limitThreshold: number;
  };
  /** Monitoring features */
  features: string[];
}

/**
 * Usage alert
 */
export interface UsageAlert {
  /** Alert ID */
  alertId: string;
  /** Alert type */
  alertType: UsageAlertType;
  /** User address */
  user: string;
  /** Feature name */
  feature: string;
  /** Alert message */
  message: string;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert timestamp */
  timestamp: u64;
  /** Alert metadata */
  metadata: Map<string, string>;
}

/**
 * Usage alert types
 */
export enum UsageAlertType {
  USAGE_LIMIT_REACHED = 'usage_limit_reached',
  USAGE_LIMIT_WARNING = 'usage_limit_warning',
  USAGE_SPIKE = 'usage_spike',
  USAGE_ANOMALY = 'usage_anomaly',
  FEATURE_OVERUSE = 'feature_overuse'
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Usage monitoring result
 */
export interface UsageMonitoringResult {
  /** Whether monitoring was successful */
  success: boolean;
  /** Number of alerts generated */
  alertsGenerated: u32;
  /** Monitoring timestamp */
  timestamp: u64;
  /** Monitoring errors */
  errors: string[];
}

// ==================== USAGE OPTIMIZATION TYPES ====================

/**
 * Usage optimization request
 */
export interface UsageOptimizationRequest {
  /** User address */
  user: string;
  /** Optimization type */
  optimizationType: UsageOptimizationType;
  /** Optimization options */
  options?: {
    /** Whether to include recommendations */
    includeRecommendations?: boolean;
    /** Whether to include cost analysis */
    includeCostAnalysis?: boolean;
    /** Optimization period */
    period?: u64;
  };
}

/**
 * Usage optimization types
 */
export enum UsageOptimizationType {
  EFFICIENCY = 'efficiency',
  COST = 'cost',
  PERFORMANCE = 'performance',
  FEATURE = 'feature'
}

/**
 * Usage optimization result
 */
export interface UsageOptimizationResult {
  /** Optimization score (0-100) */
  score: number;
  /** Optimization recommendations */
  recommendations: UsageOptimizationRecommendation[];
  /** Cost analysis */
  costAnalysis?: {
    /** Current cost */
    currentCost: i128;
    /** Optimized cost */
    optimizedCost: i128;
    /** Potential savings */
    potentialSavings: i128;
  };
  /** Performance analysis */
  performanceAnalysis?: {
    /** Current performance */
    currentPerformance: number;
    /** Optimized performance */
    optimizedPerformance: number;
    /** Performance improvement */
    improvement: number;
  };
}

/**
 * Usage optimization recommendation
 */
export interface UsageOptimizationRecommendation {
  /** Recommendation type */
  type: string;
  /** Recommendation title */
  title: string;
  /** Recommendation description */
  description: string;
  /** Implementation difficulty */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Expected impact */
  impact: 'low' | 'medium' | 'high';
  /** Implementation steps */
  steps: string[];
}

// ==================== USAGE BULK OPERATIONS TYPES ====================

/**
 * Bulk usage tracking request
 */
export interface BulkUsageTrackingRequest {
  /** Usage tracking requests */
  requests: UsageTrackingRequest[];
  /** Bulk operation options */
  options?: {
    /** Whether to continue on error */
    continueOnError?: boolean;
    /** Maximum batch size */
    maxBatchSize?: u32;
  };
}

/**
 * Bulk usage tracking result
 */
export interface BulkUsageTrackingResult {
  /** Total requests processed */
  totalProcessed: u32;
  /** Successfully processed requests */
  successful: UsageTrackingRequest[];
  /** Failed requests */
  failed: Array<{
    request: UsageTrackingRequest;
    error: string;
  }>;
  /** Success rate */
  successRate: number;
}

/**
 * Bulk usage limit update request
 */
export interface BulkUsageLimitUpdateRequest {
  /** Usage limit updates */
  updates: UpdateUsageLimitRequest[];
  /** Bulk operation options */
  options?: {
    /** Whether to continue on error */
    continueOnError?: boolean;
    /** Maximum batch size */
    maxBatchSize?: u32;
  };
}

/**
 * Bulk usage limit update result
 */
export interface BulkUsageLimitUpdateResult {
  /** Total updates processed */
  totalProcessed: u32;
  /** Successfully updated limits */
  successful: UpdateUsageLimitRequest[];
  /** Failed updates */
  failed: Array<{
    update: UpdateUsageLimitRequest;
    error: string;
  }>;
  /** Success rate */
  successRate: number;
}

// ==================== USAGE EXPORT/IMPORT TYPES ====================

/**
 * Usage data export request
 */
export interface UsageDataExportRequest {
  /** User addresses to export */
  users?: string[];
  /** Features to export */
  features?: string[];
  /** Time range */
  timeRange: {
    start: u64;
    end: u64;
  };
  /** Export format */
  format: 'json' | 'csv' | 'excel';
  /** Export options */
  options?: {
    /** Whether to include metadata */
    includeMetadata?: boolean;
    /** Whether to include analytics */
    includeAnalytics?: boolean;
    /** Export template */
    template?: string;
  };
}

/**
 * Usage data export result
 */
export interface UsageDataExportResult {
  /** Export data */
  data: string;
  /** Export format */
  format: string;
  /** Number of records exported */
  recordCount: u32;
  /** Export timestamp */
  timestamp: u64;
}

/**
 * Usage data import request
 */
export interface UsageDataImportRequest {
  /** Import data */
  data: string;
  /** Import format */
  format: 'json' | 'csv' | 'excel';
  /** Import options */
  options?: {
    /** Whether to validate before import */
    validate?: boolean;
    /** Whether to overwrite existing data */
    overwrite?: boolean;
    /** Import mode */
    mode: 'append' | 'replace' | 'merge';
  };
}

/**
 * Usage data import result
 */
export interface UsageDataImportResult {
  /** Whether import was successful */
  success: boolean;
  /** Number of records imported */
  importedRecords: u32;
  /** Import errors */
  errors: string[];
  /** Import warnings */
  warnings: string[];
  /** Import timestamp */
  timestamp: u64;
}

// ==================== USAGE PREDICTION TYPES ====================

/**
 * Usage prediction request
 */
export interface UsagePredictionRequest {
  /** User address */
  user: string;
  /** Feature name */
  feature: string;
  /** Prediction period */
  predictionPeriod: u64;
  /** Prediction options */
  options?: {
    /** Whether to include confidence intervals */
    includeConfidenceIntervals?: boolean;
    /** Whether to include trend analysis */
    includeTrendAnalysis?: boolean;
    /** Prediction model */
    model?: string;
  };
}

/**
 * Usage prediction result
 */
export interface UsagePredictionResult {
  /** Predicted usage */
  predictedUsage: u32;
  /** Prediction confidence */
  confidence: number;
  /** Confidence interval */
  confidenceInterval?: {
    lower: u32;
    upper: u32;
  };
  /** Trend analysis */
  trendAnalysis?: {
    /** Trend direction */
    direction: 'increasing' | 'decreasing' | 'stable';
    /** Trend strength */
    strength: number;
    /** Trend factors */
    factors: string[];
  };
  /** Prediction model used */
  model: string;
  /** Prediction timestamp */
  timestamp: u64;
}

// ==================== USAGE COMPARISON TYPES ====================

/**
 * Usage comparison request
 */
export interface UsageComparisonRequest {
  /** Comparison type */
  comparisonType: UsageComparisonType;
  /** Comparison parameters */
  parameters: {
    /** User addresses to compare */
    users?: string[];
    /** Features to compare */
    features?: string[];
    /** Time periods to compare */
    timePeriods?: Array<{
      start: u64;
      end: u64;
    }>;
  };
  /** Comparison options */
  options?: {
    /** Whether to include statistical analysis */
    includeStatisticalAnalysis?: boolean;
    /** Whether to include visualizations */
    includeVisualizations?: boolean;
  };
}

/**
 * Usage comparison types
 */
export enum UsageComparisonType {
  USER_COMPARISON = 'user_comparison',
  FEATURE_COMPARISON = 'feature_comparison',
  TIME_PERIOD_COMPARISON = 'time_period_comparison',
  PLAN_COMPARISON = 'plan_comparison'
}

/**
 * Usage comparison result
 */
export interface UsageComparisonResult {
  /** Comparison type */
  comparisonType: UsageComparisonType;
  /** Comparison data */
  comparisonData: Map<string, u32>;
  /** Statistical analysis */
  statisticalAnalysis?: {
    /** Mean usage */
    mean: number;
    /** Median usage */
    median: number;
    /** Standard deviation */
    standardDeviation: number;
    /** Variance */
    variance: number;
  };
  /** Comparison insights */
  insights: string[];
  /** Comparison timestamp */
  timestamp: u64;
}
