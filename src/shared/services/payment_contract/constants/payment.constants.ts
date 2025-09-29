import type { i128 } from '../types/payment.types';

// ==================== NETWORK CONFIGURATION ====================

export const NETWORKS = {
  testnet: {
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  },
  futurenet: {
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K', // Update with actual futurenet contract ID
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    rpcUrl: 'https://rpc-futurenet.stellar.org',
    isTestnet: true
  },
  mainnet: {
    contractId: '', // Update with actual mainnet contract ID when deployed
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://horizon.stellar.org',
    isTestnet: false
  }
} as const;

// ==================== DEFAULT CONFIGURATION ====================

export const DEFAULT_CONFIG = {
  TIMEOUT_SECONDS: 30,
  FEE: 100, // Base fee in stroops
  SIMULATE: true,
  RETRY: {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2
  },
  CACHE: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000
  },
  MONITORING: {
    enabled: true,
    metricsInterval: 60000, // 1 minute
    healthCheckInterval: 300000 // 5 minutes
  }
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  // Contract Errors
  NOT_INITIALIZED: 'Payment contract is not initialized',
  ALREADY_INITIALIZED: 'Payment contract is already initialized',
  UNAUTHORIZED_ACCESS: 'Unauthorized access to contract function',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this operation',
  TRANSFER_FAILED: 'Token transfer failed',
  INVALID_AMOUNT: 'Invalid amount specified',
  INVALID_ADDRESS: 'Invalid address format',
  INVALID_TOKEN_ID: 'Invalid token ID format',
  DUPLICATE_TRANSACTION: 'Duplicate transaction detected',
  PAYMENT_NOT_FOUND: 'Payment not found',
  DISPUTE_NOT_FOUND: 'Dispute not found',
  
  // Validation Errors
  VALIDATION_ERROR: 'Input validation failed',
  AMOUNT_TOO_SMALL: 'Amount is too small',
  AMOUNT_TOO_LARGE: 'Amount is too large',
  INVALID_DECIMAL_PLACES: 'Invalid number of decimal places',
  NEGATIVE_AMOUNT: 'Amount cannot be negative',
  
  // Network Errors
  NETWORK_ERROR: 'Network connection error',
  RPC_ERROR: 'RPC connection failed',
  TIMEOUT_ERROR: 'Request timeout',
  CONTRACT_ERROR: 'Contract execution error',
  
  // Wallet Errors
  WALLET_NOT_CONNECTED: 'Wallet is not connected',
  WALLET_ERROR: 'Wallet operation failed',
  SIGNATURE_ERROR: 'Transaction signature failed',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
  
  // Service Errors
  SERVICE_NOT_INITIALIZED: 'Payment service is not initialized',
  CACHE_ERROR: 'Cache operation failed',
  EVENT_ERROR: 'Event system error',
  MONITORING_ERROR: 'Monitoring system error'
} as const;

// ==================== DISPUTE ERROR MESSAGES ====================

export const DISPUTE_ERROR_MESSAGES = {
  DISPUTE_NOT_FOUND: 'Dispute not found',
  DISPUTE_ALREADY_RESOLVED: 'Dispute has already been resolved',
  INVALID_ARBITRATOR: 'Invalid arbitrator address',
  INVALID_DECISION: 'Invalid dispute decision',
  INSUFFICIENT_EVIDENCE: 'Insufficient evidence provided',
  UNAUTHORIZED_ARBITRATOR: 'Unauthorized arbitrator access',
  DISPUTE_EXPIRED: 'Dispute has expired',
  CANNOT_ESCALATE: 'Dispute cannot be escalated further',
  EVIDENCE_TOO_LARGE: 'Evidence file size exceeds limit',
  INVALID_EVIDENCE_TYPE: 'Invalid evidence type',
  ARBITRATOR_NOT_AVAILABLE: 'Arbitrator is not available',
  ESCALATION_NOT_ALLOWED: 'Escalation is not allowed for this dispute'
} as const;

// ==================== REFUND ERROR MESSAGES ====================

