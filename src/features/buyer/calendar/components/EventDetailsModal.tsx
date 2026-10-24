'use client';

import React, { useEffect } from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { formatDisplayDate } from '../utils/calendarUtils';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const getEventIcon = () => {
    switch (event.type) {
      case 'delivery_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'delivery_expected':
        return <Truck className="w-5 h-5 text-blue-400" />;
      default:
        return <Package className="w-5 h-5 text-purple-400" />;
    }
  };

  const getEventTypeLabel = () => {
    switch (event.type) {
      case 'delivery_completed':
        return 'Delivered Order';
      case 'delivery_expected':
        return 'Expected Delivery';
      default:
        return 'Order Placement';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#12111A] border border-white/20 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Top glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {getEventIcon()}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                {getEventTypeLabel()}
              </span>
              <h2 id="modal-title" className="text-xl font-bold text-white">
                {event.orderId}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-sm">
          {/* Product & Store Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-base">
                  {event.product}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{event.store}</p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${event.statusColor} ${event.textColor}`}
              >
                {event.status}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date & Time</span>
              </div>
              <p className="text-white font-medium text-xs sm:text-sm">
                {formatDisplayDate(event.date)}
              </p>
              {event.time && (
                <p className="text-gray-400 text-xs mt-0.5">{event.time}</p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Total Amount</span>
              </div>
              <p className="text-white font-medium text-xs sm:text-sm">
                {event.total}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {event.itemsCount || 1} item(s)
              </p>
            </div>
          </div>

          {/* Delivery & Tracking */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Carrier / Tracking</span>
              </span>
              <span className="text-white font-mono">
                {event.trackingNumber || 'N/A'}
              </span>
            </div>
            {event.carrier && (
              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-gray-400">Carrier Service</span>
                <span className="text-gray-200">{event.carrier}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>ETA Info</span>
              </span>
              <span className="text-purple-300 font-medium">{event.eta}</span>
            </div>
            {event.destination && (
              <div className="flex items-start justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Destination</span>
                </span>
                <span className="text-gray-300 text-right max-w-[220px]">
                  {event.destination}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            Close
          </button>
          <a
            href={`/buyer/orders`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <span>View Full Order</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
