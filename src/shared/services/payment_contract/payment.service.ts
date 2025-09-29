import { Client as ContractClient } from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';
import { 
  Client as PaymentContractClient,
  networks,
  PaymentError,
  DisputeError,
  RefundError,
  TransactionError
  // DisputeDecision will be imported from types
} from '../../../../packages/payment-contract/src/index';
import { 
  signTransaction, 
  getPublicKey, 
  isWalletConnected 
} from '../../utils/wallet';
import { 
  NETWORKS, 
  DEFAULT_CONFIG, 
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  FEE_CALCULATION,
  TIMEOUT_CONFIG
} from './constants/payment.constants';
import {
  validateAddress,
  validateAmount,
  validateRefundAmount,
  validateTokenId,
  validateString,
  sanitizeString,
  calculateFees,
  mapContractError,
  getErrorMessage,
  getErrorType,
  retryWithBackoff,
  generateCacheKey,
  isCacheExpired,
  bigIntToString,
  stringToBigInt,
  isValidI128,
  isValidTimestamp,
  isValidTransactionHash
} from './utils/payment.utils';
import {
  PaymentServiceConfig,
  NetworkConfig,
  PaymentResponse,
  TransactionResult,
  PaymentRequest,
  RefundRequest,
  DisputeRequest,
  PaymentStatus,
  DisputeStatus,
  PaymentHistory,
  DisputeInfo,
  BalanceInfo,
  DepositInfo,
  RefundInfo,
  AdminInfo,
  ContractUpgrade,
  PaymentErrorCode,
  DisputeErrorCode,
  RefundErrorCode,
  PaymentEventType,
  PaymentEventData,
  PaymentEventListener,
  EventListenerOptions,
  EventSubscription,
  HealthCheck,
  PerformanceMetrics,
  BatchOperationResult,
  BatchDepositParams,
  BatchRefundParams,
  PaymentFilter,
  DisputeFilter,
  PaymentSearchResult,
  TokenId,
  Address,
  ContractAddress,
  TransactionHash,
  DisputeId,
  PaymentId,
  RefundId,
  DisputeDecision
} from './types/payment.types';
import type {
  CreateDisputeRequest,
  ResolveDisputeRequest,
  UpdateDisputeRequest,
  DisputeEvidence,
  EvidenceType,
  DisputeTimelineEntry,
  DisputeTimelineType,
  ArbitratorInfo,
  DisputeStats,
  DisputeResolutionMetrics,
  DisputeCreationValidation,
  EvidenceValidation,
  ArbitratorValidation,
  DisputeSearchFilter,
  ArbitratorFilter,
  DisputeNotification,
  DisputeNotificationType,
  NotificationPriority,
  DisputeTemplate,
  DisputeCategory,
  DisputeAnalytics,
  AnalyticsPeriod,
  DisputeCategoryStats,
  ArbitratorPerformanceStats,
  DisputeTrendData,
  EscalationLevel,
  EscalationRequest,
  EscalationCriteria,
  DisputeFeedback,
  FeedbackCategory,
  FeedbackSummary,
  ExternalDisputeSystem,
  DisputeExportData,
  DisputeAutomationRule,
  AutomationCondition,
  AutomationAction
} from './types/dispute.types';

/**
 * Comprehensive TypeScript service layer for Payment Contract interactions
 */
export class PaymentService {
  private contract: PaymentContractClient;
  private networkConfig: NetworkConfig;
  private config: PaymentServiceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private eventListeners: Map<string, EventSubscription> = new Map();
  private isInitialized: boolean = false;
  private performanceMetrics: PerformanceMetrics = {
    averageResponseTime: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    cacheHitRate: 0,
    lastUpdated: Date.now()
  };

