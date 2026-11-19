import * as React from 'react';

export type BackgroundVariant =
  | 'starfield'
  | 'gradient'
  | 'mesh'
  | 'both'
  | 'all';
export type StarDensity = 'low' | 'medium' | 'high';
export type Intensity = 'subtle' | 'normal' | 'vibrant';

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BackgroundVariant;
  opacity?: number;
  animated?: boolean;
  intensity?: Intensity;
  starDensity?: StarDensity;
}

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface StarConfig {
  count: number;
  maxSize: number;
  minSize: number;
  density: StarDensity; // Added to provide density configuration for stars
}