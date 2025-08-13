import React, { useState, useEffect } from 'react';

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  icon: string;
  color: string;
}

const initialStats: StatItem[] = [
  {
    label: 'Total Transactions',
    value: 1547892,
    suffix: '',
    prefix: '',
    icon: '💳',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'NFTs Minted',
    value: 89456,
    suffix: '',
    prefix: '',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500'
  },
  {
    label: 'Active Users',
    value: 32589,
    suffix: '',
    prefix: '',
    icon: '👥',
    color: 'from-green-500 to-teal-500'
  },
  {
    label: 'Total Volume',
    value: 2847,
    suffix: 'M',
    prefix: '$',
    icon: '💰',
    color: 'from-yellow-500 to-orange-500'
  }
];

const CountUpNumber = ({ value, duration = 1500 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Use easing function for smoother animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOutCubic * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, hasStarted]);

  // Start animation when component comes into view
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return <span>{displayValue.toLocaleString()}</span>;
};

const StatCard = ({ stat, index }: { stat: StatItem; index: number }) => (
  <div
    className={`group relative p-8 bg-white/10 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 hover:translate-y-[-8px] will-change-transform ${
      index % 2 === 1 ? 'mt-8' : ''
    }`}
  >
    {/* Animated Background */}
    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-15 rounded-3xl transition-opacity duration-200`}></div>
    
    {/* Animated Border Effect */}
    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-200 p-[2px]`}>
      <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-3xl"></div>
    </div>
    
    {/* Icon Background */}
    <div className={`relative z-10 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-105 transition-transform duration-200`}>
      {stat.icon}
    </div>
    
    {/* Stats */}
    <div className="relative z-10">
      <div className="text-4xl font-bold text-white mb-2">
        {stat.prefix}
        <CountUpNumber value={stat.value} />
        {stat.suffix}
      </div>
      <div className="text-lg text-gray-300 font-medium">{stat.label}</div>
    </div>
  </div>
);

export default function NetworkStats() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Section is now visible - could add animations here if needed
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section 
      id="stats-section" 
      className="relative py-20 overflow-hidden"
    >
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="text-sm font-semibold text-white">
              📊 Real-Time Network Stats
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Powering the
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Future</span>
            <br />of Commerce
          </h2>
          
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Our blockchain-powered marketplace is processing thousands of transactions daily, 
            creating a new standard for transparent and secure e-commerce.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {initialStats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
