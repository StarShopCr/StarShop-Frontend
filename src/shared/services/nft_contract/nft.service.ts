import { Client as ContractClient } from '@stellar/stellar-sdk/contract';
import { 
  Client as NFTContractClient,
  networks,
  type NFTMetadata as ContractNFTMetadata,
  type NFTDetail as ContractNFTDetail
} from '../../../../packages/nft_contract/src/index';
import type { u32 } from './types/nft.types';
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
  NFT_ERROR_CODES
} from './constants/nft.constants';
import {
  formatTokenId,
  validateNFTMetadata,
  parseMetadata,
  calculateSupplyInfo,
  isSupplyExhausted,
  getRemainingSupplyPercentage,
  retryWithBackoff,
  getErrorType,
  isValidStellarAddress,
  isValidTokenId,
  validateOwnership,
  sanitizeMetadataString
} from './utils/nft.utils';
import type {
  NFTServiceConfig,
  NetworkConfig,
  NFTResponse,
  TransactionResult,
  NFTMetadata,
  NFTDetail,
  MintRequest,
  MetadataUpdateRequest,
  TransferRequest,
  BurnRequest,
  SupplyInfo,
  AdminInfo,
  OwnershipInfo,
  SupplyValidation,
  MetadataValidation,
  OwnershipValidation,
  BatchOperationResult,
  NFTFilter,
  NFTSearchResult,
  HealthCheck,
  PerformanceMetrics,
  TokenId,
  Address,
  NFTEventType,
  NFTEventData,
  NFTEventListener,
  EventSubscription,
  EventListenerOptions
} from './types/nft.types';

/**
 * Comprehensive TypeScript service layer for NFT Contract interactions
 */
export class NFTService {
  private contract: NFTContractClient;
  private networkConfig: NetworkConfig;
  private config: NFTServiceConfig;
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

  constructor(config?: Partial<NFTServiceConfig>) {
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
    this.contract = new NFTContractClient({
      contractId: this.networkConfig.contractId,
      networkPassphrase: this.networkConfig.networkPassphrase,
      rpcUrl: this.networkConfig.rpcUrl,
    });
  }

