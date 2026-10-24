import test from 'node:test';
import assert from 'node:assert/strict';

import { MultiAuctionService } from '../auction.service';
import { AUCTION_ERROR_CODES } from '../constants/auction.constants';
import {
  isValidStellarAddress,
  calculateMinNextBid,
  calculatePlatformFee,
  formatDuration,
} from '../utils/auction.utils';
import type { CreateAuctionParams } from '../types/auction.types';

// Mock addresses
const SELLER_ADDR = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const ASSET_CONTRACT = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM';
const BIDDER_1 = 'GCLWGQPMK3WSPFJBNFQU6RNPISMRR72WNSHS7V5F6K37Z56ZJPSK7WVT';
const BIDDER_2 = 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';
const BIDDER_3 = 'GB7BBNZAC6G6WNVX6HN3SCYPDNPWGSK6YHAADB4VYDX76ZGE2LKUHSPO';

const BASE_PARAMS: CreateAuctionParams = {
  title: 'Rare Cyber Punk NFT',
  description: 'Limited edition StarShop cyberpunk collective NFT',
  seller: SELLER_ADDR,
  assetAddress: ASSET_CONTRACT,
  quantity: 1,
  startingBid: 100,
  minBidIncrement: 10,
  minBidIncrementType: 'FIXED',
  durationSeconds: 86400,
};

// =============================================================================
// DIMENSION 1: AUCTION LIFECYCLE & MANAGEMENT (TESTS 1 - 25)
// =============================================================================

test('D1-01: Create auction with standard parameters and initializes ACTIVE status', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction(BASE_PARAMS);

  assert.equal(res.success, true);
  assert.ok(res.data?.id.startsWith('auc_'));
  assert.equal(res.data?.status, 'ACTIVE');
  assert.equal(res.data?.highestBid, 0);
  assert.equal(res.data?.totalBids, 0);
});

test('D1-02: Create scheduled auction starting in the future initializes SCHEDULED status', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });

  const res = await service.createAuction({
    ...BASE_PARAMS,
    startTime: simTime + 3600, // starts in 1 hour
    endTime: simTime + 7200,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.status, 'SCHEDULED');
});

test('D1-03: Create multi-unit auction with custom quantity', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({
    ...BASE_PARAMS,
    quantity: 50,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.quantity, 50);
});

test('D1-04: Create auction with reserve price', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({
    ...BASE_PARAMS,
    reservePrice: 500,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.reservePrice, 500);
});

test('D1-05: Create auction with custom currency', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({
    ...BASE_PARAMS,
    currency: 'XLM',
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.currency, 'XLM');
});

test('D1-06: Create auction with custom duration', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const res = await service.createAuction({
    ...BASE_PARAMS,
    durationSeconds: 7200,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.endTime, simTime + 7200);
});

test('D1-07: Get existing auction returns cloned copy', async () => {
  const service = new MultiAuctionService();
  const created = (await service.createAuction(BASE_PARAMS)).data!;

  const fetched = await service.getAuction(created.id);
  assert.equal(fetched.success, true);
  assert.equal(fetched.data?.id, created.id);
  assert.equal(fetched.data?.title, created.title);
});

test('D1-08: Get non-existent auction returns AUCTION_NOT_FOUND error', async () => {
  const service = new MultiAuctionService();
  const res = await service.getAuction('non_existent_auc');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_NOT_FOUND);
});

