export type NFTType = "clothing" | "coupon" | "other"
export type NFTCategory = "Clothing Rewards" | "Achievements" | "Exclusive Items" | "Other"
export type ViewMode = "grid" | "list"

export interface NFTItem {
  id: string | number
  name?: string
  title?: string
  subtitle?: string
  subtitleColor?: string
  type?: NFTType
  imageUrl?: string
  rarity: string
  rarityColor: string
  category?: NFTCategory
  store?: string
  acquired?: string
  price?: string
}

export interface NFTCardProps {
  nft: NFTItem
}

export interface NFTGridProps {
  nfts: NFTItem[]
}

export interface NFTCollectionProps {
  viewMode?: ViewMode
  searchTerm?: string
}

export interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: string
  bgColor: string
}

export interface SearchBarProps {
  searchTerm: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface Tab {
  label: string
  value: string
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (value: string) => void
}

export interface NFTRewardCardProps {
  name: string
  value: string
}

export interface NFTCollectionStats {
  totalNFTs: number
  clothingRewards: number
  redeemableCoupons: number
  estimatedValue: number
} 