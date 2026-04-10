import type { u32 } from '../types/drop.types';

/**
 * Error codes for the Limited Time Drop contract
 */
export const DROP_ERROR_CODES = {
  ALREADY_INITIALIZED: 1,
  UNAUTHORIZED: 2,
  DROP_NOT_FOUND: 3,
  DROP_NOT_ACTIVE: 4,
  DROP_ENDED: 5,
  DROP_CANCELLED: 6,
  DROP_SOLD_OUT: 7,
  INSUFFICIENT_SUPPLY: 8,
  MAX_PER_PARTICIPANT_EXCEEDED: 9,
  INVALID_TIME_CONFIG: 10,
  INVALID_PRICING: 11,
  INVALID_SUPPLY: 12,
  ACCESS_DENIED: 13,
  ALREADY_PARTICIPATED: 14,
  EXTENSION_EXCEEDS_LIMIT: 15,
  INVALID_ADDRESS: 16,
  PAYMENT_FAILED: 17,
  COOLDOWN_NOT_ELAPSED: 18,
  CONTRACT_NOT_INITIALIZED: 19,
  INVALID_DROP_ID: 20,
  INVALID_QUANTITY: 21,
  TOKEN_GATE_FAILED: 22,
  BATCH_OPERATION_PARTIAL_FAILURE: 23,
  INVALID_METADATA: 24,
  EXTENSION_NOT_ALLOWED: 25,
} as const;

/**
 * User-friendly error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<number, string> = {
  [DROP_ERROR_CODES.ALREADY_INITIALIZED]: 'Contract has already been initialized',
  [DROP_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized - admin or creator privileges required',
  [DROP_ERROR_CODES.DROP_NOT_FOUND]: 'Drop not found',
  [DROP_ERROR_CODES.DROP_NOT_ACTIVE]: 'Drop is not currently active',
  [DROP_ERROR_CODES.DROP_ENDED]: 'Drop has already ended',
  [DROP_ERROR_CODES.DROP_CANCELLED]: 'Drop has been cancelled',
  [DROP_ERROR_CODES.DROP_SOLD_OUT]: 'Drop is sold out',
  [DROP_ERROR_CODES.INSUFFICIENT_SUPPLY]: 'Insufficient supply for requested quantity',
  [DROP_ERROR_CODES.MAX_PER_PARTICIPANT_EXCEEDED]: 'Maximum units per participant exceeded',
  [DROP_ERROR_CODES.INVALID_TIME_CONFIG]: 'Invalid time configuration - start must be before end',
  [DROP_ERROR_CODES.INVALID_PRICING]: 'Invalid pricing configuration',
  [DROP_ERROR_CODES.INVALID_SUPPLY]: 'Invalid supply configuration',
  [DROP_ERROR_CODES.ACCESS_DENIED]: 'Access denied for this drop',
  [DROP_ERROR_CODES.ALREADY_PARTICIPATED]: 'Address has already participated in this drop',
  [DROP_ERROR_CODES.EXTENSION_EXCEEDS_LIMIT]: 'Extension exceeds maximum allowed duration',
  [DROP_ERROR_CODES.INVALID_ADDRESS]: 'Invalid Stellar address format',
  [DROP_ERROR_CODES.PAYMENT_FAILED]: 'Payment transaction failed',
  [DROP_ERROR_CODES.COOLDOWN_NOT_ELAPSED]: 'Cooldown period has not elapsed since last participation',
  [DROP_ERROR_CODES.CONTRACT_NOT_INITIALIZED]: 'Contract has not been initialized',
  [DROP_ERROR_CODES.INVALID_DROP_ID]: 'Invalid drop ID',
  [DROP_ERROR_CODES.INVALID_QUANTITY]: 'Invalid quantity - must be at least 1',
  [DROP_ERROR_CODES.TOKEN_GATE_FAILED]: 'Token gate requirement not satisfied',
  [DROP_ERROR_CODES.BATCH_OPERATION_PARTIAL_FAILURE]: 'Batch operation partially failed',
  [DROP_ERROR_CODES.INVALID_METADATA]: 'Invalid drop metadata',
  [DROP_ERROR_CODES.EXTENSION_NOT_ALLOWED]: 'Drop does not allow time extension',
} as const;

/**
 * Network configurations for testnet and mainnet
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CDROP_LIMITED_TIME_TESTNET_CONTRACT_ID_PLACEHOLDER',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true,
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    contractId: '', // Set after mainnet deployment
    rpcUrl: 'https://horizon.stellar.org',
    isTestnet: false,
  },
} as const;

/**
 * Default service configuration values
 */
