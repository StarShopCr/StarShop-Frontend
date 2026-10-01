import React from 'react';
import { CreditCard, Palette, Users, Wallet } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}

const StatCard = ({ label, value, icon, gradient }: StatCardProps) => (
  <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 p-6 border border-zinc-800 transition-all hover:border-zinc-700 group">
    {/* Starry Noise Background Effect */}
    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    
    <div className="relative z-10 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient} text-white shadow-lg`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24, className: "aria-hidden:true" })}
      </div>
      
      <div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {value}
        </h3>
        <p className="text-sm md:text-base text-zinc-400 font-medium mt-1">
          {label}
        </p>
      </div>
    </div>
  </div>
);

export const NetworkStats = () => {
  const stats = [
    {
      label: 'Total Transactions',
      value: '1,547,892',
      icon: <CreditCard />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    },
    {
      label: 'NFTs Minted',
      value: '89,456',
      icon: <Palette />,
      gradient: 'bg-gradient-to-br from-pink-500 to-purple-600',
    },
    {
      label: 'Active Users',
      value: '32,589',
      icon: <Users />,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-700',
    },
    {
      label: 'Total Volume',
      value: '$2,847M',
      icon: <Wallet />,
      gradient: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
  ];

  return (
    <section 
      className="py-20 px-4 max-w-7xl mx-auto w-full" 
      aria-labelledby="network-stats-title"
    >
      <div className="text-center mb-16 space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold tracking-wide uppercase border border-zinc-700">
          Real-Time Network Stats
        </span>
        
        <h2 
          id="network-stats-title" 
          className="text-4xl md:text-6xl font-bold text-white tracking-tight"
        >
          Powering the <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Future</span> of Commerce
        </h2>
        
        <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed">
          Our blockchain-powered marketplace is processing thousands of transactions daily, 
          creating a new standard for transparent and secure e-commerce.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </section>
  );
};