test('D1-09: Update auction title and description succeeds', async () => {
  const service = new MultiAuctionService();
  const created = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.updateAuction(created.id, {
    title: 'Updated Cyberpunk NFT',
    description: 'Updated description',
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.title, 'Updated Cyberpunk NFT');
  assert.equal(res.data?.description, 'Updated description');
});

test('D1-10: Update auction endTime extends duration', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const created = (await service.createAuction({ ...BASE_PARAMS, durationSeconds: 3600 })).data!;

  const res = await service.updateAuction(created.id, {
    endTime: simTime + 7200,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.endTime, simTime + 7200);
});

test('D1-11: Update auction metadata persists custom key-values', async () => {
  const service = new MultiAuctionService();
  const created = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.updateAuction(created.id, {
    metadata: { rarity: 'Legendary', powerLevel: 99 },
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.metadata?.rarity, 'Legendary');
});

test('D1-12: Update auction minBidIncrement succeeds', async () => {
  const service = new MultiAuctionService();
  const created = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.updateAuction(created.id, {
    minBidIncrement: 25,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.minBidIncrement, 25);
});

test('D1-13: Cancel auction with 0 bids transitions status to CANCELLED', async () => {
  const service = new MultiAuctionService();
  const created = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.cancelAuction(created.id);
  assert.equal(res.success, true);

  const fetched = await service.getAuction(created.id);
  assert.equal(fetched.data?.status, 'CANCELLED');
});

test('D1-14: Cancel auction returns transaction hash', async () => {
  const service = new MultiAuctionService();
  const created = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.cancelAuction(created.id);
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D1-15: List auctions returns all registered auctions', async () => {
  const service = new MultiAuctionService();
  await service.createAuction({ ...BASE_PARAMS, title: 'Auc 1' });
  await service.createAuction({ ...BASE_PARAMS, title: 'Auc 2' });

  const list = await service.listAuctions();
  assert.equal(list.length, 2);
});

test('D1-16: List auctions filtered by ACTIVE status', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  await service.createAuction({ ...BASE_PARAMS, title: 'Active 1' });
  await service.createAuction({
    ...BASE_PARAMS,
    title: 'Scheduled 1',
    startTime: simTime + 5000,
    endTime: simTime + 10000,
  });

  const active = await service.listAuctions('ACTIVE');
  assert.equal(active.length, 1);
  assert.equal(active[0].title, 'Active 1');
});

test('D1-17: List auctions filtered by SCHEDULED status', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  await service.createAuction({ ...BASE_PARAMS, title: 'Active 1' });
  await service.createAuction({
    ...BASE_PARAMS,
    title: 'Scheduled 1',
    startTime: simTime + 5000,
    endTime: simTime + 10000,
  });

  const scheduled = await service.listAuctions('SCHEDULED');
  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0].title, 'Scheduled 1');
});

test('D1-18: List auctions filtered by ENDED status', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const a1 = (await service.createAuction({ ...BASE_PARAMS, durationSeconds: 500 })).data!;

  simTime += 1000; // pass end time
  const ended = await service.listAuctions('ENDED');
  assert.equal(ended.length, 1);
  assert.equal(ended[0].id, a1.id);
});

test('D1-19: List auctions with limit constraint', async () => {
  const service = new MultiAuctionService();
  for (let i = 0; i < 5; i++) {
    await service.createAuction({ ...BASE_PARAMS, title: `Auc ${i}` });
  }

  const list = await service.listAuctions(undefined, 3);
  assert.equal(list.length, 3);
});

test('D1-20: List auctions sorted descending by creation time', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  await service.createAuction({ ...BASE_PARAMS, title: 'First' });
  simTime += 100;
  await service.createAuction({ ...BASE_PARAMS, title: 'Second' });

  const list = await service.listAuctions();
  assert.equal(list[0].title, 'Second');
  assert.equal(list[1].title, 'First');
});

test('D1-21: Auto-transition SCHEDULED -> ACTIVE when time passes startTime', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const created = (
    await service.createAuction({
      ...BASE_PARAMS,
      startTime: simTime + 500,
      endTime: simTime + 5000,
    })
  ).data!;

  assert.equal(created.status, 'SCHEDULED');

  simTime += 600;
  const updated = (await service.getAuction(created.id)).data!;
  assert.equal(updated.status, 'ACTIVE');
});

test('D1-22: Auto-transition ACTIVE -> ENDED when time passes endTime', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const created = (
    await service.createAuction({
      ...BASE_PARAMS,
      durationSeconds: 1000,
    })
  ).data!;

  assert.equal(created.status, 'ACTIVE');

  simTime += 1500;
  const updated = (await service.getAuction(created.id)).data!;
  assert.equal(updated.status, 'ENDED');
});

test('D1-23: Create auction with percentage minBidIncrementType', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({
    ...BASE_PARAMS,
    minBidIncrement: 5,
    minBidIncrementType: 'PERCENTAGE',
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.minBidIncrementType, 'PERCENTAGE');
});

test('D1-24: Reset state clears all auctions and bids', async () => {
  const service = new MultiAuctionService();
  await service.createAuction(BASE_PARAMS);
  assert.equal((await service.listAuctions()).length, 1);

  service.resetState();
  assert.equal((await service.listAuctions()).length, 0);
});

