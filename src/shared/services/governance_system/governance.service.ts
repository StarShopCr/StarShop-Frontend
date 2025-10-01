import { Client as ContractClient } from '@stellar/stellar-sdk/contract';
import { 
  Client as GovernanceContractClient,
  networks,
  type Proposal as ContractProposal,
  type Vote as ContractVote,
  type VotingConfig as ContractVotingConfig,
  type ProposalStatus,
  type ProposalType,
  type Action as ContractAction,
  Errors
} from '../../../../packages/governance_system_contract/src/index';
import type { u32, u64, u128, i128 } from '@stellar/stellar-sdk';
import { 
  signTransaction, 
  getPublicKey, 
  isWalletConnected 
} from '../../utils/wallet';
import { 
  NETWORKS, 
  DEFAULT_CONFIG, 
  ERROR_MESSAGES, 
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  GOVERNANCE_ERROR_CODES
} from './constants/governance.constants';
import {
  validateProposal,
  validateVote,
  validateDelegation,
  isValidStellarAddress,
  isValidProposalId,
  calculateVotingResults,
  formatTimeDuration,
  isProposalActive,
  isProposalExecutable,
  getProposalStatusLabel,
  getProposalTypeLabel,
  sanitizeString,
  retryWithBackoff,
  getErrorType,
  createSuccessResponse,
  createErrorResponse,
  mergeBatchResults,
  generateUniqueId,
  deepClone
} from './utils/governance.utils';
import type {
  GovernanceServiceConfig,
  NetworkConfig,
  GovernanceResponse,
  TransactionResult,
  AdminInfo,
  ContractStatus,
  GovernanceStats,
  HealthCheck,
  PerformanceMetrics,
  GovernanceEventType,
  GovernanceEventData,
  GovernanceEventListener,
  EventSubscription,
  EventListenerOptions,
  GovernanceFilter,
  GovernanceSearchResult,
  ValidationResult,
  BatchOperationResult
} from './types/governance.types';
import type {
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
  CancelProposalRequest,
  ActivateProposalRequest,
  VetoProposalRequest,
  ExecuteProposalRequest,
  ListProposalsRequest,
  ProposalListResult,
  ProposalValidationResult,
  ProposalStats,
  ProposalTimeline,
  ProposalTimelineEvent,
  ProposalId,
  Address,
  VotingConfig
} from './types/proposal.types';
import type {
  Vote,
  VotingResults,
  CastVoteRequest,
  DelegateVoteRequest,
  CalculateVoteWeightRequest,
  VoteWeightResult,
  DelegationStatus,
  VotingPowerInfo,
  UpdateVotingWeightsRequest,
  VotingWeightUpdate,
  VotingSnapshot,
  VoteHistory,
  VotingParticipationStats,
  VoteValidationResult,
  DelegationChain,
  VoteAggregation,
  TakeSnapshotRequest,
  VoteQueryRequest,
  VoteQueryResult,
  VotingPowerQueryRequest,
  VotingPowerQueryResult
} from './types/voting.types';

/**
 * Comprehensive TypeScript service layer for Governance System Contract interactions
 */
export class GovernanceService {
  private contract: GovernanceContractClient;
  private networkConfig: NetworkConfig;
  private config: GovernanceServiceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private eventListeners: Map<string, EventSubscription> = new Map();
  private isInitialized: boolean = false;
  private performanceMetrics: PerformanceMetrics = {
    averageResponseTime: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    cacheHitRate: 0
  };

  constructor(config?: Partial<GovernanceServiceConfig>) {
    this.config = {
      network: NETWORKS.testnet,
      timeoutInSeconds: DEFAULT_CONFIG.TIMEOUT_SECONDS,
      fee: DEFAULT_CONFIG.FEE,
      simulate: DEFAULT_CONFIG.SIMULATE,
      retryConfig: DEFAULT_CONFIG.RETRY,
      cache: DEFAULT_CONFIG.CACHE,
      ...config
    };
    
    this.networkConfig = this.config.network;
    this.contract = new GovernanceContractClient({
      contractId: this.networkConfig.contractId,
      networkPassphrase: this.networkConfig.networkPassphrase,
      rpcUrl: this.networkConfig.rpcUrl,
    });
  }

