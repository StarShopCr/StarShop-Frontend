# Payment Contract Service

A comprehensive TypeScript service layer for interacting with the Payment Contract on Stellar/Soroban. This service provides a clean, type-safe interface for managing payments, deposits, refunds, and dispute resolution in the Starshop application.

## 🏗 Service Structure

```
src/shared/services/payment_contract/
├── payment.service.ts          # Main service class with all contract interactions
├── types/
│   ├── payment.types.ts       # Core payment interfaces and types
│   └── dispute.types.ts       # Dispute-related types and interfaces
├── utils/
│   └── payment.utils.ts       # Helper functions and utilities
├── constants/
│   └── payment.constants.ts   # Contract addresses, error codes, validation rules
├── index.ts                   # Main exports
└── README.md                  # This documentation
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { PaymentService } from '@/shared/services/payment_contract';

// Initialize the service
const paymentService = new PaymentService({
  network: {
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    isTestnet: true
  }
});

// Initialize the service
await paymentService.initialize();
```

### Process a Payment Deposit

```typescript
const depositRequest = {
  tokenId: 'USDC',
  signer: 'GABC123...',
  to: 'GDEF456...',
  amount: BigInt('1000000000'), // 100 USDC (7 decimals)
  description: 'Payment for services'
};

const result = await paymentService.processDeposit(depositRequest);

if (result.success) {
  console.log('Deposit successful:', result.data.transactionHash);
} else {
  console.error('Deposit failed:', result.error);
}
```

### Process a Refund

```typescript
const refundRequest = {
  tokenId: 'USDC',
  signer: 'GABC123...',
  to: 'GDEF456...',
  refundAmount: BigInt('500000000'), // 50 USDC
  reason: 'Service not delivered as promised'
};

const result = await paymentService.processRefund(refundRequest);

if (result.success) {
  console.log('Refund successful:', result.data.transactionHash);
} else {
  console.error('Refund failed:', result.error);
}
```

### Resolve a Dispute

```typescript
const disputeRequest = {
  tokenId: 'USDC',
  arbitrator: 'GARB123...',
  buyer: 'GBUY456...',
  seller: 'GSELL789...',
  refundAmount: BigInt('750000000'), // 75 USDC
  decision: DisputeDecision.PARTIAL_REFUND,
  reason: 'Partial delivery of services'
};

const result = await paymentService.resolveDispute(disputeRequest);

if (result.success) {
  console.log('Dispute resolved:', result.data.transactionHash);
} else {
  console.error('Dispute resolution failed:', result.error);
}
```

## 📋 Core Features

### 1. Contract Initialization & Admin Management

- **Initialize Contract**: Set up the payment contract with admin privileges
- **Admin Management**: Get current admin, transfer admin rights
- **Contract Upgrades**: Upgrade contract with new WASM code
- **Access Control**: Verify admin permissions for sensitive operations

```typescript
// Initialize contract
await paymentService.initializePaymentContract('GADMIN123...');

// Get current admin
const adminResponse = await paymentService.getAdmin();

// Transfer admin rights
await paymentService.transferAdmin('GNEWADMIN456...');
```

### 2. Payment Processing & Deposits

- **Process Deposits**: Handle payment deposits with validation
- **Amount Validation**: Ensure valid deposit amounts
- **Balance Checking**: Check available deposit balances
- **Payment Validation**: Verify funds and prevent duplicates

```typescript
// Validate deposit amount
const isValid = await paymentService.validateDepositAmount('USDC', BigInt('1000000000'));

// Check deposit balance
const balance = await paymentService.checkDepositBalance('USDC');
```

### 3. Refund Processing

- **Process Refunds**: Handle refund requests with validation
- **Eligibility Checking**: Verify refund eligibility
- **Amount Validation**: Ensure valid refund amounts
- **Refund Management**: Track refund history and status

```typescript
// Check refund eligibility
const isEligible = await paymentService.checkRefundEligibility('USDC', 'GUSER123...');

// Validate refund amount
const isValid = await paymentService.validateRefundAmount('USDC', BigInt('500000000'));
```

### 4. Dispute Resolution

- **Create Disputes**: Initiate new dispute cases
- **Resolve Disputes**: Handle dispute resolution with arbitration
- **Status Tracking**: Monitor dispute status and progress
- **Evidence Management**: Handle dispute evidence and documentation

