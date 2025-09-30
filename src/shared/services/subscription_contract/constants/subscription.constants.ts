import { PlanTier, SubscriptionState, SubscriptionErrorCode, PlanErrorCode, FeatureAccessErrorCode } from '../types/subscription.types';

// ==================== NETWORK CONFIGURATION ====================

/**
 * Predefined network configurations
 */
export const NETWORKS = {
  testnet: {
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  },
  mainnet: {
    contractId: 'MAINNET_CONTRACT_ID', // Replace with actual mainnet contract ID
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://horizon.stellar.org',
    isTestnet: false
  },
  futurenet: {
    contractId: 'FUTURENET_CONTRACT_ID', // Replace with actual futurenet contract ID
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    rpcUrl: 'https://rpc-futurenet.stellar.org',
    isTestnet: true
  }
} as const;

/**
 * Default service configuration
 */
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
    ttl: 300000, // 5 minutes
    maxSize: 1000
  },
  monitoring: {
    enabled: true,
    metricsInterval: 60000, // 1 minute
    healthCheckInterval: 30000 // 30 seconds
  }
} as const;

// ==================== CONTRACT METHODS ====================

/**
 * Contract method names
 */
export const CONTRACT_METHODS = {
  // Plan management
  CREATE_PLAN: 'create_plan',
  UPDATE_PLAN: 'update_plan',
  DISABLE_PLAN: 'disable_plan',
  GET_PLAN: 'get_plan',
  LIST_PLANS: 'list_plans',
  
  // Subscription management
  SUBSCRIBE: 'subscribe',
  RENEW: 'renew',
  RESET_SUBSCRIPTION: 'reset_subscription',
  GET_SUBSCRIPTION: 'get_subscription',
  GET_SUBSCRIPTION_STATE: 'get_subscription_state',
  IS_ACTIVE_SUB: 'is_active_sub',
  IS_EXPIRED_SUB: 'is_expired_sub',
  IS_IN_GRACE: 'is_in_grace',
  
  // Feature access
  PREMIUM_CONTENT: 'premium_content',
  GOLD_FEATURE: 'gold_feature',
  GET_FEATURE_USAGE: 'get_feature_usage',
  TRACK_FEATURE_USAGE: 'track_feature_usage',
  
  // User roles
  ADD_USER_ROLE: 'add_user_role',
  REMOVE_USER_ROLE: 'remove_user_role',
  GET_USER_ROLES: 'get_user_roles',
  
  // Cleanup
  CLEANUP: 'cleanup',
  
  // Admin functions
  INITIALIZE: 'initialize',
  GET_ADMIN: 'get_admin',
  TRANSFER_ADMIN: 'transfer_admin',
  
  // Analytics
  GET_ANALYTICS: 'get_analytics',
  GET_USAGE_STATS: 'get_usage_stats'
} as const;

// ==================== CACHE KEYS ====================

/**
 * Cache key patterns
 */
export const CACHE_KEYS = {
  PLAN: (planId: string) => `plan:${planId}`,
  SUBSCRIPTION: (user: string, planId: string) => `subscription:${user}:${planId}`,
  USER_SUBSCRIPTIONS: (user: string) => `user_subscriptions:${user}`,
  PLAN_SUBSCRIPTIONS: (planId: string) => `plan_subscriptions:${planId}`,
  FEATURE_USAGE: (user: string, feature: string) => `feature_usage:${user}:${feature}`,
  USER_ROLES: (user: string) => `user_roles:${user}`,
  ANALYTICS: (type: string) => `analytics:${type}`,
  HEALTH_CHECK: 'health_check',
  PERFORMANCE_METRICS: 'performance_metrics'
} as const;

/**
 * Cache TTL values (in milliseconds)
 */
export const CACHE_TTL = {
  PLAN: 300000, // 5 minutes
  SUBSCRIPTION: 60000, // 1 minute
  USER_SUBSCRIPTIONS: 120000, // 2 minutes
  PLAN_SUBSCRIPTIONS: 300000, // 5 minutes
  FEATURE_USAGE: 30000, // 30 seconds
  USER_ROLES: 600000, // 10 minutes
  ANALYTICS: 900000, // 15 minutes
  HEALTH_CHECK: 30000, // 30 seconds
  PERFORMANCE_METRICS: 60000 // 1 minute
} as const;

// ==================== VALIDATION RULES ====================

/**
 * Validation rules and limits
 */
