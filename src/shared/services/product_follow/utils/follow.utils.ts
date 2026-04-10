import { FollowErrorCode } from '../types/follow.types';
import { NotificationType } from '../types/notification.types';
import { AlertCondition, AlertOperator } from '../types/alert.types';
import { VALIDATION, ERROR_MESSAGES } from '../constants/follow.constants';

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate Stellar address format
 */
export function validateAddress(address: string): { isValid: boolean; error?: string } {
  const pattern = VALIDATION.ADDRESS.PATTERN;
  const isValid = pattern.test(address) &&
    address.length >= VALIDATION.ADDRESS.MIN_LENGTH &&
    address.length <= VALIDATION.ADDRESS.MAX_LENGTH;

  return {
    isValid,
    error: isValid ? undefined : ERROR_MESSAGES[FollowErrorCode.INVALID_ADDRESS]
  };
}

/**
 * Validate product ID format
 */
export function validateProductId(productId: string): { isValid: boolean; error?: string } {
  const pattern = VALIDATION.PRODUCT_ID.PATTERN;
  const isValid = pattern.test(productId) &&
    productId.length >= VALIDATION.PRODUCT_ID.MIN_LENGTH &&
    productId.length <= VALIDATION.PRODUCT_ID.MAX_LENGTH;

  return {
    isValid,
    error: isValid ? undefined : ERROR_MESSAGES[FollowErrorCode.INVALID_PRODUCT_ID]
  };
}

/**
 * Validate notification title length
 */
export function validateNotificationTitle(title: string): { isValid: boolean; error?: string } {
  const isValid = title.length > 0 && title.length <= VALIDATION.NOTIFICATION.TITLE_MAX_LENGTH;
  return {
    isValid,
    error: isValid ? undefined : `Title must be between 1 and ${VALIDATION.NOTIFICATION.TITLE_MAX_LENGTH} characters`
  };
}

/**
 * Validate notification message length
 */
export function validateNotificationMessage(message: string): { isValid: boolean; error?: string } {
  const isValid = message.length > 0 && message.length <= VALIDATION.NOTIFICATION.MESSAGE_MAX_LENGTH;
  return {
    isValid,
    error: isValid ? undefined : `Message must be between 1 and ${VALIDATION.NOTIFICATION.MESSAGE_MAX_LENGTH} characters`
  };
}

/**
 * Validate notification format (title + message + type)
 */
export function validateNotificationFormat(data: {
  title: string;
  message: string;
  type: NotificationType;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const titleValidation = validateNotificationTitle(data.title);
  if (!titleValidation.isValid && titleValidation.error) {
    errors.push(titleValidation.error);
  }

  const messageValidation = validateNotificationMessage(data.message);
  if (!messageValidation.isValid && messageValidation.error) {
    errors.push(messageValidation.error);
  }

  if (!Object.values(NotificationType).includes(data.type)) {
    errors.push(`Invalid notification type: ${data.type}`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate user preferences
 */
export function validateUserPreferences(preferences: {
  enabled: boolean;
  maxPerDay: number;
  quietHoursStart?: number;
  quietHoursEnd?: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof preferences.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (preferences.maxPerDay < 0 || preferences.maxPerDay > VALIDATION.NOTIFICATION.MAX_PER_DAY) {
    errors.push(`maxPerDay must be between 0 and ${VALIDATION.NOTIFICATION.MAX_PER_DAY}`);
  }

  if (preferences.quietHoursStart !== undefined) {
    if (preferences.quietHoursStart < 0 || preferences.quietHoursStart > 23) {
      errors.push('quietHoursStart must be between 0 and 23');
    }
  }

  if (preferences.quietHoursEnd !== undefined) {
    if (preferences.quietHoursEnd < 0 || preferences.quietHoursEnd > 23) {
      errors.push('quietHoursEnd must be between 0 and 23');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate alert conditions
 */
export function validateAlertConditions(conditions: AlertCondition[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (conditions.length === 0) {
    errors.push('At least one condition is required');
  }

  if (conditions.length > VALIDATION.ALERT.MAX_CONDITIONS) {
    errors.push(`Maximum ${VALIDATION.ALERT.MAX_CONDITIONS} conditions allowed`);
  }

  for (const condition of conditions) {
    if (!condition.field || condition.field.trim().length === 0) {
      errors.push('Condition field is required');
    }
    if (!Object.values(AlertOperator).includes(condition.operator)) {
      errors.push(`Invalid operator: ${condition.operator}`);
    }
    if (condition.value === undefined || condition.value === null) {
      errors.push('Condition value is required');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ==================== HELPER UTILITIES ====================

/**
 * Evaluate an alert condition against a current value
 */
export function evaluateCondition(condition: AlertCondition, currentValue: string | number): boolean {
  const { operator, value } = condition;

  switch (operator) {
    case AlertOperator.LESS_THAN:
      return Number(currentValue) < Number(value);
    case AlertOperator.LESS_THAN_EQUAL:
      return Number(currentValue) <= Number(value);
    case AlertOperator.GREATER_THAN:
      return Number(currentValue) > Number(value);
    case AlertOperator.GREATER_THAN_EQUAL:
      return Number(currentValue) >= Number(value);
    case AlertOperator.EQUAL:
      return String(currentValue) === String(value);
    case AlertOperator.NOT_EQUAL:
      return String(currentValue) !== String(value);
    case AlertOperator.CONTAINS:
      return String(currentValue).includes(String(value));
    default:
      return false;
  }
}

/**
 * Generate a unique follow ID
 */
export function generateFollowId(productId: string, userAddress: string): string {
  return `follow_${productId}_${userAddress}_${Date.now()}`;
}

/**
 * Generate a unique alert ID
 */
export function generateAlertId(userAddress: string): string {
  return `alert_${userAddress}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generate a unique notification ID
 */
export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Get error message for a follow error code
 */
export function getErrorMessage(code: FollowErrorCode): string {
  return ERROR_MESSAGES[code] || 'Unknown error';
}

/**
 * Check if cache entry is expired
 */
export function isCacheExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
