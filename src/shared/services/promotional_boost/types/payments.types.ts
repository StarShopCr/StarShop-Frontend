import { BoostId, PaymentStatus, TransactionHash } from './boost.types';

// ==================== PAYMENT REQUESTS ====================

export interface ProcessPaymentRequest {
  boostId: BoostId;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface RefundRequest {
  boostId: BoostId;
  reason?: string;
  partialAmount?: number;
}

export interface BoostCostRequest {
  visibilityLevel: string;
  slotType?: string;
  duration: number;
  targetAudience?: string[];
}

// ==================== PAYMENT RESULTS ====================

export interface PaymentResult {
  boostId: BoostId;
  status: PaymentStatus;
  amount: number;
  transactionHash?: TransactionHash;
  processedAt: number;
  receipt?: PaymentReceipt;
}

export interface RefundResult {
  boostId: BoostId;
  status: PaymentStatus;
  refundAmount: number;
  originalAmount: number;
  transactionHash?: TransactionHash;
  refundedAt: number;
}

export interface PaymentReceipt {
  receiptId: string;
  boostId: BoostId;
  amount: number;
  fee: number;
  netAmount: number;
  timestamp: number;
  transactionHash: TransactionHash;
}

// ==================== PAYMENT HISTORY ====================

export interface PaymentHistoryEntry {
  boostId: BoostId;
  amount: number;
  status: PaymentStatus;
  type: 'payment' | 'refund';
  transactionHash?: TransactionHash;
  timestamp: number;
}

export interface PaymentSummary {
  totalPaid: number;
  totalRefunded: number;
  netSpent: number;
  paymentCount: number;
  refundCount: number;
  history: PaymentHistoryEntry[];
}

// ==================== BILLING ====================

export interface BillingInfo {
  address: string;
  balance: number;
  pendingCharges: number;
  totalSpent: number;
}

export interface PricingTier {
  name: string;
  basePrice: number;
  multiplier: number;
  features: string[];
  maxDuration: number;
}
