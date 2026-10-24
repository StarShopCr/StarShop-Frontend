import {
  AUCTION_ERROR_CODES,
  ERROR_MESSAGES,
  TIME_CONSTANTS,
  AUCTION_DEFAULTS,
} from './constants/auction.constants';
import type {
  AuctionConfig,
  AuctionStatus,
  CreateAuctionParams,
  UpdateAuctionParams,
  AuctionResponse,
  AuctionResults,
} from './types/auction.types';
import type { BidEntry } from './types/bid.types';
import type {
  DistributionDetails,
  DistributionResult,
  ClaimResult,
} from './types/distribution.types';
import {
  isValidStellarAddress,
  generateAuctionId,
  generateBidId,
  generateTxHash,
  calculateMinNextBid,
  calculatePlatformFee,
} from './utils/auction.utils';

export interface MultiAuctionServiceOptions {
  platformFeePercentage?: number;
  timeProvider?: () => number;
}

export class MultiAuctionService {
  private auctions: Map<string, AuctionConfig> = new Map();
  private bids: Map<string, BidEntry[]> = new Map(); // auctionId -> BidEntry[]
  private distributions: Map<string, DistributionDetails> = new Map();
  private platformFeePercentage: number;
  private timeProvider?: () => number;

  constructor(options?: MultiAuctionServiceOptions) {
    this.platformFeePercentage =
      options?.platformFeePercentage ?? AUCTION_DEFAULTS.DEFAULT_PLATFORM_FEE_PERCENTAGE;
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

  private syncAuctionStatus(auction: AuctionConfig): AuctionConfig {
    const currentNow = this.now();
    if (
      auction.status === 'SCHEDULED' &&
      currentNow >= auction.startTime &&
      currentNow < auction.endTime
    ) {
      auction.status = 'ACTIVE';
      auction.updatedAt = currentNow;
    } else if (
      (auction.status === 'ACTIVE' || auction.status === 'SCHEDULED') &&
      currentNow >= auction.endTime
    ) {
      auction.status = 'ENDED';
      auction.updatedAt = currentNow;
    }
    return auction;
  }

  // ===========================================================================
  // 1. AUCTION MANAGEMENT
  // ===========================================================================

  public async createAuction(
    params: CreateAuctionParams
  ): Promise<AuctionResponse<AuctionConfig>> {
    if (!params.title || typeof params.title !== 'string' || !params.title.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: AUCTION_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    if (!params.seller || !isValidStellarAddress(params.seller)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_ADDRESS],
        errorCode: AUCTION_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (
      !params.assetAddress ||
      typeof params.assetAddress !== 'string' ||
      !params.assetAddress.trim()
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: AUCTION_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    if (
      typeof params.startingBid !== 'number' ||
      params.startingBid < 0 ||
      !Number.isFinite(params.startingBid)
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PRICE],
        errorCode: AUCTION_ERROR_CODES.INVALID_PRICE,
      };
    }

    const quantity = params.quantity ?? 1;
    if (typeof quantity !== 'number' || quantity <= 0 || !Number.isFinite(quantity)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_QUANTITY],
        errorCode: AUCTION_ERROR_CODES.INVALID_QUANTITY,
      };
    }

    const currentNow = this.now();
    const startTime = params.startTime ?? currentNow;
    const duration = params.durationSeconds ?? TIME_CONSTANTS.DEFAULT_AUCTION_DURATION;
    const endTime = params.endTime ?? startTime + duration;

