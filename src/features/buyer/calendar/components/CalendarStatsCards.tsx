'use client';

import React from 'react';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { CalendarStats } from '../types';

interface CalendarStatsCardsProps {
  stats: CalendarStats;
}

export function CalendarStatsCards({ stats }: CalendarStatsCardsProps) {
  const cards = [
    {
      title: 'Total Scheduled Events',
      value: stats.totalEvents,
      icon: Package,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'In Transit / Shipped',
      value: stats.shippedCount,
      icon: Truck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Delivered Packages',
      value: stats.deliveredCount,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-600/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Pending & Processing',
      value: stats.pendingCount,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600/10',
      borderColor: 'border-yellow-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`${card.bgColor} border ${card.borderColor} rounded-xl p-4 transition-all hover:border-white/20`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/5`}
              >
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{card.title}</p>
                <p className="text-white text-xl sm:text-2xl font-semibold">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
