import test from 'node:test';
import assert from 'node:assert/strict';

import { LoyaltyRewardsService } from '../loyalty.service';
import {
  LOYALTY_ERROR_CODES,
  DEFAULT_LEVELS,
  TIME_CONSTANTS,
} from '../constants/loyalty.constants';
import {
  isValidStellarAddress,
  calculateLevelForPoints,
  calculatePurchasePoints,
  calculateRewardDiscount,
  isAnniversaryEligible,
} from '../utils/loyalty.utils';
import type { RewardItem, MilestoneConfig } from '../types/rewards.types';

// Valid Stellar test addresses
const ADMIN_ADDR = 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGAHWKXX2GIOVPWW27DD6C4KZXLOL';
const NEW_ADMIN_ADDR =
  'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
const USER_1 = 'GBZXN7PIRZGNMHGA72ST2EQTVGQDXFCDGUTPO3LWUCUTG4DQEDBUR2ST';
const USER_2 = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37';
const USER_3 = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';

// Sample reward definitions
const SAMPLE_DISCOUNT_VOUCHER: RewardItem = {
  id: 'rew_voucher_10',
  title: '$10 Store Voucher',
  description: '$10 off any purchase over $30',
  type: 'DISCOUNT_VOUCHER',
  pointsCost: 500,
  value: 10,
  minPurchaseAmount: 30,
  stock: 100,
  isActive: true,
};

const SAMPLE_PERCENTAGE_OFF: RewardItem = {
  id: 'rew_pct_15',
  title: '15% Off Cart',
  description: '15% off up to $50 max discount',
  type: 'PERCENTAGE_OFF',
  pointsCost: 1000,
  value: 15, // 15%
  maxDiscount: 50,
  stock: -1, // infinite stock
  isActive: true,
};

// =============================================================================
// DIMENSION 1: REGISTRATION, ACCRUAL, BALANCE & SPENDING (TESTS 1 - 25)
// =============================================================================

test('D1-01: Initializes loyalty contract with valid admin address', async () => {
  const service = new LoyaltyRewardsService();
  const res = await service.initializeLoyaltyContract(ADMIN_ADDR);

  assert.equal(res.success, true);
  assert.equal(res.data, true);
  assert.ok(res.transactionHash);
});

test('D1-02: Registers a new user with Bronze level and 0 initial points', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.registerUser(USER_1);

  assert.equal(res.success, true);
  assert.ok(res.data);
  assert.equal(res.data.user, USER_1);
  assert.equal(res.data.currentLevel, 'Bronze');
  assert.equal(res.data.currentPoints, 0);
  assert.equal(res.data.lifetimePoints, 0);
  assert.equal(res.data.completedMilestones.length, 0);
});

test('D1-03: Records purchase points with default ratio ($100 * 10 = 1000 points)', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.registerUser(USER_1);
  const purchaseRes = await service.recordPurchasePoints(USER_1, 100);

  assert.equal(purchaseRes.success, true);
  assert.equal(purchaseRes.data, 1000);

  const balance = await service.getPointsBalance(USER_1);
  assert.equal(balance, 1000);
});

test('D1-04: getLifetimePoints matches accumulated purchase points', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.recordPurchasePoints(USER_1, 50);

  const lifetime = await service.getLifetimePoints(USER_1);
  assert.equal(lifetime, 500);
});

test('D1-05: addPoints increases both current and lifetime points as manual bonus', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const addRes = await service.addPoints(USER_1, 250, 'Welcome bonus');
  assert.equal(addRes.success, true);
  assert.equal(addRes.data, 250);

  assert.equal(await service.getPointsBalance(USER_1), 250);
  assert.equal(await service.getLifetimePoints(USER_1), 250);
});

test('D1-06: Lazy user registration creates profile automatically upon first purchase', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const purchaseRes = await service.recordPurchasePoints(USER_2, 20);

  assert.equal(purchaseRes.success, true);
  assert.equal(await service.getPointsBalance(USER_2), 200);

  const profile = service.getUserProfile(USER_2);
  assert.ok(profile);
  assert.equal(profile.user, USER_2);
});

test('D1-07: Creates a reward item in the catalog successfully', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.createReward(SAMPLE_DISCOUNT_VOUCHER);

  assert.equal(res.success, true);
  assert.equal(res.data, SAMPLE_DISCOUNT_VOUCHER.id);

  const rewards = await service.getAvailableRewards();
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].id, SAMPLE_DISCOUNT_VOUCHER.id);
});

test('D1-08: Redeems reward, deducts points from balance, and generates voucher code', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'Initial points');
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER);

  const redeemRes = await service.redeemReward(
    USER_1,
    SAMPLE_DISCOUNT_VOUCHER.id,
    50
  );
  assert.equal(redeemRes.success, true);
  assert.ok(redeemRes.data);
  assert.equal(redeemRes.data.pointsDeducted, 500);
  assert.equal(redeemRes.data.remainingPoints, 500);
  assert.equal(redeemRes.data.discountApplied, 10);
  assert.ok(redeemRes.data.voucherCode.startsWith('STAR-'));

  assert.equal(await service.getPointsBalance(USER_1), 500);
});

test('D1-09: Lifetime points remain intact after points are spent on redemptions', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'Credits');
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER);

  await service.redeemReward(USER_1, SAMPLE_DISCOUNT_VOUCHER.id, 40);

  // Available points decreased, but lifetime points preserved
  assert.equal(await service.getPointsBalance(USER_1), 500);
  assert.equal(await service.getLifetimePoints(USER_1), 1000);
});

