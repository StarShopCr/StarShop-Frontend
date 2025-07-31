'use client';

import { Timer } from 'lucide-react';
import { ticketStats } from '../constants/data';

export function ResponseTimeMetric() {
  return (
    <div className="p-6 rounded-lg border border-white/10 bg-[#0F0E1D]/30 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="w-5 h-5 text-primary-purple" />
          <h3 className="text-white font-semibold">Response Time</h3>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-300">
          Average time to first response:{' '}
          <span className="text-white font-bold">{ticketStats.avgResponseTime}</span>
        </p>
      </div>
      
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 rounded-full" 
             style={{ width: '60%' }} />
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Target: {ticketStats.targetResponseTime}</span>
        <span className="text-gray-400">SLA: {ticketStats.slaTime}</span>
      </div>
    </div>
  );
} 