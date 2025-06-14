"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  // Stats cards data
  const statsCards = [
    {
      title: "Total Revenue",
      value: "4,320 XLM",
      change: "+12.5%",
      icon: <CreditCard className="w-6 h-6 text-purple-500" />,
      trend: "up",
    },
    {
      title: "Orders",
      value: "243",
      change: "+8.2%",
      icon: <Package className="w-6 h-6 text-blue-500" />,
      trend: "up",
    },
    {
      title: "Products",
      value: "56",
      change: "+2",
      icon: <ShoppingBag className="w-6 h-6 text-green-500" />,
      trend: "up",
    },
    {
      title: "Customers",
      value: "1,842",
      change: "+12.7%",
      icon: <Users className="w-6 h-6 text-amber-500" />,
      trend: "up",
    },
  ];

  // Upcoming events data
  const upcomingEvents = [
    {
      title: "Product Launch",
      date: "Nov 12",
      description: "New seasonal collection launch",
    },
    {
      title: "Customer Review",
      date: "Nov 14",
      description: "Quarterly review of customer feedback",
    },
    {
      title: "Inventory Check",
      date: "Nov 18",
      description: "Monthly inventory reconciliation",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border dark:border-white/10 border-black/20 bg-background dark:bg-[#0F0E1D] shadow-[0_0_8px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-shadow hover:shadow-[0_0_12px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-400 font-medium">{card.title}</h2>
              {card.icon}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold dark:text-white">{card.value}</p>
                <p
                  className={`text-sm font-medium ${card.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {card.change} from last month
                </p>
              </div>
              <div
                className={`p-2 rounded-full ${card.trend === "up" ? "bg-green-500/20" : "bg-red-500/20"
                  }`}
              >
                <TrendingUp
                  className={`w-4 h-4 ${card.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and events section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart area */}
        <div className="lg:col-span-2 p-6 rounded-lg border dark:border-white/10 border-black/20 bg-background dark:bg-[#0F0E1D] shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold dark:text-white">
              Sales Performance
            </h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm rounded-md bg-purple-600/20 text-purple-400 border border-purple-600/30">
                Week
              </button>
              <button className="px-3 py-1 text-sm rounded-md bg-transparent text-gray-400 hover:bg-purple-600/10">
                Month
              </button>
              <button className="px-3 py-1 text-sm rounded-md bg-transparent text-gray-400 hover:bg-purple-600/10">
                Year
              </button>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-500">
              <LineChart className="w-12 h-12 mx-auto mb-2" />
              <p>Analytics chart visualization placeholder</p>
            </div>
          </div>
        </div>

        {/* Events card */}
        <div className="p-6 rounded-lg border dark:border-white/10 border-black/20 bg-background dark:bg-[#0F0E1D] shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold dark:text-white">
              Upcoming Events
            </h2>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-white/5 border dark:border-white/5 border-black/5"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium dark:text-white">{event.title}</h3>
                  <span className="text-sm text-purple-400">{event.date}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {event.description}
                </p>
              </div>
            ))}
            <button className="w-full mt-2 text-center text-sm text-purple-400 hover:text-purple-300">
              View all events →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
