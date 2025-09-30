import type { u32, i128, u64 } from '@stellar/stellar-sdk';
import type { UserLevel, MilestoneRequirement } from './referral.types';

/**
 * Milestone configuration
 */
export interface MilestoneConfig {
  /** Milestone ID */
  id: u32;
  /** Milestone name */
  name: string;
  /** Milestone description */
  description: string;
  /** Required user level */
  requiredLevel: UserLevel;
  /** Milestone requirement */
  requirement: MilestoneRequirement;
  /** Reward amount */
  rewardAmount: i128;
  /** Is active */
  isActive: boolean;
  /** Created timestamp */
  createdAt: u64;
  /** Updated timestamp */
  updatedAt: u64;
  /** Expires timestamp */
  expiresAt?: u64;
  /** Max completions per user */
  maxCompletionsPerUser?: u32;
  /** Total completions */
  totalCompletions: u32;
  /** Category */
  category: MilestoneCategory;
  /** Difficulty level */
  difficulty: MilestoneDifficulty;
  /** Tags */
  tags: string[];
  /** Icon URL */
  iconUrl?: string;
  /** Banner URL */
  bannerUrl?: string;
}

/**
 * Milestone categories
 */
export enum MilestoneCategory {
  REFERRAL = 'referral',
  TEAM_BUILDING = 'team_building',
  REWARD_ACCUMULATION = 'reward_accumulation',
  ACTIVITY = 'activity',
  ACHIEVEMENT = 'achievement',
  SPECIAL_EVENT = 'special_event',
  SEASONAL = 'seasonal',
  COMMUNITY = 'community',
}

/**
 * Milestone difficulty levels
 */
export enum MilestoneDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
  LEGENDARY = 'legendary',
}

/**
 * Milestone progress tracking
 */
export interface MilestoneProgress {
  /** Milestone ID */
  milestoneId: u32;
  /** User address */
  user: string;
  /** Current progress value */
  currentProgress: number;
  /** Required progress value */
  requiredProgress: number;
  /** Progress percentage */
  progressPercentage: number;
  /** Is completed */
  isCompleted: boolean;
  /** Completion timestamp */
  completedAt?: u64;
  /** Reward claimed */
  rewardClaimed: boolean;
  /** Reward claim timestamp */
  rewardClaimedAt?: u64;
  /** Started timestamp */
  startedAt: u64;
  /** Last updated timestamp */
  lastUpdatedAt: u64;
  /** Progress history */
  progressHistory: MilestoneProgressEntry[];
}

/**
 * Milestone progress entry
 */
