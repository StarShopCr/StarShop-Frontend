"use client";

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
import { useTranslation } from 'react-i18next';
import { Tabs } from "./Tabs";
import { ContentContainer } from "./ContentContainer";
import { ExpandableItem } from "./ExpandableItem";
import { useIsFirstRender } from "@/hooks/useIsFirstRender";

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
  const isFirstRender = useIsFirstRender();
  const [activeCategory, setActiveCategory] = useState("general");
  const { toggleItem, isItemExpanded } = useExpandableItems();
  const { t } = useTranslation('common');

  const categories: CategoryData[] = [
    {
      id: 'general',
      name: t('faq.categories.general'),
      icon: <HelpCircle size={14} />,
      iconLarge: <HelpCircle size={18} />,
      count: 4,
      faqs: [
        {
          question: t('faq.general.whatIs.question'),
          answer: t('faq.general.whatIs.answer')
        },
        {
          question: t('faq.general.createAccount.question'),
          answer: t('faq.general.createAccount.answer')
        },
        {
          question: t('faq.general.availability.question'),
          answer: t('faq.general.availability.answer')
        },
        {
          question: t('faq.general.currencies.question'),
          answer: t('faq.general.currencies.answer')
        }
      ]
    },
    {
      id: 'buying',
      name: t('faq.categories.buying'),
      icon: <ShoppingBag size={14} />,
      iconLarge: <ShoppingBag size={18} />,
      count: 4,
      faqs: [
        {
          question: t('faq.buying.howToBuy.question'),
          answer: t('faq.buying.howToBuy.answer')
        },
        {
          question: t('faq.buying.fees.question'),
          answer: t('faq.buying.fees.answer')
        },
        {
          question: t('faq.buying.cancelPurchase.question'),
          answer: t('faq.buying.cancelPurchase.answer')
        },
        {
          question: t('faq.buying.receiveItems.question'),
          answer: t('faq.buying.receiveItems.answer')
        }
      ]
    },
    {
      id: 'selling',
      name: t('faq.categories.selling'),
      icon: <Tag size={14} />,
      iconLarge: <Tag size={18} />,
      count: 4,
      faqs: [
        {
          question: t('faq.selling.howToSell.question'),
          answer: t('faq.selling.howToSell.answer')
        },
        {
          question: t('faq.selling.fees.question'),
          answer: t('faq.selling.fees.answer')
        },
        {
          question: t('faq.selling.listingDuration.question'),
          answer: t('faq.selling.listingDuration.answer')
        },
        {
          question: t('faq.selling.editListing.question'),
          answer: t('faq.selling.editListing.answer')
        }
      ]
    },
    {
      id: 'payments',
      name: t('faq.categories.payments'),
      icon: <Wallet size={14} />,
      iconLarge: <Wallet size={18} />,
      count: 4,
      faqs: [
        {
          question: t('faq.payments.methods.question'),
          answer: t('faq.payments.methods.answer')
        },
        {
          question: t('faq.payments.processingTime.question'),
          answer: t('faq.payments.processingTime.answer')
        },
        {
          question: t('faq.payments.withdrawalLimits.question'),
          answer: t('faq.payments.withdrawalLimits.answer')
        },
        {
          question: t('faq.payments.taxes.question'),
          answer: t('faq.payments.taxes.answer')
        }
      ]
    },
    {
      id: 'nfts',
      name: t('faq.categories.nfts'),
      iconLarge: <CreditCard size={18} />,
      icon: <CreditCard size={14} />,
      count: 4,
      faqs: [
        {
          question: t('faq.nfts.blockchains.question'),
          answer: t('faq.nfts.blockchains.answer')
        },
        {
          question: t('faq.nfts.create.question'),
          answer: t('faq.nfts.create.answer')
        },
        {
          question: t('faq.nfts.fileTypes.question'),
          answer: t('faq.nfts.fileTypes.answer')
        },
        {
          question: t('faq.nfts.royalties.question'),
          answer: t('faq.nfts.royalties.answer')
        }
      ]
    },
    {
      id: 'support',
      name: t('faq.categories.support'),
      icon: <MessageSquare size={14} />,
      iconLarge: <MessageSquare size={18} />,
      count: 4,
      faqs: [
        {
          question: t('faq.support.contact.question'),
          answer: t('faq.support.contact.answer')
        },
        {
          question: t('faq.support.hours.question'),
          answer: t('faq.support.hours.answer')
        },
        {
          question: t('faq.support.knowledgeBase.question'),
          answer: t('faq.support.knowledgeBase.answer')
        },
        {
          question: t('faq.support.reportProblem.question'),
          answer: t('faq.support.reportProblem.answer')
        }
      ]
    }
  ];

  const activeData =
    categories.find((cat) => cat.id === activeCategory) || categories[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <Tabs
        items={categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          count: cat.count,
        }))}
        activeTab={activeCategory}
        onTabChange={setActiveCategory}
      />

      <ContentContainer
        iconLarge={activeData.iconLarge}
        title={activeData.name}
        description={t('faq.description', { category: activeData.name.toLowerCase() })}
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
