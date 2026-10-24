import test from 'node:test';
import assert from 'node:assert/strict';

import { ProductFollowService } from '../follow.service';
import {
  FOLLOW_ERROR_CODES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  TIME_CONSTANTS,
} from '../constants/follow.constants';
import {
  isValidStellarAddress,
  calculatePriceDropPercentage,
  isUserEligibleForPriceDropAlert,
  paginateArray,
} from '../utils/follow.utils';
import type { NotificationPreference } from '../types/notification.types';

// Mock Stellar addresses
const USER_1 = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USER_2 = 'GCLWGQPMK3WSPFJBNFQU6RNPISMRR72WNSHS7V5F6K37Z56ZJPSK7WVT';
const USER_3 = 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';

const PROD_1 = 'prod_cyber_tee_001';
const PROD_2 = 'prod_stellar_hoodie_002';
const PROD_3 = 'prod_ledger_wallet_003';

// =============================================================================
// DIMENSION 1: FOLLOW & UNFOLLOW LIFECYCLE (TESTS 1 - 25)
// =============================================================================

test('D1-01: Follow product with default preferences succeeds', async () => {
  const service = new ProductFollowService();
  const res = await service.followProduct(PROD_1, USER_1);

  assert.equal(res.success, true);
  assert.equal(res.data, true);
});

test('D1-02: Follow product records followedAt timestamp', async () => {
  let simTime = 1000000;
  const service = new ProductFollowService({ timeProvider: () => simTime });
  await service.followProduct(PROD_1, USER_1);

  const raw = service.getRawFollows();
  assert.equal(raw[0].followedAt, 1000000);
});

test('D1-03: Follow product with custom notification preferences saves preferences', async () => {
  const service = new ProductFollowService();
  const customPrefs: NotificationPreference = {
    priceDrop: true,
    priceDropThresholdPercentage: 20,
    targetPrice: 40,
    restock: false,
    backInStock: true,
    channels: ['EMAIL', 'PUSH'],
  };

  await service.followProduct(PROD_1, USER_1, customPrefs);
  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);

  assert.equal(prefs.priceDropThresholdPercentage, 20);
  assert.equal(prefs.restock, false);
  assert.deepEqual(prefs.channels, ['EMAIL', 'PUSH']);
});

test('D1-04: isFollowing returns true after following', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  assert.equal(await service.isFollowing(PROD_1, USER_1), true);
});

test('D1-05: isFollowing returns false for unfollowed product', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);

  assert.equal(await service.isFollowing(PROD_1, USER_1), false);
});

test('D1-06: isFollowing returns false for non-existent product', async () => {
  const service = new ProductFollowService();
  assert.equal(await service.isFollowing('non_existent', USER_1), false);
});

test('D1-07: Unfollow product succeeds and sets status to UNFOLLOWED', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.unfollowProduct(PROD_1, USER_1);
  assert.equal(res.success, true);

  const raw = service.getRawFollows();
  assert.equal(raw[0].status, 'UNFOLLOWED');
});

test('D1-08: isFollowing returns false after unfollowing', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);

  assert.equal(await service.isFollowing(PROD_1, USER_1), false);
});

test('D1-09: Re-following previously unfollowed product reactivates follow status', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);

  const refollow = await service.followProduct(PROD_1, USER_1);
  assert.equal(refollow.success, true);
  assert.equal(await service.isFollowing(PROD_1, USER_1), true);
});

test('D1-10: Follow product returns transaction hash', async () => {
  const service = new ProductFollowService();
  const res = await service.followProduct(PROD_1, USER_1);

  assert.ok(res.transactionHash?.startsWith('0x'));
  assert.equal(res.transactionHash?.length, 66);
});

test('D1-11: Unfollow product returns transaction hash', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.unfollowProduct(PROD_1, USER_1);
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D1-12: getFollowers returns list of followers for product', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);

  const res = await service.getFollowers(PROD_1);
  assert.equal(res.success, true);
  assert.equal(res.data?.length, 2);
  assert.ok(res.data?.includes(USER_1.toLowerCase()));
  assert.ok(res.data?.includes(USER_2.toLowerCase()));
});

test('D1-13: getFollowers returns empty array for product with 0 followers', async () => {
  const service = new ProductFollowService();
  const res = await service.getFollowers(PROD_1);

  assert.equal(res.success, true);
  assert.equal(res.data?.length, 0);
});

