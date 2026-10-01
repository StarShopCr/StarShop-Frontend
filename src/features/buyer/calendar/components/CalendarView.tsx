import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { CalendarEvent as EventType } from '../types/calendar';
import { CalendarEvent } from './CalendarEvent';

interface Props {
  currentDate: Date;
  events: EventType[];
  onEventClick: (event: EventType) => void;
}

export const CalendarView: React.FC<Props> = ({ currentDate, events, onEventClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-white/20">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-xs font-bold text-white/50 uppercase">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayEvents = events.filter(e => isSameDay(e.date, day));
          return (
            <div 
              key={idx} 
              className={`min-h-[100px] p-1 border-r border-b border-white/10 transition-colors ${
                !isSameMonth(day, monthStart) ? 'bg-white/5 opacity-30' : 'hover:bg-white/5'
              }`}
            >
              <div className="text-right text-xs text-white/60 mb-1">{format(day, 'd')}</div>
              <div className="flex flex-col gap-1">
                {dayEvents.map(event => (
                  <CalendarEvent key={event.id} event={event} onClick={onEventClick} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
