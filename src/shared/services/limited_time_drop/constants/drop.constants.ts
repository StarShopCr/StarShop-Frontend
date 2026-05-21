import { DropLifecycleStatus, UserAccessLevel } from '../types/drop.types';

export const NETWORKS = {
  testnet: {
    contractId: 'CASRZ5EIYSNTLJZCIFYKKIKLPQ74XR64N3FBYYRBN6OYC7WPOZFKCPHM',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  },
  mainnet: {
    contractId: 'MAINNET_CONTRACT_ID',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://horizon.stellar.org',
    isTestnet: false
  }
} as const;

export const DEFAULT_CONFIG = {
  TIMEOUT_SECONDS: 30,
  FEE: 100000,
  SIMULATE: true,
  RETRY: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  CACHE: {
    enabled: true,
    ttl: 300000,
    maxSize: 1000
  }
} as const;

export const CONTRACT_METHODS = {
  INITIALIZE: 'initialize',
  CREATE_DROP: 'create_drop',
  PURCHASE: 'purchase',
  GET_DROP: 'get_drop',
  GET_PURCHASE_HISTORY: 'get_purchase_history',
  GET_DROP_PURCHASES: 'get_drop_purchases',
  GET_BUYER_LIST: 'get_buyer_list',
  ADD_TO_WHITELIST: 'add_to_whitelist',
  REMOVE_FROM_WHITELIST: 'remove_from_whitelist',
  SET_USER_LEVEL: 'set_user_level',
  UPDATE_STATUS: 'update_status'
} as const;

export const CACHE_KEYS = {
  DROP: (dropId: number) => `limited_drop:${dropId}`,
  DROP_STATUS: (dropId: number) => `limited_drop:${dropId}:status`,
  DROP_PURCHASES: (dropId: number) => `limited_drop:${dropId}:purchases`,
  BUYER_LIST: (dropId: number) => `limited_drop:${dropId}:buyers`,
  PURCHASE_HISTORY: (user: string, dropId: number) => `limited_drop:${dropId}:history:${user}`,
  ACCESS: (user: string, dropId: number) => `limited_drop:${dropId}:access:${user}`,
  PERFORMANCE_METRICS: 'limited_drop:performance_metrics',
  HEALTH_CHECK: 'limited_drop:health_check'
} as const;

export const VALIDATION = {
  ADDRESS: {
    MIN_LENGTH: 56,
    MAX_LENGTH: 56,
    PATTERN: /^G[A-Z0-9]{55}$/
  },
  DROP: {
    TITLE_MAX_LENGTH: 120,
    IMAGE_URI_MAX_LENGTH: 500,
    MIN_SUPPLY: 1,
    MAX_SUPPLY: 1_000_000,
    MIN_PRICE: 0n,
    MIN_DURATION_SECONDS: 60n,
    MAX_DURATION_SECONDS: 31_536_000n,
    MIN_PER_USER_LIMIT: 1,
    MAX_PER_USER_LIMIT: 10_000
  },
  PARTICIPATION: {
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 10_000
  }
} as const;

export const DROP_STATUS_LABELS = {
  [DropLifecycleStatus.PENDING]: 'Pending',
  [DropLifecycleStatus.ACTIVE]: 'Active',
  [DropLifecycleStatus.COMPLETED]: 'Completed',
  [DropLifecycleStatus.CANCELLED]: 'Cancelled'
} as const;

export const USER_LEVEL_LABELS = {
  [UserAccessLevel.STANDARD]: 'Standard',
  [UserAccessLevel.PREMIUM]: 'Premium',
  [UserAccessLevel.VERIFIED]: 'Verified'
} as const;

export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Limited time drop service is not initialized',
  WALLET_NOT_CONNECTED: 'Wallet not connected. Please connect your wallet first.',
  INVALID_ADMIN: 'Invalid admin address format',
  INVALID_USER: 'Invalid user address format',
  INVALID_DROP_ID: 'Invalid drop ID',
  INVALID_DROP_CONFIG: 'Invalid drop configuration',
  INVALID_QUANTITY: 'Invalid participation quantity',
  UNSUPPORTED_DROP_UPDATE: 'The contract only supports status updates for existing drops',
  UNSUPPORTED_DROP_EXTENSION: 'The contract does not expose an end-time extension method'
} as const;

export const CONTRACT_ERROR_CODES = {
  1: 'NotInitialized',
  2: 'AlreadyInitialized',
  3: 'Unauthorized',
  4: 'DropNotFound',
  5: 'DropNotActive',
  6: 'DropEnded',
  7: 'DropNotStarted',
  8: 'InsufficientSupply',
  9: 'UserLimitExceeded',
  10: 'InvalidQuantity',
  11: 'InvalidTime',
  12: 'InvalidPrice',
  13: 'NotWhitelisted',
  14: 'InsufficientLevel',
  15: 'InvalidUserLevel',
  16: 'PurchaseFailed',
  17: 'DuplicateWhitelistEntry',
  18: 'InvalidStatusTransition'
} as const;
