import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk';

/**
 * Vote information
 */
export interface Vote {
  /** Voter address */
  voter: Address;
  /** Whether vote is in support */
  support: boolean;
  /** Vote weight */
  weight: i128;
  /** Vote timestamp */
  timestamp: u64;
  /** Proposal ID */
  proposalId: ProposalId;
}

/**
 * Voting results for a proposal
 */
export interface VotingResults {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Total votes cast */
  totalVotes: u32;
  /** Total voting power */
  totalVotingPower: i128;
  /** Votes in support */
  votesFor: i128;
  /** Votes against */
  votesAgainst: i128;
  /** Abstentions */
  abstentions: i128;
  /** Participation rate (0-1) */
  participationRate: number;
  /** Quorum achieved */
  quorumAchieved: boolean;
  /** Threshold met */
  thresholdMet: boolean;
  /** Proposal passed */
  passed: boolean;
  /** Voting period end time */
  votingEndTime: u64;
  /** Time remaining in voting period */
  timeRemaining: u64;
}

/**
 * Vote casting request
 */
export interface CastVoteRequest {
  /** Voter address */
  voter: Address;
  /** Proposal ID */
  proposalId: ProposalId;
  /** Vote support (true for yes, false for no) */
  support: boolean;
  /** Vote weight (optional, will be calculated if not provided) */
  weight?: i128;
}

/**
 * Vote delegation request
 */
export interface DelegateVoteRequest {
  /** Delegator address */
  delegator: Address;
  /** Delegatee address */
  delegatee: Address;
  /** Delegation amount (optional, will delegate all if not provided) */
  amount?: i128;
}

/**
 * Vote weight calculation request
 */
export interface CalculateVoteWeightRequest {
  /** Voter address */
  voter: Address;
  /** Proposal ID */
  proposalId: ProposalId;
  /** Include delegated votes */
  includeDelegated?: boolean;
}

/**
 * Vote weight calculation result
 */
export interface VoteWeightResult {
  /** Voter address */
  voter: Address;
  /** Proposal ID */
  proposalId: ProposalId;
  /** Own voting power */
  ownVotingPower: i128;
  /** Delegated voting power */
  delegatedVotingPower: i128;
  /** Total voting power */
  totalVotingPower: i128;
  /** Vote weight for this proposal */
  voteWeight: i128;
  /** Delegation status */
  delegationStatus: DelegationStatus;
}

/**
 * Delegation status
 */
export interface DelegationStatus {
  /** Whether user has delegated votes */
  isDelegated: boolean;
  /** Delegatee address if delegated */
  delegatee?: Address;
  /** Delegation amount */
  delegationAmount?: i128;
  /** Delegation timestamp */
  delegationTimestamp?: u64;
}

/**
 * Voting power information
 */
export interface VotingPowerInfo {
  /** Address */
  address: Address;
  /** Own voting power */
  ownPower: i128;
  /** Delegated to this address */
  delegatedTo: i128;
  /** Delegated from this address */
  delegatedFrom: i128;
  /** Total effective power */
  totalPower: i128;
  /** Available for delegation */
  availableForDelegation: i128;
}

/**
 * Voting power update request
 */
export interface UpdateVotingWeightsRequest {
  /** Admin address */
  admin: Address;
  /** New voting weights */
  weights: VotingWeightUpdate[];
}

/**
 * Voting weight update
 */
export interface VotingWeightUpdate {
  /** Address to update */
  address: Address;
  /** New voting weight */
  weight: i128;
  /** Update reason */
  reason?: string;
}

/**
 * Voting snapshot
 */
export interface VotingSnapshot {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Snapshot timestamp */
  snapshotAt: u64;
  /** Total voting power at snapshot */
  totalVotingPower: i128;
  /** Number of voters at snapshot */
  voterCount: u32;
}

/**
 * Vote history for a user
 */
export interface VoteHistory {
  /** Voter address */
  voter: Address;
  /** Vote records */
  votes: Vote[];
  /** Total votes cast */
  totalVotes: u32;
  /** Votes for proposals */
  votesFor: u32;
  /** Votes against proposals */
  votesAgainst: u32;
  /** Average voting power used */
  averageVotingPower: i128;
  /** Last vote timestamp */
  lastVoteTimestamp: u64;
}

/**
 * Voting participation statistics
 */
export interface VotingParticipationStats {
  /** Total eligible voters */
  totalEligibleVoters: u32;
  /** Voters who participated */
  participatingVoters: u32;
  /** Participation rate (0-1) */
  participationRate: number;
  /** Average voting power used */
  averageVotingPower: i128;
  /** Most active voters */
  topVoters: Array<{
    address: Address;
    votesCast: u32;
    votingPower: i128;
  }>;
}

/**
 * Vote validation result
 */
export interface VoteValidationResult {
  /** Whether vote is valid */
  isValid: boolean;
  /** Error messages */
  errors: string[];
  /** Warning messages */
  warnings?: string[];
  /** Validation details */
  details?: {
    voterEligible: boolean;
    proposalActive: boolean;
    votingPeriodValid: boolean;
    sufficientVotingPower: boolean;
    notAlreadyVoted: boolean;
    delegationValid: boolean;
  };
}

/**
 * Voting power delegation chain
 */
export interface DelegationChain {
  /** Original delegator */
  originalDelegator: Address;
  /** Final delegatee */
  finalDelegatee: Address;
  /** Delegation chain */
  chain: Array<{
    from: Address;
    to: Address;
    amount: i128;
    timestamp: u64;
  }>;
  /** Total delegated amount */
  totalAmount: i128;
  /** Chain length */
  chainLength: u32;
}

/**
 * Vote aggregation result
 */
export interface VoteAggregation {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Aggregation timestamp */
  timestamp: u64;
  /** Total votes */
  totalVotes: u32;
  /** Unique voters */
  uniqueVoters: u32;
  /** Votes by weight */
  votesByWeight: {
    light: u32;    // < 10% of total power
    medium: u32;   // 10-50% of total power
    heavy: u32;    // > 50% of total power
  };
  /** Vote distribution */
  distribution: {
    for: number;      // Percentage
    against: number;  // Percentage
    abstain: number;  // Percentage
  };
}

/**
 * Voting power snapshot request
 */
export interface TakeSnapshotRequest {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Snapshot taker address */
  taker: Address;
}

/**
 * Vote query request
 */
export interface VoteQueryRequest {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Voter address */
  voter: Address;
  /** Include delegation info */
  includeDelegation?: boolean;
}

/**
 * Vote query result
 */
export interface VoteQueryResult {
  /** Vote information */
  vote?: Vote;
  /** Voting power at time of vote */
  votingPower?: i128;
  /** Delegation status */
  delegationStatus?: DelegationStatus;
  /** Vote timestamp */
  voteTimestamp?: u64;
}

/**
 * Voting power query request
 */
export interface VotingPowerQueryRequest {
  /** Address to query */
  address: Address;
  /** Proposal ID (optional, for historical power) */
  proposalId?: ProposalId;
  /** Include delegation info */
  includeDelegation?: boolean;
}

/**
 * Voting power query result
 */
export interface VotingPowerQueryResult {
  /** Address */
  address: Address;
  /** Current voting power */
  currentPower: i128;
  /** Voting power at proposal time */
  proposalPower?: i128;
  /** Delegation info */
  delegation: DelegationStatus;
  /** Available for delegation */
  availableForDelegation: i128;
  /** Last updated timestamp */
  lastUpdated: u64;
}

/**
 * Type-safe proposal ID
 */
export type ProposalId = u32;

/**
 * Type-safe address type
 */
export type Address = string;
