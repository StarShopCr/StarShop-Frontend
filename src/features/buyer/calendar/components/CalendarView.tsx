'use client';

import { useCalendarStore, getMonthDays, getWeekDays } from '../hooks/useCalendar';
import { CalendarEvent as CalendarEventComponent } from './CalendarEvent';
import type { CalendarDay, CalendarEvent } from '../types/calendar';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  events: CalendarEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const { currentDate, viewMode, selectDate, selectedDate } = useCalendarStore();

  const days =
    viewMode === 'monthly'
      ? getMonthDays(currentDate, events)
      : getWeekDays(currentDate, events);

  const isSelected = (day: CalendarDay) =>
    selectedDate !== null &&
    day.date.getFullYear() === selectedDate.getFullYear() &&
    day.date.getMonth() === selectedDate.getMonth() &&
    day.date.getDate() === selectedDate.getDate();

  return (
    <div className="bg-transparent rounded-lg border border-white/20 overflow-hidden">
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-sm font-medium text-gray-400 border-b border-white/10"
          >
            {day}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${viewMode === 'weekly' ? 'grid-rows-1' : 'grid-rows-6'}`}>
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => selectDate(day.date)}
            className={`
              relative min-h-[100px] p-2 border-b border-r border-white/5 text-left
              transition-colors hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-purple-500/50
              ${!day.isCurrentMonth ? 'opacity-40' : ''}
              ${day.isToday ? 'bg-purple-500/10' : ''}
              ${isSelected(day) ? 'ring-1 ring-purple-400/60 bg-purple-500/5' : ''}
            `}
          >
            <span
              className={`
                text-sm font-medium
                ${day.isToday ? 'text-purple-400 bg-purple-500/30 w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-300'}
              `}
            >
              {day.date.getDate()}
            </span>

            <div className="mt-1 space-y-0.5 overflow-hidden max-h-[60px]">
              {day.events.slice(0, 3).map((event) => (
                <CalendarEventComponent key={event.id} event={event} compact />
              ))}
              {day.events.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{day.events.length - 3} more
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
