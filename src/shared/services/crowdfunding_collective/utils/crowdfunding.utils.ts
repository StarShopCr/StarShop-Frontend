import type { u32, u64, i128 } from '@stellar/stellar-sdk';
import type { 
  CampaignConfig, 
  Campaign, 
  CampaignStatus, 
  Contribution, 
  RewardTier, 
  Milestone,
  CampaignValidation,
  ContributionValidation,
  CampaignFilter,
  Address,
  CampaignId
} from '../types/crowdfunding.types';
import { 
  VALIDATION, 
  CAMPAIGN_VALIDATION_RULES,
  CONTRIBUTION_VALIDATION_RULES,
  REWARD_VALIDATION_RULES,
  MILESTONE_VALIDATION_RULES,
  CROWDFUNDING_ERROR_CODES
} from '../constants/crowdfunding.constants';

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Basic Stellar address validation (starts with G, 56 characters)
  const stellarAddressRegex = /^G[A-Z0-9]{55}$/;
  return stellarAddressRegex.test(address);
}

/**
 * Validate campaign ID format
 */
export function isValidCampaignId(campaignId: CampaignId): boolean {
  return typeof campaignId === 'number' && campaignId > 0 && Number.isInteger(campaignId);
}

/**
 * Validate amount format and range
 */
export function isValidAmount(amount: i128, minAmount?: i128, maxAmount?: i128): boolean {
  if (typeof amount !== 'bigint' || amount <= 0) {
    return false;
  }
  
  if (minAmount && amount < minAmount) {
    return false;
  }
  
  if (maxAmount && amount > maxAmount) {
    return false;
  }
  
  return true;
}

/**
 * Validate timestamp format
 */
export function isValidTimestamp(timestamp: u64): boolean {
  return typeof timestamp === 'bigint' && timestamp > 0;
}

/**
 * Validate string length
 */
