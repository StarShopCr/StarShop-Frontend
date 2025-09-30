# Referral Contract Service

A comprehensive TypeScript service layer for interacting with the Referral Contract on Stellar/Soroban. This service provides a clean, type-safe interface for managing referral programs, user verification, reward distribution, and milestone tracking in the StarShop application.

## Features

### 🏗 Contract Management
- **Initialization**: Initialize the referral contract with admin and reward token
- **Admin Management**: Get admin, transfer admin rights, pause/resume contract
- **Token Management**: Set and update reward token addresses

### 👥 User Management
- **Registration**: Register users with referrers and identity proof
- **Verification**: Submit, approve, and reject user verifications
- **User Data**: Get comprehensive user information and statistics

### 🔗 Referral System
- **Referral Tracking**: Track direct referrals and team sizes
- **Level Management**: Manage user levels (Basic, Silver, Gold, Platinum)
- **Conversion Rates**: Calculate referral conversion metrics

### 💰 Reward System
- **Reward Distribution**: Distribute rewards to users and their upline
- **Reward Claims**: Allow users to claim accumulated rewards
- **Reward Tracking**: Track pending and total rewards

### 🏆 Milestone System
- **Milestone Management**: Add, update, and remove milestones
- **Progress Tracking**: Track milestone progress for users
- **Achievement Rewards**: Automatically reward milestone achievements

### 📊 Analytics & Metrics
- **System Metrics**: Get comprehensive system statistics
- **User Analytics**: Track user performance and engagement
- **Team Analytics**: Analyze referral team performance

## Installation

```bash
npm install @stellar/stellar-sdk
```

## Usage

### Basic Setup

```typescript
import { ReferralService } from './referral_contract';

// Initialize the service
const referralService = new ReferralService({
  network: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CCHXSA6WFERL3VE4K4TEHFYOYIEFIP5CXWY6OGMKUHXBQG3HTRCMZRO6',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  }
});

// Initialize the service
await referralService.initialize();
```

### Contract Initialization

```typescript
// Initialize the contract
const result = await referralService.initializeReferralContract(
  'GABC123...', // Admin address
  'GDEF456...'  // Reward token address
);

if (result.success) {
  console.log('Contract initialized successfully');
}
```

### User Registration

```typescript
// Register a new user with referrer
const registrationResult = await referralService.registerWithReferral({
  user: 'GUSER123...',
  referrerAddress: 'GREFER456...',
  identityProof: 'identity_proof_hash'
});

if (registrationResult.success) {
  console.log('User registered successfully');
}
```

### User Verification

```typescript
// Submit verification request
await referralService.submitVerification('GUSER123...', 'identity_proof');

// Approve verification (admin only)
await referralService.approveVerification('GUSER123...');

// Check verification status
const statusResult = await referralService.getVerificationStatus('GUSER123...');
console.log('Verification status:', statusResult.data);
```

### Referral Management

```typescript
// Get user's direct referrals
const referralsResult = await referralService.getDirectReferrals('GUSER123...');
console.log('Direct referrals:', referralsResult.data);

// Get team size
const teamSizeResult = await referralService.getTeamSize('GUSER123...');
console.log('Team size:', teamSizeResult.data);

// Get user level
const levelResult = await referralService.getUserLevel('GUSER123...');
console.log('User level:', levelResult.data);
```

### Reward Management

```typescript
// Distribute rewards
const distributeResult = await referralService.distributeRewards(
  'GUSER123...',
  BigInt('1000000000') // 1000 tokens
);

// Claim rewards
const claimResult = await referralService.claimRewards('GUSER123...');
console.log('Claimed rewards:', claimResult.data);

// Get pending rewards
const pendingResult = await referralService.getPendingRewards('GUSER123...');
console.log('Pending rewards:', pendingResult.data);
```

### Milestone Management

```typescript
// Add a new milestone
const milestone = {
  description: 'Refer 10 users',
  required_level: UserLevel.Basic,
  requirement: { tag: 'DirectReferrals', values: [10] },
  reward_amount: BigInt('5000000000') // 5000 tokens
};

const addResult = await referralService.addMilestone(milestone);

// Check and reward milestones
const checkResult = await referralService.checkAndRewardMilestone('GUSER123...');
```

### Analytics

```typescript
// Get system metrics
const metricsResult = await referralService.getSystemMetrics();
console.log('System metrics:', metricsResult.data);

// Get total users
const totalUsersResult = await referralService.getTotalUsers();
console.log('Total users:', totalUsersResult.data);

// Get total distributed rewards
const totalRewardsResult = await referralService.getTotalDistributedRewards();
console.log('Total rewards:', totalRewardsResult.data);
```

