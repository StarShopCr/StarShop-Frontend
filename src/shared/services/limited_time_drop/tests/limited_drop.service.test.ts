import test from 'node:test';
import assert from 'node:assert/strict';

import { LimitedTimeDropService } from '../limited_drop.service';
import {
  DROP_ERROR_CODES,
  ERROR_MESSAGES,
  DROP_STATUS,
  ACCESS_TIERS,
  TIER_ALLOCATION_MULTIPLIERS,
} from '../constants/drop.constants';
import {
  isValidStellarAddress,
  formatDuration,
  computeDynamicStatus,
  calculateTimeRemaining,
  calculateParticipationMetrics,
} from '../utils/drop.utils';
import type { CreateDropParams, DropConfig } from '../types/drop.types';

// Valid Stellar addresses for testing
const STELLAR_USER_1 =
  'GBZXN7PIRZGNMHGA72ST2EQTVGQDXFCDGUTPO3LWUCUTG4DQEDBUR2ST';
const STELLAR_USER_2 =
  'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
const STELLAR_USER_3 =
  'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37';
const STELLAR_USER_4 =
  'GA2C5RFPE6GCKMY3US5PAB6UZLKIGAHWKXX2GIOVPWW27DD6C4KZXLOL';
const STELLAR_TOKEN =
  'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

// Helper to construct baseline valid drop parameters
function createBaseParams(
  overrides?: Partial<CreateDropParams>,
  baseTime = 1000000
): CreateDropParams {
  return {
    name: 'Genesis StarShop Drop',
    description: 'Exclusive limited time drop for early supporters',
    tokenAddress: STELLAR_TOKEN,
    totalAllocation: 1000,
    maxPerUser: 100,
    startTime: baseTime + 100, // 100s in the future
    endTime: baseTime + 3700, // 1 hour later
    isPublic: false,
    ...overrides,
  };
}

// =============================================================================
// DIMENSION 1: POSITIVE LIFECYCLE SCENARIOS (D1: 1-22)
// =============================================================================

test('D1-01: Creates drop with standard parameters and initializes SCHEDULED state', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const params = createBaseParams({}, currentTime);
  const res = await service.createDrop(params);

  assert.equal(res.success, true);
  assert.ok(res.data);
  assert.ok(res.data.dropId.startsWith('drop_'));
  assert.equal(res.data.name, params.name);
  assert.equal(res.data.totalAllocation, 1000);
  assert.equal(res.data.remainingAllocation, 1000);
  assert.equal(res.data.claimedAllocation, 0);
  assert.equal(res.data.status, DROP_STATUS.SCHEDULED);
  assert.ok(res.transactionHash);
});

test('D1-02: Creates drop starting immediately and initializes ACTIVE state', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const params = createBaseParams(
    { startTime: currentTime, endTime: currentTime + 500 },
    currentTime
  );
  const res = await service.createDrop(params);

  assert.equal(res.success, true);
  assert.equal(res.data?.status, DROP_STATUS.ACTIVE);
});

test('D1-03: Retrieves existing drop by dropId with refreshed status', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const created = await service.createDrop(createBaseParams({}, currentTime));
  const dropId = created.data!.dropId;

  const res = await service.getDrop(dropId);
  assert.equal(res.success, true);
  assert.equal(res.data?.dropId, dropId);
  assert.equal(res.data?.status, DROP_STATUS.SCHEDULED);
});

test('D1-04: Grants whitelist access to a valid Stellar address', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  const grantRes = await service.grantAccess(
    drop.dropId,
    STELLAR_USER_1,
    ACCESS_TIERS.WHITELIST
  );

  assert.equal(grantRes.success, true);
  assert.equal(grantRes.data, true);
  assert.ok(grantRes.transactionHash);
});

test('D1-05: Checks access for whitelisted user returning eligible state', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_1,
    ACCESS_TIERS.WHITELIST
  );

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.hasAccess, true);
  assert.equal(check.tier, ACCESS_TIERS.WHITELIST);
  assert.equal(check.maxAllocation, 100);
  assert.equal(check.currentClaimed, 0);
  assert.equal(check.remainingAllocation, 100);
  assert.equal(check.reason, undefined);
});

test('D1-06: Participates successfully in an active drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_1,
    ACCESS_TIERS.WHITELIST
  );

  const claimRes = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 50,
  });

  assert.equal(claimRes.success, true);
  assert.ok(claimRes.data);
  assert.equal(claimRes.data.user, STELLAR_USER_1);
  assert.equal(claimRes.data.amount, 50);
  assert.equal(claimRes.data.totalClaimedByUser, 50);
  assert.equal(claimRes.data.remainingAllocation, 950);
  assert.ok(claimRes.data.txHash);
});

test('D1-07: Verifies pool remainingAllocation and claimedAllocation update accurately', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 40,
  });

  const updated = (await service.getDrop(drop.dropId)).data!;
  assert.equal(updated.claimedAllocation, 40);
  assert.equal(updated.remainingAllocation, 960);
});

test('D1-08: Allows multiple distinct whitelisted users to participate', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.grantAccess(drop.dropId, STELLAR_USER_2);

  const res1 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 60,
  });
  const res2 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_2,
    amount: 75,
  });

  assert.equal(res1.success, true);
  assert.equal(res2.success, true);

  const metrics = (await service.trackParticipation(drop.dropId)).data!;
  assert.equal(metrics.totalParticipants, 2);
  assert.equal(metrics.totalClaimed, 135);
  assert.equal(metrics.remainingAllocation, 865);
  assert.equal(metrics.participationRate, 13.5);
  assert.equal(metrics.averageClaimPerUser, 67.5);
});

test('D1-09: Supports public drops without requiring explicit whitelisting', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ isPublic: true, startTime: currentTime }, currentTime)
    )
  ).data!;

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.hasAccess, true);
  assert.equal(check.tier, ACCESS_TIERS.PUBLIC);
  assert.equal(check.maxAllocation, 100);

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 25,
  });
  assert.equal(claim.success, true);
});

test('D1-10: Pauses and resumes an active drop successfully', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;

  const pauseRes = await service.pauseDrop(drop.dropId);
  assert.equal(pauseRes.success, true);
  assert.equal(pauseRes.data?.status, DROP_STATUS.PAUSED);

  const resumeRes = await service.resumeDrop(drop.dropId);
  assert.equal(resumeRes.success, true);
  assert.equal(resumeRes.data?.status, DROP_STATUS.ACTIVE);
});

