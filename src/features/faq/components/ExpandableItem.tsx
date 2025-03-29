import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableItemProps {
  title: string;
  content: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ExpandableItem: React.FC<ExpandableItemProps> = ({ 
  title, 
  content, 
  isExpanded, 
  onToggle 
}) => (
  <div 
    className="border-b pb-4 last:border-b-0" 
    style={{ borderBottom: "1px solid #333", paddingBottom: "1rem" }}
  >
    <button
      onClick={onToggle}
      className="flex justify-between items-center w-full text-left py-2"
    >
      <h3 className="text-white font-medium">{title}</h3>
      {isExpanded ? (
        <ChevronUp className="text-purple-400" size={20} />
      ) : (
        <ChevronDown className="text-purple-400" size={20} />
      )}
    </button>
    
    {isExpanded && (
      <div className="pt-2 pb-1 text-gray-300 text-sm">
        {content}
      </div>
    )}
  </div>
);



