export const SECTION_DIVIDER_VARIANTS = {
  wave: 'wave',
  curve: 'curve',
  zigzag: 'zigzag',
  triangle: 'triangle',
  diagonal: 'diagonal',
  mountain: 'mountain',
} as const;

export const SECTION_DIVIDER_DIRECTIONS = {
  up: 'up',
  down: 'down',
} as const;

export const SECTION_DIVIDER_COLORS = {
  purple: 'purple',
  blue: 'blue',
  teal: 'teal',
  gradient: 'gradient',
} as const;

export const SECTION_DIVIDER_HEIGHTS = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const;

export const HEIGHT_CLASSES = {
  sm: 'h-16 md:h-20',
  md: 'h-20 md:h-24 lg:h-28',
  lg: 'h-24 md:h-28 lg:h-32',
} as const;

export const COLOR_CLASSES = {
  purple: 'fill-purple-600/30',
  blue: 'fill-blue-600/30',
  teal: 'fill-teal-600/30',
  gradient: 'fill-purple-600/20',
} as const;

export const SVG_PATHS = {
  wave: {
    up: 'M0,50 C150,20 350,80 500,50 C650,20 850,80 1000,50 L1000,100 L0,100 Z',
    down: 'M0,0 C150,30 350,-30 500,0 C650,30 850,-30 1000,0 L1000,100 L0,100 Z',
  },
  curve: {
    up: 'M0,100 Q500,0 1000,100 L1000,100 L0,100 Z',
    down: 'M0,0 Q500,100 1000,0 L1000,100 L0,100 Z',
  },
  zigzag: {
    up: 'M0,100 L250,0 L500,100 L750,0 L1000,100 L1000,100 L0,100 Z',
    down: 'M0,0 L250,100 L500,0 L750,100 L1000,0 L1000,100 L0,100 Z',
  },
  triangle: {
    up: 'M0,100 L500,0 L1000,100 L1000,100 L0,100 Z',
    down: 'M0,0 L500,100 L1000,0 L1000,100 L0,100 Z',
  },
  diagonal: {
    up: 'M0,100 L1000,0 L1000,100 L0,100 Z',
    down: 'M0,0 L1000,100 L1000,100 L0,100 Z',
  },
  mountain: {
    up: 'M0,100 L200,40 L400,20 L600,40 L800,10 L1000,100 L1000,100 L0,100 Z',
    down: 'M0,0 L200,60 L400,80 L600,60 L800,90 L1000,0 L1000,100 L0,100 Z',
  },
} as const;

export const GRADIENT_STOPS = [
  { offset: '0%', stopColor: '#8B5CF6', stopOpacity: '0.3' },
  { offset: '50%', stopColor: '#3B82F6', stopOpacity: '0.2' },
  { offset: '100%', stopColor: '#14B8A6', stopOpacity: '0.3' },
] as const;

export const FLOATING_ELEMENTS = [
  {
    className:
      'absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse',
  },
  {
    className:
      'absolute top-3/4 right-1/3 w-3 h-3 bg-blue-400/30 rounded-full animate-bounce delay-300',
  },
  {
    className:
      'absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-teal-400/50 rounded-full animate-ping delay-700',
  },
] as const;

export interface SectionDividerProps {
  variant?: 'wave' | 'curve' | 'zigzag' | 'triangle' | 'diagonal' | 'mountain';
  direction?: 'up' | 'down';
  color?: 'purple' | 'blue' | 'teal' | 'gradient';
  height?: 'sm' | 'md' | 'lg';
}
