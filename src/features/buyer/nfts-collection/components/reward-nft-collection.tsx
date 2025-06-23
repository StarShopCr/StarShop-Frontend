"use client"

import { useState } from "react"
import { LayoutGrid, List, Filter } from "lucide-react"
import { mockRewardNFTs, mockTabs } from "../constants/mock-data"
import SearchBar from "./search-bar"
import Tabs from "./tabs"
import NFTGrid from "./nft-grid"

const RewardNFTCollection: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter NFTs by active tab
  const filteredNFTs = activeTab === "all" 
    ? mockRewardNFTs 
    : mockRewardNFTs.filter((nft) => nft.category === activeTab)

  return (
    <>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4" >
        <SearchBar searchTerm={searchTerm} onSearchChange={(e) => setSearchTerm(e.target.value)} />
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-purple-600" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-purple-600 text-white"
                : "border border-gray-400 text-white"
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

      <div className="rounded-2xl border border-white/60 shadow-[0_0_16px_rgba(255,255,255,0.25)] bg-transparent">
        <section
          className="w-full text-white rounded-2xl p-6"
          style={{
            backgroundImage: "url('/background-image-starshop.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col">
            <Tabs tabs={mockTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            {/* NFT Grid */}
            <NFTGrid nfts={filteredNFTs} />
          </div>
        </section>
      </div>
    </>
  )
}

export default RewardNFTCollection 