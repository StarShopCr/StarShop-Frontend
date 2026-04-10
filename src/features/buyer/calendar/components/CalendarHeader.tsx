'use client';

import { useCalendarStore } from '../hooks/useCalendar';
import type { CalendarViewMode } from '../types/calendar';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarHeader() {
  const {
    currentDate,
    viewMode,
    setViewMode,
    goToNextMonth,
    goToPrevMonth,
    goToNextWeek,
    goToPrevWeek,
    goToToday,
  } = useCalendarStore();

  const month = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const goBack = viewMode === 'monthly' ? goToPrevMonth : goToPrevWeek;
  const goForward = viewMode === 'monthly' ? goToNextMonth : goToNextWeek;

  const getWeekRange = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${start.getMonth() !== end.getMonth() ? MONTHS[end.getMonth()] + ' ' : ''}${end.getDate()}, ${end.getFullYear()}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={goBack}
          className="p-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          aria-label="Previous"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
          {viewMode === 'monthly' ? `${month} ${year}` : getWeekRange()}
        </h2>

        <button
          onClick={goForward}
          className="p-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          aria-label="Next"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
        {(['monthly', 'weekly'] as CalendarViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors capitalize ${
              viewMode === mode
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}