test('D1-11: Updates mutable drop metadata and parameters', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;

  const updateRes = await service.updateDrop(drop.dropId, {
    name: 'Updated Drop Title',
    description: 'Updated Description',
    totalAllocation: 2000,
  });

  assert.equal(updateRes.success, true);
  assert.equal(updateRes.data?.name, 'Updated Drop Title');
  assert.equal(updateRes.data?.totalAllocation, 2000);
  assert.equal(updateRes.data?.remainingAllocation, 2000);
});

test('D1-12: Cancels an active drop with reason', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;

  const cancelRes = await service.cancelDrop(
    drop.dropId,
    'Emergency security stop'
  );
  assert.equal(cancelRes.success, true);

  const fetched = (await service.getDrop(drop.dropId)).data!;
  assert.equal(fetched.status, DROP_STATUS.CANCELLED);
  assert.equal(fetched.cancellationReason, 'Emergency security stop');
});

test('D1-13: Lists all created drops with getAllDrops', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  await service.createDrop(createBaseParams({ name: 'Drop A' }, currentTime));
  await service.createDrop(createBaseParams({ name: 'Drop B' }, currentTime));

  const all = (await service.getAllDrops()).data!;
  assert.equal(all.length, 2);
  assert.ok(all.some(d => d.name === 'Drop A'));
  assert.ok(all.some(d => d.name === 'Drop B'));
});

test('D1-14: Verifies service reset clears all internal data structures', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  await service.createDrop(createBaseParams({}, currentTime));
  service.reset();

  const all = (await service.getAllDrops()).data!;
  assert.equal(all.length, 0);
});

test('D1-15: Initial drops passed to constructor are correctly registered', async () => {
  const customDrop: DropConfig = {
    dropId: 'drop_preset_1',
    name: 'Preset Drop',
    description: 'Preset',
    tokenAddress: STELLAR_TOKEN,
    totalAllocation: 500,
    claimedAllocation: 0,
    remainingAllocation: 500,
    maxPerUser: 50,
    startTime: 1000,
    endTime: 2000,
    status: DROP_STATUS.ACTIVE,
    isPublic: true,
    createdAt: 1000000,
    updatedAt: 1000000,
  };

  const service = new LimitedTimeDropService({
    nowProvider: () => 1500,
    initialDrops: [customDrop],
  });

  const drop = (await service.getDrop('drop_preset_1')).data!;
  assert.equal(drop.dropId, 'drop_preset_1');
  assert.equal(drop.name, 'Preset Drop');
});

// =============================================================================
// DIMENSION 2: TIME VALIDATION & STATE TRANSITIONS (D2: 21-42)
// =============================================================================

test('D2-01: Rejects drop creation when startTime is greater than endTime', async () => {
  const service = new LimitedTimeDropService({ nowProvider: () => 1000000 });
  const res = await service.createDrop(
    createBaseParams({ startTime: 1000500, endTime: 1000200 })
  );

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_END_TIME);
});

test('D2-02: Rejects drop creation when startTime equals endTime', async () => {
  const service = new LimitedTimeDropService({ nowProvider: () => 1000000 });
  const res = await service.createDrop(
    createBaseParams({ startTime: 1000500, endTime: 1000500 })
  );

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_END_TIME);
});

test('D2-03: Rejects drop creation when startTime is in past beyond clock drift tolerance', async () => {
  const currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });
  // Over 60 seconds in the past
  const res = await service.createDrop(
    createBaseParams(
      {
        startTime: currentTime - 120,
        endTime: currentTime + 500,
      },
      currentTime
    )
  );

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_START_TIME);
});

test('D2-04: Accepts drop creation within 60s clock drift tolerance', async () => {
  const currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });
  // 30 seconds ago is within 60s clock drift tolerance
  const res = await service.createDrop(
    createBaseParams(
      {
        startTime: currentTime - 30,
        endTime: currentTime + 500,
      },
      currentTime
    )
  );

  assert.equal(res.success, true);
});

test('D2-05: Prevents participation before drop start time (SCHEDULED state)', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime + 1000,
          endTime: currentTime + 5000,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.DROP_NOT_ACTIVE);
});

test('D2-06: Transitions automatically to ACTIVE when start time is reached', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime + 100,
          endTime: currentTime + 500,
        },
        currentTime
      )
    )
  ).data!;

  assert.equal(
    (await service.getDrop(drop.dropId)).data?.status,
    DROP_STATUS.SCHEDULED
  );

  // Advance time past startTime
  currentTime += 150;
  assert.equal(
    (await service.getDrop(drop.dropId)).data?.status,
    DROP_STATUS.ACTIVE
  );
  assert.equal(service.isDropActive(drop.dropId), true);
});

test('D2-07: Prevents participation after drop end time (ENDED state)', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 500,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  // Advance past endTime
  currentTime += 501;

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.DROP_NOT_ACTIVE);
});

test('D2-08: Transitions automatically to ENDED when end time passes', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 500,
        },
        currentTime
      )
    )
  ).data!;

  currentTime += 600;

  const fetched = (await service.getDrop(drop.dropId)).data!;
  assert.equal(fetched.status, DROP_STATUS.ENDED);
  assert.equal(service.isDropActive(drop.dropId), false);
});

test('D2-09: Calculates getTimeRemaining before drop has started', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime + 300,
          endTime: currentTime + 1300,
        },
        currentTime
      )
    )
  ).data!;

  const remaining = service.getTimeRemaining(drop.dropId);
  assert.equal(remaining.isStarted, false);
  assert.equal(remaining.isEnded, false);
  assert.equal(remaining.timeToStartMs, 300000);
  assert.equal(remaining.timeToEndMs, 1300000);
  assert.equal(remaining.formattedRemaining, '5m');
});

test('D2-10: Calculates getTimeRemaining during active drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime - 10,
          endTime: currentTime + 3600,
        },
        currentTime
      )
    )
  ).data!;

  const remaining = service.getTimeRemaining(drop.dropId);
  assert.equal(remaining.isStarted, true);
  assert.equal(remaining.isEnded, false);
  assert.equal(remaining.timeToStartMs, 0);
  assert.equal(remaining.timeToEndMs, 3600000);
  assert.equal(remaining.formattedRemaining, '1h');
});

