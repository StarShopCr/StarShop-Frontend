/**
 * Promotional Boost Contract Service - Boost Core Types
 */

import type { VisibilityLevel } from './visibility.types';
import type { PaymentStatus } from './payments.types';

export type BoostStatus = 'CREATED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface CreateBoostParams {
  productId: string;
  seller: string;
  level: VisibilityLevel;
  durationSeconds: number;
  slotType?: string;
  autoActivate?: boolean;
}

export interface UpdateBoostParams {
  level?: VisibilityLevel;
  extendDurationSeconds?: number;
  slotType?: string;
}

export interface BoostConfig {
  boostId: string;
  productId: string;
  seller: string;
  level: VisibilityLevel;
  status: BoostStatus;
  durationSeconds: number;
  slotType: string;
  slotId?: string;
  cost: number;
  paymentStatus: PaymentStatus;
  startTime?: number;
  endTime?: number;
  createdAt: number;
  updatedAt: number;
}

export interface BoostResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  txHash?: string;
}
