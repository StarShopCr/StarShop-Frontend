import type { u32 } from '../types/governance.types';

/**
 * Error codes for the governance contract
 */
export const GOVERNANCE_ERROR_CODES = {
  ALREADY_INITIALIZED: 1,
  NOT_INITIALIZED: 2,
  UNAUTHORIZED: 3,
  PROPOSAL_NOT_FOUND: 101,
  INVALID_PROPOSAL_STATUS: 102,
  NOT_ELIGIBLE_TO_PROPOSE: 103,
  PROPOSAL_IN_COOLDOWN: 104,
  INSUFFICIENT_STAKE: 105,
  INVALID_PROPOSAL_TYPE: 106,
  PROPOSAL_LIMIT_REACHED: 107,
  INVALID_PROPOSAL_INPUT: 108,
  PROPOSAL_NOT_ACTIVE: 201,
  ALREADY_VOTED: 202,
  NO_VOTING_POWER: 203,
  INVALID_VOTING_PERIOD: 204,
  INVALID_DELEGATION: 301,
  SELF_DELEGATION_NOT_ALLOWED: 302,
  PROPOSAL_NOT_EXECUTABLE: 401,
  EXECUTION_FAILED: 402,
  EXECUTION_DELAY_NOT_MET: 403,
  INVALID_ACTION: 404,
  NOT_VERIFIED: 501,
  USER_LEVEL_NOT_SET: 502,
  INSUFFICIENT_REFERRAL_LEVEL: 503,
  MODERATOR_NOT_FOUND: 601,
  ALREADY_MODERATOR: 602,
  CONTRACT_CALL_FAILED: 701,
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [GOVERNANCE_ERROR_CODES.ALREADY_INITIALIZED]: 'Contract has already been initialized',
  [GOVERNANCE_ERROR_CODES.NOT_INITIALIZED]: 'Contract not initialized',
  [GOVERNANCE_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access - insufficient privileges',
  [GOVERNANCE_ERROR_CODES.PROPOSAL_NOT_FOUND]: 'Proposal not found',
  [GOVERNANCE_ERROR_CODES.INVALID_PROPOSAL_STATUS]: 'Invalid proposal status for this operation',
  [GOVERNANCE_ERROR_CODES.NOT_ELIGIBLE_TO_PROPOSE]: 'Not eligible to create proposals',
  [GOVERNANCE_ERROR_CODES.PROPOSAL_IN_COOLDOWN]: 'Proposal creation in cooldown period',
  [GOVERNANCE_ERROR_CODES.INSUFFICIENT_STAKE]: 'Insufficient stake to create proposal',
  [GOVERNANCE_ERROR_CODES.INVALID_PROPOSAL_TYPE]: 'Invalid proposal type',
  [GOVERNANCE_ERROR_CODES.PROPOSAL_LIMIT_REACHED]: 'Proposal limit reached',
  [GOVERNANCE_ERROR_CODES.INVALID_PROPOSAL_INPUT]: 'Invalid proposal input',
  [GOVERNANCE_ERROR_CODES.PROPOSAL_NOT_ACTIVE]: 'Proposal is not active for voting',
  [GOVERNANCE_ERROR_CODES.ALREADY_VOTED]: 'Already voted on this proposal',
  [GOVERNANCE_ERROR_CODES.NO_VOTING_POWER]: 'No voting power available',
  [GOVERNANCE_ERROR_CODES.INVALID_VOTING_PERIOD]: 'Invalid voting period',
  [GOVERNANCE_ERROR_CODES.INVALID_DELEGATION]: 'Invalid delegation',
  [GOVERNANCE_ERROR_CODES.SELF_DELEGATION_NOT_ALLOWED]: 'Self-delegation not allowed',
  [GOVERNANCE_ERROR_CODES.PROPOSAL_NOT_EXECUTABLE]: 'Proposal not executable',
  [GOVERNANCE_ERROR_CODES.EXECUTION_FAILED]: 'Proposal execution failed',
  [GOVERNANCE_ERROR_CODES.EXECUTION_DELAY_NOT_MET]: 'Execution delay not met',
  [GOVERNANCE_ERROR_CODES.INVALID_ACTION]: 'Invalid action',
  [GOVERNANCE_ERROR_CODES.NOT_VERIFIED]: 'User not verified',
  [GOVERNANCE_ERROR_CODES.USER_LEVEL_NOT_SET]: 'User level not set',
  [GOVERNANCE_ERROR_CODES.INSUFFICIENT_REFERRAL_LEVEL]: 'Insufficient referral level',
  [GOVERNANCE_ERROR_CODES.MODERATOR_NOT_FOUND]: 'Moderator not found',
  [GOVERNANCE_ERROR_CODES.ALREADY_MODERATOR]: 'Already a moderator',
  [GOVERNANCE_ERROR_CODES.CONTRACT_CALL_FAILED]: 'Contract call failed',
} as const;

/**
 * Network configurations
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CAXIUU3GKDXIFVLKYHMHIQ5TRHBJOLMTSRM2DABN4ITIURMPM5JEWL5Z',
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
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Maximum proposal title length */
  MAX_TITLE_LENGTH: 200,
  /** Maximum proposal description length */
  MAX_DESCRIPTION_LENGTH: 5000,
  /** Maximum metadata hash length */
  MAX_METADATA_HASH_LENGTH: 64,
  /** Maximum number of actions per proposal */
  MAX_ACTIONS_PER_PROPOSAL: 20,
  /** Minimum voting duration in seconds */
  MIN_VOTING_DURATION: 3600, // 1 hour
  /** Maximum voting duration in seconds */
  MAX_VOTING_DURATION: 2592000, // 30 days
  /** Minimum execution delay in seconds */
  MIN_EXECUTION_DELAY: 3600, // 1 hour
  /** Maximum execution delay in seconds */
  MAX_EXECUTION_DELAY: 604800, // 7 days
  /** Minimum quorum percentage (0-100) */
  MIN_QUORUM_PERCENTAGE: 1,
  /** Maximum quorum percentage (0-100) */
  MAX_QUORUM_PERCENTAGE: 100,
  /** Minimum threshold percentage (0-100) */
  MIN_THRESHOLD_PERCENTAGE: 50,
  /** Maximum threshold percentage (0-100) */
  MAX_THRESHOLD_PERCENTAGE: 100,
  /** Maximum proposal limit per user */
  MAX_PROPOSAL_LIMIT: 10,
  /** Minimum required stake */
  MIN_REQUIRED_STAKE: 1000000, // 1 XLM in stroops
  /** Maximum cooldown period in seconds */
  MAX_COOLDOWN_PERIOD: 86400, // 24 hours
  /** Maximum batch size for operations */
  MAX_BATCH_SIZE: 50,
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  /** Admin cache key */
  ADMIN: 'governance:admin',
  /** Contract status cache key */
  CONTRACT_STATUS: 'governance:contract:status',
  /** Proposal cache key */
  PROPOSAL: (proposalId: u32) => `governance:proposal:${proposalId}`,
  /** Proposal list cache key */
  PROPOSAL_LIST: (status?: string, limit?: number, offset?: number) => 
    `governance:proposals:${status || 'all'}:${limit || 'all'}:${offset || 0}`,
  /** Active proposals cache key */
  ACTIVE_PROPOSALS: 'governance:proposals:active',
  /** Executable proposals cache key */
  EXECUTABLE_PROPOSALS: 'governance:proposals:executable',
  /** Vote cache key */
  VOTE: (proposalId: u32, voter: string) => `governance:vote:${proposalId}:${voter}`,
  /** Voting results cache key */
  VOTING_RESULTS: (proposalId: u32) => `governance:voting:results:${proposalId}`,
  /** Voting power cache key */
  VOTING_POWER: (address: string, proposalId?: u32) => 
    `governance:voting:power:${address}${proposalId ? `:${proposalId}` : ''}`,
  /** Delegation cache key */
  DELEGATION: (delegator: string) => `governance:delegation:${delegator}`,
  /** Moderator list cache key */
  MODERATORS: 'governance:moderators',
  /** Governance stats cache key */
  STATS: 'governance:stats',
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
  /** Proposal errors */
  PROPOSAL_ERROR: 'proposal_error',
  /** Voting errors */
  VOTING_ERROR: 'voting_error',
  /** Delegation errors */
  DELEGATION_ERROR: 'delegation_error',
  /** Execution errors */
  EXECUTION_ERROR: 'execution_error',
  /** Authorization errors */
  AUTHORIZATION_ERROR: 'authorization_error',
  /** Unknown errors */
  UNKNOWN_ERROR: 'unknown_error',
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
 * Governance contract method names
 */
export const CONTRACT_METHODS = {
  INITIALIZE: 'initialize',
  CREATE_PROPOSAL: 'create_proposal',
  ACTIVATE_PROPOSAL: 'activate_proposal',
  CANCEL_PROPOSAL: 'cancel_proposal',
  VETO_PROPOSAL: 'veto_proposal',
  MARK_PASSED: 'mark_passed',
  MARK_REJECTED: 'mark_rejected',
  MARK_EXECUTED: 'mark_executed',
  CAST_VOTE: 'cast_vote',
  TAKE_SNAPSHOT: 'take_snapshot',
  DELEGATE_VOTE: 'delegate_vote',
  GET_VOTE_WEIGHT: 'get_vote_weight',
  EXECUTE_PROPOSAL: 'execute_proposal',
  GET_PROPOSAL: 'get_proposal',
  GET_ACTIVE_PROPOSALS: 'get_active_proposals',
  GET_EXECUTABLE_PROPOSALS: 'get_executable_proposals',
  GET_PROPOSAL_VOTERS_COUNT: 'get_proposal_voters_count',
} as const;

/**
 * Event names for governance contract
 */
export const CONTRACT_EVENTS = {
  CONTRACT_INITIALIZED: 'ContractInitialized',
  PROPOSAL_CREATED: 'ProposalCreated',
  PROPOSAL_ACTIVATED: 'ProposalActivated',
  PROPOSAL_CANCELLED: 'ProposalCancelled',
  PROPOSAL_VETOED: 'ProposalVetoed',
  PROPOSAL_PASSED: 'ProposalPassed',
  PROPOSAL_REJECTED: 'ProposalRejected',
  PROPOSAL_EXECUTED: 'ProposalExecuted',
  VOTE_CAST: 'VoteCast',
  VOTE_DELEGATED: 'VoteDelegated',
  VOTING_WEIGHTS_UPDATED: 'VotingWeightsUpdated',
  MODERATOR_APPOINTED: 'ModeratorAppointed',
  MODERATOR_REMOVED: 'ModeratorRemoved',
} as const;

/**
 * Proposal status labels
 */
export const PROPOSAL_STATUS_LABELS = {
  0: 'Draft',
  1: 'Active',
  2: 'Passed',
  3: 'Rejected',
  4: 'Executed',
  5: 'Canceled',
  6: 'Vetoed',
} as const;

/**
 * Proposal type labels
 */
export const PROPOSAL_TYPE_LABELS = {
  0: 'Feature Request',
  1: 'Policy Change',
  2: 'Parameter Change',
  3: 'Contract Upgrade',
  4: 'Emergency Action',
  5: 'Economic Change',
} as const;

/**
 * Action type labels
 */
export const ACTION_TYPE_LABELS = {
  UpdateProposalRequirements: 'Update Proposal Requirements',
  AppointModerator: 'Appoint Moderator',
  RemoveModerator: 'Remove Moderator',
  UpdateRewardRates: 'Update Reward Rates',
  UpdateLevelRequirements: 'Update Level Requirements',
  UpdateAuctionConditions: 'Update Auction Conditions',
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Maximum response time in milliseconds */
  MAX_RESPONSE_TIME: 10000,
  /** Maximum cache size */
  MAX_CACHE_SIZE: 10000,
  /** Cache TTL in milliseconds */
  CACHE_TTL: 300000, // 5 minutes
  /** Maximum retry attempts */
  MAX_RETRY_ATTEMPTS: 5,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 1000,
  /** Batch operation timeout in milliseconds */
  BATCH_TIMEOUT: 60000,
} as const;

/**
 * Health check intervals
 */
export const HEALTH_CHECK_INTERVALS = {
  /** Contract health check interval in milliseconds */
  CONTRACT_CHECK: 30000, // 30 seconds
  /** Network health check interval in milliseconds */
  NETWORK_CHECK: 60000, // 1 minute
  /** Wallet health check interval in milliseconds */
  WALLET_CHECK: 15000, // 15 seconds
} as const;

/**
 * Default proposal values
 */
export const DEFAULT_PROPOSAL_VALUES = {
  TITLE: 'Untitled Proposal',
  DESCRIPTION: 'No description provided',
  METADATA_HASH: '',
  VOTING_DURATION: 604800, // 7 days
  EXECUTION_DELAY: 86400, // 1 day
  QUORUM: 20, // 20%
  THRESHOLD: 50, // 50%
} as const;

/**
 * Proposal validation rules
 */
export const PROPOSAL_VALIDATION_RULES = {
  maxTitleLength: VALIDATION.MAX_TITLE_LENGTH,
  maxDescriptionLength: VALIDATION.MAX_DESCRIPTION_LENGTH,
  maxMetadataHashLength: VALIDATION.MAX_METADATA_HASH_LENGTH,
  maxActionsPerProposal: VALIDATION.MAX_ACTIONS_PER_PROPOSAL,
  minVotingDuration: VALIDATION.MIN_VOTING_DURATION,
  maxVotingDuration: VALIDATION.MAX_VOTING_DURATION,
  minExecutionDelay: VALIDATION.MIN_EXECUTION_DELAY,
  maxExecutionDelay: VALIDATION.MAX_EXECUTION_DELAY,
  minQuorumPercentage: VALIDATION.MIN_QUORUM_PERCENTAGE,
  maxQuorumPercentage: VALIDATION.MAX_QUORUM_PERCENTAGE,
  minThresholdPercentage: VALIDATION.MIN_THRESHOLD_PERCENTAGE,
  maxThresholdPercentage: VALIDATION.MAX_THRESHOLD_PERCENTAGE,
  requiredFields: ['title', 'description', 'proposalType', 'actions', 'votingConfig'],
  allowedProposalTypes: [0, 1, 2, 3, 4, 5], // All proposal types
  allowedActionTypes: [
    'UpdateProposalRequirements',
    'AppointModerator',
    'RemoveModerator',
    'UpdateRewardRates',
    'UpdateLevelRequirements',
    'UpdateAuctionConditions',
  ],
} as const;

/**
 * Voting validation rules
 */
export const VOTING_VALIDATION_RULES = {
  minVotingPower: 1,
  maxVotingPower: 1000000000000, // 1 trillion
  minVoteWeight: 1,
  maxVoteWeight: 1000000000000, // 1 trillion
  allowedVoteValues: [true, false], // Support/Against only
  maxDelegationDepth: 5,
  minDelegationAmount: 1,
  maxDelegationAmount: 1000000000000, // 1 trillion
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
  /** Milliseconds in a second */
  MILLISECONDS_PER_SECOND: 1000,
} as const;

/**
 * Governance roles
 */
export const GOVERNANCE_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  PROPOSER: 'proposer',
  VOTER: 'voter',
  DELEGATOR: 'delegator',
  EXECUTOR: 'executor',
} as const;

/**
 * Permission levels
 */
export const PERMISSION_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  EXECUTE: 'execute',
  ADMIN: 'admin',
} as const;
