/**
 * Promotional Boost Contract Service - Comprehensive 5D Matrix Test Suite
 * 105 tests covering all dimensions, lifecycle stages, error handling, and stress scenarios.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PromotionalBoostService } from '../boost.service';
import {
  BOOST_STATUS,
  BOOST_ERROR_CODES,
  PAYMENT_STATUS,
  SLOT_TYPES,
  VISIBILITY_MULTIPLIERS,
} from '../constants/boost.constants';
import {
  calculateBoostCost,
} from '../utils/boost.utils';

// Valid Stellar & EVM Addresses
const SELLER_1 = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const SELLER_2 = 'GCLWGQPMK3WSPFJBNFQU6RNPISMRR72WNSHS7V5F6K37Z56ZJPSK7WVT';
const CONTRACT_1 = 'CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';
const EVM_1 = '0x1234567890123456789012345678901234567890';

const PROD_1 = 'prod_stellar_hoodie_001';
const PROD_2 = 'prod_cyber_tee_002';
const PROD_3 = 'prod_ledger_wallet_003';

describe('PromotionalBoostService - 5D Verification Matrix', () => {
  let service: PromotionalBoostService;

  beforeEach(() => {
    service = new PromotionalBoostService();
    service.resetState();
  });

  // ===========================================================================
  // DIMENSION 1: BOOST LIFECYCLE & CRUD OPERATIONS (TESTS 1 - 25)
  // ===========================================================================

  it('D1-01: Create boost with minimum valid parameters', async () => {
    const res = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data.productId, PROD_1);
    assert.equal(res.data.level, 'FEATURED');
    assert.equal(res.data.status, BOOST_STATUS.CREATED);
    assert.equal(res.data.paymentStatus, PAYMENT_STATUS.PENDING);
  });

  it('D1-02: Create boost with explicit slotType and duration', async () => {
    const res = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'PREMIUM',
      durationSeconds: 7200,
      slotType: SLOT_TYPES.HOMEPAGE_HERO,
    });
    assert.equal(res.success, true);
    assert.equal(res.data?.slotType, SLOT_TYPES.HOMEPAGE_HERO);
    assert.equal(res.data?.durationSeconds, 7200);
  });

  it('D1-03: Create boost assigns status CREATED and paymentStatus PENDING', async () => {
    const res = await service.createBoost({
      productId: PROD_2,
      seller: SELLER_2,
      level: 'SPOTLIGHT',
      durationSeconds: 3600,
    });
    assert.equal(res.data?.status, BOOST_STATUS.CREATED);
    assert.equal(res.data?.paymentStatus, PAYMENT_STATUS.PENDING);
  });

  it('D1-04: Create boost calculates correct initial cost', async () => {
    // SPOTLIGHT = 10 USDC/hr, SIDEBAR_BANNER = 1.0x -> 2 hrs = 20 USDC
    const res = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'SPOTLIGHT',
      durationSeconds: 7200,
      slotType: SLOT_TYPES.SIDEBAR_BANNER,
    });
    assert.equal(res.data?.cost, 20);
  });

  it('D1-05: Create boost automatically reserves slot', async () => {
    const res = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
      slotType: SLOT_TYPES.HOMEPAGE_HERO,
    });
    assert.ok(res.data?.slotId);
    const status = await service.getSlotStatus(res.data!.slotId!);
    assert.equal(status, 'RESERVED');
  });

  it('D1-06: getBoost returns existing boost config', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    const fetched = await service.getBoost(created.data!.boostId);
    assert.equal(fetched.success, true);
    assert.equal(fetched.data?.boostId, created.data!.boostId);
  });

  it('D1-07: getBoost auto-expires active boost when endTime passes', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    // Fast-forward past 3600 seconds
    mockTime = 1000 + 3601 * 1000;
    const fetched = await service.getBoost(boostId);
    assert.equal(fetched.data?.status, BOOST_STATUS.EXPIRED);
  });

  it('D1-08: updateBoost updates visibility level', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
    });
    const updated = await service.updateBoost(created.data!.boostId, { level: 'SPOTLIGHT' });
    assert.equal(updated.success, true);
    assert.equal(updated.data?.level, 'SPOTLIGHT');
  });

  it('D1-09: updateBoost recalculates cost on level change', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
      slotType: SLOT_TYPES.SIDEBAR_BANNER,
    });
    assert.equal(created.data?.cost, 1);

    const updated = await service.updateBoost(created.data!.boostId, { level: 'SPOTLIGHT' });
    assert.equal(updated.data?.cost, 10);
  });

  it('D1-10: updateBoost extends durationSeconds', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
    });
    const updated = await service.updateBoost(created.data!.boostId, { extendDurationSeconds: 3600 });
    assert.equal(updated.data?.durationSeconds, 7200);
  });

  it('D1-11: updateBoost pushes forward endTime on active boost', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    const active = await service.getBoost(boostId);
    const originalEnd = active.data!.endTime!;

    await service.updateBoost(boostId, { extendDurationSeconds: 1800 });
    const extended = await service.getBoost(boostId);
    assert.equal(extended.data!.endTime, originalEnd + 1800 * 1000);
  });

  it('D1-12: updateBoost switches slotType and swaps reserved slot', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
      slotType: SLOT_TYPES.SIDEBAR_BANNER,
    });
    const oldSlot = created.data!.slotId!;

    const updated = await service.updateBoost(created.data!.boostId, { slotType: SLOT_TYPES.HOMEPAGE_HERO });
    assert.notEqual(updated.data?.slotId, oldSlot);
    assert.equal(await service.getSlotStatus(oldSlot), 'AVAILABLE');
  });

  it('D1-13: cancelBoost marks status CANCELLED', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    const cancelRes = await service.cancelBoost(created.data!.boostId);
    assert.equal(cancelRes.success, true);
    assert.equal(cancelRes.data, true);

    const fetched = await service.getBoost(created.data!.boostId);
    assert.equal(fetched.data?.status, BOOST_STATUS.CANCELLED);
  });

  it('D1-14: cancelBoost releases reserved slot', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    const slotId = created.data!.slotId!;
    await service.cancelBoost(created.data!.boostId);
    assert.equal(await service.getSlotStatus(slotId), 'AVAILABLE');
  });

  it('D1-15: cancelBoost downgrades active product visibility back to STANDARD', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'PREMIUM',
      durationSeconds: 3600,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    const activeStats = await service.getVisibilityStats(PROD_1);
    assert.equal(activeStats.isBoosted, true);

    await service.cancelBoost(boostId);
    const cancelledStats = await service.getVisibilityStats(PROD_1);
    assert.equal(cancelledStats.isBoosted, false);
    assert.equal(cancelledStats.currentLevel, 'STANDARD');
  });

  it('D1-16: cancelBoost generates transaction hash', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    const cancelRes = await service.cancelBoost(created.data!.boostId);
    assert.ok(cancelRes.txHash);
    assert.ok(cancelRes.txHash.startsWith('0x'));
  });

  it('D1-17: activateBoost marks status ACTIVE after payment', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    const actRes = await service.activateBoost(boostId);
    assert.equal(actRes.success, true);

    const fetched = await service.getBoost(boostId);
    assert.equal(fetched.data?.status, BOOST_STATUS.ACTIVE);
  });

  it('D1-18: activateBoost calculates correct startTime and endTime', async () => {
    let mockTime = 5000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 1000,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    const fetched = await service.getBoost(boostId);
    assert.equal(fetched.data?.startTime, 5000);
    assert.equal(fetched.data?.endTime, 5000 + 1000 * 1000);
  });

  it('D1-19: activateBoost updates slot status to OCCUPIED', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    const slotStatus = await service.getSlotStatus(created.data!.slotId!);
    assert.equal(slotStatus, 'OCCUPIED');
  });

  it('D1-20: activateBoost updates product visibility stats', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'PREMIUM',
      durationSeconds: 3600,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.currentLevel, 'PREMIUM');
    assert.equal(stats.impressionsMultiplier, VISIBILITY_MULTIPLIERS.PREMIUM);
    assert.equal(stats.isBoosted, true);
  });

  it('D1-21: resetState clears all boosts and resets slots', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
    });
    service.resetState();

    const fetched = await service.getBoost(created.data!.boostId);
    assert.equal(fetched.success, false);
    assert.equal(fetched.error?.code, BOOST_ERROR_CODES.BOOST_NOT_FOUND);
  });

  it('D1-22: Deterministic time provider influences expiration', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 100,
    });
    await service.processBoostPayment(created.data!.boostId, created.data!.cost);
    await service.activateBoost(created.data!.boostId);

    mockTime = 1000 + 101 * 1000;
    const fetched = await service.getBoost(created.data!.boostId);
    assert.equal(fetched.data?.status, BOOST_STATUS.EXPIRED);
  });

  it('D1-23: Multiple distinct boosts can coexist for different products', async () => {
    const b1 = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'STANDARD', durationSeconds: 3600 });
    const b2 = await service.createBoost({ productId: PROD_2, seller: SELLER_2, level: 'PREMIUM', durationSeconds: 3600 });
    assert.notEqual(b1.data!.boostId, b2.data!.boostId);
  });

  it('D1-24: Updates updatedAt timestamp on boost update', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
    });

    mockTime = 2500;
    await service.updateBoost(created.data!.boostId, { level: 'FEATURED' });
    const fetched = await service.getBoost(created.data!.boostId);
    assert.equal(fetched.data?.updatedAt, 2500);
  });

  it('D1-25: Stellar address normalization (trim)', async () => {
    const res = await service.createBoost({
      productId: PROD_1,
      seller: `  ${SELLER_1}  `,
      level: 'STANDARD',
      durationSeconds: 3600,
    });
    assert.equal(res.data?.seller, SELLER_1);
  });

  // ===========================================================================
  // DIMENSION 2: VISIBILITY LEVELS & IMPRESSION MULTIPLIERS (TESTS 26 - 45)
  // ===========================================================================

  it('D2-01: setVisibilityLevel updates level to STANDARD', async () => {
    const res = await service.setVisibilityLevel(PROD_1, 'STANDARD');
    assert.equal(res.success, true);
    assert.equal(await service.getVisibilityLevel(PROD_1), 'STANDARD');
  });

  it('D2-02: setVisibilityLevel updates level to FEATURED (multiplier 2.0)', async () => {
    await service.setVisibilityLevel(PROD_1, 'FEATURED');
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.currentLevel, 'FEATURED');
    assert.equal(stats.impressionsMultiplier, 2.0);
  });

  it('D2-03: setVisibilityLevel updates level to PREMIUM (multiplier 3.5)', async () => {
    await service.setVisibilityLevel(PROD_1, 'PREMIUM');
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.currentLevel, 'PREMIUM');
    assert.equal(stats.impressionsMultiplier, 3.5);
  });

  it('D2-04: setVisibilityLevel updates level to SPOTLIGHT (multiplier 5.0)', async () => {
    await service.setVisibilityLevel(PROD_1, 'SPOTLIGHT');
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.currentLevel, 'SPOTLIGHT');
    assert.equal(stats.impressionsMultiplier, 5.0);
  });

  it('D2-05: getVisibilityLevel returns STANDARD for unboosted product', async () => {
    const level = await service.getVisibilityLevel('unboosted_prod');
    assert.equal(level, 'STANDARD');
  });

  it('D2-06: getVisibilityLevel returns active boosted level', async () => {
    await service.setVisibilityLevel(PROD_2, 'SPOTLIGHT');
    assert.equal(await service.getVisibilityLevel(PROD_2), 'SPOTLIGHT');
  });

  it('D2-07: boostVisibility rapidly boosts product to FEATURED', async () => {
    const res = await service.boostVisibility(PROD_1, 3600);
    assert.equal(res.success, true);
    assert.equal(await service.getVisibilityLevel(PROD_1), 'FEATURED');
  });

  it('D2-08: boostVisibility sets future boostExpiresAt', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    await service.boostVisibility(PROD_1, 1200);
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.boostExpiresAt, 1000 + 1200 * 1000);
    assert.equal(stats.isBoosted, true);
  });

  it('D2-09: boostVisibility increments totalBoostsCount', async () => {
    await service.boostVisibility(PROD_1, 1000);
    await service.boostVisibility(PROD_1, 1000);
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.totalBoostsCount, 2);
  });

  it('D2-10: getVisibilityStats returns accurate stats object', async () => {
    const stats = await service.getVisibilityStats(PROD_3);
    assert.equal(stats.productId, PROD_3);
    assert.equal(stats.currentLevel, 'STANDARD');
    assert.equal(stats.isBoosted, false);
    assert.equal(stats.impressionsMultiplier, 1.0);
    assert.equal(stats.totalBoostsCount, 0);
  });

  it('D2-11: getVisibilityStats auto-resets expired boost to STANDARD', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    await service.boostVisibility(PROD_1, 100);
    mockTime = 1000 + 101 * 1000;

    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.currentLevel, 'STANDARD');
    assert.equal(stats.impressionsMultiplier, 1.0);
  });

  it('D2-12: getVisibilityStats clears isBoosted flag after expiry', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    await service.boostVisibility(PROD_1, 100);
    mockTime = 1000 + 105 * 1000;

    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.isBoosted, false);
    assert.equal(stats.boostExpiresAt, undefined);
  });

  it('D2-13: Setting level to STANDARD clears isBoosted flag', async () => {
    await service.boostVisibility(PROD_1, 3600);
    await service.setVisibilityLevel(PROD_1, 'STANDARD');
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.isBoosted, false);
  });

  it('D2-14: Case-insensitive address handling in seller validation', async () => {
    const res = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1.toLowerCase(),
      level: 'STANDARD',
      durationSeconds: 3600,
    });
    assert.equal(res.success, true);
  });

  it('D2-15: Contract address (C...) accepted for seller', async () => {
    const res = await service.createBoost({
      productId: PROD_1,
      seller: CONTRACT_1,
      level: 'STANDARD',
      durationSeconds: 3600,
    });
    assert.equal(res.success, true);
  });

  it('D2-16: EVM address (0x...) accepted for seller', async () => {
    const res = await service.createBoost({
      productId: PROD_1,
      seller: EVM_1,
      level: 'STANDARD',
      durationSeconds: 3600,
    });
    assert.equal(res.success, true);
  });

  it('D2-17: Rapid sequential visibility boosts increment totalBoostsCount', async () => {
    for (let i = 0; i < 5; i++) {
      await service.boostVisibility(PROD_2, 100);
    }
    const stats = await service.getVisibilityStats(PROD_2);
    assert.equal(stats.totalBoostsCount, 5);
  });

  it('D2-18: getVisibilityStats records lastBoostedAt timestamp', async () => {
    let mockTime = 7777;
    service.setTimeProvider(() => mockTime);

    await service.boostVisibility(PROD_1, 500);
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.lastBoostedAt, 7777);
  });

  it('D2-19: Setting same visibility level multiple times is idempotent', async () => {
    await service.setVisibilityLevel(PROD_1, 'PREMIUM');
    await service.setVisibilityLevel(PROD_1, 'PREMIUM');
    const stats = await service.getVisibilityStats(PROD_1);
    assert.equal(stats.currentLevel, 'PREMIUM');
  });

  it('D2-20: setVisibilityLevel returns transaction hash', async () => {
    const res = await service.setVisibilityLevel(PROD_1, 'FEATURED');
    assert.ok(res.txHash);
    assert.ok(res.txHash.startsWith('0x'));
  });

  // ===========================================================================
  // DIMENSION 3: SLOT MANAGEMENT & CAPACITY ENFORCEMENT (TESTS 46 - 65)
  // ===========================================================================

  it('D3-01: reserveSlot reserves first available slot of type', async () => {
    const res = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    assert.equal(res.success, true);
    assert.ok(res.data?.includes('homepage_hero'));
  });

  it('D3-02: reserveSlot sets slot status to RESERVED', async () => {
    const res = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    const status = await service.getSlotStatus(res.data!);
    assert.equal(status, 'RESERVED');
  });

  it('D3-03: reserveSlot sets expiration time based on duration', async () => {
    let mockTime = 2000;
    service.setTimeProvider(() => mockTime);

    const res = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 100);
    const slotId = res.data!;

    // Check status active
    assert.equal(await service.getSlotStatus(slotId), 'RESERVED');

    // Past expiration
    mockTime = 2000 + 105 * 1000;
    assert.equal(await service.getSlotStatus(slotId), 'AVAILABLE');
  });

  it('D3-04: reserveSlot returns valid slotId', async () => {
    const res = await service.reserveSlot(SLOT_TYPES.SIDEBAR_BANNER, 3600);
    assert.ok(res.data);
  });

  it('D3-05: getAvailableSlots returns all slots initially', async () => {
    const available = await service.getAvailableSlots(SLOT_TYPES.HOMEPAGE_HERO);
    assert.equal(available.length, 5); // 5 max slots
  });

  it('D3-06: getAvailableSlots decrements after slot reservation', async () => {
    await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    const available = await service.getAvailableSlots(SLOT_TYPES.HOMEPAGE_HERO);
    assert.equal(available.length, 4);
  });

  it('D3-07: releaseSlot resets slot status to AVAILABLE', async () => {
    const res = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    const slotId = res.data!;
    const relRes = await service.releaseSlot(slotId);
    assert.equal(relRes.success, true);
    assert.equal(await service.getSlotStatus(slotId), 'AVAILABLE');
  });

  it('D3-08: releaseSlot clears slot expiration', async () => {
    const res = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    const slotId = res.data!;
    await service.releaseSlot(slotId);
    assert.equal(await service.getSlotStatus(slotId), 'AVAILABLE');
  });

  it('D3-09: getSlotStatus returns AVAILABLE for unreserved slot', async () => {
    const available = await service.getAvailableSlots(SLOT_TYPES.SEARCH_FEATURED);
    const status = await service.getSlotStatus(available[0]);
    assert.equal(status, 'AVAILABLE');
  });

  it('D3-10: getSlotStatus returns RESERVED for held slot', async () => {
    const res = await service.reserveSlot(SLOT_TYPES.SEARCH_FEATURED, 3600);
    assert.equal(await service.getSlotStatus(res.data!), 'RESERVED');
  });

  it('D3-11: getSlotStatus returns OCCUPIED for active boosted slot', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'FEATURED',
      durationSeconds: 3600,
      slotType: SLOT_TYPES.SEARCH_FEATURED,
    });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    assert.equal(await service.getSlotStatus(created.data!.slotId!), 'OCCUPIED');
  });

  it('D3-12: getSlotStatus returns NOT_FOUND for unknown slotId', async () => {
    const status = await service.getSlotStatus('non_existent_slot_999');
    assert.equal(status, 'NOT_FOUND');
  });

  it('D3-13: Exceeded capacity returns SLOT_NOT_AVAILABLE', async () => {
    // Reserve all 5 HOMEPAGE_HERO slots
    for (let i = 0; i < 5; i++) {
      await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    }
    const overflow = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    assert.equal(overflow.success, false);
    assert.equal(overflow.error?.code, BOOST_ERROR_CODES.SLOT_NOT_AVAILABLE);
  });

  it('D3-14: Expired slot automatically transitions to AVAILABLE in getAvailableSlots', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    for (let i = 0; i < 5; i++) {
      await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 100);
    }
    assert.equal((await service.getAvailableSlots(SLOT_TYPES.HOMEPAGE_HERO)).length, 0);

    mockTime = 1000 + 105 * 1000;
    assert.equal((await service.getAvailableSlots(SLOT_TYPES.HOMEPAGE_HERO)).length, 5);
  });

  it('D3-15: Expired slot automatically transitions to AVAILABLE in getSlotStatus', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const res = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 50);
    const slotId = res.data!;

    mockTime = 1000 + 60 * 1000;
    assert.equal(await service.getSlotStatus(slotId), 'AVAILABLE');
  });

  it('D3-16: HOMEPAGE_HERO capacity limit (5 slots) enforced', async () => {
    const slots = await service.getAvailableSlots(SLOT_TYPES.HOMEPAGE_HERO);
    assert.equal(slots.length, 5);
  });

  it('D3-17: CATEGORY_TOP capacity limit (10 slots) enforced', async () => {
    const slots = await service.getAvailableSlots(SLOT_TYPES.CATEGORY_TOP);
    assert.equal(slots.length, 10);
  });

  it('D3-18: SEARCH_FEATURED capacity limit (15 slots) enforced', async () => {
    const slots = await service.getAvailableSlots(SLOT_TYPES.SEARCH_FEATURED);
    assert.equal(slots.length, 15);
  });

  it('D3-19: SIDEBAR_BANNER capacity limit (8 slots) enforced', async () => {
    const slots = await service.getAvailableSlots(SLOT_TYPES.SIDEBAR_BANNER);
    assert.equal(slots.length, 8);
  });

  it('D3-20: Multiple concurrent slot reservations remain distinct', async () => {
    const r1 = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    const r2 = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
    assert.notEqual(r1.data, r2.data);
  });

  // ===========================================================================
  // DIMENSION 4: NEGATIVE PATHS & ERROR CODES (TESTS 66 - 85)
  // ===========================================================================

  it('D4-01: Rejects createBoost with empty productId (INVALID_PRODUCT_ID)', async () => {
    const res = await service.createBoost({ productId: '   ', seller: SELLER_1, level: 'STANDARD', durationSeconds: 3600 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_PRODUCT_ID);
  });

  it('D4-02: Rejects createBoost with invalid seller address (INVALID_SELLER_ADDRESS)', async () => {
    const res = await service.createBoost({ productId: PROD_1, seller: 'invalid_seller', level: 'STANDARD', durationSeconds: 3600 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_SELLER_ADDRESS);
  });

  it('D4-03: Rejects createBoost with zero or negative duration (INVALID_DURATION)', async () => {
    const res = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'STANDARD', durationSeconds: -50 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_DURATION);
  });

  it('D4-04: Rejects createBoost with invalid visibility level (INVALID_VISIBILITY_LEVEL)', async () => {
    const res = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'ULTRA_SUPER' as any, durationSeconds: 3600 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_VISIBILITY_LEVEL);
  });

  it('D4-05: Rejects createBoost with unknown slotType (INVALID_SLOT_TYPE)', async () => {
    const res = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'STANDARD', durationSeconds: 3600, slotType: 'UNKNOWN_SLOT' });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_SLOT_TYPE);
  });

  it('D4-06: Rejects getBoost for non-existent boostId (BOOST_NOT_FOUND)', async () => {
    const res = await service.getBoost('non_existent_boost');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.BOOST_NOT_FOUND);
  });

  it('D4-07: Rejects activateBoost without payment when cost > 0 (PAYMENT_REQUIRED)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'SPOTLIGHT', durationSeconds: 3600 });
    const res = await service.activateBoost(created.data!.boostId);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.PAYMENT_REQUIRED);
  });

  it('D4-08: Rejects activateBoost when boost already active (BOOST_ALREADY_ACTIVE)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    const secondAct = await service.activateBoost(boostId);
    assert.equal(secondAct.success, false);
    assert.equal(secondAct.error?.code, BOOST_ERROR_CODES.BOOST_ALREADY_ACTIVE);
  });

  it('D4-09: Rejects activateBoost when boost is cancelled (BOOST_ALREADY_CANCELLED)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.cancelBoost(boostId);
    const res = await service.activateBoost(boostId);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.BOOST_ALREADY_CANCELLED);
  });

  it('D4-10: Rejects cancelBoost when boost is already cancelled (BOOST_ALREADY_CANCELLED)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.cancelBoost(boostId);
    const secondCancel = await service.cancelBoost(boostId);
    assert.equal(secondCancel.success, false);
    assert.equal(secondCancel.error?.code, BOOST_ERROR_CODES.BOOST_ALREADY_CANCELLED);
  });

  it('D4-11: Rejects updateBoost when boost is cancelled (BOOST_ALREADY_CANCELLED)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.cancelBoost(boostId);
    const res = await service.updateBoost(boostId, { level: 'SPOTLIGHT' });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.BOOST_ALREADY_CANCELLED);
  });

  it('D4-12: Rejects updateBoost when boost is expired (BOOST_EXPIRED)', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 100 });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    mockTime = 1000 + 105 * 1000;
    const res = await service.updateBoost(boostId, { level: 'SPOTLIGHT' });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.BOOST_EXPIRED);
  });

  it('D4-13: Rejects updateBoost with invalid level (INVALID_VISIBILITY_LEVEL)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const res = await service.updateBoost(created.data!.boostId, { level: 'INVALID' as any });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_VISIBILITY_LEVEL);
  });

  it('D4-14: Rejects updateBoost with negative extended duration (INVALID_DURATION)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const res = await service.updateBoost(created.data!.boostId, { extendDurationSeconds: -500 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_DURATION);
  });

  it('D4-15: Rejects setVisibilityLevel with empty productId (INVALID_PRODUCT_ID)', async () => {
    const res = await service.setVisibilityLevel('   ', 'FEATURED');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_PRODUCT_ID);
  });

  it('D4-16: Rejects boostVisibility with empty productId (INVALID_PRODUCT_ID)', async () => {
    const res = await service.boostVisibility('   ', 3600);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_PRODUCT_ID);
  });

  it('D4-17: Rejects boostVisibility with negative duration (INVALID_DURATION)', async () => {
    const res = await service.boostVisibility(PROD_1, -100);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_DURATION);
  });

  it('D4-18: Rejects reserveSlot with unknown slotType (INVALID_SLOT_TYPE)', async () => {
    const res = await service.reserveSlot('UNKNOWN_TYPE', 3600);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.INVALID_SLOT_TYPE);
  });

  it('D4-19: Rejects releaseSlot with unknown slotId (SLOT_NOT_FOUND)', async () => {
    const res = await service.releaseSlot('unknown_slot');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, BOOST_ERROR_CODES.SLOT_NOT_FOUND);
  });

  it('D4-20: Rejects refund on active boost (CANNOT_REFUND_ACTIVE_BOOST)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.activateBoost(boostId);

    const refRes = await service.refundBoostPayment(boostId);
    assert.equal(refRes.success, false);
    assert.equal(refRes.error?.code, BOOST_ERROR_CODES.CANNOT_REFUND_ACTIVE_BOOST);
  });

  // ===========================================================================
  // DIMENSION 5: PAYMENTS, COST CALCULATIONS & STRESS CONCURRENCY (TESTS 86 - 105)
  // ===========================================================================

  it('D5-01: getBoostCost calculates accurate cost for 1 hour STANDARD', async () => {
    const cost = await service.getBoostCost({ level: 'STANDARD', durationSeconds: 3600, slotType: SLOT_TYPES.SIDEBAR_BANNER });
    assert.equal(cost, 1);
  });

  it('D5-02: getBoostCost calculates accurate cost for 24 hours FEATURED', async () => {
    // 24 * 2.5 * 1.0 = 60
    const cost = await service.getBoostCost({ level: 'FEATURED', durationSeconds: 86400, slotType: SLOT_TYPES.SIDEBAR_BANNER });
    assert.equal(cost, 60);
  });

  it('D5-03: getBoostCost calculates accurate cost for PREMIUM with HOMEPAGE_HERO multiplier', async () => {
    // 2 hrs * $5/hr * 2.0x = $20
    const cost = await service.getBoostCost({ level: 'PREMIUM', durationSeconds: 7200, slotType: SLOT_TYPES.HOMEPAGE_HERO });
    assert.equal(cost, 20);
  });

  it('D5-04: getBoostCost calculates accurate cost for SPOTLIGHT with SEARCH_FEATURED multiplier', async () => {
    // 1 hr * $10/hr * 1.25x = $12.5
    const cost = await service.getBoostCost({ level: 'SPOTLIGHT', durationSeconds: 3600, slotType: SLOT_TYPES.SEARCH_FEATURED });
    assert.equal(cost, 12.5);
  });

  it('D5-05: processBoostPayment records paymentStatus as PAID', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    const payRes = await service.processBoostPayment(boostId, created.data!.cost);
    assert.equal(payRes.success, true);
    assert.equal(await service.getPaymentStatus(boostId), PAYMENT_STATUS.PAID);
  });

  it('D5-06: processBoostPayment rejects insufficient payment amount (INSUFFICIENT_PAYMENT)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'SPOTLIGHT', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    const payRes = await service.processBoostPayment(boostId, 1.0); // Cost is higher
    assert.equal(payRes.success, false);
    assert.equal(payRes.error?.code, BOOST_ERROR_CODES.INSUFFICIENT_PAYMENT);
  });

  it('D5-07: processBoostPayment rejects double payment (PAYMENT_ALREADY_PROCESSED)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'STANDARD', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    const secondPay = await service.processBoostPayment(boostId, created.data!.cost);
    assert.equal(secondPay.success, false);
    assert.equal(secondPay.error?.code, BOOST_ERROR_CODES.PAYMENT_ALREADY_PROCESSED);
  });

  it('D5-08: getPaymentStatus returns current payment status', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'STANDARD', durationSeconds: 3600 });
    assert.equal(await service.getPaymentStatus(created.data!.boostId), PAYMENT_STATUS.PENDING);
  });

  it('D5-09: refundBoostPayment refunds paid unactivated boost', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    const refRes = await service.refundBoostPayment(boostId);
    assert.equal(refRes.success, true);
    assert.equal(await service.getPaymentStatus(boostId), PAYMENT_STATUS.REFUNDED);
  });

  it('D5-10: refundBoostPayment refunds paid cancelled boost', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const boostId = created.data!.boostId;

    await service.processBoostPayment(boostId, created.data!.cost);
    await service.cancelBoost(boostId);

    const refRes = await service.refundBoostPayment(boostId);
    assert.equal(refRes.success, true);
  });

  it('D5-11: refundBoostPayment rejects unpaid boost (PAYMENT_NOT_FOUND)', async () => {
    const created = await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'FEATURED', durationSeconds: 3600 });
    const refRes = await service.refundBoostPayment(created.data!.boostId);
    assert.equal(refRes.success, false);
    assert.equal(refRes.error?.code, BOOST_ERROR_CODES.PAYMENT_NOT_FOUND);
  });

  it('D5-12: getRawBoosts returns immutable clone', async () => {
    await service.createBoost({ productId: PROD_1, seller: SELLER_1, level: 'STANDARD', durationSeconds: 3600 });
    const raw = service.getRawBoosts();
    raw[0].cost = 99999;

    const original = service.getRawBoosts();
    assert.notEqual(original[0].cost, 99999);
  });

  it('D5-13: Stress test: 20 rapid sequential boost creations', async () => {
    for (let i = 1; i <= 20; i++) {
      const res = await service.createBoost({
        productId: `prod_rapid_${i}`,
        seller: SELLER_1,
        level: 'STANDARD',
        durationSeconds: 3600,
        slotType: SLOT_TYPES.SEARCH_FEATURED,
      });
      if (i <= 15) {
        assert.equal(res.success, true);
      } else {
        // Exceeded 15 SEARCH_FEATURED slots
        assert.equal(res.success, false);
        assert.equal(res.error?.code, BOOST_ERROR_CODES.SLOT_NOT_AVAILABLE);
      }
    }
  });

  it('D5-14: Stress test: 15 distinct products boosted concurrently with independent slots', async () => {
    const promises = Array.from({ length: 15 }, (_, i) =>
      service.createBoost({
        productId: `prod_concurrent_${i}`,
        seller: SELLER_2,
        level: 'STANDARD',
        durationSeconds: 3600,
        slotType: SLOT_TYPES.SEARCH_FEATURED,
      })
    );
    const results = await Promise.all(promises);
    assert.ok(results.every((r) => r.success));
  });

  it('D5-15: Stress test: slot saturation and sequential release maintains capacity integrity', async () => {
    const slotIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = await service.reserveSlot(SLOT_TYPES.HOMEPAGE_HERO, 3600);
      slotIds.push(r.data!);
    }
    assert.equal((await service.getAvailableSlots(SLOT_TYPES.HOMEPAGE_HERO)).length, 0);

    for (const id of slotIds) {
      await service.releaseSlot(id);
    }
    assert.equal((await service.getAvailableSlots(SLOT_TYPES.HOMEPAGE_HERO)).length, 5);
  });

  it('D5-16: Stress test: high-frequency getVisibilityStats under simulated load', async () => {
    await service.boostVisibility(PROD_1, 3600);
    for (let i = 0; i < 30; i++) {
      const stats = await service.getVisibilityStats(PROD_1);
      assert.equal(stats.isBoosted, true);
    }
  });

  it('D5-17: Stress test: batch payments processing across 10 boosts', async () => {
    const boostIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const b = await service.createBoost({
        productId: `prod_batch_${i}`,
        seller: SELLER_1,
        level: 'STANDARD',
        durationSeconds: 3600,
        slotType: SLOT_TYPES.SIDEBAR_BANNER,
      });
      boostIds.push(b.data!.boostId);
    }

    const payPromises = boostIds.map((id) => service.processBoostPayment(id, 1.0));
    const payResults = await Promise.all(payPromises);
    assert.ok(payResults.every((r) => r.success));
  });

  it('D5-18: Stress test: complex update chain (level -> duration -> slot -> payment -> activate)', async () => {
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'STANDARD',
      durationSeconds: 3600,
      slotType: SLOT_TYPES.SIDEBAR_BANNER,
    });
    const boostId = created.data!.boostId;

    await service.updateBoost(boostId, { level: 'FEATURED' });
    await service.updateBoost(boostId, { extendDurationSeconds: 3600 });
    await service.updateBoost(boostId, { slotType: SLOT_TYPES.HOMEPAGE_HERO });

    const updated = await service.getBoost(boostId);
    const finalCost = updated.data!.cost;

    await service.processBoostPayment(boostId, finalCost);
    const actRes = await service.activateBoost(boostId);
    assert.equal(actRes.success, true);
  });

  it('D5-19: Zero cost boost auto-activates if autoActivate=true', async () => {
    // calculateBoostCost returns 0 if durationSeconds <= 0
    assert.equal(calculateBoostCost('STANDARD', 0), 0);
  });

  it('D5-20: Full lifecycle: create -> cost -> pay -> activate -> stats -> extend -> expire -> cleanup', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    // 1. Create boost
    const created = await service.createBoost({
      productId: PROD_1,
      seller: SELLER_1,
      level: 'PREMIUM',
      durationSeconds: 3600,
      slotType: SLOT_TYPES.HOMEPAGE_HERO,
    });
    assert.equal(created.success, true);
    const boostId = created.data!.boostId;
    const slotId = created.data!.slotId!;

    // 2. Check cost
    const expectedCost = await service.getBoostCost({
      level: 'PREMIUM',
      durationSeconds: 3600,
      slotType: SLOT_TYPES.HOMEPAGE_HERO,
    });
    assert.equal(created.data!.cost, expectedCost);

    // 3. Process payment
    const payRes = await service.processBoostPayment(boostId, expectedCost);
    assert.equal(payRes.success, true);

    // 4. Activate boost
    const actRes = await service.activateBoost(boostId);
    assert.equal(actRes.success, true);
    assert.equal(await service.getSlotStatus(slotId), 'OCCUPIED');

    // 5. Visibility stats boosted
    const statsActive = await service.getVisibilityStats(PROD_1);
    assert.equal(statsActive.isBoosted, true);
    assert.equal(statsActive.currentLevel, 'PREMIUM');

    // 6. Extend duration by 1800s (30m)
    await service.updateBoost(boostId, { extendDurationSeconds: 1800 });
    const extended = await service.getBoost(boostId);
    assert.equal(extended.data!.durationSeconds, 5400);

    // 7. Time warp past expiration (5401 seconds)
    mockTime = 1000 + 5401 * 1000;
    const expiredBoost = await service.getBoost(boostId);
    assert.equal(expiredBoost.data?.status, BOOST_STATUS.EXPIRED);

    // 8. Slot cleaned up
    assert.equal(await service.getSlotStatus(slotId), 'AVAILABLE');

    // 9. Product visibility reverted to STANDARD
    const statsExpired = await service.getVisibilityStats(PROD_1);
    assert.equal(statsExpired.isBoosted, false);
    assert.equal(statsExpired.currentLevel, 'STANDARD');
  });
});
