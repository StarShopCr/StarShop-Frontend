import test from 'node:test';
import assert from 'node:assert/strict';

import { PaymentEscrowService } from '../escrow.service';
import { ESCROW_ERROR_CODES } from '../constants/escrow.constants';
import {
  isValidStellarAddress,
  calculateSplitAmounts,
} from '../utils/escrow.utils';
import type { CreateEscrowParams } from '../types/escrow.types';

// Mock Stellar addresses
const BUYER_ADDR = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const SELLER_ADDR = 'GCLWGQPMK3WSPFJBNFQU6RNPISMRR72WNSHS7V5F6K37Z56ZJPSK7WVT';
const ARBITRATOR_ADDR = 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ';
const THIRD_PARTY_ADDR = 'GB7BBNZAC6G6WNVX6HN3SCYPDNPWGSK6YHAADB4VYDX76ZGE2LKUHSPO';

const BASE_PARAMS: CreateEscrowParams = {
  buyer: BUYER_ADDR,
  seller: SELLER_ADDR,
  amount: 500,
  currency: 'USDC',
  title: 'Hardware Development Milestone 1',
  description: 'First milestone delivery of custom StarShop IoT board',
  autoReleaseSeconds: 86400 * 7,
};

// =============================================================================
// DIMENSION 1: ESCROW LIFECYCLE & MANAGEMENT (TESTS 1 - 25)
// =============================================================================

test('D1-01: Create escrow with standard parameters initializes CREATED and UNFUNDED', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow(BASE_PARAMS);

  assert.equal(res.success, true);
  assert.ok(res.data?.id.startsWith('esc_'));
  assert.equal(res.data?.status, 'CREATED');
  assert.equal(res.data?.paymentStatus, 'UNFUNDED');
  assert.equal(res.data?.depositedAmount, 0);
});

test('D1-02: Create escrow with custom currency (XLM)', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({ ...BASE_PARAMS, currency: 'XLM' });

  assert.equal(res.success, true);
  assert.equal(res.data?.currency, 'XLM');
});

test('D1-03: Create escrow with initial arbitrator pre-assigned', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({
    ...BASE_PARAMS,
    arbitrator: ARBITRATOR_ADDR,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.arbitrator, ARBITRATOR_ADDR);
});

test('D1-04: Create escrow with custom autoReleaseSeconds', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({
    ...BASE_PARAMS,
    autoReleaseSeconds: 3600,
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.autoReleaseSeconds, 3600);
});

test('D1-05: Create escrow with custom metadata', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({
    ...BASE_PARAMS,
    metadata: { orderId: 'ORD-999', invoiceNumber: 12345 },
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.metadata?.orderId, 'ORD-999');
});

test('D1-06: Get existing escrow returns accurate snapshot', async () => {
  const service = new PaymentEscrowService();
  const created = (await service.createEscrow(BASE_PARAMS)).data!;

  const fetched = await service.getEscrow(created.id);
  assert.equal(fetched.success, true);
  assert.equal(fetched.data?.id, created.id);
  assert.equal(fetched.data?.amount, 500);
});

test('D1-07: Get non-existent escrow returns ESCROW_NOT_FOUND', async () => {
  const service = new PaymentEscrowService();
  const res = await service.getEscrow('non_existent');

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_NOT_FOUND);
});