test('D1-25: Multi-unit auction configuration correctly preserves quantity', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({
    ...BASE_PARAMS,
    auctionType: 'MULTI_UNIT',
    quantity: 100,
  });

  assert.equal(res.data?.auctionType, 'MULTI_UNIT');
  assert.equal(res.data?.quantity, 100);
});

// =============================================================================
// DIMENSION 2: BIDDING OPERATIONS & MIN INCREMENTS (TESTS 26 - 50)
// =============================================================================

test('D2-01: First bid equal to startingBid succeeds', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.placeBid(auc.id, 100, BIDDER_1);
  assert.equal(res.success, true);
  assert.equal(res.data?.amount, 100);
  assert.equal(res.data?.bidder, BIDDER_1);
});

test('D2-02: First bid higher than startingBid succeeds', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.placeBid(auc.id, 150, BIDDER_1);
  assert.equal(res.success, true);
  assert.equal(res.data?.amount, 150);
});

test('D2-03: First bid updates auction highestBid and highestBidder', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 120, BIDDER_1);
  const updated = (await service.getAuction(auc.id)).data!;

  assert.equal(updated.highestBid, 120);
  assert.equal(updated.highestBidder, BIDDER_1);
  assert.equal(updated.totalBids, 1);
  assert.equal(updated.totalVolume, 120);
});

test('D2-04: Subsequent bid meeting fixed minBidIncrement succeeds', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction({ ...BASE_PARAMS, minBidIncrement: 10 })).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  const res = await service.placeBid(auc.id, 110, BIDDER_2);

  assert.equal(res.success, true);
  assert.equal(res.data?.amount, 110);
});

test('D2-05: Subsequent bid updates auction highestBid and highestBidder', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 110, BIDDER_2);

  const updated = (await service.getAuction(auc.id)).data!;
  assert.equal(updated.highestBid, 110);
  assert.equal(updated.highestBidder, BIDDER_2);
  assert.equal(updated.totalBids, 2);
  assert.equal(updated.totalVolume, 210);
});

test('D2-06: Previous highest bid is marked OUTBID when new higher bid arrives', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 110, BIDDER_2);

  const b1 = await service.getBid(auc.id, BIDDER_1);
  assert.equal(b1?.status, 'OUTBID');

  const b2 = await service.getBid(auc.id, BIDDER_2);
  assert.equal(b2?.status, 'ACTIVE');
});

test('D2-07: Subsequent bid meeting percentage minBidIncrement succeeds', async () => {
  const service = new MultiAuctionService();
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      minBidIncrement: 10, // 10%
      minBidIncrementType: 'PERCENTAGE',
    })
  ).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  // Next min bid is 100 + 10% = 110
  const res = await service.placeBid(auc.id, 110, BIDDER_2);
  assert.equal(res.success, true);
});

test('D2-08: Multiple ascending bids correctly increment totalBids and totalVolume', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);
  await service.placeBid(auc.id, 140, BIDDER_3);

  const updated = (await service.getAuction(auc.id)).data!;
  assert.equal(updated.totalBids, 3);
  assert.equal(updated.totalVolume, 360);
  assert.equal(updated.highestBid, 140);
});

test('D2-09: updateBid method allows bidder to raise their bid above current highest', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);

  // BIDDER_1 raises
  const res = await service.updateBid(auc.id, 150, BIDDER_1);
  assert.equal(res.success, true);
  assert.equal(res.data?.amount, 150);
});

test('D2-10: getBid returns latest bid entry for specific bidder', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);
  await service.placeBid(auc.id, 140, BIDDER_1);

  const b1 = await service.getBid(auc.id, BIDDER_1);
  assert.equal(b1?.amount, 140);
});

test('D2-11: getBid returns null for user who has not bid', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.getBid(auc.id, BIDDER_3);
  assert.equal(res, null);
});

test('D2-12: getHighestBid returns current active winning bid entry', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 115, BIDDER_2);

  const highest = await service.getHighestBid(auc.id);
  assert.equal(highest?.amount, 115);
  assert.equal(highest?.bidder, BIDDER_2);
});

test('D2-13: getHighestBid returns null when auction has zero bids', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const highest = await service.getHighestBid(auc.id);
  assert.equal(highest, null);
});

test('D2-14: Anti-snipe: bid placed in last 5 minutes extends auction endTime by 5 minutes', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      durationSeconds: 3600, // ends at 1003600
      antiSnipeTimeWindowSeconds: 300, // 5 min
      antiSnipeExtensionSeconds: 300, // +5 min
    })
  ).data!;

  // Advance time to 2 minutes before end (1003480)
  simTime = auc.endTime - 120;
  await service.placeBid(auc.id, 100, BIDDER_1);

  const updated = (await service.getAuction(auc.id)).data!;
  assert.equal(updated.endTime, 1003600 + 300);
});