test('D1-10: Multiple purchases append distinct transactions to user history ledger', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  await service.recordPurchasePoints(USER_1, 10, 'prod_1', 'Electronics');
  await service.recordPurchasePoints(USER_1, 20, 'prod_2', 'Books');

  const history = service.getTransactionHistory(USER_1);
  assert.equal(history.length, 2);
  assert.equal(history[0].type, 'PURCHASE');
  assert.equal(history[1].type, 'PURCHASE');
  assert.notEqual(history[0].txHash, history[1].txHash);
});

test('D1-11: Updates contract admin address successfully', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.updateAdmin(NEW_ADMIN_ADDR);

  assert.equal(res.success, true);
  assert.equal(res.data, true);
});

test('D1-12: Configures points expiry duration in days', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.setPointsExpiry(180);

  assert.equal(res.success, true);
  assert.equal(res.data, true);
});

test('D1-13: Configures max redemption percentage constraint', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.setMaxRedemptionPercentage(40);

  assert.equal(res.success, true);
  assert.equal(res.data, true);
});

test('D1-14: Configures points ratio multiplier', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.setPointsRatio(20); // 20 points per USD

  assert.equal(res.success, true);
  await service.recordPurchasePoints(USER_1, 10);
  assert.equal(await service.getPointsBalance(USER_1), 200);
});

test('D1-15: Resets all internal state cleanly', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  service.reset();

  assert.equal(await service.getPointsBalance(USER_1), 0);
  assert.equal(service.getUserProfile(USER_1), null);
});

// =============================================================================
// DIMENSION 2: LEVEL TRANSITIONS & ANNIVERSARY BONUS (TESTS 26 - 50)
// =============================================================================

test('D2-01: User starts at Bronze tier with 0 points', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  assert.equal(await service.getUserLevel(USER_1), 'Bronze');
});

test('D2-02: Transitions Bronze -> Silver at 1000 lifetime points', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  // Purchase $100 -> 1000 points
  await service.recordPurchasePoints(USER_1, 100);

  assert.equal(await service.getUserLevel(USER_1), 'Silver');
});

test('D2-03: Silver tier receives 15% points boost on subsequent purchases', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  // Cross into Silver (1000 points)
  await service.recordPurchasePoints(USER_1, 100);
  assert.equal(await service.getUserLevel(USER_1), 'Silver');

  // Next $100 purchase gets Silver 1.15x boost: 100 * 10 * 1.15 = 1150 points
  const p2 = await service.recordPurchasePoints(USER_1, 100);
  assert.equal(p2.data, 1150);
  assert.equal(await service.getPointsBalance(USER_1), 2150);
});

test('D2-04: Transitions Silver -> Gold at 5000 lifetime points', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  await service.addPoints(USER_1, 5000, 'Gold boost');
  assert.equal(await service.getUserLevel(USER_1), 'Gold');
});

test('D2-05: Gold tier receives 30% points boost on purchases', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 5000, 'Level up');

  // $100 purchase: 100 * 10 * 1.30 = 1300 points
  const p = await service.recordPurchasePoints(USER_1, 100);
  assert.equal(p.data, 1300);
});

test('D2-06: Transitions Gold -> Platinum at 15000 lifetime points', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  await service.addPoints(USER_1, 15000, 'Platinum tier');
  assert.equal(await service.getUserLevel(USER_1), 'Platinum');
});

test('D2-07: Platinum tier receives 50% points boost on purchases', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 15000, 'Max tier');

  // $100 purchase: 100 * 10 * 1.50 = 1500 points
  const p = await service.recordPurchasePoints(USER_1, 100);
  assert.equal(p.data, 1500);
});

test('D2-08: initLevelRequirements allows configuring custom tiers', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const customLevels = [
    {
      level: 'Bronze' as const,
      minPoints: 0,
      multiplier: 1.0,
      discountPercentage: 0,
    },
    {
      level: 'Silver' as const,
      minPoints: 500,
      multiplier: 1.2,
      discountPercentage: 5,
    },
  ];

  await service.initLevelRequirements(customLevels);
  await service.addPoints(USER_1, 600, 'Custom points');

  assert.equal(await service.getUserLevel(USER_1), 'Silver');
});

test('D2-09: Rejects anniversary bonus if account age is under 365 days', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.registerUser(USER_1);

  // Only 100 days elapsed
  currentTime += 100 * TIME_CONSTANTS.SECONDS_IN_DAY;

  const res = await service.awardAnniversaryBonus(USER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.ANNIVERSARY_NOT_REACHED);
});

test('D2-10: Awards anniversary bonus (+500 points) after 365 days', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.registerUser(USER_1);

  // Advance 366 days
  currentTime += 366 * TIME_CONSTANTS.SECONDS_IN_DAY;

  const res = await service.awardAnniversaryBonus(USER_1);
  assert.equal(res.success, true);
  assert.equal(res.data, 500);
  assert.equal(await service.getPointsBalance(USER_1), 500);
});

test('D2-11: Prevents claiming anniversary bonus twice within the same year', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.registerUser(USER_1);
  currentTime += 366 * TIME_CONSTANTS.SECONDS_IN_DAY;

  await service.awardAnniversaryBonus(USER_1);

  // Attempt duplicate claim in year 1
  currentTime += 10 * TIME_CONSTANTS.SECONDS_IN_DAY;
  const dupRes = await service.awardAnniversaryBonus(USER_1);

  assert.equal(dupRes.success, false);
  assert.equal(
    dupRes.errorCode,
    LOYALTY_ERROR_CODES.ANNIVERSARY_ALREADY_CLAIMED
  );
});

