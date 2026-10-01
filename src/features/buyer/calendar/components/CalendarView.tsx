import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { CalendarEvent } from '../types/calendar';
import { CalendarEvent as EventItem } from './CalendarEvent';

interface CalendarViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, events, onEventClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 gap-px border border-white bg-white/10 rounded-lg overflow-hidden">
      {daysOfWeek.map(day => (
        <div key={day} className="p-2 text-center font-bold text-white bg-white/20 border-b border-white">
          {day}
        </div>
      ))}
      {calendarDays.map((day, idx) => {
        const dayEvents = events.filter(event => isSameDay(event.date, day));
        return (
          <div 
            key={idx} 
            className={`min-h-[100px] p-2 border-r border-b border-white/20 transition-colors ${
              !isSameMonth(day, monthStart) ? 'opacity-30' : 'bg-transparent'
            }`}
          >
            <span className="text-white text-sm block mb-2">{format(day, 'd')}</span>
            <div className="flex flex-col gap-1">
              {dayEvents.map(event => (
                <EventItem key={event.id} event={event} onClick={onEventClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
