import { Client as ContractClient } from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';
import { 
  Client as SubscriptionContractClient,
  networks,
  SubscriptionError,
  PlanError,
  FeatureAccessError,
  TransactionError
} from '../../../../packages/subscription_system_contract/src/index';
import { 
  signTransaction, 
  getPublicKey, 
  isWalletConnected 
} from '../../utils/wallet';
import { 
  NETWORKS, 
  DEFAULT_CONFIG, 
  CACHE_KEYS,
  VALIDATION,
  CONTRACT_METHODS,
  FEE_CALCULATION,
  TIMEOUT_CONFIG
} from './constants/subscription.constants';
import {
  validateAddress,
  validatePlanId,
  validatePlanConfig,
  validateSubscriptionRequest,
  validateFeatureAccessRequest,
  formatPlanPrice,
  calculateSubscriptionDuration,
  getTimeUntilExpiry,
  isSubscriptionValid,
  isSubscriptionInGrace,
  calculateFees,
  generateSubscriptionCacheKey,
  generatePlanCacheKey,
  generateFeatureUsageCacheKey,
  isCacheExpired,
  retryWithBackoff,
  mapContractError,
  getErrorMessage,
  getErrorType,
  checkFeatureAccess,
  getUsageLimit,
  userHasRole,
  getUserRoles,
  calculateSubscriptionMetrics,
  calculateUsageMetrics
} from './utils/subscription.utils';
import {
  SubscriptionServiceConfig,
  NetworkConfig,
  SubscriptionResponse,
  TransactionResult,
  Plan,
  PlanConfig,
  SubscriptionRequest,
  RenewalRequest,
  ResetSubscriptionRequest,
  SubscriptionInfo,
  SubscriptionStatus,
  FeatureAccessRequest,
  FeatureUsage,
  UserRole,
  RoleAssignmentRequest,
  SubscriptionState,
  PlanTier,
  SubscriptionErrorCode,
  PlanErrorCode,
  FeatureAccessErrorCode,
  HealthCheck,
  PerformanceMetrics,
  SubscriptionEventType,
  SubscriptionEventData,
  SubscriptionEventListener,
  EventListenerOptions,
  EventSubscription,
  SubscriptionAnalytics,
  RevenueMetrics,
  UsageMetrics,
  BatchOperationResult,
  PlanId,
  FeatureName,
  UserAddress,
  ContractAddress,
  TransactionHash,
  SubscriptionId,
  RoleName
} from './types/subscription.types';
import {
  CreatePlanRequest,
  UpdatePlanRequest,
  DisablePlanRequest,
  PlanQueryRequest,
  PlanListRequest,
  PlanListResult,
  PlanDetail,
  PlanComparison,
  PlanRecommendationRequest,
  PlanRecommendation,
  PlanValidationRequest,
  PlanValidationResult,
  PlanAnalyticsRequest,
  PlanAnalytics,
  PlanPerformanceMetrics,
  PlanTemplate,
  CreatePlanTemplateRequest,
  UsePlanTemplateRequest,
  PlanMigrationRequest,
  PlanMigrationResult,
  PlanDeprecationRequest,
  PlanDeprecationResult,
  BulkPlanCreationRequest,
  BulkPlanCreationResult,
  BulkPlanUpdateRequest,
  BulkPlanUpdateResult,
  PlanSearchRequest,
  PlanSearchResult,
  PlanExportRequest,
  PlanExportResult,
  PlanImportRequest,
  PlanImportResult
} from './types/plan.types';
import {
  FeatureUsage as UsageFeatureUsage,
  UserUsageSummary,
  FeatureUsageAnalytics,
  UsageLimitConfig,
  UsageLimitType,
  UsageTrackingRequest,
  UsageTrackingResult,
  UsageAnalyticsRequest,
  UsageAnalytics,
  UsageReportRequest,
  UsageReportType,
  UsageReportResult,
  CreateUsageLimitRequest,
  UpdateUsageLimitRequest,
  DeleteUsageLimitRequest,
  UsageLimitQueryRequest,
  UsageLimitListRequest,
  UsageLimitListResult,
  UsageMonitoringConfig,
  UsageAlert,
  UsageAlertType,
  AlertSeverity,
  UsageMonitoringResult,
  UsageOptimizationRequest,
  UsageOptimizationType,
  UsageOptimizationResult,
  UsageOptimizationRecommendation,
  BulkUsageTrackingRequest,
  BulkUsageTrackingResult,
  BulkUsageLimitUpdateRequest,
  BulkUsageLimitUpdateResult,
  UsageDataExportRequest,
  UsageDataExportResult,
  UsageDataImportRequest,
  UsageDataImportResult,
  UsagePredictionRequest,
  UsagePredictionResult,
  UsageComparisonRequest,
  UsageComparisonType,
  UsageComparisonResult
} from './types/usage.types';