test('D2-11: Calculates getTimeRemaining after drop end', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 100,
        },
        currentTime
      )
    )
  ).data!;

  currentTime += 200;

  const remaining = service.getTimeRemaining(drop.dropId);
  assert.equal(remaining.isStarted, true);
  assert.equal(remaining.isEnded, true);
  assert.equal(remaining.timeToEndMs, 0);
  assert.equal(remaining.formattedRemaining, '0s');
});

test('D2-12: Extends drop duration successfully', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 1000,
        },
        currentTime
      )
    )
  ).data!;

  const extendRes = await service.extendDrop(drop.dropId, 500);
  assert.equal(extendRes.success, true);
  assert.equal(extendRes.data?.endTime, currentTime + 1500);
});

test('D2-13: Rejects drop extension with non-positive duration', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;

  const res1 = await service.extendDrop(drop.dropId, 0);
  assert.equal(res1.success, false);
  assert.equal(res1.errorCode, DROP_ERROR_CODES.INVALID_DURATION);

  const res2 = await service.extendDrop(drop.dropId, -100);
  assert.equal(res2.success, false);
  assert.equal(res2.errorCode, DROP_ERROR_CODES.INVALID_DURATION);
});

test('D2-14: formatDuration formats days, hours, minutes and seconds accurately', () => {
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(125), '2m 5s');
  assert.equal(formatDuration(3665), '1h 1m 5s');
  assert.equal(formatDuration(90061), '1d 1h 1m 1s');
});

// =============================================================================
// DIMENSION 3: ALLOCATION BOUNDARY TESTING (D3: 41-62)
// =============================================================================

test('D3-01: User participates for exactly their maxPerUser limit in one transaction', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ maxPerUser: 100, startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_1,
    ACCESS_TIERS.WHITELIST
  );

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 100,
  });
  assert.equal(claim.success, true);
  assert.equal(claim.data?.totalClaimedByUser, 100);

  const access = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(access.hasAccess, false);
  assert.equal(access.remainingAllocation, 0);
});

test('D3-02: User reaches maxPerUser over multiple fractional claims', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ maxPerUser: 100, startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  const c1 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 30,
  });
  const c2 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 40,
  });
  const c3 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 30,
  });

  assert.equal(c1.success, true);
  assert.equal(c2.success, true);
  assert.equal(c3.success, true);
  assert.equal(c3.data?.totalClaimedByUser, 100);

  // Fourth claim must fail
  const c4 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 1,
  });
  assert.equal(c4.success, false);
  assert.equal(c4.errorCode, DROP_ERROR_CODES.ACCESS_DENIED);
});

test('D3-03: Entire drop allocation claimed down to exactly 0 triggers SOLD_OUT status', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 100,
          maxPerUser: 100,
          startTime: currentTime,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 100,
  });
  assert.equal(claim.success, true);
  assert.equal(claim.data?.remainingAllocation, 0);

  const updated = (await service.getDrop(drop.dropId)).data!;
  assert.equal(updated.status, DROP_STATUS.SOLD_OUT);
  assert.equal(service.isDropActive(drop.dropId), false);
});

test('D3-04: Further participation in SOLD_OUT drop returns DROP_SOLD_OUT error', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 50,
          maxPerUser: 50,
          startTime: currentTime,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.grantAccess(drop.dropId, STELLAR_USER_2);

  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 50,
  });

  const failClaim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_2,
    amount: 10,
  });
  assert.equal(failClaim.success, false);
  assert.equal(failClaim.errorCode, DROP_ERROR_CODES.DROP_SOLD_OUT);
});

test('D3-05: Rejects createDrop with totalAllocation <= 0', async () => {
  const service = new LimitedTimeDropService();

  const res1 = await service.createDrop(
    createBaseParams({ totalAllocation: 0 })
  );
  assert.equal(res1.success, false);
  assert.equal(res1.errorCode, DROP_ERROR_CODES.INVALID_ALLOCATION);

  const res2 = await service.createDrop(
    createBaseParams({ totalAllocation: -500 })
  );
  assert.equal(res2.success, false);
  assert.equal(res2.errorCode, DROP_ERROR_CODES.INVALID_ALLOCATION);
});

test('D3-06: Rejects createDrop with maxPerUser > totalAllocation', async () => {
  const service = new LimitedTimeDropService();

  const res = await service.createDrop(
    createBaseParams({ totalAllocation: 50, maxPerUser: 100 })
  );
  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_MAX_PER_USER);
});

test('D3-07: Rejects createDrop with maxPerUser <= 0', async () => {
  const service = new LimitedTimeDropService();

  const res = await service.createDrop(createBaseParams({ maxPerUser: 0 }));
  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_MAX_PER_USER);
});

test('D3-08: Updating totalAllocation safely above claimed volume succeeds', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        { totalAllocation: 200, startTime: currentTime },
        currentTime
      )
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 50,
  });

  const updateRes = await service.updateDrop(drop.dropId, {
    totalAllocation: 300,
  });
  assert.equal(updateRes.success, true);
  assert.equal(updateRes.data?.totalAllocation, 300);
  assert.equal(updateRes.data?.remainingAllocation, 250);
});

test('D3-09: Rejects reducing totalAllocation below already claimed volume', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        { totalAllocation: 200, startTime: currentTime },
        currentTime
      )
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 80,
  });

  const updateRes = await service.updateDrop(drop.dropId, {
    totalAllocation: 70,
  });
  assert.equal(updateRes.success, false);
  assert.equal(
    updateRes.errorCode,
    DROP_ERROR_CODES.ALLOCATION_REDUCTION_TOO_LOW
  );
});

test('D3-10: Claim exceeding remaining pool allocation is rejected', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 100,
          maxPerUser: 100,
          startTime: currentTime,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.grantAccess(drop.dropId, STELLAR_USER_2);

  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 90,
  });

  // Only 10 remains in pool, user 2 requests 20
  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_2,
    amount: 20,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.CLAIM_EXCEEDS_REMAINING);
});

// =============================================================================
// DIMENSION 4: NEGATIVE CHECKS & ANTI-ABUSE (D4: 61-82)
// =============================================================================

test('D4-01: Rejects claim from non-whitelisted user in private drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ isPublic: false, startTime: currentTime }, currentTime)
    )
  ).data!;

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.ACCESS_DENIED);
});

test('D4-02: Rejects single claim exceeding user max allocation', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ maxPerUser: 50, startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 51,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.CLAIM_EXCEEDS_USER_MAX);
});

