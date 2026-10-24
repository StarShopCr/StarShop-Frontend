import {
  DROP_ERROR_CODES,
  ERROR_MESSAGES,
  DROP_STATUS,
  ACCESS_TIERS,
  TIER_ALLOCATION_MULTIPLIERS,
} from './constants/drop.constants';
import type {
  DropConfig,
  DropStatus,
  CreateDropParams,
  UpdateDropParams,
  DropResponse,
  ParticipationParams,
  ParticipationResult,
  ParticipationMetrics,
  TimeRemainingResult,
  PaginationParams,
} from './types/drop.types';
import type {
  AccessTier,
  AccessEntry,
  AccessCheckResult,
} from './types/access.types';
import {
  isValidStellarAddress,
  generateDropId,
  generateTxHash,
  validateCreateDropParams,
  validateUpdateDropParams,
  computeDynamicStatus,
  calculateTimeRemaining,
  calculateParticipationMetrics,
} from './utils/drop.utils';

/**
 * Service configuration options
 */
export interface LimitedTimeDropServiceOptions {
  /** Optional custom time provider in seconds (useful for deterministic testing) */
  nowProvider?: () => number;
  /** Optional initial drops */
  initialDrops?: DropConfig[];
}

/**
 * Main service layer for managing StarShop Limited Time Drop contracts,
 * multi-tier access whitelisting, atomic participation claims, and time progression.
 */
export class LimitedTimeDropService {
  /** In-memory drop registry keyed by dropId */
  private drops: Map<string, DropConfig> = new Map();

  /** Access control registry: dropId -> (userAddress -> AccessEntry) */
  private accessRegistry: Map<string, Map<string, AccessEntry>> = new Map();

  /** User claims: dropId -> (userAddress -> amountClaimed) */
  private userClaims: Map<string, Map<string, number>> = new Map();

  /** Participation transactions: dropId -> ParticipationResult[] */
  private transactions: Map<string, ParticipationResult[]> = new Map();

  /** Time provider returning unix epoch timestamp in seconds */
  private nowProvider: () => number;

  constructor(options?: LimitedTimeDropServiceOptions) {
    this.nowProvider =
      options?.nowProvider ?? (() => Math.floor(Date.now() / 1000));

    if (options?.initialDrops) {
      for (const drop of options.initialDrops) {
        this.drops.set(drop.dropId, { ...drop });
        this.accessRegistry.set(drop.dropId, new Map());
        this.userClaims.set(drop.dropId, new Map());
        this.transactions.set(drop.dropId, []);
      }
    }
  }

  /**
   * Helper to fetch current timestamp in seconds
   */
  private now(): number {
    return this.nowProvider();
  }

  // ===========================================================================
  // 1. DROP MANAGEMENT
  // ===========================================================================