test('D1-08: Update escrow title and description succeeds', async () => {
  const service = new PaymentEscrowService();
  const created = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.updateEscrow(created.id, {
    title: 'Updated Milestone Title',
    description: 'Updated description',
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.title, 'Updated Milestone Title');
  assert.equal(res.data?.description, 'Updated description');
});

test('D1-09: Update escrow amount succeeds while unfunded', async () => {
  const service = new PaymentEscrowService();
  const created = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.updateEscrow(created.id, { amount: 750 });
  assert.equal(res.success, true);
  assert.equal(res.data?.amount, 750);
});

test('D1-10: Update escrow autoReleaseSeconds succeeds', async () => {
  const service = new PaymentEscrowService();
  const created = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.updateEscrow(created.id, { autoReleaseSeconds: 14400 });
  assert.equal(res.success, true);
  assert.equal(res.data?.autoReleaseSeconds, 14400);
});

test('D1-11: Update escrow metadata succeeds', async () => {
  const service = new PaymentEscrowService();
  const created = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.updateEscrow(created.id, {
    metadata: { tier: 'Enterprise' },
  });

  assert.equal(res.success, true);
  assert.equal(res.data?.metadata?.tier, 'Enterprise');
});

test('D1-12: Cancel unfunded escrow succeeds and sets status CANCELLED', async () => {
  const service = new PaymentEscrowService();
  const created = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.cancelEscrow(created.id);
  assert.equal(res.success, true);

  const updated = (await service.getEscrow(created.id)).data!;
  assert.equal(updated.status, 'CANCELLED');
});

test('D1-13: Cancel escrow returns valid transaction hash', async () => {
  const service = new PaymentEscrowService();
  const created = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.cancelEscrow(created.id);
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D1-14: List escrows returns all created escrows', async () => {
  const service = new PaymentEscrowService();
  await service.createEscrow(BASE_PARAMS);
  await service.createEscrow({ ...BASE_PARAMS, amount: 1000 });

  const list = service.listEscrows();
  assert.equal(list.length, 2);
});

test('D1-15: List escrows reflects status updates accurately', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.cancelEscrow(esc.id);

  const list = service.listEscrows();
  assert.equal(list[0].status, 'CANCELLED');
});

test('D1-16: Reset state clears all escrows and disputes', async () => {
  const service = new PaymentEscrowService();
  await service.createEscrow(BASE_PARAMS);
  assert.equal(service.listEscrows().length, 1);

  service.resetState();
  assert.equal(service.listEscrows().length, 0);
});

test('D1-17: Deposit exactly full amount moves status to FUNDED and FULLY_FUNDED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.depositPayment(esc.id, 500, BUYER_ADDR);
  assert.equal(res.success, true);
  assert.equal(res.data?.paymentStatus, 'FULLY_FUNDED');

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.status, 'FUNDED');
  assert.equal(updated.depositedAmount, 500);
});

test('D1-18: Deposit partial amount moves status to PARTIALLY_FUNDED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.depositPayment(esc.id, 200, BUYER_ADDR);
  assert.equal(res.success, true);
  assert.equal(res.data?.paymentStatus, 'PARTIALLY_FUNDED');
  assert.equal(res.data?.remaining, 300);
});

test('D1-19: Multiple sequential partial deposits aggregate correctly', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  await service.depositPayment(esc.id, 200, BUYER_ADDR);
  await service.depositPayment(esc.id, 200, BUYER_ADDR);
  const finalDeposit = await service.depositPayment(esc.id, 100, BUYER_ADDR);

  assert.equal(finalDeposit.data?.paymentStatus, 'FULLY_FUNDED');
  assert.equal(finalDeposit.data?.totalDeposited, 500);
  assert.equal(finalDeposit.data?.remaining, 0);
});

test('D1-20: Release payment by buyer transfers funds and marks RELEASED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.releasePayment(esc.id, BUYER_ADDR);
  assert.equal(res.success, true);

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.status, 'RELEASED');
  assert.equal(updated.paymentStatus, 'RELEASED');
});

test('D1-21: Refund payment by seller returns funds and marks REFUNDED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.refundPayment(esc.id, SELLER_ADDR);
  assert.equal(res.success, true);

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.status, 'REFUNDED');
  assert.equal(updated.paymentStatus, 'REFUNDED');
});

test('D1-22: Completed escrow records completedAt timestamp', async () => {
  let simTime = 5000000;
  const service = new PaymentEscrowService({ timeProvider: () => simTime });
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  simTime += 500;
  await service.releasePayment(esc.id, BUYER_ADDR);

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.completedAt, 5000500);
});

test('D1-23: getPaymentStatus returns accurate status for each stage', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  assert.equal(await service.getPaymentStatus(esc.id), 'UNFUNDED');
  await service.depositPayment(esc.id, 250, BUYER_ADDR);
  assert.equal(await service.getPaymentStatus(esc.id), 'PARTIALLY_FUNDED');
  await service.depositPayment(esc.id, 250, BUYER_ADDR);
  assert.equal(await service.getPaymentStatus(esc.id), 'FULLY_FUNDED');
  await service.releasePayment(esc.id, BUYER_ADDR);
  assert.equal(await service.getPaymentStatus(esc.id), 'RELEASED');
});