test('D4-03: Rejects participation with zero or negative amount', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  const c1 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 0,
  });
  assert.equal(c1.success, false);
  assert.equal(c1.errorCode, DROP_ERROR_CODES.INVALID_AMOUNT);

  const c2 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: -15,
  });
  assert.equal(c2.success, false);
  assert.equal(c2.errorCode, DROP_ERROR_CODES.INVALID_AMOUNT);
});

test('D4-04: Rejects participation in CANCELLED drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.cancelDrop(drop.dropId);

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.DROP_NOT_ACTIVE);
});

test('D4-05: Rejects participation in PAUSED drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.pauseDrop(drop.dropId);

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.DROP_PAUSED);
});

test('D4-06: Rejects cancelling already cancelled drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.cancelDrop(drop.dropId);

  const res = await service.cancelDrop(drop.dropId);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.DROP_ALREADY_CANCELLED);
});

test('D4-07: Rejects cancelling already ended drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 100,
        },
        currentTime
      )
    )
  ).data!;

  currentTime += 200; // Drop ended

  const res = await service.cancelDrop(drop.dropId);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.DROP_ALREADY_ENDED);
});

test('D4-08: Rejects updating an already ended drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 100,
        },
        currentTime
      )
    )
  ).data!;

  currentTime += 200;

  const res = await service.updateDrop(drop.dropId, {
    name: 'Attempted Update',
  });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.DROP_CANNOT_BE_MODIFIED);
});

test('D4-09: Rejects updating an already cancelled drop', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.cancelDrop(drop.dropId);

  const res = await service.updateDrop(drop.dropId, {
    name: 'Attempted Update',
  });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.DROP_CANNOT_BE_MODIFIED);
});

test('D4-10: Rejects invalid Stellar user address format', async () => {
  const service = new LimitedTimeDropService();

  const res1 = await service.grantAccess('any-drop', 'INVALID_ADDRESS');
  assert.equal(res1.success, false);
  assert.equal(res1.errorCode, DROP_ERROR_CODES.INVALID_ADDRESS);

  const check = await service.checkAccess('any-drop', 'NOT_STELLAR');
  assert.equal(check.hasAccess, false);

  const res2 = await service.participateInDrop('any-drop', {
    user: '',
    amount: 10,
  });
  assert.equal(res2.success, false);
  assert.equal(res2.errorCode, DROP_ERROR_CODES.INVALID_PARAMS);
});

test('D4-11: Rejects operations on non-existent dropId', async () => {
  const service = new LimitedTimeDropService();

  const getRes = await service.getDrop('non_existent_id');
  assert.equal(getRes.success, false);
  assert.equal(getRes.errorCode, DROP_ERROR_CODES.DROP_NOT_FOUND);

  const updateRes = await service.updateDrop('non_existent_id', {
    name: 'New',
  });
  assert.equal(updateRes.success, false);
  assert.equal(updateRes.errorCode, DROP_ERROR_CODES.DROP_NOT_FOUND);

  const cancelRes = await service.cancelDrop('non_existent_id');
  assert.equal(cancelRes.success, false);
  assert.equal(cancelRes.errorCode, DROP_ERROR_CODES.DROP_NOT_FOUND);
});

test('D4-12: Revoking access for non-existent entry returns ACCESS_NOT_FOUND', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  const res = await service.revokeAccess(drop.dropId, STELLAR_USER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.ACCESS_NOT_FOUND);
});

// =============================================================================
// DIMENSION 5: ACCESS CONTROL, TIERS & PAGINATION (D5: 81-105)
// =============================================================================

test('D5-01: VIP tier grants 3x multiplier of base maxPerUser', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(createBaseParams({ maxPerUser: 100 }, currentTime))
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP);

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.tier, ACCESS_TIERS.VIP);
  assert.equal(check.maxAllocation, 300); // 100 * 3.0
});

test('D5-02: EARLY_BIRD tier grants 1.5x multiplier of base maxPerUser', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(createBaseParams({ maxPerUser: 100 }, currentTime))
  ).data!;
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_1,
    ACCESS_TIERS.EARLY_BIRD
  );

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.tier, ACCESS_TIERS.EARLY_BIRD);
  assert.equal(check.maxAllocation, 150); // 100 * 1.5
});

test('D5-03: WHITELIST tier grants 1.0x multiplier of base maxPerUser', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(createBaseParams({ maxPerUser: 100 }, currentTime))
  ).data!;
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_1,
    ACCESS_TIERS.WHITELIST
  );

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.tier, ACCESS_TIERS.WHITELIST);
  assert.equal(check.maxAllocation, 100);
});

test('D5-04: PUBLIC tier grants 0.5x multiplier of base maxPerUser when granted explicitly', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(createBaseParams({ maxPerUser: 100 }, currentTime))
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.PUBLIC);

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.tier, ACCESS_TIERS.PUBLIC);
  assert.equal(check.maxAllocation, 50); // 100 * 0.5
});

test('D5-05: Custom allocation override supersedes tier multipliers', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(createBaseParams({ maxPerUser: 100 }, currentTime))
  ).data!;
  // Overriding VIP with custom 500 allocation
  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP, 500);

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.maxAllocation, 500);
});

test('D5-06: Revoking access removes user privilege immediately', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_1)).hasAccess,
    true
  );

  const revokeRes = await service.revokeAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(revokeRes.success, true);

  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_1)).hasAccess,
    false
  );
});

test('D5-07: Re-granting access after revocation restores permission', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.revokeAccess(drop.dropId, STELLAR_USER_1);
  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP);

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.hasAccess, true);
  assert.equal(check.tier, ACCESS_TIERS.VIP);
});

test('D5-08: Paginated getAccessList handles pages and limits properly', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.grantAccess(drop.dropId, STELLAR_USER_2);
  await service.grantAccess(drop.dropId, STELLAR_USER_3);
  await service.grantAccess(drop.dropId, STELLAR_USER_4);

  // Page 1 with limit 2
  const p1 = (await service.getAccessList(drop.dropId, { page: 1, limit: 2 }))
    .data!;
  assert.equal(p1.length, 2);
  assert.equal(p1[0].user, STELLAR_USER_1);
  assert.equal(p1[1].user, STELLAR_USER_2);

  // Page 2 with limit 2
  const p2 = (await service.getAccessList(drop.dropId, { page: 2, limit: 2 }))
    .data!;
  assert.equal(p2.length, 2);
  assert.equal(p2[0].user, STELLAR_USER_3);
  assert.equal(p2[1].user, STELLAR_USER_4);

  // Page 3 with limit 2 (empty)
  const p3 = (await service.getAccessList(drop.dropId, { page: 3, limit: 2 }))
    .data!;
  assert.equal(p3.length, 0);
});

