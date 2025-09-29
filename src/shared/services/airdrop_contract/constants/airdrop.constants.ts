import type { u64, i128 } from '@stellar/stellar-sdk/contract';

/**
 * Error codes for the airdrop contract
 */
export const AIRDROP_ERROR_CODES = {
  ALREADY_INITIALIZED: 1,
  UNAUTHORIZED: 2,
  INVALID_TOKEN_CONFIG: 3,
  AIRDROP_NOT_FOUND: 4,
  USER_NOT_ELIGIBLE: 5,
  ALREADY_CLAIMED: 6,
  INSUFFICIENT_CONTRACT_BALANCE: 7,
  TOKEN_TRANSFER_FAILED: 8,
  CONDITION_NOT_FOUND: 9,
  INVALID_AMOUNT: 10,
  PROVIDER_NOT_CONFIGURED: 11,
  PROVIDER_CALL_FAILED: 12,
  EVENT_INACTIVE: 13,
  CAP_EXCEEDED: 14,
  INVALID_EVENT_CONFIG: 15,
} as const;

/**
 * Provider error codes
 */
export const PROVIDER_ERROR_CODES = {
  INVALID_USER: 1,
  METRIC_NOT_SUPPORTED: 2,
  INTERNAL_ERROR: 3,
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [AIRDROP_ERROR_CODES.ALREADY_INITIALIZED]: 'Contract has already been initialized',
  [AIRDROP_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access - admin privileges required',
  [AIRDROP_ERROR_CODES.INVALID_TOKEN_CONFIG]: 'Invalid token configuration provided',
  [AIRDROP_ERROR_CODES.AIRDROP_NOT_FOUND]: 'Airdrop event not found',
  [AIRDROP_ERROR_CODES.USER_NOT_ELIGIBLE]: 'User is not eligible for this airdrop',
  [AIRDROP_ERROR_CODES.ALREADY_CLAIMED]: 'User has already claimed this airdrop',
  [AIRDROP_ERROR_CODES.INSUFFICIENT_CONTRACT_BALANCE]: 'Insufficient contract balance for distribution',
  [AIRDROP_ERROR_CODES.TOKEN_TRANSFER_FAILED]: 'Token transfer failed',
  [AIRDROP_ERROR_CODES.CONDITION_NOT_FOUND]: 'Eligibility condition not found',
  [AIRDROP_ERROR_CODES.INVALID_AMOUNT]: 'Invalid amount specified',
  [AIRDROP_ERROR_CODES.PROVIDER_NOT_CONFIGURED]: 'Metric provider not configured',
  [AIRDROP_ERROR_CODES.PROVIDER_CALL_FAILED]: 'Provider contract call failed',
  [AIRDROP_ERROR_CODES.EVENT_INACTIVE]: 'Airdrop event is not active',
  [AIRDROP_ERROR_CODES.CAP_EXCEEDED]: 'Event capacity exceeded',
  [AIRDROP_ERROR_CODES.INVALID_EVENT_CONFIG]: 'Invalid event configuration',
} as const;

/**
 * Provider error messages
 */
export const PROVIDER_ERROR_MESSAGES = {
  [PROVIDER_ERROR_CODES.INVALID_USER]: 'Invalid user address',
  [PROVIDER_ERROR_CODES.METRIC_NOT_SUPPORTED]: 'Metric not supported by provider',
  [PROVIDER_ERROR_CODES.INTERNAL_ERROR]: 'Internal provider error',
} as const;

/**
 * Network configurations
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CAJ67MAHPQYVCABUHVIQ5ZUMKN4FVHADRV425KIBBTDE3GDJ4QCE2CYS',
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
  /** Default event monitoring configuration */
  MONITORING: {
    enabled: true,
    pollInterval: 5000, // 5 seconds
    maxEvents: 100,
  },
} as const;

/**
 * Common token addresses
 */
export const TOKEN_ADDRESSES = {
  /** XLM token address (native) */
  XLM: 'native',
  /** USDC on Stellar */
  USDC: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3A3A',
  /** USDT on Stellar */
  USDT: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3A3A',
} as const;

