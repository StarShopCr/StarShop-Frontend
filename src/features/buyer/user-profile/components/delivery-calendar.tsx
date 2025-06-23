"use client"

import { Calendar, Clock } from "lucide-react"
import { DeliveryCalendarProps } from "../types/user"
import { getDeliveryIconAndColor } from "../constants/status-colors"

const DeliveryCalendar: React.FC<DeliveryCalendarProps> = ({ type, date }) => {
  const { icon: iconName, color } = getDeliveryIconAndColor(type)
  
  const Icon = iconName === 'Clock' ? Clock : Calendar

  return (
    <div className="flex items-center p-4 rounded-lg bg-[#1a1b1e]/30">
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${color}-900/30`}>
        <Icon className={`text-${color}-400 w-5 h-5`} />
      </div>

      <div className="ml-4 flex-1">
        <p className="text-base font-medium text-white">{type}</p>
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryCalendar 