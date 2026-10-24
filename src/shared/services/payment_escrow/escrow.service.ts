import {
  ESCROW_ERROR_CODES,
  ERROR_MESSAGES,
  TIME_CONSTANTS,
  ESCROW_DEFAULTS,
} from './constants/escrow.constants';
import type {
  EscrowConfig,
  PaymentStatus,
  CreateEscrowParams,
  UpdateEscrowParams,
  DepositResult,
  EscrowResponse,
} from './types/escrow.types';
import type {
  DisputeDetails,
  DisputeResolution,
  DisputeStatus,
} from './types/dispute.types';
import type { ArbitratorDecision } from './types/arbitrator.types';
import {
  isValidStellarAddress,
  generateEscrowId,
  generateDisputeId,
  generateTxHash,
  calculateSplitAmounts,
} from './utils/escrow.utils';

export interface PaymentEscrowServiceOptions {
  timeProvider?: () => number;
}

export class PaymentEscrowService {
  private escrows: Map<string, EscrowConfig> = new Map();
  private disputes: Map<string, DisputeDetails> = new Map(); // disputeId -> DisputeDetails
  private escrowToDispute: Map<string, string> = new Map(); // escrowId -> disputeId
  private timeProvider?: () => number;

  constructor(options?: PaymentEscrowServiceOptions) {
    this.timeProvider = options?.timeProvider;
  }

  public setTimeProvider(provider: () => number): void {
    this.timeProvider = provider;
  }

  private now(): number {
    return this.timeProvider
      ? this.timeProvider()
      : Math.floor(Date.now() / 1000);
  }

  // ===========================================================================
  // 1. ESCROW CREATION & MANAGEMENT
  // ===========================================================================

  public async createEscrow(
    params: CreateEscrowParams
  ): Promise<EscrowResponse<EscrowConfig>> {
    if (!params.title || typeof params.title !== 'string' || !params.title.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: ESCROW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    if (!params.buyer || !isValidStellarAddress(params.buyer)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (!params.seller || !isValidStellarAddress(params.seller)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (params.buyer.trim().toLowerCase() === params.seller.trim().toLowerCase()) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.SAME_BUYER_SELLER],
        errorCode: ESCROW_ERROR_CODES.SAME_BUYER_SELLER,
      };
    }

    if (params.arbitrator && !isValidStellarAddress(params.arbitrator)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (typeof params.amount !== 'number' || params.amount <= 0 || !Number.isFinite(params.amount)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_AMOUNT],
        errorCode: ESCROW_ERROR_CODES.INVALID_AMOUNT,
      };
    }

    const currentNow = this.now();
    const escrowId = generateEscrowId();

    const escrow: EscrowConfig = {
      id: escrowId,
      buyer: params.buyer.trim(),
      seller: params.seller.trim(),
      arbitrator: params.arbitrator?.trim() || null,
      amount: params.amount,
      depositedAmount: 0,
      currency: params.currency?.trim() || ESCROW_DEFAULTS.DEFAULT_CURRENCY,
      title: params.title.trim(),
      description: params.description?.trim() || '',
      status: 'CREATED',
      paymentStatus: 'UNFUNDED',
      autoReleaseSeconds: params.autoReleaseSeconds ?? TIME_CONSTANTS.DEFAULT_AUTO_RELEASE_SECONDS,
      createdAt: currentNow,
      updatedAt: currentNow,
      metadata: params.metadata ? { ...params.metadata } : {},
    };

    this.escrows.set(escrowId, escrow);

