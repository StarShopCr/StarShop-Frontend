import * as React from 'react';
import {
  DEFAULT_PILL_LABEL,
  DEFAULT_TITLE_PREFIX,
  DEFAULT_TITLE_HIGHLIGHT,
  DEFAULT_TITLE_SUFFIX,
  DEFAULT_DESCRIPTION,
  DEFAULT_NETWORK_STATS,
  GRADIENT_MAP,
} from './constants/network-stats.constants';
import type { NetworkStatsProps, NetworkStatItem } from './types/network-stats.types';

function renderStatIcon(iconName: NetworkStatItem['iconName'], className = 'w-6 h-6') {
  switch (iconName) {
    case 'credit-card':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      );
    case 'palette':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      );
    case 'users':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'wallet':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      );
  }
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  pillLabel = DEFAULT_PILL_LABEL,
  titlePrefix = DEFAULT_TITLE_PREFIX,
  titleHighlight = DEFAULT_TITLE_HIGHLIGHT,
  titleSuffix = DEFAULT_TITLE_SUFFIX,
  description = DEFAULT_DESCRIPTION,
  stats = DEFAULT_NETWORK_STATS,
  className = '',
  testId = 'network-stats-section',
  isLoading = false,
}) => {
  const headingId = 'network-stats-title';

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      data-testid={testId}
      className={`relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10"
        aria-hidden="true"
      >
        <div className="w-[600px] h-[300px] bg-gradient-to-tr from-purple-600/10 via-blue-600/10 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          {/* Badge / Pill */}
          {pillLabel && (
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-300 mb-6 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-purple-400 mr-2.5 animate-pulse" />
              {pillLabel}
            </div>
          )}

          {/* Heading */}
          <h2
            id={headingId}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight"
          >
            {titlePrefix}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              {titleHighlight}
            </span>
            {titleSuffix}
          </h2>

          {/* Description */}
          {description && (
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-300/90 leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div
          data-testid="stats-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat) => {
            const gradientClasses =
              GRADIENT_MAP[stat.gradient] || GRADIENT_MAP.blue;

            return (
              <div
                key={stat.id}
                data-testid={`stat-card-${stat.id}`}
                className="group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#121124]/90 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle starry / dotted texture */}
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                  aria-hidden="true"
                />

                {/* Card Content */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  {/* Icon Box */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradientClasses} shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300`}
                    aria-hidden="true"
                  >
                    {renderStatIcon(stat.iconName, 'w-6 h-6 sm:w-7 sm:h-7')}
                  </div>

                  {/* Value and Label */}
                  <div>
                    <div
                      className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-none mb-2"
                      aria-label={stat.ariaLabel || `${stat.value} ${stat.label}`}
                    >
                      {isLoading ? (
                        <span className="inline-block w-28 h-9 bg-white/10 rounded-md animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-sm sm:text-base text-gray-400 font-medium tracking-normal">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NetworkStats;
