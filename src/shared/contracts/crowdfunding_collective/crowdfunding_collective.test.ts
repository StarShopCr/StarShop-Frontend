import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  Client,
  CrowdfundingCollectiveClient,
  networks,
  ProductStatus,
  CampaignStatus,
  CrowdfundingErrorCode,
  CrowdfundingError,
  CROWDFUNDING_SPEC_ENTRIES,
} from './index';

describe('CrowdfundingCollective Contract Bindings', () => {
  const TEST_ADMIN = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const TEST_DONOR = 'GADPKGVRKLQFPPWJF6PB3D63U5NQNPXVOCUOMKOTZBELRBOT75Z7AD3R';
  const TEST_CONTRACT_ID =
    'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K';
  const TEST_RPC_URL = 'https://soroban-testnet.stellar.org';

  const defaultOptions = {
    contractId: TEST_CONTRACT_ID,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: TEST_RPC_URL,
    publicKey: TEST_ADMIN,
  };

  describe('1. Instantiation and Spec Verification', () => {
    it('should instantiate Client with valid options', () => {
      const client = new Client(defaultOptions);
      assert.ok(client instanceof Client);
      assert.strictEqual(client.options.contractId, TEST_CONTRACT_ID);
      assert.strictEqual(
        client.options.networkPassphrase,
        networks.testnet.networkPassphrase
      );
    });

    it('should export CrowdfundingCollectiveClient alias identical to Client', () => {
      assert.strictEqual(Client, CrowdfundingCollectiveClient);
      const client = new CrowdfundingCollectiveClient(defaultOptions);
      assert.ok(client instanceof Client);
    });

    it('should contain all 20 contract functions in the loaded Spec', () => {
      const client = new Client(defaultOptions);
      const funcs = client.spec.funcs().map((f: any) => f.name().toString());
      const expectedFuncs = [
        'initialize',
        'pledge',
        'withdraw',
        'refund',
        'get_campaign_status',
        'get_total_pledged',
        'create_product',
        'contribute',
        'distribute_funds',
        'refund_contributors',
        'claim_reward',
        'update_milestone',
        'get_product',
        'get_contributions',
        'get_milestones',
        'get_reward_tiers',
        'get_product_status',
        'get_admin',
        'set_admin',
        'is_initialized',
      ];

      for (const fn of expectedFuncs) {
        assert.ok(
          funcs.includes(fn),
          `Function ${fn} should exist in contract spec`
        );
        assert.strictEqual(
          typeof (client as any)[fn],
          'function',
          `Client should have method ${fn}`
        );
      }
    });

    it('should register custom UDT structs and enums in Spec', () => {
      const client = new Client(defaultOptions);
      assert.ok(
        client.spec.findEntry('ProductStatus'),
        'ProductStatus entry should exist in Spec'
      );
      assert.ok(
        client.spec.findEntry('RewardTier'),
        'RewardTier entry should exist in Spec'
      );
      assert.ok(
        client.spec.findEntry('Milestone'),
        'Milestone entry should exist in Spec'
      );
      assert.ok(
        client.spec.findEntry('Contribution'),
        'Contribution entry should exist in Spec'
      );
      assert.ok(
        client.spec.findEntry('Product'),
        'Product entry should exist in Spec'
      );
      assert.ok(
        client.spec.findEntry('CrowdfundingError'),
        'CrowdfundingError entry should exist in Spec'
      );
    });

    it('should have all error cases mapped in Spec', () => {
      const client = new Client(defaultOptions);
      const errorCases = client.spec.errorCases();
      assert.strictEqual(errorCases.length, 13);
      const errorNames = errorCases.map((e: any) => e.name().toString());
      assert.ok(errorNames.includes('NotInitialized'));
      assert.ok(errorNames.includes('AlreadyInitialized'));
      assert.ok(errorNames.includes('CampaignEnded'));
      assert.ok(errorNames.includes('CampaignNotEnded'));
      assert.ok(errorNames.includes('GoalNotReached'));
      assert.ok(errorNames.includes('GoalReached'));
      assert.ok(errorNames.includes('InvalidAmount'));
      assert.ok(errorNames.includes('Unauthorized'));
      assert.ok(errorNames.includes('TransferFailed'));
      assert.ok(errorNames.includes('NothingToRefund'));
      assert.ok(errorNames.includes('ProductNotFound'));
      assert.ok(errorNames.includes('MilestoneNotCompleted'));
      assert.ok(errorNames.includes('RewardAlreadyClaimed'));
    });
  });

  describe('2. Single Campaign Methods (AssembledTransaction building)', () => {
    it('initialize: should encode admin address into AssembledTransaction', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.initialize(
        { admin: TEST_ADMIN },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'initialize');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('pledge: should encode donor and amount into AssembledTransaction', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.pledge(
        { donor: TEST_DONOR, amount: BigInt(250000000) },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'pledge');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 2);
    });

    it('withdraw: should build AssembledTransaction without arguments', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.withdraw({ simulate: false });
      assert.strictEqual(tx.options.method, 'withdraw');
      assert.strictEqual(tx.options.args, undefined);
    });

    it('refund: should build AssembledTransaction with donor argument', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.refund(
        { donor: TEST_DONOR },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'refund');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('get_campaign_status: should build AssembledTransaction without arguments', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_campaign_status({ simulate: false });
      assert.strictEqual(tx.options.method, 'get_campaign_status');
    });

    it('get_total_pledged: should build AssembledTransaction without arguments', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_total_pledged({ simulate: false });
      assert.strictEqual(tx.options.method, 'get_total_pledged');
    });
  });

  describe('3. Collective Product Methods (AssembledTransaction building)', () => {
    it('create_product: should encode complex structs and arrays correctly', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.create_product(
        {
          creator: TEST_ADMIN,
          name: 'Decentralized Hardware Wallet',
          description: 'Next gen open-source hardware wallet',
          funding_goal: BigInt('10000000000'),
          deadline: BigInt(1735689600),
          reward_tiers: [
            {
              id: 0,
              min_contribution: BigInt(100000000),
              description: 'Early Bird Backer',
              discount: 15,
            },
            {
              id: 1,
              min_contribution: BigInt(500000000),
              description: 'VIP Hardware Tier',
              discount: 25,
            },
          ],
          milestones: [
            {
              id: 0,
              description: 'Design & Prototype',
              target_date: BigInt(1720000000),
              completed: false,
            },
            {
              id: 1,
              description: 'Mass Production',
              target_date: BigInt(1730000000),
              completed: false,
            },
          ],
        },
        { simulate: false }
      );

      assert.strictEqual(tx.options.method, 'create_product');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 7);
    });

    it('create_campaign: alias should delegate to create_product', async () => {
      const client = new Client(defaultOptions);
      assert.strictEqual(typeof client.create_campaign, 'function');
      const tx = await client.create_campaign!(
        {
          creator: TEST_ADMIN,
          name: 'Solar Station',
          description: 'Decentralized energy micro-grid',
          funding_goal: BigInt('5000000000'),
          deadline: BigInt(1735689600),
          reward_tiers: [
            {
              id: 0,
              min_contribution: BigInt(50000000),
              description: 'Community Supporter',
              discount: 10,
            },
          ],
          milestones: [
            {
              id: 0,
              description: 'Phase 1 Delivery',
              target_date: BigInt(1725000000),
              completed: false,
            },
          ],
        },
        { simulate: false }
      );

      assert.strictEqual(tx.options.method, 'create_product');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 7);
    });

    it('contribute: should encode contributor, product_id, and amount', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.contribute(
        {
          contributor: TEST_DONOR,
          product_id: 1,
          amount: BigInt(500000000),
        },
        { simulate: false }
      );

      assert.strictEqual(tx.options.method, 'contribute');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 3);
    });

    it('distribute_funds: should encode caller and product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.distribute_funds(
        {
          caller: TEST_ADMIN,
          product_id: 1,
        },
        { simulate: false }
      );

      assert.strictEqual(tx.options.method, 'distribute_funds');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 2);
    });

    it('refund_contributors: should encode caller and product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.refund_contributors(
        {
          caller: TEST_ADMIN,
          product_id: 1,
        },
        { simulate: false }
      );

      assert.strictEqual(tx.options.method, 'refund_contributors');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 2);
    });

    it('claim_reward: should encode contributor and product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.claim_reward(
        {
          contributor: TEST_DONOR,
          product_id: 1,
        },
        { simulate: false }
      );

      assert.strictEqual(tx.options.method, 'claim_reward');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 2);
    });

    it('update_milestone: should encode creator, product_id, and milestone_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.update_milestone(
        {
          creator: TEST_ADMIN,
          product_id: 1,
          milestone_id: 0,
        },
        { simulate: false }
      );

      assert.strictEqual(tx.options.method, 'update_milestone');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 3);
    });

    it('get_product: should encode product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_product(
        { product_id: 1 },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'get_product');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('get_campaign: alias should delegate to get_product', async () => {
      const client = new Client(defaultOptions);
      assert.strictEqual(typeof client.get_campaign, 'function');
      const tx = await client.get_campaign!(
        { campaign_id: 42 },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'get_product');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('get_contributions: should encode product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_contributions(
        { product_id: 1 },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'get_contributions');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('get_milestones: should encode product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_milestones(
        { product_id: 1 },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'get_milestones');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('get_reward_tiers: should encode product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_reward_tiers(
        { product_id: 1 },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'get_reward_tiers');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('get_product_status: should encode product_id', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_product_status(
        { product_id: 1 },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'get_product_status');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });
  });

  describe('4. Administrative and Health Check Methods', () => {
    it('get_admin: should build transaction without arguments', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.get_admin({ simulate: false });
      assert.strictEqual(tx.options.method, 'get_admin');
      assert.strictEqual(tx.options.args, undefined);
    });

    it('set_admin: should build transaction with new_admin argument', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.set_admin(
        { new_admin: TEST_DONOR },
        { simulate: false }
      );
      assert.strictEqual(tx.options.method, 'set_admin');
      assert.ok(tx.options.args);
      assert.strictEqual(tx.options.args!.length, 1);
    });

    it('is_initialized: should build transaction without arguments', async () => {
      const client = new Client(defaultOptions);
      const tx = await client.is_initialized({ simulate: false });
      assert.strictEqual(tx.options.method, 'is_initialized');
      assert.strictEqual(tx.options.args, undefined);
    });
  });

  describe('5. Status Enum & Error Mapping Verification', () => {
    it('ProductStatus should match contract enum values', () => {
      assert.strictEqual(ProductStatus.Active, 0);
      assert.strictEqual(ProductStatus.Funded, 1);
      assert.strictEqual(ProductStatus.Failed, 2);
      assert.strictEqual(ProductStatus.Completed, 3);
    });

    it('CampaignStatus should match ProductStatus', () => {
      assert.strictEqual(CampaignStatus.Active, ProductStatus.Active);
      assert.strictEqual(CampaignStatus.Funded, ProductStatus.Funded);
      assert.strictEqual(CampaignStatus.Failed, ProductStatus.Failed);
      assert.strictEqual(CampaignStatus.Completed, ProductStatus.Completed);
    });

    it('CrowdfundingErrorCode should define all 13 error codes', () => {
      assert.strictEqual(CrowdfundingErrorCode.NotInitialized, 1);
      assert.strictEqual(CrowdfundingErrorCode.AlreadyInitialized, 2);
      assert.strictEqual(CrowdfundingErrorCode.CampaignEnded, 3);
      assert.strictEqual(CrowdfundingErrorCode.CampaignNotEnded, 4);
      assert.strictEqual(CrowdfundingErrorCode.GoalNotReached, 5);
      assert.strictEqual(CrowdfundingErrorCode.GoalReached, 6);
      assert.strictEqual(CrowdfundingErrorCode.InvalidAmount, 7);
      assert.strictEqual(CrowdfundingErrorCode.Unauthorized, 8);
      assert.strictEqual(CrowdfundingErrorCode.TransferFailed, 9);
      assert.strictEqual(CrowdfundingErrorCode.NothingToRefund, 10);
      assert.strictEqual(CrowdfundingErrorCode.ProductNotFound, 11);
      assert.strictEqual(CrowdfundingErrorCode.MilestoneNotCompleted, 12);
      assert.strictEqual(CrowdfundingErrorCode.RewardAlreadyClaimed, 13);
    });

    it('CrowdfundingError dictionary should provide human-readable messages and descriptions', () => {
      for (let code = 1; code <= 13; code++) {
        const errorInfo = CrowdfundingError[code];
        assert.ok(errorInfo, `Error info for code ${code} must exist`);
        assert.ok(
          errorInfo.message,
          `Error message for code ${code} must not be empty`
        );
        assert.ok(
          errorInfo.description,
          `Error description for code ${code} must not be empty`
        );
      }
      assert.strictEqual(CrowdfundingError[1].message, 'NotInitialized');
      assert.strictEqual(CrowdfundingError[8].message, 'Unauthorized');
      assert.strictEqual(CrowdfundingError[13].message, 'RewardAlreadyClaimed');
    });
  });

  describe('6. Deserializers and Utilities', () => {
    it('fromJSON property should expose all method deserializers', () => {
      const client = new Client(defaultOptions);
      assert.ok(client.fromJSON);
      assert.strictEqual(typeof client.fromJSON.initialize, 'function');
      assert.strictEqual(typeof client.fromJSON.pledge, 'function');
      assert.strictEqual(typeof client.fromJSON.create_product, 'function');
      assert.strictEqual(typeof client.fromJSON.contribute, 'function');
      assert.strictEqual(typeof client.fromJSON.distribute_funds, 'function');
      assert.strictEqual(
        typeof client.fromJSON.refund_contributors,
        'function'
      );
      assert.strictEqual(typeof client.fromJSON.claim_reward, 'function');
      assert.strictEqual(typeof client.fromJSON.update_milestone, 'function');
      assert.strictEqual(typeof client.fromJSON.get_product, 'function');
      assert.strictEqual(typeof client.fromJSON.get_contributions, 'function');
      assert.strictEqual(typeof client.fromJSON.get_milestones, 'function');
      assert.strictEqual(typeof client.fromJSON.get_reward_tiers, 'function');
      assert.strictEqual(typeof client.fromJSON.get_product_status, 'function');
      assert.strictEqual(typeof client.fromJSON.get_admin, 'function');
      assert.strictEqual(typeof client.fromJSON.set_admin, 'function');
      assert.strictEqual(typeof client.fromJSON.is_initialized, 'function');
    });

    it('networks configuration should contain testnet, futurenet, and standalone', () => {
      assert.ok(networks.testnet);
      assert.ok(networks.futurenet);
      assert.ok(networks.standalone);
      assert.ok(
        networks.testnet.networkPassphrase.includes('Test SDF Network')
      );
    });
  });
});