    return {
      success: true,
      data: { ...escrow },
      transactionHash: generateTxHash(),
    };
  }

  public async getEscrow(escrowId: string): Promise<EscrowResponse<EscrowConfig>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    const escrow = this.escrows.get(escrowId)!;
    return {
      success: true,
      data: { ...escrow },
    };
  }

  public async updateEscrow(
    escrowId: string,
    updates: UpdateEscrowParams
  ): Promise<EscrowResponse<EscrowConfig>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    const escrow = this.escrows.get(escrowId)!;

    if (escrow.status === 'RELEASED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED,
      };
    }

    if (escrow.status === 'CANCELLED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED,
      };
    }

    if (updates.amount !== undefined) {
      if (escrow.depositedAmount > 0) {
        return {
          success: false,
          error: 'Cannot update escrow amount once funds have been deposited.',
          errorCode: ESCROW_ERROR_CODES.INVALID_PARAMETERS,
        };
      }
      if (typeof updates.amount !== 'number' || updates.amount <= 0 || !Number.isFinite(updates.amount)) {
        return {
          success: false,
          error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_AMOUNT],
          errorCode: ESCROW_ERROR_CODES.INVALID_AMOUNT,
        };
      }
      escrow.amount = updates.amount;
    }

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        return {
          success: false,
          error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_PARAMETERS],
          errorCode: ESCROW_ERROR_CODES.INVALID_PARAMETERS,
        };
      }
      escrow.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      escrow.description = updates.description.trim();
    }

    if (updates.autoReleaseSeconds !== undefined) {
      escrow.autoReleaseSeconds = updates.autoReleaseSeconds;
    }

    if (updates.metadata !== undefined) {
      escrow.metadata = { ...escrow.metadata, ...updates.metadata };
    }

    escrow.updatedAt = this.now();

    return {
      success: true,
      data: { ...escrow },
      transactionHash: generateTxHash(),
    };
  }

  public async cancelEscrow(escrowId: string): Promise<EscrowResponse<boolean>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    const escrow = this.escrows.get(escrowId)!;

    if (escrow.status === 'CANCELLED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED,
      };
    }

    if (escrow.status === 'RELEASED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED,
      };
    }

    if (escrow.depositedAmount > 0) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.CANNOT_CANCEL_FUNDED],
        errorCode: ESCROW_ERROR_CODES.CANNOT_CANCEL_FUNDED,
      };
    }

    escrow.status = 'CANCELLED';
    escrow.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  // ===========================================================================
  // 2. PAYMENT OPERATIONS
  // ===========================================================================

  public async depositPayment(
    escrowId: string,
    amount: number,
    payer: string
  ): Promise<EscrowResponse<DepositResult>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    if (!payer || !isValidStellarAddress(payer)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_AMOUNT],
        errorCode: ESCROW_ERROR_CODES.INVALID_AMOUNT,
      };
    }

    const escrow = this.escrows.get(escrowId)!;

    if (escrow.status === 'CANCELLED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED,
      };
    }

    if (escrow.status === 'RELEASED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED,
      };
    }

    if (escrow.status === 'FUNDED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_FUNDED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_FUNDED,
      };
    }

    const remainingRequired = escrow.amount - escrow.depositedAmount;
    if (amount > remainingRequired) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.DEPOSIT_EXCEEDS_REQUIRED],
        errorCode: ESCROW_ERROR_CODES.DEPOSIT_EXCEEDS_REQUIRED,
      };
    }

    const currentNow = this.now();
    escrow.depositedAmount = Number((escrow.depositedAmount + amount).toFixed(4));
    escrow.updatedAt = currentNow;

    if (escrow.depositedAmount >= escrow.amount) {
      escrow.status = 'FUNDED';
      escrow.paymentStatus = 'FULLY_FUNDED';
      escrow.fundedAt = currentNow;
    } else {
      escrow.paymentStatus = 'PARTIALLY_FUNDED';
    }

    const txHash = generateTxHash();
    const result: DepositResult = {
      escrowId,
      payer: payer.trim(),
      amount,
      totalDeposited: escrow.depositedAmount,
      remaining: Number((escrow.amount - escrow.depositedAmount).toFixed(4)),
      paymentStatus: escrow.paymentStatus,
      txHash,
    };

    return {
      success: true,
      data: result,
      transactionHash: txHash,
    };
  }

  public async releasePayment(
    escrowId: string,
    caller: string
  ): Promise<EscrowResponse<boolean>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    if (!caller || !isValidStellarAddress(caller)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const escrow = this.escrows.get(escrowId)!;
    const normalizedCaller = caller.trim().toLowerCase();

    // Release can be authorized by buyer, arbitrator, or auto-release by seller if timer elapsed
    const isBuyer = normalizedCaller === escrow.buyer.toLowerCase();
    const isArbitrator =
      escrow.arbitrator && normalizedCaller === escrow.arbitrator.toLowerCase();
    const isSeller = normalizedCaller === escrow.seller.toLowerCase();

    const currentNow = this.now();
    const autoReleaseElapsed =
      isSeller &&
      escrow.fundedAt &&
      escrow.autoReleaseSeconds &&
      currentNow >= escrow.fundedAt + escrow.autoReleaseSeconds;

    if (!isBuyer && !isArbitrator && !autoReleaseElapsed) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.UNAUTHORIZED],
        errorCode: ESCROW_ERROR_CODES.UNAUTHORIZED,
      };
    }

    if (escrow.status === 'RELEASED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED,
      };
    }

    if (escrow.status === 'DISPUTED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_IN_DISPUTE],
        errorCode: ESCROW_ERROR_CODES.ESCROW_IN_DISPUTE,
      };
    }

    if (escrow.depositedAmount <= 0) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED,
      };
    }

    escrow.status = 'RELEASED';
    escrow.paymentStatus = 'RELEASED';
    escrow.completedAt = currentNow;
    escrow.updatedAt = currentNow;

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async refundPayment(
    escrowId: string,
    caller: string
  ): Promise<EscrowResponse<boolean>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    if (!caller || !isValidStellarAddress(caller)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const escrow = this.escrows.get(escrowId)!;
    const normalizedCaller = caller.trim().toLowerCase();

    // Refund can be granted by seller voluntarily, or decided by arbitrator
    const isSeller = normalizedCaller === escrow.seller.toLowerCase();
    const isArbitrator =
      escrow.arbitrator && normalizedCaller === escrow.arbitrator.toLowerCase();

    if (!isSeller && !isArbitrator) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.UNAUTHORIZED],
        errorCode: ESCROW_ERROR_CODES.UNAUTHORIZED,
      };
    }

    if (escrow.status === 'REFUNDED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_REFUNDED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_REFUNDED,
      };
    }

    if (escrow.status === 'RELEASED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED,
      };
    }

    if (escrow.depositedAmount <= 0) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED,
      };
    }

    const currentNow = this.now();
    escrow.status = 'REFUNDED';
    escrow.paymentStatus = 'REFUNDED';
    escrow.completedAt = currentNow;
    escrow.updatedAt = currentNow;

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async getPaymentStatus(escrowId: string): Promise<PaymentStatus> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return 'UNFUNDED';
    }
    return this.escrows.get(escrowId)!.paymentStatus;
  }

  // ===========================================================================
  // 3. DISPUTE MANAGEMENT
  // ===========================================================================

  public async createDispute(
    escrowId: string,
    reason: string,
    initiator: string
  ): Promise<EscrowResponse<DisputeDetails>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    if (!initiator || !isValidStellarAddress(initiator)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (!reason || !reason.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: ESCROW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    const escrow = this.escrows.get(escrowId)!;
    const normalizedInitiator = initiator.trim().toLowerCase();

    // Initiator must be buyer or seller
    const isBuyer = normalizedInitiator === escrow.buyer.toLowerCase();
    const isSeller = normalizedInitiator === escrow.seller.toLowerCase();

    if (!isBuyer && !isSeller) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.UNAUTHORIZED],
        errorCode: ESCROW_ERROR_CODES.UNAUTHORIZED,
      };
    }

    if (this.escrowToDispute.has(escrowId) || escrow.status === 'DISPUTED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.DISPUTE_ALREADY_OPEN],
        errorCode: ESCROW_ERROR_CODES.DISPUTE_ALREADY_OPEN,
      };
    }

    if (escrow.status !== 'FUNDED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.DISPUTE_NOT_IN_DISPUTE_STATE],
        errorCode: ESCROW_ERROR_CODES.DISPUTE_NOT_IN_DISPUTE_STATE,
      };
    }

    const currentNow = this.now();
    const disputeId = generateDisputeId();

    const dispute: DisputeDetails = {
      id: disputeId,
      escrowId,
      initiator: initiator.trim(),
      reason: reason.trim(),
      status: 'OPEN',
      arbitrator: escrow.arbitrator,
      createdAt: currentNow,
      txHash: generateTxHash(),
    };

    this.disputes.set(disputeId, dispute);
    this.escrowToDispute.set(escrowId, disputeId);

    escrow.status = 'DISPUTED';
    escrow.updatedAt = currentNow;

    return {
      success: true,
      data: { ...dispute },
      transactionHash: dispute.txHash,
    };
  }

  public async getDispute(disputeId: string): Promise<DisputeDetails> {
    if (!disputeId || !this.disputes.has(disputeId)) {
      throw new Error(ERROR_MESSAGES[ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND]);
    }
    return { ...this.disputes.get(disputeId)! };
  }

  public async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    arbitrator: string
  ): Promise<EscrowResponse<boolean>> {
    if (!disputeId || !this.disputes.has(disputeId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND,
      };
    }

    if (!arbitrator || !isValidStellarAddress(arbitrator)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const dispute = this.disputes.get(disputeId)!;
    const escrow = this.escrows.get(dispute.escrowId)!;

    if (!escrow.arbitrator) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ARBITRATOR_NOT_ASSIGNED],
        errorCode: ESCROW_ERROR_CODES.ARBITRATOR_NOT_ASSIGNED,
      };
    }

    if (escrow.arbitrator.toLowerCase() !== arbitrator.trim().toLowerCase()) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ARBITRATOR_MISMATCH],
        errorCode: ESCROW_ERROR_CODES.ARBITRATOR_MISMATCH,
      };
    }

    if (dispute.status === 'RESOLVED') {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.DISPUTE_ALREADY_RESOLVED],
        errorCode: ESCROW_ERROR_CODES.DISPUTE_ALREADY_RESOLVED,
      };
    }

    const currentNow = this.now();
    dispute.status = 'RESOLVED';
    dispute.resolution = resolution;
    dispute.resolvedAt = currentNow;

    if (resolution === 'RELEASE_TO_SELLER') {
      escrow.status = 'RELEASED';
      escrow.paymentStatus = 'RELEASED';
    } else if (resolution === 'REFUND_TO_BUYER') {
      escrow.status = 'REFUNDED';
      escrow.paymentStatus = 'REFUNDED';
    } else if (resolution === 'SPLIT_PROPORTIONAL') {
      const { buyerAmount, sellerAmount } = calculateSplitAmounts(
        escrow.depositedAmount,
        50
      );
      dispute.splitBuyerAmount = buyerAmount;
      dispute.splitSellerAmount = sellerAmount;
      escrow.status = 'RELEASED';
      escrow.paymentStatus = 'RELEASED';
    }

    escrow.completedAt = currentNow;
    escrow.updatedAt = currentNow;

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async getDisputeStatus(disputeId: string): Promise<DisputeStatus> {
    if (!disputeId || !this.disputes.has(disputeId)) {
      return 'NONE';
    }
    return this.disputes.get(disputeId)!.status;
  }

  // ===========================================================================
  // 4. ARBITRATOR OPERATIONS
  // ===========================================================================

  public async assignArbitrator(
    escrowId: string,
    arbitrator: string
  ): Promise<EscrowResponse<boolean>> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.ESCROW_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.ESCROW_NOT_FOUND,
      };
    }

    if (!arbitrator || !isValidStellarAddress(arbitrator)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.INVALID_ADDRESS],
        errorCode: ESCROW_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const escrow = this.escrows.get(escrowId)!;
    if (escrow.status === 'RELEASED' || escrow.status === 'REFUNDED' || escrow.status === 'CANCELLED') {
      return {
        success: false,
        error: 'Cannot assign arbitrator to finalized escrow.',
        errorCode: ESCROW_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    escrow.arbitrator = arbitrator.trim();
    escrow.updatedAt = this.now();

    // If dispute already exists, update its arbitrator field
    const disputeId = this.escrowToDispute.get(escrowId);
    if (disputeId && this.disputes.has(disputeId)) {
      this.disputes.get(disputeId)!.arbitrator = arbitrator.trim();
    }

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async getArbitrator(escrowId: string): Promise<string | null> {
    if (!escrowId || !this.escrows.has(escrowId)) {
      return null;
    }
    return this.escrows.get(escrowId)!.arbitrator;
  }

  public async arbitratorDecision(
    disputeId: string,
    decision: ArbitratorDecision
  ): Promise<EscrowResponse<boolean>> {
    if (!disputeId || !this.disputes.has(disputeId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND],
        errorCode: ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND,
      };
    }

    const res = await this.resolveDispute(
      disputeId,
      decision.resolution,
      decision.arbitrator
    );

    if (res.success && decision.splitBuyerPercentage !== undefined) {
      const dispute = this.disputes.get(disputeId)!;
      const escrow = this.escrows.get(dispute.escrowId)!;
      const { buyerAmount, sellerAmount } = calculateSplitAmounts(
        escrow.depositedAmount,
        decision.splitBuyerPercentage
      );
      dispute.splitBuyerAmount = buyerAmount;
      dispute.splitSellerAmount = sellerAmount;
    }

    if (res.success && decision.rationale) {
      this.disputes.get(disputeId)!.notes = decision.rationale;
    }

    return res;
  }

  // ===========================================================================
  // 5. TEST & AUDIT HELPERS
  // ===========================================================================

  public resetState(): void {
    this.escrows.clear();
    this.disputes.clear();
    this.escrowToDispute.clear();
  }

  public listEscrows(): EscrowConfig[] {
    return Array.from(this.escrows.values()).map((e) => ({ ...e }));
  }
}