    if (
      startTime < currentNow - TIME_CONSTANTS.CLOCK_DRIFT_TOLERANCE_SECONDS ||
      endTime <= startTime
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_TIME_RANGE],
        errorCode: AUCTION_ERROR_CODES.INVALID_TIME_RANGE,
      };
    }

    const minBidIncrement =
      params.minBidIncrement ?? AUCTION_DEFAULTS.DEFAULT_MIN_BID_INCREMENT;
    if (minBidIncrement <= 0 || !Number.isFinite(minBidIncrement)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PARAMETERS],
        errorCode: AUCTION_ERROR_CODES.INVALID_PARAMETERS,
      };
    }

    const reservePrice = params.reservePrice ?? 0;
    if (reservePrice < 0 || !Number.isFinite(reservePrice)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PRICE],
        errorCode: AUCTION_ERROR_CODES.INVALID_PRICE,
      };
    }

    const auctionId = generateAuctionId();
    const status: AuctionStatus = startTime > currentNow ? 'SCHEDULED' : 'ACTIVE';

    const auction: AuctionConfig = {
      id: auctionId,
      title: params.title.trim(),
      description: params.description?.trim() ?? '',
      seller: params.seller.trim(),
      assetAddress: params.assetAddress.trim(),
      quantity,
      currency: params.currency?.trim() || AUCTION_DEFAULTS.DEFAULT_CURRENCY,
      startingBid: params.startingBid,
      reservePrice,
      minBidIncrement,
      minBidIncrementType: params.minBidIncrementType ?? 'FIXED',
      startTime,
      endTime,
      status,
      auctionType: params.auctionType ?? 'STANDARD_ENGLISH',
      antiSnipeTimeWindowSeconds:
        params.antiSnipeTimeWindowSeconds ?? TIME_CONSTANTS.DEFAULT_ANTI_SNIPE_WINDOW,
      antiSnipeExtensionSeconds:
        params.antiSnipeExtensionSeconds ?? TIME_CONSTANTS.DEFAULT_ANTI_SNIPE_EXTENSION,
      allowBidWithdrawal: params.allowBidWithdrawal ?? false,
      totalBids: 0,
      totalVolume: 0,
      highestBid: 0,
      highestBidder: null,
      createdAt: currentNow,
      updatedAt: currentNow,
      metadata: params.metadata ? { ...params.metadata } : {},
    };

    this.auctions.set(auctionId, auction);
    this.bids.set(auctionId, []);

    return {
      success: true,
      data: { ...auction },
      transactionHash: generateTxHash(),
    };
  }

  public async getAuction(auctionId: string): Promise<AuctionResponse<AuctionConfig>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    return {
      success: true,
      data: { ...auction },
    };
  }

  public async updateAuction(
    auctionId: string,
    updates: UpdateAuctionParams
  ): Promise<AuctionResponse<AuctionConfig>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    if (auction.status === 'ENDED' || auction.status === 'DISTRIBUTED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED,
      };
    }

    if (auction.status === 'CANCELLED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED,
      };
    }

    if (updates.reservePrice !== undefined) {
      if (auction.totalBids > 0) {
        return {
          success: false,
          error: 'Cannot update reserve price after bids have been placed.',
          errorCode: AUCTION_ERROR_CODES.INVALID_PARAMETERS,
        };
      }
      if (updates.reservePrice < 0 || !Number.isFinite(updates.reservePrice)) {
        return {
          success: false,
          error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PRICE],
          errorCode: AUCTION_ERROR_CODES.INVALID_PRICE,
        };
      }
      auction.reservePrice = updates.reservePrice;
    }

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        return {
          success: false,
          error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PARAMETERS],
          errorCode: AUCTION_ERROR_CODES.INVALID_PARAMETERS,
        };
      }
      auction.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      auction.description = updates.description.trim();
    }

    if (updates.minBidIncrement !== undefined) {
      if (updates.minBidIncrement <= 0 || !Number.isFinite(updates.minBidIncrement)) {
        return {
          success: false,
          error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PARAMETERS],
          errorCode: AUCTION_ERROR_CODES.INVALID_PARAMETERS,
        };
      }
      auction.minBidIncrement = updates.minBidIncrement;
    }

    if (updates.minBidIncrementType !== undefined) {
      auction.minBidIncrementType = updates.minBidIncrementType;
    }

    if (updates.endTime !== undefined) {
      const currentNow = this.now();
      if (updates.endTime <= currentNow || updates.endTime <= auction.startTime) {
        return {
          success: false,
          error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_TIME_RANGE],
          errorCode: AUCTION_ERROR_CODES.INVALID_TIME_RANGE,
        };
      }
      auction.endTime = updates.endTime;
    }

    if (updates.metadata !== undefined) {
      auction.metadata = { ...auction.metadata, ...updates.metadata };
    }

    auction.updatedAt = this.now();
    return {
      success: true,
      data: { ...auction },
      transactionHash: generateTxHash(),
    };
  }

  public async cancelAuction(auctionId: string): Promise<AuctionResponse<boolean>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    if (auction.status === 'CANCELLED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED,
      };
    }

    if (auction.status === 'ENDED' || auction.status === 'DISTRIBUTED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED,
      };
    }

    if (auction.totalBids > 0) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_CANNOT_BE_CANCELLED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_CANNOT_BE_CANCELLED,
      };
    }

    auction.status = 'CANCELLED';
    auction.updatedAt = this.now();

    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async listAuctions(
    status?: AuctionStatus,
    limit?: number
  ): Promise<AuctionConfig[]> {
    const results: AuctionConfig[] = [];
    for (const auction of Array.from(this.auctions.values())) {
      this.syncAuctionStatus(auction);
      if (!status || auction.status === status) {
        results.push({ ...auction });
      }
    }
    results.sort((a, b) => b.createdAt - a.createdAt);
    return limit && limit > 0 ? results.slice(0, limit) : results;
  }

  // ===========================================================================
  // 2. BIDDING OPERATIONS
  // ===========================================================================

  public async placeBid(
    auctionId: string,
    amount: number,
    bidder: string
  ): Promise<AuctionResponse<BidEntry>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    if (!bidder || !isValidStellarAddress(bidder)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_ADDRESS],
        errorCode: AUCTION_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_PRICE],
        errorCode: AUCTION_ERROR_CODES.INVALID_PRICE,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    if (auction.status !== 'ACTIVE') {
      return {
        success: false,
        error:
          auction.status === 'ENDED'
            ? ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED]
            : ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_ACTIVE],
        errorCode:
          auction.status === 'ENDED'
            ? AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED
            : AUCTION_ERROR_CODES.AUCTION_NOT_ACTIVE,
      };
    }

    const normalizedBidder = bidder.trim();
    if (normalizedBidder.toLowerCase() === auction.seller.toLowerCase()) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.BIDDER_IS_SELLER],
        errorCode: AUCTION_ERROR_CODES.BIDDER_IS_SELLER,
      };
    }

    if (
      auction.highestBidder &&
      auction.highestBidder.toLowerCase() === normalizedBidder.toLowerCase()
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.BIDDER_ALREADY_HIGHEST],
        errorCode: AUCTION_ERROR_CODES.BIDDER_ALREADY_HIGHEST,
      };
    }

    // Min next bid requirement
    const minNextBid = calculateMinNextBid(
      auction.highestBid,
      auction.startingBid,
      auction.minBidIncrement,
      auction.minBidIncrementType
    );

    if (amount < minNextBid) {
      const code =
        auction.highestBid <= 0
          ? AUCTION_ERROR_CODES.BID_TOO_LOW
          : AUCTION_ERROR_CODES.BID_INCREMENT_NOT_MET;
      return {
        success: false,
        error: ERROR_MESSAGES[code],
        errorCode: code,
      };
    }

    const currentNow = this.now();

    // Anti-snipe time extension
    if (
      auction.antiSnipeTimeWindowSeconds &&
      auction.antiSnipeExtensionSeconds &&
      auction.endTime - currentNow <= auction.antiSnipeTimeWindowSeconds
    ) {
      auction.endTime += auction.antiSnipeExtensionSeconds;
    }

    // Mark previous active bid as outbid
    const auctionBids = this.bids.get(auctionId) || [];
    for (const b of auctionBids) {
      if (b.status === 'ACTIVE') {
        b.status = 'OUTBID';
      }
    }

    const bidEntry: BidEntry = {
      id: generateBidId(),
      auctionId,
      bidder: normalizedBidder,
      amount,
      timestamp: currentNow,
      status: 'ACTIVE',
      txHash: generateTxHash(),
    };

    auctionBids.push(bidEntry);
    this.bids.set(auctionId, auctionBids);

    auction.highestBid = amount;
    auction.highestBidder = normalizedBidder;
    auction.totalBids += 1;
    auction.totalVolume += amount;
    auction.updatedAt = currentNow;

    return {
      success: true,
      data: { ...bidEntry },
      transactionHash: bidEntry.txHash,
    };
  }

  public async updateBid(
    auctionId: string,
    newAmount: number,
    bidder: string
  ): Promise<AuctionResponse<BidEntry>> {
    return this.placeBid(auctionId, newAmount, bidder);
  }

  public async withdrawBid(
    auctionId: string,
    bidder: string
  ): Promise<AuctionResponse<boolean>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    if (!bidder || !isValidStellarAddress(bidder)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_ADDRESS],
        errorCode: AUCTION_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    if (!auction.allowBidWithdrawal) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.BID_WITHDRAWAL_NOT_ALLOWED],
        errorCode: AUCTION_ERROR_CODES.BID_WITHDRAWAL_NOT_ALLOWED,
      };
    }

    const normalizedBidder = bidder.trim().toLowerCase();
    if (
      auction.highestBidder &&
      auction.highestBidder.toLowerCase() === normalizedBidder
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.BID_CANNOT_WITHDRAW_HIGHEST],
        errorCode: AUCTION_ERROR_CODES.BID_CANNOT_WITHDRAW_HIGHEST,
      };
    }

    const auctionBids = this.bids.get(auctionId) || [];
    const bidderBid = auctionBids.find(
      (b) =>
        b.bidder.toLowerCase() === normalizedBidder &&
        (b.status === 'ACTIVE' || b.status === 'OUTBID')
    );

    if (!bidderBid) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.BID_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.BID_NOT_FOUND,
      };
    }

    bidderBid.status = 'WITHDRAWN';
    return {
      success: true,
      data: true,
      transactionHash: generateTxHash(),
    };
  }

  public async getBid(auctionId: string, bidder: string): Promise<BidEntry | null> {
    if (!auctionId || !bidder || !this.auctions.has(auctionId)) {
      return null;
    }
    const normalizedBidder = bidder.trim().toLowerCase();
    const auctionBids = this.bids.get(auctionId) || [];
    const matching = auctionBids.filter(
      (b) => b.bidder.toLowerCase() === normalizedBidder
    );

    return matching.length > 0 ? { ...matching[matching.length - 1] } : null;
  }

  public async getHighestBid(auctionId: string): Promise<BidEntry | null> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return null;
    }
    const auctionBids = this.bids.get(auctionId) || [];
    const active = auctionBids.find((b) => b.status === 'ACTIVE');
    return active ? { ...active } : null;
  }

  // ===========================================================================
  // 3. AUCTION EXECUTION & RESULTS
  // ===========================================================================

  public async endAuction(auctionId: string): Promise<AuctionResponse<AuctionResults>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    if (auction.status === 'CANCELLED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED,
      };
    }

    const currentNow = this.now();
    auction.status = 'ENDED';
    auction.updatedAt = currentNow;

    const reserveMet =
      auction.highestBid > 0 && auction.highestBid >= auction.reservePrice;
    const auctionBids = this.bids.get(auctionId) || [];

    if (reserveMet) {
      for (const b of auctionBids) {
        if (b.status === 'ACTIVE') {
          b.status = 'WON';
        }
      }
    } else {
      // If reserve not met or no bids, all bids are refunded
      for (const b of auctionBids) {
        if (b.status === 'ACTIVE' || b.status === 'OUTBID') {
          b.status = 'REFUNDED';
        }
      }
    }

    const results: AuctionResults = {
      auctionId,
      status: 'ENDED',
      winner: reserveMet ? auction.highestBidder : null,
      winningBid: reserveMet ? auction.highestBid : 0,
      reserveMet,
      totalBids: auction.totalBids,
      totalVolume: auction.totalVolume,
      endedAt: currentNow,
    };

    return {
      success: true,
      data: results,
      transactionHash: generateTxHash(),
    };
  }

  public async getAuctionResults(auctionId: string): Promise<AuctionResults> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      throw new Error(ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND]);
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    const reserveMet =
      auction.highestBid > 0 && auction.highestBid >= auction.reservePrice;

    return {
      auctionId,
      status: auction.status,
      winner: reserveMet ? auction.highestBidder : null,
      winningBid: reserveMet ? auction.highestBid : 0,
      reserveMet,
      totalBids: auction.totalBids,
      totalVolume: auction.totalVolume,
      endedAt: auction.endTime,
    };
  }

  // ===========================================================================
  // 4. DISTRIBUTION MANAGEMENT
  // ===========================================================================

  public async distributeAuction(
    auctionId: string
  ): Promise<AuctionResponse<DistributionResult>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    if (auction.status === 'CANCELLED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED,
      };
    }

    if (auction.status === 'DISTRIBUTED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_ALREADY_DISTRIBUTED],
        errorCode: AUCTION_ERROR_CODES.AUCTION_ALREADY_DISTRIBUTED,
      };
    }

    if (auction.status !== 'ENDED') {
      // If not marked ended yet, end it now
      await this.endAuction(auctionId);
    }

    const currentNow = this.now();
    const reserveMet =
      auction.highestBid > 0 && auction.highestBid >= auction.reservePrice;

    const winningBid = reserveMet ? auction.highestBid : 0;
    const winner = reserveMet ? auction.highestBidder : null;

    const { sellerPayout, platformFee } = calculatePlatformFee(
      winningBid,
      this.platformFeePercentage
    );

    const txHash = generateTxHash();
    const details: DistributionDetails = {
      auctionId,
      winner,
      winningBid,
      seller: auction.seller,
      sellerPayout,
      platformFee,
      platformFeePercentage: this.platformFeePercentage,
      quantity: auction.quantity,
      assetAddress: auction.assetAddress,
      status: 'PROCESSED',
      distributedAt: currentNow,
      claimedByWinner: false,
      claimedBySeller: false,
      txHash,
    };

    this.distributions.set(auctionId, details);
    auction.status = 'DISTRIBUTED';
    auction.updatedAt = currentNow;

    const result: DistributionResult = {
      success: true,
      auctionId,
      winner,
      seller: auction.seller,
      sellerPayout,
      platformFee,
      status: 'PROCESSED',
      txHash,
    };

    return {
      success: true,
      data: result,
      transactionHash: txHash,
    };
  }

  public async getDistribution(auctionId: string): Promise<DistributionDetails> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      throw new Error(ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND]);
    }

    if (this.distributions.has(auctionId)) {
      return { ...this.distributions.get(auctionId)! };
    }

    const auction = this.auctions.get(auctionId)!;
    return {
      auctionId,
      winner: null,
      winningBid: 0,
      seller: auction.seller,
      sellerPayout: 0,
      platformFee: 0,
      platformFeePercentage: this.platformFeePercentage,
      quantity: auction.quantity,
      assetAddress: auction.assetAddress,
      status: 'NOT_STARTED',
      claimedByWinner: false,
      claimedBySeller: false,
    };
  }

  public async processDistribution(
    auctionId: string
  ): Promise<AuctionResponse<boolean>> {
    const res = await this.distributeAuction(auctionId);
    if (!res.success) {
      return {
        success: false,
        error: res.error,
        errorCode: res.errorCode,
      };
    }
    return {
      success: true,
      data: true,
      transactionHash: res.transactionHash,
    };
  }

  public async getDistributionStatus(auctionId: string): Promise<string> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return 'NOT_FOUND';
    }
    const dist = this.distributions.get(auctionId);
    return dist ? dist.status : 'NOT_STARTED';
  }

  public async claimWinnings(
    auctionId: string,
    claimant: string
  ): Promise<AuctionResponse<ClaimResult>> {
    if (!auctionId || !this.auctions.has(auctionId)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.AUCTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.AUCTION_NOT_FOUND,
      };
    }

    if (!claimant || !isValidStellarAddress(claimant)) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.INVALID_ADDRESS],
        errorCode: AUCTION_ERROR_CODES.INVALID_ADDRESS,
      };
    }

    const auction = this.auctions.get(auctionId)!;
    this.syncAuctionStatus(auction);

    if (auction.status !== 'DISTRIBUTED' && auction.status !== 'ENDED') {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.DISTRIBUTION_NOT_READY],
        errorCode: AUCTION_ERROR_CODES.DISTRIBUTION_NOT_READY,
      };
    }

    // Auto-distribute if ended but not yet distributed
    if (auction.status === 'ENDED' && !this.distributions.has(auctionId)) {
      await this.distributeAuction(auctionId);
    }

    const dist = this.distributions.get(auctionId);
    if (!dist) {
      return {
        success: false,
        error: ERROR_MESSAGES[AUCTION_ERROR_CODES.DISTRIBUTION_NOT_FOUND],
        errorCode: AUCTION_ERROR_CODES.DISTRIBUTION_NOT_FOUND,
      };
    }

    const normalizedClaimant = claimant.trim().toLowerCase();

    // 1. Winner claims item
    if (dist.winner && dist.winner.toLowerCase() === normalizedClaimant) {
      if (dist.claimedByWinner) {
        return {
          success: false,
          error: ERROR_MESSAGES[AUCTION_ERROR_CODES.ALREADY_CLAIMED],
          errorCode: AUCTION_ERROR_CODES.ALREADY_CLAIMED,
        };
      }
      dist.claimedByWinner = true;
      if (dist.claimedBySeller) {
        dist.status = 'CLAIMED';
      }
      return {
        success: true,
        data: {
          success: true,
          auctionId,
          claimant: dist.winner,
          claimType: 'ITEM',
          amount: dist.quantity,
          assetAddress: dist.assetAddress,
          txHash: generateTxHash(),
        },
      };
    }

    // 2. Seller claims funds
    if (dist.seller.toLowerCase() === normalizedClaimant) {
      if (dist.claimedBySeller) {
        return {
          success: false,
          error: ERROR_MESSAGES[AUCTION_ERROR_CODES.ALREADY_CLAIMED],
          errorCode: AUCTION_ERROR_CODES.ALREADY_CLAIMED,
        };
      }
      dist.claimedBySeller = true;
      if (dist.claimedByWinner || !dist.winner) {
        dist.status = 'CLAIMED';
      }
      return {
        success: true,
        data: {
          success: true,
          auctionId,
          claimant: dist.seller,
          claimType: 'PAYOUT',
          amount: dist.sellerPayout,
          assetAddress: auction.currency,
          txHash: generateTxHash(),
        },
      };
    }

    // 3. Outbid / refunded bidder claims escrow refund
    const bids = this.bids.get(auctionId) || [];
    const bidderBid = bids.find(
      (b) =>
        b.bidder.toLowerCase() === normalizedClaimant &&
        (b.status === 'OUTBID' || b.status === 'REFUNDED')
    );

    if (bidderBid) {
      bidderBid.status = 'REFUNDED';
      return {
        success: true,
        data: {
          success: true,
          auctionId,
          claimant: bidderBid.bidder,
          claimType: 'REFUND',
          amount: bidderBid.amount,
          assetAddress: auction.currency,
          txHash: generateTxHash(),
        },
      };
    }

    return {
      success: false,
      error: ERROR_MESSAGES[AUCTION_ERROR_CODES.NOTHING_TO_CLAIM],
      errorCode: AUCTION_ERROR_CODES.NOTHING_TO_CLAIM,
    };
  }

  // ===========================================================================
  // 5. TEST & AUDIT HELPERS
  // ===========================================================================

  public resetState(): void {
    this.auctions.clear();
    this.bids.clear();
    this.distributions.clear();
  }

  public getRawBids(auctionId: string): BidEntry[] {
    return (this.bids.get(auctionId) || []).map((b) => ({ ...b }));
  }
}
