# Subscription Contract Service Layer

A comprehensive TypeScript service layer that provides a clean, type-safe interface for interacting with the Subscription Contract on Stellar/Soroban. This service abstracts complex blockchain interactions and provides easy-to-use methods for managing subscription plans, user subscriptions, feature access, and usage tracking in the Starshop application.

## 🏗 Service Structure

```
src/shared/services/subscription_contract/
├── subscription.service.ts          # Main service class with all contract interactions
├── types/
│   ├── subscription.types.ts        # Core subscription interfaces and types
│   ├── plan.types.ts               # Plan-related types and interfaces
│   └── usage.types.ts              # Usage tracking types and interfaces
├── utils/
│   └── subscription.utils.ts        # Helper functions and utilities
├── constants/
│   └── subscription.constants.ts    # Contract addresses, error codes, etc.
├── index.ts                         # Main exports
└── README.md                        # This documentation
```

## 🚀 Quick Start

### Installation

The service is already included in the project. Import it where needed:

```typescript
import { SubscriptionService, NETWORKS, PlanTier } from '@/shared/services/subscription_contract';
```

### Basic Usage

```typescript
// Initialize the service
const subscriptionService = new SubscriptionService({
  network: NETWORKS.testnet,
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true
});

await subscriptionService.initialize();

// Create a subscription plan
const planConfig = {
  planId: 'premium-monthly',
  name: 'Premium Monthly',
  duration: BigInt(30 * 24 * 60 * 60), // 30 days
  price: BigInt('10000000'), // 10 XLM
  benefits: ['premium_content', 'analytics', 'priority_support'],
  version: 1,
  tier: PlanTier.GOLD
};

const result = await subscriptionService.createPlan(planConfig);
if (result.success) {
  console.log('Plan created with transaction hash:', result.transactionHash);
}

// Subscribe user to a plan
const subscriptionResult = await subscriptionService.subscribe(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);

if (subscriptionResult.success) {
  console.log('User subscribed successfully');
}
```

## 📋 Features

### 1. Plan Management

#### Create Subscription Plan
```typescript
const planConfig = {
  planId: 'basic-monthly',
  name: 'Basic Monthly Plan',
  duration: BigInt(30 * 24 * 60 * 60), // 30 days
  price: BigInt('5000000'), // 5 XLM
  benefits: ['basic_features', 'email_support'],
  version: 1,
  tier: PlanTier.BASIC
};

const result = await subscriptionService.createPlan(planConfig);
```

#### Update Plan
```typescript
const updateResult = await subscriptionService.updatePlan('basic-monthly', {
  name: 'Basic Monthly Plan - Updated',
  price: BigInt('6000000') // 6 XLM
});
```

#### Disable Plan
```typescript
const disableResult = await subscriptionService.disablePlan('basic-monthly');
```

#### Get Plan Details
```typescript
const plan = await subscriptionService.getPlan('basic-monthly');
if (plan.success) {
  console.log('Plan details:', plan.data);
}
```

### 2. Subscription Management

#### Subscribe User to Plan
```typescript
const subscribeResult = await subscriptionService.subscribe(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);
```

#### Renew Subscription
```typescript
const renewResult = await subscriptionService.renew(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);
```

#### Reset Subscription (Admin Only)
```typescript
const resetResult = await subscriptionService.resetSubscription(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);
```

#### Check Subscription Status
```typescript
// Check if subscription is active
const isActive = await subscriptionService.isActiveSub(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);

// Check if subscription is expired
const isExpired = await subscriptionService.isExpiredSub(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);

// Check if subscription is in grace period
const isInGrace = await subscriptionService.isInGrace(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);

// Get detailed subscription state
const state = await subscriptionService.getState(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);
```

### 3. Feature Access & Usage Tracking

#### Access Premium Content
```typescript
const contentResult = await subscriptionService.premiumContent(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);

if (contentResult.success) {
  console.log('Premium content:', contentResult.data);
}
```

#### Access Gold Features
```typescript
const goldFeatureResult = await subscriptionService.goldFeature(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);
```

#### Get Feature Usage
```typescript
const usageResult = await subscriptionService.getFeatureUsage(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium_content'
);

if (usageResult.success) {
  console.log('Feature usage count:', usageResult.data);
}
```

### 4. User Roles

#### Add User Role
```typescript
const roleResult = await subscriptionService.addUserRole(
  'admin',
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
);
```