test('D1-24: Escrow IDs follow esc_<timestamp>_<rand> pattern', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  assert.match(esc.id, /^esc_\d+_[a-z0-9]+$/);
});

test('D1-25: Tx hashes generated follow 64 hex character standard', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow(BASE_PARAMS);
  assert.equal(res.transactionHash?.length, 66); // 0x + 64 hex
});

// =============================================================================
// DIMENSION 2: PAYMENT OPERATIONS & ESCROW FUNDING (TESTS 26 - 45)
// =============================================================================

test('D2-01: Deposit returns DepositResult with totalDeposited and remaining', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.depositPayment(esc.id, 150, BUYER_ADDR);
  assert.equal(res.data?.totalDeposited, 150);
  assert.equal(res.data?.remaining, 350);
  assert.equal(res.data?.payer, BUYER_ADDR);
});

test('D2-02: Deposit by third party or buyer succeeds with valid address', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.depositPayment(esc.id, 500, THIRD_PARTY_ADDR);
  assert.equal(res.success, true);
  assert.equal(res.data?.payer, THIRD_PARTY_ADDR);
});

test('D2-03: Multiple deposits increment depositedAmount atomically', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  await service.depositPayment(esc.id, 100, BUYER_ADDR);
  await service.depositPayment(esc.id, 150, BUYER_ADDR);
  await service.depositPayment(esc.id, 250, BUYER_ADDR);

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.depositedAmount, 500);
});

test('D2-04: Full deposit sets fundedAt timestamp', async () => {
  let simTime = 8000000;
  const service = new PaymentEscrowService({ timeProvider: () => simTime });
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  simTime += 200;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.fundedAt, 8000200);
});

test('D2-05: Release payment by designated arbitrator succeeds', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;

  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  const res = await service.releasePayment(esc.id, ARBITRATOR_ADDR);

  assert.equal(res.success, true);
  assert.equal((await service.getEscrow(esc.id)).data?.status, 'RELEASED');
});

test('D2-06: Auto-release: seller can release funds after autoReleaseSeconds expires', async () => {
  let simTime = 1000000;
  const service = new PaymentEscrowService({ timeProvider: () => simTime });
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      autoReleaseSeconds: 3600, // 1 hour
    })
  ).data!;

  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  // Fast forward past auto-release window
  simTime += 3601;

  const res = await service.releasePayment(esc.id, SELLER_ADDR);
  assert.equal(res.success, true);
});

test('D2-07: Auto-release: seller cannot release funds before autoReleaseSeconds expires', async () => {
  let simTime = 1000000;
  const service = new PaymentEscrowService({ timeProvider: () => simTime });
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      autoReleaseSeconds: 3600,
    })
  ).data!;

  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  // Only 30 minutes passed
  simTime += 1800;

  const res = await service.releasePayment(esc.id, SELLER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.UNAUTHORIZED);
});

test('D2-08: Voluntary refund by seller returns success and sets status REFUNDED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.refundPayment(esc.id, SELLER_ADDR);
  assert.equal(res.success, true);
  assert.equal((await service.getEscrow(esc.id)).data?.status, 'REFUNDED');
});

test('D2-09: Arbitrator can authorize refund directly', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;

  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  const res = await service.refundPayment(esc.id, ARBITRATOR_ADDR);

  assert.equal(res.success, true);
  assert.equal((await service.getEscrow(esc.id)).data?.status, 'REFUNDED');
});

test('D2-10: Release payment generates transaction hash', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.releasePayment(esc.id, BUYER_ADDR);
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D2-11: Refund payment generates transaction hash', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.refundPayment(esc.id, SELLER_ADDR);
  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D2-12: Zero remaining balance on exact full deposit', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.depositPayment(esc.id, 500, BUYER_ADDR);
  assert.equal(res.data?.remaining, 0);
});

test('D2-13: Fractional deposit amounts calculate cleanly without precision drift', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow({ ...BASE_PARAMS, amount: 100.55 })).data!;

  const r1 = await service.depositPayment(esc.id, 50.25, BUYER_ADDR);
  assert.equal(r1.data?.remaining, 50.3);

  const r2 = await service.depositPayment(esc.id, 50.3, BUYER_ADDR);
  assert.equal(r2.data?.remaining, 0);
  assert.equal(r2.data?.paymentStatus, 'FULLY_FUNDED');
});

