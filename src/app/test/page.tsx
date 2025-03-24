"use client";

import { ChevronRight, Filter } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";

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

// Traffic source data using shadcn pattern
const trafficSourceData = [
  {
    key: "direct",
    label: "Direct",
    value: 40,
    color: "hsl(var(--chart-1))",
  },
  {
    key: "social",
    label: "Social",
    value: 30,
    color: "hsl(var(--chart-2))",
  },
  {
    key: "search",
    label: "Search",
    value: 20,
    color: "hsl(var(--chart-3))",
  },
  {
    key: "referral",
    label: "Referral",
    value: 10,
    color: "hsl(var(--chart-4))",
  },
];

// Chart configurations using shadcn pattern
const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const trafficChartConfig = {
  value: {
    label: "Traffic",
  },
  direct: {
    label: "Direct",
    color: "hsl(var(--chart-1))",
  },
  social: {
    label: "Social",
    color: "hsl(var(--chart-2))",
  },
  search: {
    label: "Search",
    color: "hsl(var(--chart-3))",
  },
  referral: {
    label: "Referral",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function RevenueTrafficOverview() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Revenue Overview Card */}
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
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--chart-1))",
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ChartContainer>

          {/* Current Period and View Details */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))] mr-2"></div>
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

      {/* Traffic Sources Card */}
      <div
        className="bg-custom-dark-purple border border-custom-light-card-border rounded-lg overflow-hidden w-full mx-auto"
        style={{ backgroundColor: "#09092f" }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white text-lg font-medium">Traffic Sources</h3>
            <p className="text-gray-400 text-sm">
              Where your visitors are coming from
            </p>
          </div>
          <button
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#1A1A2E]"
            aria-label="Filter traffic"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Full Pie Chart - Using shadcn pattern */}
            <div className="relative w-full md:w-1/2 flex justify-center">
              <div className="w-[180px] h-[180px]">
                <ChartContainer
                  config={trafficChartConfig}
                  className="w-full h-full"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={[
                        {
                          source: "Direct",
                          value: 40,
                          fill: "var(--color-direct)",
                        },
                        {
                          source: "Social",
                          value: 30,
                          fill: "var(--color-social)",
                        },
                        {
                          source: "Search",
                          value: 20,
                          fill: "var(--color-search)",
                        },
                        {
                          source: "Referral",
                          value: 10,
                          fill: "var(--color-referral)",
                        },
                      ]}
                      dataKey="value"
                      nameKey="source"
                      innerRadius={50}
                      outerRadius={80}
                      stroke="#09092f"
                      strokeWidth={2}
                      paddingAngle={0}
                      startAngle={90}
                      endAngle={-270}
                      cx="50%"
                      cy="50%"
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            </div>

            {/* Traffic Sources Legend with Progress Bars */}
            <div className="w-full md:w-1/2 space-y-4">
              {trafficSourceData.map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-200">{item.label}</span>
                    </div>
                    <span className="text-gray-200 font-medium">
                      {item.value}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-[#1A1A2E] rounded-full w-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              <button
                className="w-full py-2.5 px-4 mt-4 bg-[#1A1A2E] hover:bg-[#252538] text-white font-medium rounded-md transition-colors"
                onClick={() => console.log("View traffic details")}
              >
                View Traffic Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
