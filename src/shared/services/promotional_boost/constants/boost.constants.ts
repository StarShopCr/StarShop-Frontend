/**
 * Promotional Boost Contract Service - Constants & Configurations
 */

import type { VisibilityLevel } from '../types/visibility.types';

export const BOOST_STATUS = {
  CREATED: 'CREATED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export const VISIBILITY_LEVELS: Record<VisibilityLevel, VisibilityLevel> = {
  STANDARD: 'STANDARD',
  FEATURED: 'FEATURED',
  PREMIUM: 'PREMIUM',
  SPOTLIGHT: 'SPOTLIGHT',
};

export const VISIBILITY_MULTIPLIERS: Record<VisibilityLevel, number> = {
  STANDARD: 1.0,
  FEATURED: 2.0,
  PREMIUM: 3.5,
  SPOTLIGHT: 5.0,
};

export const BASE_RATES_PER_HOUR: Record<VisibilityLevel, number> = {
  STANDARD: 1.0,    // 1 USDC/hr
  FEATURED: 2.5,    // 2.5 USDC/hr
  PREMIUM: 5.0,     // 5 USDC/hr
  SPOTLIGHT: 10.0,  // 10 USDC/hr
};

export const SLOT_TYPES = {
  HOMEPAGE_HERO: 'HOMEPAGE_HERO',
  CATEGORY_TOP: 'CATEGORY_TOP',
  SEARCH_FEATURED: 'SEARCH_FEATURED',
  SIDEBAR_BANNER: 'SIDEBAR_BANNER',
} as const;

export const SLOT_MULTIPLIERS: Record<string, number> = {
  HOMEPAGE_HERO: 2.0,
  CATEGORY_TOP: 1.5,
  SEARCH_FEATURED: 1.25,
  SIDEBAR_BANNER: 1.0,
};

export const MAX_SLOTS_PER_TYPE: Record<string, number> = {
  HOMEPAGE_HERO: 5,
  CATEGORY_TOP: 10,
  SEARCH_FEATURED: 15,
  SIDEBAR_BANNER: 8,
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;

export const BOOST_ERROR_CODES = {
  BOOST_NOT_FOUND: 'BOOST_NOT_FOUND',
  BOOST_NOT_ACTIVE: 'BOOST_NOT_ACTIVE',
  BOOST_ALREADY_ACTIVE: 'BOOST_ALREADY_ACTIVE',
  BOOST_ALREADY_CANCELLED: 'BOOST_ALREADY_CANCELLED',
  BOOST_EXPIRED: 'BOOST_EXPIRED',
  INVALID_BOOST_PARAMS: 'INVALID_BOOST_PARAMS',
  INVALID_PRODUCT_ID: 'INVALID_PRODUCT_ID',
  INVALID_SELLER_ADDRESS: 'INVALID_SELLER_ADDRESS',
  INVALID_VISIBILITY_LEVEL: 'INVALID_VISIBILITY_LEVEL',
  INVALID_DURATION: 'INVALID_DURATION',
  INVALID_SLOT_TYPE: 'INVALID_SLOT_TYPE',
  SLOT_NOT_AVAILABLE: 'SLOT_NOT_AVAILABLE',
  SLOT_NOT_FOUND: 'SLOT_NOT_FOUND',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
  INSUFFICIENT_PAYMENT: 'INSUFFICIENT_PAYMENT',
  CANNOT_REFUND_ACTIVE_BOOST: 'CANNOT_REFUND_ACTIVE_BOOST',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
} as const;

export const ERROR_MESSAGES: Record<keyof typeof BOOST_ERROR_CODES, string> = {
  BOOST_NOT_FOUND: 'Promotional boost not found',
  BOOST_NOT_ACTIVE: 'Promotional boost is not currently active',
  BOOST_ALREADY_ACTIVE: 'Promotional boost is already active',
  BOOST_ALREADY_CANCELLED: 'Promotional boost has already been cancelled',
  BOOST_EXPIRED: 'Promotional boost has expired',
  INVALID_BOOST_PARAMS: 'Invalid promotional boost parameters provided',
  INVALID_PRODUCT_ID: 'Invalid or missing product ID',
  INVALID_SELLER_ADDRESS: 'Invalid seller Stellar/Soroban public address',
  INVALID_VISIBILITY_LEVEL: 'Invalid visibility level specified',
  INVALID_DURATION: 'Duration must be greater than zero seconds',
  INVALID_SLOT_TYPE: 'Invalid promotional slot type requested',
  SLOT_NOT_AVAILABLE: 'No available slots for the requested promotional slot type',
  SLOT_NOT_FOUND: 'Requested slot not found or invalid',
  PAYMENT_REQUIRED: 'Payment must be completed before activating promotional boost',
  PAYMENT_ALREADY_PROCESSED: 'Payment for this boost has already been processed',
  INSUFFICIENT_PAYMENT: 'Paid amount is less than required promotional boost cost',
  CANNOT_REFUND_ACTIVE_BOOST: 'Cannot refund a boost that is currently active',
  PAYMENT_NOT_FOUND: 'No completed payment found for refund',
};

export const MIN_DURATION_SECONDS = 3600; // 1 hour min
export const MAX_DURATION_SECONDS = 2592000; // 30 days max
