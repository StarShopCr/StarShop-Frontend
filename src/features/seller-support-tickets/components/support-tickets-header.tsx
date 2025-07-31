'use client';

import { Search, SlidersHorizontal, RefreshCw, Plus } from 'lucide-react';

export function SupportTicketsHeader() {
  return (
    <div className="flex items-center justify-between">
      {/* Title section */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-gray-300">Manage and track your support requests</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-3 bg-[#0F0E1D]/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent shadow-[0_0_8px_rgba(255,255,255,0.1)]"
          />
        </div>
        <button className="p-3 bg-[#0F0E1D]/30 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
        <button className="p-3 bg-[#0F0E1D]/30 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button className="flex items-center space-x-2 px-6 py-3 bg-primary-purple text-white rounded-lg hover:bg-purple-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Ticket</span>
        </button>
      </div>
    </div>
  );
} 