export const REFUND_ERROR_MESSAGES = {
  REFUND_NOT_ELIGIBLE: 'Payment is not eligible for refund',
  REFUND_AMOUNT_EXCEEDS_BALANCE: 'Refund amount exceeds available balance',
  REFUND_ALREADY_PROCESSED: 'Refund has already been processed',
  INVALID_REFUND_AMOUNT: 'Invalid refund amount',
  REFUND_PERIOD_EXPIRED: 'Refund period has expired',
  REFUND_NOT_AUTHORIZED: 'Refund is not authorized',
  PARTIAL_REFUND_NOT_ALLOWED: 'Partial refunds are not allowed',
  REFUND_LIMIT_EXCEEDED: 'Refund limit exceeded'
} as const;

// ==================== VALIDATION CONSTANTS ====================

export const VALIDATION = {
  // Amount validation
  MIN_AMOUNT: BigInt(1) as i128,
  MAX_AMOUNT: BigInt('1000000000000000000') as i128, // 1 million tokens with 18 decimals
  
  // Address validation
  STELLAR_ADDRESS_LENGTH: 56,
  CONTRACT_ADDRESS_LENGTH: 64,
  
  // Token ID validation
  MIN_TOKEN_ID_LENGTH: 1,
  MAX_TOKEN_ID_LENGTH: 100,
  
  // String validation
  MAX_STRING_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_REASON_LENGTH: 200,
  MAX_EVIDENCE_COUNT: 10,
  
  // Batch operation limits
  MAX_BATCH_SIZE: 50,
  MIN_BATCH_SIZE: 1,
  
  // Time validation
  MIN_DISPUTE_PERIOD: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_DISPUTE_PERIOD: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  
  // Refund validation
  MIN_REFUND_AMOUNT: BigInt(1) as i128,
  MAX_REFUND_PERCENTAGE: 100, // 100%
  
  // Evidence validation
  MAX_EVIDENCE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_EVIDENCE_TYPES: ['text', 'image', 'document', 'video', 'audio', 'link'],
  
  // Cache validation
  MIN_CACHE_TTL: 60000, // 1 minute
  MAX_CACHE_TTL: 3600000, // 1 hour
  MAX_CACHE_SIZE: 10000
} as const;

// ==================== CACHE KEYS ====================

export const CACHE_KEYS = {
  ADMIN: 'payment:admin',
  INITIALIZED: 'payment:initialized',
  BALANCE: (tokenId: string) => `payment:balance:${tokenId}`,
  PAYMENT_HISTORY: (tokenId: string) => `payment:history:${tokenId}`,
  DISPUTE: (disputeId: string) => `payment:dispute:${disputeId}`,
  DISPUTE_STATUS: (tokenId: string) => `payment:dispute_status:${tokenId}`,
  REFUND_ELIGIBILITY: (tokenId: string, user: string) => `payment:refund_eligibility:${tokenId}:${user}`,
  CONTRACT_VERSION: 'payment:contract_version',
  NETWORK_STATUS: 'payment:network_status',
  PERFORMANCE_METRICS: 'payment:performance_metrics'
} as const;

// ==================== CONTRACT METHODS ====================

export const CONTRACT_METHODS = {
  // Admin methods
  INITIALIZE: 'initialize',
  GET_ADMIN: 'get_admin',
  TRANSFER_ADMIN: 'transfer_admin',
  UPGRADE: 'upgrade',
  
  // Payment methods
  PROCESS_DEPOSIT: 'process_deposit',
  PROCESS_REFUND: 'process_refund',
  
  // Dispute methods
  RESOLVE_DISPUTE: 'resolve_dispute',
  CREATE_DISPUTE: 'create_dispute',
  GET_DISPUTE_STATUS: 'get_dispute_status'
} as const;

// ==================== CONTRACT EVENTS ====================

export const CONTRACT_EVENTS = {
  CONTRACT_INITIALIZED: 'contract_initialized',
  ADMIN_TRANSFERRED: 'admin_transferred',
  CONTRACT_UPGRADED: 'contract_upgraded',
  DEPOSIT_PROCESSED: 'deposit_processed',
  REFUND_PROCESSED: 'refund_processed',
  DISPUTE_CREATED: 'dispute_created',
  DISPUTE_RESOLVED: 'dispute_resolved'
} as const;

// ==================== ERROR CODE ENUMS ====================

/**
 * Payment-specific error codes
 */
export enum PaymentErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_TOKEN_ID = 'INVALID_TOKEN_ID',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  DISPUTE_NOT_FOUND = 'DISPUTE_NOT_FOUND',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

