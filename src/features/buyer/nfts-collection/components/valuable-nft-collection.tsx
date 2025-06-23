"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { mockValuableNFTs } from "../constants/mock-data"

const ValuableNFTCollection: React.FC = () => {
  return (
    <section className="relative rounded-xl p-6 bg-gradient-to-br from-[#ff80bf] via-[#caa9ff] to-[#80d0ff]">

      <div className=" inset-0  opacity-20 pointer-events-none rounded-xl z-0" />

      <div className="relative z-10 text-left space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-white">Valuable NFT Collection</h2>
        <p className="text-gray-400">
          Your most valuable NFTs that can be traded or sold on the Stellar marketplace
        </p>
      </div>

      <div className="relative z-10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {mockValuableNFTs.map((nft) => (
            <div key={nft.id} className="overflow-hidden rounded-lg border/0">
              <div className="relative h-40 bg-gray-700 rounded-lg">
                <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${nft.rarityColor}`}>
                  {nft.rarity}
                </span>
              </div>
              <div className="p-4 bg-transparent rounded-b-lg">
                <h3 className="font-semibold text-white">{nft.title}</h3>
                <p className="text-sm text-gray-400">{nft.subtitle}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-purple-300">{nft.price}</span>
                  <Link href="/">
                    <button className="flex items-center gap-1 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm hover:bg-opacity-70 transition">
                      View
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Link href="/">
            <button className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md border border-gray-700 hover:bg-opacity-70 transition">
              View Stellar NFT Trading Platform
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ValuableNFTCollection
