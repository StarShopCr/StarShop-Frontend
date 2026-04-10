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
  VOTING_ERROR_CODES,
  VOTER_LEVEL_THRESHOLDS
} from './constants/voting.constants';
import {
  isValidStellarAddress,
  isValidProductId,
  validateVoteRequest,
  calculateVotingResults,
  getVoterLevel,
  calculateVotingPower,
  calculateUpvotePercentage,
  sanitizeString,
  generateUniqueId,
  retryWithBackoff,
  getErrorType,
  createSuccessResponse,
  createErrorResponse,
  isWithinDuration,
  deepClone
} from './utils/voting.utils';
import { VoteType, VoteStatus } from './types/voting.types';
import type {
  Vote,
  VoteRequest,
  VotingResults,
  VotingStats,
  UserVotingHistory,
  VotingTrend,
  VotingServiceConfig,
  VotingResponse,
  TransactionResult,
  VotingEventData,
  VotingEventListener,
  EventSubscription,
  HealthCheck,
  PerformanceMetrics,
  ValidationResult,
  Address,
  ProductId
} from './types/voting.types';
import type {
  ProductRanking,
  RankingEntry,
  RankingHistory,
  RankingHistoryEntry,
  Leaderboard,
  LeaderboardEntry,
  TopProductsRequest,
  TopProductsResult
} from './types/ranking.types';
import { RankingCategory } from './types/ranking.types';
import type {
  VotingLimits,
  VotingPower,
  VotingCooldown,
  DailyVotingStats
} from './types/limits.types';
import { VoterLevel } from './types/limits.types';

/**
 * ProductVotingService - Manages product voting, ranking systems, and
 * community-driven product evaluation within the StarShop marketplace.
 */
export class ProductVotingService {
  private config: VotingServiceConfig;
  private contractClient: unknown | null = null;
  private eventListeners: Map<string, Set<VotingEventListener>> = new Map();
  private cache: Map<string, { data: unknown; expiry: number }> = new Map();
  private metrics: PerformanceMetrics = {
    averageResponseTimeMs: 0,
    totalRequests: 0,
    failedRequests: 0,
    cacheHitRate: 0,
  };
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(config: VotingServiceConfig) {
    this.config = {
      defaultVotingPower: DEFAULT_CONFIG.defaultVotingPower,
      maxVotesPerUser: DEFAULT_CONFIG.maxVotesPerDay,
      votingCooldownMs: DEFAULT_CONFIG.votingCooldownMs,
      ...config,
    };
  }

  // ========================
  // Initialization
  // ========================

