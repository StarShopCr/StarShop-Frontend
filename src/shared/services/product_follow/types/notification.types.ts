import type { u32, u64 } from '@stellar/stellar-sdk';

// ==================== NOTIFICATION TYPES ====================

/**
 * Notification for product follow events
 */
export interface FollowNotification {
  /** Unique notification ID */
  notificationId: string;
  /** User address receiving the notification */
  userAddress: string;
  /** Product ID related to the notification */
  productId: string;
  /** Notification type */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification message body */
  message: string;
  /** Whether notification has been read */
  isRead: boolean;
  /** Creation timestamp */
  createdAt: u64;
  /** Read timestamp (0 if unread) */
  readAt: u64;
  /** Additional data */
  metadata?: Record<string, unknown>;
}

/**
 * Notification type enumeration
 */
export enum NotificationType {
  PRICE_CHANGE = 'price_change',
  STOCK_UPDATE = 'stock_update',
  NEW_REVIEW = 'new_review',
  PRODUCT_UPDATE = 'product_update',
  PROMOTION = 'promotion',
  BACK_IN_STOCK = 'back_in_stock',
  PRICE_DROP = 'price_drop',
  FOLLOWER_MILESTONE = 'follower_milestone'
}

/**
 * Notification preferences for a user
 */
export interface NotificationPreferences {
  /** User address */
  userAddress: string;
  /** Whether notifications are enabled globally */
  enabled: boolean;
  /** Per-type preferences */
  typePreferences: NotificationTypePreference[];
  /** Quiet hours start (0-23) */
  quietHoursStart?: number;
  /** Quiet hours end (0-23) */
  quietHoursEnd?: number;
  /** Maximum notifications per day */
  maxPerDay: u32;
  /** Last updated timestamp */
  updatedAt: u64;
}

/**
 * Per-type notification preference
 */
export interface NotificationTypePreference {
  /** Notification type */
  type: NotificationType;
  /** Whether this type is enabled */
  enabled: boolean;
  /** Delivery channels */
  channels: NotificationChannel[];
}

/**
 * Notification delivery channels
 */
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push'
}

/**
 * Send notification request
 */
export interface SendNotificationRequest {
  /** Product ID */
  productId: string;
  /** Notification type */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Additional data */
  data?: Record<string, unknown>;
}

/**
 * Notification history query parameters
 */
export interface NotificationHistoryQuery {
  /** User address */
  userAddress: string;
  /** Filter by type */
  type?: NotificationType;
  /** Filter by read status */
  isRead?: boolean;
  /** Page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Start date filter */
  startDate?: u64;
  /** End date filter */
  endDate?: u64;
}

/**
 * Notification validation result
 */
export interface NotificationValidation {
  /** Whether notification data is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
}