test('D5-09: Validates Stellar public keys and contract addresses via regex utility', () => {
  assert.equal(isValidStellarAddress(STELLAR_USER_1), true);
  assert.equal(isValidStellarAddress(STELLAR_USER_2), true);
  assert.equal(isValidStellarAddress(STELLAR_TOKEN), true); // C... contract address
  assert.equal(
    isValidStellarAddress('0x1234567890123456789012345678901234567890'),
    true
  ); // Hex address
  assert.equal(isValidStellarAddress('short'), false);
  assert.equal(isValidStellarAddress('G1234'), false);
  assert.equal(isValidStellarAddress(''), false);
});

test('D5-10: Correctly calculates participation metrics on empty and active drops', () => {
  const dummyDrop: DropConfig = {
    dropId: 'd1',
    name: 'test',
    description: 'test',
    tokenAddress: STELLAR_TOKEN,
    totalAllocation: 1000,
    claimedAllocation: 250,
    remainingAllocation: 750,
    maxPerUser: 100,
    startTime: 100,
    endTime: 200,
    status: DROP_STATUS.ACTIVE,
    isPublic: true,
    createdAt: 100,
    updatedAt: 100,
  };

  const metrics = calculateParticipationMetrics(dummyDrop, 5, 250);
  assert.equal(metrics.totalParticipants, 5);
  assert.equal(metrics.totalClaimed, 250);
  assert.equal(metrics.remainingAllocation, 750);
  assert.equal(metrics.participationRate, 25.0);
  assert.equal(metrics.averageClaimPerUser, 50.0);
});

// =============================================================================
// EXPANDED 5D-MATRIX COVERAGE (TESTS 62 - 110+)
// =============================================================================

test('D1-16: createDrop with custom metadata persists and retrieves metadata correctly', async () => {
  const service = new LimitedTimeDropService({ nowProvider: () => 1000000 });
  const meta = { tier: 'VIP_ONLY', sponsor: 'StarShop', season: 2 };
  const res = await service.createDrop(createBaseParams({ metadata: meta }));

  assert.equal(res.success, true);
  assert.deepEqual(res.data?.metadata, meta);

  const fetched = (await service.getDrop(res.data!.dropId)).data!;
  assert.deepEqual(fetched.metadata, meta);
});

test('D1-17: updateDrop merges metadata without overwriting unmodified fields', async () => {
  const service = new LimitedTimeDropService({ nowProvider: () => 1000000 });
  const meta = { v: 1, originalKey: 'preserved' };
  const drop = (await service.createDrop(createBaseParams({ metadata: meta })))
    .data!;

  const updateRes = await service.updateDrop(drop.dropId, {
    metadata: { v: 2, newKey: 'added' },
  });

  assert.equal(updateRes.success, true);
  assert.equal(updateRes.data?.metadata?.v, 2);
  assert.equal(updateRes.data?.metadata?.originalKey, 'preserved');
  assert.equal(updateRes.data?.metadata?.newKey, 'added');
});

test('D1-18: Drop transitions through full lifecycle: SCHEDULED -> ACTIVE -> SOLD_OUT -> ENDED', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 50,
          maxPerUser: 50,
          startTime: currentTime + 100,
          endTime: currentTime + 500,
        },
        currentTime
      )
    )
  ).data!;

  assert.equal(await service.getDropStatus(drop.dropId), DROP_STATUS.SCHEDULED);

  currentTime += 150;
  assert.equal(await service.getDropStatus(drop.dropId), DROP_STATUS.ACTIVE);

  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 50,
  });
  assert.equal(await service.getDropStatus(drop.dropId), DROP_STATUS.SOLD_OUT);

  currentTime += 400; // Past endTime
  assert.equal(await service.getDropStatus(drop.dropId), DROP_STATUS.ENDED);
});

test('D1-19: Multiple concurrent drops run with independent timelines and pools', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const dropA = (
    await service.createDrop(
      createBaseParams(
        { name: 'Drop Alpha', totalAllocation: 500, startTime: currentTime },
        currentTime
      )
    )
  ).data!;
  const dropB = (
    await service.createDrop(
      createBaseParams(
        {
          name: 'Drop Beta',
          totalAllocation: 1000,
          startTime: currentTime + 200,
        },
        currentTime
      )
    )
  ).data!;

  assert.equal(service.isDropActive(dropA.dropId), true);
  assert.equal(service.isDropActive(dropB.dropId), false);

  await service.grantAccess(dropA.dropId, STELLAR_USER_1);
  await service.participateInDrop(dropA.dropId, {
    user: STELLAR_USER_1,
    amount: 50,
  });

  const fetchedA = (await service.getDrop(dropA.dropId)).data!;
  const fetchedB = (await service.getDrop(dropB.dropId)).data!;

  assert.equal(fetchedA.claimedAllocation, 50);
  assert.equal(fetchedB.claimedAllocation, 0);
});

test('D1-20: Participation result returns unique transaction hashes for each claim', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  const c1 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });
  const c2 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });

  assert.notEqual(c1.data?.txHash, c2.data?.txHash);
  assert.ok(c1.data?.txHash.startsWith('0x'));
  assert.ok(c2.data?.txHash.startsWith('0x'));
});

test('D2-15: extendDrop by multiple hours updates both endTime and remaining duration', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 3600,
        },
        currentTime
      )
    )
  ).data!;

  const extendRes = await service.extendDrop(drop.dropId, 7200); // +2 hours
  assert.equal(extendRes.success, true);
  assert.equal(extendRes.data?.endTime, currentTime + 10800);

  const remaining = service.getTimeRemaining(drop.dropId);
  assert.equal(remaining.formattedRemaining, '3h');
});

test('D2-16: Dynamic status for paused drop when time passes endTime transitions to ENDED', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          startTime: currentTime,
          endTime: currentTime + 500,
        },
        currentTime
      )
    )
  ).data!;

  await service.pauseDrop(drop.dropId);
  assert.equal(
    (await service.getDrop(drop.dropId)).data?.status,
    DROP_STATUS.PAUSED
  );

  currentTime += 600;
  assert.equal(
    (await service.getDrop(drop.dropId)).data?.status,
    DROP_STATUS.ENDED
  );
});