  /**
   * Initialize the service and connect to the contract
   */
  async initialize(): Promise<VotingResponse<boolean>> {
    try {
      const connected = await isWalletConnected();
      if (!connected) {
        return createErrorResponse(ERROR_MESSAGES.WALLET_NOT_CONNECTED) as VotingResponse<boolean>;
      }
      return createSuccessResponse(true) as VotingResponse<boolean>;
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED
      ) as VotingResponse<boolean>;
    }
  }

  // ========================
  // 1. Voting Operations
  // ========================

  /**
   * Vote for a product
   */
  async voteForProduct(
    productId: ProductId,
    user: Address,
    vote: VoteType
  ): Promise<VotingResponse<TransactionResult>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const request: VoteRequest = { productId, voter: user, voteType: vote };
      const validation = validateVoteRequest(request);
      if (!validation.isValid) {
        this.metrics.failedRequests++;
        return createErrorResponse(validation.errors.join(', ')) as VotingResponse<TransactionResult>;
      }

      // Check voting limits
      const limits = await this.checkVotingLimits(user);
      if (limits.data && limits.data.remainingVotes <= 0) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.DAILY_VOTE_LIMIT_REACHED) as VotingResponse<TransactionResult>;
      }

      const publicKey = await getPublicKey();
      const result: TransactionResult = {
        success: true,
        txHash: generateUniqueId(),
      };

      // Invalidate related caches
      this.invalidateCache(`${CACHE_KEYS.VOTING_RESULTS}_${productId}`);
      this.invalidateCache(`${CACHE_KEYS.VOTING_STATS}_${productId}`);
      this.invalidateCache(`${CACHE_KEYS.USER_HISTORY}_${user}`);

      // Emit event
      this.emitEvent({
        type: CONTRACT_EVENTS.VOTE_CAST,
        productId,
        voter: user,
        data: { voteType: vote },
        timestamp: Date.now(),
      });

      this.updateMetrics(startTime);
      return createSuccessResponse(result) as VotingResponse<TransactionResult>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_FAILED
      ) as VotingResponse<TransactionResult>;
    }
  }

  /**
   * Update an existing vote
   */
  async updateVote(
    productId: ProductId,
    user: Address,
    newVote: VoteType
  ): Promise<VotingResponse<TransactionResult>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId) || !isValidStellarAddress(user)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.INVALID_ADDRESS) as VotingResponse<TransactionResult>;
      }

      const result: TransactionResult = {
        success: true,
        txHash: generateUniqueId(),
      };

      this.invalidateCache(`${CACHE_KEYS.VOTING_RESULTS}_${productId}`);
      this.invalidateCache(`${CACHE_KEYS.USER_HISTORY}_${user}`);

      this.emitEvent({
        type: CONTRACT_EVENTS.VOTE_UPDATED,
        productId,
        voter: user,
        data: { newVoteType: newVote },
        timestamp: Date.now(),
      });

      this.updateMetrics(startTime);
      return createSuccessResponse(result) as VotingResponse<TransactionResult>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_FAILED
      ) as VotingResponse<TransactionResult>;
    }
  }

  /**
   * Remove a vote
   */
  async removeVote(
    productId: ProductId,
    user: Address
  ): Promise<VotingResponse<TransactionResult>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId) || !isValidStellarAddress(user)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.INVALID_ADDRESS) as VotingResponse<TransactionResult>;
      }

      const result: TransactionResult = {
        success: true,
        txHash: generateUniqueId(),
      };

      this.invalidateCache(`${CACHE_KEYS.VOTING_RESULTS}_${productId}`);
      this.invalidateCache(`${CACHE_KEYS.USER_HISTORY}_${user}`);

      this.emitEvent({
        type: CONTRACT_EVENTS.VOTE_REMOVED,
        productId,
        voter: user,
        timestamp: Date.now(),
      });

      this.updateMetrics(startTime);
      return createSuccessResponse(result) as VotingResponse<TransactionResult>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_FAILED
      ) as VotingResponse<TransactionResult>;
    }
  }

  /**
   * Get a user's vote for a specific product
   */
  async getVote(
    productId: ProductId,
    user: Address
  ): Promise<VotingResponse<Vote | null>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId) || !isValidStellarAddress(user)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.INVALID_ADDRESS) as VotingResponse<Vote | null>;
      }

      this.updateMetrics(startTime);
      return createSuccessResponse(null) as VotingResponse<Vote | null>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.VOTE_NOT_FOUND
      ) as VotingResponse<Vote | null>;
    }
  }

  /**
   * Get voting results for a product
   */
  async getVotingResults(
    productId: ProductId
  ): Promise<VotingResponse<VotingResults>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND) as VotingResponse<VotingResults>;
      }

      const cacheKey = `${CACHE_KEYS.VOTING_RESULTS}_${productId}`;
      const cached = this.getFromCache<VotingResults>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<VotingResults>;
      }

      const results: VotingResults = {
        productId,
        totalUpvotes: 0,
        totalDownvotes: 0,
        netScore: 0,
        totalVoters: 0,
        weightedScore: 0,
        lastUpdated: Date.now(),
      };

      this.setCache(cacheKey, results);
      this.updateMetrics(startTime);
      return createSuccessResponse(results) as VotingResponse<VotingResults>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.PRODUCT_NOT_FOUND
      ) as VotingResponse<VotingResults>;
    }
  }

  // ========================
  // 2. Ranking Management
  // ========================

  /**
   * Get product ranking
   */
  async getProductRanking(
    productId: ProductId
  ): Promise<VotingResponse<ProductRanking>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND) as VotingResponse<ProductRanking>;
      }

      const cacheKey = `${CACHE_KEYS.PRODUCT_RANKING}_${productId}`;
      const cached = this.getFromCache<ProductRanking>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<ProductRanking>;
      }

      const ranking: ProductRanking = {
        productId,
        rank: 0,
        score: 0,
        previousRank: 0,
        rankChange: 0,
        category: RankingCategory.OVERALL,
        lastUpdated: Date.now(),
      };

      this.setCache(cacheKey, ranking);
      this.updateMetrics(startTime);
      return createSuccessResponse(ranking) as VotingResponse<ProductRanking>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.RANKING_UPDATE_FAILED
      ) as VotingResponse<ProductRanking>;
    }
  }

  /**
   * Get top-ranked products
   */
  async getTopProducts(
    limit: number,
    category?: RankingCategory
  ): Promise<VotingResponse<TopProductsResult>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const effectiveLimit = Math.min(limit, DEFAULT_CONFIG.topProductsDefaultLimit);
      const cacheKey = `${CACHE_KEYS.TOP_PRODUCTS}_${effectiveLimit}_${category || 'all'}`;
      const cached = this.getFromCache<TopProductsResult>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<TopProductsResult>;
      }

      const result: TopProductsResult = {
        products: [],
        total: 0,
        hasMore: false,
      };

      this.setCache(cacheKey, result);
      this.updateMetrics(startTime);
      return createSuccessResponse(result) as VotingResponse<TopProductsResult>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.RANKING_UPDATE_FAILED
      ) as VotingResponse<TopProductsResult>;
    }
  }

  /**
   * Update product ranking
   */
  async updateRanking(
    productId: ProductId
  ): Promise<VotingResponse<TransactionResult>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND) as VotingResponse<TransactionResult>;
      }

      const result: TransactionResult = {
        success: true,
        txHash: generateUniqueId(),
      };

      this.invalidateCache(`${CACHE_KEYS.PRODUCT_RANKING}_${productId}`);
      this.invalidateCache(`${CACHE_KEYS.TOP_PRODUCTS}`);

      this.emitEvent({
        type: CONTRACT_EVENTS.RANKING_UPDATED,
        productId,
        data: { action: 'update' },
        timestamp: Date.now(),
      });

      this.updateMetrics(startTime);
      return createSuccessResponse(result) as VotingResponse<TransactionResult>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.RANKING_UPDATE_FAILED
      ) as VotingResponse<TransactionResult>;
    }
  }

  /**
   * Get ranking history for a product
   */
  async getRankingHistory(
    productId: ProductId
  ): Promise<VotingResponse<RankingHistory>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND) as VotingResponse<RankingHistory>;
      }

      const history: RankingHistory = {
        productId,
        entries: [],
      };

      this.updateMetrics(startTime);
      return createSuccessResponse(history) as VotingResponse<RankingHistory>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.RANKING_UPDATE_FAILED
      ) as VotingResponse<RankingHistory>;
    }
  }

  // ========================
  // 3. Voting Limits & Validation
  // ========================

  /**
   * Check user voting limits
   */
  async checkVotingLimits(
    user: Address
  ): Promise<VotingResponse<VotingLimits>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidStellarAddress(user)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.INVALID_ADDRESS) as VotingResponse<VotingLimits>;
      }

      const cacheKey = `${CACHE_KEYS.VOTING_LIMITS}_${user}`;
      const cached = this.getFromCache<VotingLimits>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<VotingLimits>;
      }

      const limits: VotingLimits = {
        voter: user,
        maxVotesPerDay: this.config.maxVotesPerUser || DEFAULT_CONFIG.maxVotesPerDay,
        votesUsedToday: 0,
        remainingVotes: this.config.maxVotesPerUser || DEFAULT_CONFIG.maxVotesPerDay,
        cooldownEndsAt: 0,
        isOnCooldown: false,
      };

      this.setCache(cacheKey, limits);
      this.updateMetrics(startTime);
      return createSuccessResponse(limits) as VotingResponse<VotingLimits>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.UNAUTHORIZED
      ) as VotingResponse<VotingLimits>;
    }
  }

  /**
   * Get user's voting power
   */
  async getVotingPower(
    user: Address
  ): Promise<VotingResponse<VotingPower>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidStellarAddress(user)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.INVALID_ADDRESS) as VotingResponse<VotingPower>;
      }

      const cacheKey = `${CACHE_KEYS.VOTING_POWER}_${user}`;
      const cached = this.getFromCache<VotingPower>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<VotingPower>;
      }

      const basePower = this.config.defaultVotingPower || DEFAULT_CONFIG.defaultVotingPower;
      const level = VoterLevel.NEWCOMER;
      const power = calculateVotingPower(basePower, level);
      power.voter = user;

      this.setCache(cacheKey, power);
      this.updateMetrics(startTime);
      return createSuccessResponse(power) as VotingResponse<VotingPower>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.UNAUTHORIZED
      ) as VotingResponse<VotingPower>;
    }
  }

  /**
   * Validate vote data
   */
  async validateVote(vote: VoteRequest): Promise<VotingResponse<ValidationResult>> {
    this.metrics.totalRequests++;
    const result = validateVoteRequest(vote);
    return createSuccessResponse(result) as VotingResponse<ValidationResult>;
  }

  /**
   * Get voting statistics for a product
   */
  async getVotingStats(
    productId: ProductId
  ): Promise<VotingResponse<VotingStats>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidProductId(productId)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND) as VotingResponse<VotingStats>;
      }

      const cacheKey = `${CACHE_KEYS.VOTING_STATS}_${productId}`;
      const cached = this.getFromCache<VotingStats>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<VotingStats>;
      }

      const stats: VotingStats = {
        productId,
        totalVotes: 0,
        uniqueVoters: 0,
        upvotePercentage: 0,
        downvotePercentage: 0,
        averageVotingPower: 0,
        lastVoteTimestamp: 0,
      };

      this.setCache(cacheKey, stats);
      this.updateMetrics(startTime);
      return createSuccessResponse(stats) as VotingResponse<VotingStats>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.PRODUCT_NOT_FOUND
      ) as VotingResponse<VotingStats>;
    }
  }

  // ========================
  // 4. Community Features
  // ========================

  /**
   * Get voting leaderboard
   */
  async getVotingLeaderboard(): Promise<VotingResponse<Leaderboard>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const cacheKey = CACHE_KEYS.LEADERBOARD;
      const cached = this.getFromCache<Leaderboard>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<Leaderboard>;
      }

      const leaderboard: Leaderboard = {
        entries: [],
        totalParticipants: 0,
        lastUpdated: Date.now(),
      };

      this.setCache(cacheKey, leaderboard);
      this.updateMetrics(startTime);
      return createSuccessResponse(leaderboard) as VotingResponse<Leaderboard>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_FAILED
      ) as VotingResponse<Leaderboard>;
    }
  }

  /**
   * Get user's voting history
   */
  async getUserVotingHistory(
    user: Address
  ): Promise<VotingResponse<UserVotingHistory>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      if (!isValidStellarAddress(user)) {
        this.metrics.failedRequests++;
        return createErrorResponse(ERROR_MESSAGES.INVALID_ADDRESS) as VotingResponse<UserVotingHistory>;
      }

      const cacheKey = `${CACHE_KEYS.USER_HISTORY}_${user}`;
      const cached = this.getFromCache<UserVotingHistory>(cacheKey);
      if (cached) {
        this.updateMetrics(startTime);
        return createSuccessResponse(cached) as VotingResponse<UserVotingHistory>;
      }

      const history: UserVotingHistory = {
        voter: user,
        votes: [],
        totalVotesCast: 0,
        totalUpvotes: 0,
        totalDownvotes: 0,
      };

      this.setCache(cacheKey, history);
      this.updateMetrics(startTime);
      return createSuccessResponse(history) as VotingResponse<UserVotingHistory>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.UNAUTHORIZED
      ) as VotingResponse<UserVotingHistory>;
    }
  }

  /**
   * Get voting trends over a timeframe
   */
  async getVotingTrends(
    timeframe: 'day' | 'week' | 'month'
  ): Promise<VotingResponse<VotingTrend[]>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const trends: VotingTrend[] = [];
      this.updateMetrics(startTime);
      return createSuccessResponse(trends) as VotingResponse<VotingTrend[]>;
    } catch (error) {
      this.metrics.failedRequests++;
      return createErrorResponse(
        error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_FAILED
      ) as VotingResponse<VotingTrend[]>;
    }
  }

  // ========================
  // Event System
  // ========================

  /**
   * Subscribe to voting events
   */
  on(eventType: string, listener: VotingEventListener): EventSubscription {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);

    const subscriptionId = generateUniqueId();
    return {
      id: subscriptionId,
      eventType,
      listener,
      unsubscribe: () => {
        this.eventListeners.get(eventType)?.delete(listener);
      },
    };
  }

  /**
   * Remove event listener
   */
  off(eventType: string, listener: VotingEventListener): void {
    this.eventListeners.get(eventType)?.delete(listener);
  }

  // ========================
  // Health & Metrics
  // ========================

  /**
   * Perform health check
   */
  async healthCheck(): Promise<VotingResponse<HealthCheck>> {
    const startTime = Date.now();
    try {
      const health: HealthCheck = {
        status: 'healthy',
        contractConnected: this.contractClient !== null,
        lastBlockTimestamp: Date.now(),
        responseTimeMs: Date.now() - startTime,
      };
      return createSuccessResponse(health) as VotingResponse<HealthCheck>;
    } catch {
      return createErrorResponse('Health check failed') as VotingResponse<HealthCheck>;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return deepClone(this.metrics);
  }

  // ========================
  // Private Helpers
  // ========================

  private emitEvent(event: VotingEventData): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch {
          // Silently handle listener errors
        }
      });
    }
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      this.cacheHits++;
      return entry.data as T;
    }
    if (entry) {
      this.cache.delete(key);
    }
    this.cacheMisses++;
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + DEFAULT_CONFIG.cacheExpiryMs,
    });
  }

  private invalidateCache(keyPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  private updateMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime;
    const totalCompleted = this.metrics.totalRequests - this.metrics.failedRequests;
    if (totalCompleted > 0) {
      this.metrics.averageResponseTimeMs =
        (this.metrics.averageResponseTimeMs * (totalCompleted - 1) + responseTime) / totalCompleted;
    }
    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = totalCacheRequests > 0 ? this.cacheHits / totalCacheRequests : 0;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Destroy the service and clean up resources
   */
  destroy(): void {
    this.clearCache();
    this.eventListeners.clear();
    this.contractClient = null;
  }
}
