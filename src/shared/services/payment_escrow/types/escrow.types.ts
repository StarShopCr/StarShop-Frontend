import { ESCROW_STATUS } from '../constants/escrow.constants';

export interface EscrowConfig {
  buyer: string;
  seller: string;
  amount: string; // BigNumber string
  orderId: string;
  terms: string;
}

export interface EscrowDetails {
  id: string;
  buyer: string;
  seller: string;
  amount: string;
  status: ESCROW_STATUS;
  createdAt: number;
  updatedAt: number;
  orderId: string;
}

export type EscrowUpdate = Partial<Omit<EscrowDetails, 'id' | 'createdAt'>>;