test('D2-17: Dynamic status for sold_out drop when time passes endTime transitions to ENDED', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 50,
          maxPerUser: 50,
          startTime: currentTime,
          endTime: currentTime + 300,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 50,
  });

  assert.equal(
    (await service.getDrop(drop.dropId)).data?.status,
    DROP_STATUS.SOLD_OUT
  );

  currentTime += 400;
  assert.equal(
    (await service.getDrop(drop.dropId)).data?.status,
    DROP_STATUS.ENDED
  );
});

test('D2-18: getTimeRemaining returns 0s and isEnded: true when exactly at endTime', () => {
  const drop: DropConfig = {
    dropId: 'd_exact',
    name: 'Exact End',
    description: '',
    tokenAddress: STELLAR_TOKEN,
    totalAllocation: 100,
    claimedAllocation: 0,
    remainingAllocation: 100,
    maxPerUser: 10,
    startTime: 1000,
    endTime: 2000,
    status: DROP_STATUS.ACTIVE,
    isPublic: true,
    createdAt: 1000000,
    updatedAt: 1000000,
  };

  const res = calculateTimeRemaining(drop, 2000 * 1000);
  assert.equal(res.isEnded, true);
  assert.equal(res.timeToEndMs, 0);
  assert.equal(res.formattedRemaining, '0s');
});

test('D2-19: formatDuration handles large multi-day intervals (e.g. 14 days 6 hours)', () => {
  const seconds = 14 * 86400 + 6 * 3600 + 30 * 60 + 15;
  assert.equal(formatDuration(seconds), '14d 6h 30m 15s');
});

test('D2-20: isDropActive returns false for scheduled, paused, cancelled, sold_out, and ended drops', () => {
  const baseDrop: DropConfig = {
    dropId: 'd_test',
    name: 'test',
    description: '',
    tokenAddress: STELLAR_TOKEN,
    totalAllocation: 100,
    claimedAllocation: 0,
    remainingAllocation: 100,
    maxPerUser: 10,
    startTime: 1000,
    endTime: 2000,
    status: DROP_STATUS.ACTIVE,
    isPublic: true,
    createdAt: 1000,
    updatedAt: 1000,
  };

  assert.equal(
    computeDynamicStatus({ ...baseDrop, status: DROP_STATUS.CANCELLED }, 1500),
    DROP_STATUS.CANCELLED
  );
  assert.equal(
    computeDynamicStatus({ ...baseDrop, status: DROP_STATUS.PAUSED }, 1500),
    DROP_STATUS.PAUSED
  );
  assert.equal(
    computeDynamicStatus({ ...baseDrop, remainingAllocation: 0 }, 1500),
    DROP_STATUS.SOLD_OUT
  );
  assert.equal(computeDynamicStatus(baseDrop, 500), DROP_STATUS.SCHEDULED);
  assert.equal(computeDynamicStatus(baseDrop, 2500), DROP_STATUS.ENDED);
});

test('D3-11: Large volume allocation (1,000,000 tokens) handles calculations without numeric issues', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 1000000,
          maxPerUser: 50000,
          startTime: currentTime,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 50000,
  });

  assert.equal(claim.success, true);
  assert.equal(claim.data?.remainingAllocation, 950000);
});

test('D3-12: Decimal and fractional allocations (e.g. 0.5 tokens) handled safely', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 10,
          maxPerUser: 5,
          startTime: currentTime,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 2.5,
  });

  assert.equal(claim.success, true);
  assert.equal(claim.data?.totalClaimedByUser, 2.5);
  assert.equal(claim.data?.remainingAllocation, 7.5);
});

test('D3-13: Multiple users claim until pool has 1 token remaining, then 1 token claim marks SOLD_OUT', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          totalAllocation: 100,
          maxPerUser: 100,
          startTime: currentTime,
        },
        currentTime
      )
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.grantAccess(drop.dropId, STELLAR_USER_2);

  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 99,
  });
  const finalClaim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_2,
    amount: 1,
  });

  assert.equal(finalClaim.success, true);
  assert.equal(finalClaim.data?.remainingAllocation, 0);

  const updated = (await service.getDrop(drop.dropId)).data!;
  assert.equal(updated.status, DROP_STATUS.SOLD_OUT);
});

test('D3-14: Update drop totalAllocation to exact current claimed volume sets remainingAllocation to 0', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        { totalAllocation: 200, startTime: currentTime },
        currentTime
      )
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 80,
  });

  const updateRes = await service.updateDrop(drop.dropId, {
    totalAllocation: 80,
  });
  assert.equal(updateRes.success, true);
  assert.equal(updateRes.data?.totalAllocation, 80);
  assert.equal(updateRes.data?.remainingAllocation, 0);
  assert.equal(updateRes.data?.status, DROP_STATUS.SOLD_OUT);
});

test('D3-15: Update drop maxPerUser updates user eligibility limits dynamically', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        { isPublic: true, maxPerUser: 50, startTime: currentTime },
        currentTime
      )
    )
  ).data!;
  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 50,
  });

  // Currently reached limit
  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_1)).hasAccess,
    false
  );

  // Increase maxPerUser to 100
  await service.updateDrop(drop.dropId, { maxPerUser: 100 });

  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.hasAccess, true);
  assert.equal(check.remainingAllocation, 50);
});

test('D4-13: Rejects participation when user string contains spaces or invalid chars', async () => {
  const service = new LimitedTimeDropService();
  const res = await service.participateInDrop('drop_1', {
    user: 'INVALID SPACE G...',
    amount: 10,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-14: Rejects grantAccess when dropId is empty', async () => {
  const service = new LimitedTimeDropService();
  const res = await service.grantAccess('', STELLAR_USER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_PARAMS);
});

test('D4-15: Rejects revokeAccess when dropId is empty', async () => {
  const service = new LimitedTimeDropService();
  const res = await service.revokeAccess('', STELLAR_USER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_PARAMS);
});

test('D4-16: Rejects checkAccess when dropId is empty', async () => {
  const service = new LimitedTimeDropService();
  const res = await service.checkAccess('', STELLAR_USER_1);

  assert.equal(res.hasAccess, false);
  assert.equal(res.reason, ERROR_MESSAGES[DROP_ERROR_CODES.DROP_NOT_FOUND]);
});

test('D4-17: Rejects participateInDrop when params is missing or null', async () => {
  const service = new LimitedTimeDropService();
  const res = await service.participateInDrop('any_drop', null as any);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_PARAMS);
});

test('D4-18: Rejects updating drop with invalid tokenAddress format', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  const res = await service.updateDrop(drop.dropId, {
    tokenAddress: 'NOT_A_VALID_STELLAR_TOKEN',
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-19: Rejects updating drop with negative totalAllocation', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  const res = await service.updateDrop(drop.dropId, { totalAllocation: -100 });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_ALLOCATION);
});

test('D4-20: Rejects updating drop with maxPerUser greater than totalAllocation', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ totalAllocation: 500 }, currentTime)
    )
  ).data!;
  const res = await service.updateDrop(drop.dropId, { maxPerUser: 600 });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_MAX_PER_USER);
});

