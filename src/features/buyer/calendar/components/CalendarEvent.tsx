import React from 'react';
import { CalendarEvent } from '../types/calendar';

interface Props {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 border-yellow-500 text-yellow-200',
  shipped: 'bg-blue-500/20 border-blue-500 text-blue-200',
  delivered: 'bg-green-500/20 border-green-500 text-green-200',
  cancelled: 'bg-red-500/20 border-red-500 text-red-200',
};

export const CalendarEvent: React.FC<Props> = ({ event, onClick }) => {
  return (
    <div 
      onClick={() => onClick(event)}
      className={`text-[10px] p-1 mb-1 rounded border cursor-pointer truncate transition-transform hover:scale-105 ${statusColors[event.status] || 'bg-white/10 border-white text-white'}`}
    >
      {event.title}
    </div>
  );
};