  constructor(config?: Partial<PaymentServiceConfig>) {
    this.config = {
      network: NETWORKS.testnet,
      timeoutInSeconds: DEFAULT_CONFIG.TIMEOUT_SECONDS,
      fee: DEFAULT_CONFIG.FEE,
      simulate: DEFAULT_CONFIG.SIMULATE,
      retryConfig: DEFAULT_CONFIG.RETRY,
      cache: DEFAULT_CONFIG.CACHE,
      monitoring: DEFAULT_CONFIG.MONITORING,
      ...config
    };
    
    this.networkConfig = this.config.network;
    this.contract = new PaymentContractClient({
      contractId: this.networkConfig.contractId,
      networkPassphrase: this.networkConfig.networkPassphrase,
      rpcUrl: this.networkConfig.rpcUrl,
    });
  }

  /**
   * Initialize the service with configuration
   */
  async initialize(config?: Partial<PaymentServiceConfig>): Promise<void> {
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
   * Initialize Payment Contract
   */
  async initializePaymentContract(admin: Address): Promise<PaymentResponse<TransactionResult>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const addressValidation = validateAddress(admin);
      if (!addressValidation.isValid) {
        return this.createErrorResponse(addressValidation.error!);
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
          type: PaymentEventType.CONTRACT_INITIALIZED,
          timestamp: Date.now(),
          admin: admin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'initializePaymentContract');
    }
  }

  /**
   * Get current admin address
   */
  async getAdmin(): Promise<PaymentResponse<Address>> {
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
   * Transfer admin rights to new address
   */
  async transferAdmin(newAdmin: Address): Promise<PaymentResponse<TransactionResult>> {
    try {
      const addressValidation = validateAddress(newAdmin);
      if (!addressValidation.isValid) {
        return this.createErrorResponse(addressValidation.error!);
      }

      const currentAdmin = await this.getCurrentAdmin();
      if (!currentAdmin) {
        return this.createErrorResponse('Current admin address not available');
      }

      const tx = await this.contract.transfer_admin({
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
          type: PaymentEventType.ADMIN_CHANGED,
          timestamp: Date.now(),
          admin: newAdmin,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'transferAdmin');
    }
  }

  /**
   * Upgrade contract with new WASM code
   */
  async upgradeContract(newWasmHash: Buffer): Promise<PaymentResponse<TransactionResult>> {
    try {
      if (!Buffer.isBuffer(newWasmHash)) {
        return this.createErrorResponse('Invalid WASM hash format');
      }

      const tx = await this.contract.upgrade({
        new_wasm_hash: newWasmHash
      }, {
        fee: this.config.fee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        this.emitEvent({
          type: PaymentEventType.CONTRACT_UPGRADED,
          timestamp: Date.now(),
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'upgradeContract');
    }
  }

  // ==================== PAYMENT PROCESSING & DEPOSITS ====================

  /**
   * Process payment deposit
   */
  async processDeposit(request: PaymentRequest): Promise<PaymentResponse<TransactionResult>> {
    try {
      // Validate input
      const validation = this.validatePaymentRequest(request);
      if (!validation.isValid) {
        return this.createErrorResponse(validation.errors.join(', '));
      }

      // Check if user has sufficient balance (this would typically be done off-chain)
      const feeCalculation = calculateFees('deposit');
      
      const tx = await this.contract.process_deposit({
        token_id: request.tokenId,
        signer: request.signer,
        to: request.to,
        amount_to_deposit: request.amount
      }, {
        fee: feeCalculation.totalFee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate relevant caches
        this.invalidateCache(CACHE_KEYS.BALANCE(request.tokenId));
        this.invalidateCache(CACHE_KEYS.PAYMENT_HISTORY(request.tokenId));

        this.emitEvent({
          type: PaymentEventType.DEPOSIT_PROCESSED,
          timestamp: Date.now(),
          tokenId: request.tokenId,
          amount: request.amount,
          from: request.signer,
          to: request.to,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'processDeposit');
    }
  }

  /**
   * Validate deposit amount
   */
  async validateDepositAmount(tokenId: TokenId, amount: bigint): Promise<PaymentResponse<boolean>> {
    try {
      const amountValidation = validateAmount(amount as any);
      if (!amountValidation.isValid) {
        return this.createErrorResponse(amountValidation.errors.join(', '));
      }

      // Additional validation could include checking against token limits, etc.
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error, 'validateDepositAmount');
    }
  }

  /**
   * Check available deposit balance
   */
  async checkDepositBalance(tokenId: TokenId): Promise<PaymentResponse<bigint>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.BALANCE(tokenId));
      if (cached) {
        return this.createSuccessResponse(cached.availableBalance);
      }

      // In a real implementation, this would query the contract for balance
      // For now, return a mock balance
      const balance = BigInt('1000000000000'); // Mock balance
      
      this.setCachedData(CACHE_KEYS.BALANCE(tokenId), {
        availableBalance: balance,
        lastUpdated: Date.now()
      });

      return this.createSuccessResponse(balance);
    } catch (error) {
      return this.handleError(error, 'checkDepositBalance');
    }
  }

  // ==================== REFUND PROCESSING ====================

  /**
   * Process refund
   */
  async processRefund(request: RefundRequest): Promise<PaymentResponse<TransactionResult>> {
    try {
      // Validate input
      const validation = this.validateRefundRequest(request);
      if (!validation.isValid) {
        return this.createErrorResponse(validation.errors.join(', '));
      }

      // Check refund eligibility
      const eligibility = await this.checkRefundEligibility(request.tokenId, request.to);
      if (!eligibility.success || !eligibility.data) {
        return this.createErrorResponse('Refund not eligible');
      }

      const feeCalculation = calculateFees('refund');
      
      const tx = await this.contract.process_refund({
        token_id: request.tokenId,
        signer: request.signer,
        to: request.to,
        refund_amount: request.refundAmount
      }, {
        fee: feeCalculation.totalFee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate relevant caches
        this.invalidateCache(CACHE_KEYS.BALANCE(request.tokenId));
        this.invalidateCache(CACHE_KEYS.PAYMENT_HISTORY(request.tokenId));
        this.invalidateCache(CACHE_KEYS.REFUND_ELIGIBILITY(request.tokenId, request.to));

        this.emitEvent({
          type: PaymentEventType.REFUND_PROCESSED,
          timestamp: Date.now(),
          tokenId: request.tokenId,
          amount: request.refundAmount,
          to: request.to,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'processRefund');
    }
  }

  /**
   * Validate refund amount against available balance
   */
  async validateRefundAmount(tokenId: TokenId, amount: bigint): Promise<PaymentResponse<boolean>> {
    try {
      const balanceResponse = await this.checkDepositBalance(tokenId);
      if (!balanceResponse.success) {
        return this.createErrorResponse('Failed to get balance');
      }

      const validation = validateRefundAmount(amount as any, balanceResponse.data as any);
      if (!validation.isValid) {
        return this.createErrorResponse(validation.error!);
      }

      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error, 'validateRefundAmount');
    }
  }

  /**
   * Check refund eligibility
   */
  async checkRefundEligibility(tokenId: TokenId, user: Address): Promise<PaymentResponse<boolean>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.REFUND_ELIGIBILITY(tokenId, user));
      if (cached !== null) {
        return this.createSuccessResponse(cached);
      }

      // In a real implementation, this would check contract state for refund eligibility
      // For now, return mock eligibility
      const isEligible = true;
      
      this.setCachedData(CACHE_KEYS.REFUND_ELIGIBILITY(tokenId, user), isEligible);
      return this.createSuccessResponse(isEligible);
    } catch (error) {
      return this.handleError(error, 'checkRefundEligibility');
    }
  }

  // ==================== DISPUTE RESOLUTION ====================

  /**
   * Resolve dispute
   */
  async resolveDispute(request: DisputeRequest): Promise<PaymentResponse<TransactionResult>> {
    try {
      // Validate input
      const validation = this.validateDisputeRequest(request);
      if (!validation.isValid) {
        return this.createErrorResponse(validation.errors.join(', '));
      }

      const feeCalculation = calculateFees('dispute');
      
      const tx = await this.contract.resolve_dispute({
        token_id: request.tokenId,
        arbitrator: request.arbitrator,
        buyer: request.buyer,
        seller: request.seller,
        refund_amount: request.refundAmount,
        decision: request.decision
      }, {
        fee: feeCalculation.totalFee,
        timeoutInSeconds: this.config.timeoutInSeconds,
        simulate: this.config.simulate
      });

      const result = await this.signAndSendTransaction(tx);
      
      if (result.success) {
        // Invalidate relevant caches
        this.invalidateCache(CACHE_KEYS.DISPUTE_STATUS(request.tokenId));

        this.emitEvent({
          type: PaymentEventType.DISPUTE_RESOLVED,
          timestamp: Date.now(),
          tokenId: request.tokenId,
          disputeId: request.tokenId, // In real implementation, this would be the actual dispute ID
          disputeStatus: DisputeStatus.RESOLVED,
          transactionHash: result.hash
        });
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'resolveDispute');
    }
  }

  /**
   * Create new dispute
   */
  async createDispute(request: CreateDisputeRequest): Promise<PaymentResponse<DisputeId>> {
    try {
      // Validate input
      const validation = this.validateDisputeCreationRequest(request);
      if (!validation.isValid) {
        return this.createErrorResponse(validation.errors.join(', '));
      }

      // In a real implementation, this would call a create_dispute method on the contract
      // For now, generate a mock dispute ID
      const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.emitEvent({
        type: PaymentEventType.DISPUTE_CREATED,
        timestamp: Date.now(),
        tokenId: request.tokenId,
        disputeId: disputeId,
        disputeStatus: DisputeStatus.OPEN
      });

      return this.createSuccessResponse(disputeId);
    } catch (error) {
      return this.handleError(error, 'createDispute');
    }
  }

  /**
   * Get dispute status
   */
  async getDisputeStatus(tokenId: TokenId): Promise<PaymentResponse<DisputeStatus>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.DISPUTE_STATUS(tokenId));
      if (cached !== null) {
        return this.createSuccessResponse(cached);
      }

      // In a real implementation, this would query the contract for dispute status
      // For now, return mock status
      const status = DisputeStatus.OPEN;
      
      this.setCachedData(CACHE_KEYS.DISPUTE_STATUS(tokenId), status);
      return this.createSuccessResponse(status);
    } catch (error) {
      return this.handleError(error, 'getDisputeStatus');
    }
  }

  // ==================== BALANCE AND HISTORY MANAGEMENT ====================

  /**
   * Get available balance for a token
   */
  async getAvailableBalance(tokenId: TokenId): Promise<PaymentResponse<bigint>> {
    try {
      const balanceResponse = await this.checkDepositBalance(tokenId);
      return balanceResponse;
    } catch (error) {
      return this.handleError(error, 'getAvailableBalance');
    }
  }

  /**
   * Get payment history for a token
   */
  async getPaymentHistory(tokenId: TokenId, filter?: PaymentFilter): Promise<PaymentResponse<PaymentHistory[]>> {
    try {
      const cached = this.getCachedData(CACHE_KEYS.PAYMENT_HISTORY(tokenId));
      if (cached && !this.shouldRefreshCache(cached.timestamp, TIMEOUT_CONFIG.HISTORY_CACHE_TTL)) {
        let history = cached.data;
        
        // Apply filters if provided
        if (filter) {
          history = this.applyPaymentFilters(history, filter);
        }
        
        return this.createSuccessResponse(history);
      }

      // In a real implementation, this would query the contract for payment history
      // For now, return mock history
      const history: PaymentHistory[] = [
        {
          id: 'payment_1',
          tokenId,
          from: 'GABC123...',
          to: 'GDEF456...',
          amount: BigInt('1000000000') as any,
          status: PaymentStatus.COMPLETED,
          timestamp: Date.now() - 86400000,
          transactionHash: 'abc123def456...',
          description: 'Payment for services'
        }
      ];

      this.setCachedData(CACHE_KEYS.PAYMENT_HISTORY(tokenId), history);
      
      // Apply filters if provided
      const filteredHistory = filter ? this.applyPaymentFilters(history, filter) : history;
      
      return this.createSuccessResponse(filteredHistory);
    } catch (error) {
      return this.handleError(error, 'getPaymentHistory');
    }
  }

  /**
   * Check if payment is complete
   */
  async isPaymentComplete(tokenId: TokenId): Promise<PaymentResponse<boolean>> {
    try {
      const historyResponse = await this.getPaymentHistory(tokenId);
      if (!historyResponse.success || !historyResponse.data) {
        return this.createErrorResponse('Failed to get payment history');
      }

      const hasCompletedPayment = historyResponse.data.some(
        payment => payment.status === PaymentStatus.COMPLETED
      );

      return this.createSuccessResponse(hasCompletedPayment);
    } catch (error) {
      return this.handleError(error, 'isPaymentComplete');
    }
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Process multiple deposits in batch
   */
  async processBatchDeposits(params: BatchDepositParams): Promise<PaymentResponse<BatchOperationResult<PaymentRequest>>> {
    try {
      const maxBatchSize = params.maxBatchSize || VALIDATION.MAX_BATCH_SIZE;
      
      if (params.deposits.length > maxBatchSize) {
        return this.createErrorResponse(`Batch size exceeds maximum of ${maxBatchSize}`);
      }

      const results: BatchOperationResult<PaymentRequest> = {
        successful: [],
        failed: [],
        totalProcessed: 0,
        successRate: 0
      };

      for (const deposit of params.deposits) {
        try {
          const result = await this.processDeposit(deposit);
          if (result.success) {
            results.successful.push(deposit);
          } else {
            results.failed.push({
              item: deposit,
              error: result.error || 'Unknown error',
              errorCode: result.errorCode
            });
          }
        } catch (error) {
          results.failed.push({
            item: deposit,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        results.totalProcessed++;
        
        // Break on error if continueOnError is false
        if (!params.continueOnError && results.failed.length > 0) {
          break;
        }
      }

      results.successRate = results.totalProcessed > 0 ? 
        results.successful.length / results.totalProcessed : 0;

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.handleError(error, 'processBatchDeposits');
    }
  }

  /**
   * Process multiple refunds in batch
   */
  async processBatchRefunds(params: BatchRefundParams): Promise<PaymentResponse<BatchOperationResult<RefundRequest>>> {
    try {
      const maxBatchSize = params.maxBatchSize || VALIDATION.MAX_BATCH_SIZE;
      
      if (params.refunds.length > maxBatchSize) {
        return this.createErrorResponse(`Batch size exceeds maximum of ${maxBatchSize}`);
      }

      const results: BatchOperationResult<RefundRequest> = {
        successful: [],
        failed: [],
        totalProcessed: 0,
        successRate: 0
      };

      for (const refund of params.refunds) {
        try {
          const result = await this.processRefund(refund);
          if (result.success) {
            results.successful.push(refund);
          } else {
            results.failed.push({
              item: refund,
              error: result.error || 'Unknown error',
              errorCode: result.errorCode
            });
          }
        } catch (error) {
          results.failed.push({
            item: refund,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        results.totalProcessed++;
        
        // Break on error if continueOnError is false
        if (!params.continueOnError && results.failed.length > 0) {
          break;
        }
      }

      results.successRate = results.totalProcessed > 0 ? 
        results.successful.length / results.totalProcessed : 0;

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.handleError(error, 'processBatchRefunds');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format amount with decimals and symbol
   */
  formatAmount(amount: bigint, decimals: number = 7, symbol?: string): string {
    const formatted = this.formatAmountInternal(amount, decimals, symbol);
    return formatted.formatted;
  }

  /**
   * Validate Stellar address
   */
  validateAddress(address: string): boolean {
    const validation = validateAddress(address);
    return validation.isValid;
  }

  /**
   * Calculate transaction fees
   */
  calculateFees(operationType: 'deposit' | 'refund' | 'dispute' | 'admin' | 'simple'): number {
    const calculation = calculateFees(operationType);
    return calculation.totalFee;
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Add event listener
   */
  addEventListener(
    eventTypes: PaymentEventType[],
    listener: PaymentEventListener,
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
  removeEventListener(subscriptionId: string): boolean {
    return this.eventListeners.delete(subscriptionId);
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: PaymentEventData): void {
    for (const subscription of this.eventListeners.values()) {
      if (!subscription.active) continue;
      
      if (subscription.eventTypes.includes(event.type)) {
        // Apply filters
        if (subscription.options?.tokenId && event.tokenId !== subscription.options.tokenId) {
          continue;
        }
        
        if (subscription.options?.from && event.from !== subscription.options.from) {
          continue;
        }
        
        if (subscription.options?.to && event.to !== subscription.options.to) {
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

  // ==================== HEALTH CHECK & MONITORING ====================

  /**
   * Perform health check
   */
  async healthCheck(): Promise<HealthCheck> {
    const startTime = Date.now();
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
      await this.getAdmin();
      contractConnected = true;
    } catch (error) {
      errors.push(`Contract connection failed: ${error}`);
    }

    try {
      // Check network connection
      const response = await fetch(this.networkConfig.rpcUrl, { method: 'POST' });
      networkConnected = response.ok;
      if (!networkConnected) {
        errors.push('Network connection failed');
      }
    } catch (error) {
      errors.push(`Network connection failed: ${error}`);
    }

    const responseTime = Date.now() - startTime;

    return {
      isHealthy: errors.length === 0,
      contractConnected,
      networkConnected,
      walletConnected,
      errors,
      timestamp: Date.now(),
      responseTime
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      averageResponseTime: 0,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      cacheHitRate: 0,
      lastUpdated: Date.now()
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Get current admin address (helper method)
   */
  private async getCurrentAdmin(): Promise<Address | null> {
    const adminResponse = await this.getAdmin();
    return adminResponse.success && adminResponse.data ? adminResponse.data : null;
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
    
    this.performanceMetrics.lastUpdated = Date.now();
  }

  /**
   * Format amount internally
   */
  private formatAmountInternal(amount: bigint, decimals: number = 7, symbol?: string) {
    const divisor = BigInt(10 ** decimals);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    let formatted: string;
    
    if (fractionalPart === 0n) {
      formatted = wholePart.toString();
    } else {
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      const trimmedFractional = fractionalStr.replace(/0+$/, '');
      formatted = trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
    }
    
    if (symbol) {
      formatted = `${formatted} ${symbol}`;
    }
    
    return {
      raw: amount,
      formatted,
      decimals,
      symbol
    };
  }

  /**
   * Apply payment filters
   */
  private applyPaymentFilters(history: PaymentHistory[], filter: PaymentFilter): PaymentHistory[] {
    return history.filter(payment => {
      if (filter.tokenId && payment.tokenId !== filter.tokenId) return false;
      if (filter.from && payment.from !== filter.from) return false;
      if (filter.to && payment.to !== filter.to) return false;
      if (filter.status && !filter.status.includes(payment.status)) return false;
      if (filter.minAmount && payment.amount < filter.minAmount) return false;
      if (filter.maxAmount && payment.amount > filter.maxAmount) return false;
      if (filter.startDate && payment.timestamp < filter.startDate) return false;
      if (filter.endDate && payment.timestamp > filter.endDate) return false;
      
      return true;
    }).slice(filter.offset || 0, (filter.offset || 0) + (filter.limit || 100));
  }

  /**
   * Should refresh cache
   */
  private shouldRefreshCache(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const tokenValidation = validateTokenId(request.tokenId);
    if (!tokenValidation.isValid) {
      errors.push(...tokenValidation.errors);
    }

    const signerValidation = validateAddress(request.signer);
    if (!signerValidation.isValid) {
      errors.push(`Invalid signer address: ${signerValidation.error}`);
    }

    const toValidation = validateAddress(request.to);
    if (!toValidation.isValid) {
      errors.push(`Invalid recipient address: ${toValidation.error}`);
    }

    const amountValidation = validateAmount(request.amount);
    if (!amountValidation.isValid) {
      errors.push(...amountValidation.errors);
    }

    if (request.description) {
      const descriptionValidation = validateString(request.description, 'Description', VALIDATION.MAX_DESCRIPTION_LENGTH);
      if (!descriptionValidation.isValid) {
        errors.push(...descriptionValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate refund request
   */
  private validateRefundRequest(request: RefundRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const tokenValidation = validateTokenId(request.tokenId);
    if (!tokenValidation.isValid) {
      errors.push(...tokenValidation.errors);
    }

    const signerValidation = validateAddress(request.signer);
    if (!signerValidation.isValid) {
      errors.push(`Invalid signer address: ${signerValidation.error}`);
    }

    const toValidation = validateAddress(request.to);
    if (!toValidation.isValid) {
      errors.push(`Invalid recipient address: ${toValidation.error}`);
    }

    const amountValidation = validateAmount(request.refundAmount);
    if (!amountValidation.isValid) {
      errors.push(...amountValidation.errors);
    }

    if (request.reason) {
      const reasonValidation = validateString(request.reason, 'Reason', VALIDATION.MAX_REASON_LENGTH);
      if (!reasonValidation.isValid) {
        errors.push(...reasonValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate dispute request
   */
  private validateDisputeRequest(request: DisputeRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const tokenValidation = validateTokenId(request.tokenId);
    if (!tokenValidation.isValid) {
      errors.push(...tokenValidation.errors);
    }

    const arbitratorValidation = validateAddress(request.arbitrator);
    if (!arbitratorValidation.isValid) {
      errors.push(`Invalid arbitrator address: ${arbitratorValidation.error}`);
    }

    const buyerValidation = validateAddress(request.buyer);
    if (!buyerValidation.isValid) {
      errors.push(`Invalid buyer address: ${buyerValidation.error}`);
    }

    const sellerValidation = validateAddress(request.seller);
    if (!sellerValidation.isValid) {
      errors.push(`Invalid seller address: ${sellerValidation.error}`);
    }

    const amountValidation = validateAmount(request.refundAmount);
    if (!amountValidation.isValid) {
      errors.push(...amountValidation.errors);
    }

    if (!Object.values(DisputeDecision).includes(request.decision)) {
      errors.push('Invalid dispute decision');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate dispute creation request
   */
  private validateDisputeCreationRequest(request: CreateDisputeRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const tokenValidation = validateTokenId(request.tokenId);
    if (!tokenValidation.isValid) {
      errors.push(...tokenValidation.errors);
    }

    const buyerValidation = validateAddress(request.buyer);
    if (!buyerValidation.isValid) {
      errors.push(`Invalid buyer address: ${buyerValidation.error}`);
    }

    const sellerValidation = validateAddress(request.seller);
    if (!sellerValidation.isValid) {
      errors.push(`Invalid seller address: ${sellerValidation.error}`);
    }

    const reasonValidation = validateString(request.reason, 'Reason', VALIDATION.MAX_REASON_LENGTH);
    if (!reasonValidation.isValid) {
      errors.push(...reasonValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
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
  clearCache(): void {
    this.cache.clear();
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Handle errors and return standardized response
   */
  private handleError(error: any, operation: string): PaymentResponse<any> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = getErrorType(error);
    
    this.emitEvent({
      type: PaymentEventType.ERROR,
      timestamp: Date.now(),
      error: errorMessage,
      operation
    });
    
    return this.createErrorResponse(errorMessage, errorType);
  }

  /**
   * Create success response
   */
  private createSuccessResponse<T>(data: T): PaymentResponse<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: string, errorCode?: PaymentErrorCode): PaymentResponse<any> {
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
  destroy(): void {
    this.eventListeners.clear();
    this.cache.clear();
    this.isInitialized = false;
  }
}
