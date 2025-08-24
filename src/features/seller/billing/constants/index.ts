import type { Transaction, Plan, WalletInfo } from '../types';

export const MOCK_WALLET: WalletInfo = {
  isVerified: true,
  address: 'GBCXF...AQTLA',
  balance: '1,234.5678',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    name: 'Premium Store Subscription',
    date: 'Mar 1, 2024',
    amount: '50',
    status: 'Confirmed',
  },
  {
    id: '2',
    name: 'Premium Store Subscription',
    date: 'Feb 1, 2024',
    amount: '50',
    status: 'Confirmed',
  },
  {
    id: '3',
    name: 'Premium Store Subscription',
    date: 'Jan 1, 2024',
    amount: '50',
    status: 'Confirmed',
  },
];

export const CURRENT_PLAN: Plan = {
  name: 'Premium Store Plan',
  price: '50 XLM / month',
  description: 'Unlimited products, priority support, and advanced analytics',
  nextBillingDate: 'April 1, 2024',
};