test('D2-15: Anti-snipe: bid placed well before window does NOT extend endTime', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      durationSeconds: 3600,
      antiSnipeTimeWindowSeconds: 300,
    })
  ).data!;

  // 30 minutes before end
  simTime = auc.endTime - 1800;
  await service.placeBid(auc.id, 100, BIDDER_1);

  const updated = (await service.getAuction(auc.id)).data!;
  assert.equal(updated.endTime, 1003600);
});

test('D2-16: Anti-snipe: multiple consecutive late bids compound time extensions', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      durationSeconds: 3600,
      antiSnipeTimeWindowSeconds: 300,
      antiSnipeExtensionSeconds: 300,
    })
  ).data!;

  // Bid 1 in window
  simTime = auc.endTime - 100;
  await service.placeBid(auc.id, 100, BIDDER_1);
  const end1 = (await service.getAuction(auc.id)).data!.endTime;

  // Bid 2 in window
  simTime = end1 - 50;
  await service.placeBid(auc.id, 120, BIDDER_2);
  const end2 = (await service.getAuction(auc.id)).data!.endTime;

  assert.equal(end2, end1 + 300);
});

test('D2-17: Bid withdrawal succeeds when allowBidWithdrawal is enabled and bidder is outbid', async () => {
  const service = new MultiAuctionService();
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      allowBidWithdrawal: true,
    })
  ).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);

  // BIDDER_1 is outbid, can withdraw
  const res = await service.withdrawBid(auc.id, BIDDER_1);
  assert.equal(res.success, true);
});

test('D2-18: Bid withdrawal marks bid status as WITHDRAWN', async () => {
  const service = new MultiAuctionService();
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      allowBidWithdrawal: true,
    })
  ).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);
  await service.withdrawBid(auc.id, BIDDER_1);

  const b1 = await service.getBid(auc.id, BIDDER_1);
  assert.equal(b1?.status, 'WITHDRAWN');
});

test('D2-19: calculateMinNextBid returns startingBid when current highest is 0', () => {
  const min = calculateMinNextBid(0, 100, 10, 'FIXED');
  assert.equal(min, 100);
});

test('D2-20: calculateMinNextBid with fixed increment adds exact increment', () => {
  const min = calculateMinNextBid(250, 100, 25, 'FIXED');
  assert.equal(min, 275);
});

test('D2-21: calculateMinNextBid with percentage increment calculates exact percentage', () => {
  const min = calculateMinNextBid(200, 100, 5, 'PERCENTAGE');
  assert.equal(min, 210);
});

test('D2-22: Bid timestamps match current simulated clock time', async () => {
  let simTime = 12345678;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.placeBid(auc.id, 100, BIDDER_1);
  assert.equal(res.data?.timestamp, 12345678);
});

test('D2-23: Bid entries contain unique valid transaction hash', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.placeBid(auc.id, 100, BIDDER_1);
  assert.ok(res.transactionHash?.startsWith('0x'));
  assert.equal(res.transactionHash?.length, 66);
});

test('D2-24: Alternating bids between 2 bidders correctly track state', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 110, BIDDER_2);
  await service.placeBid(auc.id, 120, BIDDER_1);
  await service.placeBid(auc.id, 130, BIDDER_2);

  const highest = await service.getHighestBid(auc.id);
  assert.equal(highest?.bidder, BIDDER_2);
  assert.equal(highest?.amount, 130);
});

test('D2-25: Alternating bids between 3 bidders maintain full ledger history', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);
  await service.placeBid(auc.id, 140, BIDDER_3);

  const rawBids = service.getRawBids(auc.id);
  assert.equal(rawBids.length, 3);
  assert.equal(rawBids[0].status, 'OUTBID');
  assert.equal(rawBids[1].status, 'OUTBID');
  assert.equal(rawBids[2].status, 'ACTIVE');
});

// =============================================================================
// DIMENSION 3: AUCTION EXECUTION, DISTRIBUTION & CLAIMING (TESTS 51 - 70)
// =============================================================================

test('D3-01: endAuction manually transitions active auction to ENDED', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.endAuction(auc.id);
  assert.equal(res.success, true);
  assert.equal(res.data?.status, 'ENDED');
});

