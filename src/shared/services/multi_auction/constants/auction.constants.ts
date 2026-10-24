export const AUCTION_ERROR_CODES = {
  // Authorization & Entity
  UNAUTHORIZED: 100,
  AUCTION_NOT_FOUND: 101,
  AUCTION_ALREADY_EXISTS: 102,
  AUCTION_NOT_ACTIVE: 103,
  AUCTION_ALREADY_ENDED: 104,
  AUCTION_ALREADY_CANCELLED: 105,
  AUCTION_NOT_ENDED: 106,
  AUCTION_CANNOT_BE_CANCELLED: 107,
  AUCTION_ALREADY_DISTRIBUTED: 108,

  // Validation
  INVALID_PARAMETERS: 200,
  INVALID_ADDRESS: 201,
  INVALID_PRICE: 202,
  INVALID_TIME_RANGE: 203,
  INVALID_QUANTITY: 204,

  // Bidding
  BID_TOO_LOW: 300,
  BID_INCREMENT_NOT_MET: 301,
  BIDDER_IS_SELLER: 302,
  BIDDER_ALREADY_HIGHEST: 303,
  BID_NOT_FOUND: 304,
  BID_WITHDRAWAL_NOT_ALLOWED: 305,
  BID_CANNOT_WITHDRAW_HIGHEST: 306,

  // Distribution & Claims
  DISTRIBUTION_NOT_FOUND: 400,
  DISTRIBUTION_ALREADY_PROCESSED: 401,
  DISTRIBUTION_NOT_READY: 402,
  NOTHING_TO_CLAIM: 403,
  ALREADY_CLAIMED: 404,
  RESERVE_PRICE_NOT_MET: 405,
} as const;

export const ERROR_MESSAGES: Record<number, string> = {
  [AUCTION_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized action on auction.',
  [AUCTION_ERROR_CODES.AUCTION_NOT_FOUND]: 'Auction not found.',
  [AUCTION_ERROR_CODES.AUCTION_ALREADY_EXISTS]: 'Auction already exists.',
  [AUCTION_ERROR_CODES.AUCTION_NOT_ACTIVE]: 'Auction is not active.',
  [AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED]: 'Auction has already ended.',
  [AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED]: 'Auction has been cancelled.',
  [AUCTION_ERROR_CODES.AUCTION_NOT_ENDED]: 'Auction is still active and has not ended.',
  [AUCTION_ERROR_CODES.AUCTION_CANNOT_BE_CANCELLED]: 'Auction with active bids cannot be cancelled.',
  [AUCTION_ERROR_CODES.AUCTION_ALREADY_DISTRIBUTED]: 'Auction rewards have already been distributed.',

  [AUCTION_ERROR_CODES.INVALID_PARAMETERS]: 'Invalid parameters provided.',
  [AUCTION_ERROR_CODES.INVALID_ADDRESS]: 'Invalid Stellar address format.',
  [AUCTION_ERROR_CODES.INVALID_PRICE]: 'Invalid price or starting bid value.',
  [AUCTION_ERROR_CODES.INVALID_TIME_RANGE]: 'Start time must be before end time and not in the past.',
  [AUCTION_ERROR_CODES.INVALID_QUANTITY]: 'Item quantity must be greater than zero.',

  [AUCTION_ERROR_CODES.BID_TOO_LOW]: 'Bid amount is below starting bid.',
  [AUCTION_ERROR_CODES.BID_INCREMENT_NOT_MET]: 'Bid does not meet minimum increment requirement.',
  [AUCTION_ERROR_CODES.BIDDER_IS_SELLER]: 'Seller cannot bid on their own auction.',
  [AUCTION_ERROR_CODES.BIDDER_ALREADY_HIGHEST]: 'You are already the highest bidder.',
  [AUCTION_ERROR_CODES.BID_NOT_FOUND]: 'No active bid found for bidder.',
  [AUCTION_ERROR_CODES.BID_WITHDRAWAL_NOT_ALLOWED]: 'Bid withdrawal is not permitted for this auction.',
  [AUCTION_ERROR_CODES.BID_CANNOT_WITHDRAW_HIGHEST]: 'Cannot withdraw the current highest winning bid.',

  [AUCTION_ERROR_CODES.DISTRIBUTION_NOT_FOUND]: 'Distribution details not found.',
  [AUCTION_ERROR_CODES.DISTRIBUTION_ALREADY_PROCESSED]: 'Auction distribution has already been processed.',
  [AUCTION_ERROR_CODES.DISTRIBUTION_NOT_READY]: 'Auction must be ended before processing distribution.',
  [AUCTION_ERROR_CODES.NOTHING_TO_CLAIM]: 'No winnings or payouts available for claimant.',
  [AUCTION_ERROR_CODES.ALREADY_CLAIMED]: 'Winnings or payout have already been claimed.',
  [AUCTION_ERROR_CODES.RESERVE_PRICE_NOT_MET]: 'Reserve price was not met for this auction.',
};

export const TIME_CONSTANTS = {
  SECONDS_IN_MINUTE: 60,
  SECONDS_IN_HOUR: 3600,
  SECONDS_IN_DAY: 86400,
  DEFAULT_AUCTION_DURATION: 86400 * 3, // 3 days
  CLOCK_DRIFT_TOLERANCE_SECONDS: 60,
  DEFAULT_ANTI_SNIPE_WINDOW: 300, // 5 minutes
  DEFAULT_ANTI_SNIPE_EXTENSION: 300, // 5 minutes
} as const;

export const AUCTION_DEFAULTS = {
  DEFAULT_CURRENCY: 'USDC',
  DEFAULT_MIN_BID_INCREMENT: 1.0,
  DEFAULT_MIN_BID_INCREMENT_PERCENTAGE: 5.0, // 5%
  DEFAULT_PLATFORM_FEE_PERCENTAGE: 2.5, // 2.5%
} as const;
