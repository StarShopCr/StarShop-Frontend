import type { i128 } from '../types/payment.types';
import { 
  VALIDATION, 
  ERROR_CODE_MAPPING, 
  FEE_CALCULATION,
  SECURITY,
  PaymentErrorCode,
  DisputeErrorCode,
  RefundErrorCode
} from '../constants/payment.constants';
import type { 
  PaymentValidation, 
  RefundValidation, 
  DisputeValidation,
  AddressValidation,
  FormattedAmount,
  AmountFormatOptions,
  FeeCalculation
} from '../types/payment.types';
import type { 
  DisputeCreationValidation,
  EvidenceValidation,
  ArbitratorValidation,
  EvidenceType
} from '../types/dispute.types';

// ==================== ADDRESS VALIDATION ====================

/**
 * Validate Stellar address format
 */
export function validateStellarAddress(address: string): AddressValidation {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      address: address || '',
      error: 'Address is required'
    };
  }

  // Check length
  if (address.length !== VALIDATION.STELLAR_ADDRESS_LENGTH) {
    return {
      isValid: false,
      address,
      error: `Address must be ${VALIDATION.STELLAR_ADDRESS_LENGTH} characters long`
    };
  }

  // Check prefix
  if (!SECURITY.ALLOWED_ADDRESS_PREFIXES.includes(address[0] as 'G' | 'C')) {
    return {
      isValid: false,
      address,
      error: 'Invalid address prefix'
    };
  }

  // Check if it's a valid base32 string
  const base32Regex = /^[A-Z2-7]+$/;
  if (!base32Regex.test(address.slice(1))) {
    return {
      isValid: false,
      address,
      error: 'Invalid address format'
    };
  }

  return {
    isValid: true,
    address,
    type: 'stellar'
  };
}

/**
 * Validate contract address format
 */
export function validateContractAddress(address: string): AddressValidation {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      address: address || '',
      error: 'Contract address is required'
    };
  }

  // Check length
  if (address.length !== VALIDATION.CONTRACT_ADDRESS_LENGTH) {
    return {
      isValid: false,
      address,
      error: `Contract address must be ${VALIDATION.CONTRACT_ADDRESS_LENGTH} characters long`
    };
  }

  // Check if it's a valid hex string
  const hexRegex = /^[0-9A-Fa-f]+$/;
  if (!hexRegex.test(address)) {
    return {
      isValid: false,
      address,
      error: 'Invalid contract address format'
    };
  }

  return {
    isValid: true,
    address,
    type: 'contract'
  };
}

/**
 * Validate any address (stellar or contract)
 */
export function validateAddress(address: string): AddressValidation {
  const stellarValidation = validateStellarAddress(address);
  if (stellarValidation.isValid) {
    return stellarValidation;
  }

  const contractValidation = validateContractAddress(address);
  if (contractValidation.isValid) {
    return contractValidation;
  }

  return {
    isValid: false,
    address,
    error: 'Invalid address format'
  };
}

// ==================== AMOUNT VALIDATION ====================

/**
 * Validate payment amount
 */
export function validateAmount(amount: i128): PaymentValidation {
  const errors: string[] = [];

  if (!amount) {
    errors.push('Amount is required');
    return { isValid: false, errors };
  }

  // Convert to BigInt for validation
  const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount.toString());

  if (amountBigInt < VALIDATION.MIN_AMOUNT) {
    errors.push(`Amount must be at least ${VALIDATION.MIN_AMOUNT.toString()}`);
  }

  if (amountBigInt > VALIDATION.MAX_AMOUNT) {
    errors.push(`Amount must not exceed ${VALIDATION.MAX_AMOUNT.toString()}`);
  }

  if (amountBigInt < BigInt(0)) {
    errors.push('Amount cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate refund amount against available balance
 */
export function validateRefundAmount(
  refundAmount: i128, 
  availableBalance: i128
): RefundValidation {
  const amountValidation = validateAmount(refundAmount);
  
  if (!amountValidation.isValid) {
    return {
      isValid: false,
      error: amountValidation.errors.join(', ')
    };
  }

  const refundBigInt = typeof refundAmount === 'bigint' ? refundAmount : BigInt(refundAmount.toString());
  const balanceBigInt = typeof availableBalance === 'bigint' ? availableBalance : BigInt(availableBalance.toString());

  if (refundBigInt > balanceBigInt) {
    return {
      isValid: false,
      error: 'Refund amount exceeds available balance',
      availableBalance,
      maxRefundAmount: availableBalance
    };
  }

  return {
    isValid: true,
    availableBalance,
    maxRefundAmount: refundAmount
  };
}

/**
 * Format amount with decimals and symbol
 */
export function formatAmount(
  amount: i128, 
  decimals: number = 7, 
  symbol?: string
): FormattedAmount {
  const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount.toString());
  
  // Convert to decimal string
  const divisor = BigInt(Math.pow(10, decimals));
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  
  let formatted: string;
  
  if (fractionalPart === BigInt(0)) {
    formatted = wholePart.toString();
  } else {
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    formatted = trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
  }
  
  if (symbol) {
    formatted = `${formatted} ${symbol}`;
  }
  
  return {
    raw: amount,
    formatted,
    decimals,
    symbol
  };
}

/**
 * Parse amount from string to i128
 */
export function parseAmount(amountStr: string, decimals: number = 7): i128 {
  if (!amountStr || typeof amountStr !== 'string') {
    throw new Error('Amount string is required');
  }

  // Remove any non-numeric characters except decimal point
  const cleanAmount = amountStr.replace(/[^\d.]/g, '');
  
  if (!cleanAmount) {
    throw new Error('Invalid amount format');
  }

  const parts = cleanAmount.split('.');
  if (parts.length > 2) {
    throw new Error('Invalid decimal format');
  }

  const wholePart = parts[0] || '0';
  const fractionalPart = parts[1] || '';
  
  // Ensure fractional part doesn't exceed decimals
  if (fractionalPart.length > decimals) {
    throw new Error(`Too many decimal places. Maximum: ${decimals}`);
  }

  // Pad fractional part to required decimals
  const paddedFractional = fractionalPart.padEnd(decimals, '0');
  
  // Convert to i128
  const totalAmount = BigInt(wholePart) * BigInt(Math.pow(10, decimals)) + BigInt(paddedFractional);
  
  return totalAmount as i128;
}

// ==================== TOKEN ID VALIDATION ====================

/**
 * Validate token ID format
 */
export function validateTokenId(tokenId: string): PaymentValidation {
  const errors: string[] = [];

  if (!tokenId || typeof tokenId !== 'string') {
    errors.push('Token ID is required');
    return { isValid: false, errors };
  }

  if (tokenId.length < VALIDATION.MIN_TOKEN_ID_LENGTH || tokenId.length > VALIDATION.MAX_TOKEN_ID_LENGTH) {
    errors.push(`Token ID must be between ${VALIDATION.MIN_TOKEN_ID_LENGTH} and ${VALIDATION.MAX_TOKEN_ID_LENGTH} characters`);
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validTokenIdRegex = /^[a-zA-Z0-9\-_]+$/;
  if (!validTokenIdRegex.test(tokenId)) {
    errors.push('Token ID contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ==================== STRING VALIDATION ====================

/**
 * Validate and sanitize string input
 */
export function validateString(
  input: string, 
  fieldName: string, 
  maxLength?: number
): PaymentValidation {
  const errors: string[] = [];

  if (!input || typeof input !== 'string') {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  if (maxLength && input.length > maxLength) {
    errors.push(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }

  // Check for allowed characters
  if (!SECURITY.ALLOWED_STRING_CHARS.test(input)) {
    errors.push(`${fieldName} contains invalid characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// ==================== FEE CALCULATION ====================

/**
 * Calculate transaction fees
 */
export function calculateFees(
  operationType: 'deposit' | 'refund' | 'dispute' | 'admin' | 'simple',
  estimatedGas?: number
): FeeCalculation {
  let baseFee: number;
  
  switch (operationType) {
    case 'deposit':
      baseFee = FEE_CALCULATION.DEPOSIT_TRANSACTION;
      break;
    case 'refund':
      baseFee = FEE_CALCULATION.REFUND_TRANSACTION;
      break;
    case 'dispute':
      baseFee = FEE_CALCULATION.DISPUTE_TRANSACTION;
      break;
    case 'admin':
      baseFee = FEE_CALCULATION.ADMIN_TRANSACTION;
      break;
    default:
      baseFee = FEE_CALCULATION.SIMPLE_TRANSACTION;
  }

  const gasFee = estimatedGas ? Math.ceil(estimatedGas * FEE_CALCULATION.GAS_MULTIPLIER) : 0;
  const totalFee = Math.max(baseFee + gasFee, FEE_CALCULATION.MIN_FEE);

  return {
    baseFee,
    gasFee,
    totalFee: Math.min(totalFee, FEE_CALCULATION.MAX_FEE),
    estimatedGas: estimatedGas || 0
  };
}

// ==================== DISPUTE VALIDATION ====================

/**
 * Validate dispute creation request
 */
export function validateDisputeCreation(
  tokenId: string,
  buyer: string,
  seller: string,
  reason: string
): DisputeCreationValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate token ID
  const tokenValidation = validateTokenId(tokenId);
  if (!tokenValidation.isValid) {
    errors.push(...tokenValidation.errors);
  }

  // Validate addresses
  const buyerValidation = validateStellarAddress(buyer);
  if (!buyerValidation.isValid) {
    errors.push(`Invalid buyer address: ${buyerValidation.error}`);
  }

  const sellerValidation = validateStellarAddress(seller);
  if (!sellerValidation.isValid) {
    errors.push(`Invalid seller address: ${sellerValidation.error}`);
  }

  // Validate reason
  const reasonValidation = validateString(reason, 'Reason', VALIDATION.MAX_REASON_LENGTH);
  if (!reasonValidation.isValid) {
    errors.push(...reasonValidation.errors);
  }

  // Check if reason is too short
  if (reason && reason.length < 10) {
    warnings.push('Reason is quite short. Consider providing more details.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate evidence
 */
export function validateEvidence(
  evidence: string[],
  maxCount: number = VALIDATION.MAX_EVIDENCE_COUNT
): EvidenceValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!evidence || !Array.isArray(evidence)) {
    errors.push('Evidence must be an array');
    return { isValid: false, errors, warnings };
  }

  if (evidence.length > maxCount) {
    errors.push(`Maximum ${maxCount} evidence items allowed`);
  }

  if (evidence.length === 0) {
    warnings.push('No evidence provided. Consider adding supporting documents.');
  }

  evidence.forEach((item, index) => {
    if (!item || typeof item !== 'string') {
      errors.push(`Evidence item ${index + 1} is invalid`);
      return;
    }

    if (item.length > VALIDATION.MAX_STRING_LENGTH) {
      errors.push(`Evidence item ${index + 1} exceeds maximum length`);
    }

    if (item.length < 10) {
      warnings.push(`Evidence item ${index + 1} is quite short`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    maxSize: VALIDATION.MAX_EVIDENCE_SIZE,
    allowedTypes: [...VALIDATION.ALLOWED_EVIDENCE_TYPES] as EvidenceType[]
  };
}

/**
 * Validate arbitrator
 */
export function validateArbitrator(arbitratorAddress: string): ArbitratorValidation {
  const addressValidation = validateStellarAddress(arbitratorAddress);
  
  if (!addressValidation.isValid) {
    return {
      isValid: false,
      isAvailable: false,
      reputationScore: 0,
      specializationMatch: false,
      error: addressValidation.error
    };
  }

  // In a real implementation, you would check arbitrator registry
  // For now, return basic validation
  return {
    isValid: true,
    isAvailable: true,
    reputationScore: 85, // Mock score
    specializationMatch: true,
    responseTimeEstimate: 24 // hours
  };
}

// ==================== ERROR HANDLING ====================

/**
 * Map contract error to user-friendly message
 */
export function mapContractError(error: any): string {
  if (!error) {
    return 'Unknown error occurred';
  }

  const errorString = error.toString().toLowerCase();
  
  // Check for specific error patterns
  for (const [contractError, userError] of Object.entries(ERROR_CODE_MAPPING)) {
    if (errorString.includes(contractError.toLowerCase())) {
      return getErrorMessage(userError as PaymentErrorCode);
    }
  }

  // Check for common error patterns
  if (errorString.includes('insufficient')) {
    return getErrorMessage(PaymentErrorCode.INSUFFICIENT_FUNDS);
  }
  
  if (errorString.includes('unauthorized')) {
    return getErrorMessage(PaymentErrorCode.UNAUTHORIZED_ACCESS);
  }
  
  if (errorString.includes('invalid')) {
    return getErrorMessage(PaymentErrorCode.INVALID_AMOUNT);
  }
  
  if (errorString.includes('timeout')) {
    return getErrorMessage(PaymentErrorCode.TIMEOUT_ERROR);
  }

  return errorString;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(errorCode: PaymentErrorCode | DisputeErrorCode | RefundErrorCode): string {
  // This would typically import from a localization system
  const errorMessages: Record<string, string> = {
    // Payment errors
    [PaymentErrorCode.NOT_INITIALIZED]: 'Payment contract is not initialized',
    [PaymentErrorCode.ALREADY_INITIALIZED]: 'Payment contract is already initialized',
    [PaymentErrorCode.UNAUTHORIZED_ACCESS]: 'You do not have permission to perform this action',
    [PaymentErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds for this operation',
    [PaymentErrorCode.TRANSFER_FAILED]: 'Token transfer failed. Please try again.',
    [PaymentErrorCode.INVALID_AMOUNT]: 'Invalid amount specified',
    [PaymentErrorCode.INVALID_ADDRESS]: 'Invalid address format',
    [PaymentErrorCode.INVALID_TOKEN_ID]: 'Invalid token ID format',
    [PaymentErrorCode.DUPLICATE_TRANSACTION]: 'Duplicate transaction detected',
    [PaymentErrorCode.PAYMENT_NOT_FOUND]: 'Payment not found',
    [PaymentErrorCode.CONTRACT_ERROR]: 'Contract execution error',
    [PaymentErrorCode.NETWORK_ERROR]: 'Network connection error',
    [PaymentErrorCode.WALLET_ERROR]: 'Wallet operation failed',
    [PaymentErrorCode.VALIDATION_ERROR]: 'Input validation failed',
    [PaymentErrorCode.TIMEOUT_ERROR]: 'Request timeout',
    
    // Dispute errors
    [DisputeErrorCode.DISPUTE_NOT_FOUND]: 'Dispute not found',
    [DisputeErrorCode.DISPUTE_ALREADY_RESOLVED]: 'Dispute has already been resolved',
    [DisputeErrorCode.INVALID_ARBITRATOR]: 'Invalid arbitrator address',
    [DisputeErrorCode.INVALID_DECISION]: 'Invalid dispute decision',
    [DisputeErrorCode.INSUFFICIENT_EVIDENCE]: 'Insufficient evidence provided',
    [DisputeErrorCode.UNAUTHORIZED_ARBITRATOR]: 'Unauthorized arbitrator access',
    
    // Refund errors
    [RefundErrorCode.REFUND_NOT_ELIGIBLE]: 'Payment is not eligible for refund',
    [RefundErrorCode.REFUND_AMOUNT_EXCEEDS_BALANCE]: 'Refund amount exceeds available balance',
    [RefundErrorCode.REFUND_ALREADY_PROCESSED]: 'Refund has already been processed',
    [RefundErrorCode.INVALID_REFUND_AMOUNT]: 'Invalid refund amount',
    [RefundErrorCode.REFUND_PERIOD_EXPIRED]: 'Refund period has expired'
  };

  return errorMessages[errorCode] || 'An unknown error occurred';
}

/**
 * Determine error type from error message
 */
export function getErrorType(error: any): PaymentErrorCode {
  if (!error) {
    return PaymentErrorCode.CONTRACT_ERROR;
  }

  const errorString = error.toString().toLowerCase();
  
  if (errorString.includes('insufficient')) {
    return PaymentErrorCode.INSUFFICIENT_FUNDS;
  }
  
  if (errorString.includes('unauthorized')) {
    return PaymentErrorCode.UNAUTHORIZED_ACCESS;
  }
  
  if (errorString.includes('invalid')) {
    return PaymentErrorCode.INVALID_AMOUNT;
  }
  
  if (errorString.includes('timeout')) {
    return PaymentErrorCode.TIMEOUT_ERROR;
  }
  
  if (errorString.includes('network')) {
    return PaymentErrorCode.NETWORK_ERROR;
  }
  
  if (errorString.includes('wallet')) {
    return PaymentErrorCode.WALLET_ERROR;
  }

  return PaymentErrorCode.CONTRACT_ERROR;
}

// ==================== RETRY LOGIC ====================

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// ==================== CACHE UTILITIES ====================

/**
 * Generate cache key for payment data
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * Check if cache entry is expired
 */
export function isCacheExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

// ==================== DATA TRANSFORMATION ====================

/**
 * Convert BigInt to string safely
 */
export function bigIntToString(value: i128): string {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return String(value);
}

/**
 * Convert string to BigInt safely
 */
export function stringToBigInt(value: string): i128 {
  try {
    return BigInt(value) as i128;
  } catch {
    throw new Error(`Invalid BigInt value: ${value}`);
  }
}

/**
 * Deep clone object (for immutable updates)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// ==================== VALIDATION HELPERS ====================

/**
 * Check if value is a valid i128
 */
export function isValidI128(value: any): value is i128 {
  try {
    if (typeof value === 'bigint') {
      return true;
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      BigInt(value);
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid timestamp
 */
export function isValidTimestamp(timestamp: any): boolean {
  const ts = typeof timestamp === 'number' ? timestamp : parseInt(String(timestamp));
  return !isNaN(ts) && ts > 0 && ts < Date.now() + 86400000; // Not more than 1 day in future
}

/**
 * Check if value is a valid transaction hash
 */
export function isValidTransactionHash(hash: any): boolean {
  if (typeof hash !== 'string') {
    return false;
  }
  
  // Stellar transaction hashes are 64 character hex strings
  return /^[a-f0-9]{64}$/i.test(hash);
}
