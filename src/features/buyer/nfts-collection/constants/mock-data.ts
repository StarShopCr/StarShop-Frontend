import { NFTItem, NFTCollectionStats } from "../types/nft"

export const mockNFTItems: NFTItem[] = [
  {
    id: "1",
    name: "Cosmic Hoodie",
    type: "clothing",
    imageUrl: "/nft-hoodie.png",
    rarity: "Rare",
    rarityColor: "bg-blue-100 text-blue-800",
  },
  {
    id: "2",
    name: "Galaxy Shirt",
    type: "clothing",
    imageUrl: "/nft-shirt.png",
    rarity: "Common",
    rarityColor: "bg-gray-100 text-gray-800",
  },
  {
    id: "3",
    name: "50% Off Coupon",
    type: "coupon",
    imageUrl: "/nft-coupon.png",
    rarity: "Epic",
    rarityColor: "bg-purple-100 text-purple-800",
  },
]

export const mockRewardNFTs: NFTItem[] = [
  {
    id: 1,
    title: "Urban Style Collector",
    subtitle: "Purchase Reward",
    subtitleColor: "bg-[#3B82F61A] text-[#60A5FA]",
    store: "Urban Style Store",
    acquired: "Mar 15, 2024",
    rarity: "Uncommon",
    rarityColor: "bg-[#22C55E33] text-[#4ADE80]",
    category: "Clothing Rewards",
  },
  {
    id: 2,
    title: "Tech Enthusiast",
    subtitle: "Purchase Reward",
    subtitleColor: "bg-[#3B82F61A] text-[#60A5FA]",
    store: "Tech Gadgets",
    acquired: "Mar 15, 2024",
    rarity: "Rare",
    rarityColor: "bg-[#3B82F633] text-[#60A5FA]",
    category: "Other",
  },
  {
    id: 3,
    title: "Fashion Pioneer",
    subtitle: "Achievement",
    subtitleColor: "bg-[#A855F71A] text-[#C084FC]",
    store: "Starshop",
    acquired: "Mar 10, 2024",
    rarity: "Epic",
    rarityColor: "bg-[#A855F733] text-[#C084FC]",
    category: "Achievements",
  },
  {
    id: 4,
    title: "Early Adopter",
    subtitle: "Special Edition",
    subtitleColor: "bg-[#F59E0B1A] text-[#FBBF24]",
    store: "Starshop",
    acquired: "Feb 29, 2024",
    rarity: "Legendary",
    rarityColor: "bg-[#F59E0B33] text-[#FBBF24]",
    category: "Exclusive Items",
  },
  {
    id: 5,
    title: "Eco Warrior",
    subtitle: "Purchase Reward",
    subtitleColor: "bg-[#3B82F61A] text-[#60A5FA]",
    store: "Eco Friendly Shop",
    acquired: "Feb 29, 2024",
    rarity: "Uncommon",
    rarityColor: "bg-[#22C55E33] text-[#4ADE80]",
    category: "Other",
  },
  {
    id: 6,
    title: "Stellar Spender",
    subtitle: "Achievement",
    subtitleColor: "bg-[#A855F71A] text-[#C084FC]",
    store: "Starshop",
    acquired: "Feb 15, 2024",
    rarity: "Rare",
    rarityColor: "bg-[#3B82F633] text-[#60A5FA]",
    category: "Achievements",
  },
]

export const mockValuableNFTs: NFTItem[] = [
  {
    id: 1,
    title: "Early Adopter",
    subtitle: "Special Edition",
    price: "~500 XLM",
    rarity: "Legendary",
    rarityColor: "bg-amber-100 text-amber-800",
  },
  {
    id: 2,
    title: "Fashion Pioneer",
    subtitle: "Achievement",
    price: "~350 XLM",
    rarity: "Epic",
    rarityColor: "bg-purple-100 text-purple-800",
  },
  {
    id: 3,
    title: "Limited Collection #1",
    subtitle: "Exclusive",
    price: "~200 XLM",
    rarity: "Rare",
    rarityColor: "bg-blue-100 text-blue-800",
  },
  {
    id: 4,
    title: "Designer Collaboration",
    subtitle: "Exclusive",
    price: "~450 XLM",
    rarity: "Epic",
    rarityColor: "bg-purple-100 text-purple-800",
  },
]

export const mockTabs = [
  { label: "All NFTs", value: "all" },
  { label: "Clothing Rewards", value: "Clothing Rewards" },
  { label: "Achievements", value: "Achievements" },
  { label: "Exclusive Items", value: "Exclusive Items" },
]

export const mockNFTStats: NFTCollectionStats = {
  totalNFTs: 3,
  clothingRewards: 2,
  redeemableCoupons: 1,
  estimatedValue: 450,
} 