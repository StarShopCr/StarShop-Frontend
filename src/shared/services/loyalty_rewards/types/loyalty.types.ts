import { UserPoints } from './points.types';
import { Reward } from './rewards.types';

export interface LoyaltyLevel {
  level: number;
  name: string;
  minPoints: number;
  multiplier: number;
}

export interface Milestone {
  id: string;
  title: string;
  requirement: string;
  rewardPoints: number;
  isCompleted: boolean;
}

export interface LoyaltyUserState {
  points: UserPoints;
  level: number;
  milestones: Milestone[];
}
