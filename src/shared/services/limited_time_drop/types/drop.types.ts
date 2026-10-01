import { DROP_STATUS } from '../constants/drop.constants';

export interface DropConfig {
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  maxSupply: number;
  price: string;
  allowedUsers?: string[];
}

export interface DropDetails extends DropConfig {
  id: string;
  currentSupply: number;
  status: DROP_STATUS;
  creator: string;
}

export interface DropUpdates {
  endTime?: number;
  price?: string;
  maxSupply?: number;
}

export interface ParticipationMetrics {
  totalParticipants: number;
  remainingSupply: number;
  participationRate: number;
}
