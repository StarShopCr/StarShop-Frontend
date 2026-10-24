'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
} from 'lucide-react';
import { CalendarViewMode } from '../types';
import { formatMonthYear } from '../utils/calendarUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Buyer Activity Calendar
            </h1>
            <p className="text-sm text-gray-400">
              Track incoming deliveries, dispatch milestones, and order history
            </p>
          </div>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous Month"
            className="p-1.5 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span
            data-testid="calendar-current-month"
            className="text-sm sm:text-base font-semibold text-white px-3 min-w-[140px] text-center"
          >
            {formatMonthYear(currentDate)}
          </span>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next Month"
            className="p-1.5 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Today Button */}
        <button
          type="button"
          onClick={onToday}
          className="px-3.5 py-2 text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors"
        >
          Today
        </button>

        {/* View Switcher (Month / Week) */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onViewModeChange('month')}
            aria-pressed={viewMode === 'month'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Month</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('week')}
            aria-pressed={viewMode === 'week'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Week</span>
          </button>
        </div>
      </div>
    </div>
  );
}
