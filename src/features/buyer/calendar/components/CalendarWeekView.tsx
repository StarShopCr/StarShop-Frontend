'use client';

import React from 'react';
import { Truck, Package, CheckCircle2, Clock } from 'lucide-react';
import { CalendarDay, CalendarEvent } from '../types';

interface CalendarWeekViewProps {
  days: CalendarDay[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (day: CalendarDay) => void;
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function CalendarWeekView({
  days,
  onSelectEvent,
  onSelectDay,
}: CalendarWeekViewProps) {
  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'delivery_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'delivery_expected':
        return <Truck className="w-4 h-4 text-blue-400" />;
      default:
        return <Package className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {days.map((day, idx) => (
          <div
            key={day.dateString}
            onClick={() => onSelectDay(day)}
            className={`min-h-[220px] flex flex-col p-3 transition-colors ${
              day.isSelected
                ? 'bg-purple-950/20 ring-1 ring-purple-500'
                : 'hover:bg-white/[0.02]'
            }`}
          >
            {/* Day Header */}
            <div className="flex md:flex-col items-center md:items-start justify-between pb-3 border-b border-white/5 mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {WEEKDAYS[idx].slice(0, 3)}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                    day.isToday
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-white'
                  }`}
                >
                  {day.dayNumber}
                </span>
                {day.events.length > 0 && (
                  <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded-full">
                    {day.events.length} event(s)
                  </span>
                )}
              </div>
            </div>

            {/* Events for the Day */}
            <div className="space-y-2 flex-1">
              {day.events.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[11px] text-gray-600 italic py-4 md:py-8">
                  No activity
                </div>
              ) : (
                day.events.map(event => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                    className={`w-full text-left p-2 rounded-lg border transition-all hover:scale-[1.02] ${event.statusColor}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        {getEventIcon(event.type)}
                        <span className="font-semibold text-xs text-white">
                          {event.orderId}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-medium ${event.textColor}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-200 line-clamp-1 font-medium">
                      {event.product}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {event.store}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time || 'All-day'}
                      </span>
                      <span className="text-purple-300 font-medium">
                        {event.total}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
