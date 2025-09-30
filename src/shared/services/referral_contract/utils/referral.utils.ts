// Import core types from referral.types.ts
import type { 
  u32, i128, u64, Address, VerificationStatus, 
  MilestoneRequirement, RewardRates, LevelCriteria, LevelRequirements, 
  Milestone, UserData, ReferralResponse, TransactionResult, NetworkConfig, 
  ReferralServiceConfig, RetryConfig, CacheConfig, MonitoringConfig, 
  RegistrationRequest, MilestoneRequest, SystemMetrics, UserStats, 
  TeamAnalytics, MilestoneProgress, ReferralEventData, 
  ReferralEventListener, EventSubscription, EventListenerOptions, HealthCheck, 
  PerformanceMetrics, BatchOperationResult, UserFilter, MilestoneFilter, 
  UserSearchResult, MilestoneSearchResult, RewardDistributionInfo, 
  LevelUpgradeValidation, ReferralTreeNode, ReferralTree, ContractStateInfo, 
  WalletInfo, TransactionOptions, ValidationResult, CacheEntry, ServiceStatus
} from '../types/referral.types';

import { UserLevel } from '../types/referral.types';

/**
 * Validation utilities for referral service
 */

/**
 * Validates a Stellar address
 */
export function validateAddress(address: string): ValidationResult {
  const errors: string[] = [];
  
  if (!address || typeof address !== 'string') {
    errors.push('Address is required and must be a string');
  } else if (address.length < 56 || address.length > 56) {
    errors.push('Address must be exactly 56 characters long');
  } else if (!/^[A-Z0-9]+$/.test(address)) {
    errors.push('Address must contain only uppercase letters and numbers');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an amount (must be positive)
 */
export function validateAmount(amount: i128): ValidationResult {
  const errors: string[] = [];
  
  if (amount === null || amount === undefined) {
    errors.push('Amount is required');
  } else if (typeof amount === 'bigint' && amount <= BigInt(0)) {
    errors.push('Amount must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates identity proof format
 */
export function validateIdentityProof(identityProof: string): ValidationResult {
  const errors: string[] = [];
  
  if (!identityProof || typeof identityProof !== 'string') {
    errors.push('Identity proof is required and must be a string');
  } else if (identityProof.length < 10) {
    errors.push('Identity proof must be at least 10 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates reward rates configuration
 */
export function validateRewardRates(rewardRates: RewardRates): ValidationResult {
  const errors: string[] = [];
  
  if (!rewardRates) {
    errors.push('Reward rates are required');
    return { isValid: false, errors };
  }
  
  if (typeof rewardRates.level1 !== 'number' || rewardRates.level1 < 0 || rewardRates.level1 > 100) {
    errors.push('Level 1 reward rate must be between 0 and 100');
  }
  
  if (typeof rewardRates.level2 !== 'number' || rewardRates.level2 < 0 || rewardRates.level2 > 100) {
    errors.push('Level 2 reward rate must be between 0 and 100');
  }
  
  if (typeof rewardRates.level3 !== 'number' || rewardRates.level3 < 0 || rewardRates.level3 > 100) {
    errors.push('Level 3 reward rate must be between 0 and 100');
  }
  
  if (typeof rewardRates.max_reward_per_referral === 'bigint' && rewardRates.max_reward_per_referral <= BigInt(0)) {
    errors.push('Max reward per referral must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates level requirements configuration
 */
export function validateLevelRequirements(levelRequirements: LevelRequirements): ValidationResult {
  const errors: string[] = [];
  
  if (!levelRequirements) {
    errors.push('Level requirements are required');
    return { isValid: false, errors };
  }
  
  const levels = ['silver', 'gold', 'platinum'] as const;
  
  for (const level of levels) {
    const criteria = levelRequirements[level];
    if (!criteria) {
      errors.push(`${level} level criteria is required`);
      continue;
    }
    
    if (typeof criteria.required_direct_referrals !== 'number' || criteria.required_direct_referrals < 0) {
      errors.push(`${level} level direct referrals requirement must be non-negative`);
    }
    
    if (typeof criteria.required_team_size !== 'number' || criteria.required_team_size < 0) {
      errors.push(`${level} level team size requirement must be non-negative`);
    }
    
    if (typeof criteria.required_total_rewards === 'bigint' && criteria.required_total_rewards < BigInt(0)) {
      errors.push(`${level} level total rewards requirement must be non-negative`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates milestone configuration
 */
export function validateMilestone(milestone: Milestone): ValidationResult {
  const errors: string[] = [];
  
  if (!milestone) {
    errors.push('Milestone is required');
    return { isValid: false, errors };
  }
  
  if (!milestone.description || typeof milestone.description !== 'string') {
    errors.push('Milestone description is required and must be a string');
  }
  
  if (typeof milestone.required_level !== 'number' || milestone.required_level < 0 || milestone.required_level > 3) {
    errors.push('Required level must be between 0 and 3');
  }
  
  if (!milestone.requirement) {
    errors.push('Milestone requirement is required');
  }
  
  if (typeof milestone.reward_amount === 'bigint' && milestone.reward_amount <= BigInt(0)) {
    errors.push('Reward amount must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formatting utilities
 */

/**
 * Formats a reward amount for display
 */
export function formatRewardAmount(amount: i128, decimals: number = 7): string {
  if (typeof amount === 'bigint') {
    const divisor = BigInt(Math.pow(10, decimals));
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    return `${wholePart}.${fractionalStr}`;
  }
  
  return amount.toString();
}

/**
 * Calculates level progress percentage
 */
export function calculateLevelProgress(currentCriteria: Partial<LevelCriteria>, requiredCriteria: LevelCriteria): number {
  let totalProgress = 0;
  let totalWeight = 0;
  
  if (currentCriteria.required_direct_referrals !== undefined && requiredCriteria.required_direct_referrals > 0) {
    const progress = Math.min(currentCriteria.required_direct_referrals / requiredCriteria.required_direct_referrals, 1);
    totalProgress += progress * 0.4; // 40% weight
    totalWeight += 0.4;
  }
  
  if (currentCriteria.required_team_size !== undefined && requiredCriteria.required_team_size > 0) {
    const progress = Math.min(currentCriteria.required_team_size / requiredCriteria.required_team_size, 1);
    totalProgress += progress * 0.3; // 30% weight
    totalWeight += 0.3;
  }
  
  if (currentCriteria.required_total_rewards !== undefined && requiredCriteria.required_total_rewards > BigInt(0)) {
    const current = typeof currentCriteria.required_total_rewards === 'bigint' ? currentCriteria.required_total_rewards : BigInt(currentCriteria.required_total_rewards || 0);
    const required = typeof requiredCriteria.required_total_rewards === 'bigint' ? requiredCriteria.required_total_rewards : BigInt(requiredCriteria.required_total_rewards || 0);
    const progress = Math.min(Number(current) / Number(required), 1);
    totalProgress += progress * 0.3; // 30% weight
    totalWeight += 0.3;
  }
  
  return totalWeight > 0 ? Math.round((totalProgress / totalWeight) * 100) : 0;
}

/**
 * Calculates referral conversion rate
 */
export function calculateReferralConversionRate(verifiedReferrals: u32, totalReferrals: u32): number {
  if (totalReferrals === 0) return 0;
  return Math.round((verifiedReferrals / totalReferrals) * 100);
}

/**
 * Error handling utilities
 */

/**
 * Gets error type from error code
 */
export function getErrorType(errorCode: string): string {
  const errorTypeMap: Record<string, string> = {
    'NOT_INITIALIZED': 'InitializationError',
    'ALREADY_INITIALIZED': 'InitializationError',
    'UNAUTHORIZED': 'AuthorizationError',
    'ALREADY_REGISTERED': 'ValidationError',
    'USER_NOT_FOUND': 'NotFoundError',
    'MILESTONE_NOT_FOUND': 'NotFoundError',
    'INVALID_AMOUNT': 'ValidationError',
    'VERIFICATION_REQUIRED': 'VerificationError',
    'ALREADY_VERIFIED': 'VerificationError',
    'INVALID_IDENTITY_PROOF': 'ValidationError',
    'INSUFFICIENT_REWARDS': 'InsufficientFundsError',
    'INVALID_REWARD_RATES': 'ValidationError',
    'MAX_REWARD_EXCEEDED': 'ValidationError',
    'REFERRER_NOT_VERIFIED': 'VerificationError',
    'REFERRER_NOT_FOUND': 'NotFoundError',
    'INVALID_LEVEL_REQUIREMENTS': 'ValidationError',
    'CONTRACT_PAUSED': 'ContractError',
    'INVALID_REWARD_TOKEN': 'ValidationError',
  };
  
  return errorTypeMap[errorCode] || 'UnknownError';
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
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
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Utility functions
 */

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncate string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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