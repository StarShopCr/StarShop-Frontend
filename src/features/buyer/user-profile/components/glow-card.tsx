"use client"

import { GlowCardProps } from "../types/user"

const GlowCard: React.FC<GlowCardProps> = ({ children }) => {
  return (
    <div className="mt-6 p-6 rounded-lg border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.2)] bg-transparent">
      {children}
    </div>
  )
}

export default GlowCard 