test('D2-12: Permits second anniversary bonus after year 2 (730+ days)', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.registerUser(USER_1);
  currentTime += 366 * TIME_CONSTANTS.SECONDS_IN_DAY;
  await service.awardAnniversaryBonus(USER_1);

  // Advance to Year 2
  currentTime += 365 * TIME_CONSTANTS.SECONDS_IN_DAY;
  const y2Res = await service.awardAnniversaryBonus(USER_1);

  assert.equal(y2Res.success, true);
  assert.equal(y2Res.data, 500);
  assert.equal(await service.getPointsBalance(USER_1), 1000);
});

// =============================================================================
// DIMENSION 3: REDEMPTION BOUNDARIES & LIMITS (TESTS 51 - 75)
// =============================================================================

test('D3-01: calculateDiscount accurately calculates percentage off rewards', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.createReward(SAMPLE_PERCENTAGE_OFF);

  // 15% off $200 = $30
  const disc1 = await service.calculateDiscount(SAMPLE_PERCENTAGE_OFF.id, 200);
  assert.equal(disc1, 30);

  // 15% off $500 = $75, capped at maxDiscount ($50)
  const disc2 = await service.calculateDiscount(SAMPLE_PERCENTAGE_OFF.id, 500);
  assert.equal(disc2, 50);
});

test('D3-02: calculateDiscount enforces minPurchaseAmount requirement', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER); // minPurchaseAmount: 30

  // Below minimum -> 0 discount
  assert.equal(
    await service.calculateDiscount(SAMPLE_DISCOUNT_VOUCHER.id, 20),
    0
  );

  // At or above minimum -> $10 discount
  assert.equal(
    await service.calculateDiscount(SAMPLE_DISCOUNT_VOUCHER.id, 30),
    10
  );
});

test('D3-03: Rejects redemption when purchase amount is below reward minPurchaseAmount', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'balance');
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER);

  const res = await service.redeemReward(
    USER_1,
    SAMPLE_DISCOUNT_VOUCHER.id,
    25
  ); // min is 30
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.PURCHASE_AMOUNT_TOO_LOW);
});

test('D3-04: Enforces maxRedemptionPercentage constraint on checkout discount', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'balance');
  await service.setMaxRedemptionPercentage(20); // max 20% discount on purchase

  // Reward gives $10 flat discount. On a $30 purchase, $10 is 33.3%, which exceeds 20% limit ($6 max)!
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER);

  const res = await service.redeemReward(
    USER_1,
    SAMPLE_DISCOUNT_VOUCHER.id,
    30
  );
  assert.equal(res.success, false);
  assert.equal(
    res.errorCode,
    LOYALTY_ERROR_CODES.REDEMPTION_PERCENTAGE_EXCEEDED
  );
});

test('D3-05: Redeeming reward with stock decrements available stock', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'balance');

  const stockReward: RewardItem = {
    ...SAMPLE_DISCOUNT_VOUCHER,
    id: 'rew_limited_stock',
    stock: 2,
  };
  await service.createReward(stockReward);

  await service.redeemReward(USER_1, 'rew_limited_stock', 50);
  const rewards = await service.getAvailableRewards();
  assert.equal(rewards.find(r => r.id === 'rew_limited_stock')?.stock, 1);
});

test('D3-06: Out of stock reward is rejected with REWARD_OUT_OF_STOCK', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 2000, 'balance');

  const limitedReward: RewardItem = {
    ...SAMPLE_DISCOUNT_VOUCHER,
    id: 'rew_one_stock',
    stock: 1,
  };
  await service.createReward(limitedReward);

  // Claim the 1 available
  await service.redeemReward(USER_1, 'rew_one_stock', 50);

  // Second claim must fail
  const failRes = await service.redeemReward(USER_1, 'rew_one_stock', 50);
  assert.equal(failRes.success, false);
  assert.equal(failRes.errorCode, LOYALTY_ERROR_CODES.REWARD_OUT_OF_STOCK);
});

test('D3-07: User spends exactly full points balance down to zero', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 500, 'exact');
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER); // cost 500

  const res = await service.redeemReward(
    USER_1,
    SAMPLE_DISCOUNT_VOUCHER.id,
    50
  );
  assert.equal(res.success, true);
  assert.equal(await service.getPointsBalance(USER_1), 0);
});

// =============================================================================
// DIMENSION 4: NEGATIVE CHECKS & ANTI-ABUSE (TESTS 76 - 95)
// =============================================================================

test('D4-01: Rejects updating admin when contract is not initialized', async () => {
  const service = new LoyaltyRewardsService(); // uninitialized
  const res = await service.updateAdmin(ADMIN_ADDR);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.NOT_INITIALIZED);
});

test('D4-02: Rejects initialization with invalid Stellar address', async () => {
  const service = new LoyaltyRewardsService();
  const res = await service.initializeLoyaltyContract('INVALID_STELLAR_KEY');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-03: Rejects double initialization of loyalty contract', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.initializeLoyaltyContract(ADMIN_ADDR);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.ALREADY_INITIALIZED);
});

test('D4-04: Rejects duplicate user registration', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const res = await service.registerUser(USER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.USER_ALREADY_REGISTERED);
});

test('D4-05: Rejects recordPurchasePoints with negative or zero amount', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const r1 = await service.recordPurchasePoints(USER_1, 0);
  assert.equal(r1.success, false);
  assert.equal(r1.errorCode, LOYALTY_ERROR_CODES.INVALID_PARAMETERS);

  const r2 = await service.recordPurchasePoints(USER_1, -50);
  assert.equal(r2.success, false);
  assert.equal(r2.errorCode, LOYALTY_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-06: Rejects addPoints with negative or zero amount', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const r1 = await service.addPoints(USER_1, 0, 'none');
  assert.equal(r1.success, false);
  assert.equal(r1.errorCode, LOYALTY_ERROR_CODES.INVALID_POINTS_AMOUNT);

  const r2 = await service.addPoints(USER_1, -100, 'neg');
  assert.equal(r2.success, false);
  assert.equal(r2.errorCode, LOYALTY_ERROR_CODES.INVALID_POINTS_AMOUNT);
});

