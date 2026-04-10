import type { u32, u64 } from '@stellar/stellar-sdk';

// ==================== ALERT TYPES ====================

/**
 * Product follow alert
 */
export interface FollowAlert {
  /** Unique alert ID */
  alertId: string;
  /** User address */
  userAddress: string;
  /** Product ID */
  productId: string;
  /** Alert type */
  type: AlertType;
  /** Alert conditions */
  conditions: AlertCondition[];
  /** Whether alert is active */
  isActive: boolean;
  /** Whether alert has been triggered */
  isTriggered: boolean;
  /** Creation timestamp */
  createdAt: u64;
  /** Last triggered timestamp */
  triggeredAt: u64;
  /** Alert metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Alert type enumeration
 */
export enum AlertType {
  PRICE_BELOW = 'price_below',
  PRICE_ABOVE = 'price_above',
  PRICE_CHANGE_PERCENT = 'price_change_percent',
  BACK_IN_STOCK = 'back_in_stock',
  LOW_STOCK = 'low_stock',
  NEW_VERSION = 'new_version',
  CUSTOM = 'custom'
}

/**
 * Alert condition
 */
export interface AlertCondition {
  /** Condition field to check */
  field: string;
  /** Comparison operator */
  operator: AlertOperator;
  /** Target value */
  value: string | number;
  /** Current value (filled when checking) */
  currentValue?: string | number;
}

/**
 * Alert comparison operators
 */
export enum AlertOperator {
  LESS_THAN = 'lt',
  LESS_THAN_EQUAL = 'lte',
  GREATER_THAN = 'gt',
  GREATER_THAN_EQUAL = 'gte',
  EQUAL = 'eq',
  NOT_EQUAL = 'neq',
  CONTAINS = 'contains'
}

/**
 * Create alert request
 */
export interface CreateAlertRequest {
  /** Product ID */
  productId: string;
  /** Alert type */
  type: AlertType;
  /** Alert conditions */
  conditions: AlertCondition[];
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Update alert request
 */
export interface UpdateAlertRequest {
  /** Alert ID */
  alertId: string;
  /** Updated conditions */
  conditions?: AlertCondition[];
  /** Whether alert is active */
  isActive?: boolean;
  /** Updated metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Alert trigger result
 */
export interface AlertTriggerResult {
  /** Alert ID */
  alertId: string;
  /** Whether alert was triggered */
  triggered: boolean;
  /** Conditions that matched */
  matchedConditions: AlertCondition[];
  /** Timestamp of trigger check */
  checkedAt: u64;
}

/**
 * Alert query parameters
 */
export interface AlertQuery {
  /** User address */
  userAddress: string;
  /** Filter by alert type */
  type?: AlertType;
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by triggered status */
  isTriggered?: boolean;
  /** Page number */
  page: number;
  /** Items per page */
  limit: number;
}
