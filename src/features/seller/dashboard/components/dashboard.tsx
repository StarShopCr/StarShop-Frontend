'use client';
import { DashboardHeader } from './dashboard-header';
import { StatsGrid } from './stats-grid';
import { SalesChart } from './sales-chart';
import { UpcomingEvents } from './upcoming-events';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <DashboardHeader userName={'Kevin Latino'} />

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart />
        <UpcomingEvents />
      </div>
    </div>
  );
}