test('D4-07: Rejects redemption when user points balance is insufficient', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 100, 'too low'); // reward costs 500
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER);

  const res = await service.redeemReward(
    USER_1,
    SAMPLE_DISCOUNT_VOUCHER.id,
    50
  );
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INSUFFICIENT_POINTS);
});

test('D4-08: Rejects redemption on inactive reward', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'balance');

  const inactiveReward: RewardItem = {
    ...SAMPLE_DISCOUNT_VOUCHER,
    id: 'rew_inactive',
    isActive: false,
  };
  await service.createReward(inactiveReward);

  const res = await service.redeemReward(USER_1, 'rew_inactive', 50);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.REWARD_INACTIVE);
});

test('D4-09: Rejects redemption for non-existent rewardId', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'balance');

  const res = await service.redeemReward(USER_1, 'non_existent_reward_id', 50);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.REWARD_NOT_FOUND);
});

test('D4-10: Points expire automatically when pointsExpiryDays threshold is passed', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.setPointsExpiry(30); // 30 days expiry
  await service.registerUser(USER_1);
  await service.recordPurchasePoints(USER_1, 100); // 1000 points earned

  assert.equal(await service.getPointsBalance(USER_1), 1000);

  // Advance time past 30 days
  currentTime += 31 * TIME_CONSTANTS.SECONDS_IN_DAY;

  // Balance should now reflect expired points
  assert.equal(await service.getPointsBalance(USER_1), 0);

  // But lifetime points are retained for status levels!
  assert.equal(await service.getLifetimePoints(USER_1), 1000);
});

test('D4-11: Points do not expire when pointsExpiryDays is set to 0', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.setPointsExpiry(0); // 0 = never expire
  await service.registerUser(USER_1);
  await service.recordPurchasePoints(USER_1, 100);

  // Advance 5 years
  currentTime += 5 * 365 * TIME_CONSTANTS.SECONDS_IN_DAY;

  assert.equal(await service.getPointsBalance(USER_1), 1000);
});

// =============================================================================
// DIMENSION 5: MILESTONES, CONCURRENCY & LEDGER AUDIT (TESTS 96 - 115+)
// =============================================================================

test('D5-01: Creates milestone achievement definition', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const milestone: MilestoneConfig = {
    id: 'ms_first_purchase',
    title: 'First Purchase',
    description: 'Complete your first purchase on StarShop',
    metric: 'PURCHASES_COUNT',
    threshold: 1,
    bonusPoints: 100,
    isActive: true,
  };

  const res = await service.createMilestone(milestone);
  assert.equal(res.success, true);
  assert.equal(res.data, milestone.id);
});

test('D5-02: Completing milestone awards bonus points and updates profile', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const milestone: MilestoneConfig = {
    id: 'ms_5_purchases',
    title: 'High Roller',
    description: 'Make 5 purchases',
    metric: 'PURCHASES_COUNT',
    threshold: 5,
    bonusPoints: 300,
    isActive: true,
  };
  await service.createMilestone(milestone);

  // Record 5 purchases
  for (let i = 0; i < 5; i++) {
    await service.recordPurchasePoints(USER_1, 10);
  }

  const completeRes = await service.completeMilestone(USER_1, 'ms_5_purchases');
  assert.equal(completeRes.success, true);

  const profile = service.getUserProfile(USER_1)!;
  assert.ok(profile.completedMilestones.includes('ms_5_purchases'));
});

test('D5-03: Rejects milestone completion if criteria threshold is not met', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const milestone: MilestoneConfig = {
    id: 'ms_10_purchases',
    title: 'Super Shopper',
    description: 'Make 10 purchases',
    metric: 'PURCHASES_COUNT',
    threshold: 10,
    bonusPoints: 500,
    isActive: true,
  };
  await service.createMilestone(milestone);

  // Only 2 purchases
  await service.recordPurchasePoints(USER_1, 10);
  await service.recordPurchasePoints(USER_1, 10);

  const res = await service.completeMilestone(USER_1, 'ms_10_purchases');
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.MILESTONE_CONDITION_NOT_MET);
});

test('D5-04: Prevents completing the same milestone twice', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const milestone: MilestoneConfig = {
    id: 'ms_quick',
    title: 'Quick buy',
    description: '',
    metric: 'PURCHASES_COUNT',
    threshold: 1,
    bonusPoints: 50,
    isActive: true,
  };
  await service.createMilestone(milestone);
  await service.recordPurchasePoints(USER_1, 10);

  await service.completeMilestone(USER_1, 'ms_quick');

  const dupRes = await service.completeMilestone(USER_1, 'ms_quick');
  assert.equal(dupRes.success, false);
  assert.equal(
    dupRes.errorCode,
    LOYALTY_ERROR_CODES.MILESTONE_ALREADY_COMPLETED
  );
});

