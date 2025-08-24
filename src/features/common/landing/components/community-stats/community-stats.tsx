import * as React from 'react';

export interface CommunityMetric {
  value: string;
  label: string;
}

const COMMUNITY_METRICS: CommunityMetric[] = [
  {
    value: '98%',
    label: 'Satisfaction Rate',
  },
  {
    value: '4.9',
    label: 'Average Rating',
  },
  {
    value: '500K+',
    label: 'NFTs Earned',
  },
  {
    value: '24/7',
    label: 'Support Available',
  },
];

export const CommunityStats = React.memo(function CommunityStats() {
  const headingId = 'community-stats-heading';

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#14b8a6] rounded-3xl py-12 px-8">
          <div className="text-center">
            {/* Heading */}
            <h2
              id={headingId}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-8 lg:mb-12"
            >
              Join Our Growing Community
            </h2>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {COMMUNITY_METRICS.map(metric => (
                <div key={metric.label} className="text-center">
                  <div
                    className="text-3xl sm:text-4xl font-bold text-white mb-2"
                    aria-label={`${metric.value} ${metric.label}`}
                  >
                    {metric.value}
                  </div>
                  <div className="text-sm sm:text-base text-gray-200/90">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
