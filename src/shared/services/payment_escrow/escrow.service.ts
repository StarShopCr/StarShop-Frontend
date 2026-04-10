import {
  signTransaction,
  getPublicKey,
  isWalletConnected,
} from '../../utils/wallet';
import {
  NETWORKS,
  DEFAULT_CONFIG,
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  ERROR_CODES,
  TIMEOUT_CONFIG,
} from './constants/escrow.constants';
import {
  validateAddress,
  validateAmount,
  validateEscrowConfig,
  validateDisputeRequest,
  sanitizeString,
  calculatePlatformFee,
  calculateArbitratorFee,
  calculateTotalFees,
  isCacheExpired,
  generateEscrowCacheKey,
  generateDisputeCacheKey,
  generateArbitratorCacheKey,
  mapContractError,
  getErrorMessage,
  canDeposit,
  canRelease,
  canRefund,
  canDispute,
  canCancel,
  isExpired,
  retryWithBackoff,
  formatAmount,
  parseAmount,
} from './utils/escrow.utils';
import type {
  EscrowServiceConfig,
  EscrowConfig,
  EscrowInfo,
  EscrowUpdateRequest,
  DepositRequest,
  ReleaseRequest,
  RefundRequest,
  PaymentStatusInfo,
  EscrowTransaction,
  EscrowResponse,
  TransactionResult,
  EscrowAnalytics,
  HealthCheck,
  CacheEntry,
  NetworkConfig,
  EscrowEventType,
  EscrowEventData,
  EscrowEventListener,
  EventListenerOptions,
  EventSubscription,
} from './types/escrow.types';
import { EscrowStatus, EscrowTransactionType } from './types/escrow.types';
import type {
  CreateDisputeRequest,
  DisputeInfo,
  ResolveDisputeRequest,
} from './types/dispute.types';
import { DisputeStatus } from './types/dispute.types';
import type {
  ArbitratorInfo,
  ArbitratorAssignmentRequest,
  ArbitratorDecision,
} from './types/arbitrator.types';

/**
 * Payment Escrow Contract Service
 *
 * Provides a comprehensive TypeScript service layer for the Payment Escrow Contract
 * that manages secure payment escrow, dispute resolution, and transaction arbitration
 * within the StarShop marketplace.
 */
export class PaymentEscrowService {
  private config: EscrowServiceConfig;
  private networkConfig: NetworkConfig;
  private cache: Map<string, CacheEntry<unknown>>;
  private eventListeners: Map<string, { listener: EscrowEventListener; options: EventListenerOptions }[]>;
  private listenerIdCounter: number;

  constructor(config?: Partial<EscrowServiceConfig>) {
    this.config = {
      network: config?.network || DEFAULT_CONFIG.network,
      contractAddress: config?.contractAddress || '',
      defaultTimeout: config?.defaultTimeout || DEFAULT_CONFIG.defaultTimeout,
      maxRetries: config?.maxRetries || DEFAULT_CONFIG.maxRetries,
      cacheEnabled: config?.cacheEnabled ?? DEFAULT_CONFIG.cacheEnabled,
      cacheTTL: config?.cacheTTL || DEFAULT_CONFIG.cacheTTL,
      feePercentage: config?.feePercentage || DEFAULT_CONFIG.feePercentage,
    };

    const networkKey = this.config.network === 'mainnet' ? 'MAINNET' : 'TESTNET';
    this.networkConfig = {
      ...NETWORKS[networkKey],
      contractAddress: this.config.contractAddress || NETWORKS[networkKey].contractAddress,
    };

    this.cache = new Map();
    this.eventListeners = new Map();
    this.listenerIdCounter = 0;
  }

  // ==================== ESCROW CREATION & MANAGEMENT ====================