export const VALIDATION = {
  // Address validation
  ADDRESS: {
    MIN_LENGTH: 56,
    MAX_LENGTH: 56,
    PATTERN: /^G[A-Z0-9]{55}$/
  },
  
  // Plan validation
  PLAN: {
    ID: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50,
      PATTERN: /^[a-zA-Z0-9_-]+$/
    },
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100
    },
    DURATION: {
      MIN: 86400, // 1 day
      MAX: 31536000 // 1 year
    },
    PRICE: {
      MIN: 0,
      MAX: 1000000000000000 // 1M tokens
    },
    BENEFITS: {
      MAX_COUNT: 50,
      MAX_LENGTH: 200
    }
  },
  
  // Subscription validation
  SUBSCRIPTION: {
    GRACE_PERIOD: 86400, // 1 day
    MAX_RENEWALS: 100,
    MAX_DURATION: 31536000 // 1 year
  },
  
  // Feature validation
  FEATURE: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50,
      PATTERN: /^[a-zA-Z0-9_-]+$/
    },
    USAGE_LIMIT: {
      MIN: 1,
      MAX: 1000000
    }
  },
  
  // Role validation
  ROLE: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 30,
      PATTERN: /^[a-zA-Z0-9_-]+$/
    },
    MAX_ROLES_PER_USER: 10
  }
} as const;

// ==================== ERROR MESSAGES ====================

/**
 * Standardized error messages
 */
export const ERROR_MESSAGES = {
  // General errors
  NOT_INITIALIZED: 'Service not initialized. Call initialize() first.',
  ALREADY_INITIALIZED: 'Service already initialized.',
  UNAUTHORIZED_ACCESS: 'Unauthorized access. Admin privileges required.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction.',
  CONTRACT_ERROR: 'Contract execution failed.',
  NETWORK_ERROR: 'Network connection failed.',
  WALLET_ERROR: 'Wallet connection failed.',
  VALIDATION_ERROR: 'Input validation failed.',
  TIMEOUT_ERROR: 'Operation timed out.',
  
  // Plan errors
  PLAN_NOT_FOUND: 'Plan not found.',
  PLAN_DISABLED: 'Plan is disabled.',
  PLAN_ALREADY_EXISTS: 'Plan already exists.',
  INVALID_PLAN_ID: 'Invalid plan ID format.',
  INVALID_PLAN_CONFIG: 'Invalid plan configuration.',
  
  // Subscription errors
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found.',
  SUBSCRIPTION_EXPIRED: 'Subscription has expired.',
  SUBSCRIPTION_ALREADY_ACTIVE: 'Subscription already active.',
  INVALID_USER_ADDRESS: 'Invalid user address.',
  SUBSCRIPTION_RENEWAL_FAILED: 'Subscription renewal failed.',
  
  // Feature access errors
  FEATURE_ACCESS_DENIED: 'Feature access denied.',
  FEATURE_NOT_AVAILABLE: 'Feature not available.',
  USAGE_LIMIT_EXCEEDED: 'Usage limit exceeded.',
  INVALID_FEATURE: 'Invalid feature name.',
  
  // Role errors
  ROLE_NOT_ASSIGNED: 'Role not assigned to user.',
  INVALID_ROLE: 'Invalid role name.',
  ROLE_ALREADY_ASSIGNED: 'Role already assigned to user.',
  
  // Validation errors
  INVALID_ADDRESS: 'Invalid address format.',
  INVALID_AMOUNT: 'Invalid amount value.',
  INVALID_DURATION: 'Invalid duration value.',
  INVALID_FEATURE_NAME: 'Invalid feature name format.',
  INVALID_ROLE_NAME: 'Invalid role name format.',
  
  // Cache errors
  CACHE_ERROR: 'Cache operation failed.',
  CACHE_MISS: 'Cache miss.',
  
  // Analytics errors
  ANALYTICS_ERROR: 'Analytics operation failed.',
  INSUFFICIENT_DATA: 'Insufficient data for analysis.'
} as const;

// ==================== FEE CALCULATION ====================

/**
 * Fee calculation constants
 */
export const FEE_CALCULATION = {
  BASE_FEE: 100000, // 0.0001 XLM
  GAS_MULTIPLIER: 1.1,
  MAX_FEE: 10000000, // 0.01 XLM
  MIN_FEE: 100000, // 0.0001 XLM
  
  // Operation-specific fees
  OPERATION_FEES: {
    CREATE_PLAN: 200000,
    UPDATE_PLAN: 150000,
    DISABLE_PLAN: 100000,
    SUBSCRIBE: 300000,
    RENEW: 250000,
    RESET_SUBSCRIPTION: 200000,
    TRACK_USAGE: 100000,
    ADD_ROLE: 150000,
    CLEANUP: 100000
  }
} as const;

