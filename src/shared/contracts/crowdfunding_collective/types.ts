/**
 * TypeScript Type Definitions for Crowdfunding Collective Soroban Smart Contract
 * StarShop Decentralized Crowdfunding Platform
 */

import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  AssembledTransaction,
  MethodOptions,
  Result,
} from '@stellar/stellar-sdk/contract';

/**
 * Status of a crowdfunding product or campaign
 */
export enum ProductStatus {
  Active = 0,
  Funded = 1,
  Failed = 2,
  Completed = 3,
}

/**
 * Alias for ProductStatus to support campaign terminology
 */
export type CampaignStatus = ProductStatus;
export const CampaignStatus = ProductStatus;

/**
 * Error codes defined by the Crowdfunding Collective contract
 */
export enum CrowdfundingErrorCode {
  NotInitialized = 1,
  AlreadyInitialized = 2,
  CampaignEnded = 3,
  CampaignNotEnded = 4,
  GoalNotReached = 5,
  GoalReached = 6,
  InvalidAmount = 7,
  Unauthorized = 8,
  TransferFailed = 9,
  NothingToRefund = 10,
  ProductNotFound = 11,
  MilestoneNotCompleted = 12,
  RewardAlreadyClaimed = 13,
}

/**
 * Human-readable error messages and explanations for contract errors
 */
export const CrowdfundingError: Record<
  number,
  { message: string; description: string }
> = {
  1: {
    message: 'NotInitialized',
    description: 'Contract has not been initialized yet',
  },
  2: {
    message: 'AlreadyInitialized',
    description: 'Contract has already been initialized',
  },
  3: {
    message: 'CampaignEnded',
    description: 'Campaign funding period has ended',
  },
  4: {
    message: 'CampaignNotEnded',
    description: 'Campaign funding period is still ongoing',
  },
  5: {
    message: 'GoalNotReached',
    description: 'Campaign funding goal was not reached',
  },
  6: {
    message: 'GoalReached',
    description: 'Campaign funding goal has already been achieved',
  },
  7: {
    message: 'InvalidAmount',
    description: 'Pledge or contribution amount must be greater than zero',
  },
  8: {
    message: 'Unauthorized',
    description: 'Caller is not authorized to execute this operation',
  },
  9: {
    message: 'TransferFailed',
    description: 'Underlying token transfer failed',
  },
  10: {
    message: 'NothingToRefund',
    description: 'No funds available for refund',
  },
  11: {
    message: 'ProductNotFound',
    description: 'Specified product ID does not exist',
  },
  12: {
    message: 'MilestoneNotCompleted',
    description: 'Required milestone is not yet marked completed',
  },
  13: {
    message: 'RewardAlreadyClaimed',
    description: 'Backer has already claimed this reward tier',
  },
};

/**
 * Backer Reward Tier specification
 */
export interface RewardTier {
  id: u32 | number;
  min_contribution: u64 | bigint;
  description: string;
  discount: u32 | number;
}

/**
 * Project Milestone tracking
 */
export interface Milestone {
  id: u32 | number;
  description: string;
  target_date: u64 | bigint;
  completed: boolean;
}

/**
 * Individual backer contribution record
 */
export interface Contribution {
  contributor: string;
  amount: u64 | bigint;
  timestamp: u64 | bigint;
}

/**
 * Crowdfunding Product struct representation on Soroban ledger
 */
export interface Product {
  id: u32 | number;
  creator: string;
  name: string;
  description: string;
  funding_goal: u64 | bigint;
  deadline: u64 | bigint;
  status: ProductStatus;
  total_funded: u64 | bigint;
}

/**
 * Campaign data structure compatible with both single-campaign and collective models
 */
export interface Campaign {
  id: u32 | number;
  admin: string;
  creator?: string;
  name?: string;
  description?: string;
  funding_goal?: u64 | bigint;
  target_amount?: u64 | i128 | bigint;
  deadline: u64 | bigint;
  status: CampaignStatus;
  total_funded?: u64 | bigint;
  total_pledged?: u64 | i128 | bigint;
  token?: string;
}

/* =========================================================================
 * Method Arguments Interfaces
 * ========================================================================= */

export interface InitializeParams {
  admin: string;
  deadline?: u64 | bigint;
  target_amount?: u64 | i128 | bigint;
  token?: string;
}

export interface PledgeParams {
  donor: string;
  amount: u64 | i128 | bigint;
}

export interface RefundParams {
  donor?: string;
}

export interface CreateProductParams {
  creator: string;
  name: string;
  description: string;
  funding_goal: u64 | bigint;
  deadline: u64 | bigint;
  reward_tiers: RewardTier[];
  milestones: Milestone[];
}

export type CreateCampaignParams = CreateProductParams;

export interface ContributeParams {
  contributor: string;
  product_id?: u32 | number;
  campaign_id?: u32 | number;
  amount: u64 | bigint;
}

export interface DistributeFundsParams {
  caller: string;
  product_id?: u32 | number;
  campaign_id?: u32 | number;
}

export interface RefundContributorsParams {
  caller: string;
  product_id?: u32 | number;
  campaign_id?: u32 | number;
}

export interface ClaimRewardParams {
  contributor: string;
  product_id?: u32 | number;
  campaign_id?: u32 | number;
}

export interface UpdateMilestoneParams {
  creator: string;
  product_id?: u32 | number;
  campaign_id?: u32 | number;
  milestone_id: u32 | number;
}

export interface GetProductParams {
  product_id: u32 | number;
}

export interface GetCampaignParams {
  campaign_id: u32 | number;
}

export interface GetContributionsParams {
  product_id?: u32 | number;
  campaign_id?: u32 | number;
}

export interface GetMilestonesParams {
  product_id?: u32 | number;
  campaign_id?: u32 | number;
}

export interface GetRewardTiersParams {
  product_id?: u32 | number;
  campaign_id?: u32 | number;
}

export interface GetProductStatusParams {
  product_id: u32 | number;
}

export interface GetCampaignStatusParams {
  campaign_id?: u32 | number;
}

export interface SetAdminParams {
  new_admin: string;
}
