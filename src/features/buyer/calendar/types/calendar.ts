export type CalendarViewMode = 'monthly' | 'weekly';

export type EventType = 'order_placed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface CalendarEvent {
  id: string;
  orderId: string;
  title: string;
  date: Date;
  type: EventType;
  status: OrderStatus;
  storeName: string;
  amount: number;
  description?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface CalendarFiltersState {
  status: OrderStatus | 'all';
  dateRange: { start: Date | null; end: Date | null };
  searchQuery: string;
}

export interface CalendarState {
  currentDate: Date;
  viewMode: CalendarViewMode;
  selectedDate: Date | null;
  selectedEvent: CalendarEvent | null;
  filters: CalendarFiltersState;
}

export const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  order_placed: { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  shipped: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  delivered: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  refunded: { bg: 'bg-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  order_placed: 'Order Placed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};
