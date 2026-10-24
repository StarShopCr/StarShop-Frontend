import type { NotificationPreference } from './notification.types';

export type FollowStatus = 'ACTIVE' | 'MUTED' | 'UNFOLLOWED';

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FollowEntry {
  productId: string;
  user: string;
  status: FollowStatus;
  followedAt: number;
  updatedAt: number;
  preferences: NotificationPreference;
  txHash: string;
}

export interface FollowResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
  transactionHash?: string;
}