/**
 * Dispute-specific error codes
 */
export enum DisputeErrorCode {
  DISPUTE_NOT_FOUND = 'DISPUTE_NOT_FOUND',
  DISPUTE_ALREADY_RESOLVED = 'DISPUTE_ALREADY_RESOLVED',
  INVALID_ARBITRATOR = 'INVALID_ARBITRATOR',
  INVALID_DECISION = 'INVALID_DECISION',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
  UNAUTHORIZED_ARBITRATOR = 'UNAUTHORIZED_ARBITRATOR'
}

/**
 * Refund-specific error codes
 */
export enum RefundErrorCode {
  REFUND_NOT_ELIGIBLE = 'REFUND_NOT_ELIGIBLE',
  REFUND_AMOUNT_EXCEEDS_BALANCE = 'REFUND_AMOUNT_EXCEEDS_BALANCE',
  REFUND_ALREADY_PROCESSED = 'REFUND_ALREADY_PROCESSED',
  INVALID_REFUND_AMOUNT = 'INVALID_REFUND_AMOUNT',
  REFUND_PERIOD_EXPIRED = 'REFUND_PERIOD_EXPIRED'
}

// ==================== ERROR CODE MAPPING ====================

export const ERROR_CODE_MAPPING = {
  // Payment errors
  'NotInitialized': 'NOT_INITIALIZED',
  'AlreadyInitialized': 'ALREADY_INITIALIZED',
  'UnauthorizedAccess': 'UNAUTHORIZED_ACCESS',
  'InsufficientFunds': 'INSUFFICIENT_FUNDS',
  'TransferFailed': 'TRANSFER_FAILED',
  'InvalidAmount': 'INVALID_AMOUNT',
  
  // Dispute errors
  'DisputeNotFound': 'DISPUTE_NOT_FOUND',
  'DisputeAlreadyResolved': 'DISPUTE_ALREADY_RESOLVED',
  'InvalidArbitrator': 'INVALID_ARBITRATOR',
  'InvalidDecision': 'INVALID_DECISION',
  'InsufficientEvidence': 'INSUFFICIENT_EVIDENCE',
  'UnauthorizedArbitrator': 'UNAUTHORIZED_ARBITRATOR',
  
  // Refund errors
  'RefundNotEligible': 'REFUND_NOT_ELIGIBLE',
  'RefundAmountExceedsBalance': 'REFUND_AMOUNT_EXCEEDS_BALANCE',
  'RefundAlreadyProcessed': 'REFUND_ALREADY_PROCESSED',
  'InvalidRefundAmount': 'INVALID_REFUND_AMOUNT',
  'RefundPeriodExpired': 'REFUND_PERIOD_EXPIRED'
} as const;

// ==================== PAYMENT STATUS MAPPING ====================

export const PAYMENT_STATUS_MAPPING = {
  'pending': 'PENDING',
  'processing': 'PROCESSING',
  'completed': 'COMPLETED',
  'failed': 'FAILED',
  'refunded': 'REFUNDED',
  'disputed': 'DISPUTED',
  'cancelled': 'CANCELLED'
} as const;

// ==================== DISPUTE STATUS MAPPING ====================

export const DISPUTE_STATUS_MAPPING = {
  'open': 'OPEN',
  'in_progress': 'IN_PROGRESS',
  'resolved': 'RESOLVED',
  'closed': 'CLOSED'
} as const;

// ==================== DISPUTE DECISION MAPPING ====================

export const DISPUTE_DECISION_MAPPING = {
  'favor_buyer': 'FAVOR_BUYER',
  'favor_seller': 'FAVOR_SELLER',
  'partial_refund': 'PARTIAL_REFUND',
  'no_refund': 'NO_REFUND'
} as const;

// ==================== FEE CALCULATION ====================

export const FEE_CALCULATION = {
  BASE_FEE: 100, // stroops
  GAS_MULTIPLIER: 1.2,
  MIN_FEE: 100,
  MAX_FEE: 10000,
  
  // Fee tiers based on transaction complexity
  SIMPLE_TRANSACTION: 100,
  DEPOSIT_TRANSACTION: 150,
  REFUND_TRANSACTION: 200,
  DISPUTE_TRANSACTION: 300,
  ADMIN_TRANSACTION: 500
} as const;

