'use client';

import { useState, useMemo } from 'react';
import { SupportTicketsHeader } from './support-tickets-header';
import { StatsCards } from './stats-cards';
import { ResponseTimeMetric } from './response-time-metric';
import { TicketFilters } from './ticket-filters';
import { TicketList } from './ticket-list';
import { TicketDetails } from './ticket-details';
import { Pagination } from './pagination';
import { supportTickets } from '../constants/data';

export function SupportTicketsMainComponent() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTickets = useMemo(() => {
    if (currentFilter === 'all') {
      return supportTickets;
    }
    return supportTickets.filter(ticket => ticket.status === currentFilter);
  }, [currentFilter]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage]);

  const selectedTicketData = useMemo(() => {
    return supportTickets.find(ticket => ticket.id === selectedTicket) || null;
  }, [selectedTicket]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1);
    setSelectedTicket(null);
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicket(ticketId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-4 md:p-6 lg:p-8 gap-8">
      <SupportTicketsHeader />
      
      <StatsCards />
      
      <ResponseTimeMetric />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TicketFilters onFilterChange={handleFilterChange} />
          
          <TicketList
            tickets={paginatedTickets}
            selectedTicket={selectedTicket}
            onTicketSelect={handleTicketSelect}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
        
        <div className="lg:col-span-1">
          <div className="p-6 rounded-lg border border-white/10 bg-[#0F0E1D]/30 shadow-[0_0_8px_rgba(255,255,255,0.1)] h-full">
            <TicketDetails selectedTicket={selectedTicketData} />
          </div>
        </div>
      </div>
    </div>
  );
} 