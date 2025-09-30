import type { u32, i128, u64 } from '@stellar/stellar-sdk';
import type { UserLevel, VerificationStatus } from './referral.types';

/**
 * User profile information
 */
export interface UserProfile {
  /** User address */
  address: string;
  /** Display name */
  displayName?: string;
  /** Email address */
  email?: string;
  /** Profile image URL */
  profileImage?: string;
  /** Bio/description */
  bio?: string;
  /** Social links */
  socialLinks?: SocialLinks;
  /** Preferences */
  preferences?: UserPreferences;
  /** Created timestamp */
  createdAt: u64;
  /** Last updated timestamp */
  updatedAt: u64;
}

/**
 * Social media links
 */
export interface SocialLinks {
  /** Twitter handle */
  twitter?: string;
  /** Discord username */
  discord?: string;
  /** Telegram username */
  telegram?: string;
  /** Website URL */
  website?: string;
  /** GitHub username */
  github?: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Email notifications enabled */
  emailNotifications: boolean;
  /** Push notifications enabled */
  pushNotifications: boolean;
  /** Referral notifications enabled */
  referralNotifications: boolean;
  /** Reward notifications enabled */
  rewardNotifications: boolean;
  /** Language preference */
  language: string;
  /** Timezone */
  timezone: string;
  /** Theme preference */
  theme: 'light' | 'dark' | 'auto';
}

/**
 * User activity log entry
 */
export interface UserActivityLog {
  /** Activity ID */
  id: string;
  /** User address */
  user: string;
  /** Activity type */
  type: UserActivityType;
  /** Activity description */
  description: string;
  /** Additional data */
  data?: Record<string, any>;
  /** Timestamp */
  timestamp: u64;
  /** Transaction hash if applicable */
  transactionHash?: string;
}

/**
 * User activity types
 */
export enum UserActivityType {
  REGISTRATION = 'registration',
  VERIFICATION_SUBMITTED = 'verification_submitted',
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_REJECTED = 'verification_rejected',
  LEVEL_UPGRADE = 'level_upgrade',
  REWARD_EARNED = 'reward_earned',
  REWARD_CLAIMED = 'reward_claimed',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  REFERRAL_MADE = 'referral_made',
  PROFILE_UPDATED = 'profile_updated',
  PREFERENCES_UPDATED = 'preferences_updated',
}

/**
 * User notification
 */