export interface MilestoneProgressEntry {
  /** Entry timestamp */
  timestamp: u64;
  /** Progress value */
  progress: number;
  /** Progress change */
  progressChange: number;
  /** Source of progress */
  source: ProgressSource;
  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Progress sources
 */
export enum ProgressSource {
  REFERRAL = 'referral',
  VERIFICATION = 'verification',
  REWARD_EARNED = 'reward_earned',
  LEVEL_UPGRADE = 'level_upgrade',
  MANUAL_UPDATE = 'manual_update',
  SYSTEM_UPDATE = 'system_update',
}

/**
 * Milestone achievement
 */
export interface MilestoneAchievement {
  /** Achievement ID */
  id: string;
  /** Milestone ID */
  milestoneId: u32;
  /** User address */
  user: string;
  /** Achievement timestamp */
  achievedAt: u64;
  /** Reward amount */
  rewardAmount: i128;
  /** Is reward claimed */
  isRewardClaimed: boolean;
  /** Reward claim timestamp */
  rewardClaimedAt?: u64;
  /** Achievement data */
  achievementData: MilestoneAchievementData;
}

/**
 * Milestone achievement data
 */
export interface MilestoneAchievementData {
  /** Final progress value */
  finalProgress: number;
  /** Time to complete (in seconds) */
  timeToComplete: u64;
  /** Completion rank */
  completionRank?: u32;
  /** Total completions at time of achievement */
  totalCompletions: u32;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Milestone leaderboard entry
 */
export interface MilestoneLeaderboardEntry {
  /** User address */
  user: string;
  /** User display name */
  displayName?: string;
  /** Completion timestamp */
  completedAt: u64;
  /** Completion rank */
  rank: u32;
  /** Time to complete (in seconds) */
  timeToComplete: u64;
  /** Achievement data */
  achievementData: MilestoneAchievementData;
}

/**
 * Milestone statistics
 */
export interface MilestoneStatistics {
  /** Milestone ID */
  milestoneId: u32;
  /** Total attempts */
  totalAttempts: u32;
  /** Total completions */
  totalCompletions: u32;
  /** Completion rate */
  completionRate: number;
  /** Average completion time */
  averageCompletionTime: u64;
  /** Fastest completion time */
  fastestCompletionTime: u64;
  /** Slowest completion time */
  slowestCompletionTime: u64;
  /** Active participants */
  activeParticipants: u32;
  /** Completion distribution by level */
  completionDistributionByLevel: Record<UserLevel, u32>;
  /** Completion distribution by difficulty */
  completionDistributionByDifficulty: Record<MilestoneDifficulty, u32>;
  /** Recent completions */
  recentCompletions: MilestoneLeaderboardEntry[];
  /** Top performers */
  topPerformers: MilestoneLeaderboardEntry[];
}

/**
 * Milestone filter options
 */
export interface MilestoneFilter {
  /** Filter by category */
  category?: MilestoneCategory;
  /** Filter by difficulty */
  difficulty?: MilestoneDifficulty;
  /** Filter by required level */
  requiredLevel?: UserLevel;
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by reward amount range */
  minRewardAmount?: i128;
  maxRewardAmount?: i128;
  /** Filter by tags */
  tags?: string[];
  /** Search query */
  query?: string;
  /** Sort by */
  sortBy?: 'name' | 'rewardAmount' | 'difficulty' | 'createdAt' | 'completionRate';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Page size */
  pageSize?: number;
  /** Page number */
  page?: number;
}

/**
 * Milestone search result
 */
export interface MilestoneSearchResult {
  /** Milestone configuration */
  milestone: MilestoneConfig;
  /** User progress if applicable */
  userProgress?: MilestoneProgress;
  /** Statistics */
  statistics?: MilestoneStatistics;
  /** Match score */
  matchScore?: number;
  /** Highlighted fields */
  highlights?: Record<string, string[]>;
}

/**
 * Milestone creation request
 */
export interface MilestoneCreationRequest {
  /** Milestone name */
  name: string;
  /** Milestone description */
  description: string;
  /** Required user level */
  requiredLevel: UserLevel;
  /** Milestone requirement */
  requirement: MilestoneRequirement;
  /** Reward amount */
  rewardAmount: i128;
  /** Category */
  category: MilestoneCategory;
  /** Difficulty level */
  difficulty: MilestoneDifficulty;
  /** Tags */
  tags?: string[];
  /** Icon URL */
  iconUrl?: string;
  /** Banner URL */
  bannerUrl?: string;
  /** Expires timestamp */
  expiresAt?: u64;
  /** Max completions per user */
  maxCompletionsPerUser?: u32;
}

/**
 * Milestone update request
 */
export interface MilestoneUpdateRequest {
  /** Milestone ID */
  milestoneId: u32;
  /** Updated name */
  name?: string;
  /** Updated description */
  description?: string;
  /** Updated reward amount */
  rewardAmount?: i128;
  /** Updated active status */
  isActive?: boolean;
  /** Updated tags */
  tags?: string[];
  /** Updated icon URL */
  iconUrl?: string;
  /** Updated banner URL */
  bannerUrl?: string;
  /** Updated expires timestamp */
  expiresAt?: u64;
  /** Updated max completions per user */
  maxCompletionsPerUser?: u32;
}

/**
 * Milestone completion event
 */
export interface MilestoneCompletionEvent {
  /** Event ID */
  id: string;
  /** Milestone ID */
  milestoneId: u32;
  /** User address */
  user: string;
  /** Completion timestamp */
  completedAt: u64;
  /** Reward amount */
  rewardAmount: i128;
  /** Completion rank */
  completionRank?: u32;
  /** Achievement data */
  achievementData: MilestoneAchievementData;
  /** Transaction hash */
  transactionHash?: string;
}

/**
 * Milestone reward claim event
 */
export interface MilestoneRewardClaimEvent {
  /** Event ID */
  id: string;
  /** Milestone ID */
  milestoneId: u32;
  /** User address */
  user: string;
  /** Claim timestamp */
  claimedAt: u64;
  /** Reward amount */
  rewardAmount: i128;
  /** Transaction hash */
  transactionHash?: string;
}

/**
 * Milestone analytics
 */
export interface MilestoneAnalytics {
  /** Milestone ID */
  milestoneId: u32;
  /** Time period */
  timePeriod: AnalyticsTimePeriod;
  /** Total views */
  totalViews: u32;
  /** Total starts */
  totalStarts: u32;
  /** Total completions */
  totalCompletions: u32;
  /** Completion rate */
  completionRate: number;
  /** Average completion time */
  averageCompletionTime: u64;
  /** User engagement score */
  userEngagementScore: number;
  /** Popularity score */
  popularityScore: number;
  /** Difficulty rating */
  difficultyRating: number;
  /** User feedback score */
  userFeedbackScore?: number;
  /** Completion trends */
  completionTrends: MilestoneTrendData[];
  /** User demographics */
  userDemographics: MilestoneUserDemographics;
}

/**
 * Analytics time periods
 */
export enum AnalyticsTimePeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL_TIME = 'all_time',
}

/**
 * Milestone trend data
 */
export interface MilestoneTrendData {
  /** Time period */
  period: string;
  /** Completions count */
  completions: u32;
  /** Starts count */
  starts: u32;
  /** Views count */
  views: u32;
  /** Completion rate */
  completionRate: number;
}

/**
 * Milestone user demographics
 */
export interface MilestoneUserDemographics {
  /** Completion by user level */
  completionByLevel: Record<UserLevel, u32>;
  /** Completion by verification status */
  completionByVerificationStatus: Record<string, u32>;
  /** Completion by join date range */
  completionByJoinDateRange: Record<string, u32>;
  /** Top referrers */
  topReferrers: Array<{
    referrer: string;
    completions: u32;
  }>;
}

/**
 * Milestone template
 */
export interface MilestoneTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template category */
  category: MilestoneCategory;
  /** Template difficulty */
  difficulty: MilestoneDifficulty;
  /** Template requirements */
  requirements: MilestoneRequirementTemplate[];
  /** Default reward amount */
  defaultRewardAmount: i128;
  /** Default tags */
  defaultTags: string[];
  /** Template icon */
  iconUrl?: string;
  /** Is system template */
  isSystemTemplate: boolean;
  /** Created by */
  createdBy: string;
  /** Created timestamp */
  createdAt: u64;
  /** Usage count */
  usageCount: u32;
}

