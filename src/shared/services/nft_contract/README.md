# NFT Contract Service

A comprehensive TypeScript service layer that provides a clean, type-safe interface for interacting with the NFT Contract on Stellar/Soroban. This service abstracts complex blockchain interactions and provides easy-to-use methods for managing NFT minting, transfers, metadata, and ownership in the StarShop application.

## 🏗 Service Structure

```
src/shared/services/nft_contract/
├── nft.service.ts              # Main service class with all contract interactions
├── types/
│   ├── nft.types.ts           # TypeScript interfaces and types
│   └── metadata.types.ts      # Metadata-related types
├── utils/
│   └── nft.utils.ts           # Helper functions and utilities
├── constants/
│   └── nft.constants.ts       # Contract addresses, error codes, etc.
├── examples/
│   └── usage.example.ts       # Usage examples and demonstrations
├── index.ts                   # Main exports
└── README.md                  # This file
```

## 🚀 Quick Start

### Installation

The service is already integrated into the StarShop frontend. No additional installation is required.

### Basic Usage

```typescript
import { NFTService, NETWORKS } from '@/shared/services/nft_contract';

// Initialize the service
const nftService = new NFTService({
  network: NETWORKS.testnet,
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true
});

// Initialize the service and contract
await nftService.initialize();

// Mint a new NFT
const mintRequest = {
  to: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  name: 'My Digital Art',
  description: 'A beautiful digital artwork',
  attributes: ['Artist: Me', 'Style: Abstract', 'Year: 2024']
};

const result = await nftService.mintNFT(mintRequest);
if (result.success) {
  console.log('NFT minted with token ID:', result.data);
}
```

## 📋 Features

### 1. Contract Initialization & Admin Management

- **Initialize Contract**: `initializeNFTContract(admin)`
- **Admin Management**: `getAdmin()`, `verifyAdmin(caller)`, `isInitialized()`

### 2. Supply Management

- **Set Max Supply**: `setMaxSupply(maxSupply)`
- **Get Supply Info**: `getMaxSupply()`, `getCurrentSupply()`, `getRemainingSupply()`

### 3. NFT Minting & Creation

- **Mint NFTs**: `mintNFT(to, name, description, attributes)`
- **Validate Metadata**: `validateMetadata(name, description, attributes)`

### 4. NFT Ownership & Transfers

- **Ownership Queries**: `getOwner(tokenId)`, `nftExists(tokenId)`
- **Transfer Operations**: `transferNFT(from, to, tokenId)`, `burnNFT(owner, tokenId)`

### 5. Metadata & Attributes Management

- **Get Metadata**: `getMetadata(tokenId)`
- **Update Metadata**: `updateMetadata(tokenId, name, description, attributes)`

### 6. Event System

- **Real-time Events**: Listen to NFT minted, transferred, burned, and metadata updated events
- **Event Filtering**: Filter events by token ID, owner, or admin

### 7. Error Handling & Validation

- **Comprehensive Error Handling**: Contract-specific error mapping with user-friendly messages
- **Input Validation**: Validate addresses, token IDs, and metadata
- **Network Error Handling**: RPC connection failures and retry mechanisms

### 8. Performance & Monitoring

- **Caching Layer**: Cache NFT metadata and ownership with configurable TTL
- **Performance Metrics**: Track response times, success rates, and cache hit rates
- **Health Checks**: Monitor contract, network, and wallet connectivity

## 🔧 Configuration

### Service Configuration

```typescript
interface NFTServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds?: number;    // Default: 30
  fee?: number;                 // Default: 100000
  simulate?: boolean;           // Default: true
  retryConfig?: RetryConfig;
  cache?: CacheConfig;
}
```

### Network Configuration

```typescript
// Testnet (default)
const testnetConfig = {
  networkPassphrase: 'Test SDF Network ; September 2015',
  contractId: 'CC2RU4MBM2NBA5FJXLAAPC2PL35WMT2RJ2SSH4OHUFXTPACJL7W5PH5G',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  isTestnet: true
};

// Mainnet (when deployed)
const mainnetConfig = {
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  contractId: '', // To be set when deployed
  rpcUrl: 'https://horizon.stellar.org',
  isTestnet: false
};
```

## 📚 API Reference

### Core Methods

#### Contract Management
- `initialize(config?)` - Initialize the service
- `initializeNFTContract(admin)` - Initialize the contract
- `isInitialized()` - Check if contract is initialized
- `getAdmin()` - Get current admin address
- `verifyAdmin(caller)` - Verify admin permissions

#### Supply Management
- `setMaxSupply(maxSupply)` - Set maximum NFT supply
- `getMaxSupply()` - Get current max supply
- `getCurrentSupply()` - Get current minted supply
- `getRemainingSupply()` - Get remaining mintable supply
- `getSupplyInfo()` - Get complete supply information

#### NFT Operations
- `mintNFT(request)` - Mint new NFT
- `getOwner(tokenId)` - Get NFT owner
- `nftExists(tokenId)` - Check if NFT exists
- `transferNFT(request)` - Transfer NFT between addresses
- `burnNFT(request)` - Burn/destroy NFT

#### Metadata Operations
- `getMetadata(tokenId)` - Get NFT metadata
- `updateMetadata(request)` - Update NFT metadata
- `validateMetadata(name, description, attributes)` - Validate metadata

### Response Format

