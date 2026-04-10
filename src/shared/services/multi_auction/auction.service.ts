import {
  signTransaction,
  getPublicKey,
  isWalletConnected,
} from '../../utils/wallet';
import {
  NETWORKS,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  CONTRACT_EVENTS,
  AUCTION_ERROR_CODES,
} from './constants/auction.constants';
import {
  isValidStellarAddress,
  isValidAuctionId,
  validateAuctionConfig,
  validateBid,
  calculatePlatformFee,
  calculateSellerAmount,
  sanitizeString,
  generateUniqueId,
  retryWithBackoff,
  createSuccessResponse,
  createErrorResponse,
  isAuctionActive,
  getTimeRemaining,
  formatBidAmount,
} from './utils/auction.utils';
import { AuctionStatus, AuctionType } from './types/auction.types';
import type {
  Auction,
  AuctionConfig,
  AuctionUpdate,
  AuctionListFilter,
  AuctionResults,
  AuctionServiceConfig,
  AuctionResponse,
  TransactionResult,
  AuctionEventData,
  AuctionEventListener,
  EventSubscription,
  HealthCheck,
  PerformanceMetrics,
  Address,
  AuctionId,
} from './types/auction.types';
import { BidStatus } from './types/bid.types';
import type {
  Bid,
  BidRequest,
  BidUpdate,
  BidHistory,
  BidderProfile,
  BidValidation,
} from './types/bid.types';
import { DistributionStatus } from './types/distribution.types';
import type {
  Distribution,
  DistributionBreakdown,
  ClaimResult,
  DistributionConfig,
} from './types/distribution.types';

/**
 * MultiAuctionService - Manages multiple concurrent auctions, bidding mechanisms,
 * and auction distribution within the StarShop marketplace.
 */
export class MultiAuctionService {
  private config: AuctionServiceConfig;
  private contractClient: unknown | null = null;
  private eventListeners: Map<string, Set<AuctionEventListener>> = new Map();
  private cache: Map<string, { data: unknown; expiry: number }> = new Map();
  private initialized: boolean = false;

  constructor(config: Partial<AuctionServiceConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as AuctionServiceConfig;
  }

