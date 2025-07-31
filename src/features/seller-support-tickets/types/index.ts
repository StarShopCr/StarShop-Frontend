export interface SupportTicket {
  id: string;
  title: string;
  date: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  category: 'billing' | 'technical' | 'account' | 'general';
  timeAgo: string;
  messageCount: number;
  description?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgentCount: number;
  avgResponseTime: string;
  targetResponseTime: string;
  slaTime: string;
}

export interface TicketFilter {
  type: 'all' | 'open' | 'in-progress' | 'resolved';
  count: number;
} 