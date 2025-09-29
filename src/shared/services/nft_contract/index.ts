// Main service export
export { NFTService } from './nft.service';

// Type exports
export type {
  NFTServiceConfig,
  NetworkConfig,
  NFTResponse,
  TransactionResult,
  NFTMetadata,
  NFTDetail,
  MintRequest,
  MetadataUpdateRequest,
  TransferRequest,
  BurnRequest,
  SupplyInfo,
  AdminInfo,
  OwnershipInfo,
  SupplyValidation,
  MetadataValidation,
  OwnershipValidation,
  BatchOperationResult,
  NFTFilter,
  NFTSearchResult,
  HealthCheck,
  PerformanceMetrics,
  TokenId,
  Address,
  NFTEventType,
  NFTEventData,
  NFTEventListener,
  EventSubscription,
  EventListenerOptions,
  CacheConfig,
  RetryConfig
} from './types/nft.types';

export type {
  ExtendedNFTMetadata,
  NFTAttribute,
  AttributeType,
  MetadataValidationResult,
  MetadataValidationRules,
  MetadataTemplate,
  MetadataSchema,
  MetadataTransformOptions,
  MetadataQueryOptions,
  MetadataStatistics,
  MetadataExportFormat,
  MetadataExportOptions,
  MetadataImportOptions,
  MetadataBackup,
  MetadataRestoreOptions,
  MetadataMigrationOptions
} from './types/metadata.types';

// Constant exports
export {
  NETWORKS,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  NFT_ERROR_CODES,
  ERROR_TYPES,
  WALLET_PROVIDERS,
  API_ENDPOINTS,
  METADATA_TEMPLATES,
  COMMON_ATTRIBUTES,
  PERFORMANCE_THRESHOLDS,
  HEALTH_CHECK_INTERVALS,
  DEFAULT_METADATA,
  METADATA_VALIDATION_RULES
} from './constants/nft.constants';

// Utility function exports
export {
  formatTokenId,
  parseTokenId,
  isValidStellarAddress,
  isValidContractAddress,
  isValidTokenId,
  validateNFTMetadata,
  parseMetadata,
  calculateSupplyInfo,
  isSupplyExhausted,
  getRemainingSupplyPercentage,
  retryWithBackoff,
  getErrorType,
  validateOwnership,
  sanitizeMetadataString,
  generateRandomAttributes,
  transformToExtendedMetadata,
  inferAttributeType,
  isValidUrl,
  isValidYouTubeUrl,
  isValidColor,
  debounce,
  throttle,
  safeJsonParse,
  safeJsonStringify,
  deepClone,
  formatNumber,
  truncateString,
  calculatePercentage,
  generateUniqueId,
  isEmpty
} from './utils/nft.utils';

// Event type exports
export { NFTEventType } from './types/nft.types';
export { AttributeType } from './types/metadata.types';

// Default export
export default NFTService;
