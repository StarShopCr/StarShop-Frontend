"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  HelpCircle,
  ShoppingBag,
  Tag,
  CreditCard,
  Image as ImageIcon,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { FAQ, FAQCategory } from "./data";

interface FAQAccordionProps {
  faqs: FAQ[];
  searchQuery: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, searchQuery }) => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("general");
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(
    () => [
      { id: "general" as FAQCategory, label: "General", icon: HelpCircle },
      { id: "buying" as FAQCategory, label: "Buying", icon: ShoppingBag },
      { id: "selling" as FAQCategory, label: "Selling", icon: Tag },
      { id: "payments" as FAQCategory, label: "Payments", icon: CreditCard },
      { id: "nfts" as FAQCategory, label: "NFTs", icon: ImageIcon },
      { id: "support" as FAQCategory, label: "Support", icon: MessageSquare },
    ],
    []
  );

  const updateSliderPosition = useCallback(() => {
    const activeIndex = categories.findIndex(
      (cat) => cat.id === activeCategory
    );
    const activeTab = tabRefs.current[activeIndex];
    const slider = sliderRef.current;

    if (activeTab && slider) {
      slider.style.width = `${activeTab.offsetWidth}px`;
      slider.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    updateSliderPosition();
  }, [activeCategory, updateSliderPosition]);

  useEffect(() => {
    window.addEventListener("resize", updateSliderPosition);
    return () => window.removeEventListener("resize", updateSliderPosition);
  }, [updateSliderPosition]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFAQs(faqs.filter((faq) => faq.category === activeCategory));
    } else {
      const query = searchQuery.toLowerCase();
      const results = faqs.filter(
        (faq) =>
          (faq.category === activeCategory || searchQuery.length > 2) &&
          (faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query))
      );
      setFilteredFAQs(results);

      if (query.length > 2) {
        const matchingIndexes = results.map((_, index) => index);
        setExpandedQuestions(matchingIndexes);
      }
    }
  }, [searchQuery, activeCategory, faqs]);

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getVisibleCount = useCallback(
    (category: FAQCategory) => {
      if (searchQuery.trim() === "") {
        return faqs.filter((faq) => faq.category === category).length;
      }

      const query = searchQuery.toLowerCase();
      return faqs.filter(
        (faq) =>
          faq.category === category &&
          (faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query))
      ).length;
    },
    [faqs, searchQuery]
  );

  const tabStyle = useCallback(
    (isActive: boolean) =>
      `flex items-center ${
        isActive ? "text-white" : "text-gray-300"
      } px-4 py-2 rounded-md relative z-10`,
    []
  );

  const cardStyle =
    "p-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white border-opacity-5 bg-black bg-opacity-5";

  const totalSearchMatches = useMemo(
    () =>
      searchQuery.trim() !== ""
        ? faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ).length
        : 0,
    [faqs, searchQuery]
  );

  return (
    <>
      <div className="max-w-4xl w-full mb-8 mx-auto overflow-x-auto">
        <div className="flex relative space-x-4 lg:space-x-0 min-w-max pb-2 mx-auto bg-gray-900 bg-opacity-50 p-1 rounded-lg">
          <div
            ref={sliderRef}
            className="absolute h-[calc(100%-8px)] top-1 left-1 bg-purple-800 bg-opacity-70 rounded-md transition-all duration-300 ease-in-out"
          />

          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            const isActive = activeCategory === category.id;
            const count = getVisibleCount(category.id);

            return (
              <button
                key={category.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className={tabStyle(isActive)}
                onClick={() => setActiveCategory(category.id)}
              >
                <CategoryIcon size={18} className="mr-2" />
                {category.label}
                <span
                  className={`ml-2 ${
                    isActive ? "bg-purple-700" : "bg-gray-700"
                  } px-2 py-1 rounded-full text-xs`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`w-full ${cardStyle} mb-10 max-w-4xl mx-auto`}>
        <div className="flex items-center mb-4">
          <HelpCircle className="text-purple-400 mr-3" size={24} />
          <h2 className="text-xl font-semibold">
            {searchQuery.trim() !== ""
              ? `Search Results (${totalSearchMatches})`
              : `${
                  activeCategory.charAt(0).toUpperCase() +
                  activeCategory.slice(1)
                } Questions`}
          </h2>
        </div>

        {searchQuery.trim() !== "" ? (
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
                if (searchQuery.trim() === "") return text;

                const regex = new RegExp(`(${searchQuery})`, "gi");
                return text.replace(
                  regex,
                  '<mark class="bg-purple-900 bg-opacity-40 text-white px-1 rounded">$1</mark>'
                );
              };

              return (
                <div key={index} className="border-b border-gray-700 pb-3">
                  <button
                    className="w-full flex justify-between items-center py-3"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span
                      className="text-lg text-left"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(faq.question),
                      }}
                    />
                    <ChevronDown
                      size={20}
                      className={`transition-transform text-purple-600 ${
                        expandedQuestions.includes(index) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedQuestions.includes(index) && (
                    <div
                      className="py-3 text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(faq.answer),
                      }}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-400">
              {searchQuery.trim() !== ""
                ? `No results found for "${searchQuery}". Try a different search term.`
                : "No questions found in this category."}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default FAQAccordion;
