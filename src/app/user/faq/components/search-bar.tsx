"use client";

import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Search for answers..." 
}) => {
  return (
    <div className="w-full max-w-xl mx-auto mb-10">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={placeholder} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-4 pl-12 pr-4 rounded-xl bg-transparent border border-white border-opacity-5 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
};

export default SearchBar;