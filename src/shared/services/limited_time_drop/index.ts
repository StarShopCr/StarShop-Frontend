// ==================== MAIN SERVICE EXPORT ====================
export { LimitedTimeDropService } from './limited_drop.service';

// ==================== DROP TYPES ====================
export type {
  Drop,
  DropMetadata,
  DropAttribute,
  DropPricing,
  DropTimeConfig,
  DropSupply,
  CreateDropRequest,
  UpdateDropRequest,
  CancelDropRequest,
  ParticipateInDropRequest,
  ParticipationRecord,
  DropStatusSummary,
  ExtendDropRequest,
  DropResponse,
  TransactionResult,
  NetworkConfig,
  DropServiceConfig,
  RetryConfig,
  CacheConfig,
  HealthCheck,
  PerformanceMetrics,
  DropEventData,
  DropEventListener,
  DropEventSubscription,
  DropEventListenerOptions,
  DropFilter,
  DropValidation,
  u32,
  u64,
} from './types/drop.types';

export { DropStatus, DropEventType } from './types/drop.types';

// ==================== ACCESS TYPES ====================
export type {
  AccessRecord,
  CheckAccessRequest,
  AccessCheckResult,
  GrantAccessRequest,
  RevokeAccessRequest,
  AccessListResponse,
  GetAccessListOptions,
  BatchGrantAccessRequest,
  BatchGrantResult,
  TokenGateConfig,
  AccessStatistics,
  AccessValidation,
  AccessEventData,
} from './types/access.types';

export { AccessTier, AccessGrantType, AccessEventType } from './types/access.types';

// ==================== CONSTANTS ====================
export {
  NETWORKS,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  DROP_ERROR_CODES,
  ERROR_TYPES,
  API_ENDPOINTS,
  WALLET_PROVIDERS,
  PERFORMANCE_THRESHOLDS,
  HEALTH_CHECK_INTERVALS,
  DEFAULT_DROP_METADATA,
} from './constants/drop.constants';

// ==================== UTILITY FUNCTIONS ====================
export {
  // Address validation
  isValidStellarAddress,
  isValidContractAddress,
  isValidAddress,
  // Drop ID validation
  isValidDropId,
  // Metadata validation
  validateDropMetadata,
  // Time config validation
  validateDropTimeConfig,
  // Supply validation
  validateDropSupply,
  // Pricing validation
  validateDropPricing,
  // Time helpers
  getCurrentTimestampSeconds,
  isDropCurrentlyActive,
  calculateTimeRemainingSeconds,
  formatTimeRemaining,
  formatTimestamp,
  // Supply helpers
  calculateRemainingSupply,
  isDropSoldOut,
  getSupplyPercentage,
  buildDropStatusSummary,
  // Pricing helpers
  calculateTotalCost,
  formatStroopAmount,
  // Error handling
  getErrorType,
  // String helpers
  isValidUrl,
  sanitizeString,
  truncateString,
  // Utility helpers
  retryWithBackoff,
  generateUniqueId,
  safeJsonParse,
  deepClone,
  isEmpty,
  formatNumber,
  calculatePercentage,
  mergeWithDefaultMetadata,
  sortParticipationByRecent,
  filterActiveAccessRecords,
  meetsAccessTier,
} from './utils/drop.utils';

// ==================== CONVENIENCE FACTORY FUNCTIONS ====================

import { LimitedTimeDropService } from './limited_drop.service';
import { NETWORKS } from './constants/drop.constants';
import type { DropServiceConfig } from './types/drop.types';

/**
 * Create a LimitedTimeDropService configured for testnet.
 */
export function createTestnetDropService(
  config?: Partial<Omit<DropServiceConfig, 'network'>>,
): LimitedTimeDropService {
  return new LimitedTimeDropService({
    ...config,
    network: NETWORKS.testnet,
  });
}

/**
 * Create a LimitedTimeDropService configured for mainnet.
 */
export function createMainnetDropService(
  config?: Partial<Omit<DropServiceConfig, 'network'>>,
): LimitedTimeDropService {
  return new LimitedTimeDropService({
    ...config,
    network: NETWORKS.mainnet,
  });
}

// Default export
export default LimitedTimeDropService;