```typescript
// Create dispute
const disputeId = await paymentService.createDispute({
  tokenId: 'USDC',
  buyer: 'GBUY123...',
  seller: 'GSELL456...',
  reason: 'Product not as described',
  evidence: ['receipt.pdf', 'product_photo.jpg']
});

// Get dispute status
const status = await paymentService.getDisputeStatus('USDC');
```

### 5. Balance & History Management

- **Balance Checking**: Get available balances for tokens
- **Payment History**: Retrieve payment transaction history
- **Status Monitoring**: Check payment completion status
- **Filtering**: Apply filters to payment history

```typescript
// Get available balance
const balance = await paymentService.getAvailableBalance('USDC');

// Get payment history
const history = await paymentService.getPaymentHistory('USDC', {
  status: [PaymentStatus.COMPLETED],
  limit: 10
});

// Check if payment is complete
const isComplete = await paymentService.isPaymentComplete('USDC');
```

### 6. Batch Operations

- **Batch Deposits**: Process multiple deposits efficiently
- **Batch Refunds**: Handle multiple refunds in one operation
- **Error Handling**: Continue processing on individual failures
- **Progress Tracking**: Monitor batch operation progress

```typescript
// Process batch deposits
const batchResult = await paymentService.processBatchDeposits({
  deposits: [
    { tokenId: 'USDC', signer: 'GUSER1...', to: 'GRECIPIENT1...', amount: BigInt('1000000000') },
    { tokenId: 'USDC', signer: 'GUSER2...', to: 'GRECIPIENT2...', amount: BigInt('2000000000') }
  ],
  continueOnError: true
});
```

## 🔧 Configuration Options

### Service Configuration

```typescript
interface PaymentServiceConfig {
  network: NetworkConfig;
  timeoutInSeconds?: number;        // Default: 30
  fee?: number;                     // Default: 100 stroops
  simulate?: boolean;               // Default: true
  retryConfig?: RetryConfig;        // Retry settings
  cache?: CacheConfig;              // Caching settings
  monitoring?: MonitoringConfig;    // Monitoring settings
}
```

### Network Configuration

```typescript
interface NetworkConfig {
  contractId: string;               // Contract address
  networkPassphrase: string;        // Network passphrase
  rpcUrl: string;                   // RPC endpoint
  isTestnet: boolean;               // Testnet flag
}
```

## 📊 Event System

The service includes a comprehensive event system for real-time notifications:

```typescript
// Add event listener
const subscriptionId = paymentService.addEventListener(
  [PaymentEventType.DEPOSIT_PROCESSED, PaymentEventType.REFUND_PROCESSED],
  (event) => {
    console.log('Payment event:', event);
  },
  {
    tokenId: 'USDC',  // Filter by token
    from: 'GUSER123...' // Filter by sender
  }
);

// Remove event listener
paymentService.removeEventListener(subscriptionId);
```

### Available Event Types

- `CONTRACT_INITIALIZED`: Contract initialization
- `ADMIN_CHANGED`: Admin rights transferred
- `CONTRACT_UPGRADED`: Contract upgraded
- `DEPOSIT_PROCESSED`: Payment deposit completed
- `REFUND_PROCESSED`: Refund processed
- `DISPUTE_CREATED`: New dispute created
- `DISPUTE_RESOLVED`: Dispute resolved
- `PAYMENT_STATUS_CHANGED`: Payment status updated
- `BALANCE_UPDATED`: Balance updated
- `ERROR`: Error occurred

## 🏥 Health Monitoring

### Health Check

```typescript
const health = await paymentService.healthCheck();

console.log('Service healthy:', health.isHealthy);
console.log('Contract connected:', health.contractConnected);
console.log('Network connected:', health.networkConnected);
console.log('Wallet connected:', health.walletConnected);
console.log('Errors:', health.errors);
```

### Performance Metrics

```typescript
const metrics = paymentService.getPerformanceMetrics();

console.log('Average response time:', metrics.averageResponseTime);
console.log('Total operations:', metrics.totalOperations);
console.log('Success rate:', metrics.successfulOperations / metrics.totalOperations);
console.log('Cache hit rate:', metrics.cacheHitRate);
```

## 🛡 Error Handling

The service provides comprehensive error handling with user-friendly messages:

