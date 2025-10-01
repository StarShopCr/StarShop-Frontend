// Main service export
export { GovernanceService } from './governance.service';

// Type exports
export type {
  // Governance types
  GovernanceServiceConfig,
  NetworkConfig,
  GovernanceResponse,
  TransactionResult,
  AdminInfo,
  ContractStatus,
  GovernanceStats,
  HealthCheck,
  PerformanceMetrics,
  GovernanceEventType,
  GovernanceEventData,
  GovernanceEventListener,
  EventSubscription,
  EventListenerOptions,
  GovernanceFilter,
  GovernanceSearchResult,
  ValidationResult,
  BatchOperationResult,
  RetryConfig,
  CacheConfig,
  Address
} from './types/governance.types';

export type {
  // Proposal types
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
  CancelProposalRequest,
  ActivateProposalRequest,
  VetoProposalRequest,
  ExecuteProposalRequest,
  ListProposalsRequest,
  ProposalListResult,
  ProposalValidationResult,
  ProposalStats,
  ProposalTimeline,
  ProposalTimelineEvent,
  ProposalRequirements,
  RewardRates,
  LevelCriteria,
  LevelRequirements,
  AuctionConditions,
  DutchAuctionData,
  ProposalAction,
  ProposalId,
  VotingConfig
} from './types/proposal.types';

export {
  // Proposal enums
  ProposalStatus,
  ProposalType,
  ActionType,
  AuctionType
} from './types/proposal.types';

export type {
  // Voting types
  Vote,
  VotingResults,
  CastVoteRequest,
  DelegateVoteRequest,
  CalculateVoteWeightRequest,
  VoteWeightResult,
  DelegationStatus,
  VotingPowerInfo,
  UpdateVotingWeightsRequest,
  VotingWeightUpdate,
  VotingSnapshot,
  VoteHistory,
  VotingParticipationStats,
  VoteValidationResult,
  DelegationChain,
  VoteAggregation,
  TakeSnapshotRequest,
  VoteQueryRequest,
  VoteQueryResult,
  VotingPowerQueryRequest,
  VotingPowerQueryResult
} from './types/voting.types';

// Constants exports
export {
  GOVERNANCE_ERROR_CODES,
  ERROR_MESSAGES,
  NETWORKS,
  DEFAULT_CONFIG,
  VALIDATION,
  CACHE_KEYS,
  ERROR_TYPES,
  API_ENDPOINTS,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_TYPE_LABELS,
  ACTION_TYPE_LABELS,
  PERFORMANCE_THRESHOLDS,
  HEALTH_CHECK_INTERVALS,
  DEFAULT_PROPOSAL_VALUES,
  PROPOSAL_VALIDATION_RULES,
  VOTING_VALIDATION_RULES,
  TIME_CONSTANTS,
  GOVERNANCE_ROLES,
  PERMISSION_LEVELS
} from './constants/governance.constants';

// Utility functions exports
export {
  isValidStellarAddress,
  isValidProposalId,
  validateProposalTitle,
  validateProposalDescription,
  validateProposalType,
  validateProposalActions,
  validateVotingConfig,
  validateProposal,
  validateVote,
  validateDelegation,
  calculateVotingResults,
  calculateVotingPowerPercentage,
  formatTimeDuration,
  isProposalActive,
  isProposalExecutable,
  getProposalStatusLabel,
  getProposalTypeLabel,
  sanitizeString,
  retryWithBackoff,
  getErrorType,
  createSuccessResponse,
  createErrorResponse,
  mergeBatchResults,
  isValidGovernanceAddress,
  calculateTimeRemaining,
  hasTimeExpired,
  generateUniqueId,
  deepClone,
  isEmpty
} from './utils/governance.utils';
