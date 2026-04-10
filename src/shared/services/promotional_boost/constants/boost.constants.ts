import type { u32 } from '@stellar/stellar-sdk';
import { BoostTier, VisibilityLevel } from '../types/boost.types';

// Re-export VisibilityLevel from visibility types via boost types
export { VisibilityLevel } from '../types/visibility.types';

/**
 * Boost contract error codes
 */
export const BOOST_ERROR_CODES = {
  ALREADY_INITIALIZED: 1,
  UNAUTHORIZED: 2,
  BOOST_NOT_FOUND: 3,
  BOOST_ALREADY_ACTIVE: 4,
  BOOST_NOT_ACTIVE: 5,
  BOOST_EXPIRED: 6,
  BOOST_CANCELLED: 7,
  INVALID_TIER: 8,
  INVALID_DURATION: 9,
  INVALID_TARGET: 10,
  INSUFFICIENT_PAYMENT: 11,
  PAYMENT_FAILED: 12,
  REFUND_FAILED: 13,
  REFUND_NOT_ELIGIBLE: 14,
  SLOT_NOT_AVAILABLE: 15,
  SLOT_NOT_FOUND: 16,
  MAX_SLOTS_REACHED: 17,
  VISIBILITY_LEVEL_INVALID: 18,
  CONTRACT_NOT_INITIALIZED: 19,
  INVALID_ADDRESS: 20,
  INVALID_AMOUNT: 21,
  DUPLICATE_BOOST: 22,
  RATE_LIMIT_EXCEEDED: 23,
  TOKEN_NOT_SUPPORTED: 24,
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [BOOST_ERROR_CODES.ALREADY_INITIALIZED]: 'Contract has already been initialized',
  [BOOST_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access - admin privileges required',
  [BOOST_ERROR_CODES.BOOST_NOT_FOUND]: 'Boost not found',
  [BOOST_ERROR_CODES.BOOST_ALREADY_ACTIVE]: 'Boost is already active',
  [BOOST_ERROR_CODES.BOOST_NOT_ACTIVE]: 'Boost is not currently active',
  [BOOST_ERROR_CODES.BOOST_EXPIRED]: 'Boost has expired',
  [BOOST_ERROR_CODES.BOOST_CANCELLED]: 'Boost has been cancelled',
  [BOOST_ERROR_CODES.INVALID_TIER]: 'Invalid boost tier specified',
  [BOOST_ERROR_CODES.INVALID_DURATION]: 'Invalid boost duration',
  [BOOST_ERROR_CODES.INVALID_TARGET]: 'Invalid boost target',
  [BOOST_ERROR_CODES.INSUFFICIENT_PAYMENT]: 'Insufficient payment amount',
  [BOOST_ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed',
  [BOOST_ERROR_CODES.REFUND_FAILED]: 'Refund processing failed',
  [BOOST_ERROR_CODES.REFUND_NOT_ELIGIBLE]: 'Boost is not eligible for refund',
  [BOOST_ERROR_CODES.SLOT_NOT_AVAILABLE]: 'No available slots for this boost tier',
  [BOOST_ERROR_CODES.SLOT_NOT_FOUND]: 'Slot not found',
  [BOOST_ERROR_CODES.MAX_SLOTS_REACHED]: 'Maximum slots reached for this tier',
  [BOOST_ERROR_CODES.VISIBILITY_LEVEL_INVALID]: 'Invalid visibility level',
  [BOOST_ERROR_CODES.CONTRACT_NOT_INITIALIZED]: 'Contract not initialized',
  [BOOST_ERROR_CODES.INVALID_ADDRESS]: 'Invalid address format',
  [BOOST_ERROR_CODES.INVALID_AMOUNT]: 'Invalid amount specified',
  [BOOST_ERROR_CODES.DUPLICATE_BOOST]: 'Duplicate boost already exists for this target',
  [BOOST_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded - please try again later',
  [BOOST_ERROR_CODES.TOKEN_NOT_SUPPORTED]: 'Payment token is not supported',
} as const;

/**
 * Network configurations
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CBOOSTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true,
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    contractId: '', // To be set when deployed to mainnet
    rpcUrl: 'https://horizon.stellar.org',
    isTestnet: false,
  },
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  /** Default transaction timeout in seconds */
  TIMEOUT_SECONDS: 30,
  /** Default transaction fee in stroops */
  FEE: 100000,
  /** Default simulation enabled */
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
    ttl: 300000, // 5 minutes
    maxSize: 1000,
  },
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Minimum boost duration in seconds (1 hour) */
  MIN_DURATION_SECONDS: 3600,
  /** Maximum boost duration in seconds (90 days) */
  MAX_DURATION_SECONDS: 7776000,
  /** Minimum boost amount in stroops */
  MIN_BOOST_AMOUNT: 10000000,
  /** Maximum boost amount in stroops */
  MAX_BOOST_AMOUNT: 1000000000000,
  /** Maximum number of active boosts per user */
  MAX_ACTIVE_BOOSTS_PER_USER: 10,
  /** Maximum number of slots per tier */
  MAX_SLOTS_PER_TIER: 100,
  /** Maximum priority score */
  MAX_PRIORITY_SCORE: 1000,
  /** Minimum priority score */
  MIN_PRIORITY_SCORE: 1,
  /** Maximum geo targets per boost */
  MAX_GEO_TARGETS: 50,
  /** Maximum category targets per boost */
  MAX_CATEGORY_TARGETS: 20,
  /** Refund eligibility window in seconds (24 hours) */
  REFUND_ELIGIBILITY_WINDOW_SECONDS: 86400,
  /** Maximum cancel reason length */
  MAX_CANCEL_REASON_LENGTH: 500,
} as const;

/**
 * Boost tier pricing configurations
 */
export const TIER_PRICING = {
  [BoostTier.BASIC]: {
    /** Base cost per day in XLM stroops */
    baseCostPerDay: 100000000, // 10 XLM
    /** Visibility multiplier */
    visibilityMultiplier: 1.0,
    /** Maximum slots available */
    maxSlots: 100,
    /** Priority score assigned */
    priorityScore: 100,
    /** Impression multiplier */
    impressionMultiplier: 1.5,
  },
  [BoostTier.STANDARD]: {
    baseCostPerDay: 300000000, // 30 XLM
    visibilityMultiplier: 2.0,
    maxSlots: 50,
    priorityScore: 300,
    impressionMultiplier: 3.0,
  },
  [BoostTier.PREMIUM]: {
    baseCostPerDay: 700000000, // 70 XLM
    visibilityMultiplier: 3.5,
    maxSlots: 20,
    priorityScore: 700,
    impressionMultiplier: 6.0,
  },
  [BoostTier.ELITE]: {
    baseCostPerDay: 1500000000, // 150 XLM
    visibilityMultiplier: 6.0,
    maxSlots: 5,
    priorityScore: 1000,
    impressionMultiplier: 12.0,
  },
} as const;

/**
 * Visibility level configurations
 */
export const VISIBILITY_CONFIGS = {
  [VisibilityLevel.HIDDEN]: {
    displayName: 'Hidden',
    scoreRange: [0, 0],
    impressionBonus: 0,
    placements: [],
  },
  [VisibilityLevel.LOW]: {
    displayName: 'Low',
    scoreRange: [1, 200],
    impressionBonus: 10,
    placements: ['search_results'],
  },
  [VisibilityLevel.MEDIUM]: {
    displayName: 'Medium',
    scoreRange: [201, 400],
    impressionBonus: 25,
    placements: ['search_results', 'category_page'],
  },
  [VisibilityLevel.HIGH]: {
    displayName: 'High',
    scoreRange: [401, 600],
    impressionBonus: 50,
    placements: ['search_results', 'category_page', 'sidebar'],
  },
  [VisibilityLevel.FEATURED]: {
    displayName: 'Featured',
    scoreRange: [601, 800],
    impressionBonus: 100,
    placements: ['search_results', 'category_page', 'sidebar', 'home_featured'],
  },
  [VisibilityLevel.SPOTLIGHT]: {
    displayName: 'Spotlight',
    scoreRange: [801, 1000],
    impressionBonus: 200,
    placements: ['search_results', 'category_page', 'sidebar', 'home_featured', 'banner', 'popup'],
  },
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  /** Boost data cache key */
  BOOST: (boostId: u32) => `boost:data:${boostId}`,
  /** Boost list cache key */
  BOOST_LIST: (owner?: string) => owner ? `boost:list:${owner}` : 'boost:list:all',
  /** Visibility config cache key */
  VISIBILITY_CONFIG: (boostId: u32) => `boost:visibility:${boostId}`,
  /** Visibility stats cache key */
  VISIBILITY_STATS: (boostId: u32) => `boost:visibility:stats:${boostId}`,
  /** Slot status cache key */
  SLOT_STATUS: (slotId: u32) => `boost:slot:${slotId}`,
  /** Available slots cache key */
  AVAILABLE_SLOTS: (tier: string) => `boost:slots:available:${tier}`,
  /** Payment record cache key */
  PAYMENT: (paymentId: string) => `boost:payment:${paymentId}`,
  /** Payment history cache key */
  PAYMENT_HISTORY: (boostId: u32) => `boost:payment:history:${boostId}`,
  /** Boost cost cache key */
  BOOST_COST: (tier: string, duration: string) => `boost:cost:${tier}:${duration}`,
  /** Admin cache key */
  ADMIN: 'boost:admin',
  /** Contract initialization cache key */
  INITIALIZED: 'boost:initialized',
  /** Contract stats cache key */
  STATS: 'boost:stats',
} as const;

/**
 * Contract method names
 */
export const CONTRACT_METHODS = {
  // Initialization
  INITIALIZE: 'initialize',
  GET_ADMIN: 'get_admin',
  IS_INITIALIZED: 'is_initialized',
  // Boost management
  CREATE_BOOST: 'create_boost',
  GET_BOOST: 'get_boost',
  UPDATE_BOOST: 'update_boost',
  CANCEL_BOOST: 'cancel_boost',
  ACTIVATE_BOOST: 'activate_boost',
  LIST_BOOSTS: 'list_boosts',
  GET_BOOST_STATUS: 'get_boost_status',
  // Visibility management
  SET_VISIBILITY_LEVEL: 'set_visibility_level',
  GET_VISIBILITY_LEVEL: 'get_visibility_level',
  BOOST_VISIBILITY: 'boost_visibility',
  GET_VISIBILITY_STATS: 'get_visibility_stats',
  // Slot management
  RESERVE_SLOT: 'reserve_slot',
  GET_AVAILABLE_SLOTS: 'get_available_slots',
  RELEASE_SLOT: 'release_slot',
  GET_SLOT_STATUS: 'get_slot_status',
  // Payment processing
  PROCESS_BOOST_PAYMENT: 'process_boost_payment',
  GET_PAYMENT_STATUS: 'get_payment_status',
  REFUND_BOOST_PAYMENT: 'refund_boost_payment',
  GET_BOOST_COST: 'get_boost_cost',
} as const;

/**
 * Contract event names
 */
export const CONTRACT_EVENTS = {
  BOOST_CREATED: 'BoostCreated',
  BOOST_ACTIVATED: 'BoostActivated',
  BOOST_UPDATED: 'BoostUpdated',
  BOOST_CANCELLED: 'BoostCancelled',
  BOOST_EXPIRED: 'BoostExpired',
  BOOST_COMPLETED: 'BoostCompleted',
  VISIBILITY_CHANGED: 'VisibilityChanged',
  SLOT_RESERVED: 'SlotReserved',
  SLOT_RELEASED: 'SlotReleased',
  PAYMENT_PROCESSED: 'PaymentProcessed',
  PAYMENT_REFUNDED: 'PaymentRefunded',
  CONTRACT_INITIALIZED: 'ContractInitialized',
} as const;

/**
 * Common error types
 */
export const ERROR_TYPES = {
  /** Network/connection errors */
  NETWORK_ERROR: 'network_error',
  /** Contract/transaction errors */
  CONTRACT_ERROR: 'contract_error',
  /** Validation errors */
  VALIDATION_ERROR: 'validation_error',
  /** Wallet errors */
  WALLET_ERROR: 'wallet_error',
  /** Payment errors */
  PAYMENT_ERROR: 'payment_error',
  /** Boost errors */
  BOOST_ERROR: 'boost_error',
  /** Slot errors */
  SLOT_ERROR: 'slot_error',
  /** Visibility errors */
  VISIBILITY_ERROR: 'visibility_error',
  /** Unknown errors */
  UNKNOWN_ERROR: 'unknown_error',
} as const;

/**
 * Platform fee configuration
 */
export const PLATFORM_FEES = {
  /** Platform fee percentage (basis points, 100 = 1%) */
  FEE_BASIS_POINTS: 250, // 2.5%
  /** Minimum fee in stroops */
  MIN_FEE: 1000000, // 0.1 XLM
  /** Maximum fee cap in stroops */
  MAX_FEE: 100000000, // 10 XLM
} as const;

/**
 * Duration discount tiers
 */
export const DURATION_DISCOUNTS = {
  /** 7+ day discount (percentage) */
  WEEK_DISCOUNT: 5,
  /** 14+ day discount (percentage) */
  TWO_WEEK_DISCOUNT: 10,
  /** 30+ day discount (percentage) */
  MONTH_DISCOUNT: 20,
  /** 90+ day discount (percentage) */
  QUARTER_DISCOUNT: 35,
} as const;

/**
 * Supported payment tokens
 */
export const SUPPORTED_TOKENS = {
  /** XLM native token */
  XLM: 'native',
  /** USDC on Stellar */
  USDC_TESTNET: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  USDC_MAINNET: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  /** Stellar Horizon API */
  HORIZON_TESTNET: 'https://horizon-testnet.stellar.org',
  HORIZON_MAINNET: 'https://horizon.stellar.org',
  /** Soroban RPC */
  SOROBAN_TESTNET: 'https://soroban-testnet.stellar.org',
  SOROBAN_MAINNET: 'https://soroban-mainnet.stellar.org',
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Maximum response time in milliseconds */
  MAX_RESPONSE_TIME: 5000,
  /** Maximum cache size */
  MAX_CACHE_SIZE: 10000,
  /** Cache TTL in milliseconds */
  CACHE_TTL: 300000, // 5 minutes
  /** Maximum retry attempts */
  MAX_RETRY_ATTEMPTS: 5,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 1000,
  /** Batch operation timeout in milliseconds */
  BATCH_TIMEOUT: 30000,
} as const;

/**
 * Health check intervals
 */
export const HEALTH_CHECK_INTERVALS = {
  /** Contract health check interval in milliseconds */
  CONTRACT_CHECK: 30000, // 30 seconds
  /** Network health check interval in milliseconds */
  NETWORK_CHECK: 60000, // 1 minute
  /** Wallet health check interval in milliseconds */
  WALLET_CHECK: 15000, // 15 seconds
} as const;

/**
 * Slot configuration per tier
 */
export const SLOT_CONFIG = {
  [BoostTier.BASIC]: {
    totalSlots: 100,
    reservationTimeout: 300, // 5 minutes in seconds
    maxReservationDuration: 7776000, // 90 days
  },
  [BoostTier.STANDARD]: {
    totalSlots: 50,
    reservationTimeout: 300,
    maxReservationDuration: 7776000,
  },
  [BoostTier.PREMIUM]: {
    totalSlots: 20,
    reservationTimeout: 600, // 10 minutes
    maxReservationDuration: 7776000,
  },
  [BoostTier.ELITE]: {
    totalSlots: 5,
    reservationTimeout: 900, // 15 minutes
    maxReservationDuration: 7776000,
  },
} as const;
