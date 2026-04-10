# Promotional Boost Contract Service

A comprehensive TypeScript service for managing promotional boosts on the StarShop platform via the Soroban smart contract on the Stellar network.

## Overview

The `PromotionalBoostService` provides a complete API for:

- **Boost Management**: Create, retrieve, update, cancel, and activate promotional boosts
- **Visibility Management**: Control and monitor the visibility levels of boosted content
- **Slot Management**: Reserve, check, and release promotional slots per boost tier
- **Payment Processing**: Process payments, check payment status, and handle refunds

## File Structure

```
promotional_boost/
  boost.service.ts              # Main service class (PromotionalBoostService)
  index.ts                      # Module exports and convenience functions
  README.md                     # This documentation
  types/
    boost.types.ts              # Core boost interfaces and enums
    visibility.types.ts         # Visibility-related types
    payments.types.ts           # Payment and refund types
  utils/
    boost.utils.ts              # Helper and validation functions
  constants/
    boost.constants.ts          # Contract addresses, error codes, config
```

## Quick Start

```typescript
import { createTestnetBoostService, BoostTier, BoostTargetType } from './promotional_boost';

const service = createTestnetBoostService();

// Create a promotional boost
const result = await service.createBoost({
  targetId: 123,
  targetType: BoostTargetType.PRODUCT,
  tier: BoostTier.STANDARD,
  durationSeconds: 86400 * 7, // 7 days
  paymentToken: 'native',
});

if (result.success) {
  console.log('Boost created with ID:', result.data);
}
```

## Service Configuration

```typescript
import { PromotionalBoostService, NETWORKS } from './promotional_boost';

const service = new PromotionalBoostService({
  network: NETWORKS.testnet,      // or NETWORKS.mainnet
  timeoutInSeconds: 30,
  fee: 100000,                    // in stroops
  simulate: true,                 // simulate transactions
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  cache: {
    enabled: true,
    ttl: 300000,                  // 5 minutes
    maxSize: 1000,
  },
});
```

## API Reference

### Boost Management

#### `createBoost(request: CreateBoostRequest): Promise<BoostResponse<BoostId>>`

Create a new promotional boost for a target entity.

```typescript
const result = await service.createBoost({
  targetId: 123,
  targetType: BoostTargetType.PRODUCT,
  tier: BoostTier.PREMIUM,
  durationSeconds: 2592000,    // 30 days
  paymentToken: 'native',
  priorityScore: 800,          // optional
});
```

#### `getBoost(boostId: BoostId): Promise<BoostResponse<BoostData>>`

Retrieve complete data for a boost by ID.

```typescript
const boostResponse = await service.getBoost(42);
if (boostResponse.success) {
  const boost = boostResponse.data;
  console.log('Boost status:', boost.status);
  console.log('Boost tier:', boost.tier);
}
```

#### `updateBoost(request: UpdateBoostRequest): Promise<BoostResponse<TransactionResult>>`

Update an existing boost (extend duration, change tier, update priority).

```typescript
const result = await service.updateBoost({
  boostId: 42,
  tier: BoostTier.ELITE,
  extensionSeconds: 86400 * 7, // extend by 7 days
  priorityScore: 950,
});
```

#### `cancelBoost(request: CancelBoostRequest): Promise<BoostResponse<TransactionResult>>`

Cancel an active or pending boost.

```typescript
const result = await service.cancelBoost({
  boostId: 42,
  reason: 'Product no longer available',
});
```

#### `activateBoost(request: ActivateBoostRequest): Promise<BoostResponse<TransactionResult>>`

Activate a pending boost (admin or owner action).

```typescript
const result = await service.activateBoost({
  boostId: 42,
});
```

### Visibility Management

#### `setVisibilityLevel(request: SetVisibilityLevelRequest): Promise<BoostResponse<TransactionResult>>`

Set the visibility level for a boost.

```typescript
import { VisibilityLevel } from './promotional_boost';

const result = await service.setVisibilityLevel({
  boostId: 42,
  level: VisibilityLevel.FEATURED,
  caller: 'GCALLERADDRESS...',
});
```

#### `getVisibilityLevel(boostId: BoostId): Promise<BoostResponse<VisibilityLevel>>`

Get the current visibility level for a boost.

```typescript
const levelResponse = await service.getVisibilityLevel(42);
if (levelResponse.success) {
  console.log('Visibility level:', levelResponse.data);
}
```

#### `boostVisibility(request: BoostVisibilityRequest): Promise<BoostResponse<TransactionResult>>`

Apply a temporary multiplier to increase boost visibility.

```typescript
const result = await service.boostVisibility({
  boostId: 42,
  multiplier: 3,              // 3x visibility
  durationSeconds: 3600,      // for 1 hour
  caller: 'GCALLERADDRESS...',
});
```

#### `getVisibilityStats(boostId: BoostId): Promise<BoostResponse<VisibilityStats>>`

Get detailed visibility statistics for a boost.

```typescript
const statsResponse = await service.getVisibilityStats(42);
if (statsResponse.success) {
  const stats = statsResponse.data;
  console.log('Total impressions:', stats.totalImpressions);
  console.log('CTR:', stats.clickThroughRate, '%');
}
```

### Slot Management

#### `reserveSlot(tier: BoostTier, owner: Address): Promise<BoostResponse<SlotReservation>>`

Reserve a promotional slot for a specific boost tier.

