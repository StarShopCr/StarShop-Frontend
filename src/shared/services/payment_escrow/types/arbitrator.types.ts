export interface Arbitrator {
  address: string;
  reputation: number;
  isVerified: boolean;
}

export type ArbitratorDecision = 'BUYER_WIN' | 'SELLER_WIN' | 'SPLIT';
