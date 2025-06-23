"use client"

import { useState } from "react"
import {
  Shirt,
  Tag,
  Calculator,
  ArrowLeft,
  Filter,
  LayoutGrid,
  List,
  Gem,
} from "lucide-react"
import {
  mockNFTStats,
  mockRewardNFTs,
  mockTabs,
} from "../constants/mock-data"
import { ViewMode } from "../types/nft"
import StatsCard from "./stats-card"
import SearchBar from "./search-bar"
import Tabs from "./tabs"
import NFTGrid from "./nft-grid"

const NFTCollection: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")

  const { totalNFTs, clothingRewards, redeemableCoupons, estimatedValue } =
    mockNFTStats

  const filteredByTab =
    activeTab === "all"
      ? mockRewardNFTs
      : mockRewardNFTs.filter((nft) => nft.category === activeTab)

  const filteredBySearch = filteredByTab.filter((item) =>
    (item.title || item.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="text-white container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="w-3 h-6" />
          <span className="ml-2 text-lg font-medium">My NFT Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={
            <Gem
              size={24}
              strokeWidth={1.5}
              className="w-5 h-5 text-purple-400"
            />
          }
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

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-purple-600"
                : "bg-transparent border border-gray-400"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-purple-600"
                : "bg-transparent border border-gray-400"
            }`}
            onClick={() => setViewMode("list")}
          >
            <List className="w-6 h-6" />
          </button>
          <button className="flex items-center space-x-2 border border-gray-400 px-4 py-2 rounded-lg text-white">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl border border-white/20 shadow-[0_0_16px_rgba(255,255,255,0.25)] p-6"
        style={{
          backgroundImage: "url('/background-image-starshop.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Tabs
          tabs={mockTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <NFTGrid nfts={filteredBySearch} />
      </div>
    </div>
  )
}

export default NFTCollection 