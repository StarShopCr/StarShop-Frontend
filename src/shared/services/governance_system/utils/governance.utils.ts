import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk';
import type { 
  Proposal, 
  Vote, 
  VotingResults, 
  ProposalValidationResult,
  VoteValidationResult,
  DelegationStatus,
  VotingPowerInfo,
  ProposalStatus,
  ProposalType,
  ActionType,
  Address,
  ProposalId
} from '../types/proposal.types';
import type { 
  GovernanceResponse, 
  ValidationResult,
  BatchOperationResult,
  TransactionResult
} from '../types/governance.types';
import { 
  VALIDATION, 
  PROPOSAL_VALIDATION_RULES, 
  VOTING_VALIDATION_RULES,
  TIME_CONSTANTS,
  ERROR_TYPES
} from '../constants/governance.constants';

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Basic Stellar address validation (56 characters, starts with G)
  const stellarAddressRegex = /^G[A-Z0-9]{55}$/;
  return stellarAddressRegex.test(address);
}

/**
 * Validate proposal ID format
 */
export function isValidProposalId(proposalId: u32): boolean {
  return typeof proposalId === 'number' && 
         Number.isInteger(proposalId) && 
         proposalId >= 0 && 
         proposalId <= 4294967295; // Max u32 value
}

/**
 * Validate proposal title
 */
