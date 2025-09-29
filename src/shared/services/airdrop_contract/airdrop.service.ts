import { Client as ContractClient } from '@stellar/stellar-sdk/contract';
import { 
  Client as AirdropContractClient,
  networks,
  AirdropError,
  ProviderError,
  type AirdropEvent as ContractAirdropEvent,
  type EventStats as ContractEventStats,
  type u64,
  type i128,
  type Map,
  type Option
} from '../../../../packages/airdrop-contract/src/index';
import { 
  signTransaction, 
  getPublicKey, 
  isWalletConnected 
} from '../../utils/wallet';
import { 
  NETWORKS, 
  DEFAULT_CONFIG, 
  ERROR_MESSAGES, 
  PROVIDER_ERROR_MESSAGES,
  CACHE_KEYS,
  VALIDATION
} from './constants/airdrop.constants';
import {
  formatTokenAmount,
  parseTokenAmount,
  validateEventConfig,
  isEventActive,
  getTimeUntilExpiry,
  formatDuration,
  calculateEligibility,
  bufferToString,
  stringToBuffer,
  createMapFromObject,
  mapToObject,
  retryWithBackoff,
  isValidStellarAddress,
  isValidContractAddress,
  getErrorType
} from './utils/airdrop.utils';
import type {
  AirdropServiceConfig,
  NetworkConfig,
  AirdropResponse,
  TransactionResult,
  AirdropEventConfig,
  AirdropEvent,
  EventStats,
  ProviderRegistry,
  EligibilityConditions,
  ClaimStatus,
  BatchDistributionParams,
  EventMonitoringConfig,
  CacheConfig,
  RetryConfig,
  EventFilter,
  TokenInfo
} from './types/airdrop.types';
import type {
  AirdropEventData,
  AirdropEventListener,
  EventListenerOptions,
  EventSubscription,
  AirdropEventType
} from './types/events.types';

/**
 * Comprehensive TypeScript service layer for Airdrop Contract interactions
 */
export class AirdropService {
  private contract: AirdropContractClient;
  private networkConfig: NetworkConfig;
  private config: AirdropServiceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private eventListeners: Map<string, EventSubscription> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor(config?: Partial<AirdropServiceConfig>) {
    this.config = {
      network: NETWORKS.testnet,
      timeoutInSeconds: DEFAULT_CONFIG.TIMEOUT_SECONDS,
      fee: DEFAULT_CONFIG.FEE,
      simulate: DEFAULT_CONFIG.SIMULATE,
      retryConfig: DEFAULT_CONFIG.RETRY,
      ...config
    };
    
    this.networkConfig = this.config.network;
    this.contract = new AirdropContractClient({
      contractId: this.networkConfig.contractId,
      networkPassphrase: this.networkConfig.networkPassphrase,
      rpcUrl: this.networkConfig.rpcUrl,
    });
  }

  /**
   * Initialize the service with configuration
   */
  async initialize(config?: Partial<AirdropServiceConfig>): Promise<void> {
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
   * Initialize the airdrop contract
   */
  async initializeAirdropContract(
    admin: string,
    initialProviders?: Map<string, string>
  ): Promise<AirdropResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(admin)) {
        return this.createErrorResponse('Invalid admin address format');
      }

      const tx = await this.contract.initialize({
        admin,
        initial_providers: initialProviders || null
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.emitEvent({
          type: AirdropEventType.CONTRACT_INITIALIZED,
          timestamp: Date.now(),
          adminAddress: admin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'initializeAirdropContract');
    }
  }

  /**
   * Get current admin address
   */
  async getAdmin(): Promise<AirdropResponse<string>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.ADMIN);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.is_admin({
        address: '' // This will be handled by the contract
      });

