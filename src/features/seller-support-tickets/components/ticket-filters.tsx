'use client';

import { useState } from 'react';
import { ticketFilters } from '../constants/data';

interface TicketFiltersProps {
  onFilterChange: (filter: string) => void;
}

export function TicketFilters({ onFilterChange }: TicketFiltersProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterClick = (filterType: string) => {
    setActiveFilter(filterType);
    onFilterChange(filterType);
  };

  const getFilterColor = (filterType: string) => {
    switch (filterType) {
      case 'all':
        return { bg: 'bg-primary-purple/30', text: 'text-primary-purple' };
      case 'open':
        return { bg: 'bg-yellow-500/30', text: 'text-yellow-500' };
      case 'in progress':
        return { bg: 'bg-blue-500/30', text: 'text-blue-500' };
      case 'resolved':
        return { bg: 'bg-green-500/30', text: 'text-green-500' };
      default:
        return { bg: 'bg-gray-500/30', text: 'text-gray-500' };
    }
  };

  return (
    <div className="inline-flex space-x-1 p-1 rounded-lg border border-white/10 bg-[#0F0E1D]/30 shadow-[0_0_8px_rgba(255,255,255,0.1)]">
      {ticketFilters.map((filter) => (
        <button
          key={filter.type}
          onClick={() => handleFilterClick(filter.type)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
            activeFilter === filter.type
              ? 'bg-primary-purple/30 text-white font-semibold'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <span>{filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}</span>
          <div className={`w-6 h-6 rounded-full ${getFilterColor(filter.type).bg} flex items-center justify-center text-xs font-bold ${
            activeFilter === filter.type ? 'text-white' : getFilterColor(filter.type).text
          }`}>
            {filter.count}
          </div>
        </button>
      ))}
    </div>
  );
} 