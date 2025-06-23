"use client"

import Link from "next/link"
import { Info, ExternalLink } from "lucide-react"
import { NFTCardProps } from "../types/nft"

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => (
  <div className="overflow-hidden rounded-lg bg-white bg-opacity-10">
    {/* Image placeholder and rarity badge */}
    <div className="relative h-40 bg-gray-200">
      <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${nft.rarityColor}`}>
        {nft.rarity}
      </span>
    </div>
    {/* Details */}
    <div className="p-4">
      <h3 className="font-semibold text-white">{nft.title || nft.name}</h3>
      {nft.subtitle && (
        <p className="text-sm text-gray-300 mt-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${nft.subtitleColor}`}>
            {nft.subtitle}
          </span>
        </p>
      )}
      {nft.store && <p className="text-sm text-gray-400 mt-2">{nft.store}</p>}
      {nft.acquired && <p className="text-sm text-gray-400 mt-2">Acquired: {nft.acquired}</p>}
      {/* Action buttons */}
      <div className="flex gap-2 mt-4 justify-between">
        <Link href="/">
          <button className="flex items-center gap-1 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm hover:bg-opacity-70 transition">
            <Info className="h-3.5 w-3.5" />
            Details
          </button>
        </Link>
        <Link href="/">
          <button className="flex items-center gap-1 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm hover:bg-opacity-70 transition">
            <ExternalLink className="h-3.5 w-3.5" />
            View on Stellar
          </button>
        </Link>
      </div>
    </div>
  </div>
)

export default NFTCard 