"use client"

import { Package } from "lucide-react"
import { UserOrderItemProps } from "../types/user"
import { getOrderStatusColor } from "../constants/status-colors"

const UserOrderItem: React.FC<UserOrderItemProps> = ({ title, date, id, amount, status }) => {
  const statusColors = getOrderStatusColor(status)

  return (
    <div className={`flex items-center p-4 rounded-lg ${statusColors.bg}`}>
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg ${statusColors.bg}`}
      >
        <Package className={`${statusColors.text} w-5 h-5`} />
      </div>

      <div className="ml-4 flex-1">
        <h4 className="text-base font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400">{date} • {id}</p>
      </div>

      <div className="text-right">
        {/* Optional price in this component */}
        {/* <p className="text-lg font-semibold text-white">
          ${amount.toFixed(2)}
        </p> */}
        <p className={`text-sm font-medium ${statusColors.text} capitalize`}>
          {status}
        </p>
        <button className={`text-sm text-gray-400 hover:underline mt-1`}>
          Track order
        </button>
      </div>
    </div>
  )
}

export default UserOrderItem 