test('D3-02: endAuction marks winning bid as WON when reserve price met', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction({ ...BASE_PARAMS, reservePrice: 200 })).data!;

  await service.placeBid(auc.id, 250, BIDDER_1);
  await service.endAuction(auc.id);

  const b1 = await service.getBid(auc.id, BIDDER_1);
  assert.equal(b1?.status, 'WON');
});

test('D3-03: endAuction marks bids as REFUNDED when reserve price NOT met', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction({ ...BASE_PARAMS, reservePrice: 500 })).data!;

  await service.placeBid(auc.id, 200, BIDDER_1);
  await service.endAuction(auc.id);

  const b1 = await service.getBid(auc.id, BIDDER_1);
  assert.equal(b1?.status, 'REFUNDED');
});

test('D3-04: endAuction returns AuctionResults with winner and winningBid', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 150, BIDDER_1);
  const res = await service.endAuction(auc.id);

  assert.equal(res.data?.winner, BIDDER_1);
  assert.equal(res.data?.winningBid, 150);
  assert.equal(res.data?.reserveMet, true);
});

test('D3-05: getAuctionResults returns accurate snapshot of finished auction', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 180, BIDDER_2);
  await service.endAuction(auc.id);

  const results = await service.getAuctionResults(auc.id);
  assert.equal(results.winner, BIDDER_2);
  assert.equal(results.winningBid, 180);
});

test('D3-06: distributeAuction calculates platform fee (2.5%) and seller payout (97.5%)', async () => {
  const service = new MultiAuctionService({ platformFeePercentage: 2.5 });
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 200, BIDDER_1);
  const res = await service.distributeAuction(auc.id);

  assert.equal(res.success, true);
  assert.equal(res.data?.platformFee, 5); // 2.5% of 200
  assert.equal(res.data?.sellerPayout, 195); // 200 - 5
});

test('D3-07: distributeAuction sets distribution status to PROCESSED', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  const res = await service.distributeAuction(auc.id);

  assert.equal(res.data?.status, 'PROCESSED');
});

test('D3-08: distributeAuction transitions auction status to DISTRIBUTED', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);

  const updated = (await service.getAuction(auc.id)).data!;
  assert.equal(updated.status, 'DISTRIBUTED');
});

test('D3-09: distributeAuction with 0% platform fee pays 100% to seller', async () => {
  const service = new MultiAuctionService({ platformFeePercentage: 0 });
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 1000, BIDDER_1);
  const res = await service.distributeAuction(auc.id);

  assert.equal(res.data?.platformFee, 0);
  assert.equal(res.data?.sellerPayout, 1000);
});

test('D3-10: distributeAuction with custom platform fee (5%) calculates correctly', async () => {
  const service = new MultiAuctionService({ platformFeePercentage: 5.0 });
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 500, BIDDER_1);
  const res = await service.distributeAuction(auc.id);

  assert.equal(res.data?.platformFee, 25);
  assert.equal(res.data?.sellerPayout, 475);
});

test('D3-11: Winner claims item: returns ITEM claim result with assetAddress and quantity', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction({ ...BASE_PARAMS, quantity: 2 })).data!;

  await service.placeBid(auc.id, 200, BIDDER_1);
  await service.distributeAuction(auc.id);

  const claim = await service.claimWinnings(auc.id, BIDDER_1);
  assert.equal(claim.success, true);
  assert.equal(claim.data?.claimType, 'ITEM');
  assert.equal(claim.data?.amount, 2);
  assert.equal(claim.data?.assetAddress, ASSET_CONTRACT);
});

test('D3-12: Seller claims payout: returns PAYOUT claim result with currency and net amount', async () => {
  const service = new MultiAuctionService({ platformFeePercentage: 10 });
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 200, BIDDER_1);
  await service.distributeAuction(auc.id);

  const claim = await service.claimWinnings(auc.id, SELLER_ADDR);
  assert.equal(claim.success, true);
  assert.equal(claim.data?.claimType, 'PAYOUT');
  assert.equal(claim.data?.amount, 180);
});

test('D3-13: Outbid bidder claims refund: returns REFUND claim result with refunded amount', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);
  await service.distributeAuction(auc.id);

  const claim = await service.claimWinnings(auc.id, BIDDER_1);
  assert.equal(claim.success, true);
  assert.equal(claim.data?.claimType, 'REFUND');
  assert.equal(claim.data?.amount, 100);
});

