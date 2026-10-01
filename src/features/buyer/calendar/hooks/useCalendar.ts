import { useState, useMemo } from 'react';
import { CalendarEvent, CalendarFilterState, OrderStatus } from '../types/calendar';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const useCalendar = (events: CalendarEvent[]) => {
  const [filters, setFilters] = useState<CalendarFilterState>({
    status: 'all',
    dateRange: { start: null, end: null },
  });

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const statusMatch = filters.status === 'all' || event.status === filters.status;
      
      let dateMatch = true;
      if (filters.dateRange.start && filters.dateRange.end) {
        dateMatch = isWithinInterval(event.date, {
          start: startOfDay(filters.dateRange.start!),
          end: endOfDay(filters.dateRange.end!),
        });
      }

      return statusMatch && dateMatch;
    });
  }, [events, filters]);

  const updateFilter = (updates: Partial<CalendarFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  return {
    filteredEvents,
    filters,
    updateFilter,
  };
};
