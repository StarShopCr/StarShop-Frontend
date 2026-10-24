// Main service class
export { LimitedTimeDropService } from './limited_drop.service';
export type { LimitedTimeDropServiceOptions } from './limited_drop.service';

// Types
export type {
  DropStatus,
  DropConfig,
  CreateDropParams,
  UpdateDropParams,
  DropResponse,
  ParticipationParams,
  ParticipationResult,
  ParticipationMetrics,
  TimeRemainingResult,
  PaginationParams,
} from './types/drop.types';

export type {
  AccessTier,
  AccessEntry,
  AccessCheckResult,
  GrantAccessParams,
} from './types/access.types';

// Constants
export {
  DROP_ERROR_CODES,
  ERROR_MESSAGES,
  DROP_STATUS,
  ACCESS_TIERS,
  TIER_ALLOCATION_MULTIPLIERS,
  TIME_CONSTANTS,
  DEFAULT_DROP_CONFIG,
} from './constants/drop.constants';

// Utilities
export {
  isValidStellarAddress,
  generateDropId,
  generateTxHash,
  validateCreateDropParams,
  validateUpdateDropParams,
  computeDynamicStatus,
  calculateTimeRemaining,
  formatDuration,
  calculateParticipationMetrics,
} from './utils/drop.utils';
