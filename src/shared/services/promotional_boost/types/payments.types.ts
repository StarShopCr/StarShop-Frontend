/**
 * Promotional Boost Contract Service - Payment Types
 */

import type { VisibilityLevel } from './visibility.types';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface ProcessPaymentParams {
  boostId: string;
  amount: number;
  payer?: string;
  paymentMethod?: string;
}

export interface RefundResult {
  boostId: string;
  refundAmount: number;
  status: 'SUCCESS' | 'FAILED';
  txHash: string;
  refundedAt: number;
}

export interface BoostCostParams {
  level: VisibilityLevel;
  durationSeconds: number;
  slotType?: string;
}
