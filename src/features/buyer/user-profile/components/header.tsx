"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HeaderProps } from "../types/user"

const Header: React.FC<HeaderProps> = ({ title, backLink, activeDate }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {backLink ? (
        <Link 
          href={backLink} 
          className="flex items-center gap-2 text-xl text-white hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" /> {title}
        </Link>
      ) : (
        <h1 className="text-xl text-white">{title}</h1>
      )}
      {activeDate && <span className="text-white">Active {activeDate}</span>}
    </div>
  )
}

export default Header 