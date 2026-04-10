export const ESCROW_CONTRACT_METHODS = {
  CREATE_ESCROW: 'create_escrow',
  GET_ESCROW: 'get_escrow',
  UPDATE_ESCROW: 'update_escrow',
  CANCEL_ESCROW: 'cancel_escrow',
  DEPOSIT_PAYMENT: 'deposit_payment',
  RELEASE_PAYMENT: 'release_payment',
  REFUND_PAYMENT: 'refund_payment',
  GET_PAYMENT_STATUS: 'get_payment_status',
  CREATE_DISPUTE: 'create_dispute',
  GET_DISPUTE: 'get_dispute',
  RESOLVE_DISPUTE: 'resolve_dispute',
  GET_DISPUTE_STATUS: 'get_dispute_status',
  ASSIGN_ARBITRATOR: 'assign_arbitrator',
  GET_ARBITRATOR: 'get_arbitrator',
  ARBITRATOR_DECISION: 'arbitrator_decision',
} as const;

export const ESCROW_ERROR_CODES = {
  ESCROW_NOT_FOUND: 'ESCROW_NOT_FOUND',
  ESCROW_ALREADY_FUNDED: 'ESCROW_ALREADY_FUNDED',
  ESCROW_NOT_FUNDED: 'ESCROW_NOT_FUNDED',
  ESCROW_EXPIRED: 'ESCROW_EXPIRED',
  ESCROW_CANCELLED: 'ESCROW_CANCELLED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  DISPUTE_EXISTS: 'DISPUTE_EXISTS',
  DISPUTE_NOT_FOUND: 'DISPUTE_NOT_FOUND',
  ARBITRATOR_NOT_ASSIGNED: 'ARBITRATOR_NOT_ASSIGNED',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  CONTRACT_NOT_INITIALIZED: 'CONTRACT_NOT_INITIALIZED',
} as const;

export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    contractId: '',
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban-rpc.stellar.org',
    contractId: '',
  },
} as const;

export const DEFAULT_CONFIG = {
  defaultExpirationDays: 30,
  maxExpirationDays: 365,
  minEscrowAmount: BigInt(1),
  cacheTtlMs: 30_000,
  maxRetries: 3,
  retryDelayMs: 1_000,
} as const;

export const CACHE_KEYS = {
  ESCROW: 'escrow',
  DISPUTE: 'dispute',
  ARBITRATOR: 'arbitrator',
  PAYMENT_STATUS: 'payment_status',
} as const;

export const TIMEOUT_CONFIG = {
  transactionTimeoutSec: 30,
  queryTimeoutMs: 10_000,
} as const;
