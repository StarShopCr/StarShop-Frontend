# Airdrop Contract Service Layer

A comprehensive TypeScript service layer that provides a clean, type-safe interface for interacting with the Airdrop Contract on Stellar/Soroban. This service abstracts complex blockchain interactions and provides easy-to-use methods for managing airdrop events, user claims, and reward distributions in the Starshop application.

## 🏗 Service Structure

```
src/shared/services/airdrop_contract/
├── airdrop.service.ts          # Main service class with all contract interactions
├── types/
│   ├── airdrop.types.ts        # TypeScript interfaces and types
│   └── events.types.ts         # Event-related types
├── utils/
│   └── airdrop.utils.ts        # Helper functions and utilities
├── constants/
│   └── airdrop.constants.ts    # Contract addresses, error codes, etc.
├── examples/
│   └── usage.example.ts        # Usage examples and workflows
└── index.ts                    # Main exports
```

## 🚀 Quick Start

### Installation

The service is already included in the project. Import it where needed:

```typescript
import { AirdropService, NETWORKS, METRIC_TYPES } from '@/shared/services/airdrop_contract';
```

### Basic Usage

```typescript
// Initialize the service
const airdropService = new AirdropService({
  network: NETWORKS.testnet,
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true
});

await airdropService.initialize();

// Create an airdrop event
const eventConfig = {
  name: 'Loyalty Rewards - Q1 2024',
  description: 'Reward loyal customers',
  conditions: new Map([
    [METRIC_TYPES.PURCHASES, 5n],
    [METRIC_TYPES.TOTAL_SPENT, 1000n]
  ]),
  amount: 1000000000n, // 100 tokens
  tokenAddress: 'USDC_CONTRACT_ADDRESS',
  startTime: BigInt(Math.floor(Date.now() / 1000) + 3600),
  endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
  maxUsers: 1000n
};

const result = await airdropService.createAirdropEvent(eventConfig);
if (result.success) {
  console.log('Event created with ID:', result.data);
}
```

## 📋 Features

### 1. Contract Initialization & Admin Management

- **Initialize Contract**: Set up the contract with admin and provider registry
- **Admin Management**: Get, set, and verify admin addresses
- **Provider Registry**: Register, update, and remove metric providers

```typescript
// Initialize contract
await airdropService.initializeAirdropContract(adminAddress, initialProviders);

// Check if address is admin
const isAdmin = await airdropService.isAdmin(address);

// Register provider
await airdropService.registerProvider(METRIC_TYPES.PURCHASES, providerAddress);
```

### 2. Airdrop Event Management

- **Create Events**: Create new airdrop events with dynamic eligibility conditions
- **Event Control**: Pause, resume, and finalize events
- **Event Queries**: Get event details, statistics, and claimed users

```typescript
// Create event
const eventId = await airdropService.createAirdropEvent(config);

// Get event details
const event = await airdropService.getEvent(eventId);

// Pause event
await airdropService.pauseEvent(eventId);

// Get statistics
const stats = await airdropService.getEventStats(eventId);
```

### 3. User Claim Management

- **Individual Claims**: Users can claim tokens for eligible events
- **Eligibility Validation**: Check user eligibility before claiming
- **Batch Operations**: Admin can distribute tokens to multiple users

```typescript
// Check eligibility
const eligibility = await airdropService.checkEligibility(eventId, userAddress);

// Claim airdrop
const claimResult = await airdropService.claimAirdrop(eventId);

// Batch distribution
await airdropService.distributeBatch({
  eventId,
  users: ['GUSER1...', 'GUSER2...', 'GUSER3...']
});
```

### 4. Error Handling & Validation

- **Comprehensive Error Handling**: Maps contract errors to user-friendly messages
- **Input Validation**: Validates addresses, amounts, and time parameters
- **Network Error Handling**: Handles RPC failures with retry mechanisms

```typescript
const result = await airdropService.createAirdropEvent(config);
if (!result.success) {
  console.error('Error:', result.error);
  console.error('Error Code:', result.errorCode);
}
```

### 5. Type Safety & Interfaces

- **Core Types**: `AirdropEvent`, `EventStats`, `AirdropConfig`
- **Response Types**: `AirdropResponse<T>`, `TransactionResult`
- **Event Types**: Comprehensive event system with type-safe listeners

```typescript
// Type-safe event handling
airdropService.addEventListener(
  [AirdropEventType.CLAIM_SUCCESSFUL],
  (event) => {
    // event is fully typed
    console.log(`User ${event.userAddress} claimed ${event.claimAmount}`);
  }
);
```

### 6. Integration Features

- **Wallet Integration**: Supports multiple wallet providers
- **Event Monitoring**: Real-time event status updates
- **Caching Layer**: Caches frequently accessed data
- **Retry Mechanisms**: Automatic retry for failed operations

```typescript
// Set up event monitoring
const subscriptionId = airdropService.addEventListener(
  [AirdropEventType.EVENT_CREATED, AirdropEventType.CLAIM_SUCCESSFUL],
  (event) => {
    console.log('Event received:', event);
  }
);

// Remove monitoring
airdropService.removeEventListener(subscriptionId);
```

