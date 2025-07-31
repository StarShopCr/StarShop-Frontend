'use client';

import { MessageSquare, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ticketStats } from '../constants/data';

export function StatsCards() {
  const stats = [
    {
      title: 'Total Tickets',
      value: ticketStats.total,
      change: '+3 this week',
      icon: MessageSquare,
      progressColor: 'bg-primary-purple',
      progressWidth: 'w-full',
    },
    {
      title: 'Open',
      value: ticketStats.open,
      detail: `${ticketStats.urgentCount} urgent`,
      icon: AlertCircle,
      progressColor: 'bg-yellow-500',
      progressWidth: 'w-1/3',
    },
    {
      title: 'In Progress',
      value: ticketStats.inProgress,
      detail: `Avg ${ticketStats.avgResponseTime.split(' ')[0]} days`,
      icon: Clock,
      progressColor: 'bg-blue-500',
      progressWidth: 'w-1/2',
    },
    {
      title: 'Resolved',
      value: ticketStats.resolved,
      detail: 'Last 7 days',
      icon: CheckCircle,
      progressColor: 'bg-green-500',
      progressWidth: 'w-1/6',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-6 rounded-lg border border-white/10 bg-[#0F0E1D]/30 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-shadow relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
              <p className={`text-2xl font-bold mt-1 ${
                stat.title === 'Open' ? 'text-yellow-500' : 
                stat.title === 'In Progress' ? 'text-blue-500' :
                stat.title === 'Resolved' ? 'text-green-500' :
                'text-white'
              }`}>{stat.value}</p>
              <p className="text-gray-300 text-sm mt-1">
                {stat.change || stat.detail}
              </p>
            </div>
            <div className={`${
              stat.title === 'Total Tickets' ? 'text-primary-purple' : 
              stat.title === 'Open' ? 'text-yellow-500' : 
              stat.title === 'In Progress' ? 'text-blue-500' :
              stat.title === 'Resolved' ? 'text-green-500' :
              'text-gray-400'
            }`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className={`h-full ${stat.progressColor} ${stat.progressWidth} transition-all duration-300`}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 