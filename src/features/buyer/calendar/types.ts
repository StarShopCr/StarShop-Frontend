export type OrderStatus =
  'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type EventType =
  'order_placed' | 'delivery_expected' | 'delivery_completed';

export interface CalendarEvent {
  id: string;
  orderId: string;
  product: string;
  store: string;
  type: EventType;
  title: string;
  date: string; // ISO date 'YYYY-MM-DD'
  time?: string;
  status: OrderStatus;
  statusColor: string;
  textColor: string;
  total: string;
  eta: string;
  trackingNumber?: string;
  carrier?: string;
  destination?: string;
  itemsCount?: number;
}

export type CalendarFilterStatus =
  'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered';

export type CalendarViewMode = 'month' | 'week';

export interface CalendarDay {
  date: Date;
  dateString: string; // 'YYYY-MM-DD'
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
}

export interface CalendarStats {
  totalEvents: number;
  pendingCount: number;
  shippedCount: number;
  deliveredCount: number;
}
