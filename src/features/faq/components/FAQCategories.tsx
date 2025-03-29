'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  ShoppingBag, 
  Tag, 
  CreditCard, 
  Wallet, 
  MessageSquare 
} from 'lucide-react';

import { useExpandableItems } from './useExpandableItems';
import { Tabs } from './Tabs';
import { ContentContainer } from './ContentContainer';
import { ExpandableItem } from './ExpandableItem';

// Interfaces
export interface FAQItem {
  question: string;
  answer: string;
}

export interface CategoryData {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  faqs: FAQItem[];
  iconLarge: React.ReactNode;
}

const FAQCategories: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const { toggleItem, isItemExpanded } = useExpandableItems();

  const categories: CategoryData[] = [
    {
      id: 'general',
      name: 'General',
      icon: <HelpCircle size={14} />,
      iconLarge: <HelpCircle size={18} />,
      count: 4,
     
      faqs: [
        {
          question: 'What is StarShop Marketplace?',
          answer: 'StarShop is a digital marketplace where users can buy, sell, and trade digital assets, including NFTs, digital art, and other virtual goods. Our platform provides a secure and easy-to-use interface for all your digital transactions.'
        },
        {
          question: 'How do I create an account?',
          answer: 'To create an account, click on the "Sign Up" button in the top right corner of the homepage. You\'ll need to provide a valid email address, create a password, and verify your email. Once verified, you can set up your profile and start exploring the marketplace.'
        },
        {
          question: 'Is StarShop available worldwide?',
          answer: 'Yes, StarShop is available to users worldwide. However, certain features or payment methods may have regional restrictions due to regulatory requirements. Users from all countries can browse, but verification requirements may vary by location.'
        },
        {
          question: 'What currencies are accepted on StarShop?',
          answer: 'StarShop accepts various cryptocurrencies including Ethereum (ETH), Bitcoin (BTC), and Solana (SOL). We also support select fiat currencies through our payment partners. The available currencies may vary depending on your region and the specific transaction.'
        }
      ]
    },
    {
      id: 'buying',
      name: 'Buying',
      icon: <ShoppingBag size={14} />,
      iconLarge: <ShoppingBag size={18} />,
      count: 4,
      faqs: [
        {
          question: 'How do I purchase an item?',
          answer: 'To purchase an item, navigate to the listing page, review the details, and click the "Buy Now" or "Place Bid" button. Follow the checkout process to complete your purchase.'
        },
        {
          question: 'What fees are associated with buying?',
          answer: 'Buyers typically pay a 2.5% transaction fee on all purchases. Gas fees may also apply for cryptocurrency transactions, depending on the blockchain network being used.'
        },
        {
          question: 'Can I cancel a purchase?',
          answer: 'Once a purchase is confirmed on the blockchain, it cannot be reversed. However, if there are issues with your purchase, please contact our support team within 48 hours.'
        },
        {
          question: 'How do I receive my purchased items?',
          answer: 'Digital items will be transferred directly to your connected wallet. This process is automatic and typically completes within minutes after the transaction is confirmed.'
        }
      ]
    },
    {
      id: 'selling',
      name: 'Selling',
      icon: <Tag size={14} />,
      iconLarge: <Tag size={18} />,
      count: 4,
      faqs: [
        {
          question: 'How do I list an item for sale?',
          answer: 'To list an item, click "Create" or "Sell" in the navigation bar, upload your digital asset, fill in the listing details, set your price, and confirm the listing.'
        },
        {
          question: 'What fees are associated with selling?',
          answer: 'Sellers pay a 3.5% fee on successful sales. There may also be gas fees for creating and canceling listings, depending on the blockchain.'
        },
        {
          question: 'How long do listings stay active?',
          answer: 'Standard listings remain active until canceled by the seller or until the item is sold. Auction-style listings have a set duration specified by the seller.'
        },
        {
          question: 'Can I edit a listing after it\'s created?',
          answer: 'Yes, you can edit certain aspects of your listing such as description and price. However, changing core attributes may require canceling and recreating the listing.'
        }
      ]
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: <Wallet size={14} />,
      iconLarge: <Wallet size={18} />,
      count: 4,
      faqs: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept various cryptocurrencies including ETH, BTC, and SOL, as well as credit/debit cards through our payment processors in select regions.'
        },
        {
          question: 'How long do payments take to process?',
          answer: 'Cryptocurrency payments are typically confirmed within minutes, depending on network congestion. Fiat payments may take 1-3 business days to complete processing.'
        },
        {
          question: 'Are there any withdrawal limits?',
          answer: 'Yes, withdrawal limits depend on your account verification level. Basic verified accounts can withdraw up to $2,000 per day, while fully verified accounts have higher limits.'
        },
        {
          question: 'How are tax obligations handled?',
          answer: 'StarShop provides transaction history for your reference, but users are responsible for their own tax obligations. We recommend consulting with a tax professional for guidance.'
        }
      ]
    },
    {
      id: 'nfts',
      name: 'NFTs',
      iconLarge: <CreditCard size={18} />,
      icon: <CreditCard size={14} />,
      count: 4,
      faqs: [
        {
          question: 'What blockchains do you support for NFTs?',
          answer: 'We currently support Ethereum, Polygon, and Solana blockchains for NFT transactions. Additional chains may be added in the future.'
        },
        {
          question: 'How do I create an NFT on StarShop?',
          answer: 'To create an NFT, go to the "Create" section, upload your artwork, fill in metadata details, choose your blockchain, and mint your NFT. Minting fees vary by blockchain.'
        },
        {
          question: 'What file types are supported for NFTs?',
          answer: 'We support JPEG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, and GLTF file types. Maximum file size is 100MB for most formats.'
        },
        {
          question: 'Do you offer NFT royalties?',
          answer: 'Yes, creators can set royalties between 0-10% when minting NFTs. These royalties are automatically distributed with each secondary sale.'
        }
      ]
    },
    {
      id: 'support',
      name: 'Support',
      icon: <MessageSquare size={14} />,
      iconLarge: <MessageSquare size={18} />,
      count: 4,
      faqs: [
        {
          question: 'How do I contact customer support?',
          answer: 'You can reach our support team via the help desk in your account dashboard, by emailing support@starshop.io, or through live chat during business hours.'
        },
        {
          question: 'What are the support hours?',
          answer: 'Our support team is available 24/7 for urgent issues. Standard support hours are 9AM-5PM UTC, Monday through Friday.'
        },
        {
          question: 'Is there a knowledge base?',
          answer: 'Yes, we have an extensive knowledge base with tutorials, guides, and FAQs. You can access it through the Support section of our website.'
        },
        {
          question: 'How do I report a problem with a purchase?',
          answer: 'To report an issue, go to your purchase history, find the relevant transaction, and click "Report Problem." Please provide as much detail as possible to help us resolve your issue quickly.'
        }
      ]
    }
  ];

  const activeData = categories.find(cat => cat.id === activeCategory) || categories[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <Tabs 
        items={categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          count: cat.count
        }))}
        activeTab={activeCategory}
        onTabChange={setActiveCategory}
      />

      <ContentContainer
        iconLarge={activeData.iconLarge}
        title={activeData.name}
        description={`Frequently asked questions about ${activeData.name.toLowerCase()}`}
      >
        {activeData.faqs.map((faq) => (
          <ExpandableItem
            key={faq.question}
            title={faq.question}
            content={faq.answer}
            isExpanded={isItemExpanded(faq.question)}
            onToggle={() => toggleItem(faq.question)}
          />
        ))}
      </ContentContainer>
    </div>
  );
};

export default FAQCategories;