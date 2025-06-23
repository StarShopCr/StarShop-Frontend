"use client"

import {
  NFTCollection,
  ExclusiveNFTRewards,
  ValuableNFTCollection,
} from "@/features/buyer/nfts-collection"

export default function NFTRewardsPage() {
  return (
    <main className="p-6 space-y-8">
      <NFTCollection />

      <div
        className="rounded-2xl border border-white/20 shadow-[0_0_16px_rgba(255,255,255,0.25)] p-6 lg:p-12 space-y-12"
        style={{
          backgroundImage: "url('/background-image-starshop.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <ExclusiveNFTRewards />
        <ValuableNFTCollection />
      </div>
    </main>
  )
}
