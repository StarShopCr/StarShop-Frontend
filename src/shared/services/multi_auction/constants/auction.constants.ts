export const NETWORKS = {
  TESTNET: 'Test SDF Network ; September 2015',
  MAINNET: 'Public Global Stellar Network ; September 2015',
} as const;

export const DEFAULT_CONFIG = {
  networkPassphrase: NETWORKS.TESTNET,
  contractAddress: '',
  defaultTimeout: 30000,
  maxRetries: 3,
  cacheEnabled: true,
  cacheTtl: 60000,
} as const;

export const CONTRACT_METHODS = {
  CREATE_AUCTION: 'create_auction',
  GET_AUCTION: 'get_auction',
  UPDATE_AUCTION: 'update_auction',
  CANCEL_AUCTION: 'cancel_auction',
  LIST_AUCTIONS: 'list_auctions',
  PLACE_BID: 'place_bid',
  UPDATE_BID: 'update_bid',
  WITHDRAW_BID: 'withdraw_bid',
  GET_BID: 'get_bid',
  GET_HIGHEST_BID: 'get_highest_bid',
  END_AUCTION: 'end_auction',
  DISTRIBUTE_AUCTION: 'distribute_auction',
  CLAIM_WINNINGS: 'claim_winnings',
  GET_AUCTION_RESULTS: 'get_auction_results',
  GET_DISTRIBUTION: 'get_distribution',
  PROCESS_DISTRIBUTION: 'process_distribution',
  GET_DISTRIBUTION_STATUS: 'get_distribution_status',
} as const;

export const CONTRACT_EVENTS = {
  AUCTION_CREATED: 'auction_created',
  AUCTION_UPDATED: 'auction_updated',
  AUCTION_CANCELLED: 'auction_cancelled',
  AUCTION_ENDED: 'auction_ended',
  BID_PLACED: 'bid_placed',
  BID_UPDATED: 'bid_updated',
  BID_WITHDRAWN: 'bid_withdrawn',
  DISTRIBUTION_STARTED: 'distribution_started',
  DISTRIBUTION_COMPLETED: 'distribution_completed',
  WINNINGS_CLAIMED: 'winnings_claimed',
} as const;

export const ERROR_MESSAGES = {
  NOT_CONNECTED: 'Wallet not connected',
  INVALID_AUCTION_ID: 'Invalid auction ID',
  INVALID_BID_AMOUNT: 'Invalid bid amount',
  AUCTION_NOT_FOUND: 'Auction not found',
  AUCTION_NOT_ACTIVE: 'Auction is not active',
  AUCTION_ENDED: 'Auction has ended',
  BID_TOO_LOW: 'Bid amount is below minimum increment',
  BID_NOT_FOUND: 'Bid not found',
  UNAUTHORIZED: 'Unauthorized operation',
  DISTRIBUTION_FAILED: 'Distribution processing failed',
  ALREADY_CLAIMED: 'Winnings already claimed',
  INVALID_ADDRESS: 'Invalid Stellar address',
  TIMEOUT: 'Transaction timeout',
  NETWORK_ERROR: 'Network error occurred',
} as const;

export const AUCTION_ERROR_CODES = {
  INVALID_CONFIG: 1001,
  AUCTION_NOT_FOUND: 1002,
  AUCTION_NOT_ACTIVE: 1003,
  UNAUTHORIZED: 1004,
  BID_TOO_LOW: 2001,
  BID_NOT_FOUND: 2002,
  WITHDRAWAL_NOT_ALLOWED: 2003,
  MAX_BIDDERS_REACHED: 2004,
  DISTRIBUTION_PENDING: 3001,
  DISTRIBUTION_FAILED: 3002,
  ALREADY_DISTRIBUTED: 3003,
  NOTHING_TO_CLAIM: 3004,
  NETWORK_ERROR: 9001,
  TIMEOUT: 9002,
} as const;

export const VALIDATION = {
  MIN_AUCTION_DURATION: 3600,
  MAX_AUCTION_DURATION: 2592000,
  MIN_START_PRICE: BigInt(1),
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_BID_INCREMENT_PERCENT: 1,
  MAX_BIDDERS_LIMIT: 10000,
  DEFAULT_MAX_BIDDERS: 1000,
} as const;

export const CACHE_KEYS = {
  AUCTION_PREFIX: 'auction:',
  BID_PREFIX: 'bid:',
  DISTRIBUTION_PREFIX: 'dist:',
  RESULTS_PREFIX: 'results:',
  LIST_PREFIX: 'list:',
} as const;
