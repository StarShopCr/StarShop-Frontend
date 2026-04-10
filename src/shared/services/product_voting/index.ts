// Main service export
export { ProductVotingService } from './voting.service';

// Type exports
export type {
  Vote,
  VoteRequest,
  VotingResults,
  VotingStats,
  UserVotingHistory,
  VotingTrend,
  VotingServiceConfig,
  VotingResponse,
  TransactionResult,
  VotingEventData,
  VotingEventListener,
  EventSubscription,
  HealthCheck,
  PerformanceMetrics,
  ValidationResult,
  Address,
  ProductId,
  VoteId
} from './types/voting.types';

export {
  VoteType,
  VoteStatus
} from './types/voting.types';

export type {
  ProductRanking,
  RankingEntry,
  RankingHistory,
  RankingHistoryEntry,
  Leaderboard,
  LeaderboardEntry,
  TopProductsRequest,
  TopProductsResult
} from './types/ranking.types';

export {
  RankingCategory
} from './types/ranking.types';

export type {
  VotingLimits,
  VotingPower,
  VotingCooldown,
  DailyVotingStats
} from './types/limits.types';

export {
  VoterLevel
} from './types/limits.types';

// Constants exports
export {
  VOTING_ERROR_CODES,
  ERROR_MESSAGES,
  NETWORKS,
  DEFAULT_CONFIG,
  VALIDATION,
  CACHE_KEYS,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  ERROR_TYPES,
  VOTER_LEVEL_THRESHOLDS
} from './constants/voting.constants';

// Utility function exports
export {
  isValidStellarAddress,
  isValidProductId,
  validateVoteRequest,
  calculateVotingResults,
  getVoterLevel,
  calculateVotingPower,
  calculateUpvotePercentage,
  sanitizeString,
  generateUniqueId,
  retryWithBackoff,
  getErrorType,
  createSuccessResponse,
  createErrorResponse,
  isWithinDuration,
  deepClone
} from './utils/voting.utils';
