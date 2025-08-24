import React from 'react';
import {
  SectionDividerProps,
  HEIGHT_CLASSES,
  COLOR_CLASSES,
  SVG_PATHS,
  GRADIENT_STOPS,
  FLOATING_ELEMENTS,
} from '../constants/section-divider';

export default function SectionDivider({
  variant = 'wave',
  direction = 'down',
  color = 'gradient',
  height = 'md',
}: SectionDividerProps) {
  const getPath = () => {
    return SVG_PATHS[variant]?.[direction] || SVG_PATHS.wave.down;
  };

  return (
    <div
      className={`relative w-full ${HEIGHT_CLASSES[height]} overflow-hidden`}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-teal-600/10"></div>

      {/* Main Shape */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`gradient-${variant}-${direction}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            {GRADIENT_STOPS.map((stop, index) => (
              <stop key={index} {...stop} />
            ))}
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={getPath()}
          fill={
            color === 'gradient'
              ? `url(#gradient-${variant}-${direction})`
              : undefined
          }
          className={color !== 'gradient' ? COLOR_CLASSES[color] : ''}
          filter="url(#glow)"
        />
      </svg>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_ELEMENTS.map((element, index) => (
          <div key={index} className={element.className}></div>
        ))}
      </div>

      {/* Subtle Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
    </div>
  );
}