All service methods return a standardized response format:

```typescript
interface NFTResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
  transactionHash?: string;
}
```

### Event System

```typescript
// Add event listener
const listenerId = nftService.addEventListener(
  [NFTEventType.NFT_MINTED, NFTEventType.NFT_TRANSFERRED],
  (event) => {
    console.log('Event:', event.type, event.tokenId);
  },
  { tokenId: 123 } // Optional filter
);

// Remove event listener
nftService.removeEventListener(listenerId);
```

## 🎯 Usage Examples

### Minting NFTs

```typescript
const mintRequest: MintRequest = {
  to: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  name: 'StarShop Digital Art #1',
  description: 'A beautiful digital artwork',
  attributes: [
    'Artist: DigitalCreator',
    'Medium: Digital',
    'Year: 2024',
    'Style: Abstract',
    'Rarity: Rare'
  ]
};

const result = await nftService.mintNFT(mintRequest);
if (result.success) {
  console.log('NFT minted with ID:', result.data);
}
```

### Transferring NFTs

```typescript
const transferRequest: TransferRequest = {
  from: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  to: 'GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
  tokenId: 123
};

const result = await nftService.transferNFT(transferRequest);
if (result.success) {
  console.log('NFT transferred successfully');
}
```

### Updating Metadata

```typescript
const updateRequest: MetadataUpdateRequest = {
  tokenId: 123,
  admin: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  name: 'Updated NFT Name',
  description: 'Updated description',
  attributes: ['Updated', 'Attributes']
};

const result = await nftService.updateMetadata(updateRequest);
if (result.success) {
  console.log('Metadata updated successfully');
}
```

### Event Listening

```typescript
// Listen for all NFT events
nftService.addEventListener(
  [NFTEventType.NFT_MINTED, NFTEventType.NFT_TRANSFERRED],
  (event) => {
    switch (event.type) {
      case NFTEventType.NFT_MINTED:
        console.log('New NFT minted:', event.tokenId);
        break;
      case NFTEventType.NFT_TRANSFERRED:
        console.log('NFT transferred:', event.tokenId, 'from', event.from, 'to', event.to);
        break;
    }
  }
);
```

## 🔍 Error Handling

The service provides comprehensive error handling with user-friendly messages:

```typescript
const result = await nftService.mintNFT(mintRequest);
if (!result.success) {
  console.error('Error:', result.error);
  console.error('Error Code:', result.errorCode);
  
  // Handle specific error types
  switch (result.errorCode) {
    case NFT_ERROR_CODES.SUPPLY_EXCEEDED:
      console.log('Maximum supply has been reached');
      break;
    case NFT_ERROR_CODES.INVALID_METADATA:
      console.log('Metadata validation failed');
      break;
    case NFT_ERROR_CODES.UNAUTHORIZED:
      console.log('Unauthorized access');
      break;
  }
}
```

## 📊 Performance & Monitoring

### Health Checks

```typescript
const healthCheck = await nftService.healthCheck();
console.log('Service Health:', healthCheck.isHealthy);
console.log('Contract Connected:', healthCheck.contractConnected);
console.log('Network Connected:', healthCheck.networkConnected);
console.log('Wallet Connected:', healthCheck.walletConnected);
```

### Performance Metrics

```typescript
const metrics = nftService.getPerformanceMetrics();
console.log('Average Response Time:', metrics.averageResponseTime + 'ms');
console.log('Success Rate:', (metrics.successfulOperations / metrics.totalOperations) * 100 + '%');
```

### Cache Management

```typescript
// Clear cache
nftService.clearCache();

// Cache is automatically managed with configurable TTL
```

## 🛠 Utility Functions

The service includes various utility functions for common operations:

```typescript
import {
  formatTokenId,
  validateNFTMetadata,
  calculateSupplyInfo,
  isValidStellarAddress,
  retryWithBackoff
} from '@/shared/services/nft_contract';

// Format token ID for display
const displayId = formatTokenId(123); // "#123"

// Validate metadata
const validation = validateNFTMetadata(metadata);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Calculate supply information
const supplyInfo = calculateSupplyInfo(maxSupply, currentSupply);
console.log('Remaining supply:', supplyInfo.remainingSupply);
```

## 🔐 Security Considerations

- **Input Validation**: All inputs are validated before contract calls
- **Address Validation**: Stellar addresses are validated for correct format
- **Metadata Sanitization**: Metadata is sanitized to prevent injection attacks
- **Error Handling**: Sensitive information is not exposed in error messages
- **Transaction Simulation**: Transactions are simulated by default for safety

## 🧪 Testing

The service includes comprehensive error handling and validation. For testing:

1. Use the testnet configuration for development
2. Enable transaction simulation for safe testing
3. Use the health check methods to verify connectivity
4. Monitor performance metrics for optimization

## 📝 Examples

See `examples/usage.example.ts` for complete usage examples including:
- Service initialization
- NFT minting workflow
- Transfer operations
- Metadata management
- Event handling
- Error handling
- Performance monitoring

## 🤝 Contributing

When contributing to the NFT service:

1. Follow the existing code patterns and structure
2. Add comprehensive error handling
3. Include proper TypeScript types
4. Update documentation for new features
5. Add usage examples for new functionality
6. Ensure all linting errors are resolved

## 📄 License

This service is part of the StarShop frontend project and follows the same license terms.
