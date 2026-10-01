import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onPrevMonth, onNextMonth }) => {
  return (
    <div className="flex items-center justify-between p-4 mb-4 border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <div className="flex gap-2">
        <button 
          onClick={onPrevMonth}
          className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={onNextMonth}
          className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
