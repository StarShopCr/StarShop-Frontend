'use client';

import { MessageSquare, Plus } from 'lucide-react';
import { SupportTicket } from '../types';

interface TicketDetailsProps {
  selectedTicket: SupportTicket | null;
}

export function TicketDetails({ selectedTicket }: TicketDetailsProps) {
  if (!selectedTicket) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-primary-purple mb-4">
          <MessageSquare className="w-16 h-16" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Ticket Selected</h3>
        <p className="text-gray-400 mb-6 max-w-md">
          Select a ticket from the list to view its details and respond to customer inquiries.
        </p>
        <button className="flex items-center space-x-2 px-6 py-3 bg-primary-purple text-white rounded-lg hover:bg-purple-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Create New Ticket</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-custom-light-card-border pb-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">{selectedTicket.title}</h2>
          <span className="text-sm text-gray-400">{selectedTicket.id}</span>
        </div>
        <p className="text-gray-300">{selectedTicket.description}</p>
      </div>
      
      <div className="flex-1">
        <div className="p-4 rounded-lg border border-white/10 bg-[#0F0E1D]/30 shadow-[0_0_8px_rgba(255,255,255,0.1)] mb-4">
          <h3 className="text-white font-semibold mb-2">Ticket Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-white capitalize">{selectedTicket.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Priority:</span>
              <span className="text-white capitalize">{selectedTicket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Category:</span>
              <span className="text-white capitalize">{selectedTicket.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="text-white">{selectedTicket.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Messages:</span>
              <span className="text-white">{selectedTicket.messageCount}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-white/10 bg-[#0F0E1D]/30 shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <h3 className="text-white font-semibold mb-4">Messages</h3>
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">No messages yet</p>
          </div>
        </div>
      </div>
    </div>
  );
} 