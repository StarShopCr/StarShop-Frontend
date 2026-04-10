import { VisibilityLevel, SlotType, BoostErrorCode, BoostStatus } from '../types/boost.types';

// ==================== NETWORK CONFIGURATION ====================

export const NETWORKS = {
  testnet: {
    contractId: 'PROMOTIONAL_BOOST_TESTNET_CONTRACT_ID',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  },
  mainnet: {
    contractId: 'PROMOTIONAL_BOOST_MAINNET_CONTRACT_ID',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://horizon.stellar.org',
    isTestnet: false
  }
} as const;

// ==================== DEFAULT CONFIG ====================

export const DEFAULT_CONFIG = {
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  cache: {
    enabled: true,
    ttl: 300000,
    maxSize: 1000
  }
} as const;

// ==================== CONTRACT METHODS ====================

export const CONTRACT_METHODS = {
  // Boost management
  CREATE_BOOST: 'create_boost',
  GET_BOOST: 'get_boost',
  UPDATE_BOOST: 'update_boost',
  CANCEL_BOOST: 'cancel_boost',
  ACTIVATE_BOOST: 'activate_boost',
  PAUSE_BOOST: 'pause_boost',
  LIST_BOOSTS: 'list_boosts',

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
  PROCESS_PAYMENT: 'process_boost_payment',
  GET_PAYMENT_STATUS: 'get_payment_status',
  REFUND_PAYMENT: 'refund_boost_payment',
  GET_BOOST_COST: 'get_boost_cost',

  // Admin
  INITIALIZE: 'initialize',
  GET_ADMIN: 'get_admin',
  TRANSFER_ADMIN: 'transfer_admin',

  // Analytics
  GET_ANALYTICS: 'get_boost_analytics',
  GET_PERFORMANCE: 'get_boost_performance'
} as const;

// ==================== CACHE KEYS ====================

export const CACHE_KEYS = {
  BOOST: (boostId: string) => `boost:${boostId}`,
  PRODUCT_BOOSTS: (productId: string) => `product_boosts:${productId}`,
  VISIBILITY: (productId: string) => `visibility:${productId}`,
  SLOT: (slotId: string) => `slot:${slotId}`,
  AVAILABLE_SLOTS: (slotType: string) => `available_slots:${slotType}`,
  PAYMENT: (boostId: string) => `payment:${boostId}`,
  ANALYTICS: 'boost_analytics',
  HEALTH_CHECK: 'boost_health_check'
} as const;

export const CACHE_TTL = {
  BOOST: 60000,
  PRODUCT_BOOSTS: 120000,
  VISIBILITY: 30000,
  SLOT: 15000,
  AVAILABLE_SLOTS: 10000,
  PAYMENT: 60000,
  ANALYTICS: 900000,
  HEALTH_CHECK: 30000
} as const;

// ==================== VALIDATION ====================

export const VALIDATION = {
  ADDRESS: {
    MIN_LENGTH: 56,
    MAX_LENGTH: 56,
    PATTERN: /^G[A-Z0-9]{55}$/
  },
  BOOST: {
    DURATION: {
      MIN: 3600,       // 1 hour
      MAX: 2592000     // 30 days
    },
    BUDGET: {
      MIN: 100000,     // minimum budget
      MAX: 10000000000 // maximum budget
    }
  },
  SLOT: {
    DURATION: {
      MIN: 3600,
      MAX: 604800      // 7 days
    }
  },
  PRODUCT_ID: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  }
} as const;

// ==================== VISIBILITY TIERS ====================

export const VISIBILITY_TIERS = {
  [VisibilityLevel.STANDARD]: {
    level: VisibilityLevel.STANDARD,
    multiplier: 1.0,
    maxDuration: 2592000,
    features: ['basic_listing'],
    priority: 0,
    costPerHour: 0
  },
  [VisibilityLevel.ENHANCED]: {
    level: VisibilityLevel.ENHANCED,
    multiplier: 1.5,
    maxDuration: 2592000,
    features: ['basic_listing', 'highlighted_border', 'priority_sort'],
    priority: 1,
    costPerHour: 100
  },
  [VisibilityLevel.PREMIUM]: {
    level: VisibilityLevel.PREMIUM,
    multiplier: 2.5,
    maxDuration: 1296000,
    features: ['basic_listing', 'highlighted_border', 'priority_sort', 'badge', 'top_placement'],
    priority: 2,
    costPerHour: 300
  },
  [VisibilityLevel.FEATURED]: {
    level: VisibilityLevel.FEATURED,
    multiplier: 5.0,
    maxDuration: 604800,
    features: ['basic_listing', 'highlighted_border', 'priority_sort', 'badge', 'top_placement', 'carousel', 'banner'],
    priority: 3,
    costPerHour: 1000
  }
} as const;

// ==================== SLOT CONFIGURATION ====================