// ==================== TIMEOUT CONFIGURATION ====================

export const TIMEOUT_CONFIG = {
  // Network timeouts
  RPC_TIMEOUT: 30000, // 30 seconds
  CONTRACT_TIMEOUT: 60000, // 1 minute
  
  // Operation timeouts
  DEPOSIT_TIMEOUT: 120000, // 2 minutes
  REFUND_TIMEOUT: 120000, // 2 minutes
  DISPUTE_TIMEOUT: 300000, // 5 minutes
  ADMIN_TIMEOUT: 60000, // 1 minute
  
  // Cache timeouts
  BALANCE_CACHE_TTL: 60000, // 1 minute
  HISTORY_CACHE_TTL: 300000, // 5 minutes
  DISPUTE_CACHE_TTL: 180000, // 3 minutes
  ADMIN_CACHE_TTL: 600000 // 10 minutes
} as const;

// ==================== RATE LIMITING ====================

export const RATE_LIMITING = {
  // Requests per minute
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_BATCH_REQUESTS_PER_MINUTE: 10,
  
  // Cooldown periods
  DEPOSIT_COOLDOWN: 5000, // 5 seconds
  REFUND_COOLDOWN: 10000, // 10 seconds
  DISPUTE_COOLDOWN: 30000, // 30 seconds
  ADMIN_COOLDOWN: 60000, // 1 minute
  
  // Burst limits
  MAX_BURST_REQUESTS: 10,
  BURST_WINDOW: 60000 // 1 minute
} as const;

// ==================== SECURITY CONSTANTS ====================

export const SECURITY = {
  // Address validation
  ALLOWED_ADDRESS_PREFIXES: ['G', 'C'],
  
  // Token ID validation
  MIN_TOKEN_ID_LENGTH: 1,
  MAX_TOKEN_ID_LENGTH: 100,
  
  // Amount validation
  MAX_DECIMAL_PLACES: 18,
  
  // String sanitization
  ALLOWED_STRING_CHARS: /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+={}[\]|\\:";'<>\/]+$/,
  MAX_METADATA_SIZE: 1024, // bytes
  
  // Evidence validation
  MAX_EVIDENCE_COUNT: 10,
  MAX_EVIDENCE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_EVIDENCE_EXTENSIONS: ['.txt', '.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.mp4', '.mp3', '.wav'],
  
  // Rate limiting
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 300000 // 5 minutes
} as const;

// ==================== MONITORING CONSTANTS ====================

export const MONITORING = {
  // Health check intervals
  HEALTH_CHECK_INTERVAL: 60000, // 1 minute
  PERFORMANCE_CHECK_INTERVAL: 300000, // 5 minutes
  
  // Metrics collection
  METRICS_RETENTION_DAYS: 30,
  METRICS_BATCH_SIZE: 100,
  
  // Alert thresholds
  ERROR_RATE_THRESHOLD: 0.05, // 5%
  RESPONSE_TIME_THRESHOLD: 5000, // 5 seconds
  SUCCESS_RATE_THRESHOLD: 0.95, // 95%
  
  // Performance targets
  TARGET_RESPONSE_TIME: 2000, // 2 seconds
  TARGET_SUCCESS_RATE: 0.99, // 99%
  TARGET_UPTIME: 0.999 // 99.9%
} as const;

// ==================== EXPORT CONSTANTS ====================

export const EXPORT = {
  // Export formats
  SUPPORTED_FORMATS: ['json', 'csv', 'pdf'],
  
  // Export limits
  MAX_RECORDS_PER_EXPORT: 10000,
  MAX_EXPORT_SIZE: 100 * 1024 * 1024, // 100 MB
  
  // Export retention
  EXPORT_RETENTION_DAYS: 7,
  MAX_EXPORTS_PER_DAY: 10
} as const;

// ==================== INTEGRATION CONSTANTS ====================

export const INTEGRATION = {
  // External service timeouts
  EXTERNAL_SERVICE_TIMEOUT: 30000, // 30 seconds
  
  // Webhook configuration
  MAX_WEBHOOK_RETRIES: 3,
  WEBHOOK_TIMEOUT: 10000, // 10 seconds
  
  // API rate limits
  MAX_API_CALLS_PER_MINUTE: 100,
  MAX_API_CALLS_PER_HOUR: 1000
} as const;
