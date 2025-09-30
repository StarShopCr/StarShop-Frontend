import { Client as ContractClient } from '@stellar/stellar-sdk/contract';
import { 
  Client as CrowdfundingContractClient,
  networks,
  type Campaign as ContractCampaign,
  type Contribution as ContractContribution,
  type RewardTier as ContractRewardTier,
  type Milestone as ContractMilestone
} from '../../../../packages/starfunding/src/index';
import type { u32, u64, i128 } from './types/crowdfunding.types';
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
  CROWDFUNDING_ERROR_CODES
} from './constants/crowdfunding.constants';
import {
  validateCampaignConfig,
  validateContributionRequest,
  validateRewardTier,
  validateMilestone,
  calculateCompletionPercentage,
  isGoalReached,
  isCampaignActive,
  isDeadlinePassed,
  formatAmount,
  parseAmount,
  sanitizeString,
  generateUniqueId,
  retryWithBackoff,
  getErrorType,
  isValidStellarAddress,
  isValidCampaignId,
  filterCampaigns,
  sortCampaigns,
  calculateCampaignStats,
  calculateContributorStats,
  canContribute,
  canClaimReward
} from './utils/crowdfunding.utils';
import type {
  CrowdfundingServiceConfig,
  NetworkConfig,
  CrowdfundingResponse,
  TransactionResult,
  Campaign,
  CampaignConfig,
  CampaignStatus,
  Contribution,
  RewardTier,
  Milestone,
  CreateCampaignRequest,
  ContributionRequest,
  DistributeFundsRequest,
  RefundRequest,
  ClaimRewardRequest,
  UpdateMilestoneRequest,
  CampaignStats,
  ContributorStats,
  CampaignFilter,
  CampaignSearchResult,
  HealthCheck,
  PerformanceMetrics,
  CampaignId,
  Address,
  CrowdfundingEventType,
  CrowdfundingEventData,
  CrowdfundingEventListener,
  EventSubscription,
  EventListenerOptions,
  AdminInfo,
  BatchOperationResult
} from './types/crowdfunding.types';

/**
 * Comprehensive TypeScript service layer for Crowdfunding Collective Contract interactions
 */
export class CrowdfundingService {
  private contract: CrowdfundingContractClient;
  private networkConfig: NetworkConfig;
  private config: CrowdfundingServiceConfig;
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

  constructor(config?: Partial<CrowdfundingServiceConfig>) {
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
    this.contract = new CrowdfundingContractClient({
      contractId: this.networkConfig.contractId,
      networkPassphrase: this.networkConfig.networkPassphrase,
      rpcUrl: this.networkConfig.rpcUrl,
    });
  }

