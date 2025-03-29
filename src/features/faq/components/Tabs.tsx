import React from 'react';

interface TabsProps {
  items: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    count?: number;
  }>;
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeTab, onTabChange }) => (
  <div className="flex flex-wrap gap-4 mb-6 justify-center">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`flex items-center gap-2 px-2 py-2 rounded text-sm font-medium transition-colors ${
          activeTab === item.id
            ? 'bg-purple-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-700'
        }`}
      >
        {item.icon}
        <span>{item.name}</span>
        {item.count !== undefined && (
          <span className="ml-1 bg-black bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
            {item.count}
          </span>
        )}
      </button>
    ))}
  </div>
);