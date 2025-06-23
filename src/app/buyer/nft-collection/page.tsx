"use client"

import { 
  NFTCollectionOverview, 
  ExclusiveNFTRewards, 
  ValuableNFTCollection, 
  RewardNFTCollection 
} from "@/features/buyer/nfts-collection"

export default function NFTRewardsPage() {
  return (
    <main className="p-6">
      <NFTCollectionOverview />
      <RewardNFTCollection />
      <ValuableNFTCollection />
      <ExclusiveNFTRewards />

    </main>
  )
}