export function isValidStringLength(str: string, maxLength: number, minLength: number = 1): boolean {
  if (typeof str !== 'string') {
    return false;
  }
  
  return str.length >= minLength && str.length <= maxLength;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate campaign configuration
 */
export function validateCampaignConfig(config: CampaignConfig): CampaignValidation {
  const errors: string[] = [];

  // Validate title
  if (!isValidStringLength(config.title, CAMPAIGN_VALIDATION_RULES.maxTitleLength)) {
    errors.push(`Title must be between 1 and ${CAMPAIGN_VALIDATION_RULES.maxTitleLength} characters`);
  }

  // Validate description
  if (!isValidStringLength(config.description, CAMPAIGN_VALIDATION_RULES.maxDescriptionLength)) {
    errors.push(`Description must be between 1 and ${CAMPAIGN_VALIDATION_RULES.maxDescriptionLength} characters`);
  }

  // Validate target amount
  if (!isValidAmount(config.targetAmount, CAMPAIGN_VALIDATION_RULES.minTargetAmount, CAMPAIGN_VALIDATION_RULES.maxTargetAmount)) {
    errors.push(`Target amount must be between ${CAMPAIGN_VALIDATION_RULES.minTargetAmount} and ${CAMPAIGN_VALIDATION_RULES.maxTargetAmount}`);
  }

  // Validate deadline
  if (!isValidTimestamp(config.deadline)) {
    errors.push('Invalid deadline timestamp');
  } else {
    const now = BigInt(Date.now());
    const minDeadline = now + BigInt(CAMPAIGN_VALIDATION_RULES.minCampaignDuration * 1000);
    const maxDeadline = now + BigInt(CAMPAIGN_VALIDATION_RULES.maxCampaignDuration * 1000);
    
    if (config.deadline < minDeadline) {
      errors.push(`Deadline must be at least ${CAMPAIGN_VALIDATION_RULES.minCampaignDuration / 86400} days from now`);
    }
    
    if (config.deadline > maxDeadline) {
      errors.push(`Deadline must be no more than ${CAMPAIGN_VALIDATION_RULES.maxCampaignDuration / 86400} days from now`);
    }
  }

  // Validate contribution amounts
  if (!isValidAmount(config.minContribution, 1n, CAMPAIGN_VALIDATION_RULES.maxContributionAmount)) {
    errors.push(`Minimum contribution must be between 1 and ${CAMPAIGN_VALIDATION_RULES.maxContributionAmount}`);
  }

  if (!isValidAmount(config.maxContribution, config.minContribution, CAMPAIGN_VALIDATION_RULES.maxContributionAmount)) {
    errors.push(`Maximum contribution must be between minimum contribution and ${CAMPAIGN_VALIDATION_RULES.maxContributionAmount}`);
  }

  // Validate creator address
  if (!isValidStellarAddress(config.creator)) {
    errors.push('Invalid creator address format');
  }

  // Validate category
  if (!isValidStringLength(config.category, CAMPAIGN_VALIDATION_RULES.maxCategoryLength)) {
    errors.push(`Category must be between 1 and ${CAMPAIGN_VALIDATION_RULES.maxCategoryLength} characters`);
  }

  // Validate optional URLs
  if (config.imageUrl && !isValidUrl(config.imageUrl)) {
    errors.push('Invalid image URL format');
  }

  if (config.externalUrl && !isValidUrl(config.externalUrl)) {
    errors.push('Invalid external URL format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate contribution request
 */
export function validateContributionRequest(
  campaignId: CampaignId,
  contributor: Address,
  amount: i128,
  campaignConfig?: CampaignConfig
): ContributionValidation {
  // Validate campaign ID
  if (!isValidCampaignId(campaignId)) {
    return {
      isValid: false,
      error: 'Invalid campaign ID'
    };
  }

  // Validate contributor address
  if (!isValidStellarAddress(contributor)) {
    return {
      isValid: false,
      error: 'Invalid contributor address format'
    };
  }

  // Validate amount
  if (!isValidAmount(amount, CONTRIBUTION_VALIDATION_RULES.minAmount, CONTRIBUTION_VALIDATION_RULES.maxAmount)) {
    return {
      isValid: false,
      error: `Contribution amount must be between ${CONTRIBUTION_VALIDATION_RULES.minAmount} and ${CONTRIBUTION_VALIDATION_RULES.maxAmount}`
    };
  }

  // Validate against campaign limits if config is provided
  if (campaignConfig) {
    if (amount < campaignConfig.minContribution) {
      return {
        isValid: false,
        error: `Contribution amount must be at least ${campaignConfig.minContribution}`
      };
    }

    if (amount > campaignConfig.maxContribution) {
      return {
        isValid: false,
        error: `Contribution amount must not exceed ${campaignConfig.maxContribution}`
      };
    }
  }

  return {
    isValid: true
  };
}

/**
 * Validate reward tier
 */
export function validateRewardTier(tier: RewardTier): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate name
  if (!isValidStringLength(tier.name, 100)) {
    errors.push('Reward tier name must be between 1 and 100 characters');
  }

  // Validate description
  if (!isValidStringLength(tier.description, REWARD_VALIDATION_RULES.maxDescriptionLength)) {
    errors.push(`Reward description must be between 1 and ${REWARD_VALIDATION_RULES.maxDescriptionLength} characters`);
  }

  // Validate contribution amounts
  if (!isValidAmount(tier.minContribution, 1n)) {
    errors.push('Minimum contribution must be at least 1');
  }

  if (tier.maxContribution && !isValidAmount(tier.maxContribution, tier.minContribution)) {
    errors.push('Maximum contribution must be greater than or equal to minimum contribution');
  }

  // Validate quantity
  if (tier.quantity <= 0 || tier.quantity > REWARD_VALIDATION_RULES.maxQuantity) {
    errors.push(`Quantity must be between 1 and ${REWARD_VALIDATION_RULES.maxQuantity}`);
  }

  // Validate delivery date if provided
  if (tier.deliveryDate && !isValidTimestamp(tier.deliveryDate)) {
    errors.push('Invalid delivery date timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate milestone
 */
export function validateMilestone(milestone: Milestone): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate title
  if (!isValidStringLength(milestone.title, 200)) {
    errors.push('Milestone title must be between 1 and 200 characters');
  }

  // Validate description
  if (!isValidStringLength(milestone.description, MILESTONE_VALIDATION_RULES.maxDescriptionLength)) {
    errors.push(`Milestone description must be between 1 and ${MILESTONE_VALIDATION_RULES.maxDescriptionLength} characters`);
  }

  // Validate target amount
  if (!isValidAmount(milestone.targetAmount, 1n)) {
    errors.push('Milestone target amount must be at least 1');
  }

  // Validate order
  if (milestone.order <= 0) {
    errors.push('Milestone order must be greater than 0');
  }

  // Validate achievement date if provided
  if (milestone.achievedAt && !isValidTimestamp(milestone.achievedAt)) {
    errors.push('Invalid achievement date timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate campaign completion percentage
 */
export function calculateCompletionPercentage(totalRaised: i128, targetAmount: i128): number {
  if (targetAmount === 0n) {
    return 0;
  }
  
  const percentage = Number((totalRaised * 100n) / targetAmount);
  return Math.min(percentage, 100);
}

/**
 * Check if campaign goal is reached
 */
export function isGoalReached(totalRaised: i128, targetAmount: i128): boolean {
  return totalRaised >= targetAmount;
}

/**
 * Check if campaign is active
 */
export function isCampaignActive(campaign: Campaign): boolean {
  const now = BigInt(Date.now());
  return campaign.status === CampaignStatus.ACTIVE && 
         campaign.deadline > now && 
         !campaign.isGoalReached;
}

/**
 * Check if campaign deadline has passed
 */
export function isDeadlinePassed(deadline: u64): boolean {
  const now = BigInt(Date.now());
  return deadline <= now;
}

/**
 * Calculate time remaining until deadline
 */
export function getTimeRemaining(deadline: u64): number {
  const now = BigInt(Date.now());
  const remaining = deadline - now;
  return remaining > 0n ? Number(remaining) : 0;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: i128, decimals: number = 7): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}

/**
 * Parse amount from string
 */
export function parseAmount(amountStr: string, decimals: number = 7): i128 {
  const parts = amountStr.split('.');
  const wholePart = BigInt(parts[0] || '0');
  const fractionalPart = parts[1] ? parts[1].padEnd(decimals, '0').slice(0, decimals) : '0'.repeat(decimals);
  
  return wholePart * BigInt(10 ** decimals) + BigInt(fractionalPart);
}

/**
 * Sanitize string input
 */
export function sanitizeString(str: string, maxLength: number): string {
  if (typeof str !== 'string') {
    return '';
  }
  
  return str.trim().slice(0, maxLength);
}

/**
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Get error type from error message
 */
export function getErrorType(errorMessage: string): string {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('network') || message.includes('connection')) {
    return 'network_error';
  }
  
  if (message.includes('contract') || message.includes('transaction')) {
    return 'contract_error';
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation_error';
  }
  
  if (message.includes('wallet') || message.includes('signature')) {
    return 'wallet_error';
  }
  
  if (message.includes('campaign')) {
    return 'campaign_error';
  }
  
  if (message.includes('contribution')) {
    return 'contribution_error';
  }
  
  if (message.includes('reward')) {
    return 'reward_error';
  }
  
  if (message.includes('milestone')) {
    return 'milestone_error';
  }
  
  if (message.includes('distribution')) {
    return 'distribution_error';
  }
  
  if (message.includes('refund')) {
    return 'refund_error';
  }
  
  return 'unknown_error';
}

/**
 * Filter campaigns based on criteria
 */
export function filterCampaigns(campaigns: Campaign[], filter: CampaignFilter): Campaign[] {
  let filtered = [...campaigns];
  
  if (filter.status) {
    filtered = filtered.filter(campaign => campaign.status === filter.status);
  }
  
  if (filter.creator) {
    filtered = filtered.filter(campaign => 
      campaign.config.creator.toLowerCase() === filter.creator!.toLowerCase()
    );
  }
  
  if (filter.category) {
    filtered = filtered.filter(campaign => 
      campaign.config.category.toLowerCase() === filter.category!.toLowerCase()
    );
  }
  
  if (filter.minTargetAmount) {
    filtered = filtered.filter(campaign => 
      campaign.config.targetAmount >= filter.minTargetAmount!
    );
  }
  
  if (filter.maxTargetAmount) {
    filtered = filtered.filter(campaign => 
      campaign.config.targetAmount <= filter.maxTargetAmount!
    );
  }
  
  if (filter.isActive !== undefined) {
    filtered = filtered.filter(campaign => 
      isCampaignActive(campaign) === filter.isActive
    );
  }
  
  // Apply pagination
  if (filter.offset) {
    filtered = filtered.slice(filter.offset);
  }
  
  if (filter.limit) {
    filtered = filtered.slice(0, filter.limit);
  }
  
  return filtered;
}

/**
 * Sort campaigns by criteria
 */
export function sortCampaigns(campaigns: Campaign[], sortBy: 'createdAt' | 'deadline' | 'totalRaised' | 'completionPercentage', order: 'asc' | 'desc' = 'desc'): Campaign[] {
  return [...campaigns].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        comparison = Number(a.createdAt - b.createdAt);
        break;
      case 'deadline':
        comparison = Number(a.config.deadline - b.config.deadline);
        break;
      case 'totalRaised':
        comparison = Number(a.totalRaised - b.totalRaised);
        break;
      case 'completionPercentage':
        comparison = a.completionPercentage - b.completionPercentage;
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Calculate campaign statistics
 */
export function calculateCampaignStats(campaigns: Campaign[]): {
  totalCampaigns: number;
  activeCampaigns: number;
  successfulCampaigns: number;
  failedCampaigns: number;
  totalAmountRaised: i128;
  averageDuration: number;
  successRate: number;
} {
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => isCampaignActive(c)).length;
  const successfulCampaigns = campaigns.filter(c => c.status === CampaignStatus.SUCCESSFUL).length;
  const failedCampaigns = campaigns.filter(c => c.status === CampaignStatus.FAILED).length;
  
  const totalAmountRaised = campaigns.reduce((sum, c) => sum + c.totalRaised, 0n);
  
  const completedCampaigns = campaigns.filter(c => 
    c.status === CampaignStatus.SUCCESSFUL || c.status === CampaignStatus.FAILED
  );
  
  const averageDuration = completedCampaigns.length > 0
    ? completedCampaigns.reduce((sum, c) => sum + Number(c.updatedAt - c.createdAt), 0) / completedCampaigns.length
    : 0;
  
  const successRate = completedCampaigns.length > 0
    ? (successfulCampaigns / completedCampaigns.length) * 100
    : 0;
  
  return {
    totalCampaigns,
    activeCampaigns,
    successfulCampaigns,
    failedCampaigns,
    totalAmountRaised,
    averageDuration,
    successRate
  };
}

/**
 * Calculate contributor statistics
 */
export function calculateContributorStats(contributions: Contribution[]): {
  totalContributions: number;
  totalAmountContributed: i128;
  averageContribution: i128;
  campaignsContributed: number;
} {
  const totalContributions = contributions.length;
  const totalAmountContributed = contributions.reduce((sum, c) => sum + c.amount, 0n);
  const averageContribution = totalContributions > 0 ? totalAmountContributed / BigInt(totalContributions) : 0n;
  
  const uniqueCampaigns = new Set(contributions.map(c => c.campaignId));
  const campaignsContributed = uniqueCampaigns.size;
  
  return {
    totalContributions,
    totalAmountContributed,
    averageContribution,
    campaignsContributed
  };
}

/**
 * Check if user can contribute to campaign
 */
export function canContribute(campaign: Campaign, contributor: Address, amount: i128): { canContribute: boolean; reason?: string } {
  // Check if campaign is active
  if (!isCampaignActive(campaign)) {
    return {
      canContribute: false,
      reason: 'Campaign is not active'
    };
  }
  
  // Check if deadline has passed
  if (isDeadlinePassed(campaign.config.deadline)) {
    return {
      canContribute: false,
      reason: 'Campaign deadline has passed'
    };
  }
  
  // Check if goal is already reached
  if (campaign.isGoalReached) {
    return {
      canContribute: false,
      reason: 'Campaign goal has already been reached'
    };
  }
  
  // Check contribution amount
  if (amount < campaign.config.minContribution) {
    return {
      canContribute: false,
      reason: `Contribution amount must be at least ${formatAmount(campaign.config.minContribution)}`
    };
  }
  
  if (amount > campaign.config.maxContribution) {
    return {
      canContribute: false,
      reason: `Contribution amount must not exceed ${formatAmount(campaign.config.maxContribution)}`
    };
  }
  
  return {
    canContribute: true
  };
}

/**
 * Check if user can claim reward
 */
export function canClaimReward(campaign: Campaign, contributor: Address, rewardTier: RewardTier): { canClaim: boolean; reason?: string } {
  // Check if campaign is successful
  if (campaign.status !== CampaignStatus.SUCCESSFUL) {
    return {
      canClaim: false,
      reason: 'Campaign must be successful to claim rewards'
    };
  }
  
  // Check if reward tier is available
  if (rewardTier.quantity <= 0) {
    return {
      canClaim: false,
      reason: 'Reward tier is no longer available'
    };
  }
  
  // Check if delivery date has passed (if specified)
  if (rewardTier.deliveryDate && rewardTier.deliveryDate > BigInt(Date.now())) {
    return {
      canClaim: false,
      reason: 'Reward is not yet available for delivery'
    };
  }
  
  return {
    canClaim: true
  };
}
