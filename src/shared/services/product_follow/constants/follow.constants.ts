import type { NotificationPreference } from '../types/notification.types';

export const FOLLOW_ERROR_CODES = {
  UNAUTHORIZED: 100,
  PRODUCT_NOT_FOUND: 101,
  USER_ALREADY_FOLLOWING: 102,
  USER_NOT_FOLLOWING: 103,

  INVALID_PARAMETERS: 200,
  INVALID_ADDRESS: 201,
  INVALID_PRICE: 202,
  INVALID_QUANTITY: 203,
  INVALID_PREFERENCES: 204,

  MAX_FOLLOWS_EXCEEDED: 300,
} as const;

export const ERROR_MESSAGES: Record<number, string> = {
  [FOLLOW_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized caller for follow operation.',
  [FOLLOW_ERROR_CODES.PRODUCT_NOT_FOUND]: 'Product not found.',
  [FOLLOW_ERROR_CODES.USER_ALREADY_FOLLOWING]: 'User is already following this product.',
  [FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING]: 'User is not following this product.',

  [FOLLOW_ERROR_CODES.INVALID_PARAMETERS]: 'Invalid parameters provided.',
  [FOLLOW_ERROR_CODES.INVALID_ADDRESS]: 'Invalid Stellar address format.',
  [FOLLOW_ERROR_CODES.INVALID_PRICE]: 'Invalid price amount.',
  [FOLLOW_ERROR_CODES.INVALID_QUANTITY]: 'Quantity must be greater than zero.',
  [FOLLOW_ERROR_CODES.INVALID_PREFERENCES]: 'Invalid notification preferences configuration.',

  [FOLLOW_ERROR_CODES.MAX_FOLLOWS_EXCEEDED]: 'Maximum follow limit exceeded for user.',
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference = {
  priceDrop: true,
  priceDropThresholdPercentage: 5, // notify on 5%+ drop
  restock: true,
  backInStock: true,
  saleStart: true,
  channels: ['IN_APP'],
};

export const TIME_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_USER_FOLLOWS: 500,
} as const;
