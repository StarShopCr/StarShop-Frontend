/**
 * Product Voting Contract Service - Reward Distribution Types
 */

export interface VoterRewardConfig {
  roundId: string;
  totalRewardPool: number;
  distributionType: 'PROPORTIONAL_WEIGHT' | 'EQUAL_SPLIT';
  minVotesToQualify?: number;
}

export interface VoterRewardEntry {
  voter: string;
  rewardAmount: number;
  weightContributed: number;
  percentageOfPool: number;
}

export interface ClaimVotingRewardResult {
  voter: string;
  roundId: string;
  amountClaimed: number;
  txHash: string;
  claimedAt: number;
}

export interface RewardDistributionResult {
  roundId: string;
  totalDistributed: number;
  recipientCount: number;
  distributions: VoterRewardEntry[];
  txHash: string;
}
