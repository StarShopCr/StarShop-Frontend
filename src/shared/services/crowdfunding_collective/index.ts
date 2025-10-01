// Main service export
export { CrowdfundingService } from './crowdfunding.service';

// Type exports
export type {
  // Core types
  Campaign,
  CampaignConfig,
  CampaignStatus,
  Contribution,
  RewardTier,
  Milestone,
  
  // Request types
  CreateCampaignRequest,
  ContributionRequest,
  DistributeFundsRequest,
  RefundRequest,
  ClaimRewardRequest,
  UpdateMilestoneRequest,
  
  // Response types
  CrowdfundingResponse,
  TransactionResult,
  
  // Configuration types
  CrowdfundingServiceConfig,
  NetworkConfig,
  RetryConfig,
  CacheConfig,
  
  // Statistics types
  CampaignStats,
  ContributorStats,
  
  // Filter and search types
  CampaignFilter,
  CampaignSearchResult,
  
  // Health and monitoring types
  HealthCheck,
  PerformanceMetrics,
  
  // Event types
  CrowdfundingEventType,
  CrowdfundingEventData,
  CrowdfundingEventListener,
  EventSubscription,
  EventListenerOptions,
  
  // Utility types
  CampaignId,
  Address,
  AdminInfo,
  BatchOperationResult,
  CampaignValidation,
  ContributionValidation
} from './types/crowdfunding.types';

// Event types
export type {
  CampaignCreatedEvent,
  CampaignUpdatedEvent,
  CampaignStatusChangedEvent,
  CampaignCancelledEvent,
  CampaignCompletedEvent,
  ContributionMadeEvent,
  FundsDistributedEvent,
  RefundProcessedEvent,
  RewardClaimedEvent,
  MilestoneAchievedEvent,
  AdminChangedEvent,
  ContractInitializedEvent,
  ErrorEvent,
  CrowdfundingEvent,
  EventFilter,
  EventSubscriptionOptions,
  EventListenerConfig
} from './types/events.types';

// Constants exports
export {
  CROWDFUNDING_ERROR_CODES,
  ERROR_MESSAGES,
  NETWORKS,
  DEFAULT_CONFIG,
  VALIDATION,
  CACHE_KEYS,
  ERROR_TYPES,
  API_ENDPOINTS,
  WALLET_PROVIDERS,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  CAMPAIGN_CATEGORIES,
  PERFORMANCE_THRESHOLDS,
  HEALTH_CHECK_INTERVALS,
  DEFAULT_CAMPAIGN,
  CAMPAIGN_VALIDATION_RULES,
  CONTRIBUTION_VALIDATION_RULES,
  REWARD_VALIDATION_RULES,
  MILESTONE_VALIDATION_RULES
} from './constants/crowdfunding.constants';

// Utility functions
export {
  isValidStellarAddress,
  isValidCampaignId,
  isValidAmount,
  isValidTimestamp,
  isValidStringLength,
  isValidUrl,
  validateCampaignConfig,
  validateContributionRequest,
  validateRewardTier,
  validateMilestone,
  calculateCompletionPercentage,
  isGoalReached,
  isCampaignActive,
  isDeadlinePassed,
  getTimeRemaining,
  formatAmount,
  parseAmount,
  sanitizeString,
  generateUniqueId,
  retryWithBackoff,
  getErrorType,
  filterCampaigns,
  sortCampaigns,
  calculateCampaignStats,
  calculateContributorStats,
  canContribute,
  canClaimReward
} from './utils/crowdfunding.utils';
