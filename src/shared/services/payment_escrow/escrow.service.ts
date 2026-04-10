import {
  signTransaction,
  getPublicKey,
  isWalletConnected,
} from '../../utils/wallet';
import {
  NETWORKS,
  DEFAULT_CONFIG,
  CACHE_KEYS,
  ESCROW_CONTRACT_METHODS,
  ESCROW_ERROR_CODES,
  TIMEOUT_CONFIG,
} from './constants/escrow.constants';
import {
  validateAddress,
  validateAmount,
  validateEscrowId,
  validateDisputeId,
  validateExpirationDays,
  canDeposit,
  canRelease,
  canRefund,
  canDispute,
  canCancel,
  isExpired,
  generateEscrowId,
  generateDisputeId,
  calculateExpirationTimestamp,
  mapContractError,
  getErrorMessage,
  createCacheEntry,
  isCacheExpired,
  retryWithBackoff,
} from './utils/escrow.utils';
import type {
  EscrowConfig,
  EscrowDetails,
  EscrowUpdateParams,
  EscrowServiceConfig,
  EscrowResponse,
  TransactionResult,
  PaymentStatusResponse,
  CacheEntry,
} from './types/escrow.types';
import { EscrowStatus } from './types/escrow.types';
import type {
  DisputeConfig,
  DisputeDetails,
  DisputeResolution,
  DisputeStatusResponse,
} from './types/dispute.types';
import { DisputeReason, DisputeStatus } from './types/dispute.types';
import type {
  ArbitratorInfo,
  ArbitratorDecision,
  ArbitratorAssignment,
} from './types/arbitrator.types';

type NetworkType = 'testnet' | 'mainnet';

interface EventListener {
  event: string;
  callback: (data: unknown) => void;
}

export class PaymentEscrowService {
  private contractClient: unknown | null = null;
  private config: EscrowServiceConfig;
  private initialized = false;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private eventListeners: EventListener[] = [];

  constructor(network: NetworkType = 'testnet') {
    const networkConfig = NETWORKS[network];
    this.config = {
      contractId: networkConfig.contractId,
      networkPassphrase: networkConfig.networkPassphrase,
      rpcUrl: networkConfig.rpcUrl,
      defaultExpirationDays: DEFAULT_CONFIG.defaultExpirationDays,
    };
  }