export const DEFAULT_CONFIG = {
  /** Transaction timeout in seconds */
  TIMEOUT_SECONDS: 30,
  /** Default transaction fee in stroops */
  FEE: 100000,
  /** Simulate transactions by default */
  SIMULATE: true,
  /** Default retry configuration */
  RETRY: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  /** Default cache configuration */
  CACHE: {
    enabled: true,
    ttl: 60000,  // 1 minute (drops change rapidly)
    maxSize: 500,
  },
} as const;

/**
 * Validation limits and rules
 */
export const VALIDATION = {
  /** Maximum drop name length */
  MAX_NAME_LENGTH: 100,
  /** Maximum drop description length */
  MAX_DESCRIPTION_LENGTH: 2000,
  /** Maximum image URL length */
  MAX_IMAGE_URL_LENGTH: 500,
  /** Maximum external URL length */
  MAX_EXTERNAL_URL_LENGTH: 500,
  /** Maximum tags count */
  MAX_TAGS: 10,
  /** Maximum tag length */
  MAX_TAG_LENGTH: 50,
  /** Maximum attributes per drop */
  MAX_ATTRIBUTES: 20,
  /** Maximum attribute trait type length */
  MAX_ATTRIBUTE_TRAIT_LENGTH: 50,
  /** Maximum attribute value string length */
  MAX_ATTRIBUTE_VALUE_LENGTH: 200,
  /** Minimum drop duration in seconds (1 minute) */
  MIN_DURATION_SECONDS: 60,
  /** Maximum drop duration in seconds (30 days) */
  MAX_DURATION_SECONDS: 2592000,
  /** Maximum extension in seconds (7 days) */
  MAX_EXTENSION_SECONDS: 604800,
  /** Minimum total supply */
  MIN_TOTAL_SUPPLY: 1,
  /** Maximum total supply */
  MAX_TOTAL_SUPPLY: 10000000,
  /** Minimum units per participant */
  MIN_PER_PARTICIPANT: 1,
  /** Maximum units per participant */
  MAX_PER_PARTICIPANT: 100,
  /** Minimum price in stroops (0 = free) */
  MIN_PRICE_STROOPS: 0,
  /** Maximum batch grant size */
  MAX_BATCH_GRANT_SIZE: 1000,
  /** Minimum valid Stellar address length */
  STELLAR_ADDRESS_LENGTH: 56,
} as const;

/**
 * Cache keys for each cacheable data type
 */
export const CACHE_KEYS = {
  /** Full drop record by ID */
  DROP: (dropId: u32) => `drop:record:${dropId}`,
  /** Drop status summary */
  DROP_STATUS: (dropId: u32) => `drop:status:${dropId}`,
  /** Access record for a specific address on a drop */
  ACCESS: (dropId: u32, address: string) => `drop:access:${dropId}:${address}`,
  /** Access list for a drop */
  ACCESS_LIST: (dropId: u32) => `drop:access:list:${dropId}`,
  /** Participation record for a specific address */
  PARTICIPATION: (dropId: u32, address: string) => `drop:participation:${dropId}:${address}`,
  /** All participation records for a drop */
  PARTICIPATION_LIST: (dropId: u32) => `drop:participation:list:${dropId}`,
  /** Drops created by a specific creator */
  DROPS_BY_CREATOR: (creator: string) => `drop:creator:${creator}`,
  /** All active drops */
  ACTIVE_DROPS: 'drop:active:all',
  /** Contract admin address */
  ADMIN: 'drop:admin',
  /** Contract initialization flag */
  INITIALIZED: 'drop:initialized',
  /** Time remaining for a drop */
  TIME_REMAINING: (dropId: u32) => `drop:time:remaining:${dropId}`,
} as const;

