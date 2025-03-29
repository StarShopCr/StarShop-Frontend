export type FAQCategory = 'general' | 'buying' | 'selling' | 'payments' | 'nfts' | 'support';

export interface FAQ {
  question: string;
  answer: string;
  category: FAQCategory;
}

export const faqs: FAQ[] = [
  { 
    question: "What is StarShop Marketplace?", 
    answer: "StarShop is a decentralized marketplace for digital goods powered by Stellar blockchain technology. Users can buy, sell, and trade NFTs and other digital assets securely.",
    category: "general" 
  },
  { 
    question: "How do I create an account?", 
    answer: "To create an account, click on the 'Sign Up' button in the top right corner of the homepage. You'll need to provide an email address and create a password. You'll also need to set up a wallet to interact with the marketplace.",
    category: "general" 
  },
  { 
    question: "Is StarShop available worldwide?", 
    answer: "Yes, StarShop is available globally. However, certain features may be restricted in some regions due to regulatory requirements.",
    category: "general" 
  },
  { 
    question: "What currencies are accepted on StarShop?", 
    answer: "StarShop accepts Stellar (XLM), USDC on Stellar, as well as several other Stellar-based tokens. We do not currently accept fiat currencies directly.",
    category: "general" 
  },
  {
    question: "How can I make payments on StarShop?",
    answer: "You can make payments using Stellar-based tokens. Simply connect your wallet, select the item you want to purchase, and confirm the transaction in your wallet.",
    category: "payments"
  },
  {
    question: "How do I list an item for sale?",
    answer: "To list an item for sale, go to your profile, click 'Create', upload your digital asset, fill in the details, set your price, and click 'List Item'.",
    category: "selling"
  },
  {
    question: "What types of NFTs can I buy on StarShop?",
    answer: "StarShop supports various types of NFTs including digital art, collectibles, music, videos, and in-game items.",
    category: "nfts"
  },
  {
    question: "How do I purchase an NFT?",
    answer: "To buy an NFT, browse the marketplace, select the item you want, click 'Buy Now' or place a bid, and confirm the transaction with your connected wallet.",
    category: "buying"
  },
  {
    question: "How can I contact support?",
    answer: "You can contact our support team by clicking on 'Contact Support' in the help section or by sending an email to support@starshop.com.",
    category: "support"
  }
];