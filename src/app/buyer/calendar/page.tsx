'use client';

import React, { useState } from 'react';
import { 
  CalendarView, 
  CalendarHeader, 
  CalendarFilters, 
  EventDetails 
} from '@/features/buyer/calendar';
import { useCalendar } from '@/features/buyer/calendar/hooks/useCalendar';
import { CalendarEvent as EventType } from '@/features/buyer/calendar/types/calendar';
import { addMonths, subMonths } from 'date-fns';

// Mock data for demonstration - In real app, this would come from an API
const MOCK_EVENTS: EventType[] = [
  {
    id: '1',
    orderId: 'ORD-101',
    title: 'Order #101 Placed',
    date: new Date(),
    type: 'order',
    status: 'delivered',
    details: 'Your StarShop order has been successfully delivered to your address.'
  },
  {
    id: '2',
    orderId: 'ORD-102',
    title: 'Delivery #102',
    date: addMonths(new Date(), 0), // Adjust to current month
    type: 'delivery',
    status: 'shipped',
    details: 'Your package is on the way and should arrive within 3 days.'
  },
  {
    id: '3',
    orderId: 'ORD-103',
    title: 'Order #103 Pending',
    date: new Date(),
    type: 'order',
    status: 'pending',
    details: 'Payment is being processed for your latest purchase.'
  }
];

export default function BuyerCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const { filteredEvents, filters, updateFilter } = useCalendar(MOCK_EVENTS);

  return (
    <div className="min-h-screen p-6 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Activity Calendar</h1>
          <p className="text-white/60">Track your orders and delivery dates</p>
        </header>

        <CalendarHeader 
          currentDate={currentDate} 
          onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
          onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
        />

        <CalendarFilters 
          filters={filters} 
          onFilterChange={updateFilter} 
        />

        <CalendarView 
          currentDate={currentDate} 
          events={filteredEvents} 
          onEventClick={setSelectedEvent} 
        />

        <EventDetails 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      </div>
    </div>
  );
}