test('D3-14: Distribution status transitions to CLAIMED when both winner and seller have claimed', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);

  await service.claimWinnings(auc.id, BIDDER_1);
  await service.claimWinnings(auc.id, SELLER_ADDR);

  const dist = await service.getDistribution(auc.id);
  assert.equal(dist.status, 'CLAIMED');
});

test('D3-15: getDistribution returns distribution details', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);

  const dist = await service.getDistribution(auc.id);
  assert.equal(dist.winner, BIDDER_1);
  assert.equal(dist.winningBid, 100);
});

test('D3-16: getDistribution returns NOT_STARTED for undistributed auction', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const dist = await service.getDistribution(auc.id);
  assert.equal(dist.status, 'NOT_STARTED');
});

test('D3-17: getDistributionStatus returns current status string', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  assert.equal(await service.getDistributionStatus(auc.id), 'NOT_STARTED');
  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);
  assert.equal(await service.getDistributionStatus(auc.id), 'PROCESSED');
});

test('D3-18: processDistribution wrapper calls distributeAuction successfully', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  const res = await service.processDistribution(auc.id);
  assert.equal(res.success, true);
});

test('D3-19: distributeAuction on expired active auction auto-ends it first', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const auc = (await service.createAuction({ ...BASE_PARAMS, durationSeconds: 500 })).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  simTime += 1000; // pass end time

  const res = await service.distributeAuction(auc.id);
  assert.equal(res.success, true);
  assert.equal(res.data?.status, 'PROCESSED');
});

test('D3-20: claimWinnings on ended auction auto-triggers distribution', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.endAuction(auc.id);

  const claim = await service.claimWinnings(auc.id, BIDDER_1);
  assert.equal(claim.success, true);
  assert.equal(claim.data?.claimType, 'ITEM');
});

// =============================================================================
// DIMENSION 4: NEGATIVE CASES, BOUNDARY CONDITIONS & ANTI-ABUSE (TESTS 71 - 90)
// =============================================================================

test('D4-01: Rejects createAuction with empty title', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({ ...BASE_PARAMS, title: '' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-02: Rejects createAuction with invalid seller address', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({ ...BASE_PARAMS, seller: 'invalid_address' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-03: Rejects createAuction with empty assetAddress', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({ ...BASE_PARAMS, assetAddress: '   ' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-04: Rejects createAuction with negative startingBid', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({ ...BASE_PARAMS, startingBid: -50 });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_PRICE);
});

test('D4-05: Rejects createAuction with zero or negative quantity', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({ ...BASE_PARAMS, quantity: 0 });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_QUANTITY);
});

test('D4-06: Rejects createAuction with endTime <= startTime', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const res = await service.createAuction({
    ...BASE_PARAMS,
    startTime: simTime + 1000,
    endTime: simTime + 500, // end before start
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_TIME_RANGE);
});

test('D4-07: Rejects createAuction with startTime in past (> 60s ago)', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const res = await service.createAuction({
    ...BASE_PARAMS,
    startTime: simTime - 3600, // 1 hour in past
    endTime: simTime + 3600,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_TIME_RANGE);
});

test('D4-08: Rejects createAuction with negative reservePrice', async () => {
  const service = new MultiAuctionService();
  const res = await service.createAuction({ ...BASE_PARAMS, reservePrice: -100 });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_PRICE);
});

test('D4-09: Rejects updateAuction for non-existent auction', async () => {
  const service = new MultiAuctionService();
  const res = await service.updateAuction('ghost_auc', { title: 'New' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_NOT_FOUND);
});

test('D4-10: Rejects updateAuction when auction is CANCELLED', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;
  await service.cancelAuction(auc.id);

  const res = await service.updateAuction(auc.id, { title: 'New' });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED);
});

test('D4-11: Rejects updateAuction when auction is ENDED', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;
  await service.endAuction(auc.id);

  const res = await service.updateAuction(auc.id, { title: 'New' });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED);
});

test('D4-12: Rejects updateAuction reservePrice when auction already has bids', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;
  await service.placeBid(auc.id, 100, BIDDER_1);

  const res = await service.updateAuction(auc.id, { reservePrice: 999 });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-13: Rejects cancelAuction when auction has active bids', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;
  await service.placeBid(auc.id, 100, BIDDER_1);

  const res = await service.cancelAuction(auc.id);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_CANNOT_BE_CANCELLED);
});

