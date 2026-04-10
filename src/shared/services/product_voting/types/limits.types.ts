import type { Address } from './voting.types';

export interface VotingLimits {
  voter: Address;
  maxVotesPerDay: number;
  votesUsedToday: number;
  remainingVotes: number;
  cooldownEndsAt: number;
  isOnCooldown: boolean;
}

export interface VotingPower {
  voter: Address;
  basePower: number;
  bonusPower: number;
  totalPower: number;
  level: VoterLevel;
  multiplier: number;
}

export enum VoterLevel {
  NEWCOMER = 'newcomer',
  REGULAR = 'regular',
  TRUSTED = 'trusted',
  EXPERT = 'expert',
  GUARDIAN = 'guardian',
}

export interface VoterLevelRequirements {
  level: VoterLevel;
  minVotes: number;
  minReputation: number;
  minAccountAgeDays: number;
}

export interface VotingCooldown {
  voter: Address;
  lastVoteTimestamp: number;
  cooldownDurationMs: number;
  canVoteAt: number;
}

export interface DailyVotingStats {
  voter: Address;
  date: string;
  votesUsed: number;
  maxVotes: number;
  productsVoted: string[];
}
