import type { u32, u64, i128 } from '@stellar/stellar-sdk';

export type DropId = u32;
export type UserAddress = string;
export type ContractAddress = string;
export type TransactionHash = string;

export enum DropLifecycleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum UserAccessLevel {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  VERIFIED = 'verified'
}

export enum LimitedDropEventType {
  CONTRACT_INITIALIZED = 'contract_initialized',
  DROP_CREATED = 'drop_created',
  DROP_UPDATED = 'drop_updated',
  DROP_CANCELLED = 'drop_cancelled',
  USER_PARTICIPATED = 'user_participated',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_REVOKED = 'access_revoked',
  USER_LEVEL_UPDATED = 'user_level_updated',
  ERROR = 'error'
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

export interface LimitedDropServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds: number;
  fee: number;
  simulate: boolean;
  retryConfig: RetryConfig;
  cache: CacheConfig;
}

export interface LimitedDropResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number | string;
  transactionHash?: TransactionHash;
  fee?: number;
}

export interface TransactionResult<T = unknown> {
  hash: TransactionHash;
  success: boolean;
  error?: string;
  gasUsed?: number;
  fee?: number;
  data?: T;
}

export interface DropConfig {
  creator?: UserAddress;
  title: string;
  productId: u64;
  maxSupply: u32;
  startTime: u64;
  endTime: u64;
  price: i128;
  perUserLimit: u32;
  imageUri: string;
}

export interface Drop {
  id: DropId;
  creator: UserAddress;
  title: string;
  productId: u64;
  maxSupply: u32;
  startTime: u64;
  endTime: u64;
  price: i128;
  perUserLimit: u32;
  imageUri: string;
  status: DropLifecycleStatus;
  totalPurchased: u32;
}

export interface DropUpdate {
  admin?: UserAddress;
  status?: DropLifecycleStatus;
}

export interface ParticipationOptions {
  buyer?: UserAddress;
  quantity?: u32;
}

export interface DropParticipationMetrics {
  dropId: DropId;
  totalPurchased: u32;
  buyerCount: u32;
  remainingSupply: u32;
  soldOut: boolean;
  purchaseRate: number;
}

export interface DropStatusSummary {
  dropId: DropId;
  status: DropLifecycleStatus;
  isActive: boolean;
  isPending: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  remainingSupply: u32;
}

export interface DropTimeRemaining {
  dropId: DropId;
  remainingSeconds: number;
  isStarted: boolean;
  isEnded: boolean;
  startsInSeconds: number;
  endsAt: u64;
}

export interface PurchaseRecord {
  dropId: DropId;
  quantity: u32;
  pricePaid: i128;
  timestamp: u64;
}

export interface HealthCheck {
  isHealthy: boolean;
  network: string;
  contractId: ContractAddress;
  timestamp: number;
  errors: string[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  cacheHitRate: number;
  lastUpdated: number;
}

export interface LimitedDropEventData {
  type: LimitedDropEventType;
  timestamp: number;
  dropId?: DropId;
  user?: UserAddress;
  admin?: UserAddress;
  status?: DropLifecycleStatus;
  transactionHash?: TransactionHash;
  error?: string;
  operation?: string;
}

export type LimitedDropEventListener = (event: LimitedDropEventData) => void;

export interface EventListenerOptions {
  dropId?: DropId;
  userAddress?: UserAddress;
}

export interface EventSubscription {
  id: string;
  eventTypes: LimitedDropEventType[];
  listener: LimitedDropEventListener;
  active: boolean;
  options: EventListenerOptions;
}

export interface BatchOperationResult<T = unknown> {
  successful: T[];
  failed: Array<{
    input: unknown;
    error: string;
  }>;
  totalProcessed: number;
}