  /**
   * Initialize the service with configuration
   */
  async initialize(config?: Partial<NFTServiceConfig>): Promise<void> {
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
   * Initialize the NFT contract
   */
  async initializeNFTContract(admin: Address): Promise<NFTResponse<TransactionResult>> {
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
          type: NFTEventType.CONTRACT_INITIALIZED,
          timestamp: Date.now(),
          admin: admin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'initializeNFTContract');
    }
  }

  /**
   * Get current admin address
   */
  async getAdmin(): Promise<NFTResponse<Address>> {
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
   * Verify admin permissions
   */
  async verifyAdmin(caller: Address): Promise<NFTResponse<boolean>> {
    try {
      if (!isValidStellarAddress(caller)) {
        return this.createErrorResponse('Invalid caller address format');
      }

      const tx = await this.contract.verify_admin({ caller });
      const result = await tx.simulate();
      
      return this.createSuccessResponse(result.result);
    } catch (error) {
      return this.handleError(error, 'verifyAdmin');
    }
  }

  /**
   * Check if contract is initialized
   */
  async isInitialized(): Promise<NFTResponse<boolean>> {
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

  // ==================== SUPPLY MANAGEMENT ====================

  /**
   * Set maximum NFT supply
   */
  async setMaxSupply(maxSupply: u32): Promise<NFTResponse<TransactionResult>> {
    try {
      if (maxSupply < VALIDATION.MIN_SUPPLY || maxSupply > VALIDATION.MAX_SUPPLY) {
        return this.createErrorResponse('Invalid supply range');
      }

      const adminAddress = await this.getCurrentAdmin();
      if (!adminAddress) {
        return this.createErrorResponse('Admin address not available');
      }

      const tx = await this.contract.set_max_supply({
        admin: adminAddress,
        max_supply: maxSupply
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.SUPPLY_INFO);
        this.emitEvent({
          type: NFTEventType.SUPPLY_CHANGED,
          timestamp: Date.now(),
          admin: adminAddress,
          supplyInfo: await this.getSupplyInfo(),
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'setMaxSupply');
    }
  }

  /**
   * Get maximum supply
   */
  async getMaxSupply(): Promise<NFTResponse<u32>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.SUPPLY_INFO);
      if (cached?.maxSupply !== undefined) {
        return this.createSuccessResponse(cached.maxSupply);
      }

      const tx = await this.contract.get_max_supply();
      const result = await tx.simulate();
      
      const maxSupply = result.result;
      this.updateSupplyCache({ maxSupply });
      
      return this.createSuccessResponse(maxSupply);
    } catch (error) {
      return this.handleError(error, 'getMaxSupply');
    }
  }

  /**
   * Get current minted supply
   */
  async getCurrentSupply(): Promise<NFTResponse<u32>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.SUPPLY_INFO);
      if (cached?.currentSupply !== undefined) {
        return this.createSuccessResponse(cached.currentSupply);
      }

      const tx = await this.contract.get_current_supply();
      const result = await tx.simulate();
      
      const currentSupply = result.result;
      this.updateSupplyCache({ currentSupply });
      
      return this.createSuccessResponse(currentSupply);
    } catch (error) {
      return this.handleError(error, 'getCurrentSupply');
    }
  }

  /**
   * Get remaining supply
   */
  async getRemainingSupply(): Promise<NFTResponse<u32>> {
    try {
      const supplyInfo = await this.getSupplyInfo();
      if (!supplyInfo.success) {
        return this.createErrorResponse('Failed to get supply info');
      }

      const remainingSupply = supplyInfo.data!.remainingSupply;
      return this.createSuccessResponse(remainingSupply);
    } catch (error) {
      return this.handleError(error, 'getRemainingSupply');
    }
  }

  /**
   * Get complete supply information
   */
  async getSupplyInfo(): Promise<NFTResponse<SupplyInfo>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.SUPPLY_INFO);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const [maxSupplyResponse, currentSupplyResponse] = await Promise.all([
        this.getMaxSupply(),
        this.getCurrentSupply()
      ]);

      if (!maxSupplyResponse.success || !currentSupplyResponse.success) {
        return this.createErrorResponse('Failed to get supply information');
      }

      const supplyInfo = calculateSupplyInfo(
        maxSupplyResponse.data!,
        currentSupplyResponse.data!
      );

      this.setCachedData(CACHE_KEYS.SUPPLY_INFO, supplyInfo);
      return this.createSuccessResponse(supplyInfo);
    } catch (error) {
      return this.handleError(error, 'getSupplyInfo');
    }
  }

  // ==================== NFT MINTING & CREATION ====================

  /**
   * Mint new NFT
   */
  async mintNFT(request: MintRequest): Promise<NFTResponse<TokenId>> {
    try {
      // Validate input
      if (!isValidStellarAddress(request.to)) {
        return this.createErrorResponse('Invalid recipient address');
      }

      const metadataValidation = validateNFTMetadata({
        name: request.name,
        description: request.description,
        attributes: request.attributes
      });

      if (!metadataValidation.isValid) {
        return this.createErrorResponse(`Metadata validation failed: ${metadataValidation.errors.join(', ')}`);
      }

      // Check supply
      const supplyValidation = await this.validateSupply();
      if (!supplyValidation.isValid) {
        return this.createErrorResponse(supplyValidation.error!);
      }

      const tx = await this.contract.mint_nft({
        to: request.to,
        name: sanitizeMetadataString(request.name),
        description: sanitizeMetadataString(request.description),
        attributes: request.attributes
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        const tokenId = result.data as TokenId;
        
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.SUPPLY_INFO);
        this.invalidateCache(CACHE_KEYS.NFT_LIST());
        this.invalidateCache(CACHE_KEYS.NFT_LIST(request.to));

        this.emitEvent({
          type: NFTEventType.NFT_MINTED,
          timestamp: Date.now(),
          tokenId,
          owner: request.to,
          metadata: {
            name: request.name,
            description: request.description,
            attributes: request.attributes
          },
          transactionHash: result.hash
        });

        return this.createSuccessResponse(tokenId);
      }

      return this.createErrorResponse(result.error || 'Failed to mint NFT');
    } catch (error) {
      return this.handleError(error, 'mintNFT');
    }
  }

  /**
   * Validate metadata before minting
   */
  async validateMetadata(
    name: string, 
    description: string, 
    attributes: string[]
  ): Promise<NFTResponse<boolean>> {
    try {
      const tx = await this.contract.validate_metadata({
        name: sanitizeMetadataString(name),
        description: sanitizeMetadataString(description),
        attributes
      });
      
      const result = await tx.simulate();
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error, 'validateMetadata');
    }
  }

  // ==================== NFT OWNERSHIP & TRANSFERS ====================

  /**
   * Get NFT owner
   */
  async getOwner(tokenId: TokenId): Promise<NFTResponse<Address>> {
    try {
      if (!isValidTokenId(tokenId)) {
        return this.createErrorResponse('Invalid token ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.OWNER(tokenId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_owner({ token_id: tokenId });
      const result = await tx.simulate();
      const owner = result.result;

      this.setCachedData(CACHE_KEYS.OWNER(tokenId), owner);
      return this.createSuccessResponse(owner);
    } catch (error) {
      return this.handleError(error, 'getOwner');
    }
  }

  /**
   * Check if NFT exists
   */
  async nftExists(tokenId: TokenId): Promise<NFTResponse<boolean>> {
    try {
      if (!isValidTokenId(tokenId)) {
        return this.createErrorResponse('Invalid token ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.EXISTS(tokenId));
      if (cached !== null) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.nft_exists({ token_id: tokenId });
      const result = await tx.simulate();
      const exists = result.result;

      this.setCachedData(CACHE_KEYS.EXISTS(tokenId), exists);
      return this.createSuccessResponse(exists);
    } catch (error) {
      return this.handleError(error, 'nftExists');
    }
  }

  /**
   * Transfer NFT between addresses
   */
  async transferNFT(request: TransferRequest): Promise<NFTResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(request.from) || !isValidStellarAddress(request.to)) {
        return this.createErrorResponse('Invalid address format');
      }

      if (!isValidTokenId(request.tokenId)) {
        return this.createErrorResponse('Invalid token ID');
      }

      // Check ownership
      const ownershipValidation = await this.validateOwnership(request.tokenId, request.from);
      if (!ownershipValidation.isValid) {
        return this.createErrorResponse(ownershipValidation.error!);
      }

      const tx = await this.contract.transfer_nft({
        from: request.from,
        to: request.to,
        token_id: request.tokenId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.OWNER(request.tokenId));
        this.invalidateCache(CACHE_KEYS.NFT_LIST(request.from));
        this.invalidateCache(CACHE_KEYS.NFT_LIST(request.to));

        this.emitEvent({
          type: NFTEventType.NFT_TRANSFERRED,
          timestamp: Date.now(),
          tokenId: request.tokenId,
          from: request.from,
          to: request.to,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'transferNFT');
    }
  }

  /**
   * Burn/destroy NFT
   */
  async burnNFT(request: BurnRequest): Promise<NFTResponse<TransactionResult>> {
    try {
      if (!isValidStellarAddress(request.owner)) {
        return this.createErrorResponse('Invalid owner address');
      }

      if (!isValidTokenId(request.tokenId)) {
        return this.createErrorResponse('Invalid token ID');
      }

      // Check ownership
      const ownershipValidation = await this.validateOwnership(request.tokenId, request.owner);
      if (!ownershipValidation.isValid) {
        return this.createErrorResponse(ownershipValidation.error!);
      }

      const tx = await this.contract.burn_nft({
        owner: request.owner,
        token_id: request.tokenId
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate caches
        this.invalidateCache(CACHE_KEYS.OWNER(request.tokenId));
        this.invalidateCache(CACHE_KEYS.EXISTS(request.tokenId));
        this.invalidateCache(CACHE_KEYS.METADATA(request.tokenId));
        this.invalidateCache(CACHE_KEYS.NFT_LIST(request.owner));
        this.invalidateCache(CACHE_KEYS.SUPPLY_INFO);

        this.emitEvent({
          type: NFTEventType.NFT_BURNED,
          timestamp: Date.now(),
          tokenId: request.tokenId,
          owner: request.owner,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'burnNFT');
    }
  }

  // ==================== METADATA & ATTRIBUTES MANAGEMENT ====================

  /**
   * Get NFT metadata
   */
  async getMetadata(tokenId: TokenId): Promise<NFTResponse<NFTMetadata>> {
    try {
      if (!isValidTokenId(tokenId)) {
        return this.createErrorResponse('Invalid token ID');
      }

      const cached = this.getCachedData(CACHE_KEYS.METADATA(tokenId));
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_metadata({ token_id: tokenId });
      const result = await tx.simulate();
      const contractMetadata = result.result;

      const metadata: NFTMetadata = {
        name: contractMetadata.name,
        description: contractMetadata.description,
        attributes: contractMetadata.attributes
      };

      this.setCachedData(CACHE_KEYS.METADATA(tokenId), metadata);
      return this.createSuccessResponse(metadata);
    } catch (error) {
      return this.handleError(error, 'getMetadata');
    }
  }

  /**
   * Update NFT metadata
   */
  async updateMetadata(request: MetadataUpdateRequest): Promise<NFTResponse<TransactionResult>> {
    try {
      if (!isValidTokenId(request.tokenId)) {
        return this.createErrorResponse('Invalid token ID');
      }

      if (!isValidStellarAddress(request.admin)) {
        return this.createErrorResponse('Invalid admin address');
      }

      const metadataValidation = validateNFTMetadata({
        name: request.name,
        description: request.description,
        attributes: request.attributes
      });

      if (!metadataValidation.isValid) {
        return this.createErrorResponse(`Metadata validation failed: ${metadataValidation.errors.join(', ')}`);
      }

      const tx = await this.contract.update_metadata({
        admin: request.admin,
        token_id: request.tokenId,
        name: sanitizeMetadataString(request.name),
        description: sanitizeMetadataString(request.description),
        attributes: request.attributes
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.invalidateCache(CACHE_KEYS.METADATA(request.tokenId));

        this.emitEvent({
          type: NFTEventType.METADATA_UPDATED,
          timestamp: Date.now(),
          tokenId: request.tokenId,
          admin: request.admin,
          metadata: {
            name: request.name,
            description: request.description,
            attributes: request.attributes
          },
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'updateMetadata');
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate supply before minting
   */
  private async validateSupply(): Promise<SupplyValidation> {
    try {
      const supplyInfoResponse = await this.getSupplyInfo();
      if (!supplyInfoResponse.success) {
        return {
          isValid: false,
          error: 'Failed to get supply information'
        };
      }

      const supplyInfo = supplyInfoResponse.data!;
      
      if (isSupplyExhausted(supplyInfo.maxSupply, supplyInfo.currentSupply)) {
        return {
          isValid: false,
          error: 'Maximum supply exceeded'
        };
      }

      return {
        isValid: true,
        supplyInfo
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Supply validation failed: ${error}`
      };
    }
  }

  /**
   * Validate ownership before operations
   */
  private async validateOwnership(tokenId: TokenId, expectedOwner: Address): Promise<OwnershipValidation> {
    try {
      const ownerResponse = await this.getOwner(tokenId);
      if (!ownerResponse.success) {
        return {
          isValid: false,
          error: 'Failed to get NFT owner'
        };
      }

      const owner = ownerResponse.data!;
      const existsResponse = await this.nftExists(tokenId);
      if (!existsResponse.success || !existsResponse.data) {
        return {
          isValid: false,
          error: 'NFT does not exist'
        };
      }

      if (owner.toLowerCase() !== expectedOwner.toLowerCase()) {
        return {
          isValid: false,
          error: 'Not the owner of this NFT'
        };
      }

      return {
        isValid: true,
        ownershipInfo: {
          tokenId,
          owner,
          exists: true
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Ownership validation failed: ${error}`
      };
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
   * Update supply cache
   */
  private updateSupplyCache(updates: Partial<SupplyInfo>): void {
    const cached = this.getCachedData(CACHE_KEYS.SUPPLY_INFO) || {};
    const updated = { ...cached, ...updates };
    this.setCachedData(CACHE_KEYS.SUPPLY_INFO, updated);
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
    eventTypes: NFTEventType[],
    listener: NFTEventListener,
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
  private emitEvent(event: NFTEventData): void {
    for (const subscription of this.eventListeners.values()) {
      if (!subscription.active) continue;
      
      if (subscription.eventTypes.includes(event.type)) {
        // Apply filters
        if (subscription.options?.tokenId && event.tokenId !== subscription.options.tokenId) {
          continue;
        }
        
        if (subscription.options?.owner && event.owner !== subscription.options.owner) {
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
  private handleError(error: any, operation: string): NFTResponse<any> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = getErrorType(errorMessage);
    
    this.emitEvent({
      type: NFTEventType.ERROR,
      timestamp: Date.now(),
      error: errorMessage,
      operation
    });
    
    return this.createErrorResponse(errorMessage, errorType);
  }

  /**
   * Create success response
   */
  private createSuccessResponse<T>(data: T): NFTResponse<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: string, errorCode?: string): NFTResponse<any> {
    return {
      success: false,
      error,
      errorCode: errorCode ? NFT_ERROR_CODES[errorCode as keyof typeof NFT_ERROR_CODES] : undefined
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
