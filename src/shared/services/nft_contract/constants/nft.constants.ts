import type { u32 } from '../types/nft.types';
import { AttributeType } from '../types/metadata.types';

/**
 * Error codes for the NFT contract
 */
export const NFT_ERROR_CODES = {
  ALREADY_INITIALIZED: 1,
  UNAUTHORIZED: 2,
  INVALID_METADATA: 3,
  NFT_NOT_FOUND: 4,
  NOT_OWNER: 5,
  INVALID_ADDRESS: 6,
  INVALID_TOKEN_ID: 7,
  SUPPLY_EXCEEDED: 8,
  METADATA_TOO_LONG: 9,
  INVALID_ATTRIBUTES: 10,
  TRANSFER_FAILED: 11,
  BURN_FAILED: 12,
  METADATA_UPDATE_FAILED: 13,
  SUPPLY_UPDATE_FAILED: 14,
  ADMIN_UPDATE_FAILED: 15,
  CONTRACT_NOT_INITIALIZED: 16,
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [NFT_ERROR_CODES.ALREADY_INITIALIZED]: 'Contract has already been initialized',
  [NFT_ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access - admin privileges required',
  [NFT_ERROR_CODES.INVALID_METADATA]: 'Invalid metadata provided',
  [NFT_ERROR_CODES.NFT_NOT_FOUND]: 'NFT not found',
  [NFT_ERROR_CODES.NOT_OWNER]: 'Not the owner of this NFT',
  [NFT_ERROR_CODES.INVALID_ADDRESS]: 'Invalid address format',
  [NFT_ERROR_CODES.INVALID_TOKEN_ID]: 'Invalid token ID',
  [NFT_ERROR_CODES.SUPPLY_EXCEEDED]: 'Maximum supply exceeded',
  [NFT_ERROR_CODES.METADATA_TOO_LONG]: 'Metadata exceeds maximum length',
  [NFT_ERROR_CODES.INVALID_ATTRIBUTES]: 'Invalid attributes provided',
  [NFT_ERROR_CODES.TRANSFER_FAILED]: 'NFT transfer failed',
  [NFT_ERROR_CODES.BURN_FAILED]: 'NFT burn failed',
  [NFT_ERROR_CODES.METADATA_UPDATE_FAILED]: 'Metadata update failed',
  [NFT_ERROR_CODES.SUPPLY_UPDATE_FAILED]: 'Supply update failed',
  [NFT_ERROR_CODES.ADMIN_UPDATE_FAILED]: 'Admin update failed',
  [NFT_ERROR_CODES.CONTRACT_NOT_INITIALIZED]: 'Contract not initialized',
} as const;

/**
 * Network configurations
 */
export const NETWORKS = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CC2RU4MBM2NBA5FJXLAAPC2PL35WMT2RJ2SSH4OHUFXTPACJL7W5PH5G',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true,
  },
  mainnet: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    contractId: '', // To be set when deployed to mainnet
    rpcUrl: 'https://horizon.stellar.org',
    isTestnet: false,
  },
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  /** Default transaction timeout in seconds */
  TIMEOUT_SECONDS: 30,
  /** Default transaction fee in stroops */
  FEE: 100000,
  /** Default simulation enabled */
  SIMULATE: true,
  /** Default retry configuration */
  RETRY: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  /** Default cache configuration */
  CACHE: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000,
  },
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Maximum NFT name length */
  MAX_NAME_LENGTH: 100,
  /** Maximum NFT description length */
  MAX_DESCRIPTION_LENGTH: 1000,
  /** Maximum number of attributes */
  MAX_ATTRIBUTES: 50,
  /** Maximum attribute name length */
  MAX_ATTRIBUTE_NAME_LENGTH: 50,
  /** Maximum attribute value length */
  MAX_ATTRIBUTE_VALUE_LENGTH: 200,
  /** Maximum total metadata size in bytes */
  MAX_METADATA_SIZE: 10000,
  /** Minimum supply */
  MIN_SUPPLY: 1,
  /** Maximum supply */
  MAX_SUPPLY: 1000000,
  /** Maximum batch size for operations */
  MAX_BATCH_SIZE: 100,
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  /** NFT metadata cache key */
  METADATA: (tokenId: u32) => `nft:metadata:${tokenId}`,
  /** NFT owner cache key */
  OWNER: (tokenId: u32) => `nft:owner:${tokenId}`,
  /** NFT existence cache key */
  EXISTS: (tokenId: u32) => `nft:exists:${tokenId}`,
  /** Supply info cache key */
  SUPPLY_INFO: 'nft:supply:info',
  /** Admin cache key */
  ADMIN: 'nft:admin',
  /** Contract initialization cache key */
  INITIALIZED: 'nft:initialized',
  /** NFT list cache key */
  NFT_LIST: (owner?: string) => owner ? `nft:list:${owner}` : 'nft:list:all',
} as const;

