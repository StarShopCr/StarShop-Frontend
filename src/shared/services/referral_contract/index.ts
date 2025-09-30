// Main service export
export { ReferralService } from './referral.service';

// Type exports
export * from './types/referral.types';
export * from './types/user.types';
export * from './types/milestone.types';

// Constant exports
export * from './constants/referral.constants';

// Utility exports
export * from './utils/referral.utils';

// Re-export contract types for convenience
export type {
  UserData as ContractUserData,
  UserLevel as ContractUserLevel,
  VerificationStatus as ContractVerificationStatus,
  Milestone as ContractMilestone,
  RewardRates as ContractRewardRates,
  LevelRequirements as ContractLevelRequirements,
  MilestoneRequirement as ContractMilestoneRequirement,
  LevelCriteria as ContractLevelCriteria,
  Errors as ContractErrors
} from '../../../../packages/referral_contract/src/index';
