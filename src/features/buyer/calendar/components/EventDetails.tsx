import React from 'react';
import { CalendarEvent } from '../types/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';

interface EventDetailsProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose }) => {
  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-[#12111a] border border-white/20 text-white max-w-md w-full">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle id="event-details-title" className="text-2xl font-bold">
                {event.title}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Event ID: {event.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4 text-sm">
              <p>
                <span className="opacity-70">Date:</span> {event.date.toDateString()}
              </p>
              <p>
                <span className="opacity-70">Type:</span> {event.type}
              </p>
              <p>
                <span className="opacity-70">Status:</span> {event.status}
              </p>
              <p className="mt-4 p-3 bg-white/10 rounded border border-white/20">
                {event.details}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
