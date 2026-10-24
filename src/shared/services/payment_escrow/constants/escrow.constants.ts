export const ESCROW_ERROR_CODES = {
  // Authorization & Entity
  UNAUTHORIZED: 100,
  ESCROW_NOT_FOUND: 101,
  ESCROW_ALREADY_EXISTS: 102,
  ESCROW_NOT_FUNDED: 103,
  ESCROW_ALREADY_FUNDED: 104,
  ESCROW_ALREADY_RELEASED: 105,
  ESCROW_ALREADY_REFUNDED: 106,
  ESCROW_ALREADY_CANCELLED: 107,
  ESCROW_IN_DISPUTE: 108,
  CANNOT_CANCEL_FUNDED: 109,

  // Validation
  INVALID_PARAMETERS: 200,
  INVALID_ADDRESS: 201,
  INVALID_AMOUNT: 202,
  DEPOSIT_EXCEEDS_REQUIRED: 203,
  SAME_BUYER_SELLER: 204,

  // Disputes
  DISPUTE_NOT_FOUND: 300,
  DISPUTE_ALREADY_OPEN: 301,
  DISPUTE_ALREADY_RESOLVED: 302,
  DISPUTE_NOT_IN_DISPUTE_STATE: 303,

  // Arbitrator
  ARBITRATOR_NOT_ASSIGNED: 400,
  ARBITRATOR_MISMATCH: 401,
} as const;

export const ERROR_MESSAGES: Record<number, string> = {
  [ESCROW_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized caller for this escrow operation.',
  [ESCROW_ERROR_CODES.ESCROW_NOT_FOUND]: 'Escrow not found.',
  [ESCROW_ERROR_CODES.ESCROW_ALREADY_EXISTS]: 'Escrow already exists.',
  [ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED]: 'Escrow is not fully funded.',
  [ESCROW_ERROR_CODES.ESCROW_ALREADY_FUNDED]: 'Escrow is already fully funded.',
  [ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED]: 'Escrow funds have already been released.',
  [ESCROW_ERROR_CODES.ESCROW_ALREADY_REFUNDED]: 'Escrow funds have already been refunded.',
  [ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED]: 'Escrow has been cancelled.',
  [ESCROW_ERROR_CODES.ESCROW_IN_DISPUTE]: 'Escrow is currently in active dispute.',
  [ESCROW_ERROR_CODES.CANNOT_CANCEL_FUNDED]: 'Cannot cancel escrow with active deposited funds.',

  [ESCROW_ERROR_CODES.INVALID_PARAMETERS]: 'Invalid parameters provided.',
  [ESCROW_ERROR_CODES.INVALID_ADDRESS]: 'Invalid Stellar address format.',
  [ESCROW_ERROR_CODES.INVALID_AMOUNT]: 'Amount must be greater than zero.',
  [ESCROW_ERROR_CODES.DEPOSIT_EXCEEDS_REQUIRED]: 'Deposit amount exceeds remaining required escrow amount.',
  [ESCROW_ERROR_CODES.SAME_BUYER_SELLER]: 'Buyer and seller addresses must be different.',

  [ESCROW_ERROR_CODES.DISPUTE_NOT_FOUND]: 'Dispute not found.',
  [ESCROW_ERROR_CODES.DISPUTE_ALREADY_OPEN]: 'A dispute is already open for this escrow.',
  [ESCROW_ERROR_CODES.DISPUTE_ALREADY_RESOLVED]: 'Dispute has already been resolved.',
  [ESCROW_ERROR_CODES.DISPUTE_NOT_IN_DISPUTE_STATE]: 'Escrow must be in FUNDED state to open dispute.',

  [ESCROW_ERROR_CODES.ARBITRATOR_NOT_ASSIGNED]: 'No arbitrator assigned to this escrow.',
  [ESCROW_ERROR_CODES.ARBITRATOR_MISMATCH]: 'Caller is not the designated arbitrator.',
};

export const TIME_CONSTANTS = {
  DEFAULT_AUTO_RELEASE_SECONDS: 86400 * 7, // 7 days
  MIN_AUTO_RELEASE_SECONDS: 3600, // 1 hour
} as const;

export const ESCROW_DEFAULTS = {
  DEFAULT_CURRENCY: 'USDC',
} as const;
