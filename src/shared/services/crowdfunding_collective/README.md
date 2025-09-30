# Crowdfunding Collective Contract Service

A comprehensive TypeScript service layer for interacting with the Crowdfunding Collective Contract on Stellar/Soroban. This service provides a clean, type-safe interface for managing crowdfunding campaigns, contributions, and reward distributions in the StarShop application.

## 🏗 Service Structure

```
src/shared/services/crowdfunding_collective/
├── crowdfunding.service.ts          # Main service class with all contract interactions
├── types/
│   ├── crowdfunding.types.ts       # Core crowdfunding interfaces and types
│   └── events.types.ts             # Event-related types and interfaces
├── utils/
│   └── crowdfunding.utils.ts       # Helper functions and utilities
├── constants/
│   └── crowdfunding.constants.ts   # Contract addresses, error codes, validation rules
├── index.ts                        # Main exports
└── README.md                       # This documentation
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { CrowdfundingService } from '@/shared/services/crowdfunding_collective';

// Initialize the service
const crowdfundingService = new CrowdfundingService({
  network: {
    contractId: 'CROWDFUNDING_CONTRACT_ID',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  }
});

// Initialize the service
await crowdfundingService.initialize();
```

### Create a Campaign

```typescript
const campaignRequest = {
  config: {
    title: 'Amazing Product Launch',
    description: 'Help us launch our revolutionary product!',
    targetAmount: BigInt('10000000000'), // 1000 XLM (7 decimals)
    deadline: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    minContribution: BigInt('1000000'), // 1 XLM
    maxContribution: BigInt('1000000000'), // 100 XLM
    creator: 'GABC123...',
    category: 'technology',
    imageUrl: 'https://example.com/image.jpg',
    externalUrl: 'https://example.com'
  },
  rewardTiers: [
    {
      id: 1,
      name: 'Early Bird',
      description: 'Get early access to the product',
      minContribution: BigInt('1000000'), // 1 XLM
      reward: 'Early access + 10% discount',
      quantity: 100,
      isLimited: true,
      deliveryDate: BigInt(Date.now() + 60 * 24 * 60 * 60 * 1000)
    }
  ],
  milestones: [
    {
      id: 1,
      title: '25% Funding Goal',
      description: 'Reach 25% of our funding target',
      targetAmount: BigInt('2500000000'), // 250 XLM
      order: 1
    }
  ],
  admin: 'GADMIN123...'
};

const result = await crowdfundingService.createProduct(campaignRequest);

if (result.success) {
  console.log('Campaign created with ID:', result.data);
} else {
  console.error('Campaign creation failed:', result.error);
}
```

### Make a Contribution

```typescript
const contributionRequest = {
  campaignId: 1,
  contributor: 'GCONTRIBUTOR123...',
  amount: BigInt('5000000'), // 5 XLM
  rewardTierId: 1 // Optional
};

const result = await crowdfundingService.contribute(contributionRequest);

if (result.success) {
  console.log('Contribution successful:', result.data.transactionHash);
} else {
  console.error('Contribution failed:', result.error);
}
```

## 📋 Features

### 🏗 Contract Initialization & Admin Management

- **`initializeCrowdfundingContract(admin)`** - Initialize the crowdfunding contract
- **`getAdmin()`** - Get current admin address
- **`setAdmin(newAdmin)`** - Transfer admin rights to new address
- **`isInitialized()`** - Check if contract is initialized

### 🎯 Product Management

- **`createProduct(config)`** - Create new crowdfunding campaign with rewards and milestones
- **`getProduct(campaignId)`** - Get comprehensive campaign details
- **`getProductStatus(campaignId)`** - Get current campaign status
- **`getRewardTiers(campaignId)`** - Get available reward tiers for a campaign
- **`getMilestones(campaignId)`** - Get campaign milestones and progress

### 💰 Funding Operations

- **`contribute(campaignId, amount)`** - User contribution to campaign
- **`distributeFunds(campaignId, amount, recipient)`** - Admin fund distribution
- **`refundContributors(campaignId, contributor, amount)`** - Refund failed campaigns
- **`getContributions(campaignId)`** - Get contribution history for a campaign