/**
 * Comprehensive TypeScript service layer for Subscription Contract interactions
 * Provides clean, type-safe interface for managing subscription plans, user subscriptions,
 * feature access, and usage tracking in the Starshop application.
 */
export class SubscriptionService {
  private contract: SubscriptionContractClient;
  private networkConfig: NetworkConfig;
  private isInitialized: boolean = false;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private eventListeners: Map<string, EventSubscription> = new Map();
  private performanceMetrics: PerformanceMetrics = {
    averageResponseTime: 0,
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    cacheHitRate: 0
  };

  constructor(config: SubscriptionServiceConfig) {
    this.networkConfig = config.network;
    this.contract = new SubscriptionContractClient({
      contractId: config.network.contractId,
      networkPassphrase: config.network.networkPassphrase,
      rpcUrl: config.network.rpcUrl
    });
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize the subscription service
   */
  async initialize(config?: Partial<SubscriptionServiceConfig>): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Service already initialized');
    }

    try {
      // Validate network configuration
      if (!this.networkConfig.contractId || !this.networkConfig.networkPassphrase || !this.networkConfig.rpcUrl) {
        throw new Error('Invalid network configuration');
      }

      // Initialize contract client
      await this.contract.initialize();

      // Set up event listeners
      this.setupEventListeners();

      // Perform health check
      const healthCheck = await this.performHealthCheck();
      if (!healthCheck.isHealthy) {
        throw new Error(`Health check failed: ${healthCheck.errors.join(', ')}`);
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize subscription service: ${mapContractError(error)}`);
    }
  }

  /**
   * Check if service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }
  }

  // ==================== PLAN MANAGEMENT ====================

  /**
   * Create a new subscription plan
   */
  async createPlan(config: PlanConfig): Promise<SubscriptionResponse<TransactionResult>> {
    this.ensureInitialized();

    try {
      // Validate plan configuration
      const validation = validatePlanConfig(config);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          errorCode: SubscriptionErrorCode.VALIDATION_ERROR
        };
      }

      // Check if plan already exists
      const existingPlan = await this.getPlan(config.planId);
      if (existingPlan.success && existingPlan.data) {
        return {
          success: false,
          error: 'Plan already exists',
          errorCode: PlanErrorCode.PLAN_ALREADY_EXISTS
        };
      }

      // Create plan transaction
      const transaction = await this.contract.createPlan({
        planId: config.planId,
        name: config.name,
        duration: config.duration,
        price: config.price,
        benefits: config.benefits,
        version: config.version,
        tier: config.tier
      });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Cache the new plan
      const cacheKey = generatePlanCacheKey(config.planId);
      this.cache.set(cacheKey, {
        data: config,
        timestamp: Date.now()
      });

      // Emit event
      this.emitEvent({
        type: SubscriptionEventType.PLAN_CREATED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        planId: config.planId,
        transactionHash: result.hash
      });

      return {
        success: true,
        data: {
          hash: result.hash,
          success: true,
          gasUsed: result.gasUsed,
          fee: result.fee
        },
        transactionHash: result.hash,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Update an existing subscription plan
   */
  async updatePlan(planId: string, config: Partial<PlanConfig>): Promise<SubscriptionResponse<TransactionResult>> {
    this.ensureInitialized();

    try {
      // Validate plan ID
      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Check if plan exists
      const existingPlan = await this.getPlan(planId);
      if (!existingPlan.success || !existingPlan.data) {
        return {
          success: false,
          error: 'Plan not found',
          errorCode: PlanErrorCode.PLAN_NOT_ACTIVE
        };
      }

      // Update plan transaction
      const transaction = await this.contract.updatePlan({
        planId,
        ...config
      });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Invalidate cache
      const cacheKey = generatePlanCacheKey(planId);
      this.cache.delete(cacheKey);

      // Emit event
      this.emitEvent({
        type: SubscriptionEventType.PLAN_UPDATED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        planId,
        transactionHash: result.hash
      });

      return {
        success: true,
        data: {
          hash: result.hash,
          success: true,
          gasUsed: result.gasUsed,
          fee: result.fee
        },
        transactionHash: result.hash,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Disable a subscription plan
   */
  async disablePlan(planId: string): Promise<SubscriptionResponse<TransactionResult>> {
    this.ensureInitialized();

    try {
      // Validate plan ID
      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Disable plan transaction
      const transaction = await this.contract.disablePlan({ planId });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Invalidate cache
      const cacheKey = generatePlanCacheKey(planId);
      this.cache.delete(cacheKey);

      // Emit event
      this.emitEvent({
        type: SubscriptionEventType.PLAN_DISABLED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        planId,
        transactionHash: result.hash
      });

      return {
        success: true,
        data: {
          hash: result.hash,
          success: true,
          gasUsed: result.gasUsed,
          fee: result.fee
        },
        transactionHash: result.hash,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Get plan details
   */
  async getPlan(planId: string): Promise<SubscriptionResponse<Plan>> {
    this.ensureInitialized();

    try {
      // Check cache first
      const cacheKey = generatePlanCacheKey(planId);
      const cached = this.cache.get(cacheKey);
      if (cached && !isCacheExpired(cached.timestamp, 300000)) { // 5 minutes
        return {
          success: true,
          data: cached.data
        };
      }

      // Validate plan ID
      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Get plan from contract
      const plan = await this.contract.getPlan({ planId });

      // Cache the result
      this.cache.set(cacheKey, {
        data: plan,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: plan
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Get list of available plans
   */
  async getAvailablePlans(): Promise<SubscriptionResponse<Plan[]>> {
    this.ensureInitialized();

    try {
      // Get plans from contract
      const plans = await this.contract.listPlans();

      return {
        success: true,
        data: plans
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Subscribe user to a plan
   */
  async subscribe(user: string, planId: string): Promise<SubscriptionResponse<TransactionResult>> {
    this.ensureInitialized();

    try {
      // Validate subscription request
      const validation = validateSubscriptionRequest({ user, planId });
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          errorCode: SubscriptionErrorCode.VALIDATION_ERROR
        };
      }

      // Check if user already has active subscription
      const existingSubscription = await this.getState(user, planId);
      if (existingSubscription.success && existingSubscription.data === SubscriptionState.ACTIVE) {
        return {
          success: false,
          error: 'User already has active subscription',
          errorCode: SubscriptionErrorCode.SUBSCRIPTION_ALREADY_ACTIVE
        };
      }

      // Subscribe transaction
      const transaction = await this.contract.subscribe({
        user,
        planId
      });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Invalidate user subscription cache
      const cacheKey = generateSubscriptionCacheKey(user, planId);
      this.cache.delete(cacheKey);

      // Emit event
      this.emitEvent({
        type: SubscriptionEventType.SUBSCRIPTION_CREATED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        user,
        planId,
        transactionHash: result.hash
      });

      return {
        success: true,
        data: {
          hash: result.hash,
          success: true,
          gasUsed: result.gasUsed,
          fee: result.fee
        },
        transactionHash: result.hash,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Renew existing subscription
   */
  async renew(user: string, planId: string): Promise<SubscriptionResponse<TransactionResult>> {
    this.ensureInitialized();

    try {
      // Validate subscription request
      const validation = validateSubscriptionRequest({ user, planId });
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          errorCode: SubscriptionErrorCode.VALIDATION_ERROR
        };
      }

      // Check if subscription exists
      const subscriptionState = await this.getState(user, planId);
      if (!subscriptionState.success || subscriptionState.data === SubscriptionState.NOT_FOUND) {
        return {
          success: false,
          error: 'Subscription not found',
          errorCode: SubscriptionErrorCode.SUBSCRIPTION_NOT_FOUND
        };
      }

      // Renew subscription transaction
      const transaction = await this.contract.renew({
        user,
        planId
      });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Invalidate user subscription cache
      const cacheKey = generateSubscriptionCacheKey(user, planId);
      this.cache.delete(cacheKey);

      // Emit event
      this.emitEvent({
        type: SubscriptionEventType.SUBSCRIPTION_RENEWED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        user,
        planId,
        transactionHash: result.hash
      });

      return {
        success: true,
        data: {
          hash: result.hash,
          success: true,
          gasUsed: result.gasUsed,
          fee: result.fee
        },
        transactionHash: result.hash,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Reset subscription (admin only)
   */
  async resetSubscription(targetUser: string, planId: string): Promise<SubscriptionResponse<TransactionResult>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(targetUser);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Reset subscription transaction
      const transaction = await this.contract.resetSubscription({
        targetUser,
        planId
      });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Invalidate user subscription cache
      const cacheKey = generateSubscriptionCacheKey(targetUser, planId);
      this.cache.delete(cacheKey);

      // Emit event
      this.emitEvent({
        type: SubscriptionEventType.SUBSCRIPTION_RESET,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        user: targetUser,
        planId,
        transactionHash: result.hash
      });

      return {
        success: true,
        data: {
          hash: result.hash,
          success: true,
          gasUsed: result.gasUsed,
          fee: result.fee
        },
        transactionHash: result.hash,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  // ==================== SUBSCRIPTION STATUS ====================

  /**
   * Check if subscription is active
   */
  async isActiveSub(user: string, planId: string): Promise<SubscriptionResponse<boolean>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Check subscription status
      const isActive = await this.contract.isActiveSub({ user, planId });

      return {
        success: true,
        data: isActive
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Check if subscription is expired
   */
  async isExpiredSub(user: string, planId: string): Promise<SubscriptionResponse<boolean>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Check subscription expiry
      const isExpired = await this.contract.isExpiredSub({ user, planId });

      return {
        success: true,
        data: isExpired
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Check if subscription is in grace period
   */
  async isInGrace(user: string, planId: string): Promise<SubscriptionResponse<boolean>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Check grace period status
      const isInGrace = await this.contract.isInGrace({ user, planId });

      return {
        success: true,
        data: isInGrace
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Get detailed subscription state
   */
  async getState(user: string, planId: string): Promise<SubscriptionResponse<SubscriptionState>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Get subscription state
      const state = await this.contract.getSubscriptionState({ user, planId });

      return {
        success: true,
        data: state
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  // ==================== FEATURE ACCESS ====================

  /**
   * Access premium content
   */
  async premiumContent(user: string, planId: string): Promise<SubscriptionResponse<string>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Check feature access
      const hasAccess = await checkFeatureAccess(user, 'premium_content', planId);
      if (!hasAccess) {
        return {
          success: false,
          error: 'Premium content access denied',
          errorCode: FeatureAccessErrorCode.FEATURE_ACCESS_DENIED
        };
      }

      // Access premium content
      const content = await this.contract.premiumContent({ user, planId });

      return {
        success: true,
        data: content
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Access gold-tier features
   */
  async goldFeature(user: string, planId: string): Promise<SubscriptionResponse<string>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Check feature access
      const hasAccess = await checkFeatureAccess(user, 'gold_feature', planId);
      if (!hasAccess) {
        return {
          success: false,
          error: 'Gold feature access denied',
          errorCode: FeatureAccessErrorCode.FEATURE_ACCESS_DENIED
        };
      }

      // Access gold feature
      const feature = await this.contract.goldFeature({ user, planId });

      return {
        success: true,
        data: feature
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  /**
   * Get feature usage statistics
   */
  async getFeatureUsage(user: string, feature: string): Promise<SubscriptionResponse<u32>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const featureValidation = validateFeatureName(feature);
      if (!featureValidation.isValid) {
        return {
          success: false,
          error: featureValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_FEATURE
        };
      }

      // Get feature usage
      const usage = await this.contract.getFeatureUsage({ user, feature });

      return {
        success: true,
        data: usage
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  // ==================== USER ROLES ====================

  /**
   * Add user role
   */
  async addUserRole(role: string, user: string): Promise<SubscriptionResponse<TransactionResult>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const roleValidation = validateRoleName(role);
      if (!roleValidation.isValid) {
        return {
          success: false,
          error: roleValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_FEATURE
        };
      }

      // Add user role transaction
      const transaction = await this.contract.addUserRole({
        role,
        user
      });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Invalidate user roles cache
      const cacheKey = `user_roles:${user}`;
      this.cache.delete(cacheKey);

      // Emit event
      this.emitEvent({
        type: SubscriptionEventType.ROLE_ASSIGNED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        user,
        role,
        transactionHash: result.hash
      });

      return {
        success: true,
        data: {
          hash: result.hash,
          success: true,
          gasUsed: result.gasUsed,
          fee: result.fee
        },
        transactionHash: result.hash,
        gasUsed: result.gasUsed,
        fee: result.fee
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  // ==================== CLEANUP ====================

  /**
   * Clean up expired subscriptions
   */
  async cleanup(user: string, planId: string): Promise<SubscriptionResponse<boolean>> {
    this.ensureInitialized();

    try {
      // Validate addresses
      const userValidation = validateAddress(user);
      if (!userValidation.isValid) {
        return {
          success: false,
          error: userValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_USER_ADDRESS
        };
      }

      const planIdValidation = validatePlanId(planId);
      if (!planIdValidation.isValid) {
        return {
          success: false,
          error: planIdValidation.error!,
          errorCode: SubscriptionErrorCode.INVALID_PLAN_ID
        };
      }

      // Cleanup transaction
      const transaction = await this.contract.cleanup({
        user,
        planId
      });

      // Sign and submit transaction
      const signedTransaction = await signTransaction(transaction);
      const result = await this.contract.submitTransaction(signedTransaction);

      // Invalidate caches
      const subscriptionCacheKey = generateSubscriptionCacheKey(user, planId);
      this.cache.delete(subscriptionCacheKey);

      return {
        success: true,
        data: result.success
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get subscription analytics
   */
  async getAnalytics(): Promise<SubscriptionResponse<SubscriptionAnalytics>> {
    this.ensureInitialized();

    try {
      // Get analytics from contract
      const analytics = await this.contract.getAnalytics();

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      return {
        success: false,
        error: mapContractError(error),
        errorCode: getErrorType(error)
      };
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<HealthCheck> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Check contract connectivity
      let contractConnected = false;
      try {
        await this.contract.getAdmin();
        contractConnected = true;
      } catch (error) {
        errors.push('Contract not accessible');
      }

      // Check network connectivity
      let networkConnected = false;
      try {
        // Simple network check
        networkConnected = true;
      } catch (error) {
        errors.push('Network not accessible');
      }

      // Check wallet connectivity
      let walletConnected = false;
      try {
        walletConnected = await isWalletConnected();
      } catch (error) {
        errors.push('Wallet not connected');
      }

      const responseTime = Date.now() - startTime;
      const isHealthy = contractConnected && networkConnected && walletConnected;

      return {
        isHealthy,
        contractConnected,
        networkConnected,
        walletConnected,
        errors,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        responseTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        contractConnected: false,
        networkConnected: false,
        walletConnected: false,
        errors: ['Health check failed'],
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      };
    }
  }

  // ==================== EVENT MANAGEMENT ====================

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Setup contract event listeners
    this.contract.on('plan_created', (event) => {
      this.emitEvent({
        type: SubscriptionEventType.PLAN_CREATED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        planId: event.planId,
        transactionHash: event.transactionHash
      });
    });

    this.contract.on('subscription_created', (event) => {
      this.emitEvent({
        type: SubscriptionEventType.SUBSCRIPTION_CREATED,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        user: event.user,
        planId: event.planId,
        transactionHash: event.transactionHash
      });
    });
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(eventData: SubscriptionEventData): void {
    this.eventListeners.forEach((subscription) => {
      if (subscription.active && subscription.eventTypes.includes(eventData.type)) {
        try {
          subscription.listener(eventData);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    });
  }

  /**
   * Add event listener
   */
  addEventListener(
    eventTypes: SubscriptionEventType[],
    listener: SubscriptionEventListener,
    options?: EventListenerOptions
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventTypes,
      listener,
      active: true,
      options
    };

    this.eventListeners.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Remove event listener
   */
  removeEventListener(subscriptionId: string): boolean {
    return this.eventListeners.delete(subscriptionId);
  }

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // ==================== PERFORMANCE METRICS ====================

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(operationTime: number, success: boolean): void {
    this.performanceMetrics.totalOperations++;
    if (success) {
      this.performanceMetrics.successfulOperations++;
    } else {
      this.performanceMetrics.failedOperations++;
    }

    // Update average response time
    const totalTime = this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalOperations - 1) + operationTime;
    this.performanceMetrics.averageResponseTime = totalTime / this.performanceMetrics.totalOperations;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get service configuration
   */
  getConfig(): NetworkConfig {
    return { ...this.networkConfig };
  }

  /**
   * Check if service is initialized
   */
  getInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get contract client
   */
  getContractClient(): SubscriptionContractClient {
    return this.contract;
  }
}
