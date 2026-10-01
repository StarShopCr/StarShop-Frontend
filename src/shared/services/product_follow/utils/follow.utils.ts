import { NotificationPreferences } from '../types/notification.types';

export const validateNotificationFormat = (data: any): boolean => {
  return !!(data && data.productId && data.type && data.data);
};

export const validateUserPreferences = (preferences: any): preferences is NotificationPreferences => {
  return (
    typeof preferences.emailNotifications === 'boolean' &&
    typeof preferences.pushNotifications === 'boolean' &&
    Array.isArray(preferences.preferredTypes)
  );
};

export const formatAddress = (address: string): string => {
  return address.toLowerCase();
};
