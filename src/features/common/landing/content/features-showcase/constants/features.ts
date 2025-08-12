export interface Feature {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: '🔗',
    iconBg: 'bg-gradient-to-br from-[#925ff7] to-[#5478f6]',
    title: 'Blockchain Powered',
    description:
      'Built on Stellar blockchain for maximum security, transparency, and trust in every transaction.',
  },
  {
    icon: '🎨',
    iconBg: 'bg-gradient-to-br from-[#348ee5] to-[#1cadb6]',
    title: 'Exclusive NFTs',
    description:
      'Receive unique digital collectibles with every purchase. Build your collection while shopping.',
  },
  {
    icon: '🛡️',
    iconBg: 'bg-gradient-to-br from-[#17bb98] to-[#1fc265]',
    title: 'Verified Sellers',
    description:
      'All sellers are verified and earn milestone NFTs that showcase their credibility and success.',
  },
  {
    icon: '⚡',
    iconBg: 'bg-gradient-to-br from-[#54614a] to-[#b0b821]',
    title: 'Instant Transactions',
    description:
      "Lightning-fast payments with minimal fees thanks to Stellar's efficient blockchain technology.",
  },
  {
    icon: '🌐',
    iconBg: 'bg-gradient-to-br from-[#eda60a] to-[#f58413]',
    title: 'Global Marketplace',
    description:
      'Connect with buyers and sellers worldwide in a truly decentralized marketplace ecosystem.',
  },
  {
    icon: '📊',
    iconBg: 'bg-gradient-to-br from-[#f76822] to-[#f14f3a]',
    title: 'Analytics Dashboard',
    description:
      'Comprehensive insights and analytics to help businesses grow and optimize their performance.',
  },
];

export const FEATURES_HEADER = {
  badge: {
    icon: '✨',
    text: 'Why Choose StarShop',
  },
  title: {
    main: 'Revolutionary Features for',
    highlight: 'Modern Commerce',
  },
  description:
    'Experience the future of e-commerce with cutting-edge blockchain technology, exclusive NFT rewards, and a transparent marketplace ecosystem.',
};
