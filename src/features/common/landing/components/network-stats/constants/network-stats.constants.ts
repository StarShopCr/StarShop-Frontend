import type { NetworkStatItem, StatCardGradient } from '../types/network-stats.types';

export const DEFAULT_PILL_LABEL = 'Real-Time Network Stats';
export const DEFAULT_TITLE_PREFIX = 'Powering the ';
export const DEFAULT_TITLE_HIGHLIGHT = 'Future';
export const DEFAULT_TITLE_SUFFIX = ' of Commerce';
export const DEFAULT_DESCRIPTION =
  'Our blockchain-powered marketplace is processing thousands of transactions daily, creating a new standard for transparent and secure e-commerce.';

export const GRADIENT_MAP: Record<StatCardGradient, string> = {
  blue: 'from-blue-600 to-cyan-500 text-white shadow-blue-500/20',
  purple: 'from-pink-500 to-purple-600 text-white shadow-purple-500/20',
  green: 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
  orange: 'from-amber-500 to-orange-600 text-white shadow-orange-500/20',
};

export const DEFAULT_NETWORK_STATS: NetworkStatItem[] = [
  {
    id: 'total-transactions',
    value: '1,547,892',
    rawValue: 1547892,
    label: 'Total Transactions',
    gradient: 'blue',
    iconName: 'credit-card',
    ariaLabel: 'Total Transactions: 1,547,892',
  },
  {
    id: 'nfts-minted',
    value: '89,456',
    rawValue: 89456,
    label: 'NFTs Minted',
    gradient: 'purple',
    iconName: 'palette',
    ariaLabel: 'NFTs Minted: 89,456',
  },
  {
    id: 'active-users',
    value: '32,589',
    rawValue: 32589,
    label: 'Active Users',
    gradient: 'green',
    iconName: 'users',
    ariaLabel: 'Active Users: 32,589',
  },
  {
    id: 'total-volume',
    value: '$2,847M',
    rawValue: 2847000000,
    label: 'Total Volume',
    gradient: 'orange',
    iconName: 'wallet',
    ariaLabel: 'Total Volume: 2,847 Million Dollars',
  },
];