test('D4-14: Rejects cancelAuction when auction is already CANCELLED', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;
  await service.cancelAuction(auc.id);

  const res = await service.cancelAuction(auc.id);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_ALREADY_CANCELLED);
});

test('D4-15: Rejects placeBid on non-existent auction', async () => {
  const service = new MultiAuctionService();
  const res = await service.placeBid('ghost_auc', 100, BIDDER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_NOT_FOUND);
});

test('D4-16: Rejects placeBid with invalid bidder Stellar address', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.placeBid(auc.id, 100, 'bad_address');
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-17: Rejects placeBid from seller on their own auction (BIDDER_IS_SELLER)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.placeBid(auc.id, 100, SELLER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.BIDDER_IS_SELLER);
});

test('D4-18: Rejects placeBid from bidder who is already highest bidder (BIDDER_ALREADY_HIGHEST)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  const res = await service.placeBid(auc.id, 120, BIDDER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.BIDDER_ALREADY_HIGHEST);
});

test('D4-19: Rejects placeBid below startingBid (BID_TOO_LOW)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction({ ...BASE_PARAMS, startingBid: 100 })).data!;

  const res = await service.placeBid(auc.id, 90, BIDDER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.BID_TOO_LOW);
});

test('D4-20: Rejects placeBid that does not satisfy minBidIncrement (BID_INCREMENT_NOT_MET)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction({ ...BASE_PARAMS, minBidIncrement: 20 })).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  // min next bid is 120
  const res = await service.placeBid(auc.id, 110, BIDDER_2);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.BID_INCREMENT_NOT_MET);
});

// =============================================================================
// DIMENSION 5: EDGE CASES, MULTI-UNIT, STRESS & CONCURRENCY (TESTS 91 - 110)
// =============================================================================

test('D5-01: Rejects placeBid on SCHEDULED auction before startTime', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      startTime: simTime + 1000,
      endTime: simTime + 5000,
    })
  ).data!;

  const res = await service.placeBid(auc.id, 100, BIDDER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_NOT_ACTIVE);
});

test('D5-02: Rejects placeBid on ENDED auction', async () => {
  let simTime = 1000000;
  const service = new MultiAuctionService({ timeProvider: () => simTime });
  const auc = (await service.createAuction({ ...BASE_PARAMS, durationSeconds: 500 })).data!;

  simTime += 1000;
  const res = await service.placeBid(auc.id, 100, BIDDER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_ALREADY_ENDED);
});

test('D5-03: Rejects placeBid on CANCELLED auction', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;
  await service.cancelAuction(auc.id);

  const res = await service.placeBid(auc.id, 100, BIDDER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_NOT_ACTIVE);
});

test('D5-04: Rejects withdrawBid when allowBidWithdrawal is false', async () => {
  const service = new MultiAuctionService();
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      allowBidWithdrawal: false,
    })
  ).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.placeBid(auc.id, 120, BIDDER_2);

  const res = await service.withdrawBid(auc.id, BIDDER_1);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.BID_WITHDRAWAL_NOT_ALLOWED);
});

test('D5-05: Rejects withdrawBid when bidder is currently the highest bidder', async () => {
  const service = new MultiAuctionService();
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      allowBidWithdrawal: true,
    })
  ).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  const res = await service.withdrawBid(auc.id, BIDDER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.BID_CANNOT_WITHDRAW_HIGHEST);
});

test('D5-06: Rejects withdrawBid when bidder has no bids in auction', async () => {
  const service = new MultiAuctionService();
  const auc = (
    await service.createAuction({
      ...BASE_PARAMS,
      allowBidWithdrawal: true,
    })
  ).data!;

  const res = await service.withdrawBid(auc.id, BIDDER_3);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.BID_NOT_FOUND);
});

test('D5-07: Rejects double distributeAuction call (AUCTION_ALREADY_DISTRIBUTED)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);

  const res = await service.distributeAuction(auc.id);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.AUCTION_ALREADY_DISTRIBUTED);
});

test('D5-08: Rejects double claim from winner (ALREADY_CLAIMED)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);

  await service.claimWinnings(auc.id, BIDDER_1);
  const res = await service.claimWinnings(auc.id, BIDDER_1);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.ALREADY_CLAIMED);
});

test('D5-09: Rejects double claim from seller (ALREADY_CLAIMED)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);

  await service.claimWinnings(auc.id, SELLER_ADDR);
  const res = await service.claimWinnings(auc.id, SELLER_ADDR);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.ALREADY_CLAIMED);
});

