/**
 * Error codes for the Product Voting Contract
 */
export const VOTING_ERROR_CODES = {
  // Contract initialization errors
  ALREADY_INITIALIZED: 1,
  CONTRACT_NOT_INITIALIZED: 2,
  UNAUTHORIZED: 3,
  INVALID_ADMIN: 4,

  // Voting errors
  VOTE_NOT_FOUND: 101,
  VOTE_ALREADY_EXISTS: 102,
  INVALID_VOTE_TYPE: 103,
  VOTE_EXPIRED: 104,
  DUPLICATE_VOTE: 105,
  SELF_VOTE_NOT_ALLOWED: 106,

  // Product errors
  PRODUCT_NOT_FOUND: 201,
  PRODUCT_NOT_ACTIVE: 202,
  INVALID_PRODUCT_ID: 203,

  // Limit errors
  DAILY_VOTE_LIMIT_REACHED: 301,
  VOTING_COOLDOWN_ACTIVE: 302,
  INSUFFICIENT_VOTING_POWER: 303,
  ACCOUNT_TOO_NEW: 304,

  // Ranking errors
  RANKING_NOT_FOUND: 401,
  INVALID_RANKING_CATEGORY: 402,
  RANKING_UPDATE_FAILED: 403,

  // Validation errors
  INVALID_ADDRESS: 701,
  INVALID_INPUT: 702,
  MISSING_REQUIRED_FIELD: 703,
} as const;

/**
 * Error messages for user-facing errors
 */
export const ERROR_MESSAGES: Record<string, string> = {
  VOTE_NOT_FOUND: 'Vote not found',
  VOTE_ALREADY_EXISTS: 'You have already voted for this product',
  INVALID_VOTE_TYPE: 'Invalid vote type. Must be upvote or downvote',
  DAILY_VOTE_LIMIT_REACHED: 'Daily voting limit reached. Try again tomorrow',
  VOTING_COOLDOWN_ACTIVE: 'Please wait before casting another vote',
  INSUFFICIENT_VOTING_POWER: 'Insufficient voting power',
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_NOT_ACTIVE: 'Product is not active for voting',
  INVALID_ADDRESS: 'Invalid Stellar address',
  UNAUTHORIZED: 'Unauthorized action',
  CONTRACT_NOT_INITIALIZED: 'Contract is not initialized',
  RANKING_UPDATE_FAILED: 'Failed to update ranking',
  WALLET_NOT_CONNECTED: 'Wallet is not connected',
  TRANSACTION_FAILED: 'Transaction failed',
};

/**
 * Network configurations
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    contractId: '',
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban.stellar.org',
    contractId: '',
  },
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  maxVotesPerDay: 10,
  votingCooldownMs: 30_000, // 30 seconds
  defaultVotingPower: 1,
  maxVotingPower: 100,
  cacheExpiryMs: 60_000, // 1 minute
  maxRetries: 3,
  retryDelayMs: 1_000,
  topProductsDefaultLimit: 20,
  rankingHistoryMaxEntries: 100,
  leaderboardMaxEntries: 50,
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  minProductIdLength: 1,
  maxProductIdLength: 64,
  minAddressLength: 56,
  maxAddressLength: 56,
  minVoteWeight: 1,
  maxVoteWeight: 100,
} as const;

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  VOTING_RESULTS: 'voting_results',
  PRODUCT_RANKING: 'product_ranking',
  TOP_PRODUCTS: 'top_products',
  LEADERBOARD: 'leaderboard',
  USER_HISTORY: 'user_history',
  VOTING_STATS: 'voting_stats',
  VOTING_POWER: 'voting_power',
  VOTING_LIMITS: 'voting_limits',
} as const;

/**
 * Contract methods
 */
export const CONTRACT_METHODS = {
  VOTE_FOR_PRODUCT: 'vote_for_product',
  UPDATE_VOTE: 'update_vote',
  REMOVE_VOTE: 'remove_vote',
  GET_VOTE: 'get_vote',
  GET_VOTING_RESULTS: 'get_voting_results',
  GET_PRODUCT_RANKING: 'get_product_ranking',
  GET_TOP_PRODUCTS: 'get_top_products',
  UPDATE_RANKING: 'update_ranking',
  GET_RANKING_HISTORY: 'get_ranking_history',
  CHECK_VOTING_LIMITS: 'check_voting_limits',
  GET_VOTING_POWER: 'get_voting_power',
  GET_VOTING_STATS: 'get_voting_stats',
  GET_LEADERBOARD: 'get_leaderboard',
  GET_USER_VOTING_HISTORY: 'get_user_voting_history',
  GET_VOTING_TRENDS: 'get_voting_trends',
} as const;

/**
 * Contract events
 */
export const CONTRACT_EVENTS = {
  VOTE_CAST: 'vote_cast',
  VOTE_UPDATED: 'vote_updated',
  VOTE_REMOVED: 'vote_removed',
  RANKING_UPDATED: 'ranking_updated',
  LEADERBOARD_UPDATED: 'leaderboard_updated',
} as const;

/**
 * Error type classification
 */
export const ERROR_TYPES = {
  CONTRACT_ERROR: 'contract_error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  WALLET_ERROR: 'wallet_error',
  RATE_LIMIT_ERROR: 'rate_limit_error',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

/**
 * Voter level thresholds
 */
export const VOTER_LEVEL_THRESHOLDS = {
  newcomer: { minVotes: 0, minReputation: 0, multiplier: 1.0 },
  regular: { minVotes: 10, minReputation: 50, multiplier: 1.2 },
  trusted: { minVotes: 50, minReputation: 200, multiplier: 1.5 },
  expert: { minVotes: 200, minReputation: 1000, multiplier: 2.0 },
  guardian: { minVotes: 500, minReputation: 5000, multiplier: 3.0 },
} as const;
