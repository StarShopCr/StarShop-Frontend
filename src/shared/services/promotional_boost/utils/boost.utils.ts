import { BoostConfig } from '../types/boost.types';

export const calculateBoostCost = (config: BoostConfig): string => {
  // Lógica de cálculo de custo baseada em duração e nível de visibilidade
  const baseRate = 10; // Ex: 10 tokens por dia
  const multiplier = config.visibilityLevel * 1.5;
  const total = config.durationDays * baseRate * (1 + multiplier);
  return total.toString();
};

export const formatDuration = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};
