import type { u32, u64, i128, Map } from '@stellar/stellar-sdk';
import { 
  PlanTier, 
  SubscriptionState, 
  SubscriptionErrorCode,
  PlanErrorCode,
  FeatureAccessErrorCode,
  FormattedPrice,
  DurationCalculation,
  AddressValidation,
  PlanValidation,
  SubscriptionValidation,
  FeatureAccessValidation
} from '../types/subscription.types';
import { 
  VALIDATION, 
  ERROR_MESSAGES, 
  FEE_CALCULATION,
  PLAN_TIERS,
  FEATURES,
  ROLES
} from '../constants/subscription.constants';

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate Stellar address format
 */
export function validateAddress(address: string): AddressValidation {
  const pattern = VALIDATION.ADDRESS.PATTERN;
  const isValid = pattern.test(address) && 
                  address.length >= VALIDATION.ADDRESS.MIN_LENGTH && 
                  address.length <= VALIDATION.ADDRESS.MAX_LENGTH;
  
  return {
    isValid,
    address,
    type: 'stellar',
    error: isValid ? undefined : 'Invalid Stellar address format'
  };
}

/**
 * Validate plan ID format
 */
export function validatePlanId(planId: string): { isValid: boolean; error?: string } {
  const pattern = VALIDATION.PLAN.ID.PATTERN;
  const isValid = pattern.test(planId) && 
                  planId.length >= VALIDATION.PLAN.ID.MIN_LENGTH && 
                  planId.length <= VALIDATION.PLAN.ID.MAX_LENGTH;
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid plan ID format'
  };
}

/**
 * Validate plan name
 */
export function validatePlanName(name: string): { isValid: boolean; error?: string } {
  const isValid = name.length >= VALIDATION.PLAN.NAME.MIN_LENGTH && 
                  name.length <= VALIDATION.PLAN.NAME.MAX_LENGTH;
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid plan name length'
  };
}

/**
 * Validate plan duration
 */
export function validatePlanDuration(duration: u64): { isValid: boolean; error?: string } {
  const isValid = duration >= VALIDATION.PLAN.DURATION.MIN && 
                  duration <= VALIDATION.PLAN.DURATION.MAX;
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid plan duration'
  };
}

/**
 * Validate plan price
 */
export function validatePlanPrice(price: i128): { isValid: boolean; error?: string } {
  const isValid = price >= VALIDATION.PLAN.PRICE.MIN && 
                  price <= VALIDATION.PLAN.PRICE.MAX;
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid plan price'
  };
}

/**
 * Validate plan benefits
 */
export function validatePlanBenefits(benefits: string[]): { isValid: boolean; error?: string } {
  const isValid = benefits.length <= VALIDATION.PLAN.BENEFITS.MAX_COUNT &&
                  benefits.every(benefit => benefit.length <= VALIDATION.PLAN.BENEFITS.MAX_LENGTH);
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid plan benefits'
  };
}

/**
 * Validate feature name
 */
export function validateFeatureName(feature: string): { isValid: boolean; error?: string } {
  const pattern = VALIDATION.FEATURE.NAME.PATTERN;
  const isValid = pattern.test(feature) && 
                  feature.length >= VALIDATION.FEATURE.NAME.MIN_LENGTH && 
                  feature.length <= VALIDATION.FEATURE.NAME.MAX_LENGTH;
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid feature name format'
  };
}

/**
 * Validate role name
 */
export function validateRoleName(role: string): { isValid: boolean; error?: string } {
  const pattern = VALIDATION.ROLE.NAME.PATTERN;
  const isValid = pattern.test(role) && 
                  role.length >= VALIDATION.ROLE.NAME.MIN_LENGTH && 
                  role.length <= VALIDATION.ROLE.NAME.MAX_LENGTH;
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid role name format'
  };
}

/**
 * Validate plan configuration
 */
