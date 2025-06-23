"use client"

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { TransactionItemProps } from "../types/transaction"

const TransactionItem: React.FC<TransactionItemProps> = ({ title, date, id, amount, status, type }) => {
  return (
    <div className="flex items-center bg-gray-800/50 p-4 rounded-lg">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg ${
          type === "income" ? "bg-green-900/30" : "bg-red-900/30"
        }`}
      >
        {type === "income" ? (
          <ArrowDownLeft className="text-green-400 w-5 h-5" />
        ) : (
          <ArrowUpRight className="text-red-400 w-5 h-5" />
        )}
      </div>

      <div className="ml-4 flex-1">
        <h4 className="text-base font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400">{date} • {id}</p>
      </div>

      <div className="text-right">
        <p className={`text-lg font-semibold ${type === "income" ? "text-green-400" : "text-red-400"}`}>
          {type === "income" ? "+" : "-"}${Math.abs(amount).toFixed(2)}
        </p>
        <p className="text-sm text-gray-400">{status}</p>
      </div>
    </div>
  )
}

export default TransactionItem 