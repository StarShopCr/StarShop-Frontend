import { SupportTicket, TicketStats, TicketFilter } from '../types';

export const ticketStats: TicketStats = {
  total: 24,
  open: 8,
  inProgress: 12,
  resolved: 4,
  urgentCount: 2,
  avgResponseTime: '4.2 hours',
  targetResponseTime: '4 hours',
  slaTime: '8 hours',
};

export const ticketFilters: TicketFilter[] = [
  { type: 'all', count: 24 },
  { type: 'open', count: 8 },
  { type: 'in-progress', count: 12 },
  { type: 'resolved', count: 4 },
];

export const supportTickets: SupportTicket[] = [
  {
    id: 'TK-1234',
    title: 'Payment Processing Issue',
    date: 'Mar 15, 2024',
    status: 'open',
    priority: 'high',
    category: 'billing',
    timeAgo: '2 hours ago',
    messageCount: 3,
    description: 'Customer is unable to process payments through the platform.',
  },
  {
    id: 'TK-1233',
    title: 'Product Upload Error',
    date: 'Mar 14, 2024',
    status: 'in-progress',
    priority: 'medium',
    category: 'technical',
    timeAgo: '1 day ago',
    messageCount: 5,
    description: 'Error occurs when trying to upload new products to the store.',
  },
  {
    id: 'TK-1232',
    title: 'Store Settings Update',
    date: 'Mar 13, 2024',
    status: 'in-progress',
    priority: 'low',
    category: 'account',
    timeAgo: '2 days ago',
    messageCount: 2,
    description: 'Need assistance updating store settings and preferences.',
  },
  {
    id: 'TK-1231',
    title: 'API Integration Help',
    date: 'Mar 12, 2024',
    status: 'resolved',
    priority: 'medium',
    category: 'technical',
    timeAgo: '3 days ago',
    messageCount: 8,
    description: 'Help needed with API integration for third-party services.',
  },
  {
    id: 'TK-1230',
    title: 'Refund Request for Order #45678',
    date: 'Mar 11, 2024',
    status: 'open',
    priority: 'high',
    category: 'billing',
    timeAgo: '4 days ago',
    messageCount: 2,
    description: 'Customer requesting refund for order #45678 due to damaged item.',
  },
]; 