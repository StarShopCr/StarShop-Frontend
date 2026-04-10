// ==================== ENUMS ====================

export enum BoostStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum VisibilityLevel {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  PREMIUM = 'premium',
  FEATURED = 'featured'
}

export enum SlotType {
  HOMEPAGE_BANNER = 'homepage_banner',
  CATEGORY_TOP = 'category_top',
  SEARCH_PRIORITY = 'search_priority',
  SIDEBAR = 'sidebar',
  FEATURED_CAROUSEL = 'featured_carousel'
}

export enum SlotStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance'
}

export enum BoostErrorCode {
  NOT_INITIALIZED = 'not_initialized',
  ALREADY_INITIALIZED = 'already_initialized',
  UNAUTHORIZED = 'unauthorized',
  BOOST_NOT_FOUND = 'boost_not_found',
  BOOST_ALREADY_ACTIVE = 'boost_already_active',
  BOOST_EXPIRED = 'boost_expired',
  INVALID_CONFIG = 'invalid_config',
  SLOT_UNAVAILABLE = 'slot_unavailable',
  SLOT_NOT_FOUND = 'slot_not_found',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_FAILED = 'refund_failed',
  CONTRACT_ERROR = 'contract_error',
  NETWORK_ERROR = 'network_error',
  WALLET_ERROR = 'wallet_error',
  VALIDATION_ERROR = 'validation_error',
  TIMEOUT_ERROR = 'timeout_error'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum BoostEventType {
  BOOST_CREATED = 'boost_created',
  BOOST_ACTIVATED = 'boost_activated',
  BOOST_PAUSED = 'boost_paused',
  BOOST_CANCELLED = 'boost_cancelled',
  BOOST_EXPIRED = 'boost_expired',
  BOOST_UPDATED = 'boost_updated',
  VISIBILITY_CHANGED = 'visibility_changed',
  SLOT_RESERVED = 'slot_reserved',
  SLOT_RELEASED = 'slot_released',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_REFUNDED = 'payment_refunded',
  ERROR = 'error'
}

// ==================== BRANDED TYPES ====================

export type BoostId = string & { readonly __brand: 'BoostId' };
export type ProductId = string & { readonly __brand: 'ProductId' };
export type SlotId = string & { readonly __brand: 'SlotId' };
export type UserAddress = string & { readonly __brand: 'UserAddress' };
export type ContractAddress = string & { readonly __brand: 'ContractAddress' };
export type TransactionHash = string & { readonly __brand: 'TransactionHash' };

// ==================== CORE INTERFACES ====================

export interface BoostConfig {
  productId: ProductId;
  visibilityLevel: VisibilityLevel;
  slotType?: SlotType;
  duration: number; // seconds
  budget: number;
  targetAudience?: string[];
  scheduledStart?: number; // timestamp
  metadata?: Record<string, string>;
}

export interface Boost {
  id: BoostId;
  owner: UserAddress;
  productId: ProductId;
  status: BoostStatus;
  visibilityLevel: VisibilityLevel;
  slotType?: SlotType;
  slotId?: SlotId;
  duration: number;
  startTime: number;
  endTime: number;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  metadata?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface BoostUpdate {
  visibilityLevel?: VisibilityLevel;
  duration?: number;
  budget?: number;
  targetAudience?: string[];
  metadata?: Record<string, string>;
}

export interface BoostServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds?: number;
  fee?: number;
  simulate?: boolean;
  retryConfig?: RetryConfig;
  cache?: CacheConfig;
}

export interface NetworkConfig {
  contractId: ContractAddress;
  networkPassphrase: string;
  rpcUrl: string;
  isTestnet: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

// ==================== RESPONSE TYPES ====================

export interface BoostResponse<T> {
  success: boolean;
  data?: T;
  error?: BoostError;
  transactionHash?: TransactionHash;
  timestamp: number;
}

export interface BoostError {
  code: BoostErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface TransactionResult {
  hash: TransactionHash;
  status: 'success' | 'failed';
  fee: number;
  timestamp: number;
}

// ==================== SLOT INTERFACES ====================

export interface Slot {
  id: SlotId;
  type: SlotType;
  status: SlotStatus;
  boostId?: BoostId;
  reservedBy?: UserAddress;
  reservedAt?: number;
  expiresAt?: number;
  price: number;
  position: number;
  metadata?: Record<string, string>;
}

export interface SlotReservation {
  slotId: SlotId;
  boostId?: BoostId;
  duration: number;
  price: number;
  reservedAt: number;
  expiresAt: number;
}

// ==================== VISIBILITY INTERFACES ====================

export interface VisibilityStats {
  productId: ProductId;
  currentLevel: VisibilityLevel;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  averagePosition: number;
  boostHistory: BoostHistoryEntry[];
}

export interface BoostHistoryEntry {
  boostId: BoostId;
  visibilityLevel: VisibilityLevel;
  startTime: number;
  endTime: number;
  impressions: number;
  clicks: number;
}

// ==================== PAYMENT INTERFACES ====================

export interface BoostPayment {
  boostId: BoostId;
  amount: number;
  status: PaymentStatus;
  transactionHash?: TransactionHash;
  paidAt?: number;
  refundedAt?: number;
  refundAmount?: number;
}

export interface BoostCostEstimate {
  baseCost: number;
  slotCost: number;
  visibilityMultiplier: number;
  totalCost: number;
  duration: number;
  breakdown: CostBreakdownItem[];
}

export interface CostBreakdownItem {
  label: string;
  amount: number;
  description: string;
}

// ==================== EVENT INTERFACES ====================

export interface BoostEventData {
  type: BoostEventType;
  boostId?: BoostId;
  productId?: ProductId;
  slotId?: SlotId;
  data?: Record<string, unknown>;
  timestamp: number;
}

export type BoostEventListener = (event: BoostEventData) => void;

export interface EventListenerOptions {
  once?: boolean;
  filter?: (event: BoostEventData) => boolean;
}

export interface EventSubscription {
  unsubscribe: () => void;
}

// ==================== ANALYTICS INTERFACES ====================

export interface BoostAnalytics {
  totalBoosts: number;
  activeBoosts: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  topProducts: ProductBoostSummary[];
  revenueBySlotType: Record<SlotType, number>;
}

export interface ProductBoostSummary {
  productId: ProductId;
  totalBoosts: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: number;
}

// ==================== HEALTH CHECK ====================

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    contract: boolean;
    network: boolean;
    wallet: boolean;
    cache: boolean;
  };
  timestamp: number;
}
