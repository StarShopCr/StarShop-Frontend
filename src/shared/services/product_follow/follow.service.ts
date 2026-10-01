import { 
  FOLLOW_SERVICE_ERROR_CODES, 
  NOTIFICATION_TYPES 
} from './constants/follow.constants';
import { 
  FollowUser, 
  FollowProductResponse, 
  UserFollowingData 
} from './types/follow.types';
import { 
  NotificationPreferences, 
  NotificationHistoryItem, 
  NotificationPayload 
} from './types/notification.types';
import { 
  ProductAlert, 
  AlertConditions 
} from './types/alert.types';
import { 
  validateNotificationFormat, 
  validateUserPreferences 
} from './utils/follow.utils';

export class ProductFollowService {
  // Mock storage for demonstration - In production, these would call Smart Contracts or API
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private userAlerts: Map<string, ProductAlert[]> = new Map();
  private followMap: Map<string, Set<string>> = new Map(); // productId -> Set of users

  // --- Follow Management ---

  async followProduct(productId: string, user: FollowUser): Promise<FollowProductResponse> {
    await this.checkRateLimit(user.address, 'follow');
    
    if (!this.followMap.has(productId)) {
      this.followMap.set(productId, new Set());
    }
    
    this.followMap.get(productId)?.add(user.address);
    
    return {
      productId,
      isFollowing: true,
      followerCount: this.followMap.get(productId)?.size || 0
    };
  }

  async unfollowProduct(productId: string, user: FollowUser): Promise<FollowProductResponse> {
    await this.checkRateLimit(user.address, 'unfollow');
    
    this.followMap.get(productId)?.delete(user.address);
    
    return {
      productId,
      isFollowing: false,
      followerCount: this.followMap.get(productId)?.size || 0
    };
  }

  async getFollowers(productId: string): Promise<string[]> {
    const followers = this.followMap.get(productId);
    return followers ? Array.from(followers) : [];
  }

  async getFollowing(user: FollowUser): Promise<UserFollowingData> {
    const followedProducts: string[] = [];
    this.followMap.forEach((users, productId) => {
      if (users.has(user.address)) followedProducts.push(productId);
    });

    return {
      userId: user.address,
      followedProducts
    };
  }

  async isFollowing(productId: string, user: FollowUser): Promise<boolean> {
    return this.followMap.get(productId)?.has(user.address) || false;
  }

  // --- Notification Management ---

  async setNotificationPreferences(user: FollowUser, preferences: NotificationPreferences): Promise<void> {
    if (!validateUserPreferences(preferences)) {
      throw new Error(FOLLOW_SERVICE_ERROR_CODES.INVALID_PREFERENCES);
    }
    this.userPreferences.set(user.address, preferences);
  }

  async getNotificationPreferences(user: FollowUser): Promise<NotificationPreferences | null> {
    return this.userPreferences.get(user.address) || null;
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!validateNotificationFormat(payload)) {
      throw new Error(FOLLOW_SERVICE_ERROR_CODES.INVALID_NOTIFICATION_FORMAT);
    }
    // Logic to trigger push/email notification
    console.log(`Notification sent for product ${payload.productId}: ${payload.type}`);
    return true;
  }

  async getNotificationHistory(user: FollowUser): Promise<NotificationHistoryItem[]> {
    // Mock history
    return [];
  }

  // --- Alert Management ---

  async createAlert(user: FollowUser, productId: string, conditions: AlertConditions): Promise<ProductAlert> {
    const alert: ProductAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.address,
      productId,
      conditions,
      createdAt: Date.now(),
      isActive: true,
    };

    const alerts = this.userAlerts.get(user.address) || [];
    this.userAlerts.set(user.address, [...alerts, alert]);
    
    return alert;
  }

  async updateAlert(user: FollowUser, alertId: string, conditions: AlertConditions): Promise<ProductAlert | null> {
    const alerts = this.userAlerts.get(user.address) || [];
    const index = alerts.findIndex(a => a.id === alertId);
    
    if (index === -1) return null;
    
    alerts[index].conditions = conditions;
    this.userAlerts.set(user.address, alerts);
    return alerts[index];
  }

  async deleteAlert(user: FollowUser, alertId: string): Promise<boolean> {
    const alerts = this.userAlerts.get(user.address) || [];
    const filtered = alerts.filter(a => a.id !== alertId);
    this.userAlerts.set(user.address, filtered);
    return true;
  }

  async getAlerts(user: FollowUser): Promise<ProductAlert[]> {
    return this.userAlerts.get(user.address) || [];
  }

  async triggerAlert(alertId: string): Promise<void> {
    // Logic to find alert and trigger notification
    console.log(`Alert ${alertId} triggered!`);
  }

  // --- Rate Limiting & Validation ---

  private async checkRateLimit(userAddress: string, action: string): Promise<void> {
    // Mock rate limit check
    const isLimited = false; 
    if (isLimited) {
      throw new Error(FOLLOW_SERVICE_ERROR_CODES.RATE_LIMIT_EXCEEDED);
    }
  }
}