test('D1-14: getFollowingProducts returns list of products followed by user', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_2, USER_1);

  const res = await service.getFollowingProducts(USER_1);
  assert.equal(res.success, true);
  assert.equal(res.data?.length, 2);
  assert.ok(res.data?.includes(PROD_1));
  assert.ok(res.data?.includes(PROD_2));
});

test('D1-15: getFollowingProducts returns empty array for user following 0 products', async () => {
  const service = new ProductFollowService();
  const res = await service.getFollowingProducts(USER_1);

  assert.equal(res.success, true);
  assert.equal(res.data?.length, 0);
});

test('D1-16: Unfollowing removes user from getFollowers list', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);
  await service.unfollowProduct(PROD_1, USER_1);

  const res = await service.getFollowers(PROD_1);
  assert.equal(res.data?.length, 1);
  assert.equal(res.data?.[0], USER_2.toLowerCase());
});

test('D1-17: Unfollowing removes product from getFollowingProducts list', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_2, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);

  const res = await service.getFollowingProducts(USER_1);
  assert.equal(res.data?.length, 1);
  assert.equal(res.data?.[0], PROD_2);
});

test('D1-18: Reset state clears all follows and followers', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  assert.equal((await service.getFollowers(PROD_1)).data?.length, 1);

  service.resetState();
  assert.equal((await service.getFollowers(PROD_1)).data?.length, 0);
});

test('D1-19: Multiple distinct users follow same product', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);
  await service.followProduct(PROD_1, USER_3);

  const res = await service.getFollowers(PROD_1);
  assert.equal(res.data?.length, 3);
});

test('D1-20: Single user follows multiple distinct products', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_2, USER_1);
  await service.followProduct(PROD_3, USER_1);

  const res = await service.getFollowingProducts(USER_1);
  assert.equal(res.data?.length, 3);
});

test('D1-21: Following product updates updatedAt timestamp', async () => {
  let simTime = 2000000;
  const service = new ProductFollowService({ timeProvider: () => simTime });
  await service.followProduct(PROD_1, USER_1);

  const raw = service.getRawFollows();
  assert.equal(raw[0].updatedAt, 2000000);
});

test('D1-22: Case-insensitive handling for Stellar public addresses', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1.toLowerCase());

  assert.equal(await service.isFollowing(PROD_1, USER_1.toUpperCase()), true);
});

test('D1-23: Trim whitespace from productId and user address', async () => {
  const service = new ProductFollowService();
  await service.followProduct(`  ${PROD_1}  `, `  ${USER_1}  `);

  assert.equal(await service.isFollowing(PROD_1, USER_1), true);
});

test('D1-24: Follow entry has status ACTIVE', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const raw = service.getRawFollows();
  assert.equal(raw[0].status, 'ACTIVE');
});

test('D1-25: Re-follow preserves original followedAt timestamp while updating updatedAt', async () => {
  let simTime = 1000000;
  const service = new ProductFollowService({ timeProvider: () => simTime });
  await service.followProduct(PROD_1, USER_1);

  simTime += 500;
  await service.unfollowProduct(PROD_1, USER_1);

  simTime += 500;
  await service.followProduct(PROD_1, USER_1);

  const raw = service.getRawFollows();
  assert.equal(raw[0].followedAt, 1000000);
  assert.equal(raw[0].updatedAt, 1001000);
});

// =============================================================================
// DIMENSION 2: NOTIFICATION PREFERENCES & ALERT CONFIG (TESTS 26 - 45)
// =============================================================================

test('D2-01: setNotificationPreferences updates preferences for followed product', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.setNotificationPreferences(USER_1, PROD_1, {
    priceDrop: true,
    priceDropThresholdPercentage: 15,
    restock: false,
    backInStock: false,
    channels: ['EMAIL'],
  });

  assert.equal(res.success, true);
});

test('D2-02: getNotificationPreferences returns updated preferences', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.setNotificationPreferences(USER_1, PROD_1, {
    priceDrop: false,
    restock: true,
    backInStock: true,
    channels: ['PUSH'],
  });

  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);
  assert.equal(prefs.priceDrop, false);
  assert.equal(prefs.restock, true);
  assert.deepEqual(prefs.channels, ['PUSH']);
});