export const SLOT_CONFIG = {
  [SlotType.HOMEPAGE_BANNER]: {
    maxSlots: 3,
    basePrice: 5000,
    maxDuration: 604800,
    position: 1
  },
  [SlotType.CATEGORY_TOP]: {
    maxSlots: 5,
    basePrice: 2000,
    maxDuration: 604800,
    position: 2
  },
  [SlotType.SEARCH_PRIORITY]: {
    maxSlots: 10,
    basePrice: 1000,
    maxDuration: 2592000,
    position: 3
  },
  [SlotType.SIDEBAR]: {
    maxSlots: 8,
    basePrice: 500,
    maxDuration: 2592000,
    position: 4
  },
  [SlotType.FEATURED_CAROUSEL]: {
    maxSlots: 6,
    basePrice: 3000,
    maxDuration: 604800,
    position: 5
  }
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES: Record<BoostErrorCode, string> = {
  [BoostErrorCode.NOT_INITIALIZED]: 'Service not initialized. Call initialize() first.',
  [BoostErrorCode.ALREADY_INITIALIZED]: 'Service already initialized.',
  [BoostErrorCode.UNAUTHORIZED]: 'Unauthorized access.',
  [BoostErrorCode.BOOST_NOT_FOUND]: 'Boost not found.',
  [BoostErrorCode.BOOST_ALREADY_ACTIVE]: 'Boost is already active.',
  [BoostErrorCode.BOOST_EXPIRED]: 'Boost has expired.',
  [BoostErrorCode.INVALID_CONFIG]: 'Invalid boost configuration.',
  [BoostErrorCode.SLOT_UNAVAILABLE]: 'Requested slot is not available.',
  [BoostErrorCode.SLOT_NOT_FOUND]: 'Slot not found.',
  [BoostErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds for this operation.',
  [BoostErrorCode.PAYMENT_FAILED]: 'Payment processing failed.',
  [BoostErrorCode.REFUND_FAILED]: 'Refund processing failed.',
  [BoostErrorCode.CONTRACT_ERROR]: 'Contract execution failed.',
  [BoostErrorCode.NETWORK_ERROR]: 'Network connection failed.',
  [BoostErrorCode.WALLET_ERROR]: 'Wallet connection failed.',
  [BoostErrorCode.VALIDATION_ERROR]: 'Input validation failed.',
  [BoostErrorCode.TIMEOUT_ERROR]: 'Operation timed out.'
};

// ==================== BOOST STATUS CONFIG ====================

export const BOOST_STATUS_CONFIG = {
  [BoostStatus.PENDING]: {
    name: 'Pending',
    color: '#F59E0B',
    description: 'Boost is pending activation'
  },
  [BoostStatus.ACTIVE]: {
    name: 'Active',
    color: '#10B981',
    description: 'Boost is currently active'
  },
  [BoostStatus.PAUSED]: {
    name: 'Paused',
    color: '#6B7280',
    description: 'Boost is temporarily paused'
  },
  [BoostStatus.EXPIRED]: {
    name: 'Expired',
    color: '#EF4444',
    description: 'Boost has expired'
  },
  [BoostStatus.CANCELLED]: {
    name: 'Cancelled',
    color: '#9CA3AF',
    description: 'Boost was cancelled'
  }
} as const;

// ==================== FEE CALCULATION ====================

export const FEE_CALCULATION = {
  BASE_FEE: 100000,
  GAS_MULTIPLIER: 1.1,
  MAX_FEE: 10000000,
  MIN_FEE: 100000,
  PLATFORM_FEE_PERCENT: 5,
  OPERATION_FEES: {
    CREATE_BOOST: 300000,
    UPDATE_BOOST: 200000,
    CANCEL_BOOST: 150000,
    ACTIVATE_BOOST: 250000,
    RESERVE_SLOT: 200000,
    RELEASE_SLOT: 100000,
    PROCESS_PAYMENT: 300000,
    REFUND_PAYMENT: 250000
  }
} as const;

// ==================== TIMEOUT CONFIGURATION ====================

export const TIMEOUT_CONFIG = {
  DEFAULT: 30000,
  NETWORK: 10000,
  TRANSACTION: 60000,
  HEALTH_CHECK: 5000,
  CACHE: 1000,
  OPERATION_TIMEOUTS: {
    CREATE_BOOST: 45000,
    ACTIVATE_BOOST: 40000,
    PROCESS_PAYMENT: 60000,
    REFUND_PAYMENT: 60000,
    RESERVE_SLOT: 30000
  }
} as const;

// ==================== EVENT TYPES ====================

export const EVENT_TYPES = {
  BOOST_CREATED: 'boost_created',
  BOOST_ACTIVATED: 'boost_activated',
  BOOST_PAUSED: 'boost_paused',
  BOOST_CANCELLED: 'boost_cancelled',
  BOOST_EXPIRED: 'boost_expired',
  BOOST_UPDATED: 'boost_updated',
  VISIBILITY_CHANGED: 'visibility_changed',
  SLOT_RESERVED: 'slot_reserved',
  SLOT_RELEASED: 'slot_released',
  PAYMENT_PROCESSED: 'payment_processed',
  PAYMENT_REFUNDED: 'payment_refunded',
  ERROR: 'error'
} as const;
