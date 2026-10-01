import { NotificationPreferences, ProductAlert } from './notification.types'; // Adjusted import

export interface FollowUser {
  address: string;
  walletId: string;
}

export interface FollowProductResponse {
  productId: string;
  isFollowing: boolean;
  followerCount: number;
}

export interface UserFollowingData {
  userId: string;
  followedProducts: string[];
}