/**
 * Common error types
 */
export const ERROR_TYPES = {
  /** Network/connection errors */
  NETWORK_ERROR: 'network_error',
  /** Contract/transaction errors */
  CONTRACT_ERROR: 'contract_error',
  /** Validation errors */
  VALIDATION_ERROR: 'validation_error',
  /** Wallet errors */
  WALLET_ERROR: 'wallet_error',
  /** Supply errors */
  SUPPLY_ERROR: 'supply_error',
  /** Ownership errors */
  OWNERSHIP_ERROR: 'ownership_error',
  /** Metadata errors */
  METADATA_ERROR: 'metadata_error',
  /** Unknown errors */
  UNKNOWN_ERROR: 'unknown_error',
} as const;

/**
 * API endpoints for external services
 */
export const API_ENDPOINTS = {
  /** Stellar Horizon API */
  HORIZON_TESTNET: 'https://horizon-testnet.stellar.org',
  HORIZON_MAINNET: 'https://horizon.stellar.org',
  /** Soroban RPC */
  SOROBAN_TESTNET: 'https://soroban-testnet.stellar.org',
  SOROBAN_MAINNET: 'https://soroban-mainnet.stellar.org',
} as const;

/**
 * Wallet provider IDs
 */
export const WALLET_PROVIDERS = {
  FREIGHTER: 'freighter',
  RABET: 'rabet',
  XBULL: 'xbull',
  LOBSTR: 'lobstr',
} as const;

/**
 * NFT contract method names
 */
export const CONTRACT_METHODS = {
  INITIALIZE: 'initialize',
  GET_ADMIN: 'get_admin',
  VERIFY_ADMIN: 'verify_admin',
  IS_INITIALIZED: 'is_initialized',
  SET_MAX_SUPPLY: 'set_max_supply',
  GET_MAX_SUPPLY: 'get_max_supply',
  GET_CURRENT_SUPPLY: 'get_current_supply',
  MINT_NFT: 'mint_nft',
  GET_OWNER: 'get_owner',
  NFT_EXISTS: 'nft_exists',
  TRANSFER_NFT: 'transfer_nft',
  BURN_NFT: 'burn_nft',
  GET_METADATA: 'get_metadata',
  UPDATE_METADATA: 'update_metadata',
  VALIDATE_METADATA: 'validate_metadata',
} as const;

/**
 * Event names for NFT contract
 */
export const CONTRACT_EVENTS = {
  NFT_MINTED: 'NFTMinted',
  NFT_TRANSFERRED: 'NFTTransferred',
  NFT_BURNED: 'NFTBurned',
  METADATA_UPDATED: 'MetadataUpdated',
  SUPPLY_CHANGED: 'SupplyChanged',
  ADMIN_CHANGED: 'AdminChanged',
  CONTRACT_INITIALIZED: 'ContractInitialized',
} as const;

/**
 * Metadata templates for common NFT types
 */
