// ==================== ESCROW CONSTANTS ====================

/**
 * Network configurations
 */
export const NETWORKS = {
  TESTNET: {
    networkId: 'testnet',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractAddress: '',
  },
  MAINNET: {
    networkId: 'mainnet',
    rpcUrl: 'https://soroban.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    contractAddress: '',
  },
} as const;

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  network: 'testnet',
  defaultTimeout: 30000,
  maxRetries: 3,
  cacheEnabled: true,
  cacheTTL: 60000,
  feePercentage: 1.0,
  autoReleaseDelay: 86400 * 7, // 7 days in seconds
  maxEscrowDuration: 86400 * 90, // 90 days in seconds
  minEscrowAmount: BigInt(1000000), // minimum 1 token (7 decimals)
} as const;

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  ESCROW: 'escrow',
  ESCROW_LIST: 'escrow_list',
  PAYMENT_STATUS: 'payment_status',
  DISPUTE: 'dispute',
  DISPUTE_LIST: 'dispute_list',
  ARBITRATOR: 'arbitrator',
  ARBITRATOR_LIST: 'arbitrator_list',
  ANALYTICS: 'analytics',
  HEALTH: 'health',
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  MIN_AMOUNT: BigInt(1),
  MAX_AMOUNT: BigInt('9999999999999999999'),
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_REASON_LENGTH: 2000,
  MAX_EVIDENCE_ITEMS: 20,
  MAX_METADATA_SIZE: 4096,
  ADDRESS_LENGTH: 56,
  MIN_EXPIRY_DURATION: 3600, // 1 hour
  MAX_EXPIRY_DURATION: 86400 * 365, // 1 year
} as const;

/**
 * Contract method names
 */
export const CONTRACT_METHODS = {
  // Escrow Management
  CREATE_ESCROW: 'create_escrow',
  GET_ESCROW: 'get_escrow',
  UPDATE_ESCROW: 'update_escrow',
  CANCEL_ESCROW: 'cancel_escrow',
  // Payment Operations
  DEPOSIT_PAYMENT: 'deposit_payment',
  RELEASE_PAYMENT: 'release_payment',
  REFUND_PAYMENT: 'refund_payment',
  GET_PAYMENT_STATUS: 'get_payment_status',
  // Dispute Management
  CREATE_DISPUTE: 'create_dispute',
  GET_DISPUTE: 'get_dispute',
  RESOLVE_DISPUTE: 'resolve_dispute',
  GET_DISPUTE_STATUS: 'get_dispute_status',
  // Arbitrator Operations
  ASSIGN_ARBITRATOR: 'assign_arbitrator',
  GET_ARBITRATOR: 'get_arbitrator',
  ARBITRATOR_DECISION: 'arbitrator_decision',
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  // Escrow errors
  ESCROW_NOT_FOUND: 'ESCROW_NOT_FOUND',
  ESCROW_ALREADY_EXISTS: 'ESCROW_ALREADY_EXISTS',
  ESCROW_EXPIRED: 'ESCROW_EXPIRED',
  ESCROW_CANCELLED: 'ESCROW_CANCELLED',
  ESCROW_INVALID_STATUS: 'ESCROW_INVALID_STATUS',
  // Payment errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_ALREADY_RELEASED: 'PAYMENT_ALREADY_RELEASED',
  PAYMENT_ALREADY_REFUNDED: 'PAYMENT_ALREADY_REFUNDED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  // Dispute errors
  DISPUTE_NOT_FOUND: 'DISPUTE_NOT_FOUND',
  DISPUTE_ALREADY_EXISTS: 'DISPUTE_ALREADY_EXISTS',
  DISPUTE_ALREADY_RESOLVED: 'DISPUTE_ALREADY_RESOLVED',
  // Arbitrator errors
  ARBITRATOR_NOT_FOUND: 'ARBITRATOR_NOT_FOUND',
  ARBITRATOR_ALREADY_ASSIGNED: 'ARBITRATOR_ALREADY_ASSIGNED',
  UNAUTHORIZED_ARBITRATOR: 'UNAUTHORIZED_ARBITRATOR',
  // General errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_INPUT: 'INVALID_INPUT',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  TIMEOUT: 'TIMEOUT',
} as const;

/**
 * Fee calculation constants
 */
export const FEE_CALCULATION = {
  PLATFORM_FEE_PERCENTAGE: 1.0,
  ARBITRATOR_FEE_PERCENTAGE: 2.0,
  MIN_FEE: BigInt(100),
  MAX_FEE_PERCENTAGE: 10.0,
  FEE_DECIMALS: 7,
} as const;

/**
 * Timeout configuration
 */
export const TIMEOUT_CONFIG = {
  TRANSACTION_TIMEOUT: 30000,
  QUERY_TIMEOUT: 15000,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;
