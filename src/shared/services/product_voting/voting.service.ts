/**
 * Product Voting Contract Service for StarShop Frontend
 * Staff-level implementation of decentralized product voting, rankings, and reward distribution.
 */

import type {
  VotingRound,
  CreateRoundParams,
  VoteResult,
  UserVoteEntry,
  RoundResults,
  VotingResponse,
} from './types/voting.types';
import type {
  ProductRank,
  LeaderboardEntry,
} from './types/ranking.types';
import type {
  RewardDistributionResult,
} from './types/reward.types';
import {
  ROUND_STATUS,
  VOTE_WEIGHTS,
  VOTING_ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULT_ROUND_CONFIG,
} from './constants/voting.constants';
import {
  isValidStellarAddress,
  generateTxHash,
  generateId,
  sanitizeVoteWeight,
  checkQuorum,
  calculateRankings,
  calculateRewards,
} from './utils/voting.utils';

export class ProductVotingService {
  private rounds: Map<string, VotingRound> = new Map();
  private votes: Map<string, UserVoteEntry> = new Map();
  private roundVotes: Map<string, string[]> = new Map(); // roundId -> voteIds
  private rewardDistributions: Map<string, RewardDistributionResult> = new Map();

  private timeProvider: () => number = () => Date.now();

  /**
   * Override time provider for deterministic testing of temporal logic.
   */
  public setTimeProvider(provider: () => number): void {
    this.timeProvider = provider;
  }

  /**
   * Resets all internal in-memory stores. Useful for clean test isolation.
   */
  public resetState(): void {
    this.rounds.clear();
    this.votes.clear();
    this.roundVotes.clear();
    this.rewardDistributions.clear();
    this.timeProvider = () => Date.now();
  }

  // ===========================================================================
  // 1. VOTING ROUNDS & LIFECYCLE
  // ===========================================================================