export function validateProposalTitle(title: string): ValidationResult {
  const errors: string[] = [];
  
  if (!title || typeof title !== 'string') {
    errors.push('Title is required');
    return { isValid: false, errors };
  }
  
  if (title.trim().length === 0) {
    errors.push('Title cannot be empty');
  }
  
  if (title.length > VALIDATION.MAX_TITLE_LENGTH) {
    errors.push(`Title exceeds maximum length of ${VALIDATION.MAX_TITLE_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate proposal description
 */
export function validateProposalDescription(description: string): ValidationResult {
  const errors: string[] = [];
  
  if (!description || typeof description !== 'string') {
    errors.push('Description is required');
    return { isValid: false, errors };
  }
  
  if (description.trim().length === 0) {
    errors.push('Description cannot be empty');
  }
  
  if (description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description exceeds maximum length of ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate proposal type
 */
export function validateProposalType(proposalType: ProposalType): ValidationResult {
  const errors: string[] = [];
  
  if (typeof proposalType !== 'number' || !Number.isInteger(proposalType)) {
    errors.push('Proposal type must be a valid integer');
    return { isValid: false, errors };
  }
  
  if (!PROPOSAL_VALIDATION_RULES.allowedProposalTypes.includes(proposalType)) {
    errors.push(`Invalid proposal type: ${proposalType}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate proposal actions
 */
export function validateProposalActions(actions: any[]): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(actions)) {
    errors.push('Actions must be an array');
    return { isValid: false, errors };
  }
  
  if (actions.length === 0) {
    errors.push('At least one action is required');
  }
  
  if (actions.length > VALIDATION.MAX_ACTIONS_PER_PROPOSAL) {
    errors.push(`Maximum ${VALIDATION.MAX_ACTIONS_PER_PROPOSAL} actions allowed per proposal`);
  }
  
  actions.forEach((action, index) => {
    if (!action || typeof action !== 'object') {
      errors.push(`Action ${index + 1} must be an object`);
      return;
    }
    
    if (!action.type || typeof action.type !== 'string') {
      errors.push(`Action ${index + 1} must have a valid type`);
    } else if (!PROPOSAL_VALIDATION_RULES.allowedActionTypes.includes(action.type)) {
      errors.push(`Action ${index + 1} has invalid type: ${action.type}`);
    }
    
    if (!action.data) {
      errors.push(`Action ${index + 1} must have data`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate voting configuration
 */
export function validateVotingConfig(config: any): ValidationResult {
  const errors: string[] = [];
  
  if (!config || typeof config !== 'object') {
    errors.push('Voting configuration is required');
    return { isValid: false, errors };
  }
  
  // Validate duration
  if (typeof config.duration !== 'number' || !Number.isInteger(config.duration)) {
    errors.push('Voting duration must be a valid integer');
  } else if (config.duration < VALIDATION.MIN_VOTING_DURATION) {
    errors.push(`Voting duration must be at least ${VALIDATION.MIN_VOTING_DURATION} seconds`);
  } else if (config.duration > VALIDATION.MAX_VOTING_DURATION) {
    errors.push(`Voting duration cannot exceed ${VALIDATION.MAX_VOTING_DURATION} seconds`);
  }
  
  // Validate execution delay
  if (typeof config.executionDelay !== 'number' || !Number.isInteger(config.executionDelay)) {
    errors.push('Execution delay must be a valid integer');
  } else if (config.executionDelay < VALIDATION.MIN_EXECUTION_DELAY) {
    errors.push(`Execution delay must be at least ${VALIDATION.MIN_EXECUTION_DELAY} seconds`);
  } else if (config.executionDelay > VALIDATION.MAX_EXECUTION_DELAY) {
    errors.push(`Execution delay cannot exceed ${VALIDATION.MAX_EXECUTION_DELAY} seconds`);
  }
  
  // Validate quorum
  if (typeof config.quorum !== 'number' || !Number.isInteger(config.quorum)) {
    errors.push('Quorum must be a valid integer');
  } else if (config.quorum < VALIDATION.MIN_QUORUM_PERCENTAGE) {
    errors.push(`Quorum must be at least ${VALIDATION.MIN_QUORUM_PERCENTAGE}%`);
  } else if (config.quorum > VALIDATION.MAX_QUORUM_PERCENTAGE) {
    errors.push(`Quorum cannot exceed ${VALIDATION.MAX_QUORUM_PERCENTAGE}%`);
  }
  
  // Validate threshold
  if (typeof config.threshold !== 'number' || !Number.isInteger(config.threshold)) {
    errors.push('Threshold must be a valid integer');
  } else if (config.threshold < VALIDATION.MIN_THRESHOLD_PERCENTAGE) {
    errors.push(`Threshold must be at least ${VALIDATION.MIN_THRESHOLD_PERCENTAGE}%`);
  } else if (config.threshold > VALIDATION.MAX_THRESHOLD_PERCENTAGE) {
    errors.push(`Threshold cannot exceed ${VALIDATION.MAX_THRESHOLD_PERCENTAGE}%`);
  }
  
  // Validate one address one vote
  if (typeof config.oneAddressOneVote !== 'boolean') {
    errors.push('One address one vote must be a boolean value');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete proposal
 */
export function validateProposal(proposal: Partial<Proposal>): ProposalValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate title
  const titleValidation = validateProposalTitle(proposal.title || '');
  if (!titleValidation.isValid) {
    errors.push(...titleValidation.errors);
  }
  
  // Validate description
  const descriptionValidation = validateProposalDescription(proposal.description || '');
  if (!descriptionValidation.isValid) {
    errors.push(...descriptionValidation.errors);
  }
  
  // Validate proposal type
  if (proposal.proposalType !== undefined) {
    const typeValidation = validateProposalType(proposal.proposalType);
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors);
    }
  }
  
  // Validate actions
  if (proposal.actions) {
    const actionsValidation = validateProposalActions(proposal.actions);
    if (!actionsValidation.isValid) {
      errors.push(...actionsValidation.errors);
    }
  }
  
  // Validate voting config
  if (proposal.votingConfig) {
    const configValidation = validateVotingConfig(proposal.votingConfig);
    if (!configValidation.isValid) {
      errors.push(...configValidation.errors);
    }
  }
  
  // Validate proposer
  if (proposal.proposer && !isValidStellarAddress(proposal.proposer)) {
    errors.push('Invalid proposer address');
  }
  
  // Validate metadata hash
  if (proposal.metadataHash && proposal.metadataHash.length > VALIDATION.MAX_METADATA_HASH_LENGTH) {
    errors.push(`Metadata hash exceeds maximum length of ${VALIDATION.MAX_METADATA_HASH_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details: {
      titleValid: titleValidation.isValid,
      descriptionValid: descriptionValidation.isValid,
      actionsValid: proposal.actions ? validateProposalActions(proposal.actions).isValid : true,
      votingConfigValid: proposal.votingConfig ? validateVotingConfig(proposal.votingConfig).isValid : true,
      proposerEligible: proposal.proposer ? isValidStellarAddress(proposal.proposer) : true,
      cooldownRespected: true, // This would need to be checked against contract state
    }
  };
}

/**
 * Validate vote
 */
export function validateVote(vote: Partial<Vote>): VoteValidationResult {
  const errors: string[] = [];
  
  // Validate voter address
  if (!vote.voter || !isValidStellarAddress(vote.voter)) {
    errors.push('Invalid voter address');
  }
  
  // Validate proposal ID
  if (vote.proposalId !== undefined && !isValidProposalId(vote.proposalId)) {
    errors.push('Invalid proposal ID');
  }
  
  // Validate support value
  if (typeof vote.support !== 'boolean') {
    errors.push('Vote support must be a boolean value');
  }
  
  // Validate weight
  if (vote.weight !== undefined) {
    if (typeof vote.weight !== 'number' || !Number.isInteger(vote.weight)) {
      errors.push('Vote weight must be a valid integer');
    } else if (vote.weight < VOTING_VALIDATION_RULES.minVoteWeight) {
      errors.push(`Vote weight must be at least ${VOTING_VALIDATION_RULES.minVoteWeight}`);
    } else if (vote.weight > VOTING_VALIDATION_RULES.maxVoteWeight) {
      errors.push(`Vote weight cannot exceed ${VOTING_VALIDATION_RULES.maxVoteWeight}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    details: {
      voterEligible: vote.voter ? isValidStellarAddress(vote.voter) : false,
      proposalActive: true, // This would need to be checked against contract state
      votingPeriodValid: true, // This would need to be checked against contract state
      sufficientVotingPower: true, // This would need to be checked against contract state
      notAlreadyVoted: true, // This would need to be checked against contract state
      delegationValid: true, // This would need to be checked against contract state
    }
  };
}

/**
 * Calculate voting results
 */
export function calculateVotingResults(
  votes: Vote[],
  totalVotingPower: i128,
  quorum: u128,
  threshold: u128
): VotingResults {
  const votesFor = votes
    .filter(vote => vote.support)
    .reduce((sum, vote) => sum + vote.weight, 0n);
  
  const votesAgainst = votes
    .filter(vote => !vote.support)
    .reduce((sum, vote) => sum + vote.weight, 0n);
  
  const totalVotes = votesFor + votesAgainst;
  const participationRate = totalVotingPower > 0n ? Number(totalVotes) / Number(totalVotingPower) : 0;
  
  const quorumAchieved = totalVotes >= quorum;
  const thresholdMet = quorumAchieved && votesFor >= (totalVotes * threshold / 100n);
  const passed = quorumAchieved && thresholdMet;
  
  return {
    proposalId: votes[0]?.proposalId || 0,
    totalVotes: votes.length,
    totalVotingPower,
    votesFor,
    votesAgainst,
    abstentions: totalVotingPower - totalVotes,
    participationRate,
    quorumAchieved,
    thresholdMet,
    passed,
    votingEndTime: 0, // This would need to be calculated from proposal data
    timeRemaining: 0, // This would need to be calculated from proposal data
  };
}

/**
 * Calculate voting power percentage
 */
export function calculateVotingPowerPercentage(weight: i128, totalPower: i128): number {
  if (totalPower === 0n) return 0;
  return Number(weight * 100n / totalPower);
}

/**
 * Format time duration
 */
export function formatTimeDuration(seconds: u64): string {
  const days = Math.floor(Number(seconds) / TIME_CONSTANTS.SECONDS_PER_DAY);
  const hours = Math.floor((Number(seconds) % TIME_CONSTANTS.SECONDS_PER_DAY) / TIME_CONSTANTS.SECONDS_PER_HOUR);
  const minutes = Math.floor((Number(seconds) % TIME_CONSTANTS.SECONDS_PER_HOUR) / TIME_CONSTANTS.SECONDS_PER_MINUTE);
  const secs = Number(seconds) % TIME_CONSTANTS.SECONDS_PER_MINUTE;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Check if proposal is active
 */
export function isProposalActive(proposal: Proposal, currentTime: u64): boolean {
  return proposal.status === ProposalStatus.ACTIVE &&
         currentTime >= proposal.activatedAt &&
         currentTime < (proposal.activatedAt + proposal.votingConfig.duration);
}

/**
 * Check if proposal is executable
 */
export function isProposalExecutable(proposal: Proposal, currentTime: u64): boolean {
  return proposal.status === ProposalStatus.PASSED &&
         currentTime >= (proposal.activatedAt + proposal.votingConfig.duration + proposal.votingConfig.executionDelay);
}

/**
 * Get proposal status label
 */
export function getProposalStatusLabel(status: ProposalStatus): string {
  const labels = {
    [ProposalStatus.DRAFT]: 'Draft',
    [ProposalStatus.ACTIVE]: 'Active',
    [ProposalStatus.PASSED]: 'Passed',
    [ProposalStatus.REJECTED]: 'Rejected',
    [ProposalStatus.EXECUTED]: 'Executed',
    [ProposalStatus.CANCELED]: 'Canceled',
    [ProposalStatus.VETOED]: 'Vetoed',
  };
  return labels[status] || 'Unknown';
}

/**
 * Get proposal type label
 */
export function getProposalTypeLabel(type: ProposalType): string {
  const labels = {
    [ProposalType.FEATURE_REQUEST]: 'Feature Request',
    [ProposalType.POLICY_CHANGE]: 'Policy Change',
    [ProposalType.PARAMETER_CHANGE]: 'Parameter Change',
    [ProposalType.CONTRACT_UPGRADE]: 'Contract Upgrade',
    [ProposalType.EMERGENCY_ACTION]: 'Emergency Action',
    [ProposalType.ECONOMIC_CHANGE]: 'Economic Change',
  };
  return labels[type] || 'Unknown';
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  exponentialBackoff: boolean = true
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = exponentialBackoff 
        ? baseDelay * Math.pow(2, attempt)
        : baseDelay;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Get error type from error message
 */
export function getErrorType(errorMessage: string): string {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('network') || message.includes('connection')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  if (message.includes('contract') || message.includes('transaction')) {
    return ERROR_TYPES.CONTRACT_ERROR;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ERROR_TYPES.VALIDATION_ERROR;
  }
  if (message.includes('wallet') || message.includes('signature')) {
    return ERROR_TYPES.WALLET_ERROR;
  }
  if (message.includes('proposal')) {
    return ERROR_TYPES.PROPOSAL_ERROR;
  }
  if (message.includes('vote') || message.includes('voting')) {
    return ERROR_TYPES.VOTING_ERROR;
  }
  if (message.includes('delegation') || message.includes('delegate')) {
    return ERROR_TYPES.DELEGATION_ERROR;
  }
  if (message.includes('execution') || message.includes('execute')) {
    return ERROR_TYPES.EXECUTION_ERROR;
  }
  if (message.includes('unauthorized') || message.includes('permission')) {
    return ERROR_TYPES.AUTHORIZATION_ERROR;
  }
  
  return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(data: T): GovernanceResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Create error response
 */
export function createErrorResponse<T>(error: string, errorCode?: number): GovernanceResponse<T> {
  return {
    success: false,
    error,
    errorCode
  };
}

/**
 * Merge batch operation results
 */
export function mergeBatchResults(results: TransactionResult[]): BatchOperationResult {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error');
  
  return {
    total: results.length,
    successful,
    failed,
    results,
    errors
  };
}

/**
 * Check if address is valid for governance operations
 */
export function isValidGovernanceAddress(address: Address): boolean {
  return isValidStellarAddress(address);
}

/**
 * Validate delegation parameters
 */
export function validateDelegation(delegator: Address, delegatee: Address): ValidationResult {
  const errors: string[] = [];
  
  if (!isValidStellarAddress(delegator)) {
    errors.push('Invalid delegator address');
  }
  
  if (!isValidStellarAddress(delegatee)) {
    errors.push('Invalid delegatee address');
  }
  
  if (delegator === delegatee) {
    errors.push('Self-delegation not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate time remaining
 */
export function calculateTimeRemaining(endTime: u64, currentTime: u64): u64 {
  return endTime > currentTime ? endTime - currentTime : 0;
}

/**
 * Check if time has expired
 */
export function hasTimeExpired(endTime: u64, currentTime: u64): boolean {
  return currentTime >= endTime;
}

/**
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
