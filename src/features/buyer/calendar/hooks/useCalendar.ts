import { create } from 'zustand';
import type {
  CalendarState,
  CalendarEvent,
  CalendarDay,
  CalendarViewMode,
  OrderStatus,
} from '../types/calendar';

interface CalendarStore extends CalendarState {
  setViewMode: (mode: CalendarViewMode) => void;
  setCurrentDate: (date: Date) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
  selectDate: (date: Date | null) => void;
  selectEvent: (event: CalendarEvent | null) => void;
  setStatusFilter: (status: OrderStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  currentDate: new Date(),
  viewMode: 'monthly',
  selectedDate: null,
  selectedEvent: null,
  filters: {
    status: 'all',
    dateRange: { start: null, end: null },
    searchQuery: '',
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentDate: (date) => set({ currentDate: date }),

  goToNextMonth: () =>
    set((state) => {
      const next = new Date(state.currentDate);
      next.setMonth(next.getMonth() + 1);
      return { currentDate: next };
    }),

  goToPrevMonth: () =>
    set((state) => {
      const prev = new Date(state.currentDate);
      prev.setMonth(prev.getMonth() - 1);
      return { currentDate: prev };
    }),

  goToNextWeek: () =>
    set((state) => {
      const next = new Date(state.currentDate);
      next.setDate(next.getDate() + 7);
      return { currentDate: next };
    }),

  goToPrevWeek: () =>
    set((state) => {
      const prev = new Date(state.currentDate);
      prev.setDate(prev.getDate() - 7);
      return { currentDate: prev };
    }),

  goToToday: () => set({ currentDate: new Date() }),

  selectDate: (date) => set({ selectedDate: date }),
  selectEvent: (event) => set({ selectedEvent: event }),

  setStatusFilter: (status) =>
    set((state) => ({
      filters: { ...state.filters, status },
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setDateRange: (start, end) =>
    set((state) => ({
      filters: { ...state.filters, dateRange: { start, end } },
    })),
}));

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMonthDays(
  currentDate: Date,
  events: CalendarEvent[],
): CalendarDay[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();

  const days: CalendarDay[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: events.filter((e) => isSameDay(new Date(e.date), date)),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      events: events.filter((e) => isSameDay(new Date(e.date), date)),
    });
  }

  const remaining = 42 - days.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(nextYear, nextMonth, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: events.filter((e) => isSameDay(new Date(e.date), date)),
    });
  }

  return days;
}

export function getWeekDays(
  currentDate: Date,
  events: CalendarEvent[],
): CalendarDay[] {
  const today = new Date();
  const startOfWeek = getStartOfWeek(currentDate);
  const days: CalendarDay[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      isToday: isSameDay(date, today),
      events: events.filter((e) => isSameDay(new Date(e.date), date)),
    });
  }

  return days;
}

export function filterEvents(
  events: CalendarEvent[],
  filters: CalendarState['filters'],
): CalendarEvent[] {
  return events.filter((event) => {
    if (filters.status !== 'all' && event.status !== filters.status) {
      return false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(query);
      const matchesStore = event.storeName.toLowerCase().includes(query);
      const matchesOrder = event.orderId.toLowerCase().includes(query);
      if (!matchesTitle && !matchesStore && !matchesOrder) {
        return false;
      }
    }

    if (filters.dateRange.start) {
      if (new Date(event.date) < filters.dateRange.start) return false;
    }
    if (filters.dateRange.end) {
      if (new Date(event.date) > filters.dateRange.end) return false;
    }

    return true;
  });
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    orderId: 'ORD-2024-001',
    title: 'Wireless Headphones',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    type: 'order_placed',
    status: 'processing',
    storeName: 'TechZone',
    amount: 89.99,
  },
  {
    id: 'evt-2',
    orderId: 'ORD-2024-002',
    title: 'Running Shoes',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    type: 'shipped',
    status: 'shipped',
    storeName: 'SportMax',
    amount: 129.99,
  },
  {
    id: 'evt-3',
    orderId: 'ORD-2024-003',
    title: 'Coffee Maker',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    type: 'delivered',
    status: 'delivered',
    storeName: 'HomeGoods',
    amount: 54.99,
  },
  {
    id: 'evt-4',
    orderId: 'ORD-2024-004',
    title: 'Mechanical Keyboard',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
    type: 'delivered',
    status: 'delivered',
    storeName: 'TechZone',
    amount: 149.99,
  },
  {
    id: 'evt-5',
    orderId: 'ORD-2024-005',
    title: 'Smart Watch',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22),
    type: 'shipped',
    status: 'shipped',
    storeName: 'WearTech',
    amount: 299.99,
  },
  {
    id: 'evt-6',
    orderId: 'ORD-2024-006',
    title: 'Desk Lamp',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    type: 'order_placed',
    status: 'pending',
    storeName: 'HomeGoods',
    amount: 34.99,
  },
  {
    id: 'evt-7',
    orderId: 'ORD-2024-007',
    title: 'Cancelled Item',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
    type: 'cancelled',
    status: 'cancelled',
    storeName: 'ShopX',
    amount: 19.99,
  },
];

export function useMockEvents(): CalendarEvent[] {
  return MOCK_EVENTS;
}