### 5. Cleanup Operations

#### Clean Up Expired Subscriptions
```typescript
const cleanupResult = await subscriptionService.cleanup(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'premium-monthly'
);
```

### 6. Analytics

#### Get Subscription Analytics
```typescript
const analytics = await subscriptionService.getAnalytics();
if (analytics.success) {
  console.log('Total active subscriptions:', analytics.data.totalActiveSubscriptions);
  console.log('Total revenue:', analytics.data.revenue.totalRevenue);
}
```

## 🔧 Configuration

### Network Configuration

```typescript
const config = {
  network: {
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  },
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000
  },
  monitoring: {
    enabled: true,
    metricsInterval: 60000, // 1 minute
    healthCheckInterval: 30000 // 30 seconds
  }
};
```

### Predefined Networks

```typescript
import { NETWORKS } from '@/shared/services/subscription_contract';

// Testnet
const testnetService = new SubscriptionService({
  network: NETWORKS.testnet
});

// Mainnet
const mainnetService = new SubscriptionService({
  network: NETWORKS.mainnet
});

// Futurenet
const futurenetService = new SubscriptionService({
  network: NETWORKS.futurenet
});
```

## 📊 Plan Tiers

The service supports four plan tiers with different features and pricing:

### Basic Tier
- **Features**: Basic support, standard features
- **Max Users**: 1,000
- **Price Range**: 0 - 1 XLM
- **Color**: Gray (#6B7280)

### Silver Tier
- **Features**: Priority support, advanced features, analytics
- **Max Users**: 5,000
- **Price Range**: 1 - 5 XLM
- **Color**: Silver (#9CA3AF)

### Gold Tier
- **Features**: Premium support, all features, analytics, custom integrations
- **Max Users**: 20,000
- **Price Range**: 5 - 20 XLM
- **Color**: Gold (#F59E0B)

### Platinum Tier
- **Features**: Dedicated support, all features, analytics, custom integrations, white label
- **Max Users**: 100,000
- **Price Range**: 20+ XLM
- **Color**: Purple (#8B5CF6)

## 🎯 Feature Access

### Available Features

#### Premium Content
- **Description**: Access to premium content and features
- **Usage Limit**: 1,000
- **Tiers**: Silver, Gold, Platinum

#### Gold Feature
- **Description**: Access to gold-tier exclusive features
- **Usage Limit**: 500
- **Tiers**: Gold, Platinum

#### Analytics
- **Description**: Access to detailed analytics and reporting
- **Usage Limit**: 100
- **Tiers**: Silver, Gold, Platinum

#### Custom Integrations
- **Description**: Access to custom integration features
- **Usage Limit**: 50
- **Tiers**: Gold, Platinum

#### White Label
- **Description**: Access to white-label features
- **Usage Limit**: 10
- **Tiers**: Platinum

## 🔍 Subscription States

### Active
- **Description**: Subscription is active and valid
- **Color**: Green (#10B981)

### Grace Period
- **Description**: Subscription is in grace period
- **Color**: Orange (#F59E0B)

### Expired
- **Description**: Subscription has expired
- **Color**: Red (#EF4444)

### Not Found
- **Description**: Subscription not found
- **Color**: Gray (#6B7280)

## 📈 Analytics & Monitoring

### Performance Metrics
```typescript
const metrics = subscriptionService.getPerformanceMetrics();
console.log('Average response time:', metrics.averageResponseTime);
console.log('Total operations:', metrics.totalOperations);
console.log('Success rate:', (metrics.successfulOperations / metrics.totalOperations) * 100);
```

### Health Check
```typescript
const health = await subscriptionService.performHealthCheck();
console.log('Service healthy:', health.isHealthy);
console.log('Contract connected:', health.contractConnected);
console.log('Network connected:', health.networkConnected);
console.log('Wallet connected:', health.walletConnected);
```

### Cache Management
```typescript
// Get cache statistics
const cacheStats = subscriptionService.getCacheStats();
console.log('Cache size:', cacheStats.size);
console.log('Cache keys:', cacheStats.keys);

// Clear cache
subscriptionService.clearCache();
```

## 🎧 Event Handling

### Add Event Listener
```typescript
const subscriptionId = subscriptionService.addEventListener(
  [SubscriptionEventType.PLAN_CREATED, SubscriptionEventType.SUBSCRIPTION_CREATED],
  (event) => {
    console.log('Event received:', event.type);
    console.log('Timestamp:', event.timestamp);
    console.log('Transaction hash:', event.transactionHash);
  }
);
```

### Remove Event Listener
```typescript
subscriptionService.removeEventListener(subscriptionId);
```

### Available Event Types
- `PLAN_CREATED` - Plan created
- `PLAN_UPDATED` - Plan updated
- `PLAN_DISABLED` - Plan disabled
- `SUBSCRIPTION_CREATED` - Subscription created
- `SUBSCRIPTION_RENEWED` - Subscription renewed
- `SUBSCRIPTION_EXPIRED` - Subscription expired
- `SUBSCRIPTION_RESET` - Subscription reset
- `FEATURE_ACCESS_GRANTED` - Feature access granted
- `FEATURE_ACCESS_DENIED` - Feature access denied
- `ROLE_ASSIGNED` - Role assigned
- `USAGE_LIMIT_REACHED` - Usage limit reached
- `CONTRACT_INITIALIZED` - Contract initialized
- `ERROR` - Error occurred

## 🛠 Utility Functions

### Validation
```typescript
import { validateAddress, validatePlanId, validatePlanConfig } from '@/shared/services/subscription_contract';

// Validate Stellar address
const addressValidation = validateAddress('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
console.log('Address valid:', addressValidation.isValid);

// Validate plan ID
const planIdValidation = validatePlanId('premium-monthly');
console.log('Plan ID valid:', planIdValidation.isValid);

// Validate plan configuration
const planConfigValidation = validatePlanConfig(planConfig);
console.log('Plan config valid:', planConfigValidation.isValid);
```

### Formatting
```typescript
import { formatPlanPrice, formatDuration, calculateSubscriptionDuration } from '@/shared/services/subscription_contract';

// Format plan price
const formattedPrice = formatPlanPrice(BigInt('10000000'), 7, 'XLM');
console.log('Formatted price:', formattedPrice.formatted);

// Format duration
const formattedDuration = formatDuration(BigInt(86400)); // 1 day
console.log('Formatted duration:', formattedDuration);

// Calculate subscription duration
const durationCalc = calculateSubscriptionDuration(BigInt(2592000)); // 30 days
console.log('Duration in days:', durationCalc.days);
console.log('Human readable:', durationCalc.humanReadable);
```

### Helper Functions
```typescript
import { 
  getTimeUntilExpiry, 
  isSubscriptionValid, 
  isSubscriptionInGrace,
  calculateFees 
} from '@/shared/services/subscription_contract';

// Calculate time until expiry
const timeUntilExpiry = getTimeUntilExpiry(BigInt(1640995200)); // Unix timestamp
console.log('Time until expiry:', timeUntilExpiry);

// Check if subscription is valid
const isValid = isSubscriptionValid(subscription);
console.log('Subscription valid:', isValid);

// Check if subscription is in grace period
const inGrace = isSubscriptionInGrace(subscription);
console.log('In grace period:', inGrace);

// Calculate fees for operation
const fees = calculateFees('CREATE_PLAN', 100000);
console.log('Operation fees:', fees);
```

## 🚨 Error Handling

### Error Codes
```typescript
import { SubscriptionErrorCode, PlanErrorCode, FeatureAccessErrorCode } from '@/shared/services/subscription_contract';

// Subscription errors
console.log(SubscriptionErrorCode.NOT_INITIALIZED); // 'NOT_INITIALIZED'
console.log(SubscriptionErrorCode.PLAN_NOT_FOUND); // 'PLAN_NOT_FOUND'
console.log(SubscriptionErrorCode.SUBSCRIPTION_EXPIRED); // 'SUBSCRIPTION_EXPIRED'

// Plan errors
console.log(PlanErrorCode.PLAN_ALREADY_EXISTS); // 'PLAN_ALREADY_EXISTS'
console.log(PlanErrorCode.PLAN_NOT_ACTIVE); // 'PLAN_NOT_ACTIVE'

// Feature access errors
console.log(FeatureAccessErrorCode.FEATURE_NOT_AVAILABLE); // 'FEATURE_NOT_AVAILABLE'
console.log(FeatureAccessErrorCode.USAGE_LIMIT_EXCEEDED); // 'USAGE_LIMIT_EXCEEDED'
```

### Error Handling Example
```typescript
try {
  const result = await subscriptionService.createPlan(planConfig);
  
  if (!result.success) {
    switch (result.errorCode) {
      case SubscriptionErrorCode.PLAN_ALREADY_EXISTS:
        console.error('Plan already exists');
        break;
      case SubscriptionErrorCode.VALIDATION_ERROR:
        console.error('Validation failed:', result.error);
        break;
      default:
        console.error('Unknown error:', result.error);
    }
  }
} catch (error) {
  console.error('Service error:', error);
}
```

## 🔒 Security Considerations

### Input Validation
- All inputs are validated before contract interactions
- Address format validation for Stellar addresses
- Plan ID format validation
- Feature name validation
- Role name validation

### Access Control
- Admin-only operations are properly protected
- User role validation for feature access
- Subscription state validation before operations

### Error Handling
- Comprehensive error mapping from contract errors
- User-friendly error messages
- Proper error code classification

## 📝 Examples

### Complete Workflow Example
```typescript
import { 
  SubscriptionService, 
  NETWORKS, 
  PlanTier, 
  SubscriptionEventType 
} from '@/shared/services/subscription_contract';

async function subscriptionWorkflow() {
  // Initialize service
  const service = new SubscriptionService({
    network: NETWORKS.testnet
  });
  
  await service.initialize();
  
  // Add event listener
  service.addEventListener(
    [SubscriptionEventType.PLAN_CREATED, SubscriptionEventType.SUBSCRIPTION_CREATED],
    (event) => {
      console.log(`Event: ${event.type} at ${event.timestamp}`);
    }
  );
  
  // Create a plan
  const planResult = await service.createPlan({
    planId: 'premium-monthly',
    name: 'Premium Monthly Plan',
    duration: BigInt(30 * 24 * 60 * 60),
    price: BigInt('10000000'),
    benefits: ['premium_content', 'analytics', 'priority_support'],
    version: 1,
    tier: PlanTier.GOLD
  });
  
  if (!planResult.success) {
    throw new Error(`Plan creation failed: ${planResult.error}`);
  }
  
  console.log('Plan created successfully');
  
  // Subscribe user
  const userAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const subscribeResult = await service.subscribe(userAddress, 'premium-monthly');
  
  if (!subscribeResult.success) {
    throw new Error(`Subscription failed: ${subscribeResult.error}`);
  }
  
  console.log('User subscribed successfully');
  
  // Check subscription status
  const isActive = await service.isActiveSub(userAddress, 'premium-monthly');
  console.log('Subscription active:', isActive.data);
  
  // Access premium content
  const contentResult = await service.premiumContent(userAddress, 'premium-monthly');
  if (contentResult.success) {
    console.log('Premium content accessed:', contentResult.data);
  }
  
  // Get analytics
  const analytics = await service.getAnalytics();
  if (analytics.success) {
    console.log('Total active subscriptions:', analytics.data.totalActiveSubscriptions);
  }
  
  // Health check
  const health = await service.performHealthCheck();
  console.log('Service health:', health.isHealthy);
}

// Run the workflow
subscriptionWorkflow().catch(console.error);
```

### Batch Operations Example
```typescript
async function batchPlanCreation() {
  const service = new SubscriptionService({ network: NETWORKS.testnet });
  await service.initialize();
  
  const plans = [
    {
      planId: 'basic-monthly',
      name: 'Basic Monthly',
      duration: BigInt(30 * 24 * 60 * 60),
      price: BigInt('5000000'),
      benefits: ['basic_features'],
      version: 1,
      tier: PlanTier.BASIC
    },
    {
      planId: 'silver-monthly',
      name: 'Silver Monthly',
      duration: BigInt(30 * 24 * 60 * 60),
      price: BigInt('8000000'),
      benefits: ['basic_features', 'analytics'],
      version: 1,
      tier: PlanTier.SILVER
    }
  ];
  
  const results = await Promise.allSettled(
    plans.map(plan => service.createPlan(plan))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`Plan ${plans[index].planId} created successfully`);
    } else {
      console.error(`Plan ${plans[index].planId} creation failed`);
    }
  });
}
```

## 🤝 Contributing

When contributing to the subscription service:

1. Follow the existing code structure and patterns
2. Add comprehensive TypeScript types for new features
3. Include proper error handling and validation
4. Update documentation and examples
5. Add unit tests for new functionality

## 📄 License

This service is part of the Starshop application and follows the same licensing terms.
