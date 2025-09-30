import type { u32, u64, i128 } from '@stellar/stellar-sdk';
import type { CampaignStatus, CampaignConfig, RewardTier, Milestone, Contribution } from './crowdfunding.types';

/**
 * Campaign created event data
 */
export interface CampaignCreatedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Campaign creator */
  creator: string;
  /** Campaign configuration */
  config: CampaignConfig;
  /** Creation timestamp */
  timestamp: u64;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Campaign updated event data
 */
export interface CampaignUpdatedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Updated configuration */
  config: CampaignConfig;
  /** Update timestamp */
  timestamp: u64;
  /** Admin who made the update */
  admin: string;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Campaign status changed event data
 */
export interface CampaignStatusChangedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Previous status */
  previousStatus: CampaignStatus;
  /** New status */
  newStatus: CampaignStatus;
  /** Change timestamp */
  timestamp: u64;
  /** Admin who made the change */
  admin: string;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Campaign cancelled event data
 */
export interface CampaignCancelledEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Cancellation reason */
  reason: string;
  /** Cancellation timestamp */
  timestamp: u64;
  /** Admin who cancelled */
  admin: string;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Campaign completed event data
 */
export interface CampaignCompletedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Final amount raised */
  finalAmount: i128;
  /** Completion timestamp */
  timestamp: u64;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Contribution made event data
 */
export interface ContributionMadeEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Contribution ID */
  contributionId: u32;
  /** Contributor address */
  contributor: string;
  /** Contribution amount */
  amount: i128;
  /** Contribution timestamp */
  timestamp: u64;
  /** Selected reward tier ID */
  rewardTierId?: u32;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Funds distributed event data
 */
export interface FundsDistributedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Distribution amount */
  amount: i128;
  /** Recipient address */
  recipient: string;
  /** Distribution reason */
  reason: string;
  /** Distribution timestamp */
  timestamp: u64;
  /** Admin who distributed */
  admin: string;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Refund processed event data
 */
export interface RefundProcessedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Contributor address */
  contributor: string;
  /** Refund amount */
  amount: i128;
  /** Refund reason */
  reason: string;
  /** Refund timestamp */
  timestamp: u64;
  /** Admin who processed refund */
  admin: string;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Reward claimed event data
 */
export interface RewardClaimedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Contributor address */
  contributor: string;
  /** Reward tier ID */
  rewardTierId: u32;
  /** Delivery address */
  deliveryAddress: string;
  /** Claim timestamp */
  timestamp: u64;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Milestone achieved event data
 */
export interface MilestoneAchievedEvent {
  /** Campaign ID */
  campaignId: u32;
  /** Milestone ID */
  milestoneId: u32;
  /** Milestone details */
  milestone: Milestone;
  /** Achievement timestamp */
  timestamp: u64;
  /** Admin who marked as achieved */
  admin: string;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Admin changed event data
 */
export interface AdminChangedEvent {
  /** Previous admin address */
  previousAdmin: string;
  /** New admin address */
  newAdmin: string;
  /** Change timestamp */
  timestamp: u64;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Contract initialized event data
 */
export interface ContractInitializedEvent {
  /** Initial admin address */
  admin: string;
  /** Initialization timestamp */
  timestamp: u64;
  /** Transaction hash */
  transactionHash: string;
}

/**
 * Error event data
 */
export interface ErrorEvent {
  /** Error message */
  error: string;
  /** Error code */
  errorCode?: number;
  /** Operation that failed */
  operation: string;
  /** Error timestamp */
  timestamp: number;
  /** Campaign ID if applicable */
  campaignId?: u32;
  /** Contributor if applicable */
  contributor?: string;
  /** Admin if applicable */
  admin?: string;
}

/**
 * Union type for all possible events
 */
export type CrowdfundingEvent =
  | CampaignCreatedEvent
  | CampaignUpdatedEvent
  | CampaignStatusChangedEvent
  | CampaignCancelledEvent
  | CampaignCompletedEvent
  | ContributionMadeEvent
  | FundsDistributedEvent
  | RefundProcessedEvent
  | RewardClaimedEvent
  | MilestoneAchievedEvent
  | AdminChangedEvent
  | ContractInitializedEvent
  | ErrorEvent;

/**
 * Event filter options
 */
export interface EventFilter {
  /** Filter by event type */
  eventType?: string;
  /** Filter by campaign ID */
  campaignId?: u32;
  /** Filter by contributor */
  contributor?: string;
  /** Filter by admin */
  admin?: string;
  /** Filter by date range */
  dateRange?: {
    start: u64;
    end: u64;
  };
  /** Maximum number of events to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Event subscription options
 */
export interface EventSubscriptionOptions {
  /** Whether to include historical events */
  includeHistorical?: boolean;
  /** Event filter */
  filter?: EventFilter;
  /** Whether to auto-reconnect on connection loss */
  autoReconnect?: boolean;
  /** Reconnection delay in milliseconds */
  reconnectionDelay?: number;
}

/**
 * Event listener configuration
 */
export interface EventListenerConfig {
  /** Whether to enable event logging */
  enableLogging?: boolean;
  /** Log level for events */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** Whether to store events in cache */
  enableCaching?: boolean;
  /** Cache TTL for events in milliseconds */
  cacheTtl?: number;
  /** Maximum number of events to cache */
  maxCacheSize?: number;
}