test('D5-05: checkAndCompleteMilestones automatically unlocks all eligible milestones', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  await service.createMilestone({
    id: 'ms_a',
    title: 'Tier 1',
    description: '',
    metric: 'LIFETIME_POINTS',
    threshold: 100,
    bonusPoints: 50,
    isActive: true,
  });

  await service.createMilestone({
    id: 'ms_b',
    title: 'Tier 2',
    description: '',
    metric: 'LIFETIME_POINTS',
    threshold: 500,
    bonusPoints: 100,
    isActive: true,
  });

  // Purchase giving 1000 points
  await service.recordPurchasePoints(USER_1, 100);

  const autoRes = await service.checkAndCompleteMilestones(USER_1);
  assert.equal(autoRes.success, true);
  // Both ms_a and ms_b should have been completed
  const profile = service.getUserProfile(USER_1)!;
  assert.ok(profile.completedMilestones.includes('ms_a'));
  assert.ok(profile.completedMilestones.includes('ms_b'));
});

test('D5-06: Validates Stellar public keys and addresses with regex utility', () => {
  assert.equal(isValidStellarAddress(ADMIN_ADDR), true);
  assert.equal(isValidStellarAddress(USER_1), true);
  assert.equal(
    isValidStellarAddress(
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
    ),
    true
  );
  assert.equal(
    isValidStellarAddress('0x1234567890abcdef1234567890abcdef12345678'),
    true
  );
  assert.equal(isValidStellarAddress(''), false);
  assert.equal(isValidStellarAddress('invalid'), false);
});

test('D5-07: Concurrent purchases execute atomically without ledger corruption', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  // 10 parallel purchases
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(service.recordPurchasePoints(USER_1, 10)); // 100 pts each
  }
  await Promise.all(promises);

  assert.equal(await service.getPointsBalance(USER_1), 1000);
  assert.equal(service.getTransactionHistory(USER_1).length, 10);
});

test('D5-08: Sequential operations across 20 transactions maintain exact running balance', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  let expectedBalance = 0;

  // 15 adds of 100
  for (let i = 0; i < 15; i++) {
    await service.addPoints(USER_1, 100, `add_${i}`);
    expectedBalance += 100;
  }
  assert.equal(await service.getPointsBalance(USER_1), expectedBalance);

  // 5 redemptions of 200
  const cheapReward: RewardItem = {
    id: 'rew_small',
    title: 'Small',
    description: '',
    type: 'DISCOUNT_VOUCHER',
    pointsCost: 200,
    value: 5,
    stock: -1,
    isActive: true,
  };
  await service.createReward(cheapReward);

  for (let i = 0; i < 5; i++) {
    await service.redeemReward(USER_1, 'rew_small', 20);
    expectedBalance -= 200;
  }

  assert.equal(await service.getPointsBalance(USER_1), expectedBalance);
  assert.equal(service.getTransactionHistory(USER_1).length, 20);
});

// =============================================================================
// EXPANDED 5D-MATRIX COVERAGE (TESTS 54 - 108+)
// =============================================================================

test('D1-16: registerUser records joinedAt timestamp accurately', async () => {
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => 1700000000,
  });

  const res = await service.registerUser(USER_3);
  assert.equal(res.success, true);
  assert.equal(res.data?.joinedAt, 1700000000);
});

test('D1-17: getUserProfile returns null for unregistered user', () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  assert.equal(service.getUserProfile(USER_3), null);
});

test('D1-18: getUserProfile returns complete profile copy', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const profile = service.getUserProfile(USER_1);
  assert.ok(profile);
  assert.equal(profile.user, USER_1);
  assert.equal(profile.currentLevel, 'Bronze');
});

test('D1-19: getPointsBalance returns 0 for non-existent user', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  assert.equal(
    await service.getPointsBalance(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    ),
    0
  );
});

test('D1-20: getLifetimePoints returns 0 for non-existent user', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  assert.equal(
    await service.getLifetimePoints(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    ),
    0
  );
});

test('D1-21: recordPurchasePoints returns unique txHash for each purchase', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const p1 = await service.recordPurchasePoints(USER_1, 10);
  const p2 = await service.recordPurchasePoints(USER_1, 10);

  assert.notEqual(p1.transactionHash, p2.transactionHash);
  assert.ok(p1.transactionHash?.startsWith('0x'));
});

test('D1-22: addPoints with custom description records description in transaction ledger', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 100, 'Custom Promotion Gift');

  const history = service.getTransactionHistory(USER_1);
  assert.equal(history[0].description, 'Custom Promotion Gift');
});

test('D1-23: addPoints increments both current and lifetime points for registered users', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 300, 'Bonus');

  assert.equal(await service.getPointsBalance(USER_1), 300);
  assert.equal(await service.getLifetimePoints(USER_1), 300);
});

test('D1-24: setPointsRatio rejects negative or 0 ratio', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });

  const r1 = await service.setPointsRatio(0);
  assert.equal(r1.success, false);

  const r2 = await service.setPointsRatio(-5);
  assert.equal(r2.success, false);
});

test('D1-25: setMaxRedemptionPercentage rejects values < 0 or > 100', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });

  const r1 = await service.setMaxRedemptionPercentage(-1);
  assert.equal(r1.success, false);

  const r2 = await service.setMaxRedemptionPercentage(101);
  assert.equal(r2.success, false);
});

test('D2-13: awardAnniversaryBonus rejects unregistered user', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.awardAnniversaryBonus(USER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.USER_NOT_FOUND);
});

test('D2-14: awardAnniversaryBonus records ANNIVERSARY transaction in ledger', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.registerUser(USER_1);
  currentTime += 366 * TIME_CONSTANTS.SECONDS_IN_DAY;

  await service.awardAnniversaryBonus(USER_1);
  const history = service.getTransactionHistory(USER_1);

  assert.equal(
    history.some(tx => tx.type === 'ANNIVERSARY'),
    true
  );
});