test('D5-10: Rejects claimWinnings for unauthorized address with no claim (NOTHING_TO_CLAIM)', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  await service.distributeAuction(auc.id);

  const res = await service.claimWinnings(auc.id, BIDDER_3);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, AUCTION_ERROR_CODES.NOTHING_TO_CLAIM);
});

test('D5-11: Validates Stellar address format regex (G..., C..., 0x...)', () => {
  assert.equal(isValidStellarAddress(SELLER_ADDR), true);
  assert.equal(isValidStellarAddress(ASSET_CONTRACT), true);
  assert.equal(isValidStellarAddress('0x1234567890123456789012345678901234567890'), true);
  assert.equal(isValidStellarAddress('short_str'), false);
  assert.equal(isValidStellarAddress(''), false);
});

test('D5-12: Validates formatDuration utility with various ranges', () => {
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(125), '2m 5s');
  assert.equal(formatDuration(3665), '1h 1m 5s');
  assert.equal(formatDuration(90061), '1d 1h 1m 1s');
});

test('D5-13: calculatePlatformFee utility handles 0 winning bid', () => {
  const res = calculatePlatformFee(0, 5.0);
  assert.equal(res.platformFee, 0);
  assert.equal(res.sellerPayout, 0);
});

test('D5-14: Fractional bids (e.g. 10.55 USDC) compute precision increments without rounding drift', () => {
  const min = calculateMinNextBid(10.55, 10, 0.5, 'FIXED');
  assert.equal(min, 11.05);
});

test('D5-15: Auction with 0 bids ends with reserveMet: false and winner: null', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.endAuction(auc.id);
  assert.equal(res.data?.winner, null);
  assert.equal(res.data?.winningBid, 0);
  assert.equal(res.data?.reserveMet, false);
});

test('D5-16: Distribute auction with 0 bids has 0 sellerPayout and 0 platformFee', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  const res = await service.distributeAuction(auc.id);
  assert.equal(res.data?.sellerPayout, 0);
  assert.equal(res.data?.platformFee, 0);
  assert.equal(res.data?.winner, null);
});

test('D5-17: Seller claiming payout on 0-bid auction claims 0 amount without error', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.distributeAuction(auc.id);
  const claim = await service.claimWinnings(auc.id, SELLER_ADDR);

  assert.equal(claim.success, true);
  assert.equal(claim.data?.amount, 0);
});

test('D5-18: getRawBids returns immutable snapshot of bid list', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction(BASE_PARAMS)).data!;

  await service.placeBid(auc.id, 100, BIDDER_1);
  const bids = service.getRawBids(auc.id);
  bids.push({} as any);

  assert.equal(service.getRawBids(auc.id).length, 1);
});

test('D5-19: Stress test: 20 rapid sequential bids by different bidders increment price correctly', async () => {
  const service = new MultiAuctionService();
  const auc = (await service.createAuction({ ...BASE_PARAMS, minBidIncrement: 5 })).data!;

  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let expectedAmount = 100;

  for (let i = 0; i < 20; i++) {
    const bidderAddr = 'G' + 'D'.repeat(54) + base32Chars[i];
    const res = await service.placeBid(auc.id, expectedAmount, bidderAddr);
    assert.equal(res.success, true);
    assert.equal(res.data?.amount, expectedAmount);
    expectedAmount += 5;
  }

  const updated = (await service.getAuction(auc.id)).data!;
  assert.equal(updated.totalBids, 20);
  assert.equal(updated.highestBid, 195);
});

test('D5-20: Stress test: 10 parallel auctions operating simultaneously maintain isolated state', async () => {
  const service = new MultiAuctionService();
  const auctionIds: string[] = [];

  for (let i = 0; i < 10; i++) {
    const auc = (await service.createAuction({ ...BASE_PARAMS, title: `Parallel Auc ${i}` })).data!;
    auctionIds.push(auc.id);
  }

  // Bid concurrently across all 10 auctions
  await Promise.all(
    auctionIds.map((id, idx) => service.placeBid(id, 100 + idx * 10, BIDDER_1))
  );

  for (let i = 0; i < 10; i++) {
    const auc = (await service.getAuction(auctionIds[i])).data!;
    assert.equal(auc.highestBid, 100 + i * 10);
    assert.equal(auc.totalBids, 1);
  }
});