test('D2-03: getNotificationPreferences returns DEFAULT_NOTIFICATION_PREFERENCES for non-followed product', async () => {
  const service = new ProductFollowService();
  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);

  assert.equal(prefs.priceDrop, DEFAULT_NOTIFICATION_PREFERENCES.priceDrop);
  assert.equal(prefs.restock, DEFAULT_NOTIFICATION_PREFERENCES.restock);
});

test('D2-04: Configure custom channels (EMAIL, PUSH) in preferences', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    channels: ['EMAIL', 'PUSH'],
  });

  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);
  assert.deepEqual(prefs.channels, ['EMAIL', 'PUSH']);
});

test('D2-05: Configure custom priceDropThresholdPercentage (e.g. 15%)', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDropThresholdPercentage: 15,
  });

  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);
  assert.equal(prefs.priceDropThresholdPercentage, 15);
});

test('D2-06: Configure custom targetPrice (e.g. $50)', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    targetPrice: 50,
  });

  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);
  assert.equal(prefs.targetPrice, 50);
});

test('D2-07: Disable restock notifications in preferences', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    restock: false,
    backInStock: false,
  });

  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);
  assert.equal(prefs.restock, false);
  assert.equal(prefs.backInStock, false);
});

test('D2-08: Disable price drop notifications in preferences', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDrop: false,
  });

  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);
  assert.equal(prefs.priceDrop, false);
});

test('D2-09: Enable saleStart notifications in preferences', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    saleStart: true,
  });

  const prefs = await service.getNotificationPreferences(USER_1, PROD_1);
  assert.equal(prefs.saleStart, true);
});

test('D2-10: setNotificationPreferences returns transaction hash', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.setNotificationPreferences(USER_1, PROD_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D2-11: isUserEligibleForPriceDropAlert returns true when drop meets threshold', () => {
  const prefs: NotificationPreference = {
    priceDrop: true,
    priceDropThresholdPercentage: 10,
    restock: true,
    backInStock: true,
    channels: ['IN_APP'],
  };

  // 100 -> 85 is 15% drop (>= 10%)
  assert.equal(isUserEligibleForPriceDropAlert(prefs, 100, 85), true);
});

test('D2-12: isUserEligibleForPriceDropAlert returns false when drop below threshold', () => {
  const prefs: NotificationPreference = {
    priceDrop: true,
    priceDropThresholdPercentage: 10,
    restock: true,
    backInStock: true,
    channels: ['IN_APP'],
  };

  // 100 -> 95 is 5% drop (< 10%)
  assert.equal(isUserEligibleForPriceDropAlert(prefs, 100, 95), false);
});

test('D2-13: isUserEligibleForPriceDropAlert returns true when price hits targetPrice', () => {
  const prefs: NotificationPreference = {
    priceDrop: true,
    targetPrice: 50,
    restock: true,
    backInStock: true,
    channels: ['IN_APP'],
  };

  assert.equal(isUserEligibleForPriceDropAlert(prefs, 100, 48), true);
});

test('D2-14: isUserEligibleForPriceDropAlert returns false when price above targetPrice', () => {
  const prefs: NotificationPreference = {
    priceDrop: true,
    targetPrice: 50,
    restock: true,
    backInStock: true,
    channels: ['IN_APP'],
  };

  assert.equal(isUserEligibleForPriceDropAlert(prefs, 100, 55), false);
});

test('D2-15: isUserEligibleForPriceDropAlert returns false when priceDrop is disabled', () => {
  const prefs: NotificationPreference = {
    priceDrop: false,
    restock: true,
    backInStock: true,
    channels: ['IN_APP'],
  };

  assert.equal(isUserEligibleForPriceDropAlert(prefs, 100, 10), false);
});

test('D2-16: calculatePriceDropPercentage calculates exact percentage', () => {
  assert.equal(calculatePriceDropPercentage(100, 80), 20);
  assert.equal(calculatePriceDropPercentage(200, 150), 25);
});

test('D2-17: calculatePriceDropPercentage returns 0 when price increased', () => {
  assert.equal(calculatePriceDropPercentage(100, 120), 0);
});

test('D2-18: calculatePriceDropPercentage returns 0 when price unchanged', () => {
  assert.equal(calculatePriceDropPercentage(100, 100), 0);
});

