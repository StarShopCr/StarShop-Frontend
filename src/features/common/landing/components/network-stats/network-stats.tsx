import * as React from 'react';

interface StatCard {
  value: string;
  label: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
}

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const PaletteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
    <circle cx="6.5" cy="12" r="0.5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MoneyBagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const STATS: StatCard[] = [
  {
    value: '1,547,892',
    label: 'Total Transactions',
    icon: <CreditCardIcon />,
    gradientFrom: '#3b82f6',
    gradientTo: '#06b6d4',
  },
  {
    value: '89,456',
    label: 'NFTs Minted',
    icon: <PaletteIcon />,
    gradientFrom: '#ec4899',
    gradientTo: '#8b5cf6',
  },
  {
    value: '32,589',
    label: 'Active Users',
    icon: <UsersIcon />,
    gradientFrom: '#22c55e',
    gradientTo: '#14b8a6',
  },
  {
    value: '$2,847M',
    label: 'Total Volume',
    icon: <MoneyBagIcon />,
    gradientFrom: '#f97316',
    gradientTo: '#eab308',
  },
];

export const NetworkStats = React.memo(function NetworkStats() {
  const headingId = 'network-stats-heading';

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className="relative py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-sm font-medium text-purple-400 mb-4">
            Real-Time Network Stats
          </span>
          <h2
            id={headingId}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4"
          >
            Powering the{' '}
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Future
            </span>{' '}
            of Commerce
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400">
            Our blockchain-powered marketplace is processing thousands of
            transactions daily, creating a new standard for transparent and
            secure e-commerce.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-2xl lg:rounded-3xl bg-gray-900/80 border border-gray-800 p-6 lg:p-8 overflow-hidden"
            >
              {/* Subtle noise overlay */}
              <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9J3doaXRlJy8+PC9zdmc+')] pointer-events-none" />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
                style={{
                  background: `linear-gradient(135deg, ${stat.gradientFrom}, ${stat.gradientTo})`,
                }}
              >
                {stat.icon}
              </div>

              {/* Value */}
              <div
                className="text-3xl sm:text-4xl font-extrabold text-white mb-1"
                aria-label={`${stat.value} ${stat.label}`}
              >
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-sm sm:text-base text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
