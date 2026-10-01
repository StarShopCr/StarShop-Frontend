import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onPrevMonth, onNextMonth }) => {
  return (
    <div className="flex items-center justify-between p-4 mb-4 border border-white rounded-lg bg-transparent text-white">
      <button 
        type="button"
        onClick={onPrevMonth}
        aria-label="Previous month"
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <h2 className="text-xl font-bold">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <button 
        type="button"
        onClick={onNextMonth}
        aria-label="Next month"
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