/**
 * Common metric types for eligibility conditions
 */
export const METRIC_TYPES = {
  /** Number of purchases made */
  PURCHASES: 'purchases',
  /** Total amount spent */
  TOTAL_SPENT: 'total_spent',
  /** Team size */
  TEAM_SIZE: 'team_size',
  /** Account age in days */
  ACCOUNT_AGE: 'account_age',
  /** Number of referrals */
  REFERRALS: 'referrals',
  /** Loyalty points */
  LOYALTY_POINTS: 'loyalty_points',
  /** NFT holdings */
  NFT_HOLDINGS: 'nft_holdings',
  /** Staking amount */
  STAKING_AMOUNT: 'staking_amount',
} as const;

/**
 * Event status constants
 */
export const EVENT_STATUS = {
  /** Event is active and accepting claims */
  ACTIVE: 'active',
  /** Event is paused */
  PAUSED: 'paused',
  /** Event has ended */
  ENDED: 'ended',
  /** Event is finalized */
  FINALIZED: 'finalized',
  /** Event is cancelled */
  CANCELLED: 'cancelled',
} as const;

/**
 * Transaction status constants
 */
export const TRANSACTION_STATUS = {
  /** Transaction pending */
  PENDING: 'pending',
  /** Transaction successful */
  SUCCESS: 'success',
  /** Transaction failed */
  FAILED: 'failed',
  /** Transaction cancelled */
  CANCELLED: 'cancelled',
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  /** Event data cache key */
  EVENT: (eventId: u64) => `airdrop:event:${eventId}`,
  /** Event stats cache key */
  EVENT_STATS: (eventId: u64) => `airdrop:stats:${eventId}`,
  /** Provider cache key */
  PROVIDER: (metric: string) => `airdrop:provider:${metric}`,
  /** Admin cache key */
  ADMIN: 'airdrop:admin',
  /** Claimed users cache key */
  CLAIMED_USERS: (eventId: u64) => `airdrop:claimed:${eventId}`,
  /** User eligibility cache key */
  ELIGIBILITY: (eventId: u64, user: string) => `airdrop:eligibility:${eventId}:${user}`,
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Minimum event duration in seconds */
  MIN_EVENT_DURATION: 3600, // 1 hour
  /** Maximum event duration in seconds */
  MAX_EVENT_DURATION: 31536000, // 1 year
  /** Minimum token amount */
  MIN_TOKEN_AMOUNT: 1,
  /** Maximum token amount */
  MAX_TOKEN_AMOUNT: 1000000000000000000, // 1 billion with 9 decimals
  /** Maximum event name length */
  MAX_EVENT_NAME_LENGTH: 100,
  /** Maximum event description length */
  MAX_EVENT_DESCRIPTION_LENGTH: 1000,
  /** Maximum number of conditions per event */
  MAX_CONDITIONS_PER_EVENT: 10,
  /** Maximum number of users in batch distribution */
  MAX_BATCH_SIZE: 100,
} as const;

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  /** Seconds in a minute */
  SECONDS_PER_MINUTE: 60,
  /** Seconds in an hour */
  SECONDS_PER_HOUR: 3600,
  /** Seconds in a day */
  SECONDS_PER_DAY: 86400,
  /** Seconds in a week */
  SECONDS_PER_WEEK: 604800,
  /** Seconds in a month (30 days) */
  SECONDS_PER_MONTH: 2592000,
  /** Seconds in a year (365 days) */
  SECONDS_PER_YEAR: 31536000,
} as const;

/**
 * API endpoints for external services
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
 * Wallet provider IDs
 */
export const WALLET_PROVIDERS = {
  FREIGHTER: 'freighter',
  RABET: 'rabet',
  XBULL: 'xbull',
  LOBSTR: 'lobstr',
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
  /** Provider errors */
  PROVIDER_ERROR: 'provider_error',
  /** Unknown errors */
  UNKNOWN_ERROR: 'unknown_error',
} as const;
