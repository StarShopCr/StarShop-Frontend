'use client';

import { MessageSquare } from 'lucide-react';
import { SupportTicket } from '../types';

interface TicketListProps {
  tickets: SupportTicket[];
  selectedTicket: string | null;
  onTicketSelect: (ticketId: string) => void;
}

export function TicketList({ tickets, selectedTicket, onTicketSelect }: TicketListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-yellow-500/30', text: 'text-yellow-500' };
      case 'in-progress':
        return { bg: 'bg-blue-500/30', text: 'text-blue-500' };
      case 'resolved':
        return { bg: 'bg-green-500/30', text: 'text-green-500' };
      default:
        return { bg: 'bg-gray-500/30', text: 'text-gray-500' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-600/30', text: 'text-red-500' };
      case 'medium':
        return { bg: 'bg-orange-500/30', text: 'text-orange-500' };
      case 'low':
        return { bg: 'bg-green-500/30', text: 'text-green-500' };
      default:
        return { bg: 'bg-gray-500/30', text: 'text-gray-500' };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'billing':
        return { bg: 'bg-gray-500/30', text: 'text-gray-400' };
      case 'technical':
        return { bg: 'bg-gray-600/30', text: 'text-gray-400' };
      case 'account':
        return { bg: 'bg-gray-500/30', text: 'text-gray-400' };
      default:
        return { bg: 'bg-gray-500/30', text: 'text-gray-400' };
    }
  };

  return (
    <div className="space-y-0 rounded-lg overflow-hidden border border-white/10 bg-[#0F0E1D]/30 shadow-[0_0_8px_rgba(255,255,255,0.1)]">
      {tickets.map((ticket, index) => (
        <div
          key={ticket.id}
          onClick={() => onTicketSelect(ticket.id)}
          className={`py-3 px-4 cursor-pointer transition-colors relative ${
            selectedTicket === ticket.id
              ? 'bg-primary-purple/20 border-primary-purple'
              : 'bg-[#0F0E1D]/30 hover:bg-[#0F0E1D]/50'
          }`}
        >
          {index !== tickets.length - 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" style={{ marginLeft: '-1rem', marginRight: '-1rem' }}></div>
          )}
          <div className="flex items-center space-x-4">
            {/* Left Column - ID and Date */}
            <div className="flex flex-col items-start min-w-[80px]">
              <span className="text-sm font-medium text-white">{ticket.id}</span>
              <span className="text-xs text-gray-400 mt-1">{ticket.date}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-white font-medium">{ticket.title}</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">{ticket.timeAgo}</span>
                  <div className="flex items-center space-x-1 text-gray-400 rounded-full px-2 py-1 border border-gray-400/30">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-xs">{ticket.messageCount}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mb-1">
                <div className="w-5 h-5 rounded-full bg-white"></div>
              </div>
              
              <div className="flex items-center space-x-2 -mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status).bg} ${getStatusColor(ticket.status).text}`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority).bg} ${getPriorityColor(ticket.priority).text}`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ticket.category).bg} ${getCategoryColor(ticket.category).text}`}>
                  {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                </span>
              </div>
            </div>
            

          </div>
        </div>
      ))}
    </div>
  );
} 