import React from 'react';
import { CalendarEvent } from '../types/calendar';
import { X, Package, Calendar as CalendarIcon } from 'lucide-react';

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
}

export const EventDetails: React.FC<Props> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 border border-white/30 rounded-2xl bg-slate-900/80 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white/10">
            <Package size={24} />
          </div>
          <h3 className="text-xl font-bold">{event.title}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/70">
            <CalendarIcon size={16} />
            <span>{event.date.toLocaleDateString()}</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm leading-relaxed">{event.details}</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-bold opacity-60">Order ID: {event.orderId}</span>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
              event.status === 'delivered' ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'
            }`}>
              {event.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