  async initialize(): Promise<EscrowResponse<void>> {
    try {
      if (!isWalletConnected()) {
        return { success: false, error: ESCROW_ERROR_CODES.WALLET_NOT_CONNECTED };
      }

      this.initialized = true;
      return { success: true };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(getErrorMessage(ESCROW_ERROR_CODES.CONTRACT_NOT_INITIALIZED));
    }
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (isCacheExpired(entry as CacheEntry<T>)) {
      this.cache.delete(key);
      return null;
    }
    return (entry as CacheEntry<T>).data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, createCacheEntry(data, DEFAULT_CONFIG.cacheTtlMs));
  }

  private invalidateCache(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  private emit(event: string, data: unknown): void {
    for (const listener of this.eventListeners) {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch {
          // Listener errors should not break the service
        }
      }
    }
  }

  on(event: string, callback: (data: unknown) => void): () => void {
    const listener: EventListener = { event, callback };
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index !== -1) this.eventListeners.splice(index, 1);
    };
  }

  // ─── Escrow Creation & Management ───

  async createEscrow(config: EscrowConfig): Promise<TransactionResult<EscrowDetails>> {
    try {
      this.ensureInitialized();

      if (!validateAddress(config.buyerAddress)) {
        return { success: false, error: ESCROW_ERROR_CODES.INVALID_ADDRESS };
      }
      if (!validateAddress(config.sellerAddress)) {
        return { success: false, error: ESCROW_ERROR_CODES.INVALID_ADDRESS };
      }
      if (!validateAmount(config.amount)) {
        return { success: false, error: ESCROW_ERROR_CODES.INVALID_AMOUNT };
      }

      const expirationDays = config.expirationDays ?? this.config.defaultExpirationDays;
      if (!validateExpirationDays(expirationDays)) {
        return { success: false, error: 'Invalid expiration days' };
      }

      const publicKey = await getPublicKey();
      const escrowId = generateEscrowId(config.buyerAddress, config.sellerAddress);

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.CREATE_ESCROW,
          {
            buyer: config.buyerAddress,
            seller: config.sellerAddress,
            amount: config.amount,
            currency: config.currency,
            description: config.description ?? '',
            expiration_days: expirationDays,
          },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      const escrow: EscrowDetails = {
        escrowId,
        buyerAddress: config.buyerAddress,
        sellerAddress: config.sellerAddress,
        amount: config.amount,
        currency: config.currency,
        status: EscrowStatus.CREATED,
        description: config.description ?? '',
        createdAt: Date.now(),
        expiresAt: calculateExpirationTimestamp(expirationDays),
      };

      this.setCache(`${CACHE_KEYS.ESCROW}:${escrowId}`, escrow);
      this.emit('escrow:created', escrow);

      return { success: true, data: escrow, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async getEscrow(escrowId: string): Promise<EscrowResponse<EscrowDetails>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const cached = this.getCached<EscrowDetails>(`${CACHE_KEYS.ESCROW}:${escrowId}`);
      if (cached) return { success: true, data: cached };

      const result = await retryWithBackoff(async () => {
        return await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.GET_ESCROW,
          { escrow_id: escrowId },
        );
      });

      if (!result) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      this.setCache(`${CACHE_KEYS.ESCROW}:${escrowId}`, result);
      return { success: true, data: result as EscrowDetails };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async updateEscrow(
    escrowId: string,
    updates: EscrowUpdateParams,
  ): Promise<TransactionResult<EscrowDetails>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const escrowResult = await this.getEscrow(escrowId);
      if (!escrowResult.success || !escrowResult.data) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const escrow = escrowResult.data;
      if (!canCancel(escrow.status) && escrow.status !== EscrowStatus.CREATED) {
        return { success: false, error: 'Escrow cannot be updated in current state' };
      }

      if (updates.expirationDays !== undefined && !validateExpirationDays(updates.expirationDays)) {
        return { success: false, error: 'Invalid expiration days' };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.UPDATE_ESCROW,
          { escrow_id: escrowId, ...updates },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.ESCROW}:${escrowId}`);
      this.emit('escrow:updated', { escrowId, updates });

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async cancelEscrow(escrowId: string): Promise<TransactionResult<void>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const escrowResult = await this.getEscrow(escrowId);
      if (!escrowResult.success || !escrowResult.data) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      if (!canCancel(escrowResult.data.status)) {
        return { success: false, error: 'Escrow cannot be cancelled in current state' };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.CANCEL_ESCROW,
          { escrow_id: escrowId },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.ESCROW}:${escrowId}`);
      this.emit('escrow:cancelled', { escrowId });

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  // ─── Payment Operations ───

  async depositPayment(
    escrowId: string,
    amount: bigint,
  ): Promise<TransactionResult<void>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }
      if (!validateAmount(amount)) {
        return { success: false, error: ESCROW_ERROR_CODES.INVALID_AMOUNT };
      }

      const escrowResult = await this.getEscrow(escrowId);
      if (!escrowResult.success || !escrowResult.data) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      if (!canDeposit(escrowResult.data.status)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_ALREADY_FUNDED };
      }

      if (isExpired(escrowResult.data.expiresAt)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_EXPIRED };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.DEPOSIT_PAYMENT,
          { escrow_id: escrowId, amount },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.ESCROW}:${escrowId}`);
      this.invalidateCache(`${CACHE_KEYS.PAYMENT_STATUS}:${escrowId}`);
      this.emit('payment:deposited', { escrowId, amount });

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async releasePayment(escrowId: string): Promise<TransactionResult<void>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const escrowResult = await this.getEscrow(escrowId);
      if (!escrowResult.success || !escrowResult.data) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      if (!canRelease(escrowResult.data.status)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.RELEASE_PAYMENT,
          { escrow_id: escrowId },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.ESCROW}:${escrowId}`);
      this.invalidateCache(`${CACHE_KEYS.PAYMENT_STATUS}:${escrowId}`);
      this.emit('payment:released', { escrowId });

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async refundPayment(escrowId: string): Promise<TransactionResult<void>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const escrowResult = await this.getEscrow(escrowId);
      if (!escrowResult.success || !escrowResult.data) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      if (!canRefund(escrowResult.data.status)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.REFUND_PAYMENT,
          { escrow_id: escrowId },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.ESCROW}:${escrowId}`);
      this.invalidateCache(`${CACHE_KEYS.PAYMENT_STATUS}:${escrowId}`);
      this.emit('payment:refunded', { escrowId });

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async getPaymentStatus(escrowId: string): Promise<EscrowResponse<PaymentStatusResponse>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const cached = this.getCached<PaymentStatusResponse>(
        `${CACHE_KEYS.PAYMENT_STATUS}:${escrowId}`,
      );
      if (cached) return { success: true, data: cached };

      const result = await retryWithBackoff(async () => {
        return await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.GET_PAYMENT_STATUS,
          { escrow_id: escrowId },
        );
      });

      if (!result) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      this.setCache(`${CACHE_KEYS.PAYMENT_STATUS}:${escrowId}`, result);
      return { success: true, data: result as PaymentStatusResponse };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  // ─── Dispute Management ───

  async createDispute(
    escrowId: string,
    reason: DisputeReason,
    description: string,
    evidence?: string[],
  ): Promise<TransactionResult<DisputeDetails>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const escrowResult = await this.getEscrow(escrowId);
      if (!escrowResult.success || !escrowResult.data) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      if (!canDispute(escrowResult.data.status)) {
        return { success: false, error: 'Cannot create dispute for escrow in current state' };
      }

      const disputeId = generateDisputeId(escrowId);
      const publicKey = await getPublicKey();

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.CREATE_DISPUTE,
          {
            escrow_id: escrowId,
            reason,
            description,
            evidence: evidence ?? [],
          },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      const dispute: DisputeDetails = {
        disputeId,
        escrowId,
        initiatorAddress: publicKey,
        reason,
        description,
        evidence: evidence ?? [],
        status: DisputeStatus.OPEN,
        createdAt: Date.now(),
      };

      this.setCache(`${CACHE_KEYS.DISPUTE}:${disputeId}`, dispute);
      this.invalidateCache(`${CACHE_KEYS.ESCROW}:${escrowId}`);
      this.emit('dispute:created', dispute);

      return { success: true, data: dispute, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async getDispute(disputeId: string): Promise<EscrowResponse<DisputeDetails>> {
    try {
      this.ensureInitialized();

      if (!validateDisputeId(disputeId)) {
        return { success: false, error: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND };
      }

      const cached = this.getCached<DisputeDetails>(`${CACHE_KEYS.DISPUTE}:${disputeId}`);
      if (cached) return { success: true, data: cached };

      const result = await retryWithBackoff(async () => {
        return await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.GET_DISPUTE,
          { dispute_id: disputeId },
        );
      });

      if (!result) {
        return { success: false, error: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND };
      }

      this.setCache(`${CACHE_KEYS.DISPUTE}:${disputeId}`, result);
      return { success: true, data: result as DisputeDetails };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
  ): Promise<TransactionResult<void>> {
    try {
      this.ensureInitialized();

      if (!validateDisputeId(disputeId)) {
        return { success: false, error: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.RESOLVE_DISPUTE,
          {
            dispute_id: disputeId,
            decision: resolution.decision,
            buyer_amount: resolution.buyerAmount,
            seller_amount: resolution.sellerAmount,
            notes: resolution.notes,
          },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.DISPUTE}:${disputeId}`);
      this.emit('dispute:resolved', { disputeId, resolution });

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async getDisputeStatus(disputeId: string): Promise<EscrowResponse<DisputeStatusResponse>> {
    try {
      this.ensureInitialized();

      if (!validateDisputeId(disputeId)) {
        return { success: false, error: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND };
      }

      const result = await retryWithBackoff(async () => {
        return await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.GET_DISPUTE_STATUS,
          { dispute_id: disputeId },
        );
      });

      if (!result) {
        return { success: false, error: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND };
      }

      return { success: true, data: result as DisputeStatusResponse };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  // ─── Arbitrator Operations ───

  async assignArbitrator(
    escrowId: string,
    arbitratorAddress: string,
  ): Promise<TransactionResult<void>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }
      if (!validateAddress(arbitratorAddress)) {
        return { success: false, error: ESCROW_ERROR_CODES.INVALID_ADDRESS };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.ASSIGN_ARBITRATOR,
          { escrow_id: escrowId, arbitrator: arbitratorAddress },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.ARBITRATOR}:${escrowId}`);
      this.emit('arbitrator:assigned', { escrowId, arbitratorAddress });

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async getArbitrator(escrowId: string): Promise<EscrowResponse<ArbitratorInfo>> {
    try {
      this.ensureInitialized();

      if (!validateEscrowId(escrowId)) {
        return { success: false, error: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND };
      }

      const cached = this.getCached<ArbitratorInfo>(`${CACHE_KEYS.ARBITRATOR}:${escrowId}`);
      if (cached) return { success: true, data: cached };

      const result = await retryWithBackoff(async () => {
        return await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.GET_ARBITRATOR,
          { escrow_id: escrowId },
        );
      });

      if (!result) {
        return { success: false, error: ESCROW_ERROR_CODES.ARBITRATOR_NOT_ASSIGNED };
      }

      this.setCache(`${CACHE_KEYS.ARBITRATOR}:${escrowId}`, result);
      return { success: true, data: result as ArbitratorInfo };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  async arbitratorDecision(
    decision: ArbitratorDecision,
  ): Promise<TransactionResult<void>> {
    try {
      this.ensureInitialized();

      if (!validateDisputeId(decision.disputeId)) {
        return { success: false, error: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND };
      }

      const result = await retryWithBackoff(async () => {
        const txResult = await (this.contractClient as any).call(
          ESCROW_CONTRACT_METHODS.ARBITRATOR_DECISION,
          {
            dispute_id: decision.disputeId,
            decision: decision.decision,
            buyer_percentage: decision.buyerPercentage,
            seller_percentage: decision.sellerPercentage,
            notes: decision.notes,
          },
        );

        if (!txResult) {
          throw new Error(ESCROW_ERROR_CODES.TRANSACTION_FAILED);
        }

        const signed = await signTransaction(txResult.toXDR(), {
          networkPassphrase: this.config.networkPassphrase,
        });
        return signed;
      });

      this.invalidateCache(`${CACHE_KEYS.DISPUTE}:${decision.disputeId}`);
      this.emit('arbitrator:decision', decision);

      return { success: true, txHash: result as string };
    } catch (error) {
      return { success: false, error: mapContractError(error) };
    }
  }

  // ─── Utility ───

  clearCache(): void {
    this.cache.clear();
  }

  removeAllListeners(): void {
    this.eventListeners = [];
  }
}

export function createPaymentEscrowService(network: NetworkType = 'testnet'): PaymentEscrowService {
  return new PaymentEscrowService(network);
}
