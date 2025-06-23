"use client"

import { StatsCardProps } from "../types/nft"

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, bgColor }) => {
  return (
    <div className={`bg-[#1a1b1e]/30 rounded-lg p-4 border border-gray-800`}>
      <div className="flex items-start">
        <div className="p-2 rounded-full bg-gray-800/50">{icon}</div>
        <div className="ml-2">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-1 text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default StatsCard 