"use client"

import { TabsProps } from "../types/nft"

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="w-full mb-6 bg-white bg-opacity-10 rounded-[8px] p-1">
    <div className="flex">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium 
            ${
              tab.value === activeTab
                ? "bg-purple-600 text-white shadow-purple-600 shadow-sm"
                : "text-gray-400 hover:text-gray-300"
            }`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
)

export default Tabs 