test('D2-14: Sequential 10 micro-deposits accumulate to total escrow amount', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow({ ...BASE_PARAMS, amount: 100 })).data!;

  for (let i = 0; i < 10; i++) {
    await service.depositPayment(esc.id, 10, BUYER_ADDR);
  }

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.depositedAmount, 100);
  assert.equal(updated.status, 'FUNDED');
});

test('D2-15: Release payment transitions paymentStatus to RELEASED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.releasePayment(esc.id, BUYER_ADDR);

  assert.equal(await service.getPaymentStatus(esc.id), 'RELEASED');
});

test('D2-16: Refund payment transitions paymentStatus to REFUNDED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.refundPayment(esc.id, SELLER_ADDR);

  assert.equal(await service.getPaymentStatus(esc.id), 'REFUNDED');
});

test('D2-17: Timestamps match simulated clock provider', async () => {
  let simTime = 99988877;
  const service = new PaymentEscrowService({ timeProvider: () => simTime });
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  assert.equal(esc.createdAt, 99988877);
});

test('D2-18: UpdatedAt timestamp updates on each payment operation', async () => {
  let simTime = 1000000;
  const service = new PaymentEscrowService({ timeProvider: () => simTime });
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  simTime += 500;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.updatedAt, 1000500);
});

test('D2-19: Multiple escrows funded simultaneously track independent balances', async () => {
  const service = new PaymentEscrowService();
  const esc1 = (await service.createEscrow({ ...BASE_PARAMS, amount: 200 })).data!;
  const esc2 = (await service.createEscrow({ ...BASE_PARAMS, amount: 800 })).data!;

  await service.depositPayment(esc1.id, 200, BUYER_ADDR);
  await service.depositPayment(esc2.id, 300, BUYER_ADDR);

  assert.equal((await service.getEscrow(esc1.id)).data?.depositedAmount, 200);
  assert.equal((await service.getEscrow(esc2.id)).data?.depositedAmount, 300);
});

test('D2-20: Deposit on partially funded escrow accurately calculates remaining amount', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow({ ...BASE_PARAMS, amount: 1000 })).data!;

  await service.depositPayment(esc.id, 350, BUYER_ADDR);
  const r2 = await service.depositPayment(esc.id, 250, BUYER_ADDR);

  assert.equal(r2.data?.totalDeposited, 600);
  assert.equal(r2.data?.remaining, 400);
});

// =============================================================================
// DIMENSION 3: DISPUTE MANAGEMENT & ARBITRATION (TESTS 46 - 65)
// =============================================================================

test('D3-01: Buyer opens dispute on funded escrow -> status DISPUTED, dispute OPEN', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.createDispute(esc.id, 'Goods not received as described', BUYER_ADDR);
  assert.equal(res.success, true);
  assert.equal(res.data?.status, 'OPEN');

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.status, 'DISPUTED');
});

test('D3-02: Seller opens dispute on funded escrow -> status DISPUTED, dispute OPEN', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.createDispute(esc.id, 'Buyer refusing acceptance unfairly', SELLER_ADDR);
  assert.equal(res.success, true);
  assert.equal(res.data?.status, 'OPEN');
});

test('D3-03: Dispute details contain initiator, reason, escrowId, arbitrator', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.createDispute(esc.id, 'Inspection failed', BUYER_ADDR);
  assert.equal(res.data?.initiator, BUYER_ADDR);
  assert.equal(res.data?.reason, 'Inspection failed');
  assert.equal(res.data?.arbitrator, ARBITRATOR_ADDR);
});

test('D3-04: getDispute returns cloned dispute object', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  const fetched = await service.getDispute(disp.id);

  assert.equal(fetched.id, disp.id);
  assert.equal(fetched.reason, 'Reason');
});

test('D3-05: getDisputeStatus returns OPEN for active dispute', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  assert.equal(await service.getDisputeStatus(disp.id), 'OPEN');
});

