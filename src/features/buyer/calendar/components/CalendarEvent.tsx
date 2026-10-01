import React from 'react';
import { CalendarEvent } from '../types/calendar';

interface CalendarEventProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/50',
  shipped: 'bg-blue-500/50',
  delivered: 'bg-green-500/50',
  cancelled: 'bg-red-500/50',
};

export const CalendarEvent: React.FC<CalendarEventProps> = ({ event, onClick }) => {
  return (
    <button 
      type="button"
      onClick={() => onClick(event)}
      className={`w-full text-left text-[10px] p-1 mb-1 rounded cursor-pointer border border-white/30 truncate transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white ${statusColors[event.status] || 'bg-gray-500/50'}`}
    >
      {event.title}
    </button>
  );
};
