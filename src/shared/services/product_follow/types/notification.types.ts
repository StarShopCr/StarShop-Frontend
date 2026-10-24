export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'WEBHOOK';

export type AlertTriggerType =
  | 'PRICE_DROP'
  | 'RESTOCK'
  | 'BACK_IN_STOCK'
  | 'SALE_START';

export interface NotificationPreference {
  priceDrop: boolean;
  priceDropThresholdPercentage?: number; // e.g. 10 for 10%
  targetPrice?: number;
  restock: boolean;
  backInStock: boolean;
  saleStart?: boolean;
  channels: NotificationChannel[];
}

export interface AlertConfig {
  id: string;
  productId: string;
  type: AlertTriggerType;
  timestamp: number;
  data: Record<string, unknown>;
  notifiedUsersCount: number;
}