test('D2-15: checkAndUpdateLevel detects no upgrade when points within same tier', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 100, 'few points');

  const res = await service.checkAndUpdateLevel(USER_1);
  assert.equal(res.data?.hasUpgraded, false);
  assert.equal(res.data?.newLevel, 'Bronze');
});

test('D2-16: getUserLevel returns Bronze for unregistered user', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  assert.equal(await service.getUserLevel(USER_3), 'Bronze');
});

test('D2-17: Transition straight from Bronze to Platinum with single large purchase ($1500)', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  // $1500 * 10 = 15000 points (Platinum threshold)
  await service.recordPurchasePoints(USER_1, 1500);

  assert.equal(await service.getUserLevel(USER_1), 'Platinum');
});

test('D2-18: Multiple level thresholds custom configuration: 5 custom tiers', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const customTiers = [
    {
      level: 'Bronze' as const,
      minPoints: 0,
      multiplier: 1.0,
      discountPercentage: 0,
    },
    {
      level: 'Silver' as const,
      minPoints: 200,
      multiplier: 1.1,
      discountPercentage: 3,
    },
    {
      level: 'Gold' as const,
      minPoints: 400,
      multiplier: 1.25,
      discountPercentage: 7,
    },
    {
      level: 'Platinum' as const,
      minPoints: 800,
      multiplier: 1.4,
      discountPercentage: 12,
    },
  ];

  await service.initLevelRequirements(customTiers);
  await service.addPoints(USER_1, 450, 'boost');

  assert.equal(await service.getUserLevel(USER_1), 'Gold');
});

test('D2-19: calculateLevelForPoints handles exact threshold boundaries', () => {
  assert.equal(calculateLevelForPoints(0).level, 'Bronze');
  assert.equal(calculateLevelForPoints(999).level, 'Bronze');
  assert.equal(calculateLevelForPoints(1000).level, 'Silver');
  assert.equal(calculateLevelForPoints(4999).level, 'Silver');
  assert.equal(calculateLevelForPoints(5000).level, 'Gold');
  assert.equal(calculateLevelForPoints(14999).level, 'Gold');
  assert.equal(calculateLevelForPoints(15000).level, 'Platinum');
});

test('D2-20: calculatePurchasePoints returns 0 for 0 or negative amount', () => {
  assert.equal(calculatePurchasePoints(0), 0);
  assert.equal(calculatePurchasePoints(-10), 0);
});

test('D2-21: calculatePurchasePoints applies floor to fractional points', () => {
  // $10.55 * 10 * 1.15 = 121.325 -> 121
  assert.equal(calculatePurchasePoints(10.55, 10, 1.15), 121);
});

test('D2-22: isAnniversaryEligible returns eligible: false for 0 days elapsed', () => {
  const res = isAnniversaryEligible(1000000, 1000000);
  assert.equal(res.eligible, false);
  assert.equal(res.currentYear, 0);
});

test('D2-23: isAnniversaryEligible returns eligible: true for 365 days elapsed', () => {
  const joined = 1000000;
  const now = joined + 365 * 86400;
  const res = isAnniversaryEligible(joined, now);
  assert.equal(res.eligible, true);
  assert.equal(res.currentYear, 1);
});

test('D2-24: isAnniversaryEligible returns eligible: false if already claimed for year 1', () => {
  const joined = 1000000;
  const now = joined + 365 * 86400;
  const res = isAnniversaryEligible(joined, now, 1);
  assert.equal(res.eligible, false);
});

test('D3-08: Redeem voucher with exactly minPurchaseAmount succeeds', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'balance');
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER); // minPurchaseAmount: 30

  const res = await service.redeemReward(
    USER_1,
    SAMPLE_DISCOUNT_VOUCHER.id,
    30
  );
  assert.equal(res.success, true);
});

test('D3-09: Redeem reward with unlimited stock (-1) can be redeemed multiple times', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 5000, 'balance');
  await service.createReward(SAMPLE_PERCENTAGE_OFF); // stock: -1

  const r1 = await service.redeemReward(USER_1, SAMPLE_PERCENTAGE_OFF.id, 100);
  const r2 = await service.redeemReward(USER_1, SAMPLE_PERCENTAGE_OFF.id, 100);

  assert.equal(r1.success, true);
  assert.equal(r2.success, true);
});

test('D3-10: Max redemption percentage constraint: 50% limit allows exactly 50% discount', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 1000, 'balance');

  const reward50: RewardItem = {
    id: 'rew_50',
    title: '$50 Off',
    description: '',
    type: 'DISCOUNT_VOUCHER',
    pointsCost: 500,
    value: 50,
    stock: -1,
    isActive: true,
  };
  await service.createReward(reward50);

  // $100 purchase with $50 discount = exactly 50%
  const res = await service.redeemReward(USER_1, 'rew_50', 100);
  assert.equal(res.success, true);
});

test('D3-11: Zero purchase amount with percentage off returns 0 discount', () => {
  assert.equal(calculateRewardDiscount(SAMPLE_PERCENTAGE_OFF, 0), 0);
});

test('D3-12: Flat shipping discount voucher applies flat fee waiver', () => {
  const shipReward: RewardItem = {
    id: 'rew_ship',
    title: 'Free Shipping',
    description: '',
    type: 'FREE_SHIPPING',
    pointsCost: 200,
    value: 15, // $15 shipping fee waived
    stock: 10,
    isActive: true,
  };

  assert.equal(calculateRewardDiscount(shipReward, 50), 15);
});

test('D3-13: Physical item reward gives fixed retail discount value', () => {
  const merchReward: RewardItem = {
    id: 'rew_merch',
    title: 'T-Shirt',
    description: '',
    type: 'PHYSICAL_ITEM',
    pointsCost: 300,
    value: 25,
    stock: 5,
    isActive: true,
  };

  assert.equal(calculateRewardDiscount(merchReward, 50), 25);
});