/**
 * Contract method names as called via Soroban SDK
 */
export const CONTRACT_METHODS = {
  // Lifecycle
  INITIALIZE: 'initialize',
  // Drop management
  CREATE_DROP: 'create_drop',
  GET_DROP: 'get_drop',
  UPDATE_DROP: 'update_drop',
  CANCEL_DROP: 'cancel_drop',
  // Access control
  CHECK_ACCESS: 'check_access',
  GRANT_ACCESS: 'grant_access',
  REVOKE_ACCESS: 'revoke_access',
  GET_ACCESS_LIST: 'get_access_list',
  // Drop operations
  PARTICIPATE_IN_DROP: 'participate_in_drop',
  TRACK_PARTICIPATION: 'track_participation',
  GET_DROP_STATUS: 'get_drop_status',
  GET_PARTICIPATION: 'get_participation',
  // Time management
  IS_DROP_ACTIVE: 'is_drop_active',
  GET_TIME_REMAINING: 'get_time_remaining',
  EXTEND_DROP: 'extend_drop',
  // Admin
  GET_ADMIN: 'get_admin',
  IS_INITIALIZED: 'is_initialized',
} as const;

/**
 * Contract event names emitted by the Soroban contract
 */
export const CONTRACT_EVENTS = {
  DROP_CREATED: 'DropCreated',
  DROP_UPDATED: 'DropUpdated',
  DROP_CANCELLED: 'DropCancelled',
  DROP_ENDED: 'DropEnded',
  DROP_EXTENDED: 'DropExtended',
  PARTICIPATION_RECORDED: 'ParticipationRecorded',
  ACCESS_GRANTED: 'AccessGranted',
  ACCESS_REVOKED: 'AccessRevoked',
  CONTRACT_INITIALIZED: 'ContractInitialized',
} as const;

/**
 * Error type classification strings
 */
export const ERROR_TYPES = {
  NETWORK_ERROR: 'network_error',
  CONTRACT_ERROR: 'contract_error',
  VALIDATION_ERROR: 'validation_error',
  WALLET_ERROR: 'wallet_error',
  ACCESS_ERROR: 'access_error',
  SUPPLY_ERROR: 'supply_error',
  TIME_ERROR: 'time_error',
  PAYMENT_ERROR: 'payment_error',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

/**
 * API endpoint URLs
 */
export const API_ENDPOINTS = {
  HORIZON_TESTNET: 'https://horizon-testnet.stellar.org',
  HORIZON_MAINNET: 'https://horizon.stellar.org',
  SOROBAN_TESTNET: 'https://soroban-testnet.stellar.org',
  SOROBAN_MAINNET: 'https://soroban-mainnet.stellar.org',
} as const;

/**
 * Wallet provider identifiers
 */
export const WALLET_PROVIDERS = {
  FREIGHTER: 'freighter',
  RABET: 'rabet',
  XBULL: 'xbull',
  LOBSTR: 'lobstr',
} as const;

/**
 * Performance and monitoring thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Maximum acceptable response time in milliseconds */
  MAX_RESPONSE_TIME: 5000,
  /** Maximum cache size */
  MAX_CACHE_SIZE: 10000,
  /** Cache TTL in milliseconds */
  CACHE_TTL: 60000,
  /** Maximum retry attempts */
  MAX_RETRY_ATTEMPTS: 5,
  /** Base retry delay in milliseconds */
  RETRY_DELAY: 1000,
  /** Batch operation timeout in milliseconds */
  BATCH_TIMEOUT: 60000,
} as const;

/**
 * Health check intervals in milliseconds
 */
export const HEALTH_CHECK_INTERVALS = {
  CONTRACT_CHECK: 30000,  // 30 seconds
  NETWORK_CHECK: 60000,   // 1 minute
  WALLET_CHECK: 15000,    // 15 seconds
} as const;

/**
 * Default metadata values
 */
export const DEFAULT_DROP_METADATA = {
  NAME: 'Unnamed Drop',
  DESCRIPTION: 'No description provided',
  TAGS: [] as string[],
  ATTRIBUTES: [] as Array<{ traitType: string; value: string }>,
} as const;
