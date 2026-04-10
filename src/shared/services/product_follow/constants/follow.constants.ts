import { FollowErrorCode } from '../types/follow.types';
import { NotificationType, NotificationChannel } from '../types/notification.types';
import { AlertType } from '../types/alert.types';

// ==================== NETWORK CONFIGURATION ====================

export const NETWORKS = {
  testnet: {
    contractId: 'CCS7XKR3UV76MGC2XQ4ABLMTMGOUBTG2AQ4EGAL4L5CD2OQKP4X7A66G',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  },
  mainnet: {
    contractId: 'PRODUCT_FOLLOW_MAINNET_CONTRACT_ID',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban-rpc.stellar.org',
    isTestnet: false
  }
} as const;

// ==================== DEFAULT CONFIGURATION ====================

export const DEFAULT_CONFIG = {
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true,
  rateLimit: {
    maxFollowsPerHour: 60,
    maxUnfollowsPerHour: 60,
    maxNotificationsPerHour: 100,
    windowDurationMs: 3600000 // 1 hour
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000
  }
} as const;

// ==================== CONTRACT METHODS ====================

export const CONTRACT_METHODS = {
  // Follow management
  FOLLOW_PRODUCT: 'follow_product',
  UNFOLLOW_PRODUCT: 'unfollow_product',
  GET_FOLLOWERS: 'get_followers',
  GET_FOLLOWING: 'get_following',
  IS_FOLLOWING: 'is_following',
  GET_FOLLOWER_COUNT: 'get_follower_count',

  // Notification management
  SET_NOTIFICATION_PREFERENCES: 'set_notification_preferences',
  GET_NOTIFICATION_PREFERENCES: 'get_notification_preferences',
  SEND_NOTIFICATION: 'send_notification',
  GET_NOTIFICATION_HISTORY: 'get_notification_history',
  MARK_NOTIFICATION_READ: 'mark_notification_read',

  // Alert management
  CREATE_ALERT: 'create_alert',
  UPDATE_ALERT: 'update_alert',
  DELETE_ALERT: 'delete_alert',
  GET_ALERTS: 'get_alerts',
  TRIGGER_ALERT: 'trigger_alert'
} as const;

// ==================== VALIDATION ====================

export const VALIDATION = {
  ADDRESS: {
    PATTERN: /^G[A-Z2-7]{55}$/,
    MIN_LENGTH: 56,
    MAX_LENGTH: 56
  },
  PRODUCT_ID: {
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    MIN_LENGTH: 1,
    MAX_LENGTH: 128
  },
  ALERT: {
    MAX_CONDITIONS: 10,
    MAX_ALERTS_PER_USER: 50,
    MAX_ALERTS_PER_PRODUCT: 10
  },
  NOTIFICATION: {
    TITLE_MAX_LENGTH: 200,
    MESSAGE_MAX_LENGTH: 1000,
    MAX_PER_DAY: 100
  },
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  }
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES: Record<FollowErrorCode, string> = {
  [FollowErrorCode.ALREADY_FOLLOWING]: 'User is already following this product',
  [FollowErrorCode.NOT_FOLLOWING]: 'User is not following this product',
  [FollowErrorCode.PRODUCT_NOT_FOUND]: 'Product not found',
  [FollowErrorCode.USER_NOT_FOUND]: 'User not found',
  [FollowErrorCode.RATE_LIMITED]: 'Rate limit exceeded. Please try again later',
  [FollowErrorCode.INVALID_ADDRESS]: 'Invalid Stellar address format',
  [FollowErrorCode.INVALID_PRODUCT_ID]: 'Invalid product ID format',
  [FollowErrorCode.CONTRACT_ERROR]: 'Smart contract execution error',
  [FollowErrorCode.NETWORK_ERROR]: 'Network communication error',
  [FollowErrorCode.TIMEOUT]: 'Operation timed out',
  [FollowErrorCode.UNAUTHORIZED]: 'Unauthorized operation',
  [FollowErrorCode.VALIDATION_ERROR]: 'Validation error',
  [FollowErrorCode.INTERNAL_ERROR]: 'Internal service error'
};

// ==================== NOTIFICATION DEFAULTS ====================

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: true,
  maxPerDay: 50,
  typePreferences: Object.values(NotificationType).map(type => ({
    type,
    enabled: true,
    channels: [NotificationChannel.IN_APP]
  }))
} as const;

// ==================== CACHE KEYS ====================

export const CACHE_KEYS = {
  FOLLOWERS: (productId: string) => `followers:${productId}`,
  FOLLOWING: (userAddress: string) => `following:${userAddress}`,
  IS_FOLLOWING: (productId: string, userAddress: string) => `is_following:${productId}:${userAddress}`,
  FOLLOWER_COUNT: (productId: string) => `follower_count:${productId}`,
  NOTIFICATIONS: (userAddress: string) => `notifications:${userAddress}`,
  PREFERENCES: (userAddress: string) => `preferences:${userAddress}`,
  ALERTS: (userAddress: string) => `alerts:${userAddress}`
} as const;
