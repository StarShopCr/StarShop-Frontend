'use client';

import { CalendarHeader } from './CalendarHeader';
import { CalendarView } from './CalendarView';
import { CalendarFilters } from './CalendarFilters';
import { EventDetails } from './EventDetails';
import { CalendarEvent } from './CalendarEvent';
import { useCalendarStore, useMockEvents, filterEvents } from '../hooks/useCalendar';

export function CalendarPage() {
  const { filters, selectedDate, selectedEvent } = useCalendarStore();
  const allEvents = useMockEvents();
  const filteredEvents = filterEvents(allEvents, filters);

  const selectedDayEvents = selectedDate
    ? filteredEvents.filter((e) => {
        const eventDate = new Date(e.date);
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        );
      })
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Calendar</h1>
        <p className="text-gray-400 text-sm">
          Track your orders, deliveries, and important dates
        </p>
      </div>

      <CalendarFilters />
      <CalendarHeader />
      <CalendarView events={filteredEvents} />

      {selectedDate && selectedDayEvents.length > 0 && (
        <div className="mt-6 bg-transparent rounded-lg border border-white/20 p-4">
          <h3 className="text-white font-medium mb-3">
            Events on{' '}
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <div className="space-y-2">
            {selectedDayEvents.map((event) => (
              <CalendarEvent key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {selectedEvent && <EventDetails />}
    </div>
  );
}