### 🏆 Reward Management

- **`claimReward(campaignId, contributor, rewardTierId)`** - Claim contributor rewards
- **`updateMilestone(campaignId, milestoneId, isAchieved)`** - Update campaign progress

### 📊 Analytics & Statistics

- **`getCampaignStats()`** - Get comprehensive campaign statistics
- **`getContributorStats(contributor)`** - Get contributor performance metrics
- **`filterCampaigns(filter)`** - Filter campaigns by various criteria
- **`sortCampaigns(campaigns, sortBy, order)`** - Sort campaigns by different criteria

## 🔧 Configuration

### Service Configuration

```typescript
interface CrowdfundingServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds?: number;    // Default: 30
  fee?: number;                // Default: 100000 stroops
  simulate?: boolean;          // Default: true
  retryConfig?: RetryConfig;
  cache?: CacheConfig;
}
```

### Network Configuration

```typescript
interface NetworkConfig {
  networkPassphrase: string;
  contractId: string;
  rpcUrl: string;
  isTestnet: boolean;
}
```

### Retry Configuration

```typescript
interface RetryConfig {
  maxRetries: number;          // Default: 3
  retryDelay: number;          // Default: 1000ms
  exponentialBackoff?: boolean; // Default: true
}
```

### Cache Configuration

```typescript
interface CacheConfig {
  enabled: boolean;            // Default: true
  ttl: number;                // Default: 300000ms (5 minutes)
  maxSize: number;            // Default: 1000
}
```

## 🎯 Campaign Management

### Creating Campaigns

Campaigns are created with comprehensive configuration including:

- **Basic Info**: Title, description, target amount, deadline
- **Contribution Limits**: Minimum and maximum contribution amounts
- **Reward Tiers**: Multiple reward levels with different contribution requirements
- **Milestones**: Progress tracking with achievement targets
- **Metadata**: Category, images, external links

### Campaign Status

Campaigns can have the following statuses:

- **`ACTIVE`** - Campaign is accepting contributions
- **`SUCCESSFUL`** - Campaign reached its funding goal
- **`FAILED`** - Campaign did not reach its goal by deadline
- **`CANCELLED`** - Campaign was cancelled by admin
- **`COMPLETED`** - Campaign completed successfully

### Campaign Validation

The service includes comprehensive validation for:

- Title and description length limits
- Target amount ranges
- Deadline validation (minimum 1 day, maximum 1 year)
- Contribution amount limits
- Address format validation
- URL format validation
- Reward tier validation
- Milestone validation

## 💰 Contribution System

### Making Contributions

Contributions are validated against:

- Campaign status (must be active)
- Deadline (must not be passed)
- Goal status (must not be reached)
- Amount limits (within campaign min/max)
- Contributor address format

### Contribution Tracking

Each contribution includes:

- Unique contribution ID
- Contributor address
- Contribution amount
- Timestamp
- Associated reward tier (if any)
- Refund status

## 🏆 Reward System

### Reward Tiers

Reward tiers define different contribution levels and their associated rewards:

- **Tier ID**: Unique identifier
- **Name & Description**: Clear reward description
- **Contribution Requirements**: Minimum (and optional maximum) contribution
- **Reward Details**: What the contributor receives
- **Quantity Limits**: How many rewards are available
- **Delivery Information**: When and how rewards are delivered

### Claiming Rewards

Rewards can be claimed when:

- Campaign status is `SUCCESSFUL`
- Reward tier is still available
- Delivery date has passed (if specified)
- Contributor has made sufficient contribution

## 📈 Milestone System

### Milestone Tracking

Milestones help track campaign progress:

- **Target Amounts**: Specific funding targets
- **Achievement Status**: Whether milestone is reached
- **Order**: Sequential milestone progression
- **Timestamps**: When milestones are achieved

### Milestone Updates

Admins can update milestone status:

- Mark milestones as achieved
- Set achievement timestamps
- Track progress toward campaign goals

## 🔄 Event System

### Event Types