## 🔧 Configuration

### Service Configuration

```typescript
interface AirdropServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds?: number;
  fee?: number;
  simulate?: boolean;
  retryConfig?: RetryConfig;
  cache?: CacheConfig;
  monitoring?: EventMonitoringConfig;
}
```

### Network Configuration

```typescript
const config = {
  network: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CAJ67MAHPQYVCABUHVIQ5ZUMKN4FVHADRV425KIBBTDE3GDJ4QCE2CYS',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  }
};
```

## 📊 Event System

The service includes a comprehensive event system for monitoring contract activities:

### Event Types

- `EVENT_CREATED` - New airdrop event created
- `EVENT_PAUSED` - Event paused by admin
- `EVENT_RESUMED` - Event resumed by admin
- `EVENT_FINALIZED` - Event finalized
- `CLAIM_SUBMITTED` - User submitted claim
- `CLAIM_SUCCESSFUL` - Claim was successful
- `CLAIM_FAILED` - Claim failed
- `BATCH_DISTRIBUTION_STARTED` - Batch distribution started
- `BATCH_DISTRIBUTION_COMPLETED` - Batch distribution completed
- `PROVIDER_REGISTERED` - New provider registered
- `PROVIDER_UPDATED` - Provider updated
- `PROVIDER_REMOVED` - Provider removed
- `ADMIN_CHANGED` - Admin address changed
- `CONTRACT_INITIALIZED` - Contract initialized
- `ERROR` - Error occurred

### Event Monitoring

```typescript
// Listen to specific events
airdropService.addEventListener(
  [AirdropEventType.CLAIM_SUCCESSFUL, AirdropEventType.CLAIM_FAILED],
  (event) => {
    if (event.type === AirdropEventType.CLAIM_SUCCESSFUL) {
      console.log(`Claim successful: ${event.claimAmount} tokens`);
    } else {
      console.log(`Claim failed: ${event.error}`);
    }
  },
  {
    eventId: specificEventId, // Filter by event ID
    userAddress: specificUser // Filter by user address
  }
);
```

## 🛠 Utility Functions

The service includes numerous utility functions for common operations:

### Token Operations

```typescript
// Format token amounts
const formatted = formatTokenAmount(1000000000n, 7); // "100"

// Parse token amounts
const parsed = parseTokenAmount("100.5", 7); // 1005000000n

// Validate addresses
const isValid = isValidStellarAddress("GABC123...");
```

### Time Operations

```typescript
// Check if event is active
const isActive = isEventActive(event);

// Get time until expiry
const timeLeft = getTimeUntilExpiry(event);

// Format duration
const formatted = formatDuration(86400); // "1 day"
```

### Validation

```typescript
// Validate event configuration
const validation = validateEventConfig(config);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

## 🔍 Error Handling

The service provides comprehensive error handling with user-friendly messages:

### Error Codes

- `ALREADY_INITIALIZED` - Contract already initialized
- `UNAUTHORIZED` - Unauthorized access
- `INVALID_TOKEN_CONFIG` - Invalid token configuration
- `AIRDROP_NOT_FOUND` - Airdrop event not found
- `USER_NOT_ELIGIBLE` - User not eligible
- `ALREADY_CLAIMED` - User already claimed
- `INSUFFICIENT_CONTRACT_BALANCE` - Insufficient balance
- `TOKEN_TRANSFER_FAILED` - Token transfer failed
- `CONDITION_NOT_FOUND` - Eligibility condition not found
- `INVALID_AMOUNT` - Invalid amount
- `PROVIDER_NOT_CONFIGURED` - Provider not configured
- `PROVIDER_CALL_FAILED` - Provider call failed
- `EVENT_INACTIVE` - Event not active
- `CAP_EXCEEDED` - Event capacity exceeded
- `INVALID_EVENT_CONFIG` - Invalid event configuration

### Error Response Format

```typescript
interface AirdropResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
  transactionHash?: string;
}
```

## 📝 Examples

See `examples/usage.example.ts` for comprehensive usage examples including:

- Service initialization
- Contract administration
- Event management
- User operations
- Batch operations
- Event monitoring
- Complete workflows

## 🔒 Security Considerations

- Always validate user inputs before making contract calls
- Use proper error handling for all operations
- Implement rate limiting for public endpoints
- Validate admin permissions before administrative operations
- Use secure wallet integration practices

## 🚀 Performance Optimization

- The service includes built-in caching for frequently accessed data
- Retry mechanisms with exponential backoff for failed operations
- Batch operations for efficient bulk processing
- Event monitoring with configurable polling intervals

## 📚 API Reference

For detailed API documentation, see the TypeScript interfaces in the `types/` directory. All methods are fully typed and documented with JSDoc comments.

## 🤝 Contributing

When contributing to this service:

1. Maintain type safety throughout
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update documentation and examples
5. Follow the existing code style and patterns

## 📄 License

This service is part of the Starshop project and follows the same licensing terms.
