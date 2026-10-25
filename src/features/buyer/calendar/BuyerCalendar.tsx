'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CalendarEvent,
  CalendarDay,
  CalendarFilterStatus,
  CalendarViewMode,
} from './types';
import {
  getMonthMatrix,
  getWeekDays,
  filterCalendarEvents,
  calculateCalendarStats,
  formatDisplayDate,
} from './utils/calendarUtils';
import { generateMockEvents, DEFAULT_MOCK_EVENTS } from './constants/mockData';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarStatsCards } from './components/CalendarStatsCards';
import { CalendarFilters } from './components/CalendarFilters';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarWeekView } from './components/CalendarWeekView';
import { EventDetailsModal } from './components/EventDetailsModal';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface BuyerCalendarProps {
  initialEvents?: CalendarEvent[];
  initialDate?: Date;
}

export function BuyerCalendar({
  initialEvents,
  initialDate,
}: BuyerCalendarProps) {
  // Nullable initial date to prevent SSR flash of arbitrary reference date
  const [currentDate, setCurrentDate] = useState<Date | null>(
    () => initialDate || null
  );
  const [dynamicEvents, setDynamicEvents] = useState<CalendarEvent[] | null>(
    null
  );

  // Hydrate client date on mount when initialDate is omitted
  useEffect(() => {
    if (!initialDate) {
      setCurrentDate(new Date());
    }
  }, []);

  // Sync currentDate if initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  // Generate dynamic relative events if initialEvents is omitted,
  // reconciling with DEFAULT_MOCK_EVENTS to eliminate duplicate orderId/type events
  useEffect(() => {
    if (!initialEvents) {
      const dynamic = generateMockEvents(new Date());
      const dynamicKeys = new Set(
        dynamic.map(ev => `${ev.orderId}:${ev.type}`)
      );
      const nonOverlappingDefaults = DEFAULT_MOCK_EVENTS.filter(
        ev => !dynamicKeys.has(`${ev.orderId}:${ev.type}`)
      );
      setDynamicEvents([...dynamic, ...nonOverlappingDefaults]);
    }
  }, [initialEvents]);

  // Base events combining relative dynamic generator and static orders
  const baseEvents = useMemo(() => {
    if (initialEvents) return initialEvents;
    if (dynamicEvents) return dynamicEvents;
    return DEFAULT_MOCK_EVENTS;
  }, [initialEvents, dynamicEvents]);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [statusFilter, setStatusFilter] = useState<CalendarFilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateString, setSelectedDateString] = useState<string | null>(
    null
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return filterCalendarEvents(baseEvents, statusFilter, searchQuery);
  }, [baseEvents, statusFilter, searchQuery]);

  // Overall stats based on base events
  const stats = useMemo(() => {
    return calculateCalendarStats(baseEvents);
  }, [baseEvents]);

  // Month navigation handlers
  const handlePrev = () => {
    if (!currentDate) return;
    if (viewMode === 'month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7
        )
      );
    }
  };

  const handleNext = () => {
    if (!currentDate) return;
    if (viewMode === 'month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 7
        )
      );
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateString(null);
  };

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleSelectDay = useCallback((day: CalendarDay) => {
    setSelectedDateString(prev =>
      prev === day.dateString ? null : day.dateString
    );
  }, []);

  // Compute matrix of days based on active view mode and live filter state
  const days: CalendarDay[] = useMemo(() => {
    if (!currentDate) return [];
    if (viewMode === 'month') {
      return getMonthMatrix(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        filteredEvents,
        selectedDateString || undefined
      );
    } else {
      return getWeekDays(
        currentDate,
        filteredEvents,
        selectedDateString || undefined
      );
    }
  }, [currentDate, viewMode, filteredEvents, selectedDateString]);

  // Derive active selected day from days to reflect live filter counts and allow event selection
  const activeSelectedDay = useMemo(() => {
    if (!selectedDateString) return null;
    return days.find(d => d.dateString === selectedDateString) || null;
  }, [days, selectedDateString]);

  // Loading skeleton when currentDate has not yet hydrated
  if (!currentDate) {
    return (
      <div
        data-testid="calendar-skeleton"
        className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse"
      >
        <div className="h-14 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
        </div>
        <div className="h-14 bg-white/5 rounded-xl" />
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewModeChange={setViewMode}
      />

      {/* Metrics / Stats Cards */}
      <CalendarStatsCards stats={stats} />

      {/* Search & Filter Controls */}
      <CalendarFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Selected Day Banner if active */}
      {activeSelectedDay && (
        <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4 text-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">
                Selected Day: {formatDisplayDate(activeSelectedDay.dateString)}
              </span>
              <span className="text-gray-400">
                ({activeSelectedDay.events.length} event(s))
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDateString(null)}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear selection</span>
            </button>
          </div>
          {activeSelectedDay.events.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-purple-500/20">
              {activeSelectedDay.events.map(event => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelectEvent(event)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all hover:scale-105 ${event.statusColor} ${event.textColor}`}
                >
                  <span className="font-semibold">{event.orderId}</span> -{' '}
                  {event.product}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Calendar View (Month or Week) */}
      {viewMode === 'month' ? (
        <CalendarGrid
          days={days}
          onSelectEvent={handleSelectEvent}
          onSelectDay={handleSelectDay}
        />
      ) : (
        <CalendarWeekView
          days={days}
          onSelectEvent={handleSelectEvent}
          onSelectDay={handleSelectDay}
        />
      )}

      {/* Event Details Dialog Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default BuyerCalendar;
