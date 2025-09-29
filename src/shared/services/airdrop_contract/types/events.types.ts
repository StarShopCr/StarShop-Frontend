import type { u64, i128 } from '@stellar/stellar-sdk/contract';

/**
 * Event types for the airdrop service
 */
export enum AirdropEventType {
  /** Airdrop event created */
  EVENT_CREATED = 'event_created',
  /** Airdrop event paused */
  EVENT_PAUSED = 'event_paused',
  /** Airdrop event resumed */
  EVENT_RESUMED = 'event_resumed',
  /** Airdrop event finalized */
  EVENT_FINALIZED = 'event_finalized',
  /** User claimed airdrop */
  CLAIM_SUBMITTED = 'claim_submitted',
  /** Claim was successful */
  CLAIM_SUCCESSFUL = 'claim_successful',
  /** Claim failed */
  CLAIM_FAILED = 'claim_failed',
  /** Batch distribution started */
  BATCH_DISTRIBUTION_STARTED = 'batch_distribution_started',
  /** Batch distribution completed */
  BATCH_DISTRIBUTION_COMPLETED = 'batch_distribution_completed',
  /** Provider registered */
  PROVIDER_REGISTERED = 'provider_registered',
  /** Provider updated */
  PROVIDER_UPDATED = 'provider_updated',
  /** Provider removed */
  PROVIDER_REMOVED = 'provider_removed',
  /** Admin changed */
  ADMIN_CHANGED = 'admin_changed',
  /** Contract initialized */
  CONTRACT_INITIALIZED = 'contract_initialized',
  /** Error occurred */
  ERROR = 'error',
}

/**
 * Base event interface
 */
export interface BaseAirdropEvent {
  /** Event type */
  type: AirdropEventType;
  /** Event timestamp */
  timestamp: number;
  /** Event ID */
  eventId?: u64;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** User address if applicable */
  userAddress?: string;
  /** Admin address if applicable */
  adminAddress?: string;
}

/**
 * Event created event
 */
export interface EventCreatedEvent extends BaseAirdropEvent {
  type: AirdropEventType.EVENT_CREATED;
  eventId: u64;
  eventName: string;
  tokenAddress: string;
  amount: i128;
  startTime: u64;
  endTime: u64;
}

/**
 * Event paused event
 */
export interface EventPausedEvent extends BaseAirdropEvent {
  type: AirdropEventType.EVENT_PAUSED;
  eventId: u64;
  reason?: string;
}

/**
 * Event resumed event
 */
export interface EventResumedEvent extends BaseAirdropEvent {
  type: AirdropEventType.EVENT_RESUMED;
  eventId: u64;
}

/**
 * Event finalized event
 */
export interface EventFinalizedEvent extends BaseAirdropEvent {
  type: AirdropEventType.EVENT_FINALIZED;
  eventId: u64;
  totalDistributed: i128;
  recipientCount: u64;
}

/**
 * Claim submitted event
 */
export interface ClaimSubmittedEvent extends BaseAirdropEvent {
  type: AirdropEventType.CLAIM_SUBMITTED;
  eventId: u64;
  userAddress: string;
  claimAmount: i128;
}

/**
 * Claim successful event
 */
export interface ClaimSuccessfulEvent extends BaseAirdropEvent {
  type: AirdropEventType.CLAIM_SUCCESSFUL;
  eventId: u64;
  userAddress: string;
  claimAmount: i128;
  transactionHash: string;
}

/**
 * Claim failed event
 */
export interface ClaimFailedEvent extends BaseAirdropEvent {
  type: AirdropEventType.CLAIM_FAILED;
  eventId: u64;
  userAddress: string;
  error: string;
  errorCode?: number;
}

/**
 * Batch distribution started event
 */
export interface BatchDistributionStartedEvent extends BaseAirdropEvent {
  type: AirdropEventType.BATCH_DISTRIBUTION_STARTED;
  eventId: u64;
  userCount: number;
  totalAmount: i128;
}

/**
 * Batch distribution completed event
 */
export interface BatchDistributionCompletedEvent extends BaseAirdropEvent {
  type: AirdropEventType.BATCH_DISTRIBUTION_COMPLETED;
  eventId: u64;
  successfulClaims: number;
  failedClaims: number;
  totalDistributed: i128;
}

/**
 * Provider registered event
 */
export interface ProviderRegisteredEvent extends BaseAirdropEvent {
  type: AirdropEventType.PROVIDER_REGISTERED;
  metric: string;
  providerAddress: string;
}

/**
 * Provider updated event
 */
export interface ProviderUpdatedEvent extends BaseAirdropEvent {
  type: AirdropEventType.PROVIDER_UPDATED;
  metric: string;
  oldProviderAddress: string;
  newProviderAddress: string;
}

/**
 * Provider removed event
 */
export interface ProviderRemovedEvent extends BaseAirdropEvent {
  type: AirdropEventType.PROVIDER_REMOVED;
  metric: string;
  providerAddress: string;
}

/**
 * Admin changed event
 */
export interface AdminChangedEvent extends BaseAirdropEvent {
  type: AirdropEventType.ADMIN_CHANGED;
  oldAdminAddress: string;
  newAdminAddress: string;
}

/**
 * Contract initialized event
 */
export interface ContractInitializedEvent extends BaseAirdropEvent {
  type: AirdropEventType.CONTRACT_INITIALIZED;
  adminAddress: string;
  initialProviders?: Record<string, string>;
}

/**
 * Error event
 */
export interface ErrorEvent extends BaseAirdropEvent {
  type: AirdropEventType.ERROR;
  error: string;
  errorCode?: number;
  operation?: string;
}

/**
 * Union type for all airdrop events
 */
export type AirdropEventData = 
  | EventCreatedEvent
  | EventPausedEvent
  | EventResumedEvent
  | EventFinalizedEvent
  | ClaimSubmittedEvent
  | ClaimSuccessfulEvent
  | ClaimFailedEvent
  | BatchDistributionStartedEvent
  | BatchDistributionCompletedEvent
  | ProviderRegisteredEvent
  | ProviderUpdatedEvent
  | ProviderRemovedEvent
  | AdminChangedEvent
  | ContractInitializedEvent
  | ErrorEvent;

/**
 * Event listener function type
 */
export type AirdropEventListener = (event: AirdropEventData) => void;

/**
 * Event listener options
 */
export interface EventListenerOptions {
  /** Whether to include historical events */
  includeHistorical?: boolean;
  /** Filter by event types */
  eventTypes?: AirdropEventType[];
  /** Filter by event ID */
  eventId?: u64;
  /** Filter by user address */
  userAddress?: string;
}

/**
 * Event subscription handle
 */
export interface EventSubscription {
  /** Subscription ID */
  id: string;
  /** Event types being listened to */
  eventTypes: AirdropEventType[];
  /** Listener function */
  listener: AirdropEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Subscription options */
  options: EventListenerOptions;
}

/**
 * Event monitoring state
 */
export interface EventMonitoringState {
  /** Whether monitoring is active */
  isActive: boolean;
  /** Number of active subscriptions */
  subscriptionCount: number;
  /** Last event timestamp */
  lastEventTimestamp: number;
  /** Total events processed */
  totalEventsProcessed: number;
  /** Error count */
  errorCount: number;
}
