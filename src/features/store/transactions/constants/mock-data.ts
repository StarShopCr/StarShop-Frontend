import { Transaction, TransactionSummaryData } from "../types/transaction"

export const mockTransactions: Transaction[] = [
  {
    id: "TX123456",
    title: "Order #8832 - Premium Hoodie",
    date: "Mar 15, 2024",
    amount: 156.0,
    status: "Completed",
    type: "income",
  },
  {
    id: "TX123455",
    title: "Weekly Payout",
    date: "Mar 14, 2024",
    amount: -890.0,
    status: "Processing",
    type: "expense",
  },
  {
    id: "TX123454",
    title: "Order #8831 - Urban Pants",
    date: "Mar 13, 2024",
    amount: 89.99,
    status: "Completed",
    type: "income",
  },
  {
    id: "TX123453",
    title: "Order #8830 - Limited Sneakers",
    date: "Mar 12, 2024",
    amount: 129.99,
    status: "Completed",
    type: "income",
  },
  {
    id: "TX123452",
    title: "Weekly Payout",
    date: "Mar 11, 2024",
    amount: -750.0,
    status: "Completed",
    type: "expense",
  },
]

export const mockTransactionSummaries: TransactionSummaryData[] = [
  {
    title: "Total Revenue",
    amount: 12567.89,
    color: "text-green-400",
  },
  {
    title: "Pending Payouts",
    amount: 890.0,
    color: "text-blue-400",
  },
  {
    title: "Available Balance",
    amount: 3456.78,
    color: "text-purple-400",
  },
] 