  /**
   * Creates a new voting round.
   */
  public async createVotingRound(params: CreateRoundParams): Promise<VotingResponse<VotingRound>> {
    const now = this.timeProvider();

    // Title validation
    if (!params.title || typeof params.title !== 'string' || !params.title.trim()) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.INVALID_ROUND_PARAMS,
          message: 'Round title is required and cannot be empty',
        },
      };
    }

    const title = params.title.trim();
    const startTime = params.startTime !== undefined ? params.startTime : now;
    const endTime = params.endTime;

    if (!endTime || typeof endTime !== 'number' || endTime <= startTime) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.INVALID_ROUND_PARAMS,
          message: 'Invalid round duration: endTime must be greater than startTime',
        },
      };
    }

    const quorum = params.quorum !== undefined ? Math.max(0, params.quorum) : DEFAULT_ROUND_CONFIG.quorum;
    const maxVotes = params.maxVotesPerUser !== undefined ? Math.max(1, params.maxVotesPerUser) : DEFAULT_ROUND_CONFIG.maxVotesPerUser;
    const rewardPool = params.rewardPool !== undefined ? Math.max(0, params.rewardPool) : 0;
    const allowRetract = params.allowRetract !== undefined ? params.allowRetract : DEFAULT_ROUND_CONFIG.allowRetract;
    const eligibleProducts = Array.isArray(params.eligibleProducts)
      ? params.eligibleProducts.map((p) => p.trim()).filter(Boolean)
      : [];

    const status = startTime <= now && endTime > now ? ROUND_STATUS.ACTIVE : startTime > now ? ROUND_STATUS.PENDING : ROUND_STATUS.ENDED;

    const roundId = generateId('round');
    const round: VotingRound = {
      roundId,
      title,
      description: (params.description || '').trim(),
      status,
      startTime,
      endTime,
      category: params.category ? params.category.trim() : undefined,
      quorum,
      maxVotesPerUser: maxVotes,
      totalVotes: 0,
      totalWeight: 0,
      rewardPool,
      eligibleProducts,
      allowRetract,
      rewardsDistributed: false,
      finalized: false,
      createdAt: now,
      updatedAt: now,
    };

    this.rounds.set(roundId, round);
    this.roundVotes.set(roundId, []);

    return {
      success: true,
      data: { ...round },
      txHash: generateTxHash(),
    };
  }

  /**
   * Retrieves a voting round by ID. Automatically updates status if expired.
   */
  public async getVotingRound(roundId: string): Promise<VotingResponse<VotingRound>> {
    if (!roundId || typeof roundId !== 'string') {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.ROUND_NOT_FOUND,
          message: ERROR_MESSAGES.ROUND_NOT_FOUND,
        },
      };
    }

    const round = this.rounds.get(roundId.trim());
    if (!round) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.ROUND_NOT_FOUND,
          message: ERROR_MESSAGES.ROUND_NOT_FOUND,
        },
      };
    }

    // Auto-update status if time expired
    const now = this.timeProvider();
    if (round.status === ROUND_STATUS.ACTIVE && now >= round.endTime) {
      round.status = ROUND_STATUS.ENDED;
      round.updatedAt = now;
    } else if (round.status === ROUND_STATUS.PENDING && now >= round.startTime && now < round.endTime) {
      round.status = ROUND_STATUS.ACTIVE;
      round.updatedAt = now;
    }

    return {
      success: true,
      data: { ...round },
    };
  }

  /**
   * Ends an active voting round and tallies results.
   */
  public async endVotingRound(roundId: string): Promise<VotingResponse<RoundResults>> {
    const roundRes = await this.getVotingRound(roundId);
    if (!roundRes.success || !roundRes.data) {
      return {
        success: false,
        error: roundRes.error,
      };
    }

    const round = this.rounds.get(roundId.trim())!;
    if (round.finalized) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.ROUND_ALREADY_ENDED,
          message: ERROR_MESSAGES.ROUND_ALREADY_ENDED,
        },
      };
    }

    const now = this.timeProvider();
    round.status = ROUND_STATUS.ENDED;
    round.finalized = true;
    round.finalizedAt = now;
    round.updatedAt = now;

    const voteIds = this.roundVotes.get(round.roundId) || [];
    const activeVotes: UserVoteEntry[] = [];
    for (const vId of voteIds) {
      const v = this.votes.get(vId);
      if (v && v.active) {
        activeVotes.push(v);
      }
    }

    const rankings = calculateRankings(activeVotes, round.eligibleProducts, round.category);
    const quorumReached = checkQuorum(round.totalWeight, round.quorum);
    const winningProductId = rankings.length > 0 && rankings[0].voteCount > 0 ? rankings[0].productId : null;

    const results: RoundResults = {
      roundId: round.roundId,
      status: ROUND_STATUS.ENDED,
      totalVotes: round.totalVotes,
      totalWeight: round.totalWeight,
      winningProductId,
      quorumReached,
      rankings,
      endedAt: now,
      txHash: generateTxHash(),
    };

    return {
      success: true,
      data: results,
      txHash: results.txHash,
    };
  }

  /**
   * Finds the currently active round, if any.
   */
  public async getCurrentActiveRound(): Promise<VotingRound | null> {
    const now = this.timeProvider();
    for (const round of Array.from(this.rounds.values())) {
      if (round.status === ROUND_STATUS.PENDING && now >= round.startTime && now < round.endTime) {
        round.status = ROUND_STATUS.ACTIVE;
        round.updatedAt = now;
      } else if (round.status === ROUND_STATUS.ACTIVE && now >= round.endTime) {
        round.status = ROUND_STATUS.ENDED;
        round.updatedAt = now;
      }

      if (round.status === ROUND_STATUS.ACTIVE) {
        return { ...round };
      }
    }
    return null;
  }

  // ===========================================================================
  // 2. VOTING OPERATIONS
  // ===========================================================================

  /**
   * Casts a vote for a product in an active round.
   */
  public async castVote(
    roundId: string,
    productId: string,
    voter: string,
    weight?: number
  ): Promise<VotingResponse<VoteResult>> {
    // Round retrieval and status check
    const roundRes = await this.getVotingRound(roundId);
    if (!roundRes.success || !roundRes.data) {
      return {
        success: false,
        error: roundRes.error,
      };
    }

    const round = this.rounds.get(roundId.trim())!;
    if (round.status !== ROUND_STATUS.ACTIVE) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.ROUND_NOT_ACTIVE,
          message: ERROR_MESSAGES.ROUND_NOT_ACTIVE,
        },
      };
    }

    // Voter address validation
    if (!isValidStellarAddress(voter)) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.INVALID_VOTER_ADDRESS,
          message: ERROR_MESSAGES.INVALID_VOTER_ADDRESS,
        },
      };
    }
    const cleanVoter = voter.trim();

    // Product ID validation
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.INVALID_PRODUCT_ID,
          message: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        },
      };
    }
    const cleanProductId = productId.trim();

    // Eligibility check
    if (round.eligibleProducts.length > 0 && !round.eligibleProducts.includes(cleanProductId)) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.PRODUCT_NOT_ELIGIBLE,
          message: ERROR_MESSAGES.PRODUCT_NOT_ELIGIBLE,
        },
      };
    }

    // Weight range validation
    if (weight !== undefined) {
      if (typeof weight !== 'number' || Number.isNaN(weight) || weight < VOTE_WEIGHTS.MIN || weight > VOTE_WEIGHTS.MAX) {
        return {
          success: false,
          error: {
            code: VOTING_ERROR_CODES.INVALID_WEIGHT,
            message: ERROR_MESSAGES.INVALID_WEIGHT,
          },
        };
      }
    }
    const sanitizedWeight = sanitizeVoteWeight(weight);

    // Check duplicate vote & user max votes
    const voteIds = this.roundVotes.get(round.roundId) || [];
    let userVoteCount = 0;

    for (const vId of voteIds) {
      const v = this.votes.get(vId);
      if (v && v.active && v.voter.toLowerCase() === cleanVoter.toLowerCase()) {
        if (v.productId === cleanProductId) {
          return {
            success: false,
            error: {
              code: VOTING_ERROR_CODES.USER_ALREADY_VOTED,
              message: ERROR_MESSAGES.USER_ALREADY_VOTED,
            },
          };
        }
        userVoteCount += 1;
      }
    }

    if (userVoteCount >= round.maxVotesPerUser) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.MAX_VOTES_EXCEEDED,
          message: ERROR_MESSAGES.MAX_VOTES_EXCEEDED,
        },
      };
    }

    const now = this.timeProvider();
    const voteId = generateId('vote');
    const txHash = generateTxHash();

    const entry: UserVoteEntry = {
      voteId,
      roundId: round.roundId,
      productId: cleanProductId,
      voter: cleanVoter,
      weight: sanitizedWeight,
      timestamp: now,
      active: true,
      txHash,
    };

    this.votes.set(voteId, entry);
    voteIds.push(voteId);
    this.roundVotes.set(round.roundId, voteIds);

    // Update round stats
    round.totalVotes += 1;
    round.totalWeight += sanitizedWeight;
    round.updatedAt = now;

    return {
      success: true,
      data: {
        voteId,
        roundId: round.roundId,
        productId: cleanProductId,
        voter: cleanVoter,
        weight: sanitizedWeight,
        timestamp: now,
        txHash,
      },
      txHash,
    };
  }

  /**
   * Retracts a previously cast vote in an active round.
   */
  public async retractVote(
    roundId: string,
    productId: string,
    voter: string
  ): Promise<VotingResponse<boolean>> {
    const roundRes = await this.getVotingRound(roundId);
    if (!roundRes.success || !roundRes.data) {
      return {
        success: false,
        error: roundRes.error,
      };
    }

    const round = this.rounds.get(roundId.trim())!;
    if (round.status !== ROUND_STATUS.ACTIVE) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.ROUND_NOT_ACTIVE,
          message: ERROR_MESSAGES.ROUND_NOT_ACTIVE,
        },
      };
    }

    if (!round.allowRetract) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.RETRACT_NOT_ALLOWED,
          message: ERROR_MESSAGES.RETRACT_NOT_ALLOWED,
        },
      };
    }

    if (!isValidStellarAddress(voter)) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.INVALID_VOTER_ADDRESS,
          message: ERROR_MESSAGES.INVALID_VOTER_ADDRESS,
        },
      };
    }

    const cleanVoter = voter.trim().toLowerCase();
    const cleanProductId = (productId || '').trim();

    const voteIds = this.roundVotes.get(round.roundId) || [];
    let targetVote: UserVoteEntry | null = null;

    for (const vId of voteIds) {
      const v = this.votes.get(vId);
      if (v && v.active && v.voter.toLowerCase() === cleanVoter && v.productId === cleanProductId) {
        targetVote = v;
        break;
      }
    }

    if (!targetVote) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.VOTE_NOT_FOUND,
          message: ERROR_MESSAGES.VOTE_NOT_FOUND,
        },
      };
    }

    // Mark as inactive
    targetVote.active = false;
    const now = this.timeProvider();

    // Deduct from round totals
    round.totalVotes = Math.max(0, round.totalVotes - 1);
    round.totalWeight = Math.max(0, round.totalWeight - targetVote.weight);
    round.updatedAt = now;

    return {
      success: true,
      data: true,
      txHash: generateTxHash(),
    };
  }

  /**
   * Checks if a user has actively voted in a round, optionally for a specific product.
   */
  public async hasUserVoted(roundId: string, voter: string, productId?: string): Promise<boolean> {
    if (!roundId || !voter || !isValidStellarAddress(voter)) return false;
    const cleanVoter = voter.trim().toLowerCase();
    const cleanProductId = productId ? productId.trim() : null;

    const voteIds = this.roundVotes.get(roundId.trim()) || [];
    for (const vId of voteIds) {
      const v = this.votes.get(vId);
      if (v && v.active && v.voter.toLowerCase() === cleanVoter) {
        if (!cleanProductId || v.productId === cleanProductId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Retrieves all votes cast by a specific user in a round.
   */
  public async getUserVotes(roundId: string, voter: string): Promise<UserVoteEntry[]> {
    if (!roundId || !voter || !isValidStellarAddress(voter)) return [];
    const cleanVoter = voter.trim().toLowerCase();

    const voteIds = this.roundVotes.get(roundId.trim()) || [];
    const userVotes: UserVoteEntry[] = [];

    for (const vId of voteIds) {
      const v = this.votes.get(vId);
      if (v && v.active && v.voter.toLowerCase() === cleanVoter) {
        userVotes.push({ ...v });
      }
    }

    return userVotes;
  }

  // ===========================================================================
  // 3. RANKINGS & LEADERBOARDS
  // ===========================================================================

  /**
   * Computes product rankings for a round, optionally filtered by category.
   */
  public async getProductRankings(roundId: string, category?: string): Promise<ProductRank[]> {
    if (!roundId) return [];
    const round = this.rounds.get(roundId.trim());
    if (!round) return [];

    const voteIds = this.roundVotes.get(round.roundId) || [];
    const activeVotes: UserVoteEntry[] = [];
    for (const vId of voteIds) {
      const v = this.votes.get(vId);
      if (v && v.active) {
        activeVotes.push(v);
      }
    }

    const roundCategory = category || round.category;
    return calculateRankings(activeVotes, round.eligibleProducts, roundCategory);
  }

  /**
   * Retrieves top N products based on total vote weight.
   */
  public async getTopProducts(roundId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const rankings = await this.getProductRankings(roundId);
    const safeLimit = Math.max(1, limit);
    return rankings.slice(0, safeLimit).map((r) => ({
      productId: r.productId,
      rank: r.rank,
      totalWeight: r.totalWeight,
      voteCount: r.voteCount,
    }));
  }

  /**
   * Distributes voter reward pool to participants based on vote weights.
   */
  public async distributeVoterRewards(roundId: string): Promise<VotingResponse<RewardDistributionResult>> {
    const roundRes = await this.getVotingRound(roundId);
    if (!roundRes.success || !roundRes.data) {
      return {
        success: false,
        error: roundRes.error,
      };
    }

    const round = this.rounds.get(roundId.trim())!;
    if (round.status !== ROUND_STATUS.ENDED) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.ROUND_NOT_ENDED,
          message: ERROR_MESSAGES.ROUND_NOT_ENDED,
        },
      };
    }

    if (round.rewardsDistributed) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.REWARDS_ALREADY_DISTRIBUTED,
          message: ERROR_MESSAGES.REWARDS_ALREADY_DISTRIBUTED,
        },
      };
    }

    const voteIds = this.roundVotes.get(round.roundId) || [];
    const activeVotes: UserVoteEntry[] = [];
    for (const vId of voteIds) {
      const v = this.votes.get(vId);
      if (v && v.active) {
        activeVotes.push(v);
      }
    }

    if (activeVotes.length === 0) {
      return {
        success: false,
        error: {
          code: VOTING_ERROR_CODES.NO_VOTERS_FOR_REWARDS,
          message: ERROR_MESSAGES.NO_VOTERS_FOR_REWARDS,
        },
      };
    }

    const distributions = calculateRewards(activeVotes, round.rewardPool);
    const txHash = generateTxHash();

    const result: RewardDistributionResult = {
      roundId: round.roundId,
      totalDistributed: round.rewardPool,
      recipientCount: distributions.length,
      distributions,
      txHash,
    };

    round.rewardsDistributed = true;
    round.updatedAt = this.timeProvider();
    this.rewardDistributions.set(round.roundId, result);

    return {
      success: true,
      data: result,
      txHash,
    };
  }

  // ===========================================================================
  // TEST & AUDIT HELPERS
  // ===========================================================================

  public getRawVotes(): UserVoteEntry[] {
    return Array.from(this.votes.values()).map((v) => ({ ...v }));
  }

  public getRawRounds(): VotingRound[] {
    return Array.from(this.rounds.values()).map((r) => ({ ...r }));
  }
}
