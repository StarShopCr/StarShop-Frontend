'use client';

import { useCalendarStore } from '../hooks/useCalendar';
import { EVENT_COLORS, EVENT_TYPE_LABELS, STATUS_LABELS } from '../types/calendar';

export function EventDetails() {
  const { selectedEvent, selectEvent } = useCalendarStore();

  if (!selectedEvent) return null;

  const colors = EVENT_COLORS[selectedEvent.type];
  const eventDate = new Date(selectedEvent.date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => selectEvent(null)}
    >
      <div
        className="bg-[#1a1a2e] border border-white/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
            <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
          </div>
          <button
            onClick={() => selectEvent(null)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-gray-400">Order ID</span>
            <span className="text-sm text-white font-mono">{selectedEvent.orderId}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-gray-400">Store</span>
            <span className="text-sm text-white">{selectedEvent.storeName}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-gray-400">Date</span>
            <span className="text-sm text-white">
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-gray-400">Event Type</span>
            <span className={`text-sm px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {EVENT_TYPE_LABELS[selectedEvent.type]}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-gray-400">Status</span>
            <span className="text-sm text-white capitalize">
              {STATUS_LABELS[selectedEvent.status]}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-400">Amount</span>
            <span className="text-lg font-semibold text-white">
              ${selectedEvent.amount.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={() => selectEvent(null)}
          className="w-full mt-6 px-4 py-2.5 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
