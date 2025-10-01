import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk';

/**
 * Governance service configuration
 */
export interface GovernanceServiceConfig {
  /** Network configuration */
  network: NetworkConfig;
  /** Default transaction timeout in seconds */
  timeoutInSeconds?: number;
  /** Default transaction fee */
  fee?: number;
  /** Whether to simulate transactions by default */
  simulate?: boolean;
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** Cache configuration */
  cache?: CacheConfig;
}

/**
 * Network configuration for the governance service
 */
export interface NetworkConfig {
  /** Network passphrase */
  networkPassphrase: string;
  /** Contract ID */
  contractId: string;
  /** RPC endpoint URL */
  rpcUrl: string;
  /** Whether this is a testnet */
  isTestnet: boolean;
}

/**
 * Retry configuration for failed operations
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean;
  /** Cache TTL in milliseconds */
  ttl: number;
  /** Maximum cache size */
  maxSize: number;
}

/**
 * Standardized response wrapper for all governance operations
 */
export interface GovernanceResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if operation failed */
  error?: string;
  /** Error code if operation failed */
  errorCode?: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
}

/**
 * Transaction execution results
 */
export interface TransactionResult {
  /** Transaction hash */
  hash: string;
  /** Whether transaction was successful */
  success: boolean;
  /** Error message if transaction failed */
  error?: string;
  /** Gas used */
  gasUsed?: number;
  /** Transaction fee */
  fee?: number;
}

/**
 * Type-safe address type
 */
export type Address = string;

/**
 * Type-safe proposal ID
 */
export type ProposalId = u32;

/**
 * Governance contract initialization parameters
 */
export interface GovernanceInitConfig {
  /** Admin address */
  admin: Address;
  /** Governance token address */
  token: Address;
  /** Referral contract address */
  referralContract: Address;
  /** Auction contract address */
  auctionContract: Address;
  /** Initial voting configuration */
  config: VotingConfig;
}

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

/**
 * Admin information
 */
export interface AdminInfo {
  /** Admin address */
  address: Address;
  /** Whether contract is initialized */
  isInitialized: boolean;
  /** Contract creation timestamp */
  createdAt?: u64;
}

/**
 * Governance contract health check result
 */
export interface HealthCheck {
  /** Whether service is healthy */
  isHealthy: boolean;
  /** Contract connectivity status */
  contractConnected: boolean;
  /** Network connectivity status */
  networkConnected: boolean;
  /** Wallet connection status */
  walletConnected: boolean;
  /** Error messages */
  errors: string[];
  /** Timestamp of check */
  timestamp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** Total operations performed */
  totalOperations: number;
  /** Successful operations */
  successfulOperations: number;
  /** Failed operations */
  failedOperations: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
}

/**
 * Governance service event types
 */
export enum GovernanceEventType {
  CONTRACT_INITIALIZED = 'contract_initialized',
  ADMIN_CHANGED = 'admin_changed',
  PROPOSAL_CREATED = 'proposal_created',
  PROPOSAL_ACTIVATED = 'proposal_activated',
  PROPOSAL_CANCELLED = 'proposal_cancelled',
  PROPOSAL_VETOED = 'proposal_vetoed',
  PROPOSAL_PASSED = 'proposal_passed',
  PROPOSAL_REJECTED = 'proposal_rejected',
  PROPOSAL_EXECUTED = 'proposal_executed',
  VOTE_CAST = 'vote_cast',
  VOTE_DELEGATED = 'vote_delegated',
  VOTING_WEIGHTS_UPDATED = 'voting_weights_updated',
  ERROR = 'error',
}

/**
 * Governance service event data
 */
export interface GovernanceEventData {
  /** Event type */
  type: GovernanceEventType;
  /** Event timestamp */
  timestamp: number;
  /** Transaction hash if applicable */
  transactionHash?: string;
  /** Proposal ID if applicable */
  proposalId?: ProposalId;
  /** Admin address if applicable */
  admin?: Address;
  /** Voter address if applicable */
  voter?: Address;
  /** Delegatee address if applicable */
  delegatee?: Address;
  /** Error message if applicable */
  error?: string;
  /** Proposal data if applicable */
  proposal?: Proposal;
  /** Vote data if applicable */
  vote?: Vote;
  /** Voting results if applicable */
  votingResults?: VotingResults;
}

/**
 * Event listener function type
 */
export type GovernanceEventListener = (event: GovernanceEventData) => void;

/**
 * Event subscription
 */
export interface EventSubscription {
  /** Subscription ID */
  id: string;
  /** Event types to listen for */
  eventTypes: GovernanceEventType[];
  /** Event listener function */
  listener: GovernanceEventListener;
  /** Whether subscription is active */
  active: boolean;
  /** Event listener options */
  options?: EventListenerOptions;
}

/**
 * Event listener options
 */
export interface EventListenerOptions {
  /** Filter by proposal ID */
  proposalId?: ProposalId;
  /** Filter by admin */
  admin?: Address;
  /** Filter by voter */
  voter?: Address;
  /** Filter by delegatee */
  delegatee?: Address;
}

/**
 * Governance contract status
 */
export interface ContractStatus {
  /** Whether contract is initialized */
  isInitialized: boolean;
  /** Current admin address */
  admin: Address;
  /** Total number of proposals */
  totalProposals: u32;
  /** Active proposals count */
  activeProposals: u32;
  /** Executable proposals count */
  executableProposals: u32;
  /** Contract version */
  version?: string;
}

/**
 * Governance statistics
 */
export interface GovernanceStats {
  /** Total proposals created */
  totalProposals: u32;
  /** Active proposals */
  activeProposals: u32;
  /** Passed proposals */
  passedProposals: u32;
  /** Rejected proposals */
  rejectedProposals: u32;
  /** Executed proposals */
  executedProposals: u32;
  /** Total votes cast */
  totalVotes: u32;
  /** Unique voters */
  uniqueVoters: u32;
  /** Average participation rate */
  averageParticipation: number;
}

/**
 * Governance validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages */
  errors: string[];
  /** Warning messages */
  warnings?: string[];
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  /** Total operations attempted */
  total: number;
  /** Successful operations */
  successful: number;
  /** Failed operations */
  failed: number;
  /** Operation results */
  results: TransactionResult[];
  /** Errors */
  errors: string[];
}

/**
 * Governance filter options for querying
 */
export interface GovernanceFilter {
  /** Filter by proposal status */
  status?: ProposalStatus;
  /** Filter by proposal type */
  type?: ProposalType;
  /** Filter by proposer */
  proposer?: Address;
  /** Filter by admin */
  admin?: Address;
  /** Filter by voter */
  voter?: Address;
  /** Date range filter */
  dateRange?: {
    start: u64;
    end: u64;
  };
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Governance search result
 */
export interface GovernanceSearchResult {
  /** Proposal ID */
  proposalId: ProposalId;
  /** Proposal data */
  proposal: Proposal;
  /** Voting results if available */
  votingResults?: VotingResults;
  /** User's vote if applicable */
  userVote?: Vote;
}