```typescript
const result = await paymentService.processDeposit(depositRequest);

if (!result.success) {
  console.error('Error:', result.error);
  console.error('Error code:', result.errorCode);
  
  // Handle specific error types
  switch (result.errorCode) {
    case PaymentErrorCode.INSUFFICIENT_FUNDS:
      // Handle insufficient funds
      break;
    case PaymentErrorCode.UNAUTHORIZED_ACCESS:
      // Handle unauthorized access
      break;
    case PaymentErrorCode.INVALID_AMOUNT:
      // Handle invalid amount
      break;
  }
}
```

### Error Codes

- `NOT_INITIALIZED`: Contract not initialized
- `ALREADY_INITIALIZED`: Contract already initialized
- `UNAUTHORIZED_ACCESS`: Insufficient permissions
- `INSUFFICIENT_FUNDS`: Not enough funds
- `TRANSFER_FAILED`: Token transfer failed
- `INVALID_AMOUNT`: Invalid amount specified
- `INVALID_ADDRESS`: Invalid address format
- `INVALID_TOKEN_ID`: Invalid token ID
- `DUPLICATE_TRANSACTION`: Duplicate transaction
- `PAYMENT_NOT_FOUND`: Payment not found
- `DISPUTE_NOT_FOUND`: Dispute not found
- `CONTRACT_ERROR`: Contract execution error
- `NETWORK_ERROR`: Network connection error
- `WALLET_ERROR`: Wallet operation failed
- `VALIDATION_ERROR`: Input validation failed
- `TIMEOUT_ERROR`: Request timeout

## 🔄 Caching

The service includes intelligent caching for improved performance:

```typescript
// Clear cache
paymentService.clearCache();

// Cache is automatically managed for:
// - Admin addresses
// - Payment balances
// - Payment history
// - Dispute status
// - Refund eligibility
```

## 🧹 Cleanup

Always clean up resources when done:

```typescript
// Destroy service instance
paymentService.destroy();
```

## 📝 Type Safety

The service is fully typed with TypeScript for excellent developer experience:

```typescript
import type {
  PaymentRequest,
  RefundRequest,
  DisputeRequest,
  PaymentResponse,
  TransactionResult,
  PaymentStatus,
  DisputeStatus,
  PaymentErrorCode
} from '@/shared/services/payment_contract';
```

## 🔗 Integration

### With React Components

```typescript
import { useEffect, useState } from 'react';
import { PaymentService } from '@/shared/services/payment_contract';

function PaymentComponent() {
  const [paymentService] = useState(() => new PaymentService());
  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      await paymentService.initialize();
      
      // Add event listener
      paymentService.addEventListener(
        [PaymentEventType.BALANCE_UPDATED],
        (event) => {
          if (event.balance) {
            setBalance(event.balance);
          }
        }
      );

      // Load initial balance
      const balanceResponse = await paymentService.getAvailableBalance('USDC');
      if (balanceResponse.success) {
        setBalance(balanceResponse.data);
      }
    };

    initializeService();

    return () => {
      paymentService.destroy();
    };
  }, []);

  return (
    <div>
      <p>Balance: {balance ? paymentService.formatAmount(balance) : 'Loading...'}</p>
    </div>
  );
}
```

### With Zustand Store

```typescript
import { create } from 'zustand';
import { PaymentService } from '@/shared/services/payment_contract';

interface PaymentStore {
  paymentService: PaymentService | null;
  balance: bigint | null;
  isLoading: boolean;
  initializeService: () => Promise<void>;
  updateBalance: () => Promise<void>;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  paymentService: null,
  balance: null,
  isLoading: false,

  initializeService: async () => {
    set({ isLoading: true });
    
    const service = new PaymentService();
    await service.initialize();
    
    set({ paymentService: service, isLoading: false });
  },

  updateBalance: async () => {
    const { paymentService } = get();
    if (!paymentService) return;

    const response = await paymentService.getAvailableBalance('USDC');
    if (response.success) {
      set({ balance: response.data });
    }
  }
}));
```

## 🚀 Best Practices

1. **Always initialize the service** before using it
2. **Handle errors gracefully** with proper error codes
3. **Use event listeners** for real-time updates
4. **Monitor health status** regularly
5. **Clean up resources** when done
6. **Validate inputs** before processing
7. **Use batch operations** for multiple transactions
8. **Cache frequently accessed data** for performance
9. **Monitor performance metrics** for optimization
10. **Follow security best practices** for wallet integration

## 📚 Additional Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [Starshop Documentation](../README.md)
