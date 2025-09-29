import type { u64, i128, Map } from '@stellar/stellar-sdk/contract';
import { Buffer } from 'buffer';
import { 
  VALIDATION, 
  TIME_CONSTANTS, 
  ERROR_TYPES,
  METRIC_TYPES 
} from '../constants/airdrop.constants';
import type { 
  AirdropEventConfig, 
  AirdropEvent, 
  EligibilityConditions,
  ClaimStatus,
  TokenInfo 
} from '../types/airdrop.types';

/**
 * Format token amount with proper decimal places
 */
export function formatTokenAmount(
  amount: i128, 
  decimals: number = 7
): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
}

/**
 * Parse token amount from string to i128
 */
export function parseTokenAmount(
  amount: string, 
  decimals: number = 7
): i128 {
  const [wholePart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const totalAmount = BigInt(wholePart) * BigInt(10 ** decimals) + BigInt(paddedFractional);
  return totalAmount as i128;
}

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  const stellarAddressRegex = /^[G-ZA-Z2-7]{56}$/;
  return stellarAddressRegex.test(address);
}

/**
 * Validate contract address format
 */
export function isValidContractAddress(address: string): boolean {
  const contractAddressRegex = /^[C-ZA-Z2-7]{56}$/;
  return contractAddressRegex.test(address);
}

/**
 * Validate event configuration
 */
export function validateEventConfig(config: AirdropEventConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate event name
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Event name is required');
  } else if (config.name.length > VALIDATION.MAX_EVENT_NAME_LENGTH) {
    errors.push(`Event name must be less than ${VALIDATION.MAX_EVENT_NAME_LENGTH} characters`);
  }

  // Validate description
  if (!config.description || config.description.trim().length === 0) {
    errors.push('Event description is required');
  } else if (config.description.length > VALIDATION.MAX_EVENT_DESCRIPTION_LENGTH) {
    errors.push(`Event description must be less than ${VALIDATION.MAX_EVENT_DESCRIPTION_LENGTH} characters`);
  }

  // Validate token address
  if (!config.tokenAddress) {
    errors.push('Token address is required');
  } else if (config.tokenAddress !== 'native' && !isValidContractAddress(config.tokenAddress)) {
    errors.push('Invalid token address format');
  }

  // Validate amount
  if (config.amount <= 0n) {
    errors.push('Token amount must be greater than 0');
  } else if (config.amount > BigInt(VALIDATION.MAX_TOKEN_AMOUNT)) {
    errors.push(`Token amount must be less than ${VALIDATION.MAX_TOKEN_AMOUNT}`);
  }

  // Validate time range
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (config.startTime < now) {
    errors.push('Start time must be in the future');
  }
  
  if (config.endTime <= config.startTime) {
    errors.push('End time must be after start time');
  }

  const duration = config.endTime - config.startTime;
  if (duration < BigInt(VALIDATION.MIN_EVENT_DURATION)) {
    errors.push(`Event duration must be at least ${VALIDATION.MIN_EVENT_DURATION} seconds`);
  }
  
  if (duration > BigInt(VALIDATION.MAX_EVENT_DURATION)) {
    errors.push(`Event duration must be less than ${VALIDATION.MAX_EVENT_DURATION} seconds`);
  }

  // Validate conditions
  if (!config.conditions || config.conditions.size === 0) {
    errors.push('At least one eligibility condition is required');
  } else if (config.conditions.size > VALIDATION.MAX_CONDITIONS_PER_EVENT) {
    errors.push(`Maximum ${VALIDATION.MAX_CONDITIONS_PER_EVENT} conditions allowed per event`);
  }

  // Validate individual conditions
  for (const [metric, value] of config.conditions) {
    if (!metric || metric.trim().length === 0) {
      errors.push('Condition metric name cannot be empty');
    }
    if (value <= 0n) {
      errors.push(`Condition value for ${metric} must be greater than 0`);
    }
  }

  // Validate optional parameters
  if (config.maxUsers && config.maxUsers <= 0n) {
    errors.push('Max users must be greater than 0');
  }

  if (config.maxTotalAmount && config.maxTotalAmount <= 0n) {
    errors.push('Max total amount must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if an event is currently active
 */
export function isEventActive(event: AirdropEvent): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return event.isActive && 
         event.startTime <= now && 
         event.endTime > now;
}

/**
 * Calculate time until event expiry
 */
export function getTimeUntilExpiry(event: AirdropEvent): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const timeLeft = event.endTime - now;
  return Math.max(0, Number(timeLeft));
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < TIME_CONSTANTS.SECONDS_PER_MINUTE) {
    return `${seconds} seconds`;
  } else if (seconds < TIME_CONSTANTS.SECONDS_PER_HOUR) {
    const minutes = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (seconds < TIME_CONSTANTS.SECONDS_PER_DAY) {
    const hours = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_HOUR);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (seconds < TIME_CONSTANTS.SECONDS_PER_WEEK) {
    const days = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_DAY);
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (seconds < TIME_CONSTANTS.SECONDS_PER_MONTH) {
    const weeks = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_WEEK);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else if (seconds < TIME_CONSTANTS.SECONDS_PER_YEAR) {
    const months = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_MONTH);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_YEAR);
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
}

