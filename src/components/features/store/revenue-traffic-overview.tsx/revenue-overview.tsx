"use client";

import { ChevronRight, Filter } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Revenue data for the past year
const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 2100 },
  { month: "Mar", revenue: 2800 },
  { month: "Apr", revenue: 2000 },
  { month: "May", revenue: 1900 },
  { month: "Jun", revenue: 2200 },
  { month: "Jul", revenue: 3000 },
  { month: "Aug", revenue: 3500 },
  { month: "Sep", revenue: 4000 },
  { month: "Oct", revenue: 3000 },
  { month: "Nov", revenue: 2800 },
  { month: "Dec", revenue: 2000 },
];

// Chart configurations
const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#9354FF",
  },
} satisfies ChartConfig;

export function RevenueOverview() {
  return (
    <Card
      className="border-custom-light-card-border overflow-hidden"
      style={{ backgroundColor: "#09092f" }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white text-lg font-medium">
            Revenue Overview
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Monthly revenue for the past year
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-custom-light-card-background"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Revenue Chart */}
        <ChartContainer config={revenueChartConfig} className="h-[300px]">
          <LineChart
            accessibilityLayer
            data={revenueData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(107, 114, 128, 0.2)"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(156, 163, 175, 0.7)" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(156, 163, 175, 0.7)" }}
              domain={[0, 4000]}
              ticks={[0, 1000, 2000, 3000, 4000]}
              dx={-10}
            />
            <ChartTooltip
              cursor={{ stroke: "rgba(255, 255, 255, 0.2)" }}
              content={<ChartTooltipContent />}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#9354FF", strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>

        {/* Current Period and View Details */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-custom-light-purple mr-2"></div>
            <span className="text-gray-400 text-sm">Current Period</span>
          </div>
          <Button
            variant="link"
            className="text-gray-300 p-0 flex items-center hover:text-white"
            onClick={() => console.log("View revenue details")}
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
