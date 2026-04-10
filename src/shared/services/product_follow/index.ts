// ==================== MAIN EXPORTS ====================

// Service class
export { ProductFollowService } from './follow.service';

// Types
export * from './types/follow.types';
export * from './types/notification.types';
export * from './types/alert.types';

// Constants
export * from './constants/follow.constants';

// Utilities
export * from './utils/follow.utils';

// ==================== CONVENIENCE FUNCTIONS ====================

import { FollowServiceConfig } from './types/follow.types';
import { NETWORKS } from './constants/follow.constants';

/**
 * Create a new ProductFollowService instance
 */
export function createProductFollowService(config: FollowServiceConfig): ProductFollowService {
  return new ProductFollowService(config);
}

/**
 * Create a ProductFollowService with default testnet configuration
 */
export function createTestnetFollowService(): ProductFollowService {
  return new ProductFollowService({
    network: { ...NETWORKS.testnet }
  });
}

/**
 * Create a ProductFollowService with default mainnet configuration
 */
export function createMainnetFollowService(): ProductFollowService {
  return new ProductFollowService({
    network: { ...NETWORKS.mainnet }
  });
}

// ==================== DEFAULT EXPORT ====================

export default ProductFollowService;
