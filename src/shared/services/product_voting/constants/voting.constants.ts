/**
 * Product Voting Contract Service - Constants & Error Codes
 */

export const ROUND_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED',
} as const;

export const VOTE_WEIGHTS = {
  MIN: 1,
  DEFAULT: 1,
  MAX: 100,
} as const;

export const VOTING_ERROR_CODES = {
  ROUND_NOT_FOUND: 'ROUND_NOT_FOUND',
  ROUND_NOT_ACTIVE: 'ROUND_NOT_ACTIVE',
  ROUND_ALREADY_ENDED: 'ROUND_ALREADY_ENDED',
  ROUND_NOT_ENDED: 'ROUND_NOT_ENDED',
  INVALID_ROUND_PARAMS: 'INVALID_ROUND_PARAMS',
  INVALID_PRODUCT_ID: 'INVALID_PRODUCT_ID',
  INVALID_VOTER_ADDRESS: 'INVALID_VOTER_ADDRESS',
  PRODUCT_NOT_ELIGIBLE: 'PRODUCT_NOT_ELIGIBLE',
  USER_ALREADY_VOTED: 'USER_ALREADY_VOTED',
  VOTE_NOT_FOUND: 'VOTE_NOT_FOUND',
  MAX_VOTES_EXCEEDED: 'MAX_VOTES_EXCEEDED',
  INVALID_WEIGHT: 'INVALID_WEIGHT',
  RETRACT_NOT_ALLOWED: 'RETRACT_NOT_ALLOWED',
  REWARDS_ALREADY_DISTRIBUTED: 'REWARDS_ALREADY_DISTRIBUTED',
  NO_VOTERS_FOR_REWARDS: 'NO_VOTERS_FOR_REWARDS',
} as const;

export const ERROR_MESSAGES: Record<keyof typeof VOTING_ERROR_CODES, string> = {
  ROUND_NOT_FOUND: 'Voting round not found',
  ROUND_NOT_ACTIVE: 'Voting round is not active',
  ROUND_ALREADY_ENDED: 'Voting round has already ended',
  ROUND_NOT_ENDED: 'Voting round has not ended yet',
  INVALID_ROUND_PARAMS: 'Invalid round parameters provided',
  INVALID_PRODUCT_ID: 'Invalid or missing product ID',
  INVALID_VOTER_ADDRESS: 'Invalid voter Stellar public address',
  PRODUCT_NOT_ELIGIBLE: 'Product is not eligible for this voting round',
  USER_ALREADY_VOTED: 'User has already cast a vote for this product in this round',
  VOTE_NOT_FOUND: 'Active vote not found for retraction',
  MAX_VOTES_EXCEEDED: 'Maximum votes per user exceeded for this round',
  INVALID_WEIGHT: 'Vote weight must be within valid range',
  RETRACT_NOT_ALLOWED: 'Vote retraction is not allowed in this round',
  REWARDS_ALREADY_DISTRIBUTED: 'Voter rewards have already been distributed for this round',
  NO_VOTERS_FOR_REWARDS: 'No eligible voters to receive rewards',
};

export const DEFAULT_ROUND_CONFIG = {
  quorum: 1,
  maxVotesPerUser: 10,
  defaultWeight: 1,
  minWeight: 1,
  maxWeight: 100,
  allowRetract: true,
} as const;
