import { NotificationType } from '../constants/follow.constants';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  preferredTypes: NotificationType[];
}

export interface NotificationHistoryItem {
  id: string;
  productId: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface NotificationPayload {
  productId: string;
  type: NotificationType;
  data: Record<string, any>;
}
