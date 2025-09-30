// ==================== MAIN EXPORTS ====================

// Service class
export { SubscriptionService } from './subscription.service';

// Types
export * from './types/subscription.types';
export * from './types/plan.types';
export * from './types/usage.types';

// Constants
export * from './constants/subscription.constants';

// Utilities
export * from './utils/subscription.utils';

// ==================== CONVENIENCE EXPORTS ====================

// Re-export commonly used types for easier imports
export type {
  SubscriptionServiceConfig,
  NetworkConfig,
  SubscriptionResponse,
  TransactionResult,
  Plan,
  PlanConfig,
  SubscriptionRequest,
  RenewalRequest,
  ResetSubscriptionRequest,
  SubscriptionInfo,
  SubscriptionStatus,
  FeatureAccessRequest,
  FeatureUsage,
  UserRole,
  RoleAssignmentRequest,
  SubscriptionState,
  PlanTier,
  SubscriptionErrorCode,
  PlanErrorCode,
  FeatureAccessErrorCode,
  HealthCheck,
  PerformanceMetrics,
  SubscriptionEventType,
  SubscriptionEventData,
  SubscriptionEventListener,
  EventListenerOptions,
  EventSubscription,
  SubscriptionAnalytics,
  RevenueMetrics,
  UsageMetrics,
  BatchOperationResult,
  PlanId,
  FeatureName,
  UserAddress,
  ContractAddress,
  TransactionHash,
  SubscriptionId,
  RoleName
} from './types/subscription.types';

export type {
  CreatePlanRequest,
  UpdatePlanRequest,
  DisablePlanRequest,
  PlanQueryRequest,
  PlanListRequest,
  PlanListResult,
  PlanDetail,
  PlanComparison,
  PlanRecommendationRequest,
  PlanRecommendation,
  PlanValidationRequest,
  PlanValidationResult,
  PlanAnalyticsRequest,
  PlanAnalytics,
  PlanPerformanceMetrics,
  PlanTemplate,
  CreatePlanTemplateRequest,
  UsePlanTemplateRequest,
  PlanMigrationRequest,
  PlanMigrationResult,
  PlanDeprecationRequest,
  PlanDeprecationResult,
  BulkPlanCreationRequest,
  BulkPlanCreationResult,
  BulkPlanUpdateRequest,
  BulkPlanUpdateResult,
  PlanSearchRequest,
  PlanSearchResult,
  PlanExportRequest,
  PlanExportResult,
  PlanImportRequest,
  PlanImportResult
} from './types/plan.types';

export type {
  FeatureUsage as UsageFeatureUsage,
  UserUsageSummary,
  FeatureUsageAnalytics,
  UsageLimitConfig,
  UsageLimitType,
  UsageTrackingRequest,
  UsageTrackingResult,
  UsageAnalyticsRequest,
  UsageAnalytics,
  UsageReportRequest,
  UsageReportType,
  UsageReportResult,
  CreateUsageLimitRequest,
  UpdateUsageLimitRequest,
  DeleteUsageLimitRequest,
  UsageLimitQueryRequest,
  UsageLimitListRequest,
  UsageLimitListResult,
  UsageMonitoringConfig,
  UsageAlert,
  UsageAlertType,
  AlertSeverity,
  UsageMonitoringResult,
  UsageOptimizationRequest,
  UsageOptimizationType,
  UsageOptimizationResult,
  UsageOptimizationRecommendation,
  BulkUsageTrackingRequest,
  BulkUsageTrackingResult,
  BulkUsageLimitUpdateRequest,
  BulkUsageLimitUpdateResult,
  UsageDataExportRequest,
  UsageDataExportResult,
  UsageDataImportRequest,
  UsageDataImportResult,
  UsagePredictionRequest,
  UsagePredictionResult,
  UsageComparisonRequest,
  UsageComparisonType,
  UsageComparisonResult
} from './types/usage.types';

// ==================== CONVENIENCE FUNCTIONS ====================

/**
 * Create a new subscription service instance
 */
export function createSubscriptionService(config: SubscriptionServiceConfig): SubscriptionService {
  return new SubscriptionService(config);
}

/**
 * Create a subscription service with default testnet configuration
 */
export function createTestnetSubscriptionService(): SubscriptionService {
  return new SubscriptionService({
    network: {
      contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
      networkPassphrase: 'Test SDF Network ; September 2015',
      rpcUrl: 'https://soroban-testnet.stellar.org',
      isTestnet: true
    }
  });
}

/**
 * Create a subscription service with default mainnet configuration
 */
export function createMainnetSubscriptionService(): SubscriptionService {
  return new SubscriptionService({
    network: {
      contractId: 'MAINNET_CONTRACT_ID', // Replace with actual mainnet contract ID
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
      rpcUrl: 'https://horizon.stellar.org',
      isTestnet: false
    }
  });
}

// ==================== DEFAULT EXPORTS ====================

export default SubscriptionService;