test('D3-14: Reward discount cannot exceed total purchase amount (capped at purchaseAmount)', () => {
  const bigVoucher: RewardItem = {
    id: 'rew_big',
    title: '$100 voucher',
    description: '',
    type: 'DISCOUNT_VOUCHER',
    pointsCost: 1000,
    value: 100,
    stock: -1,
    isActive: true,
  };

  // On a $40 purchase, maximum possible discount is $40
  assert.equal(calculateRewardDiscount(bigVoucher, 40), 40);
});

test('D3-15: Multiple sequential redemptions deplete limited stock correctly to 0', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 5000, 'balance');

  const stock2: RewardItem = {
    id: 'rew_two',
    title: 'Stock of 2',
    description: '',
    type: 'DISCOUNT_VOUCHER',
    pointsCost: 100,
    value: 5,
    stock: 2,
    isActive: true,
  };
  await service.createReward(stock2);

  await service.redeemReward(USER_1, 'rew_two', 50);
  await service.redeemReward(USER_1, 'rew_two', 50);

  const fail = await service.redeemReward(USER_1, 'rew_two', 50);
  assert.equal(fail.success, false);
  assert.equal(fail.errorCode, LOYALTY_ERROR_CODES.REWARD_OUT_OF_STOCK);
});

test('D4-12: Rejects updateAdmin with empty string', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.updateAdmin('');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-13: Rejects updateAdmin with invalid address format', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.updateAdmin('NOT_A_KEY');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-14: Rejects registerUser with empty string', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.registerUser('');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-15: Rejects recordPurchasePoints with NaN amount', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const res = await service.recordPurchasePoints(USER_1, NaN);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-16: Rejects addPoints with NaN amount', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const res = await service.addPoints(USER_1, NaN, 'err');
  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_POINTS_AMOUNT);
});

test('D4-17: Rejects createReward with negative pointsCost', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.createReward({
    ...SAMPLE_DISCOUNT_VOUCHER,
    pointsCost: -100,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_REWARD_CONFIG);
});

test('D4-18: Rejects createReward with zero value', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.createReward({
    ...SAMPLE_DISCOUNT_VOUCHER,
    value: 0,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_REWARD_CONFIG);
});

test('D4-19: Rejects createMilestone with 0 threshold', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.createMilestone({
    id: 'ms_zero',
    title: 'Zero',
    description: '',
    metric: 'PURCHASES_COUNT',
    threshold: 0,
    bonusPoints: 100,
    isActive: true,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-20: Rejects createMilestone with negative bonusPoints', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.createMilestone({
    id: 'ms_neg',
    title: 'Neg',
    description: '',
    metric: 'PURCHASES_COUNT',
    threshold: 5,
    bonusPoints: -100,
    isActive: true,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-21: Rejects setPointsExpiry with negative days', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const res = await service.setPointsExpiry(-10);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.INVALID_PARAMETERS);
});

test('D5-09: Complete milestone with DAYS_ACTIVE condition', async () => {
  let currentTime = 1000000;
  const service = new LoyaltyRewardsService({
    initialAdmin: ADMIN_ADDR,
    nowProvider: () => currentTime,
  });

  await service.registerUser(USER_1);

  await service.createMilestone({
    id: 'ms_days',
    title: 'Veteran',
    description: 'Active for 100 days',
    metric: 'DAYS_ACTIVE',
    threshold: 100,
    bonusPoints: 200,
    isActive: true,
  });

  // Advance 101 days
  currentTime += 101 * TIME_CONSTANTS.SECONDS_IN_DAY;

  const res = await service.completeMilestone(USER_1, 'ms_days');
  assert.equal(res.success, true);
});

test('D5-10: Complete milestone with LIFETIME_POINTS condition', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  await service.createMilestone({
    id: 'ms_pts',
    title: 'Point Master',
    description: 'Earn 1000 lifetime points',
    metric: 'LIFETIME_POINTS',
    threshold: 1000,
    bonusPoints: 150,
    isActive: true,
  });

  await service.addPoints(USER_1, 1000, 'boost');
  const res = await service.completeMilestone(USER_1, 'ms_pts');
  assert.equal(res.success, true);
});

test('D5-11: Milestone with 0 bonus points completes successfully without modifying points', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  await service.createMilestone({
    id: 'ms_badge',
    title: 'Badge Only',
    description: '',
    metric: 'PURCHASES_COUNT',
    threshold: 1,
    bonusPoints: 0,
    isActive: true,
  });

  await service.recordPurchasePoints(USER_1, 10);
  const res = await service.completeMilestone(USER_1, 'ms_badge');

  assert.equal(res.success, true);
  const profile = service.getUserProfile(USER_1)!;
  assert.ok(profile.completedMilestones.includes('ms_badge'));
});

test('D5-12: Inactive milestone cannot be completed', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  await service.createMilestone({
    id: 'ms_dormant',
    title: 'Dormant',
    description: '',
    metric: 'PURCHASES_COUNT',
    threshold: 1,
    bonusPoints: 100,
    isActive: false, // inactive
  });

  await service.recordPurchasePoints(USER_1, 10);
  const res = await service.completeMilestone(USER_1, 'ms_dormant');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, LOYALTY_ERROR_CODES.MILESTONE_NOT_FOUND);
});

test('D5-13: checkAndCompleteMilestones returns empty array when no milestones are eligible', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);

  const res = await service.checkAndCompleteMilestones(USER_1);
  assert.equal(res.success, true);
  assert.equal(res.data?.length, 0);
});

