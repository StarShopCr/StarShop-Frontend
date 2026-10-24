export type StatCardGradient = 'blue' | 'purple' | 'green' | 'orange';

export interface NetworkStatItem {
  id: string;
  value: string;
  rawValue?: number;
  label: string;
  gradient: StatCardGradient;
  iconName: 'credit-card' | 'palette' | 'users' | 'wallet';
  ariaLabel?: string;
  tooltip?: string;
}

export interface NetworkStatsProps {
  pillLabel?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  description?: string;
  stats?: NetworkStatItem[];
  className?: string;
  testId?: string;
  isLoading?: boolean;
}