export interface UserNotification {
  /** Notification ID */
  id: string;
  /** User address */
  user: string;
  /** Notification type */
  type: NotificationType;
  /** Title */
  title: string;
  /** Message */
  message: string;
  /** Priority */
  priority: NotificationPriority;
  /** Is read */
  isRead: boolean;
  /** Created timestamp */
  createdAt: u64;
  /** Read timestamp */
  readAt?: u64;
  /** Action URL */
  actionUrl?: string;
  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Notification types
 */
export enum NotificationType {
  REWARD_EARNED = 'reward_earned',
  REWARD_CLAIMED = 'reward_claimed',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  LEVEL_UPGRADED = 'level_upgraded',
  REFERRAL_JOINED = 'referral_joined',
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_REJECTED = 'verification_rejected',
  SYSTEM_UPDATE = 'system_update',
  MAINTENANCE = 'maintenance',
  GENERAL = 'general',
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * User achievement
 */
export interface UserAchievement {
  /** Achievement ID */
  id: string;
  /** User address */
  user: string;
  /** Achievement type */
  type: AchievementType;
  /** Achievement name */
  name: string;
  /** Achievement description */
  description: string;
  /** Achievement icon */
  icon?: string;
  /** Reward amount */
  rewardAmount?: i128;
  /** Achieved timestamp */
  achievedAt: u64;
  /** Is visible */
  isVisible: boolean;
}

/**
 * Achievement types
 */
export enum AchievementType {
  FIRST_REFERRAL = 'first_referral',
  REFERRAL_MILESTONE = 'referral_milestone',
  TEAM_MILESTONE = 'team_milestone',
  REWARD_MILESTONE = 'reward_milestone',
  LEVEL_UPGRADE = 'level_upgrade',
  VERIFICATION_COMPLETE = 'verification_complete',
  LONG_TIME_USER = 'long_time_user',
  ACTIVE_USER = 'active_user',
  SPECIAL_EVENT = 'special_event',
}

/**
 * User session
 */
export interface UserSession {
  /** Session ID */
  id: string;
  /** User address */
  user: string;
  /** Session token */
  token: string;
  /** IP address */
  ipAddress: string;
  /** User agent */
  userAgent: string;
  /** Created timestamp */
  createdAt: u64;
  /** Last activity timestamp */
  lastActivityAt: u64;
  /** Expires timestamp */
  expiresAt: u64;
  /** Is active */
  isActive: boolean;
}

/**
 * User referral code
 */
export interface UserReferralCode {
  /** Referral code */
  code: string;
  /** User address */
  user: string;
  /** Is active */
  isActive: boolean;
  /** Created timestamp */
  createdAt: u64;
  /** Usage count */
  usageCount: u32;
  /** Max usage limit */
  maxUsage?: u32;
  /** Expires timestamp */
  expiresAt?: u64;
}

/**
 * User referral link
 */
export interface UserReferralLink {
  /** Referral link */
  link: string;
  /** User address */
  user: string;
  /** Referral code */
  code: string;
  /** Campaign ID */
  campaignId?: string;
  /** Is active */
  isActive: boolean;
  /** Created timestamp */
  createdAt: u64;
  /** Click count */
  clickCount: u32;
  /** Conversion count */
  conversionCount: u32;
}

/**
 * User dashboard data
 */
export interface UserDashboard {
  /** User address */
  user: string;
  /** User profile */
  profile: UserProfile;
  /** User statistics */
  stats: UserStats;
  /** Recent activity */
  recentActivity: UserActivityLog[];
  /** Unread notifications */
  unreadNotifications: UserNotification[];
  /** Recent achievements */
  recentAchievements: UserAchievement[];
  /** Referral tree preview */
  referralTreePreview: ReferralTreeNode;
  /** Pending rewards */
  pendingRewards: i128;
  /** Available milestones */
  availableMilestones: MilestoneProgress[];
  /** Performance metrics */
  performance: UserPerformanceMetrics;
}

/**
 * User statistics (extended)
 */
export interface UserStats {
  /** User address */
  address: string;
  /** Direct referrals count */
  directReferrals: u32;
  /** Team size */
  teamSize: u32;
  /** User level */
  level: UserLevel;
  /** Pending rewards */
  pendingRewards: i128;
  /** Total rewards */
  totalRewards: i128;
  /** Verification status */
  verificationStatus: VerificationStatus;
  /** Join date */
  joinDate: u64;
  /** Referrer address */
  referrer: string | null;
  /** Conversion rate */
  conversionRate: number;
  /** Active referrals */
  activeReferrals: u32;
  /** Verified referrals */
  verifiedReferrals: u32;
  /** Total clicks */
  totalClicks: u32;
  /** Total conversions */
  totalConversions: u32;
  /** Last activity */
  lastActivity: u64;
  /** Achievement count */
  achievementCount: u32;
  /** Milestone count */
  milestoneCount: u32;
}

/**
 * User performance metrics
 */
export interface UserPerformanceMetrics {
  /** Referral conversion rate */
  referralConversionRate: number;
  /** Team growth rate */
  teamGrowthRate: number;
  /** Reward earning rate */
  rewardEarningRate: number;
  /** Activity score */
  activityScore: number;
  /** Engagement level */
  engagementLevel: EngagementLevel;
  /** Performance trend */
  performanceTrend: PerformanceTrend;
}

/**
 * Engagement levels
 */
export enum EngagementLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

/**
 * Performance trends
 */
export enum PerformanceTrend {
  DECLINING = 'declining',
  STABLE = 'stable',
  IMPROVING = 'improving',
  RAPIDLY_IMPROVING = 'rapidly_improving',
}

/**
 * Referral tree node (extended)
 */
export interface ReferralTreeNode {
  /** User address */
  address: string;
  /** User level */
  level: UserLevel;
  /** Direct referrals */
  directReferrals: ReferralTreeNode[];
  /** Team size */
  teamSize: u32;
  /** Is verified */
  isVerified: boolean;
  /** Join date */
  joinDate: u64;
  /** Display name */
  displayName?: string;
  /** Profile image */
  profileImage?: string;
  /** Recent activity */
  recentActivity?: UserActivityLog;
  /** Performance metrics */
  performance?: UserPerformanceMetrics;
}

/**
 * User search filters
 */
export interface UserSearchFilters {
  /** Search query */
  query?: string;
  /** Filter by level */
  level?: UserLevel;
  /** Filter by verification status */
  verificationStatus?: VerificationStatus;
  /** Filter by referrer */
  referrer?: string;
  /** Filter by join date range */
  joinDateFrom?: u64;
  joinDateTo?: u64;
  /** Filter by activity level */
  activityLevel?: EngagementLevel;
  /** Sort by */
  sortBy?: 'joinDate' | 'level' | 'teamSize' | 'totalRewards' | 'activity';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Page size */
  pageSize?: number;
  /** Page number */
  page?: number;
}

/**
 * User search result
 */
export interface UserSearchResult {
  /** User address */
  address: string;
  /** User profile */
  profile: UserProfile;
  /** User statistics */
  stats: UserStats;
  /** Match score */
  matchScore?: number;
  /** Highlighted fields */
  highlights?: Record<string, string[]>;
}

/**
 * User export data
 */
export interface UserExportData {
  /** User address */
  address: string;
  /** User profile */
  profile: UserProfile;
  /** User statistics */
  stats: UserStats;
  /** Activity log */
  activityLog: UserActivityLog[];
  /** Achievements */
  achievements: UserAchievement[];
  /** Referral tree */
  referralTree: ReferralTreeNode;
  /** Export timestamp */
  exportedAt: u64;
  /** Export format */
  format: 'json' | 'csv' | 'pdf';
}

/**
 * User privacy settings
 */
export interface UserPrivacySettings {
  /** User address */
  user: string;
  /** Profile visibility */
  profileVisibility: ProfileVisibility;
  /** Activity visibility */
  activityVisibility: ActivityVisibility;
  /** Referral tree visibility */
  referralTreeVisibility: ReferralTreeVisibility;
  /** Contact preferences */
  contactPreferences: ContactPreferences;
  /** Data sharing preferences */
  dataSharingPreferences: DataSharingPreferences;
}

/**
 * Profile visibility levels
 */
export enum ProfileVisibility {
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
  REFERRALS_ONLY = 'referrals_only',
  PUBLIC = 'public',
}

/**
 * Activity visibility levels
 */
export enum ActivityVisibility {
  PRIVATE = 'private',
  REFERRALS_ONLY = 'referrals_only',
  PUBLIC = 'public',
}

/**
 * Referral tree visibility levels
 */
export enum ReferralTreeVisibility {
  PRIVATE = 'private',
  REFERRALS_ONLY = 'referrals_only',
  PUBLIC = 'public',
}

/**
 * Contact preferences
 */
export interface ContactPreferences {
  /** Allow direct messages */
  allowDirectMessages: boolean;
  /** Allow referral requests */
  allowReferralRequests: boolean;
  /** Allow system notifications */
  allowSystemNotifications: boolean;
  /** Allow marketing emails */
  allowMarketingEmails: boolean;
}

/**
 * Data sharing preferences
 */
export interface DataSharingPreferences {
  /** Share analytics data */
  shareAnalyticsData: boolean;
  /** Share performance metrics */
  sharePerformanceMetrics: boolean;
  /** Share referral data */
  shareReferralData: boolean;
  /** Share activity data */
  shareActivityData: boolean;
}