// ==================== TIMEOUT CONFIGURATION ====================

/**
 * Timeout configuration
 */
export const TIMEOUT_CONFIG = {
  DEFAULT: 30000, // 30 seconds
  NETWORK: 10000, // 10 seconds
  TRANSACTION: 60000, // 1 minute
  HEALTH_CHECK: 5000, // 5 seconds
  CACHE: 1000, // 1 second
  
  // Operation-specific timeouts
  OPERATION_TIMEOUTS: {
    CREATE_PLAN: 45000,
    UPDATE_PLAN: 40000,
    SUBSCRIBE: 60000,
    RENEW: 50000,
    ANALYTICS: 30000,
    BULK_OPERATIONS: 120000
  }
} as const;

// ==================== PLAN TIER CONFIGURATION ====================

/**
 * Plan tier configuration
 */
export const PLAN_TIERS = {
  [PlanTier.BASIC]: {
    name: 'Basic',
    color: '#6B7280',
    features: ['basic_support', 'standard_features'],
    maxUsers: 1000,
    priceRange: { min: 0, max: 1000000 }
  },
  [PlanTier.SILVER]: {
    name: 'Silver',
    color: '#9CA3AF',
    features: ['priority_support', 'advanced_features', 'analytics'],
    maxUsers: 5000,
    priceRange: { min: 1000000, max: 5000000 }
  },
  [PlanTier.GOLD]: {
    name: 'Gold',
    color: '#F59E0B',
    features: ['premium_support', 'all_features', 'analytics', 'custom_integrations'],
    maxUsers: 20000,
    priceRange: { min: 5000000, max: 20000000 }
  },
  [PlanTier.PLATINUM]: {
    name: 'Platinum',
    color: '#8B5CF6',
    features: ['dedicated_support', 'all_features', 'analytics', 'custom_integrations', 'white_label'],
    maxUsers: 100000,
    priceRange: { min: 20000000, max: 100000000 }
  }
} as const;

// ==================== FEATURE CONFIGURATION ====================

/**
 * Feature configuration
 */
export const FEATURES = {
  PREMIUM_CONTENT: {
    name: 'Premium Content',
    description: 'Access to premium content and features',
    usageLimit: 1000,
    tier: [PlanTier.SILVER, PlanTier.GOLD, PlanTier.PLATINUM]
  },
  GOLD_FEATURE: {
    name: 'Gold Feature',
    description: 'Access to gold-tier exclusive features',
    usageLimit: 500,
    tier: [PlanTier.GOLD, PlanTier.PLATINUM]
  },
  ANALYTICS: {
    name: 'Analytics',
    description: 'Access to detailed analytics and reporting',
    usageLimit: 100,
    tier: [PlanTier.SILVER, PlanTier.GOLD, PlanTier.PLATINUM]
  },
  CUSTOM_INTEGRATIONS: {
    name: 'Custom Integrations',
    description: 'Access to custom integration features',
    usageLimit: 50,
    tier: [PlanTier.GOLD, PlanTier.PLATINUM]
  },
  WHITE_LABEL: {
    name: 'White Label',
    description: 'Access to white-label features',
    usageLimit: 10,
    tier: [PlanTier.PLATINUM]
  }
} as const;

// ==================== ROLE CONFIGURATION ====================

/**
 * Role configuration
 */
export const ROLES = {
  ADMIN: {
    name: 'admin',
    permissions: ['all'],
    description: 'Full administrative access'
  },
  MODERATOR: {
    name: 'moderator',
    permissions: ['manage_subscriptions', 'view_analytics'],
    description: 'Moderator access'
  },
  ANALYST: {
    name: 'analyst',
    permissions: ['view_analytics', 'view_subscriptions'],
    description: 'Analytics access'
  },
  SUPPORT: {
    name: 'support',
    permissions: ['view_subscriptions', 'manage_user_roles'],
    description: 'Support access'
  }
} as const;

// ==================== SUBSCRIPTION STATES ====================

/**
 * Subscription state configuration
 */
