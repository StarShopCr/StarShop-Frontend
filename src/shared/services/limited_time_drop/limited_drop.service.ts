import {
  Client as LimitedTimeDropContractClient,
  type Drop as ContractDrop
} from '../../../../packages/limited_time_drop/src/index';
import type { u32 } from '@stellar/stellar-sdk';
import { signTransaction, getPublicKey, isWalletConnected } from '../../utils/wallet';
import {
  CACHE_KEYS,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  NETWORKS,
  VALIDATION
} from './constants/drop.constants';
import {
  calculateParticipationMetrics,
  evaluateAccess,
  fromContractDrop,
  fromContractPurchaseRecord,
  getDropStatusSummary,
  getDropTimeRemaining,
  getErrorType,
  isValidDropId,
  isValidQuantity,
  isValidStellarAddress,
  retryWithBackoff,
  sanitizeString,
  toContractDropStatus,
  toContractUserLevel,
  validateDropConfig
} from './utils/drop.utils';
import type {
  BatchOperationResult,
  Drop,
  DropConfig,
  DropId,
  DropParticipationMetrics,
  DropStatusSummary,
  DropTimeRemaining,
  DropUpdate,
  EventListenerOptions,
  EventSubscription,
  HealthCheck,
  LimitedDropEventData,
  LimitedDropEventListener,
  LimitedDropResponse,
  LimitedDropServiceConfig,
  NetworkConfig,
  ParticipationOptions,
  PerformanceMetrics,
  PurchaseRecord,
  TransactionResult,
  UserAddress
} from './types/drop.types';
import { DropLifecycleStatus, LimitedDropEventType } from './types/drop.types';
import type {
  AccessCheckResult,
  AccessGrantRequest,
  AccessList,
  AccessRevokeRequest,
  UserLevelUpdateRequest
} from './types/access.types';

export class LimitedTimeDropService {
  private contract: LimitedTimeDropContractClient;
  private networkConfig: NetworkConfig;
  private config: LimitedDropServiceConfig;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private eventListeners: Map<string, EventSubscription> = new Map();
  private isInitialized = false;
  private performanceMetrics: PerformanceMetrics = {
    averageResponseTime: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    cacheHitRate: 0,
    lastUpdated: Date.now()
  };

  constructor(config?: Partial<LimitedDropServiceConfig>) {
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
    this.contract = new LimitedTimeDropContractClient({
      contractId: this.networkConfig.contractId,
      networkPassphrase: this.networkConfig.networkPassphrase,
      rpcUrl: this.networkConfig.rpcUrl
    });
  }

  async initialize(config?: Partial<LimitedDropServiceConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
      this.networkConfig = this.config.network;
      this.contract = new LimitedTimeDropContractClient({
        contractId: this.networkConfig.contractId,
        networkPassphrase: this.networkConfig.networkPassphrase,
        rpcUrl: this.networkConfig.rpcUrl
      });
    }

