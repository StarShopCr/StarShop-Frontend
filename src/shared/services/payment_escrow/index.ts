// Payment Escrow Contract Service
export { PaymentEscrowService, default } from './escrow.service';

// Types
export type {
  EscrowServiceConfig,
  EscrowConfig,
  EscrowInfo,
  EscrowUpdateRequest,
  DepositRequest,
  ReleaseRequest,
  RefundRequest,
  PaymentStatusInfo,
  EscrowTransaction,
  EscrowResponse,
  TransactionResult,
  EscrowAnalytics,
  HealthCheck,
  CacheEntry,
  NetworkConfig,
  EscrowEventData,
  EscrowEventListener,
  EventListenerOptions,
  EventSubscription,
} from './types/escrow.types';
export { EscrowStatus, EscrowTransactionType, EscrowEventType } from './types/escrow.types';

export type {
  CreateDisputeRequest,
  DisputeInfo,
  ResolveDisputeRequest,
  DisputeEvidence,
  DisputeTimelineEntry,
  DisputeStats,
} from './types/dispute.types';
export { DisputeStatus, DisputeResolution, EvidenceType, DisputeTimelineType } from './types/dispute.types';

export type {
  ArbitratorInfo,
  ArbitratorAssignmentRequest,
  ArbitratorDecision,
  ArbitratorRegistrationRequest,
  ArbitratorPerformance,
  ArbitratorCaseHistory,
} from './types/arbitrator.types';
export { ArbitratorStatus } from './types/arbitrator.types';

// Utils
export {
  validateAddress,
  validateAmount,
  validateEscrowConfig,
  validateDisputeRequest,
  sanitizeString,
  calculatePlatformFee,
  calculateArbitratorFee,
  calculateTotalFees,
  canDeposit,
  canRelease,
  canRefund,
  canDispute,
  canCancel,
  isExpired,
  formatAmount,
  parseAmount,
  mapContractError,
  getErrorMessage,
  retryWithBackoff,
} from './utils/escrow.utils';

// Constants
export {
  NETWORKS,
  DEFAULT_CONFIG,
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  ERROR_CODES,
  FEE_CALCULATION,
  TIMEOUT_CONFIG,
} from './constants/escrow.constants';
