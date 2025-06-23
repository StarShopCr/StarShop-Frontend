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

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search NFTs..."
              className="w-full bg-[#1a1b1e]/30 border border-gray-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              className={`p-2 rounded-lg ${
                viewMode === "grid" ? "bg-purple-600" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-6 h-6" />
            </button>
            <button
              className={`p-2 rounded-lg ${
                viewMode === "list" ? "bg-purple-600" : " border border-gray-400 "
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-6 h-6" />
            </button>
            <button className="flex items-center space-x-2 border border-gray-400 border-1 px-4 py-2 rounded-lg">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFTCollectionOverview 