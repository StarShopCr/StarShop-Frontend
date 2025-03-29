"use client";

import Link from 'next/link';
import { Package, FileText, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  longDescription: string;
  linkText: string;
  linkHref: string;
  isPrimary?: boolean;
  linkIcon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  description,
  longDescription,
  linkText,
  linkHref,
  isPrimary = false,
  linkIcon = <ChevronRight size={20} />
}) => {
  const cardStyle = " p-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white border-opacity-5 bg-black bg-opacity-5 ";
  const btnStyle = "flex items-center justify-between bg-transparent text-white py-3 px-4 rounded-lg hover:bg-white hover:bg-opacity-5 border border-white border-opacity-5 ";
  const primaryBtnStyle = "flex items-center justify-between bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700";

  return (
    <div className={cardStyle}>
      <div className="flexn  items-start mb-4">
        <div className="text-purple-400 mr-3 mt-1">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </div>
      <p className="text-gray-300 mb-2">
        {description}
      </p>
      <p className="text-gray-300 mb-6">
        {longDescription}
      </p>
      <Link 
        href={linkHref}
        className={isPrimary ? primaryBtnStyle : btnStyle}
      >
        {linkText}
        {linkIcon}
      </Link>
    </div>
  );
};

const QuickGuideCards: React.FC = () => {
  return (
    <div className="w-full  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2em] mb-10">
      <Card 
        icon={<Package size={24} />}
        title="New to StarShop?"
        description="Learn the basics of our marketplace"
        longDescription="Get started with our platform and learn how to buy, sell, and earn NFTs with every purchase."
        linkText="Getting Started Guide"
        linkHref="/guides/getting-started"
      />
      
      <Card 
        icon={<FileText size={24} />}
        title="Stellar Blockchain"
        description="Understanding crypto payments"
        longDescription="Learn how Stellar blockchain powers our marketplace and ensures secure, fast transactions."
        linkText="Blockchain Guide"
        linkHref="/guides/blockchain"
        linkIcon={<ExternalLink size={20} />}
      />
      
      <Card 
        icon={<HelpCircle size={24} />}
        title="Need Help?"
        description="Contact our support team"
        longDescription="Can't find what you're looking for? Our support team is ready to assist you with any questions."
        linkText="Contact Support"
        linkHref="/support"
        isPrimary={true}
      />
    </div>
  );
};

export default QuickGuideCards;