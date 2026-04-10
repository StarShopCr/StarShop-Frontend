# Limited Time Drop Contract Service

TypeScript service layer for interacting with the **Limited Time Drop** Soroban smart contract on Stellar. Provides a comprehensive API for managing time-limited drops, access control, participation tracking, and time management.

---

## Directory Structure

```
limited_time_drop/
  limited_drop.service.ts    Main service class
  index.ts                   Module re-exports + convenience factories
  README.md                  This file
  types/
    drop.types.ts            Core drop interfaces and enums
    access.types.ts          Access control types
  utils/
    drop.utils.ts            Validation, time helpers, formatting utilities
  constants/
    drop.constants.ts        Contract addresses, error codes, defaults
```

---

## Quick Start

```typescript
import { createTestnetDropService, DropStatus } from './';

const service = createTestnetDropService();
await service.initialize();

// Create a drop
const result = await service.createDrop({
  creator: 'G...',
  metadata: { name: 'Flash Sale', description: 'Limited 1-hour drop' },
  pricing: { pricePerUnit: 10_000_000n, paymentToken: '' },
  timeConfig: { startTime: BigInt(Math.floor(Date.now() / 1000)), endTime: BigInt(Math.floor(Date.now() / 1000) + 3600) },
  supply: { totalSupply: 100, maxPerParticipant: 2 },
});
```

---

## API Reference

### Drop Management

| Method | Description |
|--------|-------------|
| `createDrop(request)` | Create a new limited-time drop on-chain |
| `getDrop(dropId)` | Fetch full drop record by ID |
| `updateDrop(request)` | Update metadata, pricing, time, or supply |
| `cancelDrop(request)` | Cancel a drop and prevent further participation |

### Access Control

| Method | Description |
|--------|-------------|
| `checkAccess(request)` | Check if an address has sufficient tier access |
| `grantAccess(request)` | Grant a tier to a specific address |
| `revokeAccess(request)` | Remove an address's access |
| `getAccessList(options)` | Paginated list of access records for a drop |
| `batchGrantAccess(request)` | Grant access to many addresses at once |

### Drop Operations

| Method | Description |
|--------|-------------|
| `participateInDrop(request)` | Claim units from an active drop |
| `trackParticipation(dropId, participant)` | Get participation record for an address |
| `getDropStatus(dropId)` | High-level status summary (active, sold-out, time left) |

### Time Management

| Method | Description |
|--------|-------------|
| `isDropActive(dropId)` | Boolean check if drop is currently accepting participants |
| `getTimeRemaining(dropId)` | Seconds + formatted string of time left |
| `extendDrop(request)` | Extend a drop's end time (subject to contract limits) |

---

## Access Tiers

Access tiers are ordered numerically; a higher tier satisfies lower-tier requirements.

| Tier | Value | Description |
|------|-------|-------------|
| `NONE` | 0 | No access |
| `PUBLIC` | 1 | Open to everyone |
| `WHITELIST` | 2 | Allowlist members |
| `VIP` | 3 | Priority access |
| `ADMIN` | 4 | Administrative control |

---

## Configuration

```typescript
import { LimitedTimeDropService, NETWORKS } from './';

const service = new LimitedTimeDropService({
  network: NETWORKS.testnet,        // or NETWORKS.mainnet
  timeoutInSeconds: 30,
  fee: 100_000,                      // fee in stroops
  simulate: true,
  retryConfig: { maxRetries: 3, retryDelay: 1000, exponentialBackoff: true },
  cache: { enabled: true, ttl: 60_000, maxSize: 500 },
});
```

---

## Events

Subscribe to service events for reactive UI updates:

```typescript
import { DropEventType } from './';

const subId = service.addEventListener(
  [DropEventType.PARTICIPATION_RECORDED, DropEventType.DROP_ENDED],
  (event) => {
    console.log('Event:', event.type, event.dropId);
  },
  { dropId: 42 } // optional filter
);

// Later:
service.removeEventListener(subId);
```

---

## Wallet Integration

All mutating operations require a connected Stellar wallet. The service uses the shared `../../utils/wallet` utilities:

- `isWalletConnected()` — checked on `initialize()`
- `getPublicKey()` — used to identify the caller
- `signTransaction(xdr, network)` — used to sign contract transactions

---

## Error Handling

All methods return a `DropResponse<T>`:

```typescript
const response = await service.getDrop(1);
if (response.success) {
  console.log(response.data); // Drop
} else {
  console.error(response.error, response.errorCode);
}
```

Error codes are defined in `DROP_ERROR_CODES` and mapped to human-readable messages in `ERROR_MESSAGES`.

---

## Related Services

- `nft_contract` — NFT minting and transfers
- `payment_contract` — Payment processing
- `airdrop_contract` — Token airdrops
