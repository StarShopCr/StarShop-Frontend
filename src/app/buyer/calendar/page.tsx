'use client';

import React, { useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { CalendarView } from '@/features/buyer/calendar/components/CalendarView';
import { CalendarHeader } from '@/features/buyer/calendar/components/CalendarHeader';
import { CalendarFilters } from '@/features/buyer/calendar/components/CalendarFilters';
import { EventDetails } from '@/features/buyer/calendar/components/EventDetails';
import { useCalendar } from '@/features/buyer/calendar/hooks/useCalendar';
import { useBuyerOrders } from '@/features/buyer/calendar/hooks/useBuyerOrders';
import { CalendarEvent } from '@/features/buyer/calendar/types/calendar';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const { orders, isLoading } = useBuyerOrders();
  const { filteredEvents, filters, setFilters } = useCalendar(orders);

  return (
    <div className="min-h-screen p-6 bg-transparent text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Shopping Calendar</h1>
          <p className="opacity-70">Track your orders and delivery dates</p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
            <CalendarHeader 
              currentDate={currentDate} 
              onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
              onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
            />
            <CalendarFilters filters={filters} setFilters={setFilters} />
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading orders...</div>
          ) : (
            <CalendarView 
              currentDate={currentDate} 
              events={filteredEvents} 
              onEventClick={setSelectedEvent} 
            />
          )}
        </div>
      </div>

      <EventDetails 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}
