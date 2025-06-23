"use client"

import { useState } from "react"
import { 
  Diamond, 
  Shirt, 
  Tag, 
  DollarSign,
  Calculator, 
  ArrowLeft, 
  Filter,
  LayoutGrid,
  List,
  Gem
} from "lucide-react"
import { mockNFTItems, mockNFTStats } from "../constants/mock-data"
import StatsCard from "./stats-card"

const NFTCollectionOverview: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = mockNFTItems.filter((item) =>
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { totalNFTs, clothingRewards, redeemableCoupons, estimatedValue } = mockNFTStats

  return (
    <div className="text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button className="flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="w-3 h-6" />
            <span className="ml-2 text-lg font-medium">My NFT Collection</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={<Gem size={24} strokeWidth={1.5} className="w-5 h-5 text-purple-400" />}
            title="Total NFTs"
            value={`${totalNFTs}`}
            bgColor="bg-[#1a1b1e]/30"
          />
          <StatsCard
            icon={<Shirt className="w-5 h-5 text-blue-400" />}
            title="Clothing Rewards"
            value={`${clothingRewards}`}
            bgColor="bg-[#1a1b1e]/30"
          />
          <StatsCard
            icon={<Tag className="w-5 h-5 text-yellow-400" />}
            title="Redeemable Coupons"
            value={`${redeemableCoupons}`}
            bgColor="bg-[#1a1b1e]/30"
          />
          <StatsCard
            icon={<Calculator className="w-5 h-5 text-green-400" />}
            title="Estimated Value"
            value={`${estimatedValue} XLM`}
            bgColor="bg-[#1a1b1e]/30"
          />
        </div>

      </div>
    </div>
  )
}

export default NFTCollectionOverview 