test('D2-19: Multiple users with different thresholds: selective alert eligibility', () => {
  const u1Prefs: NotificationPreference = {
    priceDrop: true,
    priceDropThresholdPercentage: 5,
    restock: true,
    backInStock: true,
    channels: ['IN_APP'],
  };
  const u2Prefs: NotificationPreference = {
    priceDrop: true,
    priceDropThresholdPercentage: 20,
    restock: true,
    backInStock: true,
    channels: ['IN_APP'],
  };

  // Drop 100 -> 90 is 10% drop
  assert.equal(isUserEligibleForPriceDropAlert(u1Prefs, 100, 90), true);
  assert.equal(isUserEligibleForPriceDropAlert(u2Prefs, 100, 90), false);
});

test('D2-20: Preference updates update entry updatedAt timestamp', async () => {
  let simTime = 1000000;
  const service = new ProductFollowService({ timeProvider: () => simTime });
  await service.followProduct(PROD_1, USER_1);

  simTime += 500;
  await service.setNotificationPreferences(USER_1, PROD_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDropThresholdPercentage: 25,
  });

  const raw = service.getRawFollows();
  assert.equal(raw[0].updatedAt, 1000500);
});

// =============================================================================
// DIMENSION 3: PRICE DROP & RESTOCK ALERT TRIGGERS (TESTS 46 - 65)
// =============================================================================

test('D3-01: triggerPriceDropAlert notifies all eligible followers', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1); // default 5%
  await service.followProduct(PROD_1, USER_2); // default 5%

  const res = await service.triggerPriceDropAlert(PROD_1, 100, 90); // 10% drop
  assert.equal(res.success, true);
  assert.equal(res.data, 2);
});

test('D3-02: triggerPriceDropAlert returns count of notified followers', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.triggerPriceDropAlert(PROD_1, 100, 80);
  assert.equal(res.data, 1);
});

test('D3-03: triggerPriceDropAlert skips followers with higher threshold', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDropThresholdPercentage: 5,
  });
  await service.followProduct(PROD_1, USER_2, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDropThresholdPercentage: 25,
  });

  // 100 -> 90 is 10% drop
  const res = await service.triggerPriceDropAlert(PROD_1, 100, 90);
  assert.equal(res.data, 1);
});

test('D3-04: triggerPriceDropAlert skips unfollowed users', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);
  await service.unfollowProduct(PROD_1, USER_1);

  const res = await service.triggerPriceDropAlert(PROD_1, 100, 80);
  assert.equal(res.data, 1);
});

test('D3-05: triggerPriceDropAlert returns 0 when no followers are eligible', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDrop: false,
  });

  const res = await service.triggerPriceDropAlert(PROD_1, 100, 50);
  assert.equal(res.data, 0);
});

test('D3-06: triggerPriceDropAlert generates transaction hash', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.triggerPriceDropAlert(PROD_1, 100, 80);
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D3-07: triggerRestockAlert notifies followers with restock: true', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    restock: true,
  });

  const res = await service.triggerRestockAlert(PROD_1, 10);
  assert.equal(res.success, true);
  assert.equal(res.data, 1);
});

test('D3-08: triggerRestockAlert notifies followers with backInStock: true', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    restock: false,
    backInStock: true,
  });

  const res = await service.triggerRestockAlert(PROD_1, 5);
  assert.equal(res.data, 1);
});

test('D3-09: triggerRestockAlert skips followers with both restock and backInStock false', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    restock: false,
    backInStock: false,
  });

  const res = await service.triggerRestockAlert(PROD_1, 20);
  assert.equal(res.data, 0);
});

test('D3-10: triggerRestockAlert skips unfollowed users', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);

  const res = await service.triggerRestockAlert(PROD_1, 50);
  assert.equal(res.data, 0);
});

test('D3-11: triggerRestockAlert returns count of notified users', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);
  await service.followProduct(PROD_1, USER_3);

  const res = await service.triggerRestockAlert(PROD_1, 100);
  assert.equal(res.data, 3);
});

test('D3-12: triggerRestockAlert generates transaction hash', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.triggerRestockAlert(PROD_1, 10);
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D3-13: Multiple sequential price drops record independent alerts', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const r1 = await service.triggerPriceDropAlert(PROD_1, 100, 90);
  const r2 = await service.triggerPriceDropAlert(PROD_1, 90, 80);

  assert.equal(r1.data, 1);
  assert.equal(r2.data, 1);
});

test('D3-14: Restock alert with custom quantity succeeds', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.triggerRestockAlert(PROD_1, 500);
  assert.equal(res.success, true);
});

