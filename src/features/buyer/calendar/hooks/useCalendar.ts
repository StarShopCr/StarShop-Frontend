import { useState, useMemo } from 'react';
import { BuyerOrder, CalendarEvent, CalendarFilterState } from '../types/calendar';
import { isWithinInterval, startOfDay } from 'date-fns';

export const useCalendar = (orders: BuyerOrder[] = []) => {
  const [filters, setFilters] = useState<CalendarFilterState>({
    status: 'all',
    dateRange: { start: null, end: null },
  });

  const events: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    for (const order of orders) {
      // Event 1: Order creation
      list.push({
        id: `event-order-${order.id}`,
        orderId: order.id,
        title: `Order #${order.id.slice(-6)}`,
        date: new Date(order.createdAt),
        type: 'order',
        status: order.status,
        details: `Order placed: ${order.product || order.id} - Total: ${order.total}`,
      });

      // Event 2: Scheduled or completed delivery
      if (order.deliveryDate) {
        list.push({
          id: `event-delivery-${order.id}`,
          orderId: order.id,
          title: `Delivery #${order.id.slice(-6)}`,
          date: new Date(order.deliveryDate),
          type: 'delivery',
          status: order.status,
          details: `Delivery: ${order.product || order.id} - Status: ${order.status}`,
        });
      }
    }

    return list;
  }, [orders]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const statusMatch = filters.status === 'all' || event.status === filters.status;
      const dateMatch =
        !filters.dateRange.start || !filters.dateRange.end
          ? true
          : isWithinInterval(startOfDay(event.date), {
              start: startOfDay(filters.dateRange.start),
              end: startOfDay(filters.dateRange.end),
            });

      return statusMatch && dateMatch;
    });
  }, [events, filters]);

  return {
    events,
    filteredEvents,
    filters,
    setFilters,
  };
};
