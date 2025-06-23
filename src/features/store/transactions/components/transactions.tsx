"use client"

import { mockTransactions, mockTransactionSummaries } from "../constants/mock-data"
import TransactionSummary from "./transaction-summary"
import TransactionItem from "./transaction-item"

const Transactions: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-white text-left">
          Transactions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {mockTransactionSummaries.map((summary, index) => (
            <TransactionSummary
              key={index}
              title={summary.title}
              amount={summary.amount}
              color={summary.color}
            />
          ))}
        </div>

        <div className="bg-transparent border border-white/20 shadow-[0px_2px_8px_2px_rgba(255,255,255,0.15)] p-4 rounded-lg">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {mockTransactions.map((tx) => (
              <TransactionItem key={tx.id} {...tx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transactions 