test('D3-06: Resolve dispute with RELEASE_TO_SELLER by assigned arbitrator -> escrow RELEASED', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  const res = await service.resolveDispute(disp.id, 'RELEASE_TO_SELLER', ARBITRATOR_ADDR);

  assert.equal(res.success, true);
  assert.equal((await service.getEscrow(esc.id)).data?.status, 'RELEASED');
});

test('D3-07: Resolve dispute with REFUND_TO_BUYER by assigned arbitrator -> escrow REFUNDED', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  const res = await service.resolveDispute(disp.id, 'REFUND_TO_BUYER', ARBITRATOR_ADDR);

  assert.equal(res.success, true);
  assert.equal((await service.getEscrow(esc.id)).data?.status, 'REFUNDED');
});

test('D3-08: Resolve dispute with SPLIT_PROPORTIONAL (50/50) calculates split amounts', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  await service.resolveDispute(disp.id, 'SPLIT_PROPORTIONAL', ARBITRATOR_ADDR);

  const updatedDisp = await service.getDispute(disp.id);
  assert.equal(updatedDisp.splitBuyerAmount, 250);
  assert.equal(updatedDisp.splitSellerAmount, 250);
});

test('D3-09: Dispute status becomes RESOLVED after resolution', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  await service.resolveDispute(disp.id, 'RELEASE_TO_SELLER', ARBITRATOR_ADDR);

  assert.equal(await service.getDisputeStatus(disp.id), 'RESOLVED');
});

test('D3-10: Dispute records resolvedAt timestamp', async () => {
  let simTime = 2000000;
  const service = new PaymentEscrowService({ timeProvider: () => simTime });
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  simTime += 500;
  await service.resolveDispute(disp.id, 'RELEASE_TO_SELLER', ARBITRATOR_ADDR);

  const updatedDisp = await service.getDispute(disp.id);
  assert.equal(updatedDisp.resolvedAt, 2000500);
});

test('D3-11: Arbitrator decision wrapper applies decision and rationale', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  const res = await service.arbitratorDecision(disp.id, {
    disputeId: disp.id,
    arbitrator: ARBITRATOR_ADDR,
    resolution: 'REFUND_TO_BUYER',
    rationale: 'Hardware was non-functional on arrival',
  });

  assert.equal(res.success, true);
  const updatedDisp = await service.getDispute(disp.id);
  assert.equal(updatedDisp.notes, 'Hardware was non-functional on arrival');
});

test('D3-12: Arbitrator decision with custom split percentage (70/30) calculates correctly', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  await service.arbitratorDecision(disp.id, {
    disputeId: disp.id,
    arbitrator: ARBITRATOR_ADDR,
    resolution: 'SPLIT_PROPORTIONAL',
    splitBuyerPercentage: 70,
    rationale: 'Partial defect resolved by 70% refund',
  });

  const updatedDisp = await service.getDispute(disp.id);
  assert.equal(updatedDisp.splitBuyerAmount, 350); // 70% of 500
  assert.equal(updatedDisp.splitSellerAmount, 150); // 30% of 500
});

test('D3-13: Assign arbitrator to escrow without initial arbitrator succeeds', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.assignArbitrator(esc.id, ARBITRATOR_ADDR);
  assert.equal(res.success, true);
  assert.equal((await service.getEscrow(esc.id)).data?.arbitrator, ARBITRATOR_ADDR);
});

test('D3-14: Assign arbitrator updates arbitrator in open dispute', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  assert.equal(disp.arbitrator, null);

  await service.assignArbitrator(esc.id, ARBITRATOR_ADDR);
  const updatedDisp = await service.getDispute(disp.id);
  assert.equal(updatedDisp.arbitrator, ARBITRATOR_ADDR);
});

test('D3-15: getArbitrator returns assigned arbitrator address', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;

  assert.equal(await service.getArbitrator(esc.id), ARBITRATOR_ADDR);
});

test('D3-16: getArbitrator returns null when none assigned', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  assert.equal(await service.getArbitrator(esc.id), null);
});

test('D3-17: calculateSplitAmounts handles 100/0 and 0/100 boundaries', () => {
  const fullBuyer = calculateSplitAmounts(500, 100);
  assert.equal(fullBuyer.buyerAmount, 500);
  assert.equal(fullBuyer.sellerAmount, 0);

  const fullSeller = calculateSplitAmounts(500, 0);
  assert.equal(fullSeller.buyerAmount, 0);
  assert.equal(fullSeller.sellerAmount, 500);
});

