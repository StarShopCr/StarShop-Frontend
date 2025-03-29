"use client";

import { useState } from "react";
import SearchBar from "./search-bar";
import QuickGuideCards from "./quick-guide";
import FAQAccordion from "./faq-accordion";
import { faqs } from "./data";

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen text-white px-4 py-8">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <QuickGuideCards />
      <FAQAccordion faqs={faqs} searchQuery={searchQuery} />
    </div>
  );
};

export default FAQPage;