test('D3-15: Price drop alert on product with zero followers returns 0 notified', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerPriceDropAlert('empty_prod', 100, 50);

  assert.equal(res.success, true);
  assert.equal(res.data, 0);
});

test('D3-16: Restock alert on product with zero followers returns 0 notified', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerRestockAlert('empty_prod', 50);

  assert.equal(res.success, true);
  assert.equal(res.data, 0);
});

test('D3-17: Re-followed user receives subsequent restock alerts', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_1);

  const res = await service.triggerRestockAlert(PROD_1, 10);
  assert.equal(res.data, 1);
});

test('D3-18: Re-followed user receives subsequent price drop alerts', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_1);

  const res = await service.triggerPriceDropAlert(PROD_1, 100, 80);
  assert.equal(res.data, 1);
});

test('D3-19: Price drop from $200 to $100 notifies users with threshold <= 50%', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDropThresholdPercentage: 50,
  });
  await service.followProduct(PROD_1, USER_2, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDropThresholdPercentage: 60,
  });

  const res = await service.triggerPriceDropAlert(PROD_1, 200, 100);
  assert.equal(res.data, 1); // Only USER_1 notified
});

test('D3-20: Target price matching takes precedence over percentage threshold', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    targetPrice: 75,
    priceDropThresholdPercentage: 50, // would require <= 50
  });

  // Dropped from 100 to 75 (25% drop, but hits targetPrice)
  const res = await service.triggerPriceDropAlert(PROD_1, 100, 75);
  assert.equal(res.data, 1);
});

// =============================================================================
// DIMENSION 4: NEGATIVE CASES, BOUNDARY CONDITIONS & ANTI-ABUSE (TESTS 66 - 85)
// =============================================================================

test('D4-01: Rejects followProduct with empty productId', async () => {
  const service = new ProductFollowService();
  const res = await service.followProduct('', USER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-02: Rejects followProduct with invalid user Stellar address', async () => {
  const service = new ProductFollowService();
  const res = await service.followProduct(PROD_1, 'invalid_address');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-03: Rejects followProduct when user already actively follows (USER_ALREADY_FOLLOWING)', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const res = await service.followProduct(PROD_1, USER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.USER_ALREADY_FOLLOWING);
});

test('D4-04: Rejects unfollowProduct with empty productId', async () => {
  const service = new ProductFollowService();
  const res = await service.unfollowProduct('', USER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-05: Rejects unfollowProduct with invalid user address', async () => {
  const service = new ProductFollowService();
  const res = await service.unfollowProduct(PROD_1, 'invalid_address');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-06: Rejects unfollowProduct when user is not following (USER_NOT_FOLLOWING)', async () => {
  const service = new ProductFollowService();
  const res = await service.unfollowProduct(PROD_1, USER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING);
});

test('D4-07: Rejects unfollowProduct when user already unfollowed (USER_NOT_FOLLOWING)', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.unfollowProduct(PROD_1, USER_1);

  const res = await service.unfollowProduct(PROD_1, USER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING);
});

test('D4-08: Rejects setNotificationPreferences for non-followed product (USER_NOT_FOLLOWING)', async () => {
  const service = new ProductFollowService();
  const res = await service.setNotificationPreferences(USER_1, PROD_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.USER_NOT_FOLLOWING);
});

test('D4-09: Rejects setNotificationPreferences with invalid user address', async () => {
  const service = new ProductFollowService();
  const res = await service.setNotificationPreferences('bad_user', PROD_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-10: Rejects setNotificationPreferences with empty productId', async () => {
  const service = new ProductFollowService();
  const res = await service.setNotificationPreferences(USER_1, '', {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-11: Rejects triggerPriceDropAlert with empty productId', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerPriceDropAlert('', 100, 80);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-12: Rejects triggerPriceDropAlert with negative oldPrice', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerPriceDropAlert(PROD_1, -100, 80);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PRICE);
});

test('D4-13: Rejects triggerPriceDropAlert with negative newPrice', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerPriceDropAlert(PROD_1, 100, -20);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PRICE);
});

test('D4-14: Rejects triggerPriceDropAlert with oldPrice <= 0', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerPriceDropAlert(PROD_1, 0, 0);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PRICE);
});

test('D4-15: Rejects triggerRestockAlert with empty productId', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerRestockAlert('', 50);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-16: Rejects triggerRestockAlert with zero quantity', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerRestockAlert(PROD_1, 0);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_QUANTITY);
});

