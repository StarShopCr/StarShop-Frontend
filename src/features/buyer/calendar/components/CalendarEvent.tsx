'use client';

import { EVENT_COLORS, EVENT_TYPE_LABELS } from '../types/calendar';
import type { CalendarEvent as CalendarEventType } from '../types/calendar';
import { useCalendarStore } from '../hooks/useCalendar';

interface CalendarEventProps {
  event: CalendarEventType;
  compact?: boolean;
}

export function CalendarEvent({ event, compact = false }: CalendarEventProps) {
  const { selectEvent } = useCalendarStore();
  const colors = EVENT_COLORS[event.type];

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          selectEvent(event);
        }}
        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
      >
        {event.title}
      </button>
    );
  }

  return (
    <button
      onClick={() => selectEvent(event)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg ${colors.bg} hover:opacity-80 transition-opacity text-left`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${colors.text}`}>{event.title}</p>
        <p className="text-xs text-gray-400 truncate">
          {event.storeName} &middot; {EVENT_TYPE_LABELS[event.type]}
        </p>
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">
        ${event.amount.toFixed(2)}
      </span>
    </button>
  );
}
