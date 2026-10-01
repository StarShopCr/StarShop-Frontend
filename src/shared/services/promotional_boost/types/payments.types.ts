export interface BoostPaymentConfig {
  amount: string;
  currency: string;
  paymentMethod: 'CRYPTO' | 'FIAT';
}

export interface PaymentStatus {
  transactionHash: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  timestamp: number;
}