export function validatePlanConfig(config: any): PlanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate plan ID
  const planIdValidation = validatePlanId(config.planId);
  if (!planIdValidation.isValid) {
    errors.push(planIdValidation.error!);
  }
  
  // Validate plan name
  const nameValidation = validatePlanName(config.name);
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error!);
  }
  
  // Validate duration
  const durationValidation = validatePlanDuration(config.duration);
  if (!durationValidation.isValid) {
    errors.push(durationValidation.error!);
  }
  
  // Validate price
  const priceValidation = validatePlanPrice(config.price);
  if (!priceValidation.isValid) {
    errors.push(priceValidation.error!);
  }
  
  // Validate benefits
  const benefitsValidation = validatePlanBenefits(config.benefits);
  if (!benefitsValidation.isValid) {
    errors.push(benefitsValidation.error!);
  }
  
  // Check for warnings
  if (config.price === 0n) {
    warnings.push('Plan price is set to 0');
  }
  
  if (config.duration < 86400n) {
    warnings.push('Plan duration is less than 1 day');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate subscription request
 */
export function validateSubscriptionRequest(request: any): SubscriptionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate user address
  const userValidation = validateAddress(request.user);
  if (!userValidation.isValid) {
    errors.push(userValidation.error!);
  }
  
  // Validate plan ID
  const planIdValidation = validatePlanId(request.planId);
  if (!planIdValidation.isValid) {
    errors.push(planIdValidation.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate feature access request
 */
export function validateFeatureAccessRequest(request: any): FeatureAccessValidation {
  const errors: string[] = [];
  
  // Validate user address
  const userValidation = validateAddress(request.user);
  if (!userValidation.isValid) {
    errors.push(userValidation.error!);
  }
  
  // Validate feature name
  const featureValidation = validateFeatureName(request.feature);
  if (!featureValidation.isValid) {
    errors.push(featureValidation.error!);
  }
  
  return {
    hasAccess: errors.length === 0,
    reason: errors.length > 0 ? errors.join(', ') : undefined
  };
}

// ==================== FORMATTING UTILITIES ====================

/**
 * Format plan price with decimals and symbol
 */
export function formatPlanPrice(
  price: i128, 
  decimals: number = 7, 
  symbol: string = 'XLM'
): FormattedPrice {
  const divisor = BigInt(10 ** decimals);
  const integerPart = price / divisor;
  const fractionalPart = price % divisor;
  
  const formatted = `${integerPart.toString()}.${fractionalPart.toString().padStart(decimals, '0')}`;
  
  return {
    raw: price,
    formatted: `${formatted} ${symbol}`,
    decimals,
    symbol
  };
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(duration: u64): string {
  const seconds = Number(duration);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`);
  
  return parts.join(', ') || '0 seconds';
}

/**
 * Calculate subscription duration breakdown
 */
export function calculateSubscriptionDuration(duration: u64): DurationCalculation {
  const seconds = Number(duration);
  const days = Math.floor(seconds / 86400);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  return {
    duration,
    days,
    months,
    years,
    humanReadable: formatDuration(duration)
  };
}

/**
 * Format usage statistics
 */
export function formatUsageStats(usage: any): string {
  const { usageCount, usageLimit, feature } = usage;
  const percentage = usageLimit > 0 ? (usageCount / usageLimit) * 100 : 0;
  
  return `${feature}: ${usageCount}/${usageLimit} (${percentage.toFixed(1)}%)`;
}

/**
 * Format subscription state
 */
export function formatSubscriptionState(state: SubscriptionState): string {
  const stateConfig = {
    [SubscriptionState.ACTIVE]: 'Active',
    [SubscriptionState.GRACE]: 'Grace Period',
    [SubscriptionState.EXPIRED]: 'Expired',
    [SubscriptionState.NOT_FOUND]: 'Not Found'
  };
  
  return stateConfig[state] || 'Unknown';
}

// ==================== CALCULATION UTILITIES ====================

/**
 * Calculate time until expiry
 */
export function getTimeUntilExpiry(expiryTime: u64): u64 {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return expiryTime > now ? expiryTime - now : 0n;
}

/**
 * Check if subscription is valid
 */
export function isSubscriptionValid(subscription: any): boolean {
  if (!subscription) return false;
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  return subscription.isActive && subscription.expiryTime > now;
}

/**
 * Check if subscription is in grace period
 */
export function isSubscriptionInGrace(subscription: any): boolean {
  if (!subscription) return false;
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  const gracePeriodEnd = subscription.expiryTime + BigInt(VALIDATION.SUBSCRIPTION.GRACE_PERIOD);
  
  return !subscription.isActive && 
         subscription.expiryTime <= now && 
         gracePeriodEnd > now;
}

/**
 * Calculate subscription efficiency score
 */
export function calculateSubscriptionEfficiency(usage: any): number {
  const { usageCount, usageLimit } = usage;
  if (usageLimit === 0) return 0;
  
  const efficiency = (usageCount / usageLimit) * 100;
  return Math.min(efficiency, 100);
}

/**
 * Calculate fees for operation
 */
export function calculateFees(operation: string, gasUsed?: number): number {
  const baseFee = FEE_CALCULATION.BASE_FEE;
  const operationFee = FEE_CALCULATION.OPERATION_FEES[operation as keyof typeof FEE_CALCULATION.OPERATION_FEES] || baseFee;
  const gasFee = gasUsed ? Math.ceil(gasUsed * FEE_CALCULATION.GAS_MULTIPLIER) : 0;
  
  return Math.min(operationFee + gasFee, FEE_CALCULATION.MAX_FEE);
}

// ==================== HELPER UTILITIES ====================

/**
 * Generate cache key for subscription
 */
export function generateSubscriptionCacheKey(user: string, planId: string): string {
  return `subscription:${user}:${planId}`;
}

/**
 * Generate cache key for plan
 */
export function generatePlanCacheKey(planId: string): string {
  return `plan:${planId}`;
}

/**
 * Generate cache key for feature usage
 */
export function generateFeatureUsageCacheKey(user: string, feature: string): string {
  return `feature_usage:${user}:${feature}`;
}

/**
 * Check if cache is expired
 */
export function isCacheExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Convert string to BigInt safely
 */
export function stringToBigInt(value: string): i128 {
  try {
    return BigInt(value);
  } catch (error) {
    throw new Error(`Invalid BigInt value: ${value}`);
  }
}

/**
 * Convert BigInt to string
 */
export function bigIntToString(value: i128): string {
  return value.toString();
}

/**
 * Check if value is valid i128
 */
export function isValidI128(value: any): boolean {
  try {
    BigInt(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if timestamp is valid
 */
export function isValidTimestamp(timestamp: u64): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const minTimestamp = now - BigInt(31536000); // 1 year ago
  const maxTimestamp = now + BigInt(31536000); // 1 year from now
  
  return timestamp >= minTimestamp && timestamp <= maxTimestamp;
}

/**
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000,
  backoffMultiplier: number = 2
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
      
      const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// ==================== ERROR HANDLING UTILITIES ====================

/**
 * Map contract error to user-friendly message
 */
export function mapContractError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.code) {
    const errorCode = Object.keys(ERROR_MESSAGES).find(key => 
      ERROR_CODES[key as keyof typeof ERROR_CODES] === error.code
    );
    
    if (errorCode) {
      return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
    }
  }
  
  return ERROR_MESSAGES.CONTRACT_ERROR;
}

/**
 * Get error message by code
 */
export function getErrorMessage(errorCode: SubscriptionErrorCode | PlanErrorCode | FeatureAccessErrorCode): string {
  return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || 'Unknown error';
}

/**
 * Get error type from error
 */
export function getErrorType(error: any): SubscriptionErrorCode {
  if (error?.code) {
    const errorCode = Object.keys(ERROR_CODES).find(key => 
      ERROR_CODES[key as keyof typeof ERROR_CODES] === error.code
    );
    
    if (errorCode) {
      return errorCode as SubscriptionErrorCode;
    }
  }
  
  return SubscriptionErrorCode.CONTRACT_ERROR;
}

// ==================== PLAN UTILITIES ====================

/**
 * Get plan tier configuration
 */
export function getPlanTierConfig(tier: PlanTier) {
  return PLAN_TIERS[tier];
}

/**
 * Get feature configuration
 */
export function getFeatureConfig(feature: string) {
  return FEATURES[feature as keyof typeof FEATURES];
}

/**
 * Get role configuration
 */
export function getRoleConfig(role: string) {
  return ROLES[role as keyof typeof ROLES];
}

/**
 * Check if plan tier supports feature
 */
export function planTierSupportsFeature(tier: PlanTier, feature: string): boolean {
  const featureConfig = getFeatureConfig(feature);
  if (!featureConfig) return false;
  
  return featureConfig.tier.includes(tier);
}

/**
 * Get available plans for tier
 */
export function getAvailablePlansForTier(tier: PlanTier): string[] {
  const tierConfig = getPlanTierConfig(tier);
  return tierConfig.features;
}

// ==================== SUBSCRIPTION UTILITIES ====================

/**
 * Check feature access for user
 */
export function checkFeatureAccess(user: string, feature: string, planId: string): boolean {
  // This would typically check against the actual subscription and plan data
  // For now, return true as a placeholder
  return true;
}

/**
 * Get usage limit for feature
 */
export function getUsageLimit(feature: string, planId: string): u32 {
  const featureConfig = getFeatureConfig(feature);
  return featureConfig ? featureConfig.usageLimit : 0;
}

/**
 * Check if user has role
 */
export function userHasRole(user: string, role: string): boolean {
  // This would typically check against the actual user roles
  // For now, return false as a placeholder
  return false;
}

/**
 * Get user roles
 */
export function getUserRoles(user: string): string[] {
  // This would typically return the actual user roles
  // For now, return empty array as a placeholder
  return [];
}

// ==================== ANALYTICS UTILITIES ====================

/**
 * Calculate subscription metrics
 */
export function calculateSubscriptionMetrics(subscriptions: any[]): any {
  const total = subscriptions.length;
  const active = subscriptions.filter(sub => sub.isActive).length;
  const expired = subscriptions.filter(sub => !sub.isActive).length;
  
  return {
    total,
    active,
    expired,
    activeRate: total > 0 ? (active / total) * 100 : 0
  };
}

/**
 * Calculate usage metrics
 */
export function calculateUsageMetrics(usage: any[]): any {
  const totalUsage = usage.reduce((sum, item) => sum + item.usageCount, 0);
  const averageUsage = usage.length > 0 ? totalUsage / usage.length : 0;
  
  return {
    totalUsage,
    averageUsage,
    usageCount: usage.length
  };
}

// ==================== EXPORT ALL UTILITIES ====================

export {
  validateAddress,
  validatePlanId,
  validatePlanName,
  validatePlanDuration,
  validatePlanPrice,
  validatePlanBenefits,
  validateFeatureName,
  validateRoleName,
  validatePlanConfig,
  validateSubscriptionRequest,
  validateFeatureAccessRequest,
  formatPlanPrice,
  formatDuration,
  calculateSubscriptionDuration,
  formatUsageStats,
  formatSubscriptionState,
  getTimeUntilExpiry,
  isSubscriptionValid,
  isSubscriptionInGrace,
  calculateSubscriptionEfficiency,
  calculateFees,
  generateSubscriptionCacheKey,
  generatePlanCacheKey,
  generateFeatureUsageCacheKey,
  isCacheExpired,
  sanitizeString,
  stringToBigInt,
  bigIntToString,
  isValidI128,
  isValidTimestamp,
  generateUniqueId,
  retryWithBackoff,
  mapContractError,
  getErrorMessage,
  getErrorType,
  getPlanTierConfig,
  getFeatureConfig,
  getRoleConfig,
  planTierSupportsFeature,
  getAvailablePlansForTier,
  checkFeatureAccess,
  getUsageLimit,
  userHasRole,
  getUserRoles,
  calculateSubscriptionMetrics,
  calculateUsageMetrics
};
