import React from 'react';
import { CalendarFilterState, OrderStatus } from '../types/calendar';
import { format } from 'date-fns';

interface CalendarFiltersProps {
  filters: CalendarFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CalendarFilterState>>;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({ filters, setFilters }) => {
  const statuses: OrderStatus[] = ['pending', 'shipped', 'delivered', 'cancelled'];

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newStart = val ? new Date(val + 'T00:00:00') : null;
    setFilters((prev) => {
      if (newStart && prev.dateRange.end && newStart > prev.dateRange.end) {
        return { ...prev, dateRange: { start: newStart, end: newStart } };
      }
      return { ...prev, dateRange: { ...prev.dateRange, start: newStart } };
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newEnd = val ? new Date(val + 'T23:59:59') : null;
    setFilters((prev) => {
      if (newEnd && prev.dateRange.start && newEnd < prev.dateRange.start) {
        return { ...prev, dateRange: { start: newEnd, end: newEnd } };
      }
      return { ...prev, dateRange: { ...prev.dateRange, end: newEnd } };
    });
  };

  const clearDateRange = () => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { start: null, end: null },
    }));
  };

  const startVal = filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : '';
  const endVal = filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : '';

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 mb-4 border border-white rounded-lg bg-transparent text-white">
      {/* Status Selector */}
      <div className="flex flex-col gap-2">
        <label htmlFor="calendar-status-filter" className="text-xs uppercase opacity-70">
          Filter by Status
        </label>
        <select 
          id="calendar-status-filter"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as OrderStatus | 'all' })}
          className="bg-transparent border border-white rounded px-2 py-1 outline-none focus:ring-1 ring-white"
        >
          <option value="all" className="text-black">All Statuses</option>
          {statuses.map(s => (
            <option key={s} value={s} className="text-black">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Date Range Start */}
      <div className="flex flex-col gap-2">
        <label htmlFor="calendar-start-date" className="text-xs uppercase opacity-70">
          Start Date
        </label>
        <input 
          id="calendar-start-date"
          type="date"
          value={startVal}
          onChange={handleStartDateChange}
          className="bg-transparent border border-white rounded px-2 py-1 outline-none focus:ring-1 ring-white text-white [color-scheme:dark]"
        />
      </div>

      {/* Date Range End */}
      <div className="flex flex-col gap-2">
        <label htmlFor="calendar-end-date" className="text-xs uppercase opacity-70">
          End Date
        </label>
        <input 
          id="calendar-end-date"
          type="date"
          value={endVal}
          onChange={handleEndDateChange}
          className="bg-transparent border border-white rounded px-2 py-1 outline-none focus:ring-1 ring-white text-white [color-scheme:dark]"
        />
      </div>

      {/* Clear Button */}
      {(filters.dateRange.start || filters.dateRange.end) && (
        <button
          type="button"
          onClick={clearDateRange}
          className="text-xs px-3 py-1.5 border border-white/50 rounded hover:bg-white/10 transition-colors"
        >
          Clear Dates
        </button>
      )}
    </div>
  );
};
