"use client"

import { Check, Store, User} from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import StarShopLanding from "../../../../public/starshop-logos/StarShop-Logo-Landing.svg"

export default function StepTwoContent(): JSX.Element {
    const [activeProfile, setActiveProfile] = useState<"buyer" | "seller" | null>(null)

  return (
    <div className="w-full  flex flex-col items-center justify-center p-6">
    <Image src={StarShopLanding} alt="StarShop Logo" width={70} height={70} className="" />

      <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-center mb-2">Choose your profile</h1>
      <p className="text-gray-400 text-center mb-8">Select how you want to use StarShop marketplace</p>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setActiveProfile("buyer")}
          className={`group 
            p-6 
            rounded-xl 
            bg-[#0c0b1d]  
            shadow-[0_0_15px_-3px_rgba(127,79,210,0.2),0_8px_25px_-5px_rgba(127,79,210,0.3)] 
            hover:shadow-[0_0_15px_-3px_rgba(127,79,210,0.9),0_12px_30px_-5px_rgba(127,79,210,0.4)] 
            border-2 border-[#A855f7] 
            transition-all 
            duration-300 
            backdrop-blur-sm 
            relative overflow-hidden ${
            activeProfile === "buyer" 
            ? 
            `border-purple-300 
            shadow-[0_0_15px_-3px_rgba(127,79,210,0.9),0_12px_30px_-5px_rgba(127,79,210,0.4)]` 
            : `border-[#A855f7] `
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/10 mb-4">
              <User size={24} className="text-purple-400" />
            </div>

            <h3 className="text-xl text-left font-bold text-[#E9D5FF] mb-2">Buyer</h3>
            <p className="text-sm text-[#D1D5DB] mb-6 min-w-[280px] text-left">
              Shop from unique stores and collect NFTs with <br></br> every purchase
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-purple-400" />
                <span className="text-sm text-[#D1D5DB]">Browse thousands of products</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-purple-400" />
                <span className="text-sm text-[#D1D5DB]">Earn collectible NFTs</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-purple-400" />
                <span className="text-sm text-[#D1D5DB]">Secure blockchain payments</span>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveProfile("seller")}
          className={`group 
             p-6 
            rounded-xl 
            bg-[#0c0b1d]  
            shadow-[0_0_15px_-3px_rgba(127,79,210,0.2),0_8px_25px_-5px_rgba(127,79,210,0.3)] 
            hover:shadow-[0_0_15px_-3px_rgba(127,79,210,0.9),0_12px_30px_-5px_rgba(127,79,210,0.4)] 
            border-2 border-[#A855f7] 
            transition-all 
            duration-300 
            backdrop-blur-sm 
            relative overflow-hidden ${
            activeProfile === "seller" 
            ? 
            `
            border-purple-300 
            shadow-[0_0_15px_-3px_rgba(127,79,210,0.9),0_12px_30px_-5px_rgba(127,79,210,0.4)]` 
            : `border-[#a855f7] `
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/10 mb-4">
              <Store size={24} className="text-purple-400" />
            </div>

            <h3 className="text-xl text-left font-bold text-[#E9D5FF] mb-2">Seller</h3>
            <p className="text-sm text-[#D1D5DB] mb-6 min-w-[280px] text-left">
              Open your store and start selling to crypto-savvy <br></br> customers
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-purple-400" />
                <span className="text-sm text-[#D1D5DB]">Create your own store</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-purple-400" />
                <span className="text-sm text-[#D1D5DB]">Manage products & orders</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-purple-400" />
                <span className="text-sm text-[#D1D5DB]">Milestone NFT rewards</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}