test('D3-18: calculateSplitAmounts clamps percentages < 0 and > 100', () => {
  const neg = calculateSplitAmounts(500, -20);
  assert.equal(neg.buyerAmount, 0);

  const over = calculateSplitAmounts(500, 150);
  assert.equal(over.buyerAmount, 500);
});

test('D3-19: Dispute resolution generates transaction hash', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  const res = await service.resolveDispute(disp.id, 'RELEASE_TO_SELLER', ARBITRATOR_ADDR);

  assert.ok(res.transactionHash?.startsWith('0x'));
});

test('D3-20: Arbitrator rationale persists in dispute notes', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  await service.arbitratorDecision(disp.id, {
    disputeId: disp.id,
    arbitrator: ARBITRATOR_ADDR,
    resolution: 'RELEASE_TO_SELLER',
    rationale: 'Detailed verification notes',
  });

  assert.equal((await service.getDispute(disp.id)).notes, 'Detailed verification notes');
});

// =============================================================================
// DIMENSION 4: NEGATIVE CASES, BOUNDARY CONDITIONS & ANTI-ABUSE (TESTS 66 - 85)
// =============================================================================

test('D4-01: Rejects createEscrow with empty title', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({ ...BASE_PARAMS, title: '   ' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-02: Rejects createEscrow with invalid buyer address', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({ ...BASE_PARAMS, buyer: 'bad_addr' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-03: Rejects createEscrow with invalid seller address', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({ ...BASE_PARAMS, seller: 'bad_addr' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-04: Rejects createEscrow when buyer and seller are identical (SAME_BUYER_SELLER)', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({
    ...BASE_PARAMS,
    buyer: BUYER_ADDR,
    seller: BUYER_ADDR,
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.SAME_BUYER_SELLER);
});

test('D4-05: Rejects createEscrow with invalid arbitrator address format', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({
    ...BASE_PARAMS,
    arbitrator: 'bad_arbitrator',
  });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-06: Rejects createEscrow with negative or zero amount', async () => {
  const service = new PaymentEscrowService();
  const res = await service.createEscrow({ ...BASE_PARAMS, amount: 0 });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_AMOUNT);
});

test('D4-07: Rejects updateEscrow on non-existent escrow', async () => {
  const service = new PaymentEscrowService();
  const res = await service.updateEscrow('ghost_id', { title: 'New' });

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_NOT_FOUND);
});

test('D4-08: Rejects updateEscrow amount after funds are deposited', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 100, BUYER_ADDR);

  const res = await service.updateEscrow(esc.id, { amount: 800 });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D4-09: Rejects updateEscrow when escrow is RELEASED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.releasePayment(esc.id, BUYER_ADDR);

  const res = await service.updateEscrow(esc.id, { title: 'New' });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED);
});

test('D4-10: Rejects updateEscrow when escrow is CANCELLED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.cancelEscrow(esc.id);

  const res = await service.updateEscrow(esc.id, { title: 'New' });
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED);
});

test('D4-11: Rejects cancelEscrow when funds are deposited (CANNOT_CANCEL_FUNDED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 100, BUYER_ADDR);

  const res = await service.cancelEscrow(esc.id);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.CANNOT_CANCEL_FUNDED);
});

test('D4-12: Rejects cancelEscrow when already CANCELLED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.cancelEscrow(esc.id);

  const res = await service.cancelEscrow(esc.id);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED);
});

test('D4-13: Rejects cancelEscrow when already RELEASED', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.releasePayment(esc.id, BUYER_ADDR);

  const res = await service.cancelEscrow(esc.id);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED);
});

test('D4-14: Rejects depositPayment exceeding required amount (DEPOSIT_EXCEEDS_REQUIRED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!; // amount 500

  const res = await service.depositPayment(esc.id, 600, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.DEPOSIT_EXCEEDS_REQUIRED);
});

test('D4-15: Rejects depositPayment with negative or zero amount', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.depositPayment(esc.id, -50, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_AMOUNT);
});