test('D5-14: getAvailableRewards excludes inactive rewards from catalog', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.createReward({
    ...SAMPLE_DISCOUNT_VOUCHER,
    id: 'r1',
    isActive: false,
  });
  await service.createReward({
    ...SAMPLE_DISCOUNT_VOUCHER,
    id: 'r2',
    isActive: true,
  });

  const list = await service.getAvailableRewards();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 'r2');
});

test('D5-15: getAvailableRewards excludes zero stock rewards from catalog', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.createReward({
    ...SAMPLE_DISCOUNT_VOUCHER,
    id: 'r_empty',
    stock: 0,
    isActive: true,
  });
  await service.createReward({
    ...SAMPLE_DISCOUNT_VOUCHER,
    id: 'r_stocked',
    stock: 10,
    isActive: true,
  });

  const list = await service.getAvailableRewards();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 'r_stocked');
});

test('D5-16: getTransactionHistory returns immutable copy', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 100, 'test');

  const history = service.getTransactionHistory(USER_1);
  history.pop(); // mutates local array

  assert.equal(service.getTransactionHistory(USER_1).length, 1);
});

test('D5-17: Voucher codes generated on consecutive redemptions are distinct', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.addPoints(USER_1, 2000, 'balance');
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER);

  const r1 = await service.redeemReward(USER_1, SAMPLE_DISCOUNT_VOUCHER.id, 50);
  const r2 = await service.redeemReward(USER_1, SAMPLE_DISCOUNT_VOUCHER.id, 50);

  assert.notEqual(r1.data?.voucherCode, r2.data?.voucherCode);
});

test('D5-18: Stress test: 30 concurrent user registrations and purchases execute with full data integrity', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  const promises = [];
  for (let i = 0; i < 30; i++) {
    const userAddr = 'G' + 'C'.repeat(54) + base32Chars[i];
    promises.push(
      (async () => {
        await service.registerUser(userAddr);
        await service.recordPurchasePoints(userAddr, 25); // 250 points
      })()
    );
  }

  await Promise.all(promises);

  for (let i = 0; i < 30; i++) {
    const userAddr = 'G' + 'C'.repeat(54) + base32Chars[i];
    assert.equal(await service.getPointsBalance(userAddr), 250);
  }
});

test('D5-19: resetState clears custom levels and resets back to DEFAULT_LEVELS', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.initLevelRequirements([
    { level: 'Bronze', minPoints: 0, multiplier: 1.0, discountPercentage: 0 },
    {
      level: 'VIP' as any,
      minPoints: 500,
      multiplier: 2.0,
      discountPercentage: 15,
    },
  ]);
  assert.equal(service.getLevelRequirements().length, 2);

  service.resetState();
  assert.equal(service.getLevelRequirements().length, DEFAULT_LEVELS.length);
  assert.equal(service.getLevelRequirements()[0].level, 'Bronze');
});

test('D5-20: calculateRewardDiscount caps discount at purchaseAmount for fixed discounts', () => {
  const reward: RewardItem = {
    id: 'r_huge_off',
    title: '$100 Off',
    description: '$100 voucher off order',
    type: 'DISCOUNT_VOUCHER',
    pointsCost: 500,
    value: 100,
    minPurchaseAmount: 10,
    isActive: true,
    stock: 10,
  };
  // $100 off on a $30 order should cap discount at $30
  const discount = calculateRewardDiscount(reward, 30);
  assert.equal(discount, 30);
});

test('D5-21: calculateRewardDiscount returns 0 for zero purchase amount on fixed discount', () => {
  const reward: RewardItem = {
    id: 'r_fixed_off',
    title: '$10 Off',
    description: '$10 voucher off order',
    type: 'DISCOUNT_VOUCHER',
    pointsCost: 100,
    value: 10,
    minPurchaseAmount: 0,
    isActive: true,
    stock: 10,
  };
  const discount = calculateRewardDiscount(reward, 0);
  assert.equal(discount, 0);
});

test('D5-22: Ledger consistency: mixed purchases, manual additions and redemptions maintain exact balances', async () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  await service.registerUser(USER_1);
  await service.createReward(SAMPLE_DISCOUNT_VOUCHER); // cost 500

  // 1. Purchase $50 -> 500 points (Bronze: 1.0)
  await service.recordPurchasePoints(USER_1, 50);
  // 2. Add 300 points bonus
  await service.addPoints(USER_1, 300, 'promo');
  // 3. Redeem reward -> -500 points
  await service.redeemReward(USER_1, SAMPLE_DISCOUNT_VOUCHER.id, 50);

  // Current balance: 500 + 300 - 500 = 300
  // Lifetime points: 500 + 300 = 800
  assert.equal(await service.getPointsBalance(USER_1), 300);
  assert.equal(await service.getLifetimePoints(USER_1), 800);

  const history = service.getTransactionHistory(USER_1);
  assert.equal(history.length, 3);
  assert.equal(history[0].type, 'PURCHASE');
  assert.equal(history[1].type, 'BONUS');
  assert.equal(history[2].type, 'REDEMPTION');
});

test('D5-23: getConfig and getLevelRequirements return immutable snapshots', () => {
  const service = new LoyaltyRewardsService({ initialAdmin: ADMIN_ADDR });
  const config = service.getConfig();
  (config as any).pointsExpiryDays = 999;
  assert.notEqual(service.getConfig().pointsExpiryDays, 999);

  const levels = service.getLevelRequirements();
  levels.push({
    level: 'Platinum',
    minPoints: 9999,
    multiplier: 5,
    discountPercentage: 20,
  });
  assert.notEqual(service.getLevelRequirements().length, levels.length);
});
