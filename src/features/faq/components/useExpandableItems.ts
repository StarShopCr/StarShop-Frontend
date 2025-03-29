import { useState } from 'react';

export const useExpandableItems = () => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isItemExpanded = (key: string) => !!expandedItems[key];

  return { toggleItem, isItemExpanded };
};