import { VisibilityLevel } from './visibility.types';
import { PaymentStatus } from './payments.types';

export interface BoostConfig {
  productId: string;
  durationDays: number;
  visibilityLevel: VisibilityLevel;
  slotType?: string;
}

export interface BoostDetails extends BoostConfig {
  id: string;
  status: 'INACTIVE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startTime?: number;
  endTime?: number;
  paymentStatus?: PaymentStatus;
}
