"use client"

import { TransactionSummaryProps } from "../types/transaction"

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ title, amount, color }) => {
  return (
    <div className="p-4 rounded-lg border border-white/20 shadow-[0px_2px_8px_2px_rgba(255,255,255,0.15)] bg-transparent text-left">
      <h4 className={`text-sm font-medium ${color}`}>{title}</h4>
      <p className="text-2xl font-bold text-white">${amount.toFixed(2)}</p>
    </div>
  )
}

export default TransactionSummary 