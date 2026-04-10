import type { u32, u64 } from '@stellar/stellar-sdk';

/**
 * Access control tier levels
 */
export enum AccessTier {
  /** No access */
  NONE = 0,
  /** Basic / public access */
  PUBLIC = 1,
  /** Allowlist / whitelist access */
  WHITELIST = 2,
  /** VIP access with priority */
  VIP = 3,
  /** Admin-level access */
  ADMIN = 4,
}

/**
 * Access grant types
 */
export enum AccessGrantType {
  /** Manually granted by admin */
  MANUAL = 'manual',
  /** Granted via allowlist import */
  ALLOWLIST_IMPORT = 'allowlist_import',
  /** Granted due to token holding */
  TOKEN_GATE = 'token_gate',
  /** Granted via referral */
  REFERRAL = 'referral',
  /** Granted by smart contract logic */
  CONTRACT_RULE = 'contract_rule',
}

/**
 * Access record for a single address on a single drop
 */
export interface AccessRecord {
  /** Drop ID this record belongs to */
  dropId: u32;
  /** Address that has access */
  address: string;
  /** Tier level */
  tier: AccessTier;
  /** How the access was granted */
  grantType: AccessGrantType;
  /** Admin that granted access */
  grantedBy: string;
  /** Ledger sequence when access was granted */
  grantedAt: u64;
  /** Optional expiry (0 = no expiry) */
  expiresAt?: u64;
  /** Whether access is currently valid */
  isActive: boolean;
  /** Optional metadata */
  metadata?: Record<string, string>;
}

/**
 * Request to check whether an address has access to a drop
 */
export interface CheckAccessRequest {
  /** Drop ID */
  dropId: u32;
  /** Address to check */
  address: string;
  /** Minimum required tier (default PUBLIC) */
  requiredTier?: AccessTier;
}

/**
 * Result of an access check
 */
export interface AccessCheckResult {
  /** Whether the address has sufficient access */
  hasAccess: boolean;
  /** The address that was checked */
  address: string;
  /** Drop ID that was checked */
  dropId: u32;
  /** Current tier of the address */
  currentTier: AccessTier;
  /** Required tier for the check */
  requiredTier: AccessTier;
  /** Detailed access record if available */
  record?: AccessRecord;
  /** Reason if access is denied */
  deniedReason?: string;
}

/**
 * Request to grant access to an address
 */
export interface GrantAccessRequest {
  /** Drop ID */
  dropId: u32;
  /** Admin address making the grant */
  admin: string;
  /** Address to grant access to */
  grantee: string;
  /** Tier level to grant */
  tier: AccessTier;
  /** Grant type reason */
  grantType?: AccessGrantType;
  /** Optional expiry timestamp */
  expiresAt?: u64;
  /** Optional metadata */
  metadata?: Record<string, string>;
}

/**
 * Request to revoke access from an address
 */
export interface RevokeAccessRequest {
  /** Drop ID */
  dropId: u32;
  /** Admin address making the revocation */
  admin: string;
  /** Address to revoke access from */
  address: string;
  /** Optional reason for revocation */
  reason?: string;
}

/**
 * Response containing a paginated list of access records
 */
export interface AccessListResponse {
  /** List of access records */
  records: AccessRecord[];
  /** Total number of records (for pagination) */
  total: u32;
  /** Pagination offset used */
  offset: u32;
  /** Pagination limit used */
  limit: u32;
  /** Whether there are more records */
  hasMore: boolean;
}

/**
 * Options when requesting the access list
 */
export interface GetAccessListOptions {
  /** Drop ID */
  dropId: u32;
  /** Filter by tier */
  tier?: AccessTier;
  /** Filter by grant type */
  grantType?: AccessGrantType;
  /** Include inactive/expired records */
  includeInactive?: boolean;
  /** Pagination offset */
  offset?: u32;
  /** Pagination limit */
  limit?: u32;
}

/**
 * Batch grant request for multiple addresses
 */
export interface BatchGrantAccessRequest {
  /** Drop ID */
  dropId: u32;
  /** Admin address */
  admin: string;
  /** List of addresses to grant access to */
  grantees: string[];
  /** Tier to grant to all addresses */
  tier: AccessTier;
  /** Grant type for all */
  grantType?: AccessGrantType;
  /** Optional expiry for all */
  expiresAt?: u64;
}

/**
 * Result of a batch grant operation
 */
export interface BatchGrantResult {
  /** Total addresses processed */
  total: number;
  /** Successfully granted */
  succeeded: number;
  /** Failed to grant */
  failed: number;
  /** List of (address, error) for failures */
  failures: Array<{ address: string; error: string }>;
  /** Transaction hashes if applicable */
  transactionHashes?: string[];
}

/**
 * Token gate configuration for a drop
 */
export interface TokenGateConfig {
  /** Drop ID this gate applies to */
  dropId: u32;
  /** Contract address of the token/NFT */
  tokenContractAddress: string;
  /** Minimum balance required */
  minimumBalance: u64;
  /** Token type label */
  tokenType: 'nft' | 'fungible';
  /** Tier granted on successful gate */
  grantedTier: AccessTier;
  /** Whether the gate is active */
  isActive: boolean;
}

/**
 * Access statistics for a drop
 */
export interface AccessStatistics {
  /** Drop ID */
  dropId: u32;
  /** Total addresses with any access */
  totalGranted: u32;
  /** Breakdown by tier */
  tierBreakdown: Record<AccessTier, u32>;
  /** Breakdown by grant type */
  grantTypeBreakdown: Record<AccessGrantType, u32>;
  /** Addresses that have participated */
  participationRate: number;
  /** Addresses that have NOT yet participated */
  unusedAccessCount: u32;
}

/**
 * Access validation result
 */
export interface AccessValidation {
  /** Whether the access configuration is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings?: string[];
}

/**
 * Access event types
 */
export enum AccessEventType {
  GRANTED = 'access_granted',
  REVOKED = 'access_revoked',
  EXPIRED = 'access_expired',
  CHECKED = 'access_checked',
  BATCH_GRANTED = 'access_batch_granted',
  TOKEN_GATE_VERIFIED = 'token_gate_verified',
  ERROR = 'error',
}

/**
 * Access event data
 */
export interface AccessEventData {
  /** Event type */
  type: AccessEventType;
  /** Timestamp */
  timestamp: number;
  /** Drop ID */
  dropId?: u32;
  /** Address affected */
  address?: string;
  /** Admin performing the action */
  admin?: string;
  /** Tier affected */
  tier?: AccessTier;
  /** Transaction hash */
  transactionHash?: string;
  /** Error if type is ERROR */
  error?: string;
}

export type { u32, u64 };