  // ─── Initialization ──────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const connected = await isWalletConnected();
      if (!connected) {
        throw new Error(ERROR_MESSAGES.NOT_CONNECTED);
      }
      this.initialized = true;
    } catch (error) {
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }
  }

  // ─── Auction Management ──────────────────────────────────────────

  async createAuction(config: AuctionConfig): Promise<AuctionResponse<Auction>> {
    this.ensureInitialized();

    try {
      const validation = validateAuctionConfig(config);
      if (!validation.valid) {
        return createErrorResponse(validation.errors.join('; '));
      }

      const sanitizedConfig: AuctionConfig = {
        ...config,
        title: sanitizeString(config.title),
        description: sanitizeString(config.description),
      };

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.CREATE_AUCTION, sanitizedConfig),
        this.config.maxRetries
      );

      const auction: Auction = {
        id: generateUniqueId(),
        config: sanitizedConfig,
        status: AuctionStatus.PENDING,
        highestBid: BigInt(0),
        highestBidder: null,
        totalBids: 0,
        totalBidders: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.emitEvent(CONTRACT_EVENTS.AUCTION_CREATED, auction.id, auction);
      this.invalidateCache(`${CACHE_KEYS.LIST_PREFIX}*`);

      return createSuccessResponse(auction);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  async getAuction(auctionId: AuctionId): Promise<AuctionResponse<Auction>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const cached = this.getFromCache<Auction>(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`);
      if (cached) return createSuccessResponse(cached);

      const auction = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.GET_AUCTION, { auctionId }),
        this.config.maxRetries
      );

      this.setCache(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`, auction);
      return createSuccessResponse(auction as Auction);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.AUCTION_NOT_FOUND
      );
    }
  }

  async updateAuction(
    auctionId: AuctionId,
    updates: AuctionUpdate
  ): Promise<AuctionResponse<Auction>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.UPDATE_AUCTION, {
          auctionId,
          updates,
          caller: publicKey,
        }),
        this.config.maxRetries
      );

      this.invalidateCache(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`);
      this.emitEvent(CONTRACT_EVENTS.AUCTION_UPDATED, auctionId, updates);

      return createSuccessResponse(result as Auction);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  async cancelAuction(auctionId: AuctionId): Promise<AuctionResponse<boolean>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.CANCEL_AUCTION, {
          auctionId,
          caller: publicKey,
        }),
        this.config.maxRetries
      );

      this.invalidateCache(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`);
      this.invalidateCache(`${CACHE_KEYS.LIST_PREFIX}*`);
      this.emitEvent(CONTRACT_EVENTS.AUCTION_CANCELLED, auctionId, {});

      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.UNAUTHORIZED
      );
    }
  }

  async listAuctions(filter?: AuctionListFilter): Promise<AuctionResponse<Auction[]>> {
    this.ensureInitialized();

    try {
      const cacheKey = `${CACHE_KEYS.LIST_PREFIX}${JSON.stringify(filter || {})}`;
      const cached = this.getFromCache<Auction[]>(cacheKey);
      if (cached) return createSuccessResponse(cached);

      const auctions = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.LIST_AUCTIONS, filter || {}),
        this.config.maxRetries
      );

      this.setCache(cacheKey, auctions);
      return createSuccessResponse(auctions as Auction[]);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  // ─── Bidding Operations ──────────────────────────────────────────

  async placeBid(auctionId: AuctionId, amount: bigint): Promise<AuctionResponse<Bid>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    if (amount <= BigInt(0)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_BID_AMOUNT);
    }

    try {
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.PLACE_BID, {
          auctionId,
          amount,
          bidder: publicKey,
        }),
        this.config.maxRetries
      );

      const bid: Bid = {
        auctionId,
        bidder: publicKey,
        amount,
        status: BidStatus.ACTIVE,
        placedAt: Date.now(),
        updatedAt: Date.now(),
        transactionHash: (result as TransactionResult)?.hash || '',
      };

      this.invalidateCache(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`);
      this.invalidateCache(`${CACHE_KEYS.BID_PREFIX}${auctionId}`);
      this.emitEvent(CONTRACT_EVENTS.BID_PLACED, auctionId, bid);

      return createSuccessResponse(bid);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  async updateBid(auctionId: AuctionId, newAmount: bigint): Promise<AuctionResponse<Bid>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.UPDATE_BID, {
          auctionId,
          newAmount,
          bidder: publicKey,
        }),
        this.config.maxRetries
      );

      this.invalidateCache(`${CACHE_KEYS.BID_PREFIX}${auctionId}`);
      this.emitEvent(CONTRACT_EVENTS.BID_UPDATED, auctionId, { bidder: publicKey, newAmount });

      return createSuccessResponse(result as Bid);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  async withdrawBid(auctionId: AuctionId): Promise<AuctionResponse<boolean>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.WITHDRAW_BID, {
          auctionId,
          bidder: publicKey,
        }),
        this.config.maxRetries
      );

      this.invalidateCache(`${CACHE_KEYS.BID_PREFIX}${auctionId}`);
      this.invalidateCache(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`);
      this.emitEvent(CONTRACT_EVENTS.BID_WITHDRAWN, auctionId, { bidder: publicKey });

      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.BID_NOT_FOUND
      );
    }
  }

  async getBid(auctionId: AuctionId, bidder: Address): Promise<AuctionResponse<Bid>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    if (!isValidStellarAddress(bidder)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_ADDRESS);
    }

    try {
      const cacheKey = `${CACHE_KEYS.BID_PREFIX}${auctionId}:${bidder}`;
      const cached = this.getFromCache<Bid>(cacheKey);
      if (cached) return createSuccessResponse(cached);

      const bid = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.GET_BID, { auctionId, bidder }),
        this.config.maxRetries
      );

      this.setCache(cacheKey, bid);
      return createSuccessResponse(bid as Bid);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.BID_NOT_FOUND
      );
    }
  }

  async getHighestBid(auctionId: AuctionId): Promise<AuctionResponse<Bid>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const bid = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.GET_HIGHEST_BID, { auctionId }),
        this.config.maxRetries
      );

      return createSuccessResponse(bid as Bid);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.BID_NOT_FOUND
      );
    }
  }

  // ─── Auction Execution ───────────────────────────────────────────

  async endAuction(auctionId: AuctionId): Promise<AuctionResponse<AuctionResults>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.END_AUCTION, {
          auctionId,
          caller: publicKey,
        }),
        this.config.maxRetries
      );

      this.invalidateCache(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`);
      this.invalidateCache(`${CACHE_KEYS.LIST_PREFIX}*`);
      this.emitEvent(CONTRACT_EVENTS.AUCTION_ENDED, auctionId, result);

      return createSuccessResponse(result as AuctionResults);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  async distributeAuction(auctionId: AuctionId): Promise<AuctionResponse<Distribution>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.DISTRIBUTE_AUCTION, {
          auctionId,
          caller: publicKey,
        }),
        this.config.maxRetries
      );

      this.invalidateCache(`${CACHE_KEYS.AUCTION_PREFIX}${auctionId}`);
      this.invalidateCache(`${CACHE_KEYS.DISTRIBUTION_PREFIX}${auctionId}`);
      this.emitEvent(CONTRACT_EVENTS.DISTRIBUTION_COMPLETED, auctionId, result);

      return createSuccessResponse(result as Distribution);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.DISTRIBUTION_FAILED
      );
    }
  }

  async claimWinnings(auctionId: AuctionId): Promise<AuctionResponse<ClaimResult>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.CLAIM_WINNINGS, {
          auctionId,
          claimer: publicKey,
        }),
        this.config.maxRetries
      );

      this.emitEvent(CONTRACT_EVENTS.WINNINGS_CLAIMED, auctionId, { claimer: publicKey });

      return createSuccessResponse(result as ClaimResult);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.ALREADY_CLAIMED
      );
    }
  }

  async getAuctionResults(auctionId: AuctionId): Promise<AuctionResponse<AuctionResults>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const cacheKey = `${CACHE_KEYS.RESULTS_PREFIX}${auctionId}`;
      const cached = this.getFromCache<AuctionResults>(cacheKey);
      if (cached) return createSuccessResponse(cached);

      const results = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.GET_AUCTION_RESULTS, { auctionId }),
        this.config.maxRetries
      );

      this.setCache(cacheKey, results);
      return createSuccessResponse(results as AuctionResults);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.AUCTION_NOT_FOUND
      );
    }
  }

  // ─── Distribution Management ─────────────────────────────────────

  async getDistribution(auctionId: AuctionId): Promise<AuctionResponse<Distribution>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const cacheKey = `${CACHE_KEYS.DISTRIBUTION_PREFIX}${auctionId}`;
      const cached = this.getFromCache<Distribution>(cacheKey);
      if (cached) return createSuccessResponse(cached);

      const distribution = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.GET_DISTRIBUTION, { auctionId }),
        this.config.maxRetries
      );

      this.setCache(cacheKey, distribution);
      return createSuccessResponse(distribution as Distribution);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.DISTRIBUTION_FAILED
      );
    }
  }

  async processDistribution(auctionId: AuctionId): Promise<AuctionResponse<Distribution>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.PROCESS_DISTRIBUTION, {
          auctionId,
          caller: publicKey,
        }),
        this.config.maxRetries
      );

      this.invalidateCache(`${CACHE_KEYS.DISTRIBUTION_PREFIX}${auctionId}`);
      this.emitEvent(CONTRACT_EVENTS.DISTRIBUTION_COMPLETED, auctionId, result);

      return createSuccessResponse(result as Distribution);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.DISTRIBUTION_FAILED
      );
    }
  }

  async getDistributionStatus(auctionId: AuctionId): Promise<AuctionResponse<DistributionStatus>> {
    this.ensureInitialized();

    if (!isValidAuctionId(auctionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_AUCTION_ID);
    }

    try {
      const result = await retryWithBackoff(
        () => this.callContract(CONTRACT_METHODS.GET_DISTRIBUTION_STATUS, { auctionId }),
        this.config.maxRetries
      );

      return createSuccessResponse(result as DistributionStatus);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.DISTRIBUTION_FAILED
      );
    }
  }

  // ─── Event System ────────────────────────────────────────────────

  on(event: string, listener: AuctionEventListener): EventSubscription {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);

    return {
      unsubscribe: () => {
        this.eventListeners.get(event)?.delete(listener);
      },
    };
  }

  private emitEvent(type: string, auctionId: AuctionId, data: unknown): void {
    const event: AuctionEventData = {
      type,
      auctionId,
      data,
      timestamp: Date.now(),
    };

    this.eventListeners.get(type)?.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Listener error should not break the service
      }
    });
  }

  // ─── Health & Metrics ────────────────────────────────────────────

  async healthCheck(): Promise<AuctionResponse<HealthCheck>> {
    try {
      const connected = await isWalletConnected();
      return createSuccessResponse({
        connected,
        contractAddress: this.config.contractAddress,
        network: this.config.networkPassphrase,
        timestamp: Date.now(),
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  async getMetrics(): Promise<AuctionResponse<PerformanceMetrics>> {
    this.ensureInitialized();

    try {
      const auctions = await this.listAuctions();
      const auctionList = auctions.data || [];

      const activeAuctions = auctionList.filter(
        (a) => a.status === AuctionStatus.ACTIVE
      ).length;

      const totalVolume = auctionList.reduce(
        (sum, a) => sum + a.highestBid,
        BigInt(0)
      );

      const totalBids = auctionList.reduce((sum, a) => sum + a.totalBids, 0);
      const averageBidCount =
        auctionList.length > 0 ? totalBids / auctionList.length : 0;

      const distributed = auctionList.filter(
        (a) => a.status === AuctionStatus.DISTRIBUTED
      ).length;
      const ended = auctionList.filter(
        (a) =>
          a.status === AuctionStatus.ENDED ||
          a.status === AuctionStatus.DISTRIBUTED
      ).length;
      const successRate = ended > 0 ? distributed / ended : 0;

      return createSuccessResponse({
        totalAuctions: auctionList.length,
        activeAuctions,
        totalVolume,
        averageBidCount,
        successRate,
      });
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      );
    }
  }

  // ─── Cache ───────────────────────────────────────────────────────

  private getFromCache<T>(key: string): T | null {
    if (!this.config.cacheEnabled) return null;

    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }

    if (entry) {
      this.cache.delete(key);
    }

    return null;
  }

  private setCache(key: string, data: unknown): void {
    if (!this.config.cacheEnabled) return;

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.config.cacheTtl,
    });
  }

  private invalidateCache(pattern: string): void {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.delete(pattern);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  // ─── Contract Communication ──────────────────────────────────────

  private async callContract(method: string, params: unknown): Promise<unknown> {
    const publicKey = await getPublicKey();

    const tx = {
      method,
      params,
      source: publicKey,
      contractAddress: this.config.contractAddress,
      networkPassphrase: this.config.networkPassphrase,
    };

    const signedTx = await signTransaction(JSON.stringify(tx));
    return signedTx;
  }

  // ─── Cleanup ─────────────────────────────────────────────────────

  destroy(): void {
    this.eventListeners.clear();
    this.cache.clear();
    this.contractClient = null;
    this.initialized = false;
  }
}
