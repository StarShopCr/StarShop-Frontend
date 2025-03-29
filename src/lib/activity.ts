import { ActivityEvent } from "@/types/activity";

export async function fetchRecentActivities(): Promise<ActivityEvent[]> {
  const recentActivities: ActivityEvent[] = [
    {
      id: "1",
      type: "INVOICE_PAID",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      invoiceNumber: "INV-2024-001",
      invoiceId: "001",
      clientName: "John Doe",
    },
    {
      id: "2",
      type: "INVOICE_CREATED",
      timestamp: new Date(Date.now() - 18000000), // 5 hours ago
      invoiceNumber: "INV-2024-008",
      invoiceId: "008",
      clientName: "Alex Turner",
    },
    {
      id: "3",
      type: "PAYMENT_REMINDER_SENT",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago (Yesterday)
      invoiceNumber: "INV-2024-005",
      invoiceId: "005",
      clientName: "Robert Wilson",
    },
  ];

  return recentActivities;
}