## Configuration

### Service Configuration

```typescript
interface ReferralServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds?: number;
  fee?: number;
  simulate?: boolean;
  retryConfig?: RetryConfig;
  cache?: CacheConfig;
  monitoring?: MonitoringConfig;
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

## Error Handling

The service provides comprehensive error handling with standardized error responses:

```typescript
interface ReferralResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  transactionHash?: string;
}
```

### Error Types

- `NETWORK_ERROR`: Network/connection issues
- `CONTRACT_ERROR`: Contract/transaction errors
- `VALIDATION_ERROR`: Input validation errors
- `WALLET_ERROR`: Wallet connection issues
- `USER_ERROR`: User-related errors
- `REFERRAL_ERROR`: Referral system errors
- `REWARD_ERROR`: Reward system errors
- `MILESTONE_ERROR`: Milestone system errors
- `VERIFICATION_ERROR`: Verification system errors
- `AUTHORIZATION_ERROR`: Permission/authorization errors

## Caching

The service includes built-in caching for improved performance:

```typescript
interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}
```

## Event System

The service supports event listeners for real-time updates:

```typescript
// Add event listener
const subscriptionId = referralService.addEventListener(
  [ReferralEventType.USER_REGISTERED, ReferralEventType.REWARD_DISTRIBUTED],
  (event) => {
    console.log('Event received:', event);
  }
);

// Remove event listener
referralService.removeEventListener(subscriptionId);
```

### Event Types

- `USER_REGISTERED`: New user registered
- `USER_VERIFIED`: User verification approved
- `USER_LEVEL_UPGRADED`: User level upgraded
- `REWARD_DISTRIBUTED`: Rewards distributed
- `REWARD_CLAIMED`: Rewards claimed
- `MILESTONE_ACHIEVED`: Milestone achieved
- `CONTRACT_PAUSED`: Contract paused
- `CONTRACT_RESUMED`: Contract resumed
- `ADMIN_CHANGED`: Admin changed
- `ERROR`: Error occurred

## Performance Monitoring

The service tracks performance metrics:

```typescript
const metrics = referralService.getPerformanceMetrics();
console.log('Average response time:', metrics.averageResponseTime);
console.log('Total operations:', metrics.totalOperations);
console.log('Success rate:', metrics.successfulOperations / metrics.totalOperations);
```

## Health Check

Check service health:

```typescript
const health = await referralService.healthCheck();
console.log('Service healthy:', health.isHealthy);
console.log('Contract connected:', health.contractConnected);
console.log('Network connected:', health.networkConnected);
console.log('Wallet connected:', health.walletConnected);
```

## Utility Functions

The service includes many utility functions:

```typescript
import { 
  formatRewardAmount,
  parseRewardAmount,
  calculateLevelProgress,
  buildReferralTree,
  generateUserReferralCode,
  formatUserLevelName,
  getUserLevelColor
} from './referral_contract';

// Format reward amount
const formatted = formatRewardAmount(BigInt('1000000000'), 7); // "1000.0"

// Calculate level progress
const progress = calculateLevelProgress(userData, levelRequirements);

// Generate referral code
const referralCode = generateUserReferralCode('GUSER123...');

// Format user level
const levelName = formatUserLevelName(UserLevel.Gold); // "Gold"
const levelColor = getUserLevelColor(UserLevel.Gold); // "#F59E0B"
```

## Type Safety

The service is fully typed with comprehensive TypeScript interfaces:

- `UserData`: Complete user information
- `Milestone`: Milestone configuration
- `RewardRates`: Reward rate configuration
- `SystemMetrics`: System statistics
- `ReferralResponse<T>`: Standardized response wrapper
- `TransactionResult`: Transaction execution results

## Best Practices

1. **Always check response success**: Check `result.success` before accessing data
2. **Handle errors gracefully**: Use try-catch blocks and check error responses
3. **Use caching**: Enable caching for better performance
4. **Monitor performance**: Track metrics and health status
5. **Validate inputs**: Use provided validation functions
6. **Clean up resources**: Call `destroy()` when done

## Examples

See the `examples/` directory for complete usage examples:

- `basic-usage.example.ts`: Basic service usage
- `advanced-features.example.ts`: Advanced features and patterns
- `error-handling.example.ts`: Error handling patterns
- `performance-optimization.example.ts`: Performance optimization techniques

## Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure type safety and error handling

## License

This service is part of the StarShop project and follows the same license terms.
