import { VoteType, VoteStatus } from '../types/voting.types';
import type { Vote, VoteRequest, VotingResults, ValidationResult } from '../types/voting.types';
import type { VotingPower } from '../types/limits.types';
import { VoterLevel } from '../types/limits.types';
import { VALIDATION, ERROR_MESSAGES, VOTER_LEVEL_THRESHOLDS, ERROR_TYPES } from '../constants/voting.constants';

/**
 * Validate a Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return address.length === 56 && address.startsWith('G');
}

/**
 * Validate a product ID
 */
export function isValidProductId(productId: string): boolean {
  if (!productId || typeof productId !== 'string') return false;
  return (
    productId.length >= VALIDATION.minProductIdLength &&
    productId.length <= VALIDATION.maxProductIdLength
  );
}

/**
 * Validate a vote request
 */
export function validateVoteRequest(request: VoteRequest): ValidationResult {
  const errors: string[] = [];

  if (!isValidProductId(request.productId)) {
    errors.push('Invalid product ID');
  }

  if (!isValidStellarAddress(request.voter)) {
    errors.push(ERROR_MESSAGES.INVALID_ADDRESS);
  }

  if (!Object.values(VoteType).includes(request.voteType)) {
    errors.push(ERROR_MESSAGES.INVALID_VOTE_TYPE);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate voting results from a list of votes
 */
export function calculateVotingResults(productId: string, votes: Vote[]): VotingResults {
  const activeVotes = votes.filter((v) => v.status === VoteStatus.ACTIVE);
  const upvotes = activeVotes.filter((v) => v.voteType === VoteType.UPVOTE);
  const downvotes = activeVotes.filter((v) => v.voteType === VoteType.DOWNVOTE);

  const totalUpvotes = upvotes.length;
  const totalDownvotes = downvotes.length;
  const weightedUpvotes = upvotes.reduce((sum, v) => sum + v.weight, 0);
  const weightedDownvotes = downvotes.reduce((sum, v) => sum + v.weight, 0);

  return {
    productId,
    totalUpvotes,
    totalDownvotes,
    netScore: totalUpvotes - totalDownvotes,
    totalVoters: new Set(activeVotes.map((v) => v.voter)).size,
    weightedScore: weightedUpvotes - weightedDownvotes,
    lastUpdated: Date.now(),
  };
}

/**
 * Determine voter level based on vote count and reputation
 */
export function getVoterLevel(totalVotes: number, reputation: number): VoterLevel {
  if (
    totalVotes >= VOTER_LEVEL_THRESHOLDS.guardian.minVotes &&
    reputation >= VOTER_LEVEL_THRESHOLDS.guardian.minReputation
  ) {
    return VoterLevel.GUARDIAN;
  }
  if (
    totalVotes >= VOTER_LEVEL_THRESHOLDS.expert.minVotes &&
    reputation >= VOTER_LEVEL_THRESHOLDS.expert.minReputation
  ) {
    return VoterLevel.EXPERT;
  }
  if (
    totalVotes >= VOTER_LEVEL_THRESHOLDS.trusted.minVotes &&
    reputation >= VOTER_LEVEL_THRESHOLDS.trusted.minReputation
  ) {
    return VoterLevel.TRUSTED;
  }
  if (
    totalVotes >= VOTER_LEVEL_THRESHOLDS.regular.minVotes &&
    reputation >= VOTER_LEVEL_THRESHOLDS.regular.minReputation
  ) {
    return VoterLevel.REGULAR;
  }
  return VoterLevel.NEWCOMER;
}

/**
 * Calculate voting power for a user
 */
export function calculateVotingPower(
  basePower: number,
  level: VoterLevel
): VotingPower {
  const threshold = VOTER_LEVEL_THRESHOLDS[level];
  const multiplier = threshold.multiplier;
  const bonusPower = Math.floor(basePower * (multiplier - 1));

  return {
    voter: '',
    basePower,
    bonusPower,
    totalPower: basePower + bonusPower,
    level,
    multiplier,
  };
}

/**
 * Calculate upvote percentage
 */
export function calculateUpvotePercentage(upvotes: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((upvotes / total) * 10000) / 100;
}

/**
 * Sanitize user input string
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[<>&"']/g, '').trim();
}

/**
 * Generate a unique ID
 */
export function generateUniqueId(): string {
  return `vote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Classify error type
 */
export function getErrorType(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('contract')) return ERROR_TYPES.CONTRACT_ERROR;
    if (message.includes('network') || message.includes('timeout')) return ERROR_TYPES.NETWORK_ERROR;
    if (message.includes('wallet') || message.includes('sign')) return ERROR_TYPES.WALLET_ERROR;
    if (message.includes('limit') || message.includes('rate')) return ERROR_TYPES.RATE_LIMIT_ERROR;
    if (message.includes('valid') || message.includes('invalid')) return ERROR_TYPES.VALIDATION_ERROR;
  }
  return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T): { success: true; data: T; timestamp: number } {
  return { success: true, data, timestamp: Date.now() };
}

/**
 * Create an error response
 */
export function createErrorResponse(error: string): { success: false; error: string; timestamp: number } {
  return { success: false, error, timestamp: Date.now() };
}

/**
 * Check if a timestamp is within a given duration from now
 */
export function isWithinDuration(timestamp: number, durationMs: number): boolean {
  return Date.now() - timestamp < durationMs;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