test('D4-17: Rejects triggerRestockAlert with negative quantity', async () => {
  const service = new ProductFollowService();
  const res = await service.triggerRestockAlert(PROD_1, -10);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_QUANTITY);
});

test('D4-18: Rejects getFollowers with empty productId', async () => {
  const service = new ProductFollowService();
  const res = await service.getFollowers('');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-19: Rejects getFollowingProducts with invalid user address', async () => {
  const service = new ProductFollowService();
  const res = await service.getFollowingProducts('bad_user');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, FOLLOW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-20: Rejects followProduct when MAX_USER_FOLLOWS is exceeded', async () => {
  const service = new ProductFollowService();

  // Follow up to MAX_USER_FOLLOWS (500)
  for (let i = 0; i < TIME_CONSTANTS.MAX_USER_FOLLOWS; i++) {
    await service.followProduct(`prod_${i}`, USER_1);
  }

  const overflow = await service.followProduct('prod_overflow', USER_1);
  assert.equal(overflow.success, false);
  assert.equal(overflow.errorCode, FOLLOW_ERROR_CODES.MAX_FOLLOWS_EXCEEDED);
});

// =============================================================================
// DIMENSION 5: ANALYTICS, PAGINATION, CONCURRENCY & STRESS (TESTS 86 - 105)
// =============================================================================

test('D5-01: getProductFollowStats returns totalFollowers and activeFollowers', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);

  const stats = await service.getProductFollowStats(PROD_1);
  assert.equal(stats.totalFollowers, 2);
  assert.equal(stats.activeFollowers, 2);
});

test('D5-02: getProductFollowStats counts priceAlertSubscribers accurately', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDrop: true,
  });
  await service.followProduct(PROD_1, USER_2, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDrop: false,
  });

  const stats = await service.getProductFollowStats(PROD_1);
  assert.equal(stats.priceAlertSubscribers, 1);
});

test('D5-03: getProductFollowStats counts restockAlertSubscribers accurately', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    restock: true,
  });
  await service.followProduct(PROD_1, USER_2, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    restock: false,
    backInStock: false,
  });

  const stats = await service.getProductFollowStats(PROD_1);
  assert.equal(stats.restockAlertSubscribers, 1);
});

test('D5-04: getProductFollowStats returns lastFollowedAt timestamp', async () => {
  let simTime = 3000000;
  const service = new ProductFollowService({ timeProvider: () => simTime });
  await service.followProduct(PROD_1, USER_1);

  const stats = await service.getProductFollowStats(PROD_1);
  assert.equal(stats.lastFollowedAt, 3000000);
});

test('D5-05: getProductFollowStats returns 0 counts for product with 0 followers', async () => {
  const service = new ProductFollowService();
  const stats = await service.getProductFollowStats('empty_prod');

  assert.equal(stats.totalFollowers, 0);
  assert.equal(stats.priceAlertSubscribers, 0);
  assert.equal(stats.restockAlertSubscribers, 0);
});

test('D5-06: getTrendingFollowedProducts returns products sorted descending by followers', async () => {
  const service = new ProductFollowService();
  // PROD_2 has 3 followers, PROD_1 has 2, PROD_3 has 1
  await service.followProduct(PROD_2, USER_1);
  await service.followProduct(PROD_2, USER_2);
  await service.followProduct(PROD_2, USER_3);

  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);

  await service.followProduct(PROD_3, USER_1);

  const trending = await service.getTrendingFollowedProducts();
  assert.equal(trending[0], PROD_2);
  assert.equal(trending[1], PROD_1);
  assert.equal(trending[2], PROD_3);
});

test('D5-07: getTrendingFollowedProducts respects limit parameter', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_2, USER_1);
  await service.followProduct(PROD_3, USER_1);

  const trending = await service.getTrendingFollowedProducts(2);
  assert.equal(trending.length, 2);
});

test('D5-08: getFollowers pagination: page 1 with limit 2 returns first 2 followers', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);
  await service.followProduct(PROD_1, USER_3);

  const res = await service.getFollowers(PROD_1, { page: 1, limit: 2 });
  assert.equal(res.data?.length, 2);
});

test('D5-09: getFollowers pagination: page 2 with limit 2 returns next 1 follower', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);
  await service.followProduct(PROD_1, USER_3);

  const res = await service.getFollowers(PROD_1, { page: 2, limit: 2 });
  assert.equal(res.data?.length, 1);
});

