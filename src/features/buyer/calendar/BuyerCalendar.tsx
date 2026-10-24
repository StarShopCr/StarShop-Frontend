'use client';

import React, { useState, useMemo } from 'react';
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
  // Base events combining relative dynamic generator and static orders
  const baseEvents = useMemo(() => {
    if (initialEvents) return initialEvents;
    const dynamic = generateMockEvents();
    // deduplicate by id
    const map = new Map<string, CalendarEvent>();
    for (const ev of [...dynamic, ...DEFAULT_MOCK_EVENTS]) {
      map.set(ev.id, ev);
    }
    return Array.from(map.values());
  }, [initialEvents]);

  const [currentDate, setCurrentDate] = useState<Date>(
    () => initialDate || new Date()
  );
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [statusFilter, setStatusFilter] = useState<CalendarFilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
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
    setSelectedDay(null);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSelectDay = (day: CalendarDay) => {
    setSelectedDay(prev => (prev?.dateString === day.dateString ? null : day));
  };

  // Compute matrix of days based on active view mode
  const days: CalendarDay[] = useMemo(() => {
    const selectedDateStr = selectedDay?.dateString;
    if (viewMode === 'month') {
      return getMonthMatrix(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        filteredEvents,
        selectedDateStr
      );
    } else {
      return getWeekDays(currentDate, filteredEvents, selectedDateStr);
    }
  }, [currentDate, viewMode, filteredEvents, selectedDay]);

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
      {selectedDay && (
        <div className="flex items-center justify-between bg-purple-950/30 border border-purple-500/30 rounded-xl px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-400" />
            <span className="text-white font-medium">
              Selected Day: {formatDisplayDate(selectedDay.dateString)}
            </span>
            <span className="text-gray-400">
              ({selectedDay.events.length} event(s))
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="flex items-center gap-1 text-xs text-purple-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear selection</span>
          </button>
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
