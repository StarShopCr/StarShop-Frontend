'use client';

import { useCalendarStore } from '../hooks/useCalendar';
import { STATUS_LABELS } from '../types/calendar';
import type { OrderStatus } from '../types/calendar';

const ALL_STATUSES: (OrderStatus | 'all')[] = [
  'all',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export function CalendarFilters() {
  const { filters, setStatusFilter, setSearchQuery } = useCalendarStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search orders..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
              filters.status === status
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>
    </div>
  );
}
