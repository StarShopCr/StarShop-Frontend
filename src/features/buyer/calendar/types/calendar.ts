export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface CalendarEvent {
  id: string;
  orderId: string;
  title: string;
  date: Date;
  type: 'order' | 'delivery';
  status: OrderStatus;
  details: string;
}

export interface CalendarFilterState {
  status: OrderStatus | 'all';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}