  /**
   * Create a new escrow
   */
  async createEscrow(config: EscrowConfig): Promise<EscrowResponse<EscrowInfo>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const validation = validateEscrowConfig(config);
      if (!validation.valid) {
        return this.errorResponse(ERROR_CODES.INVALID_INPUT, validation.errors.join('; '));
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.CREATE_ESCROW, {
          buyer: config.buyer,
          seller: config.seller,
          amount: config.amount.toString(),
          token_address: config.tokenAddress,
          description: config.description ? sanitizeString(config.description) : '',
          expires_at: config.expiresAt || 0,
          auto_release: config.autoRelease || false,
          auto_release_delay: config.autoReleaseDelay || DEFAULT_CONFIG.autoReleaseDelay,
          metadata: config.metadata || {},
        }, publicKey);
      }, this.config.maxRetries);

      const escrowInfo = this.mapEscrowResult(result);
      this.setCacheEntry(generateEscrowCacheKey(escrowInfo.id), escrowInfo);
      this.emitEvent('escrow_created' as EscrowEventType, escrowInfo.id, { escrow: escrowInfo });

      return this.successResponse(escrowInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get escrow details by ID
   */
  async getEscrow(escrowId: string): Promise<EscrowResponse<EscrowInfo>> {
    try {
      const cacheKey = generateEscrowCacheKey(escrowId);
      const cached = this.getCacheEntry<EscrowInfo>(cacheKey);
      if (cached) return this.successResponse(cached);

      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.GET_ESCROW, { escrow_id: escrowId });
      }, this.config.maxRetries);

      const escrowInfo = this.mapEscrowResult(result);
      this.setCacheEntry(cacheKey, escrowInfo);

      return this.successResponse(escrowInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update escrow details
   */
  async updateEscrow(escrowId: string, updates: EscrowUpdateRequest): Promise<EscrowResponse<EscrowInfo>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.UPDATE_ESCROW, {
          escrow_id: escrowId,
          description: updates.description ? sanitizeString(updates.description) : undefined,
          expires_at: updates.expiresAt,
          auto_release: updates.autoRelease,
          auto_release_delay: updates.autoReleaseDelay,
          metadata: updates.metadata,
        }, publicKey);
      }, this.config.maxRetries);

      const escrowInfo = this.mapEscrowResult(result);
      this.setCacheEntry(generateEscrowCacheKey(escrowId), escrowInfo);

      return this.successResponse(escrowInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Cancel an escrow
   */
  async cancelEscrow(escrowId: string): Promise<EscrowResponse<EscrowInfo>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const existingEscrow = await this.getEscrow(escrowId);
      if (existingEscrow.data && !canCancel(existingEscrow.data)) {
        return this.errorResponse(ERROR_CODES.ESCROW_INVALID_STATUS, 'Escrow cannot be cancelled in current status');
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.CANCEL_ESCROW, {
          escrow_id: escrowId,
        }, publicKey);
      }, this.config.maxRetries);

      const escrowInfo = this.mapEscrowResult(result);
      this.setCacheEntry(generateEscrowCacheKey(escrowId), escrowInfo);
      this.emitEvent('escrow_cancelled' as EscrowEventType, escrowId, { escrow: escrowInfo });

      return this.successResponse(escrowInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== PAYMENT OPERATIONS ====================

  /**
   * Deposit payment into escrow
   */
  async depositPayment(escrowId: string, amount: bigint): Promise<EscrowResponse<TransactionResult>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      if (!validateAmount(amount)) {
        return this.errorResponse(ERROR_CODES.INVALID_AMOUNT, 'Invalid deposit amount');
      }

      const existingEscrow = await this.getEscrow(escrowId);
      if (existingEscrow.data && !canDeposit(existingEscrow.data)) {
        return this.errorResponse(ERROR_CODES.ESCROW_INVALID_STATUS, 'Cannot deposit to escrow in current status');
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.DEPOSIT_PAYMENT, {
          escrow_id: escrowId,
          amount: amount.toString(),
        }, publicKey);
      }, this.config.maxRetries);

      this.invalidateCache(generateEscrowCacheKey(escrowId));
      this.emitEvent('payment_deposited' as EscrowEventType, escrowId, { amount: amount.toString() });

      return this.successResponse(this.mapTransactionResult(result));
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Release payment to seller
   */
  async releasePayment(escrowId: string): Promise<EscrowResponse<TransactionResult>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const existingEscrow = await this.getEscrow(escrowId);
      if (existingEscrow.data && !canRelease(existingEscrow.data)) {
        return this.errorResponse(ERROR_CODES.ESCROW_INVALID_STATUS, 'Cannot release payment in current status');
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.RELEASE_PAYMENT, {
          escrow_id: escrowId,
        }, publicKey);
      }, this.config.maxRetries);

      this.invalidateCache(generateEscrowCacheKey(escrowId));
      this.emitEvent('escrow_released' as EscrowEventType, escrowId, {});

      return this.successResponse(this.mapTransactionResult(result));
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Refund payment to buyer
   */
  async refundPayment(escrowId: string): Promise<EscrowResponse<TransactionResult>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const existingEscrow = await this.getEscrow(escrowId);
      if (existingEscrow.data && !canRefund(existingEscrow.data)) {
        return this.errorResponse(ERROR_CODES.ESCROW_INVALID_STATUS, 'Cannot refund payment in current status');
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.REFUND_PAYMENT, {
          escrow_id: escrowId,
        }, publicKey);
      }, this.config.maxRetries);

      this.invalidateCache(generateEscrowCacheKey(escrowId));
      this.emitEvent('escrow_refunded' as EscrowEventType, escrowId, {});

      return this.successResponse(this.mapTransactionResult(result));
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get payment status for an escrow
   */
  async getPaymentStatus(escrowId: string): Promise<EscrowResponse<PaymentStatusInfo>> {
    try {
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.GET_PAYMENT_STATUS, {
          escrow_id: escrowId,
        });
      }, this.config.maxRetries);

      return this.successResponse(this.mapPaymentStatus(result));
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== DISPUTE MANAGEMENT ====================

  /**
   * Create a dispute for an escrow
   */
  async createDispute(escrowId: string, reason: string): Promise<EscrowResponse<DisputeInfo>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const publicKey = await getPublicKey();
      const disputeRequest: CreateDisputeRequest = {
        escrowId,
        reason: sanitizeString(reason),
        disputant: publicKey,
      };

      const validation = validateDisputeRequest(disputeRequest);
      if (!validation.valid) {
        return this.errorResponse(ERROR_CODES.INVALID_INPUT, validation.errors.join('; '));
      }

      const existingEscrow = await this.getEscrow(escrowId);
      if (existingEscrow.data && !canDispute(existingEscrow.data)) {
        return this.errorResponse(ERROR_CODES.ESCROW_INVALID_STATUS, 'Cannot create dispute for escrow in current status');
      }

      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.CREATE_DISPUTE, {
          escrow_id: escrowId,
          reason: sanitizeString(reason),
        }, publicKey);
      }, this.config.maxRetries);

      const disputeInfo = this.mapDisputeResult(result);
      this.setCacheEntry(generateDisputeCacheKey(disputeInfo.id), disputeInfo);
      this.invalidateCache(generateEscrowCacheKey(escrowId));
      this.emitEvent('escrow_disputed' as EscrowEventType, escrowId, { dispute: disputeInfo });

      return this.successResponse(disputeInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get dispute details
   */
  async getDispute(disputeId: string): Promise<EscrowResponse<DisputeInfo>> {
    try {
      const cacheKey = generateDisputeCacheKey(disputeId);
      const cached = this.getCacheEntry<DisputeInfo>(cacheKey);
      if (cached) return this.successResponse(cached);

      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.GET_DISPUTE, { dispute_id: disputeId });
      }, this.config.maxRetries);

      const disputeInfo = this.mapDisputeResult(result);
      this.setCacheEntry(cacheKey, disputeInfo);

      return this.successResponse(disputeInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(disputeId: string, resolution: ResolveDisputeRequest): Promise<EscrowResponse<DisputeInfo>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.RESOLVE_DISPUTE, {
          dispute_id: disputeId,
          resolution: resolution.resolution,
          refund_amount: resolution.refundAmount?.toString(),
          seller_amount: resolution.sellerAmount?.toString(),
          reason: resolution.reason ? sanitizeString(resolution.reason) : '',
        }, publicKey);
      }, this.config.maxRetries);

      const disputeInfo = this.mapDisputeResult(result);
      this.setCacheEntry(generateDisputeCacheKey(disputeId), disputeInfo);
      this.emitEvent('dispute_resolved' as EscrowEventType, disputeInfo.escrowId, { dispute: disputeInfo });

      return this.successResponse(disputeInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get dispute status
   */
  async getDisputeStatus(disputeId: string): Promise<EscrowResponse<DisputeStatus>> {
    try {
      const dispute = await this.getDispute(disputeId);
      if (!dispute.success || !dispute.data) {
        return this.errorResponse(ERROR_CODES.DISPUTE_NOT_FOUND);
      }
      return this.successResponse(dispute.data.status);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== ARBITRATOR OPERATIONS ====================

  /**
   * Assign an arbitrator to an escrow
   */
  async assignArbitrator(escrowId: string, arbitratorAddress: string): Promise<EscrowResponse<ArbitratorInfo>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      if (!validateAddress(arbitratorAddress)) {
        return this.errorResponse(ERROR_CODES.INVALID_INPUT, 'Invalid arbitrator address');
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.ASSIGN_ARBITRATOR, {
          escrow_id: escrowId,
          arbitrator: arbitratorAddress,
        }, publicKey);
      }, this.config.maxRetries);

      const arbitratorInfo = this.mapArbitratorResult(result);
      this.setCacheEntry(generateArbitratorCacheKey(arbitratorAddress), arbitratorInfo);
      this.invalidateCache(generateEscrowCacheKey(escrowId));
      this.emitEvent('arbitrator_assigned' as EscrowEventType, escrowId, { arbitrator: arbitratorInfo });

      return this.successResponse(arbitratorInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get assigned arbitrator for an escrow
   */
  async getArbitrator(escrowId: string): Promise<EscrowResponse<ArbitratorInfo>> {
    try {
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.GET_ARBITRATOR, {
          escrow_id: escrowId,
        });
      }, this.config.maxRetries);

      return this.successResponse(this.mapArbitratorResult(result));
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Submit arbitrator decision on a dispute
   */
  async arbitratorDecision(disputeId: string, decision: ArbitratorDecision): Promise<EscrowResponse<DisputeInfo>> {
    try {
      if (!await isWalletConnected()) {
        return this.errorResponse(ERROR_CODES.WALLET_NOT_CONNECTED);
      }

      const publicKey = await getPublicKey();
      const result = await retryWithBackoff(async () => {
        return await this.callContract(CONTRACT_METHODS.ARBITRATOR_DECISION, {
          dispute_id: disputeId,
          resolution: decision.resolution,
          buyer_amount: decision.buyerAmount.toString(),
          seller_amount: decision.sellerAmount.toString(),
          reason: decision.reason ? sanitizeString(decision.reason) : '',
        }, publicKey);
      }, this.config.maxRetries);

      const disputeInfo = this.mapDisputeResult(result);
      this.invalidateCache(generateDisputeCacheKey(disputeId));

      return this.successResponse(disputeInfo);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Subscribe to escrow events
   */
  addEventListener(
    eventType: EscrowEventType,
    listener: EscrowEventListener,
    options?: EventListenerOptions,
  ): EventSubscription {
    const id = `listener_${++this.listenerIdCounter}`;
    const typeKey = String(eventType);

    if (!this.eventListeners.has(typeKey)) {
      this.eventListeners.set(typeKey, []);
    }

    this.eventListeners.get(typeKey)!.push({
      listener,
      options: options || {},
    });

    return {
      id,
      unsubscribe: () => {
        const listeners = this.eventListeners.get(typeKey);
        if (listeners) {
          const index = listeners.findIndex((l) => l.listener === listener);
          if (index !== -1) listeners.splice(index, 1);
        }
      },
    };
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.eventListeners.clear();
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate fees for an escrow amount
   */
  calculateFees(amount: bigint, includeArbitrator: boolean = false): {
    platformFee: bigint;
    arbitratorFee: bigint;
    totalFee: bigint;
    netAmount: bigint;
  } {
    const platformFee = calculatePlatformFee(amount);
    const arbitratorFee = includeArbitrator ? calculateArbitratorFee(amount) : BigInt(0);
    const totalFee = platformFee + arbitratorFee;
    return {
      platformFee,
      arbitratorFee,
      totalFee,
      netAmount: amount - totalFee,
    };
  }

  /**
   * Format an amount for display
   */
  formatAmount(amount: bigint, decimals?: number): string {
    return formatAmount(amount, decimals);
  }

  /**
   * Parse a display amount to bigint
   */
  parseAmount(amount: string, decimals?: number): bigint {
    return parseAmount(amount, decimals);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<EscrowResponse<HealthCheck>> {
    try {
      const walletConnected = await isWalletConnected();
      return this.successResponse({
        contractConnected: true,
        walletConnected,
        networkStatus: this.config.network,
        lastBlockTime: Date.now(),
        version: '1.0.0',
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ==================== PRIVATE HELPERS ====================

  private async callContract(method: string, params: Record<string, unknown>, signer?: string): Promise<unknown> {
    // Contract interaction abstraction - actual implementation depends on
    // the Soroban contract client setup
    throw new Error(`Contract call not implemented: ${method}`);
  }

  private mapEscrowResult(result: unknown): EscrowInfo {
    const data = result as Record<string, unknown>;
    return {
      id: String(data.id || ''),
      buyer: String(data.buyer || ''),
      seller: String(data.seller || ''),
      amount: BigInt(String(data.amount || '0')),
      depositedAmount: BigInt(String(data.deposited_amount || '0')),
      tokenAddress: String(data.token_address || ''),
      status: (data.status as EscrowStatus) || EscrowStatus.CREATED,
      description: String(data.description || ''),
      createdAt: Number(data.created_at || 0),
      updatedAt: Number(data.updated_at || 0),
      expiresAt: Number(data.expires_at || 0),
      autoRelease: Boolean(data.auto_release),
      autoReleaseDelay: Number(data.auto_release_delay || 0),
      arbitrator: data.arbitrator ? String(data.arbitrator) : undefined,
      disputeId: data.dispute_id ? String(data.dispute_id) : undefined,
      metadata: data.metadata as Record<string, unknown>,
    };
  }

  private mapDisputeResult(result: unknown): DisputeInfo {
    const data = result as Record<string, unknown>;
    return {
      id: String(data.id || ''),
      escrowId: String(data.escrow_id || ''),
      disputant: String(data.disputant || ''),
      respondent: String(data.respondent || ''),
      reason: String(data.reason || ''),
      status: (data.status as DisputeStatus) || DisputeStatus.OPEN,
      arbitrator: data.arbitrator ? String(data.arbitrator) : undefined,
      evidence: (data.evidence as any[]) || [],
      timeline: (data.timeline as any[]) || [],
      createdAt: Number(data.created_at || 0),
      updatedAt: Number(data.updated_at || 0),
      resolvedAt: data.resolved_at ? Number(data.resolved_at) : undefined,
      metadata: data.metadata as Record<string, unknown>,
    };
  }

  private mapArbitratorResult(result: unknown): ArbitratorInfo {
    const data = result as Record<string, unknown>;
    return {
      address: String(data.address || ''),
      name: String(data.name || ''),
      status: (data.status as any) || 'active',
      reputation: Number(data.reputation || 0),
      totalCases: Number(data.total_cases || 0),
      resolvedCases: Number(data.resolved_cases || 0),
      averageResolutionTime: Number(data.average_resolution_time || 0),
      specializations: (data.specializations as string[]) || [],
      feePercentage: Number(data.fee_percentage || 0),
      registeredAt: Number(data.registered_at || 0),
      lastActiveAt: Number(data.last_active_at || 0),
      metadata: data.metadata as Record<string, unknown>,
    };
  }

  private mapTransactionResult(result: unknown): TransactionResult {
    const data = result as Record<string, unknown>;
    return {
      hash: String(data.hash || ''),
      status: (data.status as 'success' | 'failed' | 'pending') || 'pending',
      blockNumber: data.block_number ? Number(data.block_number) : undefined,
      gasUsed: data.gas_used ? String(data.gas_used) : undefined,
      timestamp: Date.now(),
    };
  }

  private mapPaymentStatus(result: unknown): PaymentStatusInfo {
    const data = result as Record<string, unknown>;
    return {
      escrowId: String(data.escrow_id || ''),
      status: (data.status as EscrowStatus) || EscrowStatus.CREATED,
      totalAmount: BigInt(String(data.total_amount || '0')),
      depositedAmount: BigInt(String(data.deposited_amount || '0')),
      releasedAmount: BigInt(String(data.released_amount || '0')),
      refundedAmount: BigInt(String(data.refunded_amount || '0')),
      lastUpdated: Number(data.last_updated || Date.now()),
    };
  }

  private getCacheEntry<T>(key: string): T | null {
    if (!this.config.cacheEnabled) return null;
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry || isCacheExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCacheEntry<T>(key: string, data: T): void {
    if (!this.config.cacheEnabled) return;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTTL,
    });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  private emitEvent(type: EscrowEventType, escrowId: string, data: Record<string, unknown>): void {
    const event: EscrowEventData = {
      type,
      escrowId,
      timestamp: Date.now(),
      data,
    };

    const typeKey = String(type);
    const listeners = this.eventListeners.get(typeKey) || [];
    const toRemove: number[] = [];

    listeners.forEach((entry, index) => {
      if (entry.options.filter && !entry.options.filter(event)) return;
      entry.listener(event);
      if (entry.options.once) toRemove.push(index);
    });

    for (let i = toRemove.length - 1; i >= 0; i--) {
      listeners.splice(toRemove[i], 1);
    }
  }

  private successResponse<T>(data: T): EscrowResponse<T> {
    return {
      success: true,
      data,
      timestamp: Date.now(),
    };
  }

  private errorResponse<T>(errorCode: string, message?: string): EscrowResponse<T> {
    return {
      success: false,
      error: message || getErrorMessage(errorCode),
      errorCode,
      timestamp: Date.now(),
    };
  }

  private handleError<T>(error: unknown): EscrowResponse<T> {
    const errorCode = mapContractError(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return this.errorResponse(errorCode, message);
  }
}

export default PaymentEscrowService;