test('D4-21: Rejects updating drop with endTime earlier than startTime', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: 1000100, endTime: 1000500 }, currentTime)
    )
  ).data!;
  const res = await service.updateDrop(drop.dropId, { endTime: 1000050 });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_END_TIME);
});

test('D4-22: Rejects resumeDrop on a drop that was never paused', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ startTime: currentTime }, currentTime)
    )
  ).data!;
  const res = await service.resumeDrop(drop.dropId);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_PARAMS);
});

test('D5-11: getAccessList returns correct entries with custom offset parameter', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);
  await service.grantAccess(drop.dropId, STELLAR_USER_2);
  await service.grantAccess(drop.dropId, STELLAR_USER_3);

  const res = await service.getAccessList(drop.dropId, { offset: 1, limit: 1 });
  assert.equal(res.data?.length, 1);
  assert.equal(res.data?.[0].user, STELLAR_USER_2);
});

test('D5-12: getAccessList pagination with offset past total entries returns empty array', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  const res = await service.getAccessList(drop.dropId, {
    offset: 10,
    limit: 5,
  });
  assert.equal(res.data?.length, 0);
});

test('D5-13: Access entry isActive flag is true upon granting', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP);

  const list = (await service.getAccessList(drop.dropId)).data!;
  assert.equal(list[0].isActive, true);
  assert.equal(list[0].tier, ACCESS_TIERS.VIP);
});

test('D5-14: Re-granting access to already registered user updates tier and allocation (upsert)', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(createBaseParams({ maxPerUser: 100 }, currentTime))
  ).data!;
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_1,
    ACCESS_TIERS.WHITELIST
  );
  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_1)).tier,
    ACCESS_TIERS.WHITELIST
  );

  // Upgrade to VIP
  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP);
  const check = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check.tier, ACCESS_TIERS.VIP);
  assert.equal(check.maxAllocation, 300);
});

test('D5-15: TIER_ALLOCATION_MULTIPLIERS match specifications', () => {
  assert.equal(TIER_ALLOCATION_MULTIPLIERS.VIP, 3.0);
  assert.equal(TIER_ALLOCATION_MULTIPLIERS.EARLY_BIRD, 1.5);
  assert.equal(TIER_ALLOCATION_MULTIPLIERS.WHITELIST, 1.0);
  assert.equal(TIER_ALLOCATION_MULTIPLIERS.PUBLIC, 0.5);
});

test('D5-16: calculateParticipationMetrics handles 0 totalAllocation gracefully', () => {
  const dummyDrop: DropConfig = {
    dropId: 'd0',
    name: 'zero total',
    description: '',
    tokenAddress: STELLAR_TOKEN,
    totalAllocation: 0,
    claimedAllocation: 0,
    remainingAllocation: 0,
    maxPerUser: 0,
    startTime: 100,
    endTime: 200,
    status: DROP_STATUS.ACTIVE,
    isPublic: true,
    createdAt: 100,
    updatedAt: 100,
  };

  const metrics = calculateParticipationMetrics(dummyDrop, 0, 0);
  assert.equal(metrics.participationRate, 0);
  assert.equal(metrics.averageClaimPerUser, 0);
});

test('D5-17: Multiple tiers (VIP, EarlyBird, Whitelist, Public) in same drop all enforce respective limits', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ maxPerUser: 100, startTime: currentTime }, currentTime)
    )
  ).data!;

  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP); // 300
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_2,
    ACCESS_TIERS.EARLY_BIRD
  ); // 150
  await service.grantAccess(
    drop.dropId,
    STELLAR_USER_3,
    ACCESS_TIERS.WHITELIST
  ); // 100
  await service.grantAccess(drop.dropId, STELLAR_USER_4, ACCESS_TIERS.PUBLIC); // 50

  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_1)).maxAllocation,
    300
  );
  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_2)).maxAllocation,
    150
  );
  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_3)).maxAllocation,
    100
  );
  assert.equal(
    (await service.checkAccess(drop.dropId, STELLAR_USER_4)).maxAllocation,
    50
  );

  // User 1 claims 250 (allowed for VIP)
  const c1 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 250,
  });
  assert.equal(c1.success, true);

  // User 4 attempts 75 (rejected, limit is 50)
  const c4 = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_4,
    amount: 75,
  });
  assert.equal(c4.success, false);
  assert.equal(c4.errorCode, DROP_ERROR_CODES.CLAIM_EXCEEDS_USER_MAX);
});

test('D5-18: Stress test: sequential claims by 20 participants properly exhaust pool and update metrics', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        {
          isPublic: true,
          totalAllocation: 200,
          maxPerUser: 10,
          startTime: currentTime,
        },
        currentTime
      )
    )
  ).data!;

  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  // 20 users each claim 10
  for (let i = 0; i < 20; i++) {
    // Generate guaranteed valid 56-character Stellar public address
    const dummyAddr = 'G' + 'A'.repeat(54) + base32Chars[i];
    const claim = await service.participateInDrop(drop.dropId, {
      user: dummyAddr,
      amount: 10,
    });
    assert.equal(claim.success, true);
  }

  const updated = (await service.getDrop(drop.dropId)).data!;
  assert.equal(updated.remainingAllocation, 0);
  assert.equal(updated.claimedAllocation, 200);
  assert.equal(updated.status, DROP_STATUS.SOLD_OUT);

  const metrics = (await service.trackParticipation(drop.dropId)).data!;
  assert.equal(metrics.totalParticipants, 20);
  assert.equal(metrics.totalClaimed, 200);
  assert.equal(metrics.participationRate, 100.0);
  assert.equal(metrics.averageClaimPerUser, 10.0);
});