      // For read operations, we need to simulate
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
  async setAdmin(currentAdmin: string, newAdmin: string): Promise<AirdropResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(currentAdmin) || !isValidStellarAddress(newAdmin)) {
        return this.createErrorResponse('Invalid admin address format');
      }

      const tx = await this.contract.set_admin({
        current_admin: currentAdmin,
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
          type: AirdropEventType.ADMIN_CHANGED,
          timestamp: Date.now(),
          oldAdminAddress: currentAdmin,
          newAdminAddress: newAdmin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'setAdmin');
    }
  }

  /**
   * Check if address is admin
   */
  async isAdmin(address: string): Promise<AirdropResponse<boolean>> {
    try {
      if (!isValidStellarAddress(address)) {
        return this.createErrorResponse('Invalid address format');
      }

      const tx = await this.contract.is_admin({ address });
      const result = await tx.simulate();
      
      return this.createSuccessResponse(result.result);
    } catch (error) {
      return this.handleError(error, 'isAdmin');
    }
  }

  // ==================== PROVIDER REGISTRY MANAGEMENT ====================

  /**
   * Register a metric provider
   */
  async registerProvider(
    metric: string,
    provider: string
  ): Promise<AirdropResponse<TransactionResult>> {
    try {
      if (!isValidContractAddress(provider)) {
        return this.createErrorResponse('Invalid provider address format');
      }

      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const tx = await this.contract.register_provider({
        admin: adminAddress,
        metric,
        provider
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.PROVIDER(metric));
        this.emitEvent({
          type: AirdropEventType.PROVIDER_REGISTERED,
          timestamp: Date.now(),
          metric,
          providerAddress: provider,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'registerProvider');
    }
  }

  /**
   * Update a metric provider
   */
  async updateProvider(
    metric: string,
    newProvider: string
  ): Promise<AirdropResponse<TransactionResult>> {
    try {
      if (!isValidContractAddress(newProvider)) {
        return this.createErrorResponse('Invalid provider address format');
      }

      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const oldProvider = await this.getProvider(metric);
      if (!oldProvider.success) {
        return this.createErrorResponse('Provider not found');
      }

      const tx = await this.contract.update_provider({
        admin: adminAddress,
        metric,
        new_provider: newProvider
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.PROVIDER(metric));
        this.emitEvent({
          type: AirdropEventType.PROVIDER_UPDATED,
          timestamp: Date.now(),
          metric,
          oldProviderAddress: oldProvider.data,
          newProviderAddress: newProvider,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'updateProvider');
    }
  }

  /**
   * Remove a metric provider
   */
  async removeProvider(metric: string): Promise<AirdropResponse<TransactionResult>> {
    try {
      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const provider = await this.getProvider(metric);
      if (!provider.success) {
        return this.createErrorResponse('Provider not found');
      }

      const tx = await this.contract.remove_provider({
        admin: adminAddress,
        metric
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.PROVIDER(metric));
        this.emitEvent({
          type: AirdropEventType.PROVIDER_REMOVED,
          timestamp: Date.now(),
          metric,
          providerAddress: provider.data,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'removeProvider');
    }
  }

  /**
   * Get provider address for a metric
   */
  async getProvider(metric: string): Promise<AirdropResponse<string>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.PROVIDER(metric));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_provider({ metric });
      const result = await tx.simulate();
      
      const providerAddress = result.result;
      this.setCachedData(CACHE_KEYS.PROVIDER(metric), providerAddress);
      
      return this.createSuccessResponse(providerAddress);
    } catch (error) {
      return this.handleError(error, 'getProvider');
    }
  }

  // ==================== AIRDROP EVENT MANAGEMENT ====================

  /**
   * Create a new airdrop event
   */
  async createAirdropEvent(config: AirdropEventConfig): Promise<AirdropResponse<u64>> {
    try {
      // Validate configuration
      const validation = validateEventConfig(config);
      if (!validation.isValid) {
        return this.createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const tx = await this.contract.create_airdrop({
        admin: adminAddress,
        name: config.name,
        description: stringToBuffer(config.description),
        conditions: config.conditions,
        amount: config.amount,
        token_address: config.tokenAddress,
        start_time: config.startTime,
        end_time: config.endTime,
        max_users: config.maxUsers || null,
        max_total_amount: config.maxTotalAmount || null
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        const eventId = result.data as u64;
        this.emitEvent({
          type: AirdropEventType.EVENT_CREATED,
          timestamp: Date.now(),
          eventId,
          eventName: config.name,
          tokenAddress: config.tokenAddress,
          amount: config.amount,
          startTime: config.startTime,
          endTime: config.endTime,
          transactionHash: result.hash
        });
        
        return this.createSuccessResponse(eventId);
      }

      return this.createErrorResponse(result.error || 'Failed to create airdrop event');
    } catch (error) {
      return this.handleError(error, 'createAirdropEvent');
    }
  }

  /**
   * Get airdrop event details
   */
  async getEvent(eventId: u64): Promise<AirdropResponse<AirdropEvent>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.EVENT(eventId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_event({ event_id: eventId });
      const result = await tx.simulate();
      
      const event = this.convertContractEvent(result.result);
      this.setCachedData(CACHE_KEYS.EVENT(eventId), event);
      
      return this.createSuccessResponse(event);
    } catch (error) {
      return this.handleError(error, 'getEvent');
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: u64): Promise<AirdropResponse<EventStats>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.EVENT_STATS(eventId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_event_stats({ event_id: eventId });
      const result = await tx.simulate();
      
      const stats = this.convertContractEventStats(result.result);
      this.setCachedData(CACHE_KEYS.EVENT_STATS(eventId), stats);
      
      return this.createSuccessResponse(stats);
    } catch (error) {
      return this.handleError(error, 'getEventStats');
    }
  }

  /**
   * Pause an airdrop event
   */
  async pauseEvent(eventId: u64): Promise<AirdropResponse<TransactionResult>> {
    try {
      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const tx = await this.contract.pause_event({
        admin: adminAddress,
        event_id: eventId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.EVENT(eventId));
        this.emitEvent({
          type: AirdropEventType.EVENT_PAUSED,
          timestamp: Date.now(),
          eventId,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'pauseEvent');
    }
  }

  /**
   * Resume a paused airdrop event
   */
  async resumeEvent(eventId: u64): Promise<AirdropResponse<TransactionResult>> {
    try {
      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const tx = await this.contract.resume_event({
        admin: adminAddress,
        event_id: eventId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.EVENT(eventId));
        this.emitEvent({
          type: AirdropEventType.EVENT_RESUMED,
          timestamp: Date.now(),
          eventId,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'resumeEvent');
    }
  }

  /**
   * Finalize an airdrop event
   */
  async finalizeEvent(eventId: u64): Promise<AirdropResponse<TransactionResult>> {
    try {
      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const tx = await this.contract.finalize_event({
        admin: adminAddress,
        event_id: eventId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.EVENT(eventId));
        this.invalidateCache(CACHE_KEYS.EVENT_STATS(eventId));
        
        // Get final stats
        const statsResponse = await this.getEventStats(eventId);
        if (statsResponse.success) {
          this.emitEvent({
            type: AirdropEventType.EVENT_FINALIZED,
            timestamp: Date.now(),
            eventId,
            totalDistributed: statsResponse.data!.totalAmountDistributed,
            recipientCount: statsResponse.data!.recipientCount,
            transactionHash: result.hash
          });
        }
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'finalizeEvent');
    }
  }

  /**
   * List claimed users for an event
   */
  async listClaimedUsers(
    eventId: u64,
    maxResults: number = 100
  ): Promise<AirdropResponse<string[]>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.CLAIMED_USERS(eventId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.list_claimed_users({
        event_id: eventId,
        max_results: maxResults as u32
      });
      const result = await tx.simulate();
      
      const users = result.result;
      this.setCachedData(CACHE_KEYS.CLAIMED_USERS(eventId), users);
      
      return this.createSuccessResponse(users);
    } catch (error) {
      return this.handleError(error, 'listClaimedUsers');
    }
  }

  // ==================== USER CLAIM MANAGEMENT ====================

  /**
   * User claims tokens for an airdrop event
   */
  async claimAirdrop(eventId: u64): Promise<AirdropResponse<TransactionResult>> {
    try {
      const userAddress = await getPublicKey();
      if (!userAddress) {
        return this.createErrorResponse('User wallet not connected');
      }

      // Check eligibility first
      const eligibility = await this.checkEligibility(eventId, userAddress);
      if (!eligibility.success || !eligibility.data?.isEligible) {
        return this.createErrorResponse(
          eligibility.data?.ineligibilityReason || 'User not eligible for this airdrop'
        );
      }

      // Check if already claimed
      const claimedUsers = await this.listClaimedUsers(eventId);
      if (claimedUsers.success && claimedUsers.data?.includes(userAddress)) {
        return this.createErrorResponse('User has already claimed this airdrop');
      }

      this.emitEvent({
        type: AirdropEventType.CLAIM_SUBMITTED,
        timestamp: Date.now(),
        eventId,
        userAddress,
        claimAmount: eligibility.data.claimAmount!
      });

      const tx = await this.contract.claim_airdrop({
        user: userAddress,
        event_id: eventId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.CLAIMED_USERS(eventId));
        this.invalidateCache(CACHE_KEYS.EVENT_STATS(eventId));
        this.invalidateCache(CACHE_KEYS.ELIGIBILITY(eventId, userAddress));
        
        this.emitEvent({
          type: AirdropEventType.CLAIM_SUCCESSFUL,
          timestamp: Date.now(),
          eventId,
          userAddress,
          claimAmount: eligibility.data.claimAmount!,
          transactionHash: result.hash
        });
      } else {
        this.emitEvent({
          type: AirdropEventType.CLAIM_FAILED,
          timestamp: Date.now(),
          eventId,
          userAddress,
          error: result.error || 'Unknown error'
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      const userAddress = await getPublicKey();
      if (userAddress) {
        this.emitEvent({
          type: AirdropEventType.CLAIM_FAILED,
          timestamp: Date.now(),
          eventId,
          userAddress,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      return this.handleError(error, 'claimAirdrop');
    }
  }

  /**
   * Check if user is eligible for an airdrop event
   */
  async checkEligibility(eventId: u64, user: string): Promise<AirdropResponse<ClaimStatus>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.ELIGIBILITY(eventId, user));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      // Get event details
      const eventResponse = await this.getEvent(eventId);
      if (!eventResponse.success || !eventResponse.data) {
        return this.createErrorResponse('Event not found');
      }

      const event = eventResponse.data;

      // Check if event is active
      if (!isEventActive(event)) {
        return this.createSuccessResponse({
          hasClaimed: false,
          isEligible: false,
          ineligibilityReason: 'Event is not active',
          claimAmount: event.amount
        });
      }

      // Check if already claimed
      const claimedUsers = await this.listClaimedUsers(eventId);
      const hasClaimed = claimedUsers.success && claimedUsers.data?.includes(user) || false;

      if (hasClaimed) {
        return this.createSuccessResponse({
          hasClaimed: true,
          isEligible: false,
          ineligibilityReason: 'Already claimed',
          claimAmount: event.amount
        });
      }

      // Get provider registry
      const providerRegistry = await this.getProviderRegistry();
      if (!providerRegistry.success) {
        return this.createErrorResponse('Failed to get provider registry');
      }

      // Calculate eligibility
      const eligibility = await calculateEligibility(
        user,
        mapToObject(event.conditions),
        createMapFromObject(providerRegistry.data!)
      );

      const claimStatus: ClaimStatus = {
        hasClaimed,
        isEligible: eligibility.isEligible,
        ineligibilityReason: eligibility.reason,
        claimAmount: event.amount
      };

      this.setCachedData(CACHE_KEYS.ELIGIBILITY(eventId, user), claimStatus);
      return this.createSuccessResponse(claimStatus);
    } catch (error) {
      return this.handleError(error, 'checkEligibility');
    }
  }

  /**
   * Admin batch distribution
   */
  async distributeBatch(params: BatchDistributionParams): Promise<AirdropResponse<TransactionResult>> {
    try {
      if (params.users.length === 0) {
        return this.createErrorResponse('No users provided for batch distribution');
      }

      if (params.users.length > VALIDATION.MAX_BATCH_SIZE) {
        return this.createErrorResponse(`Batch size exceeds maximum of ${VALIDATION.MAX_BATCH_SIZE}`);
      }

      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      // Get event details for amount calculation
      const eventResponse = await this.getEvent(params.eventId);
      if (!eventResponse.success || !eventResponse.data) {
        return this.createErrorResponse('Event not found');
      }

      const totalAmount = eventResponse.data.amount * BigInt(params.users.length);

      this.emitEvent({
        type: AirdropEventType.BATCH_DISTRIBUTION_STARTED,
        timestamp: Date.now(),
        eventId: params.eventId,
        userCount: params.users.length,
        totalAmount
      });

      const tx = await this.contract.distribute_batch({
        admin: adminAddress,
        event_id: params.eventId,
        users: params.users
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.CLAIMED_USERS(params.eventId));
        this.invalidateCache(CACHE_KEYS.EVENT_STATS(params.eventId));
        
        // Get updated stats
        const statsResponse = await this.getEventStats(params.eventId);
        if (statsResponse.success) {
          this.emitEvent({
            type: AirdropEventType.BATCH_DISTRIBUTION_COMPLETED,
            timestamp: Date.now(),
            eventId: params.eventId,
            successfulClaims: params.users.length,
            failedClaims: 0,
            totalDistributed: statsResponse.data!.totalAmountDistributed,
            transactionHash: result.hash
          });
        }
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'distributeBatch');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get provider registry
   */
  private async getProviderRegistry(): Promise<AirdropResponse<ProviderRegistry>> {
    // This would need to be implemented based on the contract's storage structure
    // For now, return an empty registry
    return this.createSuccessResponse({});
  }

  /**
   * Get current admin address (helper method)
   */
  private async getCurrentAdmin(): Promise<string | null> {
    const adminResponse = await this.getAdmin();
    return adminResponse.success ? adminResponse.data : null;
  }

  /**
   * Sign and send transaction
   */
  private async signAndSendTransaction(tx: any): Promise<TransactionResult> {
    try {
      const xdr = tx.toXDR();
      const signedXdr = await signTransaction(xdr, this.networkConfig.isTestnet ? 'TESTNET' : 'MAINNET');
      
      const result = await tx.signAndSend(signedXdr);
      
      return {
        hash: result.hash,
        success: true,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Convert contract event to service event
   */
  private convertContractEvent(contractEvent: ContractAirdropEvent): AirdropEvent {
    return {
      amount: contractEvent.amount,
      conditions: contractEvent.conditions,
      description: contractEvent.description,
      endTime: contractEvent.end_time,
      isActive: contractEvent.is_active,
      maxTotalAmount: contractEvent.max_total_amount,
      maxUsers: contractEvent.max_users,
      name: contractEvent.name,
      startTime: contractEvent.start_time,
      tokenAddress: contractEvent.token_address
    };
  }

  /**
   * Convert contract event stats to service event stats
   */
  private convertContractEventStats(contractStats: ContractEventStats): EventStats {
    return {
      recipientCount: contractStats.recipient_count,
      totalAmountDistributed: contractStats.total_amount_distributed
    };
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
    eventTypes: AirdropEventType[],
    listener: AirdropEventListener,
    options?: EventListenerOptions
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
  private emitEvent(event: AirdropEventData): void {
    for (const subscription of this.eventListeners.values()) {
      if (!subscription.active) continue;
      
      if (subscription.eventTypes.includes(event.type)) {
        // Apply filters
        if (subscription.options.eventId && event.eventId !== subscription.options.eventId) {
          continue;
        }
        
        if (subscription.options.userAddress && event.userAddress !== subscription.options.userAddress) {
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
  private handleError(error: any, operation: string): AirdropResponse<any> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = getErrorType(errorMessage);
    
    this.emitEvent({
      type: AirdropEventType.ERROR,
      timestamp: Date.now(),
      error: errorMessage,
      operation
    });
    
    return this.createErrorResponse(errorMessage, errorType);
  }

  /**
   * Create success response
   */
  private createSuccessResponse<T>(data: T): AirdropResponse<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: string, errorCode?: number): AirdropResponse<any> {
    return {
      success: false,
      error,
      errorCode
    };
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.eventListeners.clear();
    this.cache.clear();
    this.isInitialized = false;
  }
}