test('D4-16: Rejects depositPayment with invalid payer address', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.depositPayment(esc.id, 100, 'bad_addr');
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_ADDRESS);
});

test('D4-17: Rejects depositPayment on CANCELLED escrow', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.cancelEscrow(esc.id);

  const res = await service.depositPayment(esc.id, 100, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_CANCELLED);
});

test('D4-18: Rejects depositPayment on RELEASED escrow', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.releasePayment(esc.id, BUYER_ADDR);

  const res = await service.depositPayment(esc.id, 100, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED);
});

test('D4-19: Rejects releasePayment by unauthorized third party (UNAUTHORIZED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.releasePayment(esc.id, THIRD_PARTY_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.UNAUTHORIZED);
});

test('D4-20: Rejects releasePayment when escrow has 0 deposited funds (ESCROW_NOT_FUNDED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.releasePayment(esc.id, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_NOT_FUNDED);
});

// =============================================================================
// DIMENSION 5: CONCURRENCY, EDGE CASES & INVARIANTS (TESTS 86 - 105)
// =============================================================================

test('D5-01: Rejects releasePayment when escrow is in active dispute (ESCROW_IN_DISPUTE)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.createDispute(esc.id, 'Disputed delivery', BUYER_ADDR);

  const res = await service.releasePayment(esc.id, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_IN_DISPUTE);
});

test('D5-02: Rejects refundPayment by buyer or unauthorized party (UNAUTHORIZED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  // Buyer cannot self-refund without dispute
  const res = await service.refundPayment(esc.id, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.UNAUTHORIZED);
});

test('D5-03: Rejects createDispute by third party who is neither buyer nor seller (UNAUTHORIZED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const res = await service.createDispute(esc.id, 'Third party meddling', THIRD_PARTY_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.UNAUTHORIZED);
});

test('D5-04: Rejects createDispute on UNFUNDED escrow (DISPUTE_NOT_IN_DISPUTE_STATE)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const res = await service.createDispute(esc.id, 'No funds yet', BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.DISPUTE_NOT_IN_DISPUTE_STATE);
});

test('D5-05: Rejects opening second dispute when one is already active (DISPUTE_ALREADY_OPEN)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  await service.createDispute(esc.id, 'First dispute', BUYER_ADDR);
  const res = await service.createDispute(esc.id, 'Second dispute', SELLER_ADDR);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.DISPUTE_ALREADY_OPEN);
});

test('D5-06: Rejects resolveDispute by caller who is not assigned arbitrator (ARBITRATOR_MISMATCH)', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  const res = await service.resolveDispute(disp.id, 'RELEASE_TO_SELLER', THIRD_PARTY_ADDR);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ARBITRATOR_MISMATCH);
});

test('D5-07: Rejects resolveDispute when no arbitrator was assigned (ARBITRATOR_NOT_ASSIGNED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!; // arbitrator: null
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  const res = await service.resolveDispute(disp.id, 'RELEASE_TO_SELLER', ARBITRATOR_ADDR);

  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ARBITRATOR_NOT_ASSIGNED);
});

test('D5-08: Rejects resolving already resolved dispute (DISPUTE_ALREADY_RESOLVED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (
    await service.createEscrow({
      ...BASE_PARAMS,
      arbitrator: ARBITRATOR_ADDR,
    })
  ).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);

  const disp = (await service.createDispute(esc.id, 'Reason', BUYER_ADDR)).data!;
  await service.resolveDispute(disp.id, 'RELEASE_TO_SELLER', ARBITRATOR_ADDR);

  const res = await service.resolveDispute(disp.id, 'REFUND_TO_BUYER', ARBITRATOR_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.DISPUTE_ALREADY_RESOLVED);
});

test('D5-09: Rejects assignArbitrator on already RELEASED or REFUNDED escrow', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.releasePayment(esc.id, BUYER_ADDR);

  const res = await service.assignArbitrator(esc.id, ARBITRATOR_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.INVALID_PARAMETERS);
});

test('D5-10: Rejects double releasePayment call (ESCROW_ALREADY_RELEASED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.releasePayment(esc.id, BUYER_ADDR);

  const res = await service.releasePayment(esc.id, BUYER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_RELEASED);
});