export const METADATA_TEMPLATES = {
  ART: {
    id: 'art',
    name: 'Digital Art',
    description: 'Digital artwork NFT',
    attributes: [
      { trait_type: 'Artist', type: AttributeType.STRING },
      { trait_type: 'Medium', type: AttributeType.STRING },
      { trait_type: 'Year', type: AttributeType.NUMBER },
      { trait_type: 'Style', type: AttributeType.STRING },
    ],
    category: 'art',
  },
  COLLECTIBLE: {
    id: 'collectible',
    name: 'Collectible',
    description: 'Collectible item NFT',
    attributes: [
      { trait_type: 'Rarity', type: AttributeType.STRING },
      { trait_type: 'Series', type: AttributeType.STRING },
      { trait_type: 'Number', type: AttributeType.NUMBER },
      { trait_type: 'Condition', type: AttributeType.STRING },
    ],
    category: 'collectible',
  },
  GAMING: {
    id: 'gaming',
    name: 'Gaming Asset',
    description: 'Gaming asset NFT',
    attributes: [
      { trait_type: 'Game', type: AttributeType.STRING },
      { trait_type: 'Type', type: AttributeType.STRING },
      { trait_type: 'Level', type: AttributeType.NUMBER },
      { trait_type: 'Rarity', type: AttributeType.STRING },
    ],
    category: 'gaming',
  },
  MUSIC: {
    id: 'music',
    name: 'Music NFT',
    description: 'Music track NFT',
    attributes: [
      { trait_type: 'Artist', type: AttributeType.STRING },
      { trait_type: 'Genre', type: AttributeType.STRING },
      { trait_type: 'Duration', type: AttributeType.NUMBER },
      { trait_type: 'Year', type: AttributeType.NUMBER },
    ],
    category: 'music',
  },
} as const;

/**
 * Common attribute values for different categories
 */
export const COMMON_ATTRIBUTES = {
  RARITY: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'],
  COLOR: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'White'],
  SIZE: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  CONDITION: ['Mint', 'Near Mint', 'Good', 'Fair', 'Poor'],
  MATERIAL: ['Gold', 'Silver', 'Bronze', 'Platinum', 'Diamond', 'Wood', 'Metal', 'Plastic'],
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Maximum response time in milliseconds */
  MAX_RESPONSE_TIME: 5000,
  /** Maximum cache size */
  MAX_CACHE_SIZE: 10000,
  /** Cache TTL in milliseconds */
  CACHE_TTL: 300000, // 5 minutes
  /** Maximum retry attempts */
  MAX_RETRY_ATTEMPTS: 5,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 1000,
  /** Batch operation timeout in milliseconds */
  BATCH_TIMEOUT: 30000,
} as const;

/**
 * Health check intervals
 */
export const HEALTH_CHECK_INTERVALS = {
  /** Contract health check interval in milliseconds */
  CONTRACT_CHECK: 30000, // 30 seconds
  /** Network health check interval in milliseconds */
  NETWORK_CHECK: 60000, // 1 minute
  /** Wallet health check interval in milliseconds */
  WALLET_CHECK: 15000, // 15 seconds
} as const;

/**
 * Default metadata values
 */
export const DEFAULT_METADATA = {
  NAME: 'Unnamed NFT',
  DESCRIPTION: 'No description provided',
  ATTRIBUTES: [],
  IMAGE: '',
  EXTERNAL_URL: '',
} as const;

/**
 * Metadata validation rules
 */
export const METADATA_VALIDATION_RULES = {
  maxNameLength: VALIDATION.MAX_NAME_LENGTH,
  maxDescriptionLength: VALIDATION.MAX_DESCRIPTION_LENGTH,
  maxAttributes: VALIDATION.MAX_ATTRIBUTES,
  maxAttributeNameLength: VALIDATION.MAX_ATTRIBUTE_NAME_LENGTH,
  maxAttributeValueLength: VALIDATION.MAX_ATTRIBUTE_VALUE_LENGTH,
  requiredAttributes: [],
  allowedAttributeTypes: ['string', 'number', 'boolean', 'date', 'url', 'color'],
  maxImageUrlLength: 500,
  maxExternalUrlLength: 500,
} as const;
