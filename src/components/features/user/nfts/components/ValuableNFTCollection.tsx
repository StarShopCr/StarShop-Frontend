"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const nfts = [
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
];

const ValuableNFTCollection: React.FC = () => {
  return (
    <section className="text-white w-full"
    style={{
      backgroundImage: "url('/background-image-starshop.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div className="mx-[100px] flex flex-col">
        {/* Heading Section */}
        <div className="my-4 md:my-2 sm:my-0">
          <h1 className="text-3xl font-bold py-3">Valuable NFT Collection</h1>
          <p className="text-gray-400">
            Your most valuable NFTs that can be traded or sold on the Stellar marketplace
          </p>
        </div>

        {/* NFT Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full py-5 rounded-lg">
          {nfts.map((nft) => (
            <div key={nft.id} className="overflow-hidden rounded-lg border/0 ">
              <div className="relative h-40 bg-gray-200">
                <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${nft.rarityColor}`}>
                  {nft.rarity}
                </span>
              </div>
              <div className="p-4 bg-white bg-opacity-10  rounded-b-lg">
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

        {/* View More Button */}
        <div className="flex justify-center py-4">
          <Link href="/">
            <button className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md border border-gray-700 hover:bg-opacity-70 transition">
              View Stellar NFT Trading Platform
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ValuableNFTCollection;
