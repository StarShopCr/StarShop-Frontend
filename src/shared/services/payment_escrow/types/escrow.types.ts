export enum EscrowStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export interface EscrowConfig {
  buyerAddress: string;
  sellerAddress: string;
  amount: bigint;
  currency: string;
  description?: string;
  expirationDays?: number;
}

export interface EscrowDetails {
  escrowId: string;
  buyerAddress: string;
  sellerAddress: string;
  amount: bigint;
  currency: string;
  status: EscrowStatus;
  description: string;
  createdAt: number;
  expiresAt: number;
  fundedAt?: number;
  releasedAt?: number;
  refundedAt?: number;
}

export interface EscrowUpdateParams {
  description?: string;
  expirationDays?: number;
}

export interface PaymentStatusResponse {
  escrowId: string;
  status: EscrowStatus;
  amount: bigint;
  fundedAt?: number;
  releasedAt?: number;
  refundedAt?: number;
}

export interface EscrowServiceConfig {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  defaultExpirationDays: number;
}

export interface TransactionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  txHash?: string;
}

export interface EscrowResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
