import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk';

/**
 * Proposal status enumeration
 */
export enum ProposalStatus {
  DRAFT = 0,
  ACTIVE = 1,
  PASSED = 2,
  REJECTED = 3,
  EXECUTED = 4,
  CANCELED = 5,
  VETOED = 6,
}

/**
 * Proposal type enumeration
 */
export enum ProposalType {
  FEATURE_REQUEST = 0,
  POLICY_CHANGE = 1,
  PARAMETER_CHANGE = 2,
  CONTRACT_UPGRADE = 3,
  EMERGENCY_ACTION = 4,
  ECONOMIC_CHANGE = 5,
}

/**
 * Proposal action types
 */
export enum ActionType {
  UPDATE_PROPOSAL_REQUIREMENTS = 'UpdateProposalRequirements',
  APPOINT_MODERATOR = 'AppointModerator',
  REMOVE_MODERATOR = 'RemoveModerator',
  UPDATE_REWARD_RATES = 'UpdateRewardRates',
  UPDATE_LEVEL_REQUIREMENTS = 'UpdateLevelRequirements',
  UPDATE_AUCTION_CONDITIONS = 'UpdateAuctionConditions',
}

/**
 * Proposal action interface
 */
export interface ProposalAction {
  /** Action type */
  type: ActionType;
  /** Action data */
  data: any;
}

/**
 * Proposal requirements
 */
export interface ProposalRequirements {
  /** Cooldown period in seconds */
  cooldownPeriod: u64;
  /** Maximum voting power */
  maxVotingPower: i128;
  /** Proposal limit per user */
  proposalLimit: u32;
  /** Required stake to create proposal */
  requiredStake: i128;
}

/**
 * Reward rates for different user levels
 */
export interface RewardRates {
  /** Gold level reward rate */
  goldRate: i128;
  /** Platinum level reward rate */
  platinumRate: i128;
  /** Silver level reward rate */
  silverRate: i128;
}

/**
 * Level criteria for user levels
 */
export interface LevelCriteria {
  /** Required direct referrals */
  requiredDirectReferrals: u32;
  /** Required team size */
  requiredTeamSize: u32;
  /** Required total rewards */
  requiredTotalRewards: i128;
}

/**
 * Level requirements for all user levels
 */
export interface LevelRequirements {
  /** Gold level criteria */
  gold: LevelCriteria;
  /** Platinum level criteria */
  platinum: LevelCriteria;
  /** Silver level criteria */
  silver: LevelCriteria;
}

/**
 * Auction conditions
 */
export interface AuctionConditions {
  /** Auction type */
  auctionType: AuctionType;
  /** End time */
  endTime: u64;
  /** On bid count condition */
  onBidCount?: u32;
  /** On fixed sequence number condition */
  onFixedSequenceNumber?: u32;
  /** On inactivity seconds condition */
  onInactivitySeconds?: u64;
  /** On maximum participants condition */
  onMaximumParticipants?: u32;
  /** On minimum participants condition */
  onMinimumParticipants?: u32;
  /** On target price condition */
  onTargetPrice?: i128;
  /** Starting price */
  startingPrice: i128;
}

/**
 * Auction type enumeration
 */
export enum AuctionType {
  REGULAR = 'Regular',
  REVERSE = 'Reverse',
  DUTCH = 'Dutch',
}

/**
 * Dutch auction data
 */
export interface DutchAuctionData {
  /** Floor price */
  floorPrice: i128;
}

/**
 * Complete proposal information
 */
export interface Proposal {
  /** Proposal ID */
  id: ProposalId;
  /** Proposal title */
  title: string;
  /** Proposal description */
  description: string;
  /** Metadata hash */
  metadataHash: string;
  /** Proposal type */
  proposalType: ProposalType;
  /** Proposer address */
  proposer: Address;
  /** Proposal status */
  status: ProposalStatus;
  /** Creation timestamp */
  createdAt: u64;
  /** Activation timestamp */
  activatedAt: u64;
  /** Voting configuration */
  votingConfig: VotingConfig;
  /** Proposal actions */
  actions: ProposalAction[];
}

/**
 * Proposal creation request
 */
