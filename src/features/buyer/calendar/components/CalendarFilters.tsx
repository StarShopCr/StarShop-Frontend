'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { CalendarFilterStatus } from '../types';

interface CalendarFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: CalendarFilterStatus;
  onStatusFilterChange: (status: CalendarFilterStatus) => void;
}

const STATUS_OPTIONS: { label: string; value: CalendarFilterStatus }[] = [
  { label: 'All Events', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
];

export function CalendarFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Search Bar */}
      <div className="relative flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by order ID, product, store, or tracking #..."
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm rounded-lg pl-10 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-3 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-1 hidden sm:flex">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
        </div>
        {STATUS_OPTIONS.map(opt => {
          const isActive = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusFilterChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isActive
                  ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