  /**
   * Creates a new limited time drop with validated parameters and initial state
   */
  public async createDrop(
    params: CreateDropParams
  ): Promise<DropResponse<DropConfig>> {
    const currentNow = this.now();
    const validation = validateCreateDropParams(params, currentNow);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        errorCode: validation.errorCode,
      };
    }

    const dropId = generateDropId();
    const isPublic = Boolean(params.isPublic);

    const initialStatus =
      currentNow >= params.startTime
        ? DROP_STATUS.ACTIVE
        : DROP_STATUS.SCHEDULED;

    const newDrop: DropConfig = {
      dropId,
      name: params.name.trim(),
      description: params.description?.trim() ?? '',
      tokenAddress: params.tokenAddress.trim(),
      totalAllocation: params.totalAllocation,
      claimedAllocation: 0,
      remainingAllocation: params.totalAllocation,
      maxPerUser: params.maxPerUser,
      startTime: params.startTime,
      endTime: params.endTime,
      status: initialStatus,
      isPublic,
      createdAt: currentNow * 1000,
      updatedAt: currentNow * 1000,
      metadata: params.metadata ? { ...params.metadata } : undefined,
    };

    this.drops.set(dropId, newDrop);
    this.accessRegistry.set(dropId, new Map());
    this.userClaims.set(dropId, new Map());
    this.transactions.set(dropId, []);

    return {
      success: true,
      data: { ...newDrop },
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Retrieves drop configuration with dynamically computed lifecycle status
   */
  public async getDrop(dropId: string): Promise<DropResponse<DropConfig>> {
    if (!dropId) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_PARAMS],
        errorCode: DROP_ERROR_CODES.INVALID_PARAMS,
      };
    }

    const drop = this.drops.get(dropId);
    if (!drop) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.DROP_NOT_FOUND],
        errorCode: DROP_ERROR_CODES.DROP_NOT_FOUND,
      };
    }

    // Refresh dynamic status
    const currentNow = this.now();
    const dynamicStatus = computeDynamicStatus(drop, currentNow);
    drop.status = dynamicStatus;

    return {
      success: true,
      data: { ...drop },
    };
  }

  /**
   * Updates mutable fields of an active/scheduled drop
   */
  public async updateDrop(
    dropId: string,
    updates: UpdateDropParams
  ): Promise<DropResponse<DropConfig>> {
    const existingResult = await this.getDrop(dropId);
    if (!existingResult.success || !existingResult.data) {
      return {
        success: false,
        error: existingResult.error,
        errorCode: existingResult.errorCode,
      };
    }

    const current = existingResult.data;
    const currentNow = this.now();
    const validation = validateUpdateDropParams(current, updates, currentNow);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        errorCode: validation.errorCode,
      };
    }

    // Apply updates
    if (updates.name !== undefined) current.name = updates.name.trim();
    if (updates.description !== undefined)
      current.description = updates.description.trim();
    if (updates.tokenAddress !== undefined)
      current.tokenAddress = updates.tokenAddress.trim();
    if (updates.startTime !== undefined) current.startTime = updates.startTime;
    if (updates.endTime !== undefined) current.endTime = updates.endTime;
    if (updates.isPublic !== undefined) current.isPublic = updates.isPublic;
    if (updates.maxPerUser !== undefined)
      current.maxPerUser = updates.maxPerUser;

    if (updates.totalAllocation !== undefined) {
      current.totalAllocation = updates.totalAllocation;
      current.remainingAllocation =
        updates.totalAllocation - current.claimedAllocation;
    }

    if (updates.metadata !== undefined) {
      current.metadata = { ...current.metadata, ...updates.metadata };
    }

    current.updatedAt = currentNow * 1000;
    current.status = computeDynamicStatus(current, currentNow);

    this.drops.set(dropId, current);

    return {
      success: true,
      data: { ...current },
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Cancels a drop before completion
   */
  public async cancelDrop(
    dropId: string,
    reason = 'Cancelled by administrator'
  ): Promise<DropResponse<boolean>> {
    const existingResult = await this.getDrop(dropId);
    if (!existingResult.success || !existingResult.data) {
      return {
        success: false,
        error: existingResult.error,
        errorCode: existingResult.errorCode,
      };
    }

    const current = existingResult.data;
    if (current.status === DROP_STATUS.CANCELLED) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.DROP_ALREADY_CANCELLED],
        errorCode: DROP_ERROR_CODES.DROP_ALREADY_CANCELLED,
      };
    }

    if (current.status === DROP_STATUS.ENDED) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.DROP_ALREADY_ENDED],
        errorCode: DROP_ERROR_CODES.DROP_ALREADY_ENDED,
      };
    }

    current.status = DROP_STATUS.CANCELLED;
    current.cancellationReason = reason;
    current.updatedAt = this.now() * 1000;

    this.drops.set(dropId, current);

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  // ===========================================================================
  // 2. ACCESS CONTROL
  // ===========================================================================

  /**
   * Checks whether a user has permission to claim from a specific drop
   */
  public async checkAccess(
    dropId: string,
    user: string
  ): Promise<AccessCheckResult> {
    const defaultFail = (
      reason: string,
      tier: AccessTier = ACCESS_TIERS.PUBLIC
    ): AccessCheckResult => ({
      hasAccess: false,
      tier,
      maxAllocation: 0,
      currentClaimed: 0,
      remainingAllocation: 0,
      reason,
    });

    if (!user || !isValidStellarAddress(user)) {
      return defaultFail(ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ADDRESS]);
    }

    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return defaultFail(ERROR_MESSAGES[DROP_ERROR_CODES.DROP_NOT_FOUND]);
    }

    const drop = dropRes.data;
    const normalizedUser = user.trim();

    // Check existing claims for user
    const dropClaims = this.userClaims.get(dropId) || new Map<string, number>();
    const currentClaimed = dropClaims.get(normalizedUser) || 0;

    // Check access registry
    const dropRegistry =
      this.accessRegistry.get(dropId) || new Map<string, AccessEntry>();
    const entry = dropRegistry.get(normalizedUser);

    if (entry && entry.isActive) {
      const maxAlloc = entry.maxAllocation;
      const remainingAlloc = Math.max(0, maxAlloc - currentClaimed);
      const hasRemaining = remainingAlloc > 0;

      return {
        hasAccess: hasRemaining,
        tier: entry.tier,
        maxAllocation: maxAlloc,
        currentClaimed,
        remainingAllocation: remainingAlloc,
        reason: hasRemaining
          ? undefined
          : ERROR_MESSAGES[DROP_ERROR_CODES.USER_ALLOCATION_EXCEEDED],
      };
    }

    // If no explicit whitelist entry, check if drop is public
    if (drop.isPublic) {
      const publicMax = drop.maxPerUser;
      const remainingAlloc = Math.max(0, publicMax - currentClaimed);
      const hasRemaining = remainingAlloc > 0;

      return {
        hasAccess: hasRemaining,
        tier: ACCESS_TIERS.PUBLIC,
        maxAllocation: publicMax,
        currentClaimed,
        remainingAllocation: remainingAlloc,
        reason: hasRemaining
          ? undefined
          : ERROR_MESSAGES[DROP_ERROR_CODES.USER_ALLOCATION_EXCEEDED],
      };
    }

    // Private / Whitelist-only drop and user not registered
    return defaultFail(
      ERROR_MESSAGES[DROP_ERROR_CODES.USER_NOT_WHITELISTED],
      ACCESS_TIERS.WHITELIST
    );
  }

  /**
   * Grants whitelist or tiered access to a user
   */
  public async grantAccess(
    dropId: string,
    user: string,
    tier: AccessTier = ACCESS_TIERS.WHITELIST,
    customAllocation?: number
  ): Promise<DropResponse<boolean>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ADDRESS],
        errorCode: DROP_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const drop = dropRes.data;
    const normalizedUser = user.trim();

    let maxAllocation = customAllocation ?? drop.maxPerUser;
    if (customAllocation === undefined && tier) {
      const multiplier = TIER_ALLOCATION_MULTIPLIERS[tier] ?? 1.0;
      maxAllocation = Math.floor(drop.maxPerUser * multiplier);
    }

    if (maxAllocation <= 0) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_MAX_PER_USER],
        errorCode: DROP_ERROR_CODES.INVALID_MAX_PER_USER,
      };
    }

    let dropRegistry = this.accessRegistry.get(dropId);
    if (!dropRegistry) {
      dropRegistry = new Map<string, AccessEntry>();
      this.accessRegistry.set(dropId, dropRegistry);
    }

    const entry: AccessEntry = {
      user: normalizedUser,
      tier,
      maxAllocation,
      grantedAt: this.now() * 1000,
      isActive: true,
    };

    dropRegistry.set(normalizedUser, entry);

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Revokes whitelist access for a user
   */
  public async revokeAccess(
    dropId: string,
    user: string
  ): Promise<DropResponse<boolean>> {
    if (!user || !isValidStellarAddress(user)) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ADDRESS],
        errorCode: DROP_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const dropRegistry = this.accessRegistry.get(dropId);
    const normalizedUser = user.trim();

    if (!dropRegistry || !dropRegistry.has(normalizedUser)) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.ACCESS_NOT_FOUND],
        errorCode: DROP_ERROR_CODES.ACCESS_NOT_FOUND,
      };
    }

    dropRegistry.delete(normalizedUser);

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Retrieves paginated access list for a drop
   */
  public async getAccessList(
    dropId: string,
    pagination?: PaginationParams
  ): Promise<DropResponse<AccessEntry[]>> {
    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const dropRegistry =
      this.accessRegistry.get(dropId) || new Map<string, AccessEntry>();
    const allEntries = Array.from(dropRegistry.values());

    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.max(1, pagination?.limit ?? 50);
    const offset =
      pagination?.offset !== undefined ? pagination.offset : (page - 1) * limit;

    const paginated = allEntries.slice(offset, offset + limit);

    return {
      success: true,
      data: paginated,
    };
  }

  // ===========================================================================
  // 3. DROP OPERATIONS & METRICS
  // ===========================================================================

  /**
   * Atomic participation claim execution
   */
  public async participateInDrop(
    dropId: string,
    params: ParticipationParams
  ): Promise<DropResponse<ParticipationResult>> {
    if (!params || !params.user || typeof params.amount !== 'number') {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_PARAMS],
        errorCode: DROP_ERROR_CODES.INVALID_PARAMS,
      };
    }

    if (params.amount <= 0 || !Number.isFinite(params.amount)) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_AMOUNT],
        errorCode: DROP_ERROR_CODES.INVALID_AMOUNT,
      };
    }

    const normalizedUser = params.user.trim();
    if (!isValidStellarAddress(normalizedUser)) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_ADDRESS],
        errorCode: DROP_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    // 1. Check if drop is active
    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const drop = dropRes.data;
    if (!this.isDropActive(dropId)) {
      const currentStatus = drop.status;
      const errorCode =
        currentStatus === DROP_STATUS.SOLD_OUT
          ? DROP_ERROR_CODES.DROP_SOLD_OUT
          : currentStatus === DROP_STATUS.PAUSED
            ? DROP_ERROR_CODES.DROP_PAUSED
            : DROP_ERROR_CODES.DROP_NOT_ACTIVE;

      return {
        success: false,
        error: ERROR_MESSAGES[errorCode],
        errorCode,
      };
    }

    // 2. Check access
    const access = await this.checkAccess(dropId, normalizedUser);
    if (!access.hasAccess) {
      return {
        success: false,
        error: access.reason || ERROR_MESSAGES[DROP_ERROR_CODES.ACCESS_DENIED],
        errorCode: DROP_ERROR_CODES.ACCESS_DENIED,
      };
    }

    // 3. Check requested amount against user limit
    if (params.amount > access.remainingAllocation) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.CLAIM_EXCEEDS_USER_MAX],
        errorCode: DROP_ERROR_CODES.CLAIM_EXCEEDS_USER_MAX,
      };
    }

    // 4. Check requested amount against drop pool remaining allocation
    if (params.amount > drop.remainingAllocation) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.CLAIM_EXCEEDS_REMAINING],
        errorCode: DROP_ERROR_CODES.CLAIM_EXCEEDS_REMAINING,
      };
    }

    // Execution: Commit atomic state update
    drop.claimedAllocation += params.amount;
    drop.remainingAllocation -= params.amount;
    drop.updatedAt = this.now() * 1000;

    if (drop.remainingAllocation <= 0) {
      drop.status = DROP_STATUS.SOLD_OUT;
    }

    this.drops.set(dropId, drop);

    // Update user claims
    let dropClaims = this.userClaims.get(dropId);
    if (!dropClaims) {
      dropClaims = new Map<string, number>();
      this.userClaims.set(dropId, dropClaims);
    }
    const currentClaimed =
      (dropClaims.get(normalizedUser) || 0) + params.amount;
    dropClaims.set(normalizedUser, currentClaimed);

    // Record transaction
    const txHash = generateTxHash();
    const result: ParticipationResult = {
      dropId,
      user: normalizedUser,
      amount: params.amount,
      totalClaimedByUser: currentClaimed,
      remainingAllocation: drop.remainingAllocation,
      timestamp: this.now() * 1000,
      txHash,
    };

    let dropTxs = this.transactions.get(dropId);
    if (!dropTxs) {
      dropTxs = [];
      this.transactions.set(dropId, dropTxs);
    }
    dropTxs.push(result);

    return {
      success: true,
      data: result,
      transactionHash: txHash,
    };
  }

  /**
   * Tracks and computes real-time participation metrics for a drop
   */
  public async trackParticipation(
    dropId: string
  ): Promise<DropResponse<ParticipationMetrics>> {
    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const dropClaims = this.userClaims.get(dropId) || new Map<string, number>();
    const participantCount = dropClaims.size;

    const metrics = calculateParticipationMetrics(
      dropRes.data,
      participantCount,
      dropRes.data.claimedAllocation
    );

    return {
      success: true,
      data: metrics,
    };
  }

  /**
   * Returns current drop status
   */
  public async getDropStatus(dropId: string): Promise<DropStatus> {
    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return DROP_STATUS.CANCELLED;
    }
    return dropRes.data.status;
  }

  // ===========================================================================
  // 4. TIME MANAGEMENT
  // ===========================================================================

  /**
   * Checks whether the drop is active given current timestamp and state
   */
  public isDropActive(dropId: string): boolean {
    const drop = this.drops.get(dropId);
    if (!drop) return false;

    const currentNow = this.now();
    const status = computeDynamicStatus(drop, currentNow);

    return (
      status === DROP_STATUS.ACTIVE &&
      currentNow >= drop.startTime &&
      currentNow <= drop.endTime &&
      drop.remainingAllocation > 0
    );
  }

  /**
   * Computes precise remaining time details
   */
  public getTimeRemaining(dropId: string): TimeRemainingResult {
    const drop = this.drops.get(dropId);
    if (!drop) {
      return {
        timeToStartMs: 0,
        timeToEndMs: 0,
        isStarted: false,
        isEnded: true,
        formattedRemaining: '0s',
      };
    }

    return calculateTimeRemaining(drop, this.now() * 1000);
  }

  /**
   * Extends the duration of an ongoing or scheduled drop
   */
  public async extendDrop(
    dropId: string,
    additionalDurationSeconds: number
  ): Promise<DropResponse<DropConfig>> {
    if (
      typeof additionalDurationSeconds !== 'number' ||
      additionalDurationSeconds <= 0 ||
      !Number.isFinite(additionalDurationSeconds)
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.INVALID_DURATION],
        errorCode: DROP_ERROR_CODES.INVALID_DURATION,
      };
    }

    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const drop = dropRes.data;
    if (drop.status === DROP_STATUS.CANCELLED) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.DROP_ALREADY_CANCELLED],
        errorCode: DROP_ERROR_CODES.DROP_ALREADY_CANCELLED,
      };
    }

    drop.endTime += Math.floor(additionalDurationSeconds);
    drop.updatedAt = this.now() * 1000;
    drop.status = computeDynamicStatus(drop, this.now());

    this.drops.set(dropId, drop);

    return {
      success: true,
      data: { ...drop },
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Pauses an active drop
   */
  public async pauseDrop(dropId: string): Promise<DropResponse<DropConfig>> {
    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const drop = dropRes.data;
    if (
      drop.status === DROP_STATUS.CANCELLED ||
      drop.status === DROP_STATUS.ENDED
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[DROP_ERROR_CODES.DROP_CANNOT_BE_MODIFIED],
        errorCode: DROP_ERROR_CODES.DROP_CANNOT_BE_MODIFIED,
      };
    }

    drop.status = DROP_STATUS.PAUSED;
    drop.updatedAt = this.now() * 1000;
    this.drops.set(dropId, drop);

    return {
      success: true,
      data: { ...drop },
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Resumes a paused drop
   */
  public async resumeDrop(dropId: string): Promise<DropResponse<DropConfig>> {
    const dropRes = await this.getDrop(dropId);
    if (!dropRes.success || !dropRes.data) {
      return {
        success: false,
        error: dropRes.error,
        errorCode: dropRes.errorCode,
      };
    }

    const drop = dropRes.data;
    if (drop.status !== DROP_STATUS.PAUSED) {
      return {
        success: false,
        error: 'Drop is not currently paused.',
        errorCode: DROP_ERROR_CODES.INVALID_PARAMS,
      };
    }

    // Unpause before re-evaluating dynamic time progression
    drop.status = DROP_STATUS.SCHEDULED;
    drop.status = computeDynamicStatus(drop, this.now());
    drop.updatedAt = this.now() * 1000;
    this.drops.set(dropId, drop);

    return {
      success: true,
      data: { ...drop },
      transactionHash: generateTxHash(),
    };
  }

  /**
   * Returns all drops
   */
  public async getAllDrops(): Promise<DropResponse<DropConfig[]>> {
    const currentNow = this.now();
    const result: DropConfig[] = [];
    this.drops.forEach(drop => {
      drop.status = computeDynamicStatus(drop, currentNow);
      result.push({ ...drop });
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Clears internal state (useful for test resets)
   */
  public reset(): void {
    this.drops.clear();
    this.accessRegistry.clear();
    this.userClaims.clear();
    this.transactions.clear();
  }
}
