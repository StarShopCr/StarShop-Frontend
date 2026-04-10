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
    network: {
      contractId: 'CCS7XKR3UV76MGC2XQ4ABLMTMGOUBTG2AQ4EGAL4L5CD2OQKP4X7A66G',
      networkPassphrase: 'Test SDF Network ; September 2015',
      rpcUrl: 'https://soroban-testnet.stellar.org',
      isTestnet: true
    }
  });
}

/**
 * Create a ProductFollowService with default mainnet configuration
 */
export function createMainnetFollowService(): ProductFollowService {
  return new ProductFollowService({
    network: {
      contractId: 'PRODUCT_FOLLOW_MAINNET_CONTRACT_ID',
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
      rpcUrl: 'https://horizon.stellar.org',
      isTestnet: false
    }
  });
}

// ==================== DEFAULT EXPORT ====================

export default ProductFollowService;