/**
 * Calculate user eligibility based on conditions
 */
export async function calculateEligibility(
  user: string,
  conditions: EligibilityConditions,
  providerRegistry: Map<string, string>
): Promise<{
  isEligible: boolean;
  reason?: string;
  userMetrics: Record<string, u64>;
}> {
  const userMetrics: Record<string, u64> = {};
  const eligibilityChecks: Promise<boolean>[] = [];

  for (const [metric, requiredValue] of conditions) {
    const providerAddress = providerRegistry.get(metric);
    
    if (!providerAddress) {
      return {
        isEligible: false,
        reason: `Provider not configured for metric: ${metric}`,
        userMetrics
      };
    }

    try {
      // This would typically call the provider contract
      // For now, we'll simulate the call
      const userValue = await callProviderContract(providerAddress, metric, user);
      userMetrics[metric] = userValue;
      
      if (userValue < requiredValue) {
        return {
          isEligible: false,
          reason: `Insufficient ${metric}: required ${requiredValue}, user has ${userValue}`,
          userMetrics
        };
      }
    } catch (error) {
      return {
        isEligible: false,
        reason: `Failed to check ${metric}: ${error}`,
        userMetrics
      };
    }
  }

  return {
    isEligible: true,
    userMetrics
  };
}

/**
 * Simulate provider contract call (placeholder implementation)
 */
async function callProviderContract(
  providerAddress: string,
  metric: string,
  user: string
): Promise<u64> {
  // This is a placeholder implementation
  // In a real implementation, this would call the provider contract
  // to get the user's metric value
  
  // Simulate some delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return a mock value based on the metric type
  switch (metric) {
    case METRIC_TYPES.PURCHASES:
      return 5n; // Mock: user has 5 purchases
    case METRIC_TYPES.TOTAL_SPENT:
      return 1000n; // Mock: user spent 1000 tokens
    case METRIC_TYPES.TEAM_SIZE:
      return 3n; // Mock: user has team size of 3
    case METRIC_TYPES.ACCOUNT_AGE:
      return 30n; // Mock: account is 30 days old
    case METRIC_TYPES.REFERRALS:
      return 2n; // Mock: user has 2 referrals
    case METRIC_TYPES.LOYALTY_POINTS:
      return 500n; // Mock: user has 500 loyalty points
    default:
      return 1n; // Default mock value
  }
}

/**
 * Convert Buffer to string
 */
export function bufferToString(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

/**
 * Convert string to Buffer
 */
export function stringToBuffer(str: string): Buffer {
  return Buffer.from(str, 'utf-8');
}

/**
 * Create a Map from a plain object
 */
export function createMapFromObject<T>(obj: Record<string, T>): Map<string, T> {
  const map = new Map<string, T>();
  for (const [key, value] of Object.entries(obj)) {
    map.set(key, value);
  }
  return map;
}

/**
 * Convert Map to plain object
 */
export function mapToObject<T>(map: Map<string, T>): Record<string, T> {
  const obj: Record<string, T> = {};
  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Generate a unique ID for events
 */
export function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  exponentialBackoff: boolean = true
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
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
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
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
 * Check if a value is a valid u64
 */
export function isValidU64(value: any): value is u64 {
  return typeof value === 'bigint' && value >= 0n && value <= 0xFFFFFFFFFFFFFFFFn;
}

/**
 * Check if a value is a valid i128
 */
export function isValidI128(value: any): value is i128 {
  return typeof value === 'bigint' && 
         value >= -0x80000000000000000000000000000000n && 
         value <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * Create a deep clone of an object
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
  
  if (obj instanceof Map) {
    const newMap = new Map();
    for (const [key, value] of obj) {
      newMap.set(deepClone(key), deepClone(value));
    }
    return newMap as T;
  }
  
  if (obj instanceof Set) {
    const newSet = new Set();
    for (const value of obj) {
      newSet.add(deepClone(value));
    }
    return newSet as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncate string with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Get error type from error message
 */
export function getErrorType(error: string): string {
  if (error.includes('network') || error.includes('connection')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  if (error.includes('contract') || error.includes('transaction')) {
    return ERROR_TYPES.CONTRACT_ERROR;
  }
  if (error.includes('validation') || error.includes('invalid')) {
    return ERROR_TYPES.VALIDATION_ERROR;
  }
  if (error.includes('wallet') || error.includes('signature')) {
    return ERROR_TYPES.WALLET_ERROR;
  }
  if (error.includes('provider')) {
    return ERROR_TYPES.PROVIDER_ERROR;
  }
  return ERROR_TYPES.UNKNOWN_ERROR;
}
