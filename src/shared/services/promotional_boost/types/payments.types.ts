import type { u32, u64 } from '@stellar/stellar-sdk';
import type { Address, BoostId, BoostTier } from './boost.types';

/**
 * Payment status enumeration
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed',
}

/**
 * Payment method enumeration
 */
export enum PaymentMethod {
  XLM = 'xlm',
  USDC = 'usdc',
  CUSTOM_TOKEN = 'custom_token',
}

/**
 * Refund reason enumeration
 */
export enum RefundReason {
  CANCELLED_BY_USER = 'cancelled_by_user',
  CANCELLED_BY_ADMIN = 'cancelled_by_admin',
  EXPIRED_BOOST = 'expired_boost',
  SERVICE_ISSUE = 'service_issue',
  DUPLICATE_PAYMENT = 'duplicate_payment',
  FRAUD = 'fraud',
  OTHER = 'other',
}

/**
 * Core payment record structure
 */
export interface PaymentRecord {
  /** Unique payment identifier */
  paymentId: string;
  /** Associated boost ID */
  boostId: BoostId;
  /** Payer address */
  payer: Address;
  /** Recipient address (contract) */
  recipient: Address;
  /** Payment amount */
  amount: u64;
  /** Token used for payment */
  token: Address;
  /** Payment status */
  status: PaymentStatus;
  /** Transaction hash */
  transactionHash: string;
  /** Payment timestamp */
  createdAt: u64;
  /** Last status update timestamp */
  updatedAt: u64;
  /** Fee amount deducted */
  feeAmount: u64;
  /** Net amount after fees */
  netAmount: u64;
}

/**
 * Request to process a boost payment
 */
export interface ProcessBoostPaymentRequest {
  /** Boost ID to pay for */
  boostId: BoostId;
  /** Payer address */
  payer: Address;
  /** Payment token address */
  paymentToken: Address;
  /** Payment amount */
  amount: u64;
  /** Optional memo */
  memo?: string;
}

/**
 * Request to get payment status
 */
export interface GetPaymentStatusRequest {
  /** Payment ID or transaction hash */
  paymentId: string;
  /** Optional boost ID for validation */
  boostId?: BoostId;
}

/**
 * Request to refund a boost payment
 */
export interface RefundBoostPaymentRequest {
  /** Boost ID to refund */
  boostId: BoostId;
  /** Original payer address */
  payer: Address;
  /** Admin authorizing the refund */
  admin?: Address;
  /** Reason for refund */
  reason: RefundReason;
  /** Amount to refund (full or partial) */
  refundAmount?: u64;
  /** Optional notes */
  notes?: string;
}

/**
 * Refund record
 */
export interface RefundRecord {
  /** Unique refund identifier */
  refundId: string;
  /** Associated boost ID */
  boostId: BoostId;
  /** Original payment ID */
  originalPaymentId: string;
  /** Recipient address */
  recipient: Address;
  /** Refund amount */
  refundAmount: u64;
  /** Token refunded */
  token: Address;
  /** Refund reason */
  reason: RefundReason;
  /** Refund status */
  status: PaymentStatus;
  /** Transaction hash */
  transactionHash: string;
  /** Refund timestamp */
  createdAt: u64;
  /** Notes */
  notes?: string;
}

/**
 * Boost cost calculation result
 */
export interface BoostCostCalculation {
  /** Boost tier */
  tier: BoostTier;
  /** Duration in seconds */
  durationSeconds: u64;
  /** Base cost */
  baseCost: u64;
  /** Tier multiplier applied */
  tierMultiplier: number;
  /** Duration multiplier applied */
  durationMultiplier: number;
  /** Platform fee (percentage) */
  platformFeePercentage: number;
  /** Platform fee amount */
  platformFeeAmount: u64;
  /** Discount amount */
  discountAmount: u64;
  /** Discount percentage */
  discountPercentage: number;
  /** Final total cost */
  totalCost: u64;
  /** Net cost after fees */
  netCost: u64;
  /** Cost breakdown items */
  breakdown: CostBreakdownItem[];
}

/**
 * Cost breakdown item
 */
export interface CostBreakdownItem {
  /** Item description */
  description: string;
  /** Item amount */
  amount: u64;
  /** Whether this is a fee */
  isFee: boolean;
  /** Whether this is a discount */
  isDiscount: boolean;
}

/**
 * Payment history for a boost
 */
export interface BoostPaymentHistory {
  /** Boost ID */
  boostId: BoostId;
  /** All payments */
  payments: PaymentRecord[];
  /** All refunds */
  refunds: RefundRecord[];
  /** Total amount paid */
  totalPaid: u64;
  /** Total amount refunded */
  totalRefunded: u64;
  /** Net amount paid */
  netPaid: u64;
}

/**
 * Payment statistics
 */
export interface PaymentStats {
  /** Total payments processed */
  totalPayments: u32;
  /** Total revenue */
  totalRevenue: u64;
  /** Total refunds issued */
  totalRefunds: u32;
  /** Total refunded amount */
  totalRefundedAmount: u64;
  /** Net revenue */
  netRevenue: u64;
  /** Average payment amount */
  averagePayment: u64;
  /** Success rate (0-100) */
  successRate: number;
}

/**
 * Payment validation result
 */
export interface PaymentValidation {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Validated amount */
  validatedAmount?: u64;
  /** Calculated cost */
  calculatedCost?: BoostCostCalculation;
}

/**
 * Refund validation result
 */
export interface RefundValidation {
  /** Whether refund is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Maximum refundable amount */
  maxRefundableAmount?: u64;
  /** Time remaining for refund eligibility in seconds */
  timeRemainingSeconds?: u64;
}

/**
 * Payment receipt
 */
export interface PaymentReceipt {
  /** Receipt ID */
  receiptId: string;
  /** Boost ID */
  boostId: BoostId;
  /** Payer address */
  payer: Address;
  /** Payment amount */
  amount: u64;
  /** Token used */
  token: Address;
  /** Transaction hash */
  transactionHash: string;
  /** Payment timestamp */
  timestamp: u64;
  /** Boost tier */
  tier: BoostTier;
  /** Boost duration */
  durationSeconds: u64;
  /** Platform fee */
  platformFee: u64;
  /** Net amount */
  netAmount: u64;
}

/**
 * Subscription-based payment plan
 */
export interface BoostSubscriptionPlan {
  /** Plan ID */
  planId: string;
  /** Plan name */
  name: string;
  /** Boost tier */
  tier: BoostTier;
  /** Billing interval in seconds */
  billingIntervalSeconds: u64;
  /** Price per interval */
  pricePerInterval: u64;
  /** Maximum boosts included */
  maxBoosts: u32;
  /** Discount percentage */
  discountPercentage: number;
  /** Features included */
  features: string[];
}

/**
 * Token balance information
 */
export interface TokenBalanceInfo {
  /** Token address */
  token: Address;
  /** Token symbol */
  symbol: string;
  /** Current balance */
  balance: u64;
  /** Available for boost payments */
  availableForBoost: u64;
  /** Minimum required for cheapest boost */
  minimumRequired: u64;
  /** Whether balance is sufficient */
  isSufficient: boolean;
}

/**
 * Price feed entry
 */
export interface PriceFeedEntry {
  /** Token address */
  token: Address;
  /** Price in USD cents */
  priceUsdCents: u64;
  /** Last update timestamp */
  lastUpdated: u64;
  /** Price source */
  source: string;
}