test('D5-11: Rejects double refundPayment call (ESCROW_ALREADY_REFUNDED)', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;
  await service.depositPayment(esc.id, 500, BUYER_ADDR);
  await service.refundPayment(esc.id, SELLER_ADDR);

  const res = await service.refundPayment(esc.id, SELLER_ADDR);
  assert.equal(res.success, false);
  assert.equal(res.errorCode, ESCROW_ERROR_CODES.ESCROW_ALREADY_REFUNDED);
});

test('D5-12: Validates Stellar address format regex (G..., C..., 0x...)', () => {
  assert.equal(isValidStellarAddress(BUYER_ADDR), true);
  assert.equal(isValidStellarAddress(SELLER_ADDR), true);
  assert.equal(isValidStellarAddress('CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM'), true);
  assert.equal(isValidStellarAddress('0x1234567890123456789012345678901234567890'), true);
  assert.equal(isValidStellarAddress('invalid'), false);
  assert.equal(isValidStellarAddress(''), false);
});

test('D5-13: calculateSplitAmounts with 0 total amount returns 0s', () => {
  const res = calculateSplitAmounts(0, 50);
  assert.equal(res.buyerAmount, 0);
  assert.equal(res.sellerAmount, 0);
});

test('D5-14: getPaymentStatus returns UNFUNDED for non-existent escrow', async () => {
  const service = new PaymentEscrowService();
  assert.equal(await service.getPaymentStatus('non_existent'), 'UNFUNDED');
});

test('D5-15: getDisputeStatus returns NONE for non-existent dispute', async () => {
  const service = new PaymentEscrowService();
  assert.equal(await service.getDisputeStatus('non_existent'), 'NONE');
});

test('D5-16: getArbitrator returns null for non-existent escrow', async () => {
  const service = new PaymentEscrowService();
  assert.equal(await service.getArbitrator('non_existent'), null);
});

test('D5-17: Stress test: 20 sequential deposits from various participants sum precisely', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow({ ...BASE_PARAMS, amount: 200 })).data!;

  const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  for (let i = 0; i < 20; i++) {
    const payer = 'G' + 'E'.repeat(54) + base32[i];
    await service.depositPayment(esc.id, 10, payer);
  }

  const updated = (await service.getEscrow(esc.id)).data!;
  assert.equal(updated.depositedAmount, 200);
  assert.equal(updated.status, 'FUNDED');
});

test('D5-18: Stress test: 10 concurrent escrows with independent dispute flows remain isolated', async () => {
  const service = new PaymentEscrowService();
  const escrows: string[] = [];

  for (let i = 0; i < 10; i++) {
    const esc = (
      await service.createEscrow({
        ...BASE_PARAMS,
        title: `Escrow ${i}`,
        arbitrator: ARBITRATOR_ADDR,
      })
    ).data!;
    escrows.push(esc.id);
  }

  // Fund all escrows concurrently
  await Promise.all(
    escrows.map((id) => service.depositPayment(id, 500, BUYER_ADDR))
  );

  // Dispute first 5 escrows concurrently
  await Promise.all(
    escrows.slice(0, 5).map((id) => service.createDispute(id, 'Reason', BUYER_ADDR))
  );

  // Release last 5 escrows concurrently
  await Promise.all(
    escrows.slice(5).map((id) => service.releasePayment(id, BUYER_ADDR))
  );

  for (let i = 0; i < 5; i++) {
    assert.equal((await service.getEscrow(escrows[i])).data?.status, 'DISPUTED');
  }
  for (let i = 5; i < 10; i++) {
    assert.equal((await service.getEscrow(escrows[i])).data?.status, 'RELEASED');
  }
});

test('D5-19: listEscrows returns immutable copies preventing external state mutation', () => {
  const service = new PaymentEscrowService();
  const list = service.listEscrows();
  list.push({} as any);

  assert.equal(service.listEscrows().length, 0);
});

test('D5-20: getEscrow returns immutable copy preventing external modification', async () => {
  const service = new PaymentEscrowService();
  const esc = (await service.createEscrow(BASE_PARAMS)).data!;

  const fetched = (await service.getEscrow(esc.id)).data!;
  fetched.amount = 999999;

  const fresh = (await service.getEscrow(esc.id)).data!;
  assert.equal(fresh.amount, 500);
});