export interface CreateProposalRequest {
  /** Proposer address */
  proposer: Address;
  /** Proposal title */
  title: string;
  /** Proposal description */
  description: string;
  /** Metadata hash */
  metadataHash: string;
  /** Proposal type */
  proposalType: ProposalType;
  /** Proposal actions */
  actions: ProposalAction[];
  /** Voting configuration */
  votingConfig: VotingConfig;
}

/**
 * Proposal update request
 */
export interface UpdateProposalRequest {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Updater address */
  updater: Address;
  /** New title (optional) */
  title?: string;
  /** New description (optional) */
  description?: string;
  /** New metadata hash (optional) */
  metadataHash?: string;
  /** New actions (optional) */
  actions?: ProposalAction[];
  /** New voting configuration (optional) */
  votingConfig?: VotingConfig;
}

/**
 * Proposal cancellation request
 */
export interface CancelProposalRequest {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Canceller address */
  canceller: Address;
  /** Cancellation reason */
  reason?: string;
}

/**
 * Proposal activation request
 */
export interface ActivateProposalRequest {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Activator address (must be moderator) */
  activator: Address;
}

/**
 * Proposal veto request
 */
export interface VetoProposalRequest {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Vetoer address (must be moderator) */
  vetoer: Address;
  /** Veto reason */
  reason?: string;
}

/**
 * Proposal execution request
 */
export interface ExecuteProposalRequest {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Executor address */
  executor: Address;
}

/**
 * Proposal listing request
 */
export interface ListProposalsRequest {
  /** Filter by status */
  status?: ProposalStatus;
  /** Filter by type */
  type?: ProposalType;
  /** Filter by proposer */
  proposer?: Address;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort order */
  sortBy?: 'createdAt' | 'activatedAt' | 'id';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Proposal listing result
 */
export interface ProposalListResult {
  /** List of proposals */
  proposals: Proposal[];
  /** Total count */
  totalCount: u32;
  /** Has more results */
  hasMore: boolean;
  /** Next offset for pagination */
  nextOffset?: number;
}

/**
 * Proposal validation result
 */
export interface ProposalValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages */
  errors: string[];
  /** Warning messages */
  warnings?: string[];
  /** Validation details */
  details?: {
    titleValid: boolean;
    descriptionValid: boolean;
    actionsValid: boolean;
    votingConfigValid: boolean;
    proposerEligible: boolean;
    cooldownRespected: boolean;
  };
}

/**
 * Proposal statistics
 */
export interface ProposalStats {
  /** Total proposals */
  total: u32;
  /** Active proposals */
  active: u32;
  /** Passed proposals */
  passed: u32;
  /** Rejected proposals */
  rejected: u32;
  /** Executed proposals */
  executed: u32;
  /** Canceled proposals */
  canceled: u32;
  /** Vetoed proposals */
  vetoed: u32;
  /** By type statistics */
  byType: Record<ProposalType, u32>;
  /** By status statistics */
  byStatus: Record<ProposalStatus, u32>;
}

/**
 * Proposal timeline event
 */
export interface ProposalTimelineEvent {
  /** Event timestamp */
  timestamp: u64;
  /** Event type */
  type: 'created' | 'activated' | 'voted' | 'passed' | 'rejected' | 'executed' | 'canceled' | 'vetoed';
  /** Event description */
  description: string;
  /** Actor address */
  actor?: Address;
  /** Additional data */
  data?: any;
}

/**
 * Proposal timeline
 */
export interface ProposalTimeline {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Timeline events */
  events: ProposalTimelineEvent[];
  /** Current status */
  currentStatus: ProposalStatus;
  /** Next expected action */
  nextAction?: string;
  /** Time until next action */
  timeUntilNextAction?: u64;
}

/**
 * Type-safe proposal ID
 */
export type ProposalId = u32;

/**
 * Type-safe address type
 */
export type Address = string;

/**
 * Voting configuration
 */
export interface VotingConfig {
  /** Voting duration in seconds */
  duration: u64;
  /** Execution delay in seconds */
  executionDelay: u64;
  /** One address one vote rule */
  oneAddressOneVote: boolean;
  /** Quorum required for proposal to pass */
  quorum: u128;
  /** Threshold for proposal approval */
  threshold: u128;
}
