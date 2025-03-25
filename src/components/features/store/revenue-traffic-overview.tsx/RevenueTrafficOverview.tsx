"use client";

import { RevenueOverview } from "./revenue-overview";
import { TrafficSources } from "./traffic-sources";

export default function RevenueTrafficOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RevenueOverview />
      <TrafficSources />
    </div>
  );
}
