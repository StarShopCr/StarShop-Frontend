import {
  CalendarDay,
  CalendarEvent,
  CalendarFilterStatus,
  CalendarStats,
  OrderStatus,
} from '../types';

/**
 * Format a Date object to 'YYYY-MM-DD' using local year, month, and day.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a 'YYYY-MM-DD' string to a local Date object.
 */
export function parseDate(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day);
}

/**
 * Check if two dates represent the exact same calendar day.
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Format a Date to 'Month Year', e.g. 'October 2026'.
 */
export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format 'YYYY-MM-DD' to readable text, e.g. 'Oct 24, 2026'.
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const monthShort = MONTH_NAMES[date.getMonth()].slice(0, 3);
  return `${monthShort} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Get status color mappings matching StarShop neon theme.
 */
export function getStatusTheme(status: OrderStatus): {
  statusColor: string;
  textColor: string;
  dotColor: string;
} {
  switch (status) {
    case 'Delivered':
      return {
        statusColor: 'bg-green-600/10 border border-green-300/30',
        textColor: 'text-green-300',
        dotColor: 'bg-green-400',
      };
    case 'Shipped':
      return {
        statusColor: 'bg-blue-600/10 border border-blue-300/30',
        textColor: 'text-blue-300',
        dotColor: 'bg-blue-400',
      };
    case 'Processing':
      return {
        statusColor: 'bg-yellow-600/10 border border-yellow-300/30',
        textColor: 'text-yellow-300',
        dotColor: 'bg-yellow-400',
      };
    case 'Pending':
      return {
        statusColor: 'bg-amber-600/10 border border-amber-300/30',
        textColor: 'text-amber-300',
        dotColor: 'bg-amber-400',
      };
    case 'Cancelled':
      return {
        statusColor: 'bg-red-600/10 border border-red-300/30',
        textColor: 'text-red-300',
        dotColor: 'bg-red-400',
      };
    default:
      return {
        statusColor: 'bg-white/10 border border-white/20',
        textColor: 'text-gray-300',
        dotColor: 'bg-gray-400',
      };
  }
}

/**
 * Build 42 grid cells (6 full weeks, Sunday to Saturday) for the given month.
 */
export function getMonthMatrix(
  year: number,
  month: number,
  events: CalendarEvent[],
  selectedDateStr?: string,
  todayDateStr?: string
): CalendarDay[] {
  const todayStr = todayDateStr || formatDate(new Date());
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Total days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Map events by dateString for O(1) lookup
  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const list = eventsByDate.get(event.date) || [];
    list.push(event);
    eventsByDate.set(event.date, list);
  }

  const days: CalendarDay[] = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNum);
    const dateString = formatDate(date);
    days.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: Boolean(selectedDateStr && dateString === selectedDateStr),
      events: eventsByDate.get(dateString) || [],
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const date = new Date(year, month, dayNum);
    const dateString = formatDate(date);
    days.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      isSelected: Boolean(selectedDateStr && dateString === selectedDateStr),
      events: eventsByDate.get(dateString) || [],
    });
  }

  // Next month padding to fill up to 42 cells (6 rows x 7 days)
  const remainingCells = 42 - days.length;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const date = new Date(year, month + 1, dayNum);
    const dateString = formatDate(date);
    days.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: Boolean(selectedDateStr && dateString === selectedDateStr),
      events: eventsByDate.get(dateString) || [],
    });
  }

  return days;
}

/**
 * Build 7 days for the week containing centerDate (Sunday to Saturday).
 */
export function getWeekDays(
  centerDate: Date,
  events: CalendarEvent[],
  selectedDateStr?: string,
  todayDateStr?: string
): CalendarDay[] {
  const todayStr = todayDateStr || formatDate(new Date());
  const dayOfWeek = centerDate.getDay(); // 0 = Sunday
  const sunday = new Date(
    centerDate.getFullYear(),
    centerDate.getMonth(),
    centerDate.getDate() - dayOfWeek
  );

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const list = eventsByDate.get(event.date) || [];
    list.push(event);
    eventsByDate.set(event.date, list);
  }

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(
      sunday.getFullYear(),
      sunday.getMonth(),
      sunday.getDate() + i
    );
    const dateString = formatDate(date);
    days.push({
      date,
      dateString,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === centerDate.getMonth(),
      isToday: dateString === todayStr,
      isSelected: Boolean(selectedDateStr && dateString === selectedDateStr),
      events: eventsByDate.get(dateString) || [],
    });
  }

  return days;
}

/**
 * Filter events based on status and search query.
 */
export function filterCalendarEvents(
  events: CalendarEvent[],
  statusFilter: CalendarFilterStatus,
  searchQuery: string = ''
): CalendarEvent[] {
  const query = searchQuery.trim().toLowerCase();

  return events.filter(event => {
    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending' && event.status !== 'Pending') {
        return false;
      }
      if (statusFilter === 'Processing' && event.status !== 'Processing') {
        return false;
      }
      if (statusFilter === 'Shipped' && event.status !== 'Shipped') {
        return false;
      }
      if (statusFilter === 'Delivered' && event.status !== 'Delivered') {
        return false;
      }
    }

    // Search query filter
    if (query) {
      const matchProduct = event.product.toLowerCase().includes(query);
      const matchStore = event.store.toLowerCase().includes(query);
      const matchOrder = event.orderId.toLowerCase().includes(query);
      const matchTracking = event.trackingNumber?.toLowerCase().includes(query);
      if (!matchProduct && !matchStore && !matchOrder && !matchTracking) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate summary metrics for the calendar header stats.
 */
export function calculateCalendarStats(events: CalendarEvent[]): CalendarStats {
  let pendingCount = 0;
  let shippedCount = 0;
  let deliveredCount = 0;

  for (const event of events) {
    if (event.status === 'Pending' || event.status === 'Processing') {
      pendingCount++;
    } else if (event.status === 'Shipped') {
      shippedCount++;
    } else if (event.status === 'Delivered') {
      deliveredCount++;
    }
  }

  return {
    totalEvents: events.length,
    pendingCount,
    shippedCount,
    deliveredCount,
  };
}
