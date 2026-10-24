export { MultiAuctionService } from './auction.service';
export type { MultiAuctionServiceOptions } from './auction.service';

export type {
  AuctionConfig,
  AuctionStatus,
  AuctionType,
  CreateAuctionParams,
  UpdateAuctionParams,
  AuctionResponse,
  AuctionResults,
} from './types/auction.types';

export type {
  BidEntry,
  BidStatus,
  PlaceBidParams,
  HighestBidResult,
} from './types/bid.types';

export type {
  DistributionDetails,
  DistributionResult,
  DistributionStatus,
  ClaimResult,
  ClaimType,
} from './types/distribution.types';

export {
  AUCTION_ERROR_CODES,
  ERROR_MESSAGES,
  TIME_CONSTANTS,
  AUCTION_DEFAULTS,
} from './constants/auction.constants';

export {
  isValidStellarAddress,
  generateAuctionId,
  generateBidId,
  generateTxHash,
  calculateMinNextBid,
  calculatePlatformFee,
  formatDuration,
} from './utils/auction.utils';
