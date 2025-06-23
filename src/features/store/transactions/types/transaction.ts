export type TransactionType = "income" | "expense"
export type TransactionStatus = "Completed" | "Processing" | "Pending" | "Failed"

export interface Transaction {
  id: string
  title: string
  date: string
  amount: number
  status: TransactionStatus
  type: TransactionType
}

export interface TransactionItemProps {
  id: string
  title: string
  date: string
  amount: number
  status: TransactionStatus
  type: TransactionType
}

export interface TransactionSummaryProps {
  title: string
  amount: number
  color: string
}

export interface TransactionSummaryData {
  title: string
  amount: number
  color: string
} 