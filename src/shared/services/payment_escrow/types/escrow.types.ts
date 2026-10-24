export type EscrowStatus =
  | 'DRAFT'
  | 'CREATED'
  | 'FUNDED'
  | 'DISPUTED'
  | 'RELEASED'
  | 'REFUNDED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'UNFUNDED'
  | 'PARTIALLY_FUNDED'
  | 'FULLY_FUNDED'
  | 'RELEASED'
  | 'REFUNDED';

export interface EscrowConfig {
  id: string;
  buyer: string;
  seller: string;
  arbitrator: string | null;
  amount: number;
  depositedAmount: number;
  currency: string;
  title: string;
  description: string;
  status: EscrowStatus;
  paymentStatus: PaymentStatus;
  autoReleaseSeconds?: number;
  createdAt: number;
  updatedAt: number;
  fundedAt?: number;
  completedAt?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateEscrowParams {
  buyer: string;
  seller: string;
  arbitrator?: string;
  amount: number;
  currency?: string;
  title: string;
  description?: string;
  autoReleaseSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateEscrowParams {
  title?: string;
  description?: string;
  amount?: number;
  autoReleaseSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface DepositResult {
  escrowId: string;
  payer: string;
  amount: number;
  totalDeposited: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  txHash: string;
}

export interface EscrowResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
  transactionHash?: string;
}