```typescript
const reservation = await service.reserveSlot(
  BoostTier.PREMIUM,
  'GOWNERADDRESS...'
);
if (reservation.success) {
  const { slotId, expiresAt } = reservation.data;
  console.log('Reserved slot:', slotId, 'expires at:', expiresAt);
}
```

#### `getAvailableSlots(tier: BoostTier): Promise<BoostResponse<number>>`

Check how many slots are available for a boost tier.

```typescript
const availableResponse = await service.getAvailableSlots(BoostTier.ELITE);
console.log('Available ELITE slots:', availableResponse.data);
```

#### `releaseSlot(slotId: SlotId, owner: Address): Promise<BoostResponse<TransactionResult>>`

Release a previously reserved slot.

```typescript
const result = await service.releaseSlot(slotId, 'GOWNERADDRESS...');
```

#### `getSlotStatus(slotId: SlotId): Promise<BoostResponse<SlotStatus>>`

Get the current status of a slot.

```typescript
const statusResponse = await service.getSlotStatus(slotId);
console.log('Slot reserved:', statusResponse.data?.isReserved);
```

### Payment Processing

#### `processBoostPayment(request: ProcessBoostPaymentRequest): Promise<BoostResponse<PaymentRecord>>`

Process a payment for a boost.

```typescript
const paymentResult = await service.processBoostPayment({
  boostId: 42,
  payer: 'GPAYERADDRESS...',
  paymentToken: 'native',
  amount: 300000000,          // 30 XLM in stroops
  memo: 'Boost payment',
});
if (paymentResult.success) {
  console.log('Payment ID:', paymentResult.data.paymentId);
}
```

#### `getPaymentStatus(request: GetPaymentStatusRequest): Promise<BoostResponse<PaymentRecord>>`

Get the status of a specific payment.

```typescript
const paymentStatus = await service.getPaymentStatus({
  paymentId: 'pay_42_1234567890_abc123',
});
console.log('Payment status:', paymentStatus.data?.status);
```

#### `refundBoostPayment(request: RefundBoostPaymentRequest): Promise<BoostResponse<RefundRecord>>`

Request a refund for a boost payment.

```typescript
import { RefundReason } from './promotional_boost';

const refundResult = await service.refundBoostPayment({
  boostId: 42,
  payer: 'GPAYERADDRESS...',
  reason: RefundReason.CANCELLED_BY_USER,
  notes: 'Changed my mind',
});
```

#### `getBoostCost(tier: BoostTier, durationSeconds: number): Promise<BoostResponse<BoostCostCalculation>>`

Calculate the cost of a boost before creating it.

```typescript
const costResponse = await service.getBoostCost(BoostTier.PREMIUM, 2592000);
if (costResponse.success) {
  const cost = costResponse.data;
  console.log('Total cost:', cost.totalCost, 'stroops');
  console.log('Discount:', cost.discountPercentage, '%');
  console.log('Breakdown:', cost.breakdown);
}
```

## Boost Tiers

| Tier     | Base Cost/Day | Max Slots | Priority Score | Impression Multiplier |
|----------|---------------|-----------|----------------|----------------------|
| BASIC    | 10 XLM        | 100       | 100            | 1.5x                 |
| STANDARD | 30 XLM        | 50        | 300            | 3.0x                 |
| PREMIUM  | 70 XLM        | 20        | 700            | 6.0x                 |
| ELITE    | 150 XLM       | 5         | 1000           | 12.0x                |

## Duration Discounts

| Duration  | Discount |
|-----------|----------|
| 7+ days   | 5%       |
| 14+ days  | 10%      |
| 30+ days  | 20%      |
| 90+ days  | 35%      |

## Event System

Subscribe to service events for reactive programming:

```typescript
import { BoostEventType } from './promotional_boost';

const subscriptionId = service.addEventListener(
  [BoostEventType.BOOST_CREATED, BoostEventType.PAYMENT_PROCESSED],
  (event) => {
    console.log('Event received:', event.type, event.boostId);
  },
  { owner: 'GOWNERADDRESS...' }  // optional filter
);

// Later: unsubscribe
service.removeEventListener(subscriptionId);
```

## Error Handling

All service methods return a `BoostResponse<T>` with consistent error information:

```typescript
const result = await service.createBoost(request);

if (!result.success) {
  console.error('Error:', result.error);
  console.error('Error code:', result.errorCode);
}
```

## Health Check

```typescript
const health = await service.healthCheck();
console.log('Is healthy:', health.isHealthy);
console.log('Wallet connected:', health.walletConnected);
console.log('Contract connected:', health.contractConnected);
if (!health.isHealthy) {
  console.error('Issues:', health.errors);
}
```

## Caching

The service implements automatic caching with configurable TTL. You can manually clear the cache:

```typescript
service.clearCache();
```

## Performance Metrics

```typescript
const metrics = service.getPerformanceMetrics();
console.log('Total operations:', metrics.totalOperations);
console.log('Average response time:', metrics.averageResponseTime, 'ms');
console.log('Cache hit rate:', metrics.cacheHitRate * 100, '%');
console.log('Success rate:', 
  (metrics.successfulOperations / metrics.totalOperations) * 100, '%');

// Reset metrics
service.resetPerformanceMetrics();
```

## Cleanup

Always clean up the service when done:

```typescript
service.destroy();
```

## Related Issues

- Issue #288: Promotional Boost Contract Service implementation

## Dependencies

- `@stellar/stellar-sdk` - Stellar SDK for blockchain interactions
- `../../utils/wallet` - StarShop wallet utilities (signTransaction, getPublicKey, isWalletConnected)