  /**
   * Initialize the service with configuration
   */
  async initialize(config?: Partial<CrowdfundingServiceConfig>): Promise<void> {
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
      await this.getAdmin();
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize service: ${error}`);
    }
  }

  // ==================== CONTRACT INITIALIZATION & ADMIN MANAGEMENT ====================

  /**
   * Initialize the crowdfunding contract
   */
  async initializeCrowdfundingContract(admin: Address): Promise<CrowdfundingResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(admin)) {
        return this.createErrorResponse('Invalid admin address format');
      }

      const tx = await this.contract.initialize({
        admin
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.emitEvent({
          type: CrowdfundingEventType.CONTRACT_INITIALIZED,
          timestamp: Date.now(),
          admin: admin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'initializeCrowdfundingContract');
    }
  }

  /**
   * Get current admin address
   */
  async getAdmin(): Promise<CrowdfundingResponse<Address>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.ADMIN);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_admin();
      const result = await tx.simulate();
      const adminAddress = result.result;

      this.setCachedData(CACHE_KEYS.ADMIN, adminAddress);
      return this.createSuccessResponse(adminAddress);
    } catch (error) {
      return this.handleError(error, 'getAdmin');
    }
  }

  /**
   * Set new admin address
   */
  async setAdmin(newAdmin: Address): Promise<CrowdfundingResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(newAdmin)) {
        return this.createErrorResponse('Invalid admin address format');
      }

      const currentAdmin = await this.getCurrentAdmin();
      if (!currentAdmin) {
        return this.createErrorResponse('Admin address not available');
      }

      const tx = await this.contract.set_admin({
        admin: currentAdmin,
        new_admin: newAdmin
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.ADMIN);
        this.emitEvent({
          type: CrowdfundingEventType.ADMIN_CHANGED,
          timestamp: Date.now(),
          admin: newAdmin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'setAdmin');
    }
  }

  /**
   * Check if contract is initialized
   */
  async isInitialized(): Promise<CrowdfundingResponse<boolean>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.INITIALIZED);
      if (cached !== null) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.is_initialized();
      const result = await tx.simulate();
      const initialized = result.result;

      this.setCachedData(CACHE_KEYS.INITIALIZED, initialized);
      return this.createSuccessResponse(initialized);
    } catch (error) {
      return this.handleError(error, 'isInitialized');
    }
  }

  // ==================== PRODUCT MANAGEMENT ====================

  /**
   * Create new crowdfunding campaign
   */
  async createProduct(request: CreateCampaignRequest): Promise<CrowdfundingResponse<CampaignId>> {
    try {
      // Validate campaign configuration
      const configValidation = validateCampaignConfig(request.config);
      if (!configValidation.isValid) {
        return this.createErrorResponse(`Campaign validation failed: ${configValidation.errors.join(', ')}`);
      }

      // Validate reward tiers
      for (const tier of request.rewardTiers) {
        const tierValidation = validateRewardTier(tier);
        if (!tierValidation.isValid) {
          return this.createErrorResponse(`Reward tier validation failed: ${tierValidation.errors.join(', ')}`);
        }
      }

      // Validate milestones
      for (const milestone of request.milestones) {
        const milestoneValidation = validateMilestone(milestone);
        if (!milestoneValidation.isValid) {
          return this.createErrorResponse(`Milestone validation failed: ${milestoneValidation.errors.join(', ')}`);
        }
      }

      const tx = await this.contract.create_campaign({
        admin: request.admin,
        config: {
          title: sanitizeString(request.config.title, VALIDATION.MAX_TITLE_LENGTH),
          description: sanitizeString(request.config.description, VALIDATION.MAX_DESCRIPTION_LENGTH),
          target_amount: request.config.targetAmount,
          deadline: request.config.deadline,
          min_contribution: request.config.minContribution,
          max_contribution: request.config.maxContribution,
          creator: request.config.creator,
          category: sanitizeString(request.config.category, VALIDATION.MAX_CATEGORY_LENGTH),
          image_url: request.config.imageUrl || '',
          external_url: request.config.externalUrl || ''
        },
        reward_tiers: request.rewardTiers.map(tier => ({
          id: tier.id,
          name: sanitizeString(tier.name, 100),
          description: sanitizeString(tier.description, VALIDATION.MAX_REWARD_DESCRIPTION_LENGTH),
          min_contribution: tier.minContribution,
          max_contribution: tier.maxContribution,
          reward: sanitizeString(tier.reward, 500),
          quantity: tier.quantity,
          is_limited: tier.isLimited,
          delivery_date: tier.deliveryDate
        })),
        milestones: request.milestones.map(milestone => ({
          id: milestone.id,
          title: sanitizeString(milestone.title, 200),
          description: sanitizeString(milestone.description, VALIDATION.MAX_MILESTONE_DESCRIPTION_LENGTH),
          target_amount: milestone.targetAmount,
          is_achieved: milestone.isAchieved,
          achieved_at: milestone.achievedAt,
          order: milestone.order
        }))
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        const campaignId = result.data as CampaignId;
        
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.CAMPAIGN_LIST());
        this.invalidateCache(CACHE_KEYS.CAMPAIGN_STATS);

        this.emitEvent({
          type: CrowdfundingEventType.CAMPAIGN_CREATED,
          timestamp: Date.now(),
          campaignId,
          admin: request.admin,
          transactionHash: result.hash
        });

        return this.createSuccessResponse(campaignId);
      }

      return this.createErrorResponse(result.error || 'Failed to create campaign');
    } catch (error) {
      return this.handleError(error, 'createProduct');
    }
  }

  /**
   * Get product details
   */
  async getProduct(campaignId: CampaignId): Promise<CrowdfundingResponse<Campaign>> {
    try {
      if (!isValidCampaignId(campaignId)) {
        return this.createErrorResponse('Invalid campaign ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.CAMPAIGN(campaignId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_campaign({ campaign_id: campaignId });
      const result = await tx.simulate();
      const contractCampaign = result.result;

      if (!contractCampaign) {
        return this.createErrorResponse('Campaign not found');
      }

      const campaign: Campaign = {
        id: contractCampaign.id,
        config: {
          title: contractCampaign.config.title,
          description: contractCampaign.config.description,
          targetAmount: contractCampaign.config.target_amount,
          deadline: contractCampaign.config.deadline,
          minContribution: contractCampaign.config.min_contribution,
          maxContribution: contractCampaign.config.max_contribution,
          creator: contractCampaign.config.creator,
          category: contractCampaign.config.category,
          imageUrl: contractCampaign.config.image_url,
          externalUrl: contractCampaign.config.external_url
        },
        status: contractCampaign.status as CampaignStatus,
        totalRaised: contractCampaign.total_raised,
        contributorCount: contractCampaign.contributor_count,
        createdAt: contractCampaign.created_at,
        updatedAt: contractCampaign.updated_at,
        isActive: isCampaignActive(contractCampaign as Campaign),
        isGoalReached: isGoalReached(contractCampaign.total_raised, contractCampaign.config.target_amount),
        completionPercentage: calculateCompletionPercentage(contractCampaign.total_raised, contractCampaign.config.target_amount)
      };

      this.setCachedData(CACHE_KEYS.CAMPAIGN(campaignId), campaign);
      return this.createSuccessResponse(campaign);
    } catch (error) {
      return this.handleError(error, 'getProduct');
    }
  }

  /**
   * Get campaign status
   */
  async getProductStatus(campaignId: CampaignId): Promise<CrowdfundingResponse<CampaignStatus>> {
    try {
      if (!isValidCampaignId(campaignId)) {
        return this.createErrorResponse('Invalid campaign ID');
      }

      const tx = await this.contract.get_campaign_status({ campaign_id: campaignId });
      const result = await tx.simulate();
      const status = result.result as CampaignStatus;

      return this.createSuccessResponse(status);
    } catch (error) {
      return this.handleError(error, 'getProductStatus');
    }
  }

  /**
   * Get reward tiers for a campaign
   */
  async getRewardTiers(campaignId: CampaignId): Promise<CrowdfundingResponse<RewardTier[]>> {
    try {
      if (!isValidCampaignId(campaignId)) {
        return this.createErrorResponse('Invalid campaign ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.REWARD_TIERS(campaignId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_reward_tiers({ campaign_id: campaignId });
      const result = await tx.simulate();
      const contractTiers = result.result;

      const rewardTiers: RewardTier[] = contractTiers.map((tier: any) => ({
        id: tier.id,
        name: tier.name,
        description: tier.description,
        minContribution: tier.min_contribution,
        maxContribution: tier.max_contribution,
        reward: tier.reward,
        quantity: tier.quantity,
        isLimited: tier.is_limited,
        deliveryDate: tier.delivery_date
      }));

      this.setCachedData(CACHE_KEYS.REWARD_TIERS(campaignId), rewardTiers);
      return this.createSuccessResponse(rewardTiers);
    } catch (error) {
      return this.handleError(error, 'getRewardTiers');
    }
  }

  /**
   * Get milestones for a campaign
   */
  async getMilestones(campaignId: CampaignId): Promise<CrowdfundingResponse<Milestone[]>> {
    try {
      if (!isValidCampaignId(campaignId)) {
        return this.createErrorResponse('Invalid campaign ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.MILESTONES(campaignId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_milestones({ campaign_id: campaignId });
      const result = await tx.simulate();
      const contractMilestones = result.result;

      const milestones: Milestone[] = contractMilestones.map((milestone: any) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        targetAmount: milestone.target_amount,
        isAchieved: milestone.is_achieved,
        achievedAt: milestone.achieved_at,
        order: milestone.order
      }));

      this.setCachedData(CACHE_KEYS.MILESTONES(campaignId), milestones);
      return this.createSuccessResponse(milestones);
    } catch (error) {
      return this.handleError(error, 'getMilestones');
    }
  }

  // ==================== FUNDING OPERATIONS ====================

  /**
   * User contribution to a campaign
   */
  async contribute(request: ContributionRequest): Promise<CrowdfundingResponse<TransactionResult>> {
    try {
      // Validate contribution request
      const validation = validateContributionRequest(request.campaignId, request.contributor, request.amount);
      if (!validation.isValid) {
        return this.createErrorResponse(validation.error!);
      }

      // Get campaign details for additional validation
      const campaignResponse = await this.getProduct(request.campaignId);
      if (!campaignResponse.success || !campaignResponse.data) {
        return this.createErrorResponse('Campaign not found');
      }

      const campaign = campaignResponse.data;
      const canContributeResult = canContribute(campaign, request.contributor, request.amount);
      if (!canContributeResult.canContribute) {
        return this.createErrorResponse(canContributeResult.reason!);
      }

      const tx = await this.contract.contribute({
        campaign_id: request.campaignId,
        contributor: request.contributor,
        amount: request.amount,
        reward_tier_id: request.rewardTierId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.CAMPAIGN(request.campaignId));
        this.invalidateCache(CACHE_KEYS.CONTRIBUTION_LIST(request.campaignId));
        this.invalidateCache(CACHE_KEYS.CAMPAIGN_STATS);

        this.emitEvent({
          type: CrowdfundingEventType.CONTRIBUTION_MADE,
          timestamp: Date.now(),
          campaignId: request.campaignId,
          contributor: request.contributor,
          amount: request.amount,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'contribute');
    }
  }

  /**
   * Admin fund distribution
   */
  async distributeFunds(request: DistributeFundsRequest): Promise<CrowdfundingResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(request.admin) || !isValidStellarAddress(request.recipient)) {
        return this.createErrorResponse('Invalid address format');
      }

      if (!isValidAmount(request.amount, 1n)) {
        return this.createErrorResponse('Invalid distribution amount');
      }

      const tx = await this.contract.distribute_funds({
        campaign_id: request.campaignId,
        admin: request.admin,
        amount: request.amount,
        recipient: request.recipient,
        reason: sanitizeString(request.reason, VALIDATION.MAX_REASON_LENGTH)
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.CAMPAIGN(request.campaignId));

        this.emitEvent({
          type: CrowdfundingEventType.FUNDS_DISTRIBUTED,
          timestamp: Date.now(),
          campaignId: request.campaignId,
          admin: request.admin,
          amount: request.amount,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'distributeFunds');
    }
  }

  /**
   * Refund contributors for failed campaigns
   */
  async refundContributors(request: RefundRequest): Promise<CrowdfundingResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(request.admin) || !isValidStellarAddress(request.contributor)) {
        return this.createErrorResponse('Invalid address format');
      }

      if (!isValidAmount(request.amount, 1n)) {
        return this.createErrorResponse('Invalid refund amount');
      }

      const tx = await this.contract.refund_contributors({
        campaign_id: request.campaignId,
        admin: request.admin,
        contributor: request.contributor,
        amount: request.amount,
        reason: sanitizeString(request.reason, VALIDATION.MAX_REASON_LENGTH)
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.CAMPAIGN(request.campaignId));
        this.invalidateCache(CACHE_KEYS.CONTRIBUTION_LIST(request.campaignId));

        this.emitEvent({
          type: CrowdfundingEventType.REFUND_PROCESSED,
          timestamp: Date.now(),
          campaignId: request.campaignId,
          admin: request.admin,
          amount: request.amount,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'refundContributors');
    }
  }

  /**
   * Get contribution history for a campaign
   */
  async getContributions(campaignId: CampaignId): Promise<CrowdfundingResponse<Contribution[]>> {
    try {
      if (!isValidCampaignId(campaignId)) {
        return this.createErrorResponse('Invalid campaign ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.CONTRIBUTION_LIST(campaignId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_contributions({ campaign_id: campaignId });
      const result = await tx.simulate();
      const contractContributions = result.result;

      const contributions: Contribution[] = contractContributions.map((contribution: any) => ({
        id: contribution.id,
        contributor: contribution.contributor,
        amount: contribution.amount,
        timestamp: contribution.timestamp,
        campaignId: contribution.campaign_id,
        rewardTierId: contribution.reward_tier_id,
        isRefunded: contribution.is_refunded
      }));

      this.setCachedData(CACHE_KEYS.CONTRIBUTION_LIST(campaignId), contributions);
      return this.createSuccessResponse(contributions);
    } catch (error) {
      return this.handleError(error, 'getContributions');
    }
  }

  // ==================== REWARD MANAGEMENT ====================

  /**
   * Claim contributor rewards
   */
  async claimReward(request: ClaimRewardRequest): Promise<CrowdfundingResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(request.contributor) || !isValidStellarAddress(request.deliveryAddress)) {
        return this.createErrorResponse('Invalid address format');
      }

      if (!isValidCampaignId(request.campaignId)) {
        return this.createErrorResponse('Invalid campaign ID');
      }

      // Get campaign and reward tier for validation
      const [campaignResponse, rewardTiersResponse] = await Promise.all([
        this.getProduct(request.campaignId),
        this.getRewardTiers(request.campaignId)
      ]);

      if (!campaignResponse.success || !rewardTiersResponse.success) {
        return this.createErrorResponse('Failed to get campaign or reward tier information');
      }

      const campaign = campaignResponse.data!;
      const rewardTiers = rewardTiersResponse.data!;
      const rewardTier = rewardTiers.find(tier => tier.id === request.rewardTierId);

      if (!rewardTier) {
        return this.createErrorResponse('Reward tier not found');
      }

      const canClaimResult = canClaimReward(campaign, request.contributor, rewardTier);
      if (!canClaimResult.canClaim) {
        return this.createErrorResponse(canClaimResult.reason!);
      }

      const tx = await this.contract.claim_reward({
        campaign_id: request.campaignId,
        contributor: request.contributor,
        reward_tier_id: request.rewardTierId,
        delivery_address: request.deliveryAddress
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.emitEvent({
          type: CrowdfundingEventType.REWARD_CLAIMED,
          timestamp: Date.now(),
          campaignId: request.campaignId,
          contributor: request.contributor,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'claimReward');
    }
  }

  /**
   * Update campaign milestone
   */
  async updateMilestone(request: UpdateMilestoneRequest): Promise<CrowdfundingResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(request.admin)) {
        return this.createErrorResponse('Invalid admin address format');
      }

      if (!isValidCampaignId(request.campaignId)) {
        return this.createErrorResponse('Invalid campaign ID');
      }

      const tx = await this.contract.update_milestone({
        campaign_id: request.campaignId,
        milestone_id: request.milestoneId,
        admin: request.admin,
        is_achieved: request.isAchieved,
        achieved_at: request.achievedAt
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.MILESTONES(request.campaignId));

        this.emitEvent({
          type: CrowdfundingEventType.MILESTONE_ACHIEVED,
          timestamp: Date.now(),
          campaignId: request.campaignId,
          admin: request.admin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'updateMilestone');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get current admin address (helper method)
   */
  private async getCurrentAdmin(): Promise<Address | null> {
    const adminResponse = await this.getAdmin();
    return adminResponse.success ? adminResponse.data : null;
  }

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
    eventTypes: CrowdfundingEventType[],
    listener: CrowdfundingEventListener,
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
  private emitEvent(event: CrowdfundingEventData): void {
    for (const subscription of this.eventListeners.values()) {
      if (!subscription.active) continue;
      
      if (subscription.eventTypes.includes(event.type)) {
        // Apply filters
        if (subscription.options?.campaignId && event.campaignId !== subscription.options.campaignId) {
          continue;
        }
        
        if (subscription.options?.contributor && event.contributor !== subscription.options.contributor) {
          continue;
        }
        
        if (subscription.options?.admin && event.admin !== subscription.options.admin) {
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
  private handleError(error: any, operation: string): CrowdfundingResponse<any> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = getErrorType(errorMessage);
    
    this.emitEvent({
      type: CrowdfundingEventType.ERROR,
      timestamp: Date.now(),
      error: errorMessage,
      operation
    });
    
    return this.createErrorResponse(errorMessage, errorType);
  }

  /**
   * Create success response
   */
  private createSuccessResponse<T>(data: T): CrowdfundingResponse<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: string, errorCode?: string): CrowdfundingResponse<any> {
    return {
      success: false,
      error,
      errorCode: errorCode ? CROWDFUNDING_ERROR_CODES[errorCode as keyof typeof CROWDFUNDING_ERROR_CODES] : undefined
    };
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
      await this.isInitialized();
      contractConnected = true;
    } catch (error) {
      errors.push(`Contract connection failed: ${error}`);
    }

    try {
      // Check network connection
      await this.getAdmin();
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
