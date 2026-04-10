// ==================== MAIN EXPORTS ====================

export { PromotionalBoostService } from './boost.service';

// Types
export * from './types/boost.types';
export * from './types/visibility.types';
export * from './types/payments.types';

// Constants
export * from './constants/boost.constants';

// Utilities
export * from './utils/boost.utils';

// ==================== CONVENIENCE FUNCTIONS ====================

import { PromotionalBoostService } from './boost.service';
import { BoostServiceConfig } from './types/boost.types';
import { NETWORKS } from './constants/boost.constants';

export function createPromotionalBoostService(config: BoostServiceConfig): PromotionalBoostService {
  return new PromotionalBoostService(config);
}

export function createTestnetPromotionalBoostService(): PromotionalBoostService {
  return new PromotionalBoostService({
    network: {
      contractId: NETWORKS.testnet.contractId as any,
      networkPassphrase: NETWORKS.testnet.networkPassphrase,
      rpcUrl: NETWORKS.testnet.rpcUrl,
      isTestnet: true
    }
  });
}

export default PromotionalBoostService;