test('D5-19: Public drop respects custom allocation override if user was explicitly granted access', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  // Public drop default max is 50
  const drop = (
    await service.createDrop(
      createBaseParams(
        { isPublic: true, maxPerUser: 50, startTime: currentTime },
        currentTime
      )
    )
  ).data!;

  // Grant VIP with custom 200 allocation to USER_1
  await service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP, 200);

  const check1 = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check1.maxAllocation, 200);

  // USER_2 without grant gets default public limit (50)
  const check2 = await service.checkAccess(drop.dropId, STELLAR_USER_2);
  assert.equal(check2.maxAllocation, 50);
});

test('D5-20: checkAccess accurately tracks remaining balance after multiple partial claims', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams(
        { isPublic: true, maxPerUser: 100, startTime: currentTime },
        currentTime
      )
    )
  ).data!;

  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 35,
  });
  const check1 = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check1.currentClaimed, 35);
  assert.equal(check1.remainingAllocation, 65);

  await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 25,
  });
  const check2 = await service.checkAccess(drop.dropId, STELLAR_USER_1);
  assert.equal(check2.currentClaimed, 60);
  assert.equal(check2.remainingAllocation, 40);
});

test('D5-21: getAccessList pagination returns all records across multiple sequential pages', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  // Add 15 users
  for (let i = 0; i < 15; i++) {
    const addr = 'G' + 'B'.repeat(54) + base32Chars[i];
    await service.grantAccess(drop.dropId, addr);
  }

  // Fetch in 3 pages of 5
  const page1 = (
    await service.getAccessList(drop.dropId, { page: 1, limit: 5 })
  ).data!;
  const page2 = (
    await service.getAccessList(drop.dropId, { page: 2, limit: 5 })
  ).data!;
  const page3 = (
    await service.getAccessList(drop.dropId, { page: 3, limit: 5 })
  ).data!;

  assert.equal(page1.length, 5);
  assert.equal(page2.length, 5);
  assert.equal(page3.length, 5);
  assert.notEqual(page1[0].user, page2[0].user);
  assert.notEqual(page2[0].user, page3[0].user);
});

test('D5-22: Inactive or revoked access entries are not permitted to claim', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ isPublic: false, startTime: currentTime }, currentTime)
    )
  ).data!;
  await service.grantAccess(drop.dropId, STELLAR_USER_1);

  // Revoke
  await service.revokeAccess(drop.dropId, STELLAR_USER_1);

  const claim = await service.participateInDrop(drop.dropId, {
    user: STELLAR_USER_1,
    amount: 10,
  });
  assert.equal(claim.success, false);
  assert.equal(claim.errorCode, DROP_ERROR_CODES.ACCESS_DENIED);
});

test('D5-23: Access registry handles concurrent grant operations without data corruption', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (await service.createDrop(createBaseParams({}, currentTime)))
    .data!;

  // Concurrent grants
  await Promise.all([
    service.grantAccess(drop.dropId, STELLAR_USER_1, ACCESS_TIERS.VIP),
    service.grantAccess(drop.dropId, STELLAR_USER_2, ACCESS_TIERS.EARLY_BIRD),
    service.grantAccess(drop.dropId, STELLAR_USER_3, ACCESS_TIERS.WHITELIST),
  ]);

  const list = (await service.getAccessList(drop.dropId)).data!;
  assert.equal(list.length, 3);
});

test('D5-24: Drop configuration retains metadata through consecutive updates', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ metadata: { tag: 'initial' } }, currentTime)
    )
  ).data!;

  await service.updateDrop(drop.dropId, { name: 'Name 1' });
  await service.updateDrop(drop.dropId, { name: 'Name 2' });

  const fetched = (await service.getDrop(drop.dropId)).data!;
  assert.equal(fetched.name, 'Name 2');
  assert.deepEqual(fetched.metadata, { tag: 'initial' });
});

test('D5-25: Rejects drop creation when tokenAddress is empty string', async () => {
  const service = new LimitedTimeDropService();
  const res = await service.createDrop(createBaseParams({ tokenAddress: '' }));

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_ADDRESS);
});

test('D5-26: Rejects drop creation when drop name is empty or only whitespace', async () => {
  const service = new LimitedTimeDropService();
  const res = await service.createDrop(createBaseParams({ name: '   ' }));

  assert.equal(res.success, false);
  assert.equal(res.errorCode, DROP_ERROR_CODES.INVALID_PARAMS);
});

test('D5-27: trackParticipation returns 0% participation on fresh drops with 0 claims', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop = (
    await service.createDrop(
      createBaseParams({ totalAllocation: 500 }, currentTime)
    )
  ).data!;
  const metrics = (await service.trackParticipation(drop.dropId)).data!;

  assert.equal(metrics.totalParticipants, 0);
  assert.equal(metrics.totalClaimed, 0);
  assert.equal(metrics.remainingAllocation, 500);
  assert.equal(metrics.participationRate, 0);
  assert.equal(metrics.averageClaimPerUser, 0);
});

test('D5-28: Drop operations across multiple drops do not cross-contaminate user claim balances', async () => {
  let currentTime = 1000000;
  const service = new LimitedTimeDropService({
    nowProvider: () => currentTime,
  });

  const drop1 = (
    await service.createDrop(
      createBaseParams(
        { name: 'D1', isPublic: true, maxPerUser: 100, startTime: currentTime },
        currentTime
      )
    )
  ).data!;
  const drop2 = (
    await service.createDrop(
      createBaseParams(
        { name: 'D2', isPublic: true, maxPerUser: 100, startTime: currentTime },
        currentTime
      )
    )
  ).data!;

  // Claim 80 in Drop 1
  await service.participateInDrop(drop1.dropId, {
    user: STELLAR_USER_1,
    amount: 80,
  });

  // Drop 1 user should have 20 remaining
  const checkDrop1 = await service.checkAccess(drop1.dropId, STELLAR_USER_1);
  assert.equal(checkDrop1.currentClaimed, 80);
  assert.equal(checkDrop1.remainingAllocation, 20);

  // Drop 2 user should still have 100 remaining
  const checkDrop2 = await service.checkAccess(drop2.dropId, STELLAR_USER_1);
  assert.equal(checkDrop2.currentClaimed, 0);
  assert.equal(checkDrop2.remainingAllocation, 100);
});