    this.isInitialized = true;
  }

  async initializeContract(admin?: UserAddress): Promise<LimitedDropResponse<TransactionResult<void>>> {
    try {
      const adminAddress = await this.resolveSigner(admin);
      if (!isValidStellarAddress(adminAddress)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_ADMIN);
      }

      const tx = await this.contract.initialize(
        { admin: adminAddress },
        this.transactionOptions()
      );
      const result = await this.signAndSendTransaction<void>(tx);

      if (result.success) {
        this.isInitialized = true;
        this.emitEvent({
          type: LimitedDropEventType.CONTRACT_INITIALIZED,
          timestamp: Date.now(),
          admin: adminAddress,
          transactionHash: result.hash
        });
        return this.createSuccessResponse(result);
      }

      return this.createErrorResponse(result.error || 'Failed to initialize limited time drop contract');
    } catch (error) {
      return this.handleError(error, 'initializeContract');
    }
  }

  async createDrop(config: DropConfig): Promise<LimitedDropResponse<DropId>> {
    try {
      const validation = validateDropConfig(config);
      if (!validation.isValid) {
        return this.createErrorResponse(validation.errors.join('; '));
      }

      const creator = await this.resolveSigner(config.creator);
      if (!isValidStellarAddress(creator)) {
        return this.createErrorResponse('Invalid creator address format');
      }

      const tx = await this.contract.create_drop(
        {
          creator,
          title: sanitizeString(config.title, VALIDATION.DROP.TITLE_MAX_LENGTH),
          product_id: config.productId,
          max_supply: config.maxSupply,
          start_time: config.startTime,
          end_time: config.endTime,
          price: config.price,
          per_user_limit: config.perUserLimit,
          image_uri: sanitizeString(config.imageUri || '', VALIDATION.DROP.IMAGE_URI_MAX_LENGTH)
        },
        this.transactionOptions()
      );
      const result = await this.signAndSendTransaction<DropId>(tx);

      if (!result.success) {
        return this.createErrorResponse(result.error || 'Failed to create drop');
      }

      const dropId = result.data;
      this.emitEvent({
        type: LimitedDropEventType.DROP_CREATED,
        timestamp: Date.now(),
        dropId,
        user: creator,
        transactionHash: result.hash
      });

      return this.createSuccessResponse(dropId as DropId);
    } catch (error) {
      return this.handleError(error, 'createDrop');
    }
  }

  async getDrop(dropId: DropId): Promise<LimitedDropResponse<Drop>> {
    try {
      if (!isValidDropId(dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      const cacheKey = CACHE_KEYS.DROP(dropId);
      const cached = this.getCachedData<Drop>(cacheKey);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const drop = await this.fetchDrop(dropId);
      this.setCachedData(cacheKey, drop);
      return this.createSuccessResponse(drop);
    } catch (error) {
      return this.handleError(error, 'getDrop');
    }
  }

  async updateDrop(dropId: DropId, updates: DropUpdate): Promise<LimitedDropResponse<TransactionResult<void>>> {
    try {
      if (!isValidDropId(dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      if (!updates.status) {
        return this.createErrorResponse(ERROR_MESSAGES.UNSUPPORTED_DROP_UPDATE);
      }

      const admin = await this.resolveSigner(updates.admin);
      if (!isValidStellarAddress(admin)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_ADMIN);
      }

      const tx = await this.contract.update_status(
        {
          admin,
          drop_id: dropId,
          status: toContractDropStatus(updates.status)
        },
        this.transactionOptions()
      );
      const result = await this.signAndSendTransaction<void>(tx);

      if (!result.success) {
        return this.createErrorResponse(result.error || 'Failed to update drop');
      }

      this.invalidateDropCache(dropId);
      this.emitEvent({
        type: LimitedDropEventType.DROP_UPDATED,
        timestamp: Date.now(),
        dropId,
        admin,
        status: updates.status,
        transactionHash: result.hash
      });

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'updateDrop');
    }
  }

  async cancelDrop(dropId: DropId, admin?: UserAddress): Promise<LimitedDropResponse<TransactionResult<void>>> {
    const result = await this.updateDrop(dropId, {
      admin,
      status: DropLifecycleStatus.CANCELLED
    });

    if (result.success) {
      this.emitEvent({
        type: LimitedDropEventType.DROP_CANCELLED,
        timestamp: Date.now(),
        dropId,
        admin,
        transactionHash: result.data?.hash
      });
    }

    return result;
  }

  async checkAccess(dropId: DropId, user: UserAddress): Promise<LimitedDropResponse<AccessCheckResult>> {
    try {
      if (!isValidDropId(dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      const cacheKey = CACHE_KEYS.ACCESS(user, dropId);
      const cached = this.getCachedData<AccessCheckResult>(cacheKey);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const drop = await this.fetchDrop(dropId);
      const access = evaluateAccess(drop, user);
      this.setCachedData(cacheKey, access);

      return this.createSuccessResponse(access);
    } catch (error) {
      return this.handleError(error, 'checkAccess');
    }
  }

  async grantAccess(
    dropIdOrRequest: DropId | AccessGrantRequest,
    user?: UserAddress,
    admin?: UserAddress
  ): Promise<LimitedDropResponse<TransactionResult<void>>> {
    try {
      const request: AccessGrantRequest = typeof dropIdOrRequest === 'object'
        ? dropIdOrRequest
        : { dropId: dropIdOrRequest, user: user ?? '', admin };

      if (!isValidDropId(request.dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      if (!isValidStellarAddress(request.user)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_USER);
      }

      const adminAddress = await this.resolveSigner(request.admin);
      if (!isValidStellarAddress(adminAddress)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_ADMIN);
      }

      const tx = await this.contract.add_to_whitelist(
        {
          admin: adminAddress,
          user: request.user
        },
        this.transactionOptions()
      );
      const result = await this.signAndSendTransaction<void>(tx);

      if (!result.success) {
        return this.createErrorResponse(result.error || 'Failed to grant access');
      }

      if (request.level) {
        await this.updateUserLevel({ admin: adminAddress, user: request.user, level: request.level });
      }

      this.invalidateAccessCache(request.dropId, request.user);
      this.emitEvent({
        type: LimitedDropEventType.ACCESS_GRANTED,
        timestamp: Date.now(),
        dropId: request.dropId,
        user: request.user,
        admin: adminAddress,
        transactionHash: result.hash
      });

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'grantAccess');
    }
  }

  async revokeAccess(
    dropIdOrRequest: DropId | AccessRevokeRequest,
    user?: UserAddress,
    admin?: UserAddress
  ): Promise<LimitedDropResponse<TransactionResult<void>>> {
    try {
      const request: AccessRevokeRequest = typeof dropIdOrRequest === 'object'
        ? dropIdOrRequest
        : { dropId: dropIdOrRequest, user: user ?? '', admin };

      if (!isValidDropId(request.dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      if (!isValidStellarAddress(request.user)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_USER);
      }

      const adminAddress = await this.resolveSigner(request.admin);
      if (!isValidStellarAddress(adminAddress)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_ADMIN);
      }

      const tx = await this.contract.remove_from_whitelist(
        {
          admin: adminAddress,
          user: request.user
        },
        this.transactionOptions()
      );
      const result = await this.signAndSendTransaction<void>(tx);

      if (!result.success) {
        return this.createErrorResponse(result.error || 'Failed to revoke access');
      }

      this.invalidateAccessCache(request.dropId, request.user);
      this.emitEvent({
        type: LimitedDropEventType.ACCESS_REVOKED,
        timestamp: Date.now(),
        dropId: request.dropId,
        user: request.user,
        admin: adminAddress,
        transactionHash: result.hash
      });

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'revokeAccess');
    }
  }

  async getAccessList(dropId: DropId): Promise<LimitedDropResponse<AccessList>> {
    try {
      if (!isValidDropId(dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      const cacheKey = CACHE_KEYS.BUYER_LIST(dropId);
      const cached = this.getCachedData<AccessList>(cacheKey);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_buyer_list({ drop_id: dropId });
      const result = await tx.simulate();
      const users = result.result;
      const accessList: AccessList = {
        dropId,
        users,
        total: users.length as u32,
        source: 'contract_buyers'
      };

      this.setCachedData(cacheKey, accessList);
      return this.createSuccessResponse(accessList);
    } catch (error) {
      return this.handleError(error, 'getAccessList');
    }
  }

  async participateInDrop(
    dropId: DropId,
    options: ParticipationOptions = {}
  ): Promise<LimitedDropResponse<TransactionResult<void>>> {
    try {
      if (!isValidDropId(dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      const quantity = options.quantity ?? 1;
      if (!isValidQuantity(quantity)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_QUANTITY);
      }

      const buyer = await this.resolveSigner(options.buyer);
      if (!isValidStellarAddress(buyer)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_USER);
      }

      const access = await this.checkAccess(dropId, buyer);
      if (!access.success || !access.data?.hasAccess) {
        return this.createErrorResponse(access.data?.reason || access.error || 'User cannot access this drop');
      }

      const tx = await this.contract.purchase(
        {
          buyer,
          drop_id: dropId,
          quantity
        },
        this.transactionOptions()
      );
      const result = await this.signAndSendTransaction<void>(tx);

      if (!result.success) {
        return this.createErrorResponse(result.error || 'Failed to participate in drop');
      }

      this.invalidateDropCache(dropId);
      this.emitEvent({
        type: LimitedDropEventType.USER_PARTICIPATED,
        timestamp: Date.now(),
        dropId,
        user: buyer,
        transactionHash: result.hash
      });

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'participateInDrop');
    }
  }

  async trackParticipation(dropId: DropId): Promise<LimitedDropResponse<DropParticipationMetrics>> {
    try {
      if (!isValidDropId(dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      const cacheKey = CACHE_KEYS.DROP_PURCHASES(dropId);
      const cached = this.getCachedData<DropParticipationMetrics>(cacheKey);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const drop = await this.fetchDrop(dropId);
      const purchasesTx = await this.contract.get_drop_purchases({ drop_id: dropId });
      const buyersTx = await this.contract.get_buyer_list({ drop_id: dropId });
      const [purchasesResult, buyersResult] = await Promise.all([
        purchasesTx.simulate(),
        buyersTx.simulate()
      ]);

      const metrics = calculateParticipationMetrics(
        drop,
        purchasesResult.result,
        buyersResult.result.length as u32
      );
      this.setCachedData(cacheKey, metrics);

      return this.createSuccessResponse(metrics);
    } catch (error) {
      return this.handleError(error, 'trackParticipation');
    }
  }

  async getDropStatus(dropId: DropId): Promise<LimitedDropResponse<DropStatusSummary>> {
    try {
      const drop = await this.fetchDrop(dropId);
      return this.createSuccessResponse(getDropStatusSummary(drop));
    } catch (error) {
      return this.handleError(error, 'getDropStatus');
    }
  }

  async isDropActive(dropId: DropId): Promise<LimitedDropResponse<boolean>> {
    const status = await this.getDropStatus(dropId);
    if (!status.success) {
      return this.createErrorResponse(status.error || 'Failed to get drop status');
    }

    return this.createSuccessResponse(Boolean(status.data?.isActive));
  }

  async getTimeRemaining(dropId: DropId): Promise<LimitedDropResponse<DropTimeRemaining>> {
    try {
      const drop = await this.fetchDrop(dropId);
      return this.createSuccessResponse(getDropTimeRemaining(drop));
    } catch (error) {
      return this.handleError(error, 'getTimeRemaining');
    }
  }

  async extendDrop(
    dropId: DropId,
    durationSeconds: number | bigint,
    admin?: UserAddress
  ): Promise<LimitedDropResponse<TransactionResult<void>>> {
    void dropId;
    void durationSeconds;
    void admin;
    return this.createErrorResponse(ERROR_MESSAGES.UNSUPPORTED_DROP_EXTENSION);
  }

  async updateUserLevel(request: UserLevelUpdateRequest): Promise<LimitedDropResponse<TransactionResult<void>>> {
    try {
      if (!isValidStellarAddress(request.user)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_USER);
      }

      const adminAddress = await this.resolveSigner(request.admin);
      if (!isValidStellarAddress(adminAddress)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_ADMIN);
      }

      const tx = await this.contract.set_user_level(
        {
          admin: adminAddress,
          user: request.user,
          level: toContractUserLevel(request.level)
        },
        this.transactionOptions()
      );
      const result = await this.signAndSendTransaction<void>(tx);

      if (!result.success) {
        return this.createErrorResponse(result.error || 'Failed to update user level');
      }

      this.emitEvent({
        type: LimitedDropEventType.USER_LEVEL_UPDATED,
        timestamp: Date.now(),
        user: request.user,
        admin: adminAddress,
        transactionHash: result.hash
      });

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error, 'updateUserLevel');
    }
  }

  async getPurchaseHistory(user: UserAddress, dropId: DropId): Promise<LimitedDropResponse<PurchaseRecord[]>> {
    try {
      if (!isValidStellarAddress(user)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_USER);
      }

      if (!isValidDropId(dropId)) {
        return this.createErrorResponse(ERROR_MESSAGES.INVALID_DROP_ID);
      }

      const cacheKey = CACHE_KEYS.PURCHASE_HISTORY(user, dropId);
      const cached = this.getCachedData<PurchaseRecord[]>(cacheKey);
      if (cached) {
        return this.createSuccessResponse(cached);
      }

      const tx = await this.contract.get_purchase_history({ user, drop_id: dropId });
      const result = await tx.simulate();
      const records = result.result.map(fromContractPurchaseRecord);

      this.setCachedData(cacheKey, records);
      return this.createSuccessResponse(records);
    } catch (error) {
      return this.handleError(error, 'getPurchaseHistory');
    }
  }

  async batchCheckAccess(dropId: DropId, users: UserAddress[]): Promise<LimitedDropResponse<BatchOperationResult<AccessCheckResult>>> {
    const successful: AccessCheckResult[] = [];
    const failed: Array<{ input: unknown; error: string }> = [];

    for (const user of users) {
      const result = await this.checkAccess(dropId, user);
      if (result.success && result.data) {
        successful.push(result.data);
      } else {
        failed.push({ input: user, error: result.error || 'Unknown access check error' });
      }
    }

    return this.createSuccessResponse({
      successful,
      failed,
      totalProcessed: users.length
    });
  }

  async performHealthCheck(): Promise<HealthCheck> {
    const errors: string[] = [];

    try {
      if (!this.networkConfig.contractId || !this.networkConfig.networkPassphrase || !this.networkConfig.rpcUrl) {
        errors.push('Invalid network configuration');
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown health check error');
    }

    return {
      isHealthy: errors.length === 0,
      network: this.networkConfig.isTestnet ? 'testnet' : 'mainnet',
      contractId: this.networkConfig.contractId,
      timestamp: Date.now(),
      errors
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  addEventListener(
    eventTypes: LimitedDropEventType[],
    listener: LimitedDropEventListener,
    options: EventListenerOptions = {}
  ): string {
    const id = `limited_drop_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.eventListeners.set(id, {
      id,
      eventTypes,
      listener,
      active: true,
      options
    });
    return id;
  }

  removeEventListener(subscriptionId: string): boolean {
    return this.eventListeners.delete(subscriptionId);
  }

  clearCache(): void {
    this.cache.clear();
  }

  destroy(): void {
    this.eventListeners.clear();
    this.cache.clear();
    this.isInitialized = false;
  }

  private async fetchDrop(dropId: DropId): Promise<Drop> {
    if (!isValidDropId(dropId)) {
      throw new Error(ERROR_MESSAGES.INVALID_DROP_ID);
    }

    const tx = await retryWithBackoff(
      () => this.contract.get_drop({ drop_id: dropId }),
      this.config.retryConfig.maxRetries,
      this.config.retryConfig.baseDelay,
      this.config.retryConfig.maxDelay,
      this.config.retryConfig.backoffMultiplier
    );
    const result = await tx.simulate();
    return fromContractDrop(result.result as ContractDrop);
  }

  private async resolveSigner(address?: UserAddress): Promise<UserAddress> {
    if (address) {
      return address;
    }

    const connected = await isWalletConnected();
    if (!connected) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    const publicKey = await getPublicKey();
    if (!publicKey) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    return publicKey;
  }

  private transactionOptions(): { fee: number; timeoutInSeconds: number; simulate: boolean } {
    return {
      fee: this.config.fee,
      timeoutInSeconds: this.config.timeoutInSeconds,
      simulate: this.config.simulate
    };
  }

  private async signAndSendTransaction<T>(tx: any): Promise<TransactionResult<T>> {
    const startTime = Date.now();

    try {
      const xdr = tx.toXDR();
      const signedXdr = await signTransaction(xdr, this.networkConfig.isTestnet ? 'TESTNET' : 'MAINNET');
      const result = await tx.signAndSend(signedXdr);
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(true, responseTime);

      return {
        hash: result.hash || '',
        success: true,
        gasUsed: result.gasUsed,
        fee: result.fee,
        data: tx.result as T
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

  private getCachedData<T>(key: string): T | null {
    if (!this.config.cache.enabled) {
      return null;
    }

    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > this.config.cache.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCachedData(key: string, data: unknown): void {
    if (!this.config.cache.enabled) {
      return;
    }

    if (this.cache.size >= this.config.cache.maxSize) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateDropCache(dropId: DropId): void {
    this.cache.delete(CACHE_KEYS.DROP(dropId));
    this.cache.delete(CACHE_KEYS.DROP_STATUS(dropId));
    this.cache.delete(CACHE_KEYS.DROP_PURCHASES(dropId));
    this.cache.delete(CACHE_KEYS.BUYER_LIST(dropId));
  }

  private invalidateAccessCache(dropId: DropId, user: UserAddress): void {
    this.cache.delete(CACHE_KEYS.ACCESS(user, dropId));
    this.cache.delete(CACHE_KEYS.BUYER_LIST(dropId));
  }

  private updatePerformanceMetrics(success: boolean, responseTime: number): void {
    this.performanceMetrics.totalOperations += 1;
    this.performanceMetrics.lastUpdated = Date.now();

    if (success) {
      this.performanceMetrics.successfulOperations += 1;
    } else {
      this.performanceMetrics.failedOperations += 1;
    }

    const totalResponseTime =
      this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalOperations - 1) + responseTime;
    this.performanceMetrics.averageResponseTime = totalResponseTime / this.performanceMetrics.totalOperations;
  }

  private emitEvent(event: LimitedDropEventData): void {
    for (const subscription of this.eventListeners.values()) {
      if (!subscription.active || !subscription.eventTypes.includes(event.type)) {
        continue;
      }

      if (subscription.options.dropId && subscription.options.dropId !== event.dropId) {
        continue;
      }

      if (subscription.options.userAddress && subscription.options.userAddress !== event.user) {
        continue;
      }

      try {
        subscription.listener(event);
      } catch (error) {
        console.error('Error in limited drop event listener:', error);
      }
    }
  }

  private handleError(error: unknown, operation: string): LimitedDropResponse<never> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.emitEvent({
      type: LimitedDropEventType.ERROR,
      timestamp: Date.now(),
      error: errorMessage,
      operation
    });

    return this.createErrorResponse(errorMessage, getErrorType(errorMessage));
  }

  private createSuccessResponse<T>(data: T): LimitedDropResponse<T> {
    return {
      success: true,
      data
    };
  }

  private createErrorResponse<T = never>(error: string, errorCode?: number | string): LimitedDropResponse<T> {
    return {
      success: false,
      error,
      errorCode
    };
  }
}
