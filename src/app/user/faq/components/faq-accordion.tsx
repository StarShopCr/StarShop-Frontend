"use client";

import { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ShoppingBag, 
  Tag, 
  CreditCard, 
  Image as ImageIcon, 
  MessageSquare, 
  ChevronDown 
} from 'lucide-react';
import { FAQ, FAQCategory } from './data';

interface FAQAccordionProps {
  faqs: FAQ[];
  searchQuery: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, searchQuery }) => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('general');
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);

  // Filter FAQs based on both category and search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If no search query, just filter by category
      setFilteredFAQs(faqs.filter(faq => faq.category === activeCategory));
    } else {
      // If search query exists, filter by both search query and category
      const query = searchQuery.toLowerCase();
      const results = faqs.filter(faq => 
        (faq.category === activeCategory || searchQuery.length > 2) && // Show all categories if search is substantial
        (faq.question.toLowerCase().includes(query) || 
         faq.answer.toLowerCase().includes(query))
      );
      setFilteredFAQs(results);
      
      // Auto-expand questions that match search
      if (query.length > 2) {
        const matchingIndexes = results.map((_, index) => index);
        setExpandedQuestions(matchingIndexes);
      }
    }
  }, [searchQuery, activeCategory, faqs]);

  const toggleQuestion = (index: number) => {
    if (expandedQuestions.includes(index)) {
      setExpandedQuestions(expandedQuestions.filter(i => i !== index));
    } else {
      setExpandedQuestions([...expandedQuestions, index]);
    }
  };
  
  const tabStyle = (isActive: boolean) => `flex items-center ${isActive ? 'bg-purple-800 bg-opacity-70' : 'bg-transparent shadow-[0_0_10px_rgba(255,255,255,0.02)]'} px-4 py-2 rounded-md`;
  
  const cardStyle = "p-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white border-opacity-5 bg-black bg-opacity-5";

  // Count visible FAQs by category with search applied
  const getVisibleCount = (category: FAQCategory) => {
    if (searchQuery.trim() === '') {
      return faqs.filter(faq => faq.category === category).length;
    }
    
    const query = searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.category === category && 
      (faq.question.toLowerCase().includes(query) || 
       faq.answer.toLowerCase().includes(query))
    ).length;
  };

  const faqCounts = {
    general: getVisibleCount('general'),
    buying: getVisibleCount('buying'),
    selling: getVisibleCount('selling'),
    payments: getVisibleCount('payments'),
    nfts: getVisibleCount('nfts'),
    support: getVisibleCount('support'),
  };

  const totalSearchMatches = searchQuery.trim() !== '' ? 
    faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ).length : 0;

  return (
    <>
      <div className="w-full mb-8 mx-auto overflow-x-auto">
        <div className="flex space-x-4 lg:space-x-0 min-w-max pb-2 mx-auto">
          <button 
            className={tabStyle(activeCategory === 'general')}
            onClick={() => setActiveCategory('general')}
          >
            <HelpCircle size={18} className="mr-2" />
            General
            <span className={`ml-2 ${activeCategory === 'general' ? 'bg-purple-700' : 'bg-gray-700 py-1'} px-2 py-1 rounded-full text-xs`}>
              {faqCounts.general}
            </span>
          </button>
          
          <button 
            className={tabStyle(activeCategory === 'buying')}
            onClick={() => setActiveCategory('buying')}
          >
            <ShoppingBag size={18} className="mr-2" />
            Buying
            <span className={`ml-2 ${activeCategory === 'buying' ? 'bg-purple-700' : 'bg-gray-700 py-1'} px-2 py-1 rounded-full text-xs`}>
              {faqCounts.buying}
            </span>
          </button>
          
          <button 
            className={tabStyle(activeCategory === 'selling')}
            onClick={() => setActiveCategory('selling')}
          >
            <Tag size={18} className="mr-2" />
            Selling
            <span className={`ml-2 ${activeCategory === 'selling' ? 'bg-purple-700' : 'bg-gray-700 py-1'} px-2 py-1 rounded-full text-xs`}>
              {faqCounts.selling}
            </span>
          </button>
          
          <button 
            className={tabStyle(activeCategory === 'payments')}
            onClick={() => setActiveCategory('payments')}
          >
            <CreditCard size={18} className="mr-2" />
            Payments
            <span className={`ml-2 ${activeCategory === 'payments' ? 'bg-purple-700' : 'bg-gray-700 py-1'} px-2 py-1 rounded-full text-xs`}>
              {faqCounts.payments}
            </span>
          </button>
          
          <button 
            className={tabStyle(activeCategory === 'nfts')}
            onClick={() => setActiveCategory('nfts')}
          >
            <ImageIcon size={18} className="mr-2" />
            NFTs
            <span className={`ml-2 ${activeCategory === 'nfts' ? 'bg-purple-700' : 'bg-gray-700 py-1'} px-2 py-1 rounded-full text-xs`}>
              {faqCounts.nfts}
            </span>
          </button>
          
          <button 
            className={tabStyle(activeCategory === 'support')}
            onClick={() => setActiveCategory('support')}
          >
            <MessageSquare size={18} className="mr-2" />
            Support
            <span className={`ml-2 ${activeCategory === 'support' ? 'bg-purple-700' : 'bg-gray-700 py-1'} px-2 py-1 rounded-full text-xs`}>
              {faqCounts.support}
            </span>
          </button>
        </div>
      </div>
      
      <div className={`w-full ${cardStyle} mb-10`}>
        <div className="flex items-center mb-4">
          <HelpCircle className="text-purple-400 mr-3" size={24} />
          <h2 className="text-xl font-semibold">
            {searchQuery.trim() !== '' 
              ? `Search Results (${totalSearchMatches})` 
              : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Questions`}
          </h2>
        </div>
        
        {searchQuery.trim() !== '' ? (
          <p className="text-gray-300 mb-6">
            Showing results for &quot;{searchQuery}&quot;
          </p>
        ) : (
          <p className="text-gray-300 mb-6">
            Frequently asked questions about {activeCategory}
          </p>
        )}
        
        <div className="space-y-3">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => {
              const highlightMatch = (text: string) => {
                if (searchQuery.trim() === '') return text;
                
                const regex = new RegExp(`(${searchQuery})`, 'gi');
                return text.replace(regex, '<mark class="bg-purple-900 bg-opacity-40 text-white px-1 rounded">$1</mark>');
              };
              
              return (
                <div key={index} className="border-b border-gray-700 pb-3">
                  <button 
                    className="w-full flex justify-between items-center py-3"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span 
                      className="text-lg text-left"
                      dangerouslySetInnerHTML={{ __html: highlightMatch(faq.question) }} 
                    />
                    <ChevronDown 
                      size={20} 
                      className={`transition-transform text-purple-600 ${expandedQuestions.includes(index) ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {expandedQuestions.includes(index) && (
                    <div 
                      className="py-3 text-gray-300"
                      dangerouslySetInnerHTML={{ __html: highlightMatch(faq.answer) }}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-400">
              {searchQuery.trim() !== '' 
                ? `No results found for "${searchQuery}". Try a different search term.` 
                : 'No questions found in this category.'}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default FAQAccordion;