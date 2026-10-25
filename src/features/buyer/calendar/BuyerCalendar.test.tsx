/* eslint-disable @typescript-eslint/no-explicit-any */
import './test-dom-setup';
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  formatDate,
  parseDate,
  isSameDay,
  formatMonthYear,
  formatDisplayDate,
  getStatusTheme,
  getMonthMatrix,
  getWeekDays,
  filterCalendarEvents,
  calculateCalendarStats,
} from './utils/calendarUtils';
import { generateMockEvents, DEFAULT_MOCK_EVENTS } from './constants/mockData';
import { BuyerCalendar } from './BuyerCalendar';
import { CalendarEvent } from './types';

describe('Buyer Activity Calendar - Unit & Integration Tests', () => {
  const sampleEvents: CalendarEvent[] = [
    {
      id: 'test-ev-1',
      orderId: 'ORD-101',
      product: 'Stellar Cyber Hoodie',
      store: 'Cyber Store',
      type: 'order_placed',
      title: 'Order Placed: Stellar Cyber Hoodie',
      date: '2026-10-15',
      time: '10:00 UTC',
      status: 'Pending',
      statusColor: 'bg-amber-600/10 border border-amber-300/30',
      textColor: 'text-amber-300',
      total: '80 XLM',
      eta: 'October 20, 2026',
      trackingNumber: 'TRK-101-AAA',
      carrier: 'Stellar Express',
      destination: '123 Main St',
      itemsCount: 1,
    },
    {
      id: 'test-ev-2',
      orderId: 'ORD-102',
      product: 'Stellar Neon Cap',
      store: 'Neon Gear',
      type: 'delivery_expected',
      title: 'Expected Delivery: Stellar Neon Cap',
      date: '2026-10-20',
      time: '14:00 UTC',
      status: 'Shipped',
      statusColor: 'bg-blue-600/10 border border-blue-300/30',
      textColor: 'text-blue-300',
      total: '25 XLM',
      eta: 'Out for delivery',
      trackingNumber: 'TRK-102-BBB',
      carrier: 'DHL Express',
      destination: '123 Main St',
      itemsCount: 2,
    },
    {
      id: 'test-ev-3',
      orderId: 'ORD-103',
      product: 'Crypto Hardware Key',
      store: 'Security Hub',
      type: 'delivery_completed',
      title: 'Delivered: Crypto Hardware Key',
      date: '2026-10-10',
      time: '11:30 UTC',
      status: 'Delivered',
      statusColor: 'bg-green-600/10 border border-green-300/30',
      textColor: 'text-green-300',
      total: '150 XLM',
      eta: 'Delivered on Oct 10',
      trackingNumber: 'TRK-103-CCC',
      carrier: 'FedEx',
      destination: '123 Main St',
      itemsCount: 1,
    },
    {
      id: 'test-ev-4',
      orderId: 'ORD-104',
      product: 'Smart Desk Mat',
      store: 'Neo Workspace',
      type: 'order_placed',
      title: 'Order Placed: Smart Desk Mat',
      date: '2026-10-18',
      time: '16:00 UTC',
      status: 'Processing',
      statusColor: 'bg-yellow-600/10 border border-yellow-300/30',
      textColor: 'text-yellow-300',
      total: '45 XLM',
      eta: 'Ships in 24h',
      trackingNumber: 'TRK-104-DDD',
      carrier: 'StarPost',
      destination: '123 Main St',
      itemsCount: 1,
    },
  ];

  describe('Date & Formatting Utilities', () => {
    it('formatDate should format a Date object as YYYY-MM-DD', () => {
      const date = new Date(2026, 9, 24); // Month is 0-indexed (9 = Oct)
      assert.strictEqual(formatDate(date), '2026-10-24');
    });

    it('parseDate should parse YYYY-MM-DD into a local Date object', () => {
      const parsed = parseDate('2026-10-24');
      assert.strictEqual(parsed.getFullYear(), 2026);
      assert.strictEqual(parsed.getMonth(), 9);
      assert.strictEqual(parsed.getDate(), 24);
    });

    it('isSameDay should accurately identify identical days', () => {
      const d1 = new Date(2026, 9, 24, 10, 0, 0);
      const d2 = new Date(2026, 9, 24, 22, 30, 0);
      const d3 = new Date(2026, 9, 25, 10, 0, 0);
      assert.strictEqual(isSameDay(d1, d2), true);
      assert.strictEqual(isSameDay(d1, d3), false);
    });

    it('formatMonthYear should format correctly', () => {
      const date = new Date(2026, 9, 1);
      assert.strictEqual(formatMonthYear(date), 'October 2026');
    });

    it('formatDisplayDate should format YYYY-MM-DD to human readable string', () => {
      assert.strictEqual(formatDisplayDate('2026-10-24'), 'Oct 24, 2026');
      assert.strictEqual(formatDisplayDate(''), '');
    });

    it('getStatusTheme should return matching theme classes for each OrderStatus', () => {
      const delivered = getStatusTheme('Delivered');
      assert.ok(delivered.statusColor.includes('green'));
      assert.ok(delivered.textColor.includes('green'));

      const shipped = getStatusTheme('Shipped');
      assert.ok(shipped.statusColor.includes('blue'));

      const pending = getStatusTheme('Pending');
      assert.ok(pending.statusColor.includes('amber'));

      const processing = getStatusTheme('Processing');
      assert.ok(processing.statusColor.includes('yellow'));

      const cancelled = getStatusTheme('Cancelled');
      assert.ok(cancelled.statusColor.includes('red'));
    });
  });

  describe('Month Matrix & Week Matrix Generation', () => {
    it('getMonthMatrix should return 42 cells covering 6 full weeks', () => {
      const days = getMonthMatrix(
        2026,
        9,
        sampleEvents,
        '2026-10-15',
        '2026-10-24'
      );
      assert.strictEqual(days.length, 42);

      // Verify that days in current month have isCurrentMonth === true
      const currentMonthDays = days.filter(d => d.isCurrentMonth);
      assert.strictEqual(currentMonthDays.length, 31); // October has 31 days

      // Verify selected day
      const selected = days.find(d => d.dateString === '2026-10-15');
      assert.ok(selected);
      assert.strictEqual(selected.isSelected, true);

      // Verify today indicator
      const today = days.find(d => d.dateString === '2026-10-24');
      assert.ok(today);
      assert.strictEqual(today.isToday, true);

      // Verify events mapped to correct day
      assert.strictEqual(selected.events.length, 1);
      assert.strictEqual(selected.events[0].orderId, 'ORD-101');
    });

    it('getWeekDays should return 7 days starting from Sunday', () => {
      const centerDate = new Date(2026, 9, 21); // Wednesday Oct 21, 2026
      const week = getWeekDays(centerDate, sampleEvents, '2026-10-20');

      assert.strictEqual(week.length, 7);
      assert.strictEqual(week[0].date.getDay(), 0); // Sunday
      assert.strictEqual(week[6].date.getDay(), 6); // Saturday

      // Tuesday Oct 20 should have ORD-102
      const oct20 = week.find(d => d.dateString === '2026-10-20');
      assert.ok(oct20);
      assert.strictEqual(oct20.events.length, 1);
      assert.strictEqual(oct20.events[0].orderId, 'ORD-102');
      assert.strictEqual(oct20.isSelected, true);
    });
  });

  describe('Filtering and Statistics Logic', () => {
    it('filterCalendarEvents with All returns all items', () => {
      const filtered = filterCalendarEvents(sampleEvents, 'All', '');
      assert.strictEqual(filtered.length, 4);
    });

    it('filterCalendarEvents should filter by status accurately', () => {
      const pending = filterCalendarEvents(sampleEvents, 'Pending', '');
      assert.strictEqual(pending.length, 1);
      assert.strictEqual(pending[0].orderId, 'ORD-101');

      const shipped = filterCalendarEvents(sampleEvents, 'Shipped', '');
      assert.strictEqual(shipped.length, 1);
      assert.strictEqual(shipped[0].orderId, 'ORD-102');

      const delivered = filterCalendarEvents(sampleEvents, 'Delivered', '');
      assert.strictEqual(delivered.length, 1);
      assert.strictEqual(delivered[0].orderId, 'ORD-103');

      const processing = filterCalendarEvents(sampleEvents, 'Processing', '');
      assert.strictEqual(processing.length, 1);
      assert.strictEqual(processing[0].orderId, 'ORD-104');
    });

    it('filterCalendarEvents should filter by search query across fields', () => {
      const byProduct = filterCalendarEvents(sampleEvents, 'All', 'Hoodie');
      assert.strictEqual(byProduct.length, 1);
      assert.strictEqual(byProduct[0].orderId, 'ORD-101');

      const byStore = filterCalendarEvents(sampleEvents, 'All', 'Neon Gear');
      assert.strictEqual(byStore.length, 1);
      assert.strictEqual(byStore[0].orderId, 'ORD-102');

      const byTracking = filterCalendarEvents(sampleEvents, 'All', 'TRK-103');
      assert.strictEqual(byTracking.length, 1);
      assert.strictEqual(byTracking[0].orderId, 'ORD-103');

      const noMatch = filterCalendarEvents(
        sampleEvents,
        'All',
        'NonExistentProduct'
      );
      assert.strictEqual(noMatch.length, 0);
    });

    it('calculateCalendarStats should correctly aggregate counts', () => {
      const stats = calculateCalendarStats(sampleEvents);
      assert.strictEqual(stats.totalEvents, 4);
      assert.strictEqual(stats.pendingCount, 2); // Pending (ORD-101) + Processing (ORD-104)
      assert.strictEqual(stats.shippedCount, 1); // Shipped (ORD-102)
      assert.strictEqual(stats.deliveredCount, 1); // Delivered (ORD-103)
    });

    it('generateMockEvents should generate non-empty list of valid events', () => {
      const events = generateMockEvents(new Date(2026, 9, 24));
      assert.ok(events.length >= 5);
      for (const ev of events) {
        assert.ok(ev.id);
        assert.ok(ev.orderId);
        assert.ok(ev.product);
        assert.ok(ev.date);
        assert.ok(ev.status);
      }
    });

    it('deduplicates mock events by orderId and type against DEFAULT_MOCK_EVENTS', () => {
      const dynamic = generateMockEvents(new Date());
      const dynamicKeys = new Set(
        dynamic.map(ev => `${ev.orderId}:${ev.type}`)
      );
      const nonOverlappingDefaults = DEFAULT_MOCK_EVENTS.filter(
        ev => !dynamicKeys.has(`${ev.orderId}:${ev.type}`)
      );
      const combined = [...dynamic, ...nonOverlappingDefaults];

      const seenKeys = new Set<string>();
      for (const ev of combined) {
        const key = `${ev.orderId}:${ev.type}`;
        assert.strictEqual(
          seenKeys.has(key),
          false,
          `Duplicate event orderId:type detected: ${key}`
        );
        seenKeys.add(key);
      }
    });
  });

  describe('Component Rendering and Interactivity', () => {
    afterEach(() => {
      cleanup();
      document.body.innerHTML = '';
    });

    it('renders the BuyerCalendar with initial date and header', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      const headerTitle = screen.getByText('Buyer Activity Calendar');
      assert.ok(headerTitle);

      const monthLabel = screen.getByTestId('calendar-current-month');
      assert.strictEqual(monthLabel.textContent, 'October 2026');

      // Check stats cards are rendered
      assert.ok(screen.getByText('Total Scheduled Events'));
      assert.ok(screen.getByText('In Transit / Shipped'));
      assert.ok(screen.getByText('Delivered Packages'));
      assert.ok(screen.getByText('Pending & Processing'));
    });

    it('navigates to next and previous months when buttons are clicked', () => {
      const fixedDate = new Date(2026, 9, 24); // Oct 2026
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      const monthLabel = screen.getByTestId('calendar-current-month');
      assert.strictEqual(monthLabel.textContent, 'October 2026');

      // Click Next
      const nextBtn = screen.getByLabelText('Next Month');
      fireEvent.click(nextBtn);
      assert.strictEqual(monthLabel.textContent, 'November 2026');

      // Click Prev twice
      const prevBtn = screen.getByLabelText('Previous Month');
      fireEvent.click(prevBtn);
      assert.strictEqual(monthLabel.textContent, 'October 2026');
      fireEvent.click(prevBtn);
      assert.strictEqual(monthLabel.textContent, 'September 2026');

      // Click Today
      const todayBtn = screen.getByText('Today');
      fireEvent.click(todayBtn);
      const today = new Date();
      assert.strictEqual(monthLabel.textContent, formatMonthYear(today));
    });

    it('switches between Month and Week views', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      const weekBtn = screen.getByRole('button', { name: 'Week' });
      fireEvent.click(weekBtn);

      // In week view, weekdays should appear (e.g. Sunday or Sun)
      assert.ok(screen.getByText('Sun'));
      assert.ok(screen.getByText('Mon'));

      const monthBtn = screen.getByRole('button', { name: 'Month' });
      fireEvent.click(monthBtn);
      assert.ok(screen.getByTestId('calendar-current-month'));
    });

    it('filters events when status pills are clicked', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      // Check delivered filter
      const deliveredFilterBtn = screen.getByRole('button', {
        name: /^Delivered$/i,
      });
      fireEvent.click(deliveredFilterBtn);

      // Only ORD-103 should be displayed
      assert.ok(screen.getByText(/ORD-103/i));
    });

    it('opens event details modal when an event is clicked and closes on close button', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      // Find event chip
      const eventChips = screen.getAllByText(/ORD-101/i);
      fireEvent.click(eventChips[0]);

      // Modal dialog should be opened with modal-title ORD-101
      const modalTitle = screen.getByRole('heading', { name: 'ORD-101' });
      assert.ok(modalTitle);
      assert.ok(screen.getByText('Stellar Cyber Hoodie'));
      assert.ok(screen.getByText('TRK-101-AAA'));

      // Close modal
      const closeBtn = screen.getByLabelText('Close details');
      fireEvent.click(closeBtn);

      // Modal should no longer be present
      assert.strictEqual(
        screen.queryByRole('heading', { name: 'ORD-101' }),
        null
      );
    });

    it('filters events when search input changes and clears when cleared', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      const searchInput = screen.getByPlaceholderText(
        /Search by order ID, product/i
      );
      fireEvent.change(searchInput, { target: { value: 'Cap' } });

      // Only ORD-102 (Neon Cap) should be present
      assert.ok(screen.getByText(/ORD-102/i));

      // Clear search
      const clearBtn = screen.getByLabelText('Clear search');
      fireEvent.click(clearBtn);
      assert.strictEqual((searchInput as HTMLInputElement).value, '');
    });

    it('closes modal on Escape key press', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      const eventChips = screen.getAllByText(/ORD-101/i);
      fireEvent.click(eventChips[0]);
      assert.ok(screen.getByRole('heading', { name: 'ORD-101' }));

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      assert.strictEqual(
        screen.queryByRole('heading', { name: 'ORD-101' }),
        null
      );
    });

    it('toggles selected day banner when a day cell is clicked', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      // Click on day number 15
      const day15Number = screen.getAllByText('15')[0];
      fireEvent.click(day15Number.closest('div[class*="min-h"]')!);

      // Banner should be visible
      assert.ok(screen.getByText(/Selected Day:/i));

      // Click "Clear selection"
      const clearBtn = screen.getByText('Clear selection');
      fireEvent.click(clearBtn);

      // Banner should be removed
      assert.strictEqual(screen.queryByText(/Selected Day:/i), null);
    });

    it('displays and interacts with events in Week view', () => {
      const fixedDate = new Date(2026, 9, 20); // Tuesday Oct 20
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      // Switch to week view
      const weekBtn = screen.getByRole('button', { name: 'Week' });
      fireEvent.click(weekBtn);

      // ORD-102 is on Oct 20
      const weekEvent = screen.getByText('ORD-102');
      fireEvent.click(weekEvent);

      // Modal should open for ORD-102
      assert.ok(screen.getByRole('heading', { name: 'ORD-102' }));
      assert.ok(screen.getAllByText('Stellar Neon Cap').length >= 1);

      // Close modal
      const closeBtn = screen.getByLabelText('Close details');
      fireEvent.click(closeBtn);
      assert.strictEqual(
        screen.queryByRole('heading', { name: 'ORD-102' }),
        null
      );
    });

    it('renders BuyerCalendar cleanly without props (SSR hydration safe)', () => {
      render(<BuyerCalendar />);
      assert.ok(screen.getByText('Buyer Activity Calendar'));
      assert.ok(screen.getByRole('button', { name: 'Month' }));
    });

    it('allows opening modal by clicking an event pill inside the selected day banner', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      // Click on day number 15 (which has ORD-101)
      const day15Number = screen.getAllByText('15')[0];
      fireEvent.click(day15Number.closest('div[class*="min-h"]')!);

      // Banner is visible
      assert.ok(screen.getByText(/Selected Day:/i));

      // Click the banner event pill
      const bannerPill = screen.getByRole('button', {
        name: /ORD-101 - Stellar Cyber Hoodie/i,
      });
      fireEvent.click(bannerPill);

      // Modal opens
      assert.ok(screen.getByRole('heading', { name: 'ORD-101' }));
    });

    it('updates selected day event count dynamically when status filter changes', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      // Click on day 15 (which has 1 event: ORD-101 with status 'Pending')
      const day15Number = screen.getAllByText('15')[0];
      fireEvent.click(day15Number.closest('div[class*="min-h"]')!);

      // Initially shows (1 event(s))
      assert.ok(screen.getByText('(1 event(s))'));

      // Filter by 'Delivered' (ORD-101 is 'Pending')
      const deliveredFilterBtn = screen.getByRole('button', {
        name: /Delivered/i,
      });
      fireEvent.click(deliveredFilterBtn);

      // Count in banner updates to (0 event(s))
      assert.ok(screen.getByText('(0 event(s))'));
    });

    it('manages focus and cycles focus inside EventDetailsModal', () => {
      const fixedDate = new Date(2026, 9, 24);
      render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      const triggerBtn = screen.getAllByText(/ORD-101/i)[0].closest('button')!;
      triggerBtn.focus();
      assert.strictEqual(document.activeElement, triggerBtn);

      fireEvent.click(triggerBtn);

      // Modal opens and focus shifts to close button
      const closeBtn = screen.getByLabelText('Close details');
      assert.strictEqual(document.activeElement, closeBtn);

      // Escape closes modal and restores focus
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      assert.strictEqual(
        screen.queryByRole('heading', { name: 'ORD-101' }),
        null
      );
      assert.strictEqual(document.activeElement, triggerBtn);
    });

    it('preserves user navigated month when initialEvents prop updates', () => {
      const fixedDate = new Date(2026, 9, 24); // October 2026
      const { rerender } = render(
        <BuyerCalendar initialDate={fixedDate} initialEvents={sampleEvents} />
      );

      // Verify header shows October 2026
      assert.ok(screen.getByText('October 2026'));

      // Navigate to November 2026
      const nextBtn = screen.getByLabelText('Next Month');
      fireEvent.click(nextBtn);
      assert.ok(screen.getByText('November 2026'));

      // Rerender with updated initialEvents prop
      rerender(
        <BuyerCalendar
          initialDate={fixedDate}
          initialEvents={[...sampleEvents]}
        />
      );

      // User's navigated month (November 2026) must NOT be reset to October
      assert.ok(screen.getByText('November 2026'));
    });
  });
});
