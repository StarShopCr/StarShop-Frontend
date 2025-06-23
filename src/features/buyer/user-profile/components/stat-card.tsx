"use client"

import { StatCardProps } from "../types/user"

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, description, color }) => (
  <div className="flex items-center p-4 rounded-lg bg-[#1a1b1e]/30">
    <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${color}-900/30`}>
      <Icon className={`text-${color}-400 w-5 h-5`} />
    </div>

    <div className="ml-4 flex-1">
      <p className="text-base font-medium text-white">{label}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>

    <div className="text-right">
      <p className="text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  </div>
)

export default StatCard 