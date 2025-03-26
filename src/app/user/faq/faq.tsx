"use client";

import { useState } from 'react';
import SearchBar from './components/search-bar';
import QuickGuideCards from './components/quick-guide';
import FAQAccordion from './components/faq-accordion';
import { faqs } from './components/data';

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen text-white px-4 py-8">
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      <QuickGuideCards />
      <FAQAccordion 
        faqs={faqs} 
        searchQuery={searchQuery} 
      />
    </div>
  );
};

export default FAQPage;