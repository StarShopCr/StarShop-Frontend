export { ProductFollowService } from './follow.service';
export type { ProductFollowServiceOptions } from './follow.service';

export type {
  FollowEntry,
  FollowStatus,
  FollowResponse,
  PaginationParams,
} from './types/follow.types';

export type {
  NotificationChannel,
  NotificationPreference,
  AlertConfig,
  AlertTriggerType,
} from './types/notification.types';

export type {
  FollowStats,
  ProductPopularityMetrics,
} from './types/stats.types';

export {
  FOLLOW_ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  TIME_CONSTANTS,
} from './constants/follow.constants';

export {
  isValidStellarAddress,
  generateTxHash,
  generateAlertId,
  calculatePriceDropPercentage,
  isUserEligibleForPriceDropAlert,
  paginateArray,
} from './utils/follow.utils';
