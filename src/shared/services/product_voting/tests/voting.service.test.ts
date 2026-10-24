/**
 * Product Voting Contract Service - Comprehensive 5D Matrix Test Suite
 * 105 tests covering all dimensions, lifecycle stages, error handling, and stress scenarios.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ProductVotingService } from '../voting.service';
import {
  ROUND_STATUS,
  VOTING_ERROR_CODES,
} from '../constants/voting.constants';
import {
  checkQuorum,
} from '../utils/voting.utils';

// Valid Base32 Stellar & EVM Addresses
const USER_1 = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USER_2 = 'GCLWGQPMK3WSPFJBNFQU6RNPISMRR72WNSHS7V5F6K37Z56ZJPSK7WVT';
const USER_3 = 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';
const CONTRACT_1 = 'CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';
const EVM_1 = '0x1234567890123456789012345678901234567890';

const PROD_1 = 'prod_stellar_hoodie_001';
const PROD_2 = 'prod_cyber_tee_002';
const PROD_3 = 'prod_ledger_wallet_003';

describe('ProductVotingService - 5D Verification Matrix', () => {
  let service: ProductVotingService;

  beforeEach(() => {
    service = new ProductVotingService();
    service.resetState();
  });

  // ===========================================================================
  // DIMENSION 1: ROUND LIFECYCLE & CONFIGURATION (TESTS 1 - 25)
  // ===========================================================================

  it('D1-01: Create voting round with minimum valid parameters', async () => {
    const res = await service.createVotingRound({
      title: 'Community Choice Award',
      endTime: Date.now() + 86400000,
    });
    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data.title, 'Community Choice Award');
    assert.equal(res.data.status, ROUND_STATUS.ACTIVE);
    assert.equal(res.data.totalVotes, 0);
    assert.equal(res.data.totalWeight, 0);
  });

  it('D1-02: Create voting round with all optional parameters', async () => {
    const res = await service.createVotingRound({
      title: 'Winter Apparel Voting',
      description: 'Vote for top winter merch',
      category: 'Apparel',
      startTime: Date.now() - 1000,
      endTime: Date.now() + 100000,
      quorum: 50,
      maxVotesPerUser: 5,
      rewardPool: 1000,
      eligibleProducts: [PROD_1, PROD_2],
      allowRetract: true,
    });
    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data.category, 'Apparel');
    assert.equal(res.data.quorum, 50);
    assert.equal(res.data.maxVotesPerUser, 5);
    assert.equal(res.data.rewardPool, 1000);
    assert.deepEqual(res.data.eligibleProducts, [PROD_1, PROD_2]);
  });

  it('D1-03: Create round with future startTime sets status to PENDING', async () => {
    const now = Date.now();
    const res = await service.createVotingRound({
      title: 'Upcoming Summer Vote',
      startTime: now + 50000,
      endTime: now + 150000,
    });
    assert.equal(res.success, true);
    assert.equal(res.data?.status, ROUND_STATUS.PENDING);
  });

  it('D1-04: Create round with past or current startTime sets status to ACTIVE', async () => {
    const now = Date.now();
    const res = await service.createVotingRound({
      title: 'Active Spring Vote',
      startTime: now - 5000,
      endTime: now + 50000,
    });
    assert.equal(res.success, true);
    assert.equal(res.data?.status, ROUND_STATUS.ACTIVE);
  });

  it('D1-05: getVotingRound returns existing round', async () => {
    const created = await service.createVotingRound({
      title: 'Gadget of the Month',
      endTime: Date.now() + 50000,
    });
    const fetched = await service.getVotingRound(created.data!.roundId);
    assert.equal(fetched.success, true);
    assert.equal(fetched.data?.roundId, created.data!.roundId);
    assert.equal(fetched.data?.title, 'Gadget of the Month');
  });

  it('D1-06: getVotingRound transitions PENDING to ACTIVE once startTime arrives', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createVotingRound({
      title: 'Timed Transition Round',
      startTime: 2000,
      endTime: 5000,
    });
    assert.equal(created.data?.status, ROUND_STATUS.PENDING);

    mockTime = 2500;
    const fetched = await service.getVotingRound(created.data!.roundId);
    assert.equal(fetched.data?.status, ROUND_STATUS.ACTIVE);
  });

  it('D1-07: getVotingRound transitions ACTIVE to ENDED once endTime passes', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createVotingRound({
      title: 'Expiring Round',
      startTime: 1000,
      endTime: 3000,
    });
    assert.equal(created.data?.status, ROUND_STATUS.ACTIVE);

    mockTime = 3001;
    const fetched = await service.getVotingRound(created.data!.roundId);
    assert.equal(fetched.data?.status, ROUND_STATUS.ENDED);
  });

  it('D1-08: getCurrentActiveRound returns active round when one exists', async () => {
    const created = await service.createVotingRound({
      title: 'Current Round',
      endTime: Date.now() + 50000,
    });
    const current = await service.getCurrentActiveRound();
    assert.ok(current);
    assert.equal(current.roundId, created.data!.roundId);
  });

  it('D1-09: getCurrentActiveRound returns null when no rounds exist', async () => {
    const current = await service.getCurrentActiveRound();
    assert.equal(current, null);
  });

  it('D1-10: getCurrentActiveRound returns null when all rounds are ENDED', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createVotingRound({
      title: 'Past Round',
      startTime: 1000,
      endTime: 2000,
    });
    await service.endVotingRound(created.data!.roundId);

    const current = await service.getCurrentActiveRound();
    assert.equal(current, null);
  });

  it('D1-11: getCurrentActiveRound promotes PENDING round if current time matches', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createVotingRound({
      title: 'Future Round',
      startTime: 2000,
      endTime: 4000,
    });
    assert.equal(await service.getCurrentActiveRound(), null);

    mockTime = 2500;
    const current = await service.getCurrentActiveRound();
    assert.ok(current);
    assert.equal(current.roundId, created.data!.roundId);
    assert.equal(current.status, ROUND_STATUS.ACTIVE);
  });

  it('D1-12: endVotingRound explicitly closes an ACTIVE round', async () => {
    const created = await service.createVotingRound({
      title: 'Close Me',
      endTime: Date.now() + 50000,
    });
    const endRes = await service.endVotingRound(created.data!.roundId);
    assert.equal(endRes.success, true);
    assert.equal(endRes.data?.status, ROUND_STATUS.ENDED);

    const round = await service.getVotingRound(created.data!.roundId);
    assert.equal(round.data?.status, ROUND_STATUS.ENDED);
  });

  it('D1-13: endVotingRound tallies totalVotes and totalWeight accurately', async () => {
    const created = await service.createVotingRound({
      title: 'Tally Round',
      endTime: Date.now() + 50000,
    });
    const roundId = created.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.castVote(roundId, PROD_2, USER_2, 10);

    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.totalVotes, 2);
    assert.equal(endRes.data?.totalWeight, 15);
  });

  it('D1-14: endVotingRound computes winningProductId for top voted product', async () => {
    const created = await service.createVotingRound({
      title: 'Winner Round',
      endTime: Date.now() + 50000,
    });
    const roundId = created.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.castVote(roundId, PROD_2, USER_2, 20);

    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.winningProductId, PROD_2);
  });

  it('D1-15: endVotingRound sets winningProductId to null when zero votes were cast', async () => {
    const created = await service.createVotingRound({
      title: 'Empty Round',
      endTime: Date.now() + 50000,
    });
    const endRes = await service.endVotingRound(created.data!.roundId);
    assert.equal(endRes.data?.winningProductId, null);
    assert.equal(endRes.data?.totalVotes, 0);
  });

  it('D1-16: endVotingRound verifies quorumReached is true when totalWeight >= quorum', async () => {
    const created = await service.createVotingRound({
      title: 'Quorum Round',
      quorum: 10,
      endTime: Date.now() + 50000,
    });
    const roundId = created.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.quorumReached, true);
  });

  it('D1-17: endVotingRound verifies quorumReached is false when totalWeight < quorum', async () => {
    const created = await service.createVotingRound({
      title: 'Quorum Fail Round',
      quorum: 25,
      endTime: Date.now() + 50000,
    });
    const roundId = created.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.quorumReached, false);
  });

  it('D1-18: endVotingRound returns rankings in RoundResults', async () => {
    const created = await service.createVotingRound({
      title: 'Rankings In Results',
      endTime: Date.now() + 50000,
    });
    const roundId = created.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    const endRes = await service.endVotingRound(roundId);
    assert.ok(Array.isArray(endRes.data?.rankings));
    assert.equal(endRes.data!.rankings.length, 1);
    assert.equal(endRes.data!.rankings[0].productId, PROD_1);
  });

  it('D1-19: endVotingRound generates transaction hash', async () => {
    const created = await service.createVotingRound({
      title: 'Hash Round',
      endTime: Date.now() + 50000,
    });
    const endRes = await service.endVotingRound(created.data!.roundId);
    assert.ok(endRes.txHash);
    assert.ok(endRes.txHash?.startsWith('0x'));
  });

  it('D1-20: resetState clears all rounds and votes', async () => {
    const created = await service.createVotingRound({
      title: 'Reset Round',
      endTime: Date.now() + 50000,
    });
    await service.castVote(created.data!.roundId, PROD_1, USER_1, 5);

    service.resetState();
    const fetched = await service.getVotingRound(created.data!.roundId);
    assert.equal(fetched.success, false);
    assert.equal(fetched.error?.code, VOTING_ERROR_CODES.ROUND_NOT_FOUND);
    assert.equal(await service.getCurrentActiveRound(), null);
  });

  it('D1-21: Custom timeProvider correctly influences round expiration', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createVotingRound({
      title: 'Custom Time Round',
      startTime: 1000,
      endTime: 5000,
    });
    assert.equal(created.data?.status, ROUND_STATUS.ACTIVE);

    mockTime = 5500;
    const round = await service.getVotingRound(created.data!.roundId);
    assert.equal(round.data?.status, ROUND_STATUS.ENDED);
  });

  it('D1-22: Trims whitespace from title, description and category', async () => {
    const res = await service.createVotingRound({
      title: '   Trimmed Round   ',
      description: '   Description with spaces   ',
      category: '   Accessories   ',
      endTime: Date.now() + 50000,
    });
    assert.equal(res.data?.title, 'Trimmed Round');
    assert.equal(res.data?.description, 'Description with spaces');
    assert.equal(res.data?.category, 'Accessories');
  });

  it('D1-23: Eligible products list is trimmed and empty entries filtered', async () => {
    const res = await service.createVotingRound({
      title: 'Filter Products',
      eligibleProducts: ['  prod_1  ', '', '   ', 'prod_2'],
      endTime: Date.now() + 50000,
    });
    assert.deepEqual(res.data?.eligibleProducts, ['prod_1', 'prod_2']);
  });

  it('D1-24: Updates updatedAt timestamp when ending round', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const created = await service.createVotingRound({
      title: 'Update Timestamp',
      endTime: 10000,
    });
    mockTime = 2500;
    const endRes = await service.endVotingRound(created.data!.roundId);
    assert.equal(endRes.data?.endedAt, 2500);

    const round = await service.getVotingRound(created.data!.roundId);
    assert.equal(round.data?.updatedAt, 2500);
  });

  it('D1-25: Multiple distinct voting rounds can coexist independently', async () => {
    const r1 = await service.createVotingRound({ title: 'Round Alpha', endTime: Date.now() + 50000 });
    const r2 = await service.createVotingRound({ title: 'Round Beta', endTime: Date.now() + 50000 });

    assert.notEqual(r1.data!.roundId, r2.data!.roundId);
    const fetched1 = await service.getVotingRound(r1.data!.roundId);
    const fetched2 = await service.getVotingRound(r2.data!.roundId);
    assert.equal(fetched1.data?.title, 'Round Alpha');
    assert.equal(fetched2.data?.title, 'Round Beta');
  });

  // ===========================================================================
  // DIMENSION 2: VOTE OPERATIONS & WEIGHT MECHANICS (TESTS 26 - 45)
  // ===========================================================================

  it('D2-01: Cast vote with default weight (1)', async () => {
    const r = await service.createVotingRound({ title: 'Default Weight', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(res.success, true);
    assert.equal(res.data?.weight, 1);
  });

  it('D2-02: Cast vote with custom valid weight', async () => {
    const r = await service.createVotingRound({ title: 'Custom Weight', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1, 25);
    assert.equal(res.success, true);
    assert.equal(res.data?.weight, 25);
  });

  it('D2-03: Cast vote returns unique voteId and transaction hash', async () => {
    const r = await service.createVotingRound({ title: 'Vote Details', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1, 5);
    assert.ok(res.data?.voteId.startsWith('vote_'));
    assert.ok(res.data?.txHash.startsWith('0x'));
  });

  it('D2-04: Cast vote increments round totalVotes by 1', async () => {
    const r = await service.createVotingRound({ title: 'Vote Count Inc', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);
    const round = await service.getVotingRound(r.data!.roundId);
    assert.equal(round.data?.totalVotes, 1);
  });

  it('D2-05: Cast vote increments round totalWeight by specified weight', async () => {
    const r = await service.createVotingRound({ title: 'Total Weight Inc', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1, 15);
    const round = await service.getVotingRound(r.data!.roundId);
    assert.equal(round.data?.totalWeight, 15);
  });

  it('D2-06: hasUserVoted returns true after voting for product', async () => {
    const r = await service.createVotingRound({ title: 'Has Voted Check', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(await service.hasUserVoted(r.data!.roundId, USER_1, PROD_1), true);
  });

  it('D2-07: hasUserVoted returns false for product not voted for', async () => {
    const r = await service.createVotingRound({ title: 'Has Not Voted Product', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(await service.hasUserVoted(r.data!.roundId, USER_1, PROD_2), false);
  });

  it('D2-08: hasUserVoted without productId returns true if user voted for any product', async () => {
    const r = await service.createVotingRound({ title: 'Any Vote True', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(await service.hasUserVoted(r.data!.roundId, USER_1), true);
  });

  it('D2-09: hasUserVoted without productId returns false if user has not voted in round', async () => {
    const r = await service.createVotingRound({ title: 'Any Vote False', endTime: Date.now() + 50000 });
    assert.equal(await service.hasUserVoted(r.data!.roundId, USER_1), false);
  });

  it('D2-10: getUserVotes returns list of active votes cast by user', async () => {
    const r = await service.createVotingRound({ title: 'Get User Votes', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1, 5);
    await service.castVote(r.data!.roundId, PROD_2, USER_1, 10);

    const votes = await service.getUserVotes(r.data!.roundId, USER_1);
    assert.equal(votes.length, 2);
    assert.equal(votes[0].productId, PROD_1);
    assert.equal(votes[1].productId, PROD_2);
  });

  it('D2-11: getUserVotes returns empty array for user who hasn\'t voted', async () => {
    const r = await service.createVotingRound({ title: 'No Votes User', endTime: Date.now() + 50000 });
    const votes = await service.getUserVotes(r.data!.roundId, USER_2);
    assert.deepEqual(votes, []);
  });

  it('D2-12: User can vote for multiple distinct eligible products in same round', async () => {
    const r = await service.createVotingRound({
      title: 'Multi Product Voting',
      maxVotesPerUser: 3,
      endTime: Date.now() + 50000,
    });
    const r1 = await service.castVote(r.data!.roundId, PROD_1, USER_1);
    const r2 = await service.castVote(r.data!.roundId, PROD_2, USER_1);
    assert.equal(r1.success, true);
    assert.equal(r2.success, true);
  });

  it('D2-13: Multiple distinct users can vote for same product', async () => {
    const r = await service.createVotingRound({ title: 'Multi User Same Product', endTime: Date.now() + 50000 });
    const v1 = await service.castVote(r.data!.roundId, PROD_1, USER_1, 5);
    const v2 = await service.castVote(r.data!.roundId, PROD_1, USER_2, 10);
    assert.equal(v1.success, true);
    assert.equal(v2.success, true);

    const round = await service.getVotingRound(r.data!.roundId);
    assert.equal(round.data?.totalVotes, 2);
    assert.equal(round.data?.totalWeight, 15);
  });

  it('D2-14: Weights from multiple users accumulate correctly on same product', async () => {
    const r = await service.createVotingRound({ title: 'Accumulate Weights', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1, 10);
    await service.castVote(r.data!.roundId, PROD_1, USER_2, 20);
    await service.castVote(r.data!.roundId, PROD_1, USER_3, 30);

    const rankings = await service.getProductRankings(r.data!.roundId);
    assert.equal(rankings[0].productId, PROD_1);
    assert.equal(rankings[0].totalWeight, 60);
    assert.equal(rankings[0].voteCount, 3);
  });

  it('D2-15: Case-insensitive handling of voter Stellar addresses', async () => {
    const r = await service.createVotingRound({ title: 'Case Insensitive Voter', endTime: Date.now() + 50000 });
    const lowerUser = USER_1.toLowerCase();
    const res = await service.castVote(r.data!.roundId, PROD_1, lowerUser, 5);
    assert.equal(res.success, true);

    const hasVotedUpper = await service.hasUserVoted(r.data!.roundId, USER_1, PROD_1);
    assert.equal(hasVotedUpper, true);
  });

  it('D2-16: Stellar address with C contract prefix is accepted', async () => {
    const r = await service.createVotingRound({ title: 'Contract Voter', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, CONTRACT_1, 5);
    assert.equal(res.success, true);
  });

  it('D2-17: EVM-style address (0x...) is accepted', async () => {
    const r = await service.createVotingRound({ title: 'EVM Voter', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, EVM_1, 5);
    assert.equal(res.success, true);
  });

  it('D2-18: Sanitizes floating point weight by rounding down (Math.floor)', async () => {
    const r = await service.createVotingRound({ title: 'Float Sanitization', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1, 7.85);
    assert.equal(res.success, true);
    assert.equal(res.data?.weight, 7);
  });

  it('D2-19: Cast vote updates round updatedAt timestamp', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const r = await service.createVotingRound({ title: 'Timestamp Round', endTime: 50000 });
    mockTime = 2000;
    await service.castVote(r.data!.roundId, PROD_1, USER_1, 5);

    const round = await service.getVotingRound(r.data!.roundId);
    assert.equal(round.data?.updatedAt, 2000);
  });

  it('D2-20: Cast vote on round with unrestricted eligibleProducts accepts any valid productId', async () => {
    const r = await service.createVotingRound({ title: 'Open Round', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, 'custom_unknown_product_999', USER_1, 5);
    assert.equal(res.success, true);
    assert.equal(res.data?.productId, 'custom_unknown_product_999');
  });

  // ===========================================================================
  // DIMENSION 3: RETRACTION, QUORUM & ROUND COMPLETION (TESTS 46 - 65)
  // ===========================================================================

  it('D3-01: Retract vote successfully marks vote inactive', async () => {
    const r = await service.createVotingRound({ title: 'Retract Simple', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    const res = await service.retractVote(roundId, PROD_1, USER_1);
    assert.equal(res.success, true);
    assert.equal(res.data, true);
  });

  it('D3-02: Retract vote decrements round totalVotes by 1', async () => {
    const r = await service.createVotingRound({ title: 'Retract Count Dec', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    await service.retractVote(roundId, PROD_1, USER_1);

    const round = await service.getVotingRound(roundId);
    assert.equal(round.data?.totalVotes, 0);
  });

  it('D3-03: Retract vote decrements round totalWeight by retracted vote\'s weight', async () => {
    const r = await service.createVotingRound({ title: 'Retract Weight Dec', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 15);
    await service.retractVote(roundId, PROD_1, USER_1);

    const round = await service.getVotingRound(roundId);
    assert.equal(round.data?.totalWeight, 0);
  });

  it('D3-04: Retract vote returns true and generates transaction hash', async () => {
    const r = await service.createVotingRound({ title: 'Retract Hash', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    const res = await service.retractVote(roundId, PROD_1, USER_1);
    assert.ok(res.txHash);
    assert.ok(res.txHash.startsWith('0x'));
  });

  it('D3-05: hasUserVoted returns false after vote retraction', async () => {
    const r = await service.createVotingRound({ title: 'Has Voted Post Retract', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    assert.equal(await service.hasUserVoted(roundId, USER_1, PROD_1), true);

    await service.retractVote(roundId, PROD_1, USER_1);
    assert.equal(await service.hasUserVoted(roundId, USER_1, PROD_1), false);
  });

  it('D3-06: getUserVotes does not include retracted votes', async () => {
    const r = await service.createVotingRound({ title: 'Get User Votes Active Only', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.castVote(roundId, PROD_2, USER_1, 10);
    await service.retractVote(roundId, PROD_1, USER_1);

    const votes = await service.getUserVotes(roundId, USER_1);
    assert.equal(votes.length, 1);
    assert.equal(votes[0].productId, PROD_2);
  });

  it('D3-07: User can re-vote for same product after retracting previous vote', async () => {
    const r = await service.createVotingRound({ title: 'Re-vote Allowed', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.retractVote(roundId, PROD_1, USER_1);

    const revoteRes = await service.castVote(roundId, PROD_1, USER_1, 20);
    assert.equal(revoteRes.success, true);
    assert.equal(revoteRes.data?.weight, 20);

    const round = await service.getVotingRound(roundId);
    assert.equal(round.data?.totalVotes, 1);
    assert.equal(round.data?.totalWeight, 20);
  });

  it('D3-08: Retract vote on product A does not affect user\'s active vote on product B', async () => {
    const r = await service.createVotingRound({
      title: 'Selective Retract',
      maxVotesPerUser: 5,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.castVote(roundId, PROD_2, USER_1, 10);

    await service.retractVote(roundId, PROD_1, USER_1);
    assert.equal(await service.hasUserVoted(roundId, USER_1, PROD_1), false);
    assert.equal(await service.hasUserVoted(roundId, USER_1, PROD_2), true);
  });

  it('D3-09: Retract updates round updatedAt timestamp', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const r = await service.createVotingRound({ title: 'Retract Timestamp', endTime: 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    mockTime = 3000;
    await service.retractVote(roundId, PROD_1, USER_1);

    const round = await service.getVotingRound(roundId);
    assert.equal(round.data?.updatedAt, 3000);
  });

  it('D3-10: Retracting multiple votes sequentially leaves totalVotes and totalWeight at 0', async () => {
    const r = await service.createVotingRound({
      title: 'All Retracted',
      maxVotesPerUser: 5,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.castVote(roundId, PROD_2, USER_2, 10);

    await service.retractVote(roundId, PROD_1, USER_1);
    await service.retractVote(roundId, PROD_2, USER_2);

    const round = await service.getVotingRound(roundId);
    assert.equal(round.data?.totalVotes, 0);
    assert.equal(round.data?.totalWeight, 0);
  });

  it('D3-11: Total votes and weight never drop below 0 upon multiple retractions', async () => {
    const r = await service.createVotingRound({ title: 'Non-negative totals', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.retractVote(roundId, PROD_1, USER_1);

    const round = await service.getVotingRound(roundId);
    assert.ok(round.data!.totalVotes >= 0);
    assert.ok(round.data!.totalWeight >= 0);
  });

  it('D3-12: Quorum check: passes when totalWeight matches exact quorum', () => {
    assert.equal(checkQuorum(50, 50), true);
  });

  it('D3-13: Quorum check: fails when weight drops below quorum after retraction', async () => {
    const r = await service.createVotingRound({ title: 'Quorum Drop', quorum: 15, endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    await service.castVote(roundId, PROD_2, USER_2, 10);
    // Total was 20 >= 15
    await service.retractVote(roundId, PROD_2, USER_2);
    // Total is now 10 < 15

    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.quorumReached, false);
  });

  it('D3-14: Ending round after retractions calculates rankings only from active votes', async () => {
    const r = await service.createVotingRound({ title: 'Rankings Post Retract', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 50);
    await service.castVote(roundId, PROD_2, USER_2, 20);
    await service.retractVote(roundId, PROD_1, USER_1);

    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.rankings.length, 1);
    assert.equal(endRes.data?.rankings[0].productId, PROD_2);
  });

  it('D3-15: Winning product correctly recalculates after previous leader\'s votes are retracted', async () => {
    const r = await service.createVotingRound({ title: 'Winner Recalc', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 50);
    await service.castVote(roundId, PROD_2, USER_2, 30);
    await service.retractVote(roundId, PROD_1, USER_1);

    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.winningProductId, PROD_2);
  });

  it('D3-16: End round with multiple products with same weight breaks ties by voteCount', async () => {
    const r = await service.createVotingRound({ title: 'Tie Break Vote Count', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    // PROD_1: 2 votes, weight 10 each = total 20
    await service.castVote(roundId, PROD_1, USER_1, 10);
    await service.castVote(roundId, PROD_1, USER_2, 10);

    // PROD_2: 1 vote, weight 20 = total 20
    await service.castVote(roundId, PROD_2, USER_3, 20);

    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.rankings[0].productId, PROD_1); // 2 votes wins over 1 vote
    assert.equal(endRes.data?.rankings[1].productId, PROD_2);
  });

  it('D3-17: End round with multiple products with same weight and voteCount breaks ties alphabetically', async () => {
    const r = await service.createVotingRound({ title: 'Tie Break Alpha', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, 'prod_b_item', USER_1, 10);
    await service.castVote(roundId, 'prod_a_item', USER_2, 10);

    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.data?.rankings[0].productId, 'prod_a_item');
    assert.equal(endRes.data?.rankings[1].productId, 'prod_b_item');
  });

  it('D3-18: End round with quorum=0 always has quorumReached=true', async () => {
    const r = await service.createVotingRound({ title: 'Zero Quorum', quorum: 0, endTime: Date.now() + 50000 });
    const endRes = await service.endVotingRound(r.data!.roundId);
    assert.equal(endRes.data?.quorumReached, true);
  });

  it('D3-19: Retracting with case-insensitive voter address matches and succeeds', async () => {
    const r = await service.createVotingRound({ title: 'Retract Case Match', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1.toUpperCase(), 10);
    const retractRes = await service.retractVote(roundId, PROD_1, USER_1.toLowerCase());
    assert.equal(retractRes.success, true);
  });

  it('D3-20: End round records accurate endedAt timestamp', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    const r = await service.createVotingRound({ title: 'Ended At Record', endTime: 50000 });
    mockTime = 7777;
    const endRes = await service.endVotingRound(r.data!.roundId);
    assert.equal(endRes.data?.endedAt, 7777);
  });

  // ===========================================================================
  // DIMENSION 4: NEGATIVE PATHS & ERROR CODES (TESTS 66 - 85)
  // ===========================================================================

  it('D4-01: Rejects createVotingRound with empty title (INVALID_ROUND_PARAMS)', async () => {
    const res = await service.createVotingRound({ title: '   ', endTime: Date.now() + 50000 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_ROUND_PARAMS);
  });

  it('D4-02: Rejects createVotingRound when endTime <= startTime (INVALID_ROUND_PARAMS)', async () => {
    const now = Date.now();
    const res = await service.createVotingRound({ title: 'Bad Duration', startTime: now + 5000, endTime: now + 1000 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_ROUND_PARAMS);
  });

  it('D4-03: Rejects createVotingRound with invalid endTime (INVALID_ROUND_PARAMS)', async () => {
    const res = await service.createVotingRound({ title: 'Invalid End', endTime: 0 });
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_ROUND_PARAMS);
  });

  it('D4-04: Rejects getVotingRound for non-existent roundId (ROUND_NOT_FOUND)', async () => {
    const res = await service.getVotingRound('non_existent_round');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_NOT_FOUND);
  });

  it('D4-05: Rejects castVote for non-existent roundId (ROUND_NOT_FOUND)', async () => {
    const res = await service.castVote('non_existent_round', PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_NOT_FOUND);
  });

  it('D4-06: Rejects castVote when round is PENDING (ROUND_NOT_ACTIVE)', async () => {
    const now = Date.now();
    const r = await service.createVotingRound({
      title: 'Pending Round',
      startTime: now + 50000,
      endTime: now + 100000,
    });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_NOT_ACTIVE);
  });

  it('D4-07: Rejects castVote when round is ENDED (ROUND_NOT_ACTIVE)', async () => {
    const r = await service.createVotingRound({ title: 'Ended Round Vote', endTime: Date.now() + 50000 });
    await service.endVotingRound(r.data!.roundId);

    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_NOT_ACTIVE);
  });

  it('D4-08: Rejects castVote with invalid voter Stellar address (INVALID_VOTER_ADDRESS)', async () => {
    const r = await service.createVotingRound({ title: 'Invalid Address Vote', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, 'invalid_address_format');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_VOTER_ADDRESS);
  });

  it('D4-09: Rejects castVote with empty productId (INVALID_PRODUCT_ID)', async () => {
    const r = await service.createVotingRound({ title: 'Empty Product Vote', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, '   ', USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_PRODUCT_ID);
  });

  it('D4-10: Rejects castVote when product is not in eligibleProducts (PRODUCT_NOT_ELIGIBLE)', async () => {
    const r = await service.createVotingRound({
      title: 'Restricted Products',
      eligibleProducts: [PROD_1, PROD_2],
      endTime: Date.now() + 50000,
    });
    const res = await service.castVote(r.data!.roundId, PROD_3, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.PRODUCT_NOT_ELIGIBLE);
  });

  it('D4-11: Rejects castVote when user has already voted for same product (USER_ALREADY_VOTED)', async () => {
    const r = await service.createVotingRound({ title: 'Duplicate Vote', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);

    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.USER_ALREADY_VOTED);
  });

  it('D4-12: Rejects castVote when user exceeds maxVotesPerUser (MAX_VOTES_EXCEEDED)', async () => {
    const r = await service.createVotingRound({
      title: 'Max Votes Test',
      maxVotesPerUser: 2,
      endTime: Date.now() + 50000,
    });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);
    await service.castVote(r.data!.roundId, PROD_2, USER_1);

    const res = await service.castVote(r.data!.roundId, PROD_3, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.MAX_VOTES_EXCEEDED);
  });

  it('D4-13: Rejects castVote with negative weight (INVALID_WEIGHT)', async () => {
    const r = await service.createVotingRound({ title: 'Negative Weight', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1, -5);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_WEIGHT);
  });

  it('D4-14: Rejects castVote with zero weight (INVALID_WEIGHT)', async () => {
    const r = await service.createVotingRound({ title: 'Zero Weight', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1, 0);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_WEIGHT);
  });

  it('D4-15: Rejects castVote with weight exceeding MAX (100) (INVALID_WEIGHT)', async () => {
    const r = await service.createVotingRound({ title: 'Excess Weight', endTime: Date.now() + 50000 });
    const res = await service.castVote(r.data!.roundId, PROD_1, USER_1, 101);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.INVALID_WEIGHT);
  });

  it('D4-16: Rejects retractVote when roundId does not exist (ROUND_NOT_FOUND)', async () => {
    const res = await service.retractVote('non_existent_round', PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_NOT_FOUND);
  });

  it('D4-17: Rejects retractVote when round is not active (ROUND_NOT_ACTIVE)', async () => {
    const r = await service.createVotingRound({ title: 'Ended Retract', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);
    await service.endVotingRound(r.data!.roundId);

    const res = await service.retractVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_NOT_ACTIVE);
  });

  it('D4-18: Rejects retractVote when round has allowRetract=false (RETRACT_NOT_ALLOWED)', async () => {
    const r = await service.createVotingRound({
      title: 'No Retract Round',
      allowRetract: false,
      endTime: Date.now() + 50000,
    });
    await service.castVote(r.data!.roundId, PROD_1, USER_1);

    const res = await service.retractVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.RETRACT_NOT_ALLOWED);
  });

  it('D4-19: Rejects retractVote when user has no active vote for product (VOTE_NOT_FOUND)', async () => {
    const r = await service.createVotingRound({ title: 'Not Voted Retract', endTime: Date.now() + 50000 });
    const res = await service.retractVote(r.data!.roundId, PROD_1, USER_1);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.VOTE_NOT_FOUND);
  });

  it('D4-20: Rejects endVotingRound when round has already ended (ROUND_ALREADY_ENDED)', async () => {
    const r = await service.createVotingRound({ title: 'Already Ended Check', endTime: Date.now() + 50000 });
    await service.endVotingRound(r.data!.roundId);

    const res = await service.endVotingRound(r.data!.roundId);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_ALREADY_ENDED);
  });

  // ===========================================================================
  // DIMENSION 5: RANKINGS, LEADERBOARD, REWARDS & CONCURRENCY STRESS (TESTS 86 - 105)
  // ===========================================================================

  it('D5-01: getProductRankings returns all eligible products with their ranks', async () => {
    const r = await service.createVotingRound({
      title: 'Eligible Rankings',
      eligibleProducts: [PROD_1, PROD_2, PROD_3],
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 20);
    await service.castVote(roundId, PROD_2, USER_2, 10);

    const rankings = await service.getProductRankings(roundId);
    assert.equal(rankings.length, 3);
    assert.equal(rankings[0].productId, PROD_1);
    assert.equal(rankings[0].rank, 1);
    assert.equal(rankings[1].productId, PROD_2);
    assert.equal(rankings[1].rank, 2);
    assert.equal(rankings[2].productId, PROD_3);
    assert.equal(rankings[2].rank, 3);
  });

  it('D5-02: getProductRankings includes products with 0 votes ranked below active products', async () => {
    const r = await service.createVotingRound({
      title: 'Zero Vote Rank',
      eligibleProducts: [PROD_1, PROD_2],
      endTime: Date.now() + 50000,
    });
    await service.castVote(r.data!.roundId, PROD_1, USER_1, 5);

    const rankings = await service.getProductRankings(r.data!.roundId);
    assert.equal(rankings[1].productId, PROD_2);
    assert.equal(rankings[1].voteCount, 0);
    assert.equal(rankings[1].totalWeight, 0);
  });

  it('D5-03: getProductRankings calculates accurate percentage of total round weight', async () => {
    const r = await service.createVotingRound({ title: 'Percentage Calc', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 75);
    await service.castVote(roundId, PROD_2, USER_2, 25);

    const rankings = await service.getProductRankings(roundId);
    assert.equal(rankings[0].percentage, 75);
    assert.equal(rankings[1].percentage, 25);
  });

  it('D5-04: getProductRankings sets category field when specified', async () => {
    const r = await service.createVotingRound({
      title: 'Category Test',
      category: 'Electronics',
      endTime: Date.now() + 50000,
    });
    await service.castVote(r.data!.roundId, PROD_1, USER_1, 10);

    const rankings = await service.getProductRankings(r.data!.roundId);
    assert.equal(rankings[0].category, 'Electronics');
  });

  it('D5-05: getTopProducts limits results to requested count', async () => {
    const r = await service.createVotingRound({ title: 'Top Products Limit', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 5);
    await service.castVote(roundId, PROD_2, USER_2, 10);
    await service.castVote(roundId, PROD_3, USER_3, 15);

    const top2 = await service.getTopProducts(roundId, 2);
    assert.equal(top2.length, 2);
    assert.equal(top2[0].productId, PROD_3);
    assert.equal(top2[1].productId, PROD_2);
  });

  it('D5-06: getTopProducts defaults to 10 when limit omitted', async () => {
    const r = await service.createVotingRound({ title: 'Top Products Default', endTime: Date.now() + 50000 });
    const top = await service.getTopProducts(r.data!.roundId);
    assert.ok(Array.isArray(top));
    assert.ok(top.length <= 10);
  });

  it('D5-07: getTopProducts returns empty array for round with no products/votes', async () => {
    const r = await service.createVotingRound({ title: 'Empty Top', endTime: Date.now() + 50000 });
    const top = await service.getTopProducts(r.data!.roundId);
    assert.deepEqual(top, []);
  });

  it('D5-08: distributeVoterRewards rejects on round not ended (ROUND_NOT_ENDED)', async () => {
    const r = await service.createVotingRound({
      title: 'Premature Rewards',
      rewardPool: 500,
      endTime: Date.now() + 50000,
    });
    const res = await service.distributeVoterRewards(r.data!.roundId);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.ROUND_NOT_ENDED);
  });

  it('D5-09: distributeVoterRewards rejects when no active votes exist (NO_VOTERS_FOR_REWARDS)', async () => {
    const r = await service.createVotingRound({
      title: 'Empty Voters Rewards',
      rewardPool: 500,
      endTime: Date.now() + 50000,
    });
    await service.endVotingRound(r.data!.roundId);

    const res = await service.distributeVoterRewards(r.data!.roundId);
    assert.equal(res.success, false);
    assert.equal(res.error?.code, VOTING_ERROR_CODES.NO_VOTERS_FOR_REWARDS);
  });

  it('D5-10: distributeVoterRewards distributes proportionally to voter total weight', async () => {
    const r = await service.createVotingRound({
      title: 'Proportional Rewards',
      rewardPool: 1000,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 50);
    await service.castVote(roundId, PROD_2, USER_2, 50);
    await service.endVotingRound(roundId);

    const res = await service.distributeVoterRewards(roundId);
    assert.equal(res.success, true);
    assert.equal(res.data?.totalDistributed, 1000);
    assert.equal(res.data?.recipientCount, 2);
    assert.equal(res.data?.distributions[0].rewardAmount, 500);
    assert.equal(res.data?.distributions[1].rewardAmount, 500);
  });

  it('D5-11: distributeVoterRewards handles unequal weights (e.g. 75% vs 25% distribution)', async () => {
    const r = await service.createVotingRound({
      title: 'Unequal Rewards',
      rewardPool: 1000,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 75);
    await service.castVote(roundId, PROD_2, USER_2, 25);
    await service.endVotingRound(roundId);

    const res = await service.distributeVoterRewards(roundId);
    assert.equal(res.success, true);
    assert.equal(res.data?.distributions[0].rewardAmount, 750);
    assert.equal(res.data?.distributions[1].rewardAmount, 250);
  });

  it('D5-12: distributeVoterRewards prevents double distribution (REWARDS_ALREADY_DISTRIBUTED)', async () => {
    const r = await service.createVotingRound({
      title: 'Double Reward Protect',
      rewardPool: 1000,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    await service.endVotingRound(roundId);
    await service.distributeVoterRewards(roundId);

    const second = await service.distributeVoterRewards(roundId);
    assert.equal(second.success, false);
    assert.equal(second.error?.code, VOTING_ERROR_CODES.REWARDS_ALREADY_DISTRIBUTED);
  });

  it('D5-13: distributeVoterRewards generates transaction hash', async () => {
    const r = await service.createVotingRound({
      title: 'Reward Hash',
      rewardPool: 500,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    await service.castVote(roundId, PROD_1, USER_1, 10);
    await service.endVotingRound(roundId);
    const res = await service.distributeVoterRewards(roundId);
    assert.ok(res.txHash);
    assert.ok(res.txHash.startsWith('0x'));
  });

  it('D5-14: getRawVotes returns immutable clone preventing internal state tampering', async () => {
    const r = await service.createVotingRound({ title: 'Immutable Votes', endTime: Date.now() + 50000 });
    await service.castVote(r.data!.roundId, PROD_1, USER_1, 10);

    const raw = service.getRawVotes();
    assert.equal(raw.length, 1);
    raw[0].weight = 9999;

    const roundVotes = await service.getUserVotes(r.data!.roundId, USER_1);
    assert.equal(roundVotes[0].weight, 10);
  });

  it('D5-15: getRawRounds returns immutable clone preventing internal state tampering', async () => {
    const r = await service.createVotingRound({ title: 'Immutable Rounds', endTime: Date.now() + 50000 });
    const raw = service.getRawRounds();
    raw[0].title = 'Tampered Title';

    const round = await service.getVotingRound(r.data!.roundId);
    assert.equal(round.data?.title, 'Immutable Rounds');
  });

  it('D5-16: Stress test: 30 concurrent voters vote for different products with full data integrity', async () => {
    const r = await service.createVotingRound({
      title: 'Concurrency Stress',
      maxVotesPerUser: 10,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const voters = Array.from({ length: 30 }, (_, i) => {
      const char = base32Chars[i % base32Chars.length];
      return `G${char}BD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`;
    });

    const votePromises = voters.map((voter, index) => {
      const prod = index % 2 === 0 ? PROD_1 : PROD_2;
      return service.castVote(roundId, prod, voter, 2);
    });

    const results = await Promise.all(votePromises);
    assert.ok(results.every((res) => res.success));

    const round = await service.getVotingRound(roundId);
    assert.equal(round.data?.totalVotes, 30);
    assert.equal(round.data?.totalWeight, 60);
  });

  it('D5-17: Stress test: 1 user casts maximum permitted votes across distinct products', async () => {
    const r = await service.createVotingRound({
      title: 'Max User Votes Stress',
      maxVotesPerUser: 10,
      endTime: Date.now() + 50000,
    });
    const roundId = r.data!.roundId;

    for (let i = 1; i <= 10; i++) {
      const res = await service.castVote(roundId, `prod_item_${i}`, USER_1, 1);
      assert.equal(res.success, true);
    }

    const votes = await service.getUserVotes(roundId, USER_1);
    assert.equal(votes.length, 10);

    // 11th vote must fail
    const overflow = await service.castVote(roundId, 'prod_item_11', USER_1, 1);
    assert.equal(overflow.success, false);
    assert.equal(overflow.error?.code, VOTING_ERROR_CODES.MAX_VOTES_EXCEEDED);
  });

  it('D5-18: Stress test: leaderboards across 15 products with varied weights correctly sorted', async () => {
    const r = await service.createVotingRound({ title: 'Leaderboard Sort 15', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    for (let i = 1; i <= 15; i++) {
      const char = base32Chars[i % base32Chars.length];
      const voter = `G${char}BD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`;
      await service.castVote(roundId, `prod_${i}`, voter, i);
    }

    const top = await service.getTopProducts(roundId, 15);
    assert.equal(top.length, 15);
    // Highest weight (15) must be rank 1
    assert.equal(top[0].productId, 'prod_15');
    assert.equal(top[0].totalWeight, 15);
    assert.equal(top[14].productId, 'prod_1');
    assert.equal(top[14].totalWeight, 1);
  });

  it('D5-19: Stress test: high-frequency voting and retraction maintains exact weight balance', async () => {
    const r = await service.createVotingRound({ title: 'High Frequency Flip', endTime: Date.now() + 50000 });
    const roundId = r.data!.roundId;

    for (let i = 0; i < 5; i++) {
      await service.castVote(roundId, PROD_1, USER_1, 10);
      await service.retractVote(roundId, PROD_1, USER_1);
    }

    const round = await service.getVotingRound(roundId);
    assert.equal(round.data?.totalVotes, 0);
    assert.equal(round.data?.totalWeight, 0);
  });

  it('D5-20: Full voting lifecycle: create -> votes -> retractions -> end -> rankings -> rewards', async () => {
    let mockTime = 1000;
    service.setTimeProvider(() => mockTime);

    // 1. Create round
    const r = await service.createVotingRound({
      title: 'Full Lifecycle Grand Prix',
      rewardPool: 2000,
      quorum: 20,
      endTime: 10000,
    });
    const roundId = r.data!.roundId;

    // 2. Cast initial votes
    await service.castVote(roundId, PROD_1, USER_1, 30);
    await service.castVote(roundId, PROD_2, USER_2, 20);
    await service.castVote(roundId, PROD_3, USER_3, 10);

    // 3. Retract one vote
    await service.retractVote(roundId, PROD_3, USER_3);

    // 4. End round
    mockTime = 10001;
    const endRes = await service.endVotingRound(roundId);
    assert.equal(endRes.success, true);
    assert.equal(endRes.data?.winningProductId, PROD_1);
    assert.equal(endRes.data?.quorumReached, true);
    assert.equal(endRes.data?.totalWeight, 50);

    // 5. Rankings
    const rankings = await service.getProductRankings(roundId);
    assert.equal(rankings[0].productId, PROD_1);
    assert.equal(rankings[0].rank, 1);
    assert.equal(rankings[1].productId, PROD_2);
    assert.equal(rankings[1].rank, 2);

    // 6. Reward distribution
    const rewardRes = await service.distributeVoterRewards(roundId);
    assert.equal(rewardRes.success, true);
    assert.equal(rewardRes.data?.totalDistributed, 2000);
    assert.equal(rewardRes.data?.recipientCount, 2);
    // USER_1 had 30/50 = 60% of pool ($1200), USER_2 had 20/50 = 40% ($800)
    assert.equal(rewardRes.data?.distributions[0].rewardAmount, 1200);
    assert.equal(rewardRes.data?.distributions[1].rewardAmount, 800);
  });
});