export const SUBSCRIPTION_STATES = {
  [SubscriptionState.ACTIVE]: {
    name: 'Active',
    color: '#10B981',
    description: 'Subscription is active and valid'
  },
  [SubscriptionState.GRACE]: {
    name: 'Grace Period',
    color: '#F59E0B',
    description: 'Subscription is in grace period'
  },
  [SubscriptionState.EXPIRED]: {
    name: 'Expired',
    color: '#EF4444',
    description: 'Subscription has expired'
  },
  [SubscriptionState.NOT_FOUND]: {
    name: 'Not Found',
    color: '#6B7280',
    description: 'Subscription not found'
  }
} as const;

// ==================== ERROR CODES ====================

/**
 * Error code mappings
 */
export const ERROR_CODES = {
  // General errors
  [SubscriptionErrorCode.NOT_INITIALIZED]: 1001,
  [SubscriptionErrorCode.ALREADY_INITIALIZED]: 1002,
  [SubscriptionErrorCode.UNAUTHORIZED_ACCESS]: 1003,
  [SubscriptionErrorCode.INSUFFICIENT_FUNDS]: 1004,
  [SubscriptionErrorCode.CONTRACT_ERROR]: 1005,
  [SubscriptionErrorCode.NETWORK_ERROR]: 1006,
  [SubscriptionErrorCode.WALLET_ERROR]: 1007,
  [SubscriptionErrorCode.VALIDATION_ERROR]: 1008,
  [SubscriptionErrorCode.TIMEOUT_ERROR]: 1009,
  
  // Plan errors
  [PlanErrorCode.PLAN_ALREADY_EXISTS]: 2001,
  [PlanErrorCode.PLAN_NOT_ACTIVE]: 2002,
  [PlanErrorCode.INVALID_PLAN_CONFIG]: 2003,
  [PlanErrorCode.PLAN_UPDATE_FAILED]: 2004,
  
  // Feature access errors
  [FeatureAccessErrorCode.FEATURE_NOT_AVAILABLE]: 3001,
  [FeatureAccessErrorCode.INSUFFICIENT_PERMISSIONS]: 3002,
  [FeatureAccessErrorCode.ROLE_NOT_ASSIGNED]: 3003,
  [FeatureAccessErrorCode.USAGE_TRACKING_FAILED]: 3004
} as const;

// ==================== EVENT TYPES ====================

/**
 * Event type configuration
 */
export const EVENT_TYPES = {
  PLAN_CREATED: 'plan_created',
  PLAN_UPDATED: 'plan_updated',
  PLAN_DISABLED: 'plan_disabled',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SUBSCRIPTION_RESET: 'subscription_reset',
  FEATURE_ACCESS_GRANTED: 'feature_access_granted',
  FEATURE_ACCESS_DENIED: 'feature_access_denied',
  ROLE_ASSIGNED: 'role_assigned',
  USAGE_LIMIT_REACHED: 'usage_limit_reached',
  CONTRACT_INITIALIZED: 'contract_initialized',
  ERROR: 'error'
} as const;

// ==================== MONITORING CONFIGURATION ====================

/**
 * Monitoring configuration
 */
export const MONITORING = {
  METRICS: {
    RESPONSE_TIME: 'response_time',
    SUCCESS_RATE: 'success_rate',
    ERROR_RATE: 'error_rate',
    CACHE_HIT_RATE: 'cache_hit_rate',
    THROUGHPUT: 'throughput'
  },
  ALERTS: {
    HIGH_ERROR_RATE: 0.1, // 10%
    HIGH_RESPONSE_TIME: 5000, // 5 seconds
    LOW_CACHE_HIT_RATE: 0.5, // 50%
    HIGH_THROUGHPUT: 1000 // 1000 requests per minute
  },
  HEALTH_CHECKS: {
    CONTRACT: 'contract_health',
    NETWORK: 'network_health',
    WALLET: 'wallet_health',
    CACHE: 'cache_health'
  }
} as const;

// ==================== BULK OPERATIONS ====================

/**
 * Bulk operation configuration
 */
export const BULK_OPERATIONS = {
  MAX_BATCH_SIZE: 100,
  DEFAULT_BATCH_SIZE: 50,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CONTINUE_ON_ERROR: true
} as const;

// ==================== EXPORT ALL CONSTANTS ====================

export {
  NETWORKS,
  DEFAULT_CONFIG,
  CONTRACT_METHODS,
  CACHE_KEYS,
  CACHE_TTL,
  VALIDATION,
  ERROR_MESSAGES,
  FEE_CALCULATION,
  TIMEOUT_CONFIG,
  PLAN_TIERS,
  FEATURES,
  ROLES,
  SUBSCRIPTION_STATES,
  ERROR_CODES,
  EVENT_TYPES,
  MONITORING,
  BULK_OPERATIONS
};