/**
 * Milestone requirement template
 */
export interface MilestoneRequirementTemplate {
  /** Requirement type */
  type: 'DirectReferrals' | 'TeamSize' | 'TotalRewards' | 'ActiveDays';
  /** Requirement name */
  name: string;
  /** Requirement description */
  description: string;
  /** Default value */
  defaultValue: u32 | i128 | u64;
  /** Min value */
  minValue?: u32 | i128 | u64;
  /** Max value */
  maxValue?: u32 | i128 | u64;
  /** Step value */
  stepValue?: u32 | i128 | u64;
  /** Is required */
  isRequired: boolean;
}

/**
 * Milestone batch operation
 */
export interface MilestoneBatchOperation {
  /** Operation type */
  type: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  /** Milestone data */
  milestoneData?: MilestoneCreationRequest | MilestoneUpdateRequest;
  /** Milestone IDs for batch operations */
  milestoneIds?: u32[];
  /** Operation options */
  options?: Record<string, any>;
}

/**
 * Milestone batch operation result
 */
export interface MilestoneBatchOperationResult {
  /** Successful operations */
  successful: Array<{
    operation: MilestoneBatchOperation;
    result: any;
  }>;
  /** Failed operations */
  failed: Array<{
    operation: MilestoneBatchOperation;
    error: string;
    errorCode?: string;
  }>;
  /** Total operations */
  totalOperations: number;
  /** Success rate */
  successRate: number;
}