The service emits events for:

- Campaign creation and updates
- Status changes
- Contributions made
- Funds distributed
- Refunds processed
- Rewards claimed
- Milestones achieved
- Admin changes
- Errors

### Event Listening

```typescript
// Add event listener
const subscriptionId = crowdfundingService.addEventListener(
  [CrowdfundingEventType.CONTRIBUTION_MADE, CrowdfundingEventType.CAMPAIGN_CREATED],
  (event) => {
    console.log('Event received:', event);
  },
  {
    campaignId: 1, // Optional filter
    contributor: 'GABC123...' // Optional filter
  }
);

// Remove event listener
crowdfundingService.removeEventListener(subscriptionId);
```

## 🛠 Error Handling

### Error Types

The service categorizes errors into:

- **Network Errors**: Connection issues
- **Contract Errors**: Transaction failures
- **Validation Errors**: Input validation failures
- **Wallet Errors**: Signature or wallet issues
- **Campaign Errors**: Campaign-specific issues
- **Contribution Errors**: Contribution-related issues
- **Reward Errors**: Reward system issues
- **Milestone Errors**: Milestone-related issues

### Error Codes

Comprehensive error codes for different scenarios:

```typescript
CROWDFUNDING_ERROR_CODES = {
  // Contract errors
  ALREADY_INITIALIZED: 1,
  CONTRACT_NOT_INITIALIZED: 2,
  UNAUTHORIZED: 3,
  
  // Campaign errors
  CAMPAIGN_NOT_FOUND: 101,
  CAMPAIGN_NOT_ACTIVE: 104,
  CAMPAIGN_DEADLINE_PASSED: 108,
  
  // Contribution errors
  INVALID_CONTRIBUTION_AMOUNT: 201,
  CONTRIBUTION_TOO_SMALL: 202,
  CONTRIBUTION_TOO_LARGE: 203,
  
  // And many more...
}
```

## 📊 Performance Monitoring

### Health Checks

```typescript
const health = await crowdfundingService.healthCheck();

console.log('Service Health:', {
  isHealthy: health.isHealthy,
  contractConnected: health.contractConnected,
  networkConnected: health.networkConnected,
  walletConnected: health.walletConnected,
  errors: health.errors
});
```

### Performance Metrics

```typescript
const metrics = crowdfundingService.getPerformanceMetrics();

console.log('Performance:', {
  averageResponseTime: metrics.averageResponseTime,
  totalOperations: metrics.totalOperations,
  successfulOperations: metrics.successfulOperations,
  failedOperations: metrics.failedOperations,
  cacheHitRate: metrics.cacheHitRate
});
```

## 🔧 Utility Functions

### Amount Formatting

```typescript
import { formatAmount, parseAmount } from '@/shared/services/crowdfunding_collective';

// Format amount for display
const displayAmount = formatAmount(BigInt('10000000'), 7); // "1.0"

// Parse amount from string
const amount = parseAmount('1.5', 7); // BigInt('15000000')
```

### Validation Helpers

```typescript
import { 
  isValidStellarAddress, 
  isValidAmount, 
  validateCampaignConfig 
} from '@/shared/services/crowdfunding_collective';

// Validate Stellar address
const isValid = isValidStellarAddress('GABC123...');

// Validate amount
const isValidAmount = isValidAmount(BigInt('1000000'), BigInt('100000'), BigInt('10000000'));

// Validate campaign config
const validation = validateCampaignConfig(campaignConfig);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### Campaign Utilities

```typescript
import { 
  isCampaignActive, 
  isGoalReached, 
  calculateCompletionPercentage 
} from '@/shared/services/crowdfunding_collective';

// Check if campaign is active
const active = isCampaignActive(campaign);

// Check if goal is reached
const goalReached = isGoalReached(campaign.totalRaised, campaign.config.targetAmount);

// Calculate completion percentage
const percentage = calculateCompletionPercentage(campaign.totalRaised, campaign.config.targetAmount);
```

## 🧪 Testing

### Unit Tests

```typescript
import { CrowdfundingService } from '@/shared/services/crowdfunding_collective';