  /**
   * Initialize the service with configuration
   */
  async initialize(config?: Partial<GovernanceServiceConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
      this.networkConfig = this.config.network;
    }

    // Verify wallet connection
    const isConnected = await isWalletConnected();
    if (!isConnected) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Test contract connection
    try {
      await this.getContractStatus();
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize service: ${error}`);
    }
  }

  // ==================== CONTRACT INITIALIZATION & ADMIN MANAGEMENT ====================

  /**
   * Initialize the governance contract
   */
  async initializeGovernanceContract(config: {
    admin: Address;
    token: Address;
    referralContract: Address;
    auctionContract: Address;
    config: VotingConfig;
  }): Promise<GovernanceResponse<TransactionResult>> {
    try {
      // Validate inputs
      if (!isValidStellarAddress(config.admin)) {
        return createErrorResponse('Invalid admin address format');
      }
      if (!isValidStellarAddress(config.token)) {
        return createErrorResponse('Invalid token address format');
      }
      if (!isValidStellarAddress(config.referralContract)) {
        return createErrorResponse('Invalid referral contract address format');
      }
      if (!isValidStellarAddress(config.auctionContract)) {
        return createErrorResponse('Invalid auction contract address format');
      }

      const tx = await this.contract.initialize({
        admin: config.admin,
        token: config.token,
        referral_contract: config.referralContract,
        auction_contract: config.auctionContract,
        config: {
          duration: config.config.duration,
          execution_delay: config.config.executionDelay,
          one_address_one_vote: config.config.oneAddressOneVote,
          quorum: config.config.quorum,
          threshold: config.config.threshold,
        }
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.emitEvent({
          type: GovernanceEventType.CONTRACT_INITIALIZED,
          timestamp: Date.now(),
          admin: config.admin,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'initializeGovernanceContract');
    }
  }

  /**
   * Get current admin address
   */
  async getAdmin(): Promise<GovernanceResponse<Address>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.ADMIN);
      if (cached) {
        return createSuccessResponse(cached);
      }

      // Note: The contract doesn't have a direct getAdmin method, 
      // so we'll need to get it from contract status or implement it
      const status = await this.getContractStatus();
      if (!status.success) {
        return createErrorResponse('Failed to get contract status');
      }

      const adminAddress = status.data!.admin;
      this.setCachedData(CACHE_KEYS.ADMIN, adminAddress);
      return createSuccessResponse(adminAddress);
    } catch (error) {
      return this.handleError(error, 'getAdmin');
    }
  }

  /**
   * Update admin address (if supported by contract)
   */
  async updateAdmin(newAdmin: Address): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(newAdmin)) {
        return createErrorResponse('Invalid admin address format');
      }

      // This would need to be implemented in the contract
      // For now, we'll return an error indicating it's not supported
      return createErrorResponse('Admin update not supported by current contract version');
    } catch (error) {
      return this.handleError(error, 'updateAdmin');
    }
  }

  /**
   * Get contract status
   */
  async getContractStatus(): Promise<GovernanceResponse<ContractStatus>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.CONTRACT_STATUS);
      if (cached) {
        return createSuccessResponse(cached);
      }

      // Get active and executable proposals
      const [activeProposalsResponse, executableProposalsResponse] = await Promise.all([
        this.getActiveProposals(),
        this.getExecutableProposals()
      ]);

      const status: ContractStatus = {
        isInitialized: true, // Assume initialized if we can call methods
        admin: '', // Would need to be retrieved from contract
        totalProposals: 0, // Would need to be calculated
        activeProposals: activeProposalsResponse.success ? activeProposalsResponse.data!.length : 0,
        executableProposals: executableProposalsResponse.success ? executableProposalsResponse.data!.length : 0,
        version: '1.0.0'
      };

      this.setCachedData(CACHE_KEYS.CONTRACT_STATUS, status);
      return createSuccessResponse(status);
    } catch (error) {
      return this.handleError(error, 'getContractStatus');
    }
  }

  // ==================== PROPOSAL MANAGEMENT ====================

  /**
   * Create a new governance proposal
   */
  async createProposal(request: CreateProposalRequest): Promise<GovernanceResponse<ProposalId>> {
    try {
      // Validate proposal
      const validation = validateProposal({
        title: request.title,
        description: request.description,
        metadataHash: request.metadataHash,
        proposalType: request.proposalType,
        proposer: request.proposer,
        actions: request.actions,
        votingConfig: request.votingConfig
      });

      if (!validation.isValid) {
        return createErrorResponse(`Proposal validation failed: ${validation.errors.join(', ')}`);
      }

      const tx = await this.contract.create_proposal({
        proposer: request.proposer,
        title: sanitizeString(request.title, VALIDATION.MAX_TITLE_LENGTH),
        description: sanitizeString(request.description, VALIDATION.MAX_DESCRIPTION_LENGTH),
        metadata_hash: request.metadataHash,
        proposal_type: request.proposalType,
        actions: request.actions as ContractAction[],
        voting_config: {
          duration: request.votingConfig.duration,
          execution_delay: request.votingConfig.executionDelay,
          one_address_one_vote: request.votingConfig.oneAddressOneVote,
          quorum: request.votingConfig.quorum,
          threshold: request.votingConfig.threshold,
        }
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        const proposalId = result.data as ProposalId;
        
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL_LIST());
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_CREATED,
          timestamp: Date.now(),
          proposalId,
          proposer: request.proposer,
          transactionHash: result.hash
        });

        return createSuccessResponse(proposalId);
      }

      return createErrorResponse(result.error || 'Failed to create proposal');
    } catch (error) {
      return this.handleError(error, 'createProposal');
    }
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId: ProposalId): Promise<GovernanceResponse<Proposal>> {
    try {
      if (!isValidProposalId(proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.PROPOSAL(proposalId));
      if (cached) {
        return createSuccessResponse(cached);
      }

      const tx = await this.contract.get_proposal({ proposal_id: proposalId });
      const result = await tx.simulate();
      const contractProposal = result.result as ContractProposal;

      const proposal: Proposal = {
        id: contractProposal.id,
        title: contractProposal.title,
        description: contractProposal.description,
        metadataHash: contractProposal.metadata_hash,
        proposalType: contractProposal.proposal_type,
        proposer: contractProposal.proposer,
        status: contractProposal.status,
        createdAt: contractProposal.created_at,
        activatedAt: contractProposal.activated_at,
        votingConfig: {
          duration: contractProposal.voting_config.duration,
          executionDelay: contractProposal.voting_config.execution_delay,
          oneAddressOneVote: contractProposal.voting_config.one_address_one_vote,
          quorum: contractProposal.voting_config.quorum,
          threshold: contractProposal.voting_config.threshold,
        },
        actions: contractProposal.actions
      };

      this.setCachedData(CACHE_KEYS.PROPOSAL(proposalId), proposal);
      return createSuccessResponse(proposal);
    } catch (error) {
      return this.handleError(error, 'getProposal');
    }
  }

  /**
   * Update proposal (if supported by contract)
   */
  async updateProposal(request: UpdateProposalRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(request.proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(request.updater)) {
        return createErrorResponse('Invalid updater address');
      }

      // This would need to be implemented in the contract
      // For now, we'll return an error indicating it's not supported
      return createErrorResponse('Proposal updates not supported by current contract version');
    } catch (error) {
      return this.handleError(error, 'updateProposal');
    }
  }

  /**
   * Cancel proposal
   */
  async cancelProposal(request: CancelProposalRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(request.proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(request.canceller)) {
        return createErrorResponse('Invalid canceller address');
      }

      const tx = await this.contract.cancel_proposal({
        caller: request.canceller,
        proposal_id: request.proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL(request.proposalId));
        this.invalidateCache(CACHE_KEYS.PROPOSAL_LIST());
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_CANCELLED,
          timestamp: Date.now(),
          proposalId: request.proposalId,
          admin: request.canceller,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'cancelProposal');
    }
  }

  /**
   * Activate proposal
   */
  async activateProposal(request: ActivateProposalRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(request.proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(request.activator)) {
        return createErrorResponse('Invalid activator address');
      }

      const tx = await this.contract.activate_proposal({
        caller: request.activator,
        proposal_id: request.proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL(request.proposalId));
        this.invalidateCache(CACHE_KEYS.ACTIVE_PROPOSALS);
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_ACTIVATED,
          timestamp: Date.now(),
          proposalId: request.proposalId,
          admin: request.activator,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'activateProposal');
    }
  }

  /**
   * Veto proposal
   */
  async vetoProposal(request: VetoProposalRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(request.proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(request.vetoer)) {
        return createErrorResponse('Invalid vetoer address');
      }

      const tx = await this.contract.veto_proposal({
        moderator: request.vetoer,
        proposal_id: request.proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL(request.proposalId));
        this.invalidateCache(CACHE_KEYS.PROPOSAL_LIST());
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_VETOED,
          timestamp: Date.now(),
          proposalId: request.proposalId,
          admin: request.vetoer,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'vetoProposal');
    }
  }

  /**
   * Mark proposal as passed
   */
  async markProposalPassed(proposalId: ProposalId, caller: Address): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(caller)) {
        return createErrorResponse('Invalid caller address');
      }

      const tx = await this.contract.mark_passed({
        caller,
        proposal_id: proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL(proposalId));
        this.invalidateCache(CACHE_KEYS.PROPOSAL_LIST());
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_PASSED,
          timestamp: Date.now(),
          proposalId,
          admin: caller,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'markProposalPassed');
    }
  }

  /**
   * Mark proposal as rejected
   */
  async markProposalRejected(proposalId: ProposalId, caller: Address): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(caller)) {
        return createErrorResponse('Invalid caller address');
      }

      const tx = await this.contract.mark_rejected({
        caller,
        proposal_id: proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL(proposalId));
        this.invalidateCache(CACHE_KEYS.PROPOSAL_LIST());
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_REJECTED,
          timestamp: Date.now(),
          proposalId,
          admin: caller,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'markProposalRejected');
    }
  }

  /**
   * Mark proposal as executed
   */
  async markProposalExecuted(proposalId: ProposalId, caller: Address): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(caller)) {
        return createErrorResponse('Invalid caller address');
      }

      const tx = await this.contract.mark_executed({
        caller,
        proposal_id: proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL(proposalId));
        this.invalidateCache(CACHE_KEYS.PROPOSAL_LIST());
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_EXECUTED,
          timestamp: Date.now(),
          proposalId,
          admin: caller,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'markProposalExecuted');
    }
  }

  /**
   * List proposals with filters
   */
  async listProposals(request: ListProposalsRequest = {}): Promise<GovernanceResponse<ProposalListResult>> {
    try {
      const cacheKey = CACHE_KEYS.PROPOSAL_LIST(
        request.status?.toString(),
        request.limit,
        request.offset
      );
      
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return createSuccessResponse(cached);
      }

      // Get all active proposals first
      const activeProposalsResponse = await this.getActiveProposals();
      if (!activeProposalsResponse.success) {
        return createErrorResponse('Failed to get active proposals');
      }

      const activeProposalIds = activeProposalsResponse.data!;
      const proposals: Proposal[] = [];

      // Get proposal details for each active proposal
      for (const proposalId of activeProposalIds) {
        const proposalResponse = await this.getProposal(proposalId);
        if (proposalResponse.success) {
          proposals.push(proposalResponse.data!);
        }
      }

      // Apply filters
      let filteredProposals = proposals;

      if (request.status !== undefined) {
        filteredProposals = filteredProposals.filter(p => p.status === request.status);
      }

      if (request.type !== undefined) {
        filteredProposals = filteredProposals.filter(p => p.proposalType === request.type);
      }

      if (request.proposer) {
        filteredProposals = filteredProposals.filter(p => p.proposer === request.proposer);
      }

      // Apply pagination
      const offset = request.offset || 0;
      const limit = request.limit || 50;
      const paginatedProposals = filteredProposals.slice(offset, offset + limit);

      const result: ProposalListResult = {
        proposals: paginatedProposals,
        totalCount: filteredProposals.length,
        hasMore: offset + limit < filteredProposals.length,
        nextOffset: offset + limit < filteredProposals.length ? offset + limit : undefined
      };

      this.setCachedData(cacheKey, result);
      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'listProposals');
    }
  }

  /**
   * Get active proposals
   */
  async getActiveProposals(): Promise<GovernanceResponse<ProposalId[]>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.ACTIVE_PROPOSALS);
      if (cached) {
        return createSuccessResponse(cached);
      }

      const tx = await this.contract.get_active_proposals();
      const result = await tx.simulate();
      const proposalIds = result.result as ProposalId[];

      this.setCachedData(CACHE_KEYS.ACTIVE_PROPOSALS, proposalIds);
      return createSuccessResponse(proposalIds);
    } catch (error) {
      return this.handleError(error, 'getActiveProposals');
    }
  }

  /**
   * Get executable proposals
   */
  async getExecutableProposals(): Promise<GovernanceResponse<ProposalId[]>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.EXECUTABLE_PROPOSALS);
      if (cached) {
        return createSuccessResponse(cached);
      }

      const tx = await this.contract.get_executable_proposals();
      const result = await tx.simulate();
      const proposalIds = result.result as ProposalId[];

      this.setCachedData(CACHE_KEYS.EXECUTABLE_PROPOSALS, proposalIds);
      return createSuccessResponse(proposalIds);
    } catch (error) {
      return this.handleError(error, 'getExecutableProposals');
    }
  }

  // ==================== VOTING OPERATIONS ====================

  /**
   * Cast a vote on a proposal
   */
  async vote(request: CastVoteRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      // Validate vote
      const validation = validateVote({
        voter: request.voter,
        proposalId: request.proposalId,
        support: request.support,
        weight: request.weight
      });

      if (!validation.isValid) {
        return createErrorResponse(`Vote validation failed: ${validation.errors.join(', ')}`);
      }

      const tx = await this.contract.cast_vote({
        voter: request.voter,
        proposal_id: request.proposalId,
        support: request.support
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.VOTE(request.proposalId, request.voter));
        this.invalidateCache(CACHE_KEYS.VOTING_RESULTS(request.proposalId));

        this.emitEvent({
          type: GovernanceEventType.VOTE_CAST,
          timestamp: Date.now(),
          proposalId: request.proposalId,
          voter: request.voter,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'vote');
    }
  }

  /**
   * Get voter's vote on a proposal
   */
  async getVote(proposalId: ProposalId, voter: Address): Promise<GovernanceResponse<Vote | null>> {
    try {
      if (!isValidProposalId(proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(voter)) {
        return createErrorResponse('Invalid voter address');
      }

      const cached = this.getCachedData(CACHE_KEYS.VOTE(proposalId, voter));
      if (cached !== null) {
        return createSuccessResponse(cached);
      }

      // Note: The contract doesn't have a direct getVote method
      // This would need to be implemented or retrieved from events
      return createErrorResponse('Vote retrieval not implemented in current contract version');
    } catch (error) {
      return this.handleError(error, 'getVote');
    }
  }

  /**
   * Get voting results for a proposal
   */
  async getVotingResults(proposalId: ProposalId): Promise<GovernanceResponse<VotingResults>> {
    try {
      if (!isValidProposalId(proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.VOTING_RESULTS(proposalId));
      if (cached) {
        return createSuccessResponse(cached);
      }

      // Get proposal details
      const proposalResponse = await this.getProposal(proposalId);
      if (!proposalResponse.success) {
        return createErrorResponse('Failed to get proposal details');
      }

      const proposal = proposalResponse.data!;

      // Get voters count
      const tx = await this.contract.get_proposal_voters_count({ proposal_id: proposalId });
      const result = await tx.simulate();
      const votersCount = result.result as u128;

      // Calculate voting results
      const votingResults: VotingResults = {
        proposalId,
        totalVotes: Number(votersCount),
        totalVotingPower: 0n, // Would need to be calculated
        votesFor: 0n, // Would need to be calculated
        votesAgainst: 0n, // Would need to be calculated
        abstentions: 0n, // Would need to be calculated
        participationRate: 0, // Would need to be calculated
        quorumAchieved: false, // Would need to be calculated
        thresholdMet: false, // Would need to be calculated
        passed: false, // Would need to be calculated
        votingEndTime: proposal.activatedAt + proposal.votingConfig.duration,
        timeRemaining: 0 // Would need to be calculated
      };

      this.setCachedData(CACHE_KEYS.VOTING_RESULTS(proposalId), votingResults);
      return createSuccessResponse(votingResults);
    } catch (error) {
      return this.handleError(error, 'getVotingResults');
    }
  }

  /**
   * Delegate voting power
   */
  async delegateVote(request: DelegateVoteRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      // Validate delegation
      const validation = validateDelegation(request.delegator, request.delegatee);
      if (!validation.isValid) {
        return createErrorResponse(`Delegation validation failed: ${validation.errors.join(', ')}`);
      }

      const tx = await this.contract.delegate_vote({
        delegator: request.delegator,
        delegatee: request.delegatee
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.DELEGATION(request.delegator));
        this.invalidateCache(CACHE_KEYS.VOTING_POWER(request.delegator));

        this.emitEvent({
          type: GovernanceEventType.VOTE_DELEGATED,
          timestamp: Date.now(),
          voter: request.delegator,
          delegatee: request.delegatee,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'delegateVote');
    }
  }

  // ==================== EXECUTION & WEIGHTS ====================

  /**
   * Execute a passed proposal
   */
  async executeProposal(request: ExecuteProposalRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(request.proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(request.executor)) {
        return createErrorResponse('Invalid executor address');
      }

      const tx = await this.contract.execute_proposal({
        executor: request.executor,
        proposal_id: request.proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.PROPOSAL(request.proposalId));
        this.invalidateCache(CACHE_KEYS.PROPOSAL_LIST());
        this.invalidateCache(CACHE_KEYS.CONTRACT_STATUS);

        this.emitEvent({
          type: GovernanceEventType.PROPOSAL_EXECUTED,
          timestamp: Date.now(),
          proposalId: request.proposalId,
          admin: request.executor,
          transactionHash: result.hash
        });
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'executeProposal');
    }
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: Address, proposalId?: ProposalId): Promise<GovernanceResponse<i128>> {
    try {
      if (!isValidStellarAddress(address)) {
        return createErrorResponse('Invalid address format');
      }

      if (proposalId && !isValidProposalId(proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      const cacheKey = CACHE_KEYS.VOTING_POWER(address, proposalId);
      const cached = this.getCachedData(cacheKey);
      if (cached !== null) {
        return createSuccessResponse(cached);
      }

      if (proposalId) {
        const tx = await this.contract.get_vote_weight({
          voter: address,
          proposal_id: proposalId
        });
        const result = await tx.simulate();
        const votingPower = result.result as i128;

        this.setCachedData(cacheKey, votingPower);
        return createSuccessResponse(votingPower);
      }

      // For general voting power, we'd need a different method
      return createErrorResponse('General voting power retrieval not implemented');
    } catch (error) {
      return this.handleError(error, 'getVotingPower');
    }
  }

  /**
   * Update voting weights (admin only)
   */
  async updateVotingWeights(request: UpdateVotingWeightsRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(request.admin)) {
        return createErrorResponse('Invalid admin address');
      }

      // This would need to be implemented in the contract
      return createErrorResponse('Voting weights update not supported by current contract version');
    } catch (error) {
      return this.handleError(error, 'updateVotingWeights');
    }
  }

  /**
   * Take voting power snapshot
   */
  async takeSnapshot(request: TakeSnapshotRequest): Promise<GovernanceResponse<TransactionResult>> {
    try {
      if (!isValidProposalId(request.proposalId)) {
        return createErrorResponse('Invalid proposal ID');
      }

      if (!isValidStellarAddress(request.taker)) {
        return createErrorResponse('Invalid taker address');
      }

      const tx = await this.contract.take_snapshot({
        proposal_id: request.proposalId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.VOTING_RESULTS(request.proposalId));
      }

      return createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'takeSnapshot');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Sign and send transaction
   */
  private async signAndSendTransaction(tx: any): Promise<TransactionResult> {
    const startTime = Date.now();
    
    try {
      const xdr = tx.toXDR();
      const signedXdr = await signTransaction(xdr, this.networkConfig.isTestnet ? 'TESTNET' : 'MAINNET');
      
      const result = await tx.signAndSend(signedXdr);
      
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(true, responseTime);
      
      return {
        hash: result.hash,
        success: true,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(false, responseTime);
      
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(success: boolean, responseTime: number): void {
    this.performanceMetrics.totalOperations++;
    if (success) {
      this.performanceMetrics.successfulOperations++;
    } else {
      this.performanceMetrics.failedOperations++;
    }
    
    // Update average response time
    this.performanceMetrics.averageResponseTime = 
      (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalOperations - 1) + responseTime) / 
      this.performanceMetrics.totalOperations;
  }

  // ==================== CACHING METHODS ====================

  /**
   * Get cached data
   */
  private getCachedData(key: string): any | null {
    if (!this.config.cache?.enabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > (this.config.cache?.ttl || DEFAULT_CONFIG.CACHE.ttl)) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set cached data
   */
  private setCachedData(key: string, data: any): void {
    if (!this.config.cache?.enabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate cache entry
   */
  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Add event listener
   */
  public addEventListener(
    eventTypes: GovernanceEventType[],
    listener: GovernanceEventListener,
    options?: EventListenerOptions
  ): string {
    const subscriptionId = generateUniqueId();
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventTypes,
      listener,
      active: true,
      options: options || {}
    };
    
    this.eventListeners.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Remove event listener
   */
  public removeEventListener(subscriptionId: string): boolean {
    return this.eventListeners.delete(subscriptionId);
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: GovernanceEventData): void {
    for (const subscription of this.eventListeners.values()) {
      if (!subscription.active) continue;
      
      if (subscription.eventTypes.includes(event.type)) {
        // Apply filters
        if (subscription.options?.proposalId && event.proposalId !== subscription.options.proposalId) {
          continue;
        }
        
        if (subscription.options?.admin && event.admin !== subscription.options.admin) {
          continue;
        }
        
        if (subscription.options?.voter && event.voter !== subscription.options.voter) {
          continue;
        }
        
        if (subscription.options?.delegatee && event.delegatee !== subscription.options.delegatee) {
          continue;
        }
        
        try {
          subscription.listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Handle errors and return standardized response
   */
  private handleError(error: any, operation: string): GovernanceResponse<any> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = getErrorType(errorMessage);
    
    this.emitEvent({
      type: GovernanceEventType.ERROR,
      timestamp: Date.now(),
      error: errorMessage,
      operation
    });
    
    return createErrorResponse(errorMessage, errorType);
  }

  // ==================== HEALTH CHECK & MONITORING ====================

  /**
   * Perform health check
   */
  public async healthCheck(): Promise<HealthCheck> {
    const errors: string[] = [];
    let contractConnected = false;
    let networkConnected = false;
    let walletConnected = false;

    try {
      // Check wallet connection
      walletConnected = await isWalletConnected();
      if (!walletConnected) {
        errors.push('Wallet not connected');
      }
    } catch (error) {
      errors.push(`Wallet check failed: ${error}`);
    }

    try {
      // Check contract connection
      await this.getContractStatus();
      contractConnected = true;
    } catch (error) {
      errors.push(`Contract connection failed: ${error}`);
    }

    try {
      // Check network connection
      await this.getActiveProposals();
      networkConnected = true;
    } catch (error) {
      errors.push(`Network connection failed: ${error}`);
    }

    return {
      isHealthy: errors.length === 0,
      contractConnected,
      networkConnected,
      walletConnected,
      errors,
      timestamp: Date.now()
    };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Reset performance metrics
   */
  public resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      averageResponseTime: 0,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      cacheHitRate: 0
    };
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.eventListeners.clear();
    this.cache.clear();
    this.isInitialized = false;
  }
}
