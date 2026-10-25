'use client';

import React from 'react';
import { Truck, Package, CheckCircle2 } from 'lucide-react';
import { CalendarDay, CalendarEvent } from '../types';

interface CalendarGridProps {
  days: CalendarDay[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (day: CalendarDay) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  days,
  onSelectEvent,
  onSelectDay,
}: CalendarGridProps) {
  const getEventSmallIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'delivery_completed':
        return (
          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
        );
      case 'delivery_expected':
        return <Truck className="w-3 h-3 text-blue-400 flex-shrink-0" />;
      default:
        return <Package className="w-3 h-3 text-purple-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid (6 rows x 7 columns) */}
      <div className="grid grid-cols-7 divide-x divide-y divide-white/5">
        {days.map((day, idx) => {
          const maxVisibleEvents = 2;
          const visibleEvents = day.events.slice(0, maxVisibleEvents);
          const hiddenCount = day.events.length - maxVisibleEvents;

          return (
            <div
              key={`${day.dateString}-${idx}`}
              onClick={() => onSelectDay(day)}
              className={`min-h-[96px] sm:min-h-[115px] p-1.5 sm:p-2.5 transition-colors cursor-pointer flex flex-col justify-between ${
                !day.isCurrentMonth
                  ? 'bg-black/20 text-gray-600 opacity-60'
                  : 'hover:bg-white/[0.04]'
              } ${
                day.isSelected
                  ? 'ring-2 ring-purple-500/80 bg-purple-950/20'
                  : ''
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    day.isToday
                      ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      : day.isCurrentMonth
                        ? 'text-gray-200'
                        : 'text-gray-500'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {day.events.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                    {day.events.length}
                  </span>
                )}
              </div>

              {/* Day Events Container */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {visibleEvents.map(event => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                    className={`w-full text-left px-1.5 py-1 rounded text-[11px] truncate flex items-center gap-1.5 border transition-transform hover:scale-[1.02] ${event.statusColor}`}
                  >
                    {getEventSmallIcon(event.type)}
                    <span className={`truncate font-medium ${event.textColor}`}>
                      {event.orderId}: {event.product}
                    </span>
                  </button>
                ))}

                {hiddenCount > 0 && (
                  <div className="text-[10px] text-gray-400 pl-1 font-medium">
                    +{hiddenCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