describe('CrowdfundingService', () => {
  let service: CrowdfundingService;

  beforeEach(() => {
    service = new CrowdfundingService({
      network: NETWORKS.testnet
    });
  });

  it('should initialize service', async () => {
    await service.initialize();
    expect(service).toBeDefined();
  });

  it('should create campaign', async () => {
    const result = await service.createProduct(campaignRequest);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('Crowdfunding Integration', () => {
  it('should handle complete campaign lifecycle', async () => {
    // Create campaign
    const createResult = await service.createProduct(campaignRequest);
    expect(createResult.success).toBe(true);

    // Make contribution
    const contributeResult = await service.contribute(contributionRequest);
    expect(contributeResult.success).toBe(true);

    // Check campaign status
    const statusResult = await service.getProductStatus(createResult.data);
    expect(statusResult.data).toBe(CampaignStatus.ACTIVE);
  });
});
```

## 🔒 Security Considerations

### Input Validation

- All inputs are validated before contract interaction
- Address formats are verified
- Amount ranges are enforced
- String lengths are limited
- URL formats are validated

### Access Control

- Admin operations require proper authorization
- Campaign creators have specific permissions
- Contributors can only contribute to active campaigns
- Reward claims are validated against contribution history

### Error Handling

- Sensitive information is not exposed in error messages
- Comprehensive error logging for debugging
- Graceful degradation on failures
- Retry mechanisms for transient errors

## 📚 Examples

### Complete Campaign Lifecycle

```typescript
// 1. Initialize service
const service = new CrowdfundingService(config);
await service.initialize();

// 2. Create campaign
const campaignResult = await service.createProduct({
  config: campaignConfig,
  rewardTiers: rewardTiers,
  milestones: milestones,
  admin: adminAddress
});

// 3. Make contributions
const contributionResult = await service.contribute({
  campaignId: campaignResult.data,
  contributor: contributorAddress,
  amount: BigInt('5000000')
});

// 4. Check progress
const campaign = await service.getProduct(campaignResult.data);
console.log(`Progress: ${campaign.data.completionPercentage}%`);

// 5. Distribute funds (when goal reached)
const distributeResult = await service.distributeFunds({
  campaignId: campaignResult.data,
  admin: adminAddress,
  amount: campaign.data.totalRaised,
  recipient: campaign.data.config.creator,
  reason: 'Campaign goal reached'
});

// 6. Claim rewards
const claimResult = await service.claimReward({
  campaignId: campaignResult.data,
  contributor: contributorAddress,
  rewardTierId: 1,
  deliveryAddress: contributorAddress
});
```

### Event Handling

```typescript
// Set up event listeners
service.addEventListener(
  [CrowdfundingEventType.CONTRIBUTION_MADE],
  (event) => {
    console.log(`New contribution: ${event.amount} from ${event.contributor}`);
    // Update UI, send notifications, etc.
  }
);

service.addEventListener(
  [CrowdfundingEventType.CAMPAIGN_CREATED],
  (event) => {
    console.log(`New campaign created: ${event.campaignId}`);
    // Refresh campaign list, send notifications, etc.
  }
);
```

### Error Handling

```typescript
const result = await service.contribute(contributionRequest);

if (!result.success) {
  switch (result.errorCode) {
    case CROWDFUNDING_ERROR_CODES.CAMPAIGN_NOT_ACTIVE:
      console.error('Campaign is not active');
      break;
    case CROWDFUNDING_ERROR_CODES.CONTRIBUTION_TOO_SMALL:
      console.error('Contribution amount is too small');
      break;
    case CROWDFUNDING_ERROR_CODES.CAMPAIGN_DEADLINE_PASSED:
      console.error('Campaign deadline has passed');
      break;
    default:
      console.error('Contribution failed:', result.error);
  }
}
```

## 🤝 Contributing

When contributing to this service:

1. Follow the existing code patterns and structure
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all validations are in place
5. Add proper error handling
6. Update type definitions as needed

## 📄 License

This service is part of the StarShop project and follows the same licensing terms.
