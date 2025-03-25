"use client";

import { Filter } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Traffic source data
const trafficSourceData = [
  { source: "Direct", value: 40, fill: "var(--color-direct)" },
  { source: "Social", value: 30, fill: "var(--color-social)" },
  { source: "Search", value: 20, fill: "var(--color-search)" },
  { source: "Referral", value: 10, fill: "var(--color-referral)" },
];

// Chart configurations
const trafficChartConfig = {
  direct: {
    label: "Direct",
    color: "#9354FF",
  },
  social: {
    label: "Social",
    color: "#6366F1",
  },
  search: {
    label: "Search",
    color: "#10B981",
  },
  referral: {
    label: "Referral",
    color: "#F59E0B",
  },
} satisfies ChartConfig;

export function TrafficSources() {
  return (
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
          {/* Full Pie Chart */}
          <div className="relative w-full md:w-1/2 flex justify-center">
            <div className="w-[180px] h-[180px]">
              <ChartContainer
                config={trafficChartConfig}
                className="w-full h-full"
              >
                <PieChart width={280} height={280}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={trafficSourceData}
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
            {Object.entries(trafficChartConfig).map(([key, config], index) => {
              const source = trafficSourceData[index];
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <span className="text-gray-200">{config.label}</span>
                    </div>
                    <span className="text-gray-200 font-medium">
                      {source.value}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-[#1A1A2E] rounded-full w-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${source.value}%`,
                        backgroundColor: config.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}

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
  );
}
