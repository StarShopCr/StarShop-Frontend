// ==================== MAIN SERVICE EXPORT ====================

export { PromotionalBoostService } from './boost.service';

// ==================== BOOST TYPE EXPORTS ====================

export type {
  BoostServiceConfig,
  NetworkConfig,
  BoostResponse,
  TransactionResult,
  BoostData,
  CreateBoostRequest,
  UpdateBoostRequest,
  CancelBoostRequest,
  ActivateBoostRequest,
  BoostFilter,
  BoostSearchResult,
  BoostStats,
  BoostValidation,
  AdminInfo,
  HealthCheck,
  PerformanceMetrics,
  BatchOperationResult,
  EventListenerOptions,
  BoostEventData,
  BoostEventListener,
  EventSubscription,
  Address,
  BoostId,
  SlotId,
  VisibilityStats as BoostVisibilityStats,
  RetryConfig,
  CacheConfig,
} from './types/boost.types';

export { BoostStatus, BoostTier, BoostTargetType, BoostEventType } from './types/boost.types';

// ==================== VISIBILITY TYPE EXPORTS ====================

export type {
  VisibilityConfig,
  VisibilityStats,
  SetVisibilityLevelRequest,
  BoostVisibilityRequest,
  VisibilitySnapshot,
  VisibilityHistory,
  VisibilityReport,
  UpgradeVisibilityRequest,
  VisibilityComparison,
  VisibilityPricing,
  VisibilityScoreResult,
  VisibilityScoreComponent,
  PlacementAvailability,
} from './types/visibility.types';

export { VisibilityLevel, PlacementType } from './types/visibility.types';

// ==================== PAYMENT TYPE EXPORTS ====================

export type {
  PaymentRecord,
  ProcessBoostPaymentRequest,
  GetPaymentStatusRequest,
  RefundBoostPaymentRequest,
  RefundRecord,
  BoostCostCalculation,
  CostBreakdownItem,
  BoostPaymentHistory,
  PaymentStats,
  PaymentValidation,
  RefundValidation,
  PaymentReceipt,
  BoostSubscriptionPlan,
  TokenBalanceInfo,
  PriceFeedEntry,
} from './types/payments.types';

export { PaymentStatus, PaymentMethod, RefundReason } from './types/payments.types';

// ==================== CONSTANT EXPORTS ====================

export {
  NETWORKS,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  BOOST_ERROR_CODES,
  ERROR_TYPES,
  TIER_PRICING,
  VISIBILITY_CONFIGS,
  PLATFORM_FEES,
  DURATION_DISCOUNTS,
  SUPPORTED_TOKENS,
  API_ENDPOINTS,
  PERFORMANCE_THRESHOLDS,
  HEALTH_CHECK_INTERVALS,
  SLOT_CONFIG,
} from './constants/boost.constants';

// ==================== UTILITY FUNCTION EXPORTS ====================

export {
  isValidStellarAddress,
  isValidContractAddress,
  isValidAddress,
  isValidBoostId,
  isValidDuration,
  isValidBoostAmount,
  isValidPriorityScore,
  validateCreateBoostRequest,
  validateUpdateBoostRequest,
  calculateBoostCost,
  validatePaymentAmount,
  validateRefundEligibility,
  isTokenSupported,
  calculateVisibilityScore,
  formatBoostId,
  parseBoostId,
  formatDuration,
  formatAmountToXLM,
  xlmToStroops,
  stroopsToXLM,
  isBoostActive,
  isBoostExpired,
  getRemainingBoostTime,
  getErrorType,
  retryWithBackoff,
  debounce,
  throttle,
  generatePaymentId,
  generateRefundId,
  sanitizeString,
  safeJsonParse,
  safeJsonStringify,
  deepClone,
  generateSubscriptionId,
  calculateCTR,
  getPerformanceGrade,
  generateVisibilityRecommendations,
} from './utils/boost.utils';

// ==================== CONVENIENCE FUNCTIONS ====================

import { PromotionalBoostService } from './boost.service';
import { NETWORKS } from './constants/boost.constants';
import type { BoostServiceConfig } from './types/boost.types';

/**
 * Create a new PromotionalBoostService instance with testnet configuration
 *
 * @param config - Optional partial configuration overrides
 * @returns Configured PromotionalBoostService instance
 *
 * @example
 * ```typescript
 * const service = createTestnetBoostService();
 * const boost = await service.createBoost({ ... });
 * ```
 */
export function createTestnetBoostService(
  config?: Partial<BoostServiceConfig>
): PromotionalBoostService {
  return new PromotionalBoostService({
    network: NETWORKS.testnet,
    ...config,
  });
}

/**
 * Create a new PromotionalBoostService instance with mainnet configuration
 *
 * @param config - Optional partial configuration overrides
 * @returns Configured PromotionalBoostService instance
 *
 * @example
 * ```typescript
 * const service = createMainnetBoostService();
 * const boost = await service.createBoost({ ... });
 * ```
 */
export function createMainnetBoostService(
  config?: Partial<BoostServiceConfig>
): PromotionalBoostService {
  return new PromotionalBoostService({
    network: NETWORKS.mainnet,
    ...config,
  });
}

/**
 * Create a simulation-mode PromotionalBoostService (no real transactions)
 *
 * @param config - Optional partial configuration overrides
 * @returns Configured PromotionalBoostService instance in simulation mode
 */
export function createSimulationBoostService(
  config?: Partial<BoostServiceConfig>
): PromotionalBoostService {
  return new PromotionalBoostService({
    network: NETWORKS.testnet,
    simulate: true,
    ...config,
  });
}

// Default export
export default PromotionalBoostService;