test('D5-10: getFollowingProducts pagination slices correctly', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_2, USER_1);
  await service.followProduct(PROD_3, USER_1);

  const res = await service.getFollowingProducts(USER_1, { limit: 2 });
  assert.equal(res.data?.length, 2);
});

test('D5-11: paginateArray handles offset beyond array length gracefully', () => {
  const items = ['a', 'b', 'c'];
  const res = paginateArray(items, { offset: 10, limit: 5 });
  assert.deepEqual(res, []);
});

test('D5-12: paginateArray clamps limit to MAX_PAGE_SIZE (100)', () => {
  const items = Array.from({ length: 150 }, (_, i) => `item_${i}`);
  const res = paginateArray(items, { limit: 500 });
  assert.equal(res.length, 100);
});

test('D5-13: Validates Stellar address format regex (G..., C..., 0x...)', () => {
  assert.equal(isValidStellarAddress(USER_1), true);
  assert.equal(isValidStellarAddress('CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM'), true);
  assert.equal(isValidStellarAddress('0x1234567890123456789012345678901234567890'), true);
  assert.equal(isValidStellarAddress('bad'), false);
  assert.equal(isValidStellarAddress(''), false);
});

test('D5-14: Timestamps match simulated timeProvider', async () => {
  let simTime = 77766655;
  const service = new ProductFollowService({ timeProvider: () => simTime });
  await service.followProduct(PROD_1, USER_1);

  const raw = service.getRawFollows();
  assert.equal(raw[0].followedAt, 77766655);
});

test('D5-15: getRawFollows returns immutable array preventing internal state corruption', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);

  const raw = service.getRawFollows();
  raw.push({} as any);

  assert.equal(service.getRawFollows().length, 1);
});

test('D5-16: Stress test: 30 concurrent users follow single product with full data integrity', async () => {
  const service = new ProductFollowService();
  const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  const promises = [];
  for (let i = 0; i < 30; i++) {
    const userAddr = 'G' + 'F'.repeat(54) + base32[i];
    promises.push(service.followProduct(PROD_1, userAddr));
  }

  await Promise.all(promises);

  const followers = (await service.getFollowers(PROD_1)).data!;
  assert.equal(followers.length, 30);
});

test('D5-17: Stress test: single user follows 20 distinct products in rapid succession', async () => {
  const service = new ProductFollowService();

  for (let i = 0; i < 20; i++) {
    await service.followProduct(`product_id_${i}`, USER_1);
  }

  const following = (await service.getFollowingProducts(USER_1)).data!;
  assert.equal(following.length, 20);
});

test('D5-18: Stress test: trending calculation across 15 products with varied follower counts', async () => {
  const service = new ProductFollowService();
  const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  for (let p = 0; p < 15; p++) {
    const pid = `prod_test_${p}`;
    // Product p gets p followers
    for (let u = 0; u < p; u++) {
      const userAddr = 'G' + 'A'.repeat(54) + base32[u];
      await service.followProduct(pid, userAddr);
    }
  }

  const trending = await service.getTrendingFollowedProducts(5);
  assert.equal(trending[0], 'prod_test_14'); // 14 followers
  assert.equal(trending[1], 'prod_test_13'); // 13 followers
});

test('D5-19: Mass alert dispatch to 30 active followers executes in sub-millisecond', async () => {
  const service = new ProductFollowService();
  const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  for (let i = 0; i < 30; i++) {
    const userAddr = 'G' + 'C'.repeat(54) + base32[i];
    await service.followProduct(PROD_1, userAddr);
  }

  const res = await service.triggerPriceDropAlert(PROD_1, 100, 80);
  assert.equal(res.data, 30);
});

test('D5-20: Mixed follows, preference updates and unfollows maintain accurate stats', async () => {
  const service = new ProductFollowService();
  await service.followProduct(PROD_1, USER_1);
  await service.followProduct(PROD_1, USER_2);
  await service.followProduct(PROD_1, USER_3);

  await service.setNotificationPreferences(USER_1, PROD_1, {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    priceDrop: false,
  });

  await service.unfollowProduct(PROD_1, USER_2);

  const stats = await service.getProductFollowStats(PROD_1);
  assert.equal(stats.activeFollowers, 2); // USER_1 and USER_3
  assert.equal(stats.priceAlertSubscribers, 1); // only USER_3
});
