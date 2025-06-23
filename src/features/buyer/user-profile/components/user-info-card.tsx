"use client"

import Image from "next/image"
import { Mail } from "lucide-react"
import { UserInfoCardProps } from "../types/user"

const UserInfoCard: React.FC<UserInfoCardProps> = ({ name, membershipType, avatar }) => {
  return (
    <div className="text-center">
      <div className="relative inline-block">
        <Image
          src={avatar}
          alt={name}
          width={100}
          height={100}
          className="rounded-full mx-auto"
        />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">{name}</h2>
      <p className="text-purple-500 mb-4">{membershipType}</p>
      <button className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg text-white hover:bg-purple-500/30 transition-colors border border-purple-500">
        <Mail className="w-5 h-5" />
      </button>
    </div>
  )
}

export default UserInfoCard 