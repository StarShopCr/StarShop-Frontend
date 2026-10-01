import { VISIBILITY_LEVELS } from '../constants/boost.constants';

export type VisibilityLevel = typeof VISIBILITY_LEVELS[keyof typeof VISIBILITY_LEVELS];

export interface VisibilityStats {
  impressions: number;
  clicks: number;
  conversionRate: number;
  activeDuration: number;
}
