# Limited Time Drop Service

Type-safe service layer for the Limited Time Drop Soroban contract used by the StarShop frontend.

## Structure

```text
src/shared/services/limited_time_drop/
  limited_drop.service.ts
  constants/drop.constants.ts
  types/drop.types.ts
  types/access.types.ts
  utils/drop.utils.ts
  index.ts
```

## Core API

```ts
import { LimitedTimeDropService } from '@/shared/services/limited_time_drop';

const drops = new LimitedTimeDropService();

await drops.createDrop({
  title: 'Launch Drop',
  productId: 1n,
  maxSupply: 100,
  startTime: 1735689600n,
  endTime: 1735776000n,
  price: 10000000n,
  perUserLimit: 2,
  imageUri: 'ipfs://...'
});

await drops.getDrop(1);
await drops.participateInDrop(1, { quantity: 1 });
await drops.trackParticipation(1);
await drops.getDropStatus(1);
await drops.getTimeRemaining(1);
```

## Access Control

```ts
await drops.checkAccess(1, userAddress);
await drops.grantAccess(1, userAddress, adminAddress);
await drops.revokeAccess(1, userAddress, adminAddress);
await drops.updateUserLevel({
  user: userAddress,
  admin: adminAddress,
  level: UserAccessLevel.PREMIUM
});
```

The generated contract exposes whitelist writes and buyer-list reads, but it does not expose a whitelist enumeration method. `getAccessList()` therefore returns the on-chain buyer list for the drop and marks the source as `contract_buyers`.

## Contract Limitations

The current generated contract supports status updates through `update_status`, but does not expose field-level drop updates or end-time extensions. `updateDrop()` maps to status updates, `cancelDrop()` maps to the cancelled status, and `extendDrop()` returns a typed unsupported-operation response.
