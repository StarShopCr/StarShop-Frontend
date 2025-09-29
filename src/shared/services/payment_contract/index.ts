// Main service export
export { PaymentService } from './payment.service';

// Type exports
export * from './types/payment.types';
export * from './types/dispute.types';

// Utility exports
export * from './utils/payment.utils';

// Constants exports - only export non-duplicate items
export { 
  NETWORKS, 
  DEFAULT_CONFIG, 
  ERROR_MESSAGES, 
  DISPUTE_ERROR_MESSAGES, 
  REFUND_ERROR_MESSAGES, 
  VALIDATION, 
  CACHE_KEYS, 
  CONTRACT_METHODS, 
  CONTRACT_EVENTS, 
  ERROR_CODE_MAPPING, 
  PAYMENT_STATUS_MAPPING, 
  DISPUTE_STATUS_MAPPING, 
  DISPUTE_DECISION_MAPPING, 
  FEE_CALCULATION, 
  TIMEOUT_CONFIG, 
  RATE_LIMITING, 
  SECURITY, 
  MONITORING, 
  EXPORT, 
  INTEGRATION 
} from './constants/payment.constants';

// Re-export contract types for convenience
export {
  Client as PaymentContractClient,
  networks as PaymentNetworks,
  PaymentError,
  DisputeError,
  RefundError,
  TransactionError
  // DisputeDecision will be exported from types/payment.types
} from '../../../../packages/payment-contract/src/index';

// Default export
export { PaymentService as default } from './payment.service';
