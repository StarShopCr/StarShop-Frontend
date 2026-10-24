/**
 * TypeScript Bindings Client for Crowdfunding Collective Smart Contract
 * StarShop Decentralized Crowdfunding Platform
 *
 * Generated and validated for Soroban RPC & Stellar SDK
 */

import { Buffer } from 'buffer';
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
  NULL_ACCOUNT,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';

export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export * from './types';

import {
  ProductStatus,
  CampaignStatus,
  CrowdfundingErrorCode,
  CrowdfundingError,
  RewardTier,
  Milestone,
  Contribution,
  Product,
  Campaign,
  InitializeParams,
  PledgeParams,
  RefundParams,
  CreateProductParams,
  CreateCampaignParams,
  ContributeParams,
  DistributeFundsParams,
  RefundContributorsParams,
  ClaimRewardParams,
  UpdateMilestoneParams,
  GetProductParams,
  GetCampaignParams,
  GetContributionsParams,
  GetMilestonesParams,
  GetRewardTiersParams,
  GetProductStatusParams,
  GetCampaignStatusParams,
  SetAdminParams,
} from './types';

if (typeof window !== 'undefined') {
  // @ts-ignore Buffer polyfill
  window.Buffer = window.Buffer || Buffer;
}

/**
 * Pre-configured network identifiers and default contract IDs
 */
export const networks = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
  },
  futurenet: {
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
  },
  standalone: {
    networkPassphrase: 'Standalone Network ; February 2017',
    contractId: 'CAOD3KB6SNP5CJAAACVXJLEURISSTBM7DLSAUC23PJV3V5UVTBWDFO7K',
  },
} as const;

/**
 * Soroban contract specification XDR base64 entries for Crowdfunding Collective
 */
export const CROWDFUNDING_SPEC_ENTRIES: string[] = [
  'AAAABAAAABxDcm93ZGZ1bmRpbmcgY29udHJhY3QgZXJyb3JzAAAAAAAAABFDcm93ZGZ1bmRpbmdFcnJvcgAAAAAAAA0AAAAYQ29udHJhY3Qgbm90IGluaXRpYWxpemVkAAAADk5vdEluaXRpYWxpemVkAAAAAAABAAAAHENvbnRyYWN0IGFscmVhZHkgaW5pdGlhbGl6ZWQAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAACAAAAEkNhbXBhaWduIGhhcyBlbmRlZAAAAAAADUNhbXBhaWduRW5kZWQAAAAAAAADAAAAGkNhbXBhaWduIGhhcyBub3QgZW5kZWQgeWV0AAAAAAAQQ2FtcGFpZ25Ob3RFbmRlZAAAAAQAAAAcRnVuZGluZyBnb2FsIHdhcyBub3QgcmVhY2hlZAAAAA5Hb2FsTm90UmVhY2hlZAAAAAAABQAAABxGdW5kaW5nIGdvYWwgYWxyZWFkeSByZWFjaGVkAAAAC0dvYWxSZWFjaGVkAAAAAAYAAAAlSW52YWxpZCBjb250cmlidXRpb24gb3IgcGxlZGdlIGFtb3VudAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAABwAAABpVbmF1dGhvcml6ZWQgY2FsbGVyIGFjdGlvbgAAAAAADFVuYXV0aG9yaXplZAAAAAgAAAAfVG9rZW4gdHJhbnNmZXIgb3BlcmF0aW9uIGZhaWxlZAAAAAAOVHJhbnNmZXJGYWlsZWQAAAAAAAkAAAARTm90aGluZyB0byByZWZ1bmQAAAAAAAAPTm90aGluZ1RvUmVmdW5kAAAAAAoAAAAdUHJvZHVjdCBvciBjYW1wYWlnbiBub3QgZm91bmQAAAAAAAAPUHJvZHVjdE5vdEZvdW5kAAAAAAsAAAAgTWlsZXN0b25lIGhhcyBub3QgYmVlbiBjb21wbGV0ZWQAAAAVTWlsZXN0b25lTm90Q29tcGxldGVkAAAAAAAADAAAACVSZXdhcmQgYWxyZWFkeSBjbGFpbWVkIGJ5IGNvbnRyaWJ1dG9yAAAAAAAAFFJld2FyZEFscmVhZHlDbGFpbWVkAAAADQ==',
  'AAAAAwAAABNQcm9kdWN0IHN0YXR1cyBlbnVtAAAAAAAAAAANUHJvZHVjdFN0YXR1cwAAAAAAAAQAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAGRnVuZGVkAAAAAAABAAAAAAAAAAZGYWlsZWQAAAAAAAIAAAAAAAAACUNvbXBsZXRlZAAAAAAAAAM=',
  'AAAAAQAAABJSZXdhcmQgdGllciBzdHJ1Y3QAAAAAAAAAAAAKUmV3YXJkVGllcgAAAAAABAAAAAAAAAACaWQAAAAAAAQAAAAAAAAAEG1pbl9jb250cmlidXRpb24AAAAGAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAhkaXNjb3VudAAAAAQ=',
  'AAAAAQAAABBNaWxlc3RvbmUgc3RydWN0AAAAAAAAAAlNaWxlc3RvbmUAAAAAAAAEAAAAAAAAAAJpZAAAAAAABAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAALdGFyZ2V0X2RhdGUAAAAABgAAAAAAAAAJY29tcGxldGVkAAAAAAAAAQ=',
  'AAAAAQAAABNDb250cmlidXRpb24gc3RydWN0AAAAAAAAAAAMQ29udHJpYnV0aW9uAAAAAwAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAGAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAG',
  'AAAAAQAAAA5Qcm9kdWN0IHN0cnVjdAAAAAAAAAAAAAdQcm9kdWN0AAAAAAgAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAxmdW5kaW5nX2dvYWwAAAAGAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA1Qcm9kdWN0U3RhdHVzAAAAAAAAAAAAAAx0b3RhbF9mdW5kZWQAAAAG',
  'AAAAAAAAABNJbml0aWFsaXplIGNvbnRyYWN0AAAAAAppbml0aWFsaXplAAAAAAABAAAADUFkbWluIGFkZHJlc3MAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==',
  'AAAAAAAAABhQbGVkZ2UgZnVuZHMgdG8gY2FtcGFpZ24AAAAGcGxlZGdlAAAAAAACAAAAAAAAAAVkb25vcgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAABgAAAAA=',
  'AAAAAAAAABdXaXRoZHJhdyBjYW1wYWlnbiBmdW5kcwAAAAAId2l0aGRyYXcAAAAAAAAAAA==',
  'AAAAAAAAAAxSZWZ1bmQgZG9ub3IAAAAGcmVmdW5kAAAAAAABAAAAAAAAAAVkb25vcgAAAAAAABMAAAAA',
  'AAAAAAAAABZHZXQgc3RhdHVzIG9mIGNhbXBhaWduAAAAAAATZ2V0X2NhbXBhaWduX3N0YXR1cwAAAAAAAAAAAQAAAAQ=',
  'AAAAAAAAABhHZXQgdG90YWwgYW1vdW50IHBsZWRnZWQAAAARZ2V0X3RvdGFsX3BsZWRnZWQAAAAAAAAAAAAAAQAAAAY=',
  'AAAAAAAAABtDcmVhdGUgY3Jvd2RmdW5kaW5nIHByb2R1Y3QAAAAADmNyZWF0ZV9wcm9kdWN0AAAAAAAHAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAxmdW5kaW5nX2dvYWwAAAAGAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAADHJld2FyZF90aWVycwAAA+oAAAfQAAAAClJld2FyZFRpZXIAAAAAAAAAAAAKbWlsZXN0b25lcwAAAAAD6gAAB9AAAAAJTWlsZXN0b25lAAAAAAAAAQAAAAQ=',
  'AAAAAAAAABtDb250cmlidXRlIGZ1bmRzIHRvIHByb2R1Y3QAAAAACmNvbnRyaWJ1dGUAAAAAAAMAAAAAAAAAC2NvbnRyaWJ1dG9yAAAAABMAAAAAAAAACnByb2R1Y3RfaWQAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAABgAAAAA=',
  'AAAAAAAAACNEaXN0cmlidXRlIHByb2R1Y3QgZnVuZHMgdG8gY3JlYXRvcgAAAAAQZGlzdHJpYnV0ZV9mdW5kcwAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAA=',
  'AAAAAAAAACpSZWZ1bmQgYWxsIGNvbnRyaWJ1dG9ycyBmb3IgZmFpbGVkIHByb2R1Y3QAAAAAABNyZWZ1bmRfY29udHJpYnV0b3JzAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAA=',
  'AAAAAAAAABhDbGFpbSBiYWNrZXIgcmV3YXJkIHRpZXIAAAAMY2xhaW1fcmV3YXJkAAAAAgAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAA=',
  'AAAAAAAAAB9VcGRhdGUgcHJvZHVjdCBtaWxlc3RvbmUgc3RhdHVzAAAAABB1cGRhdGVfbWlsZXN0b25lAAAAAwAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAA==',
  'AAAAAAAAABNHZXQgcHJvZHVjdCBkZXRhaWxzAAAAAAtnZXRfcHJvZHVjdAAAAAABAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAB9AAAAAHUHJvZHVjdAA=',
  'AAAAAAAAAB1HZXQgY29udHJpYnV0aW9ucyBmb3IgcHJvZHVjdAAAAAAAABFnZXRfY29udHJpYnV0aW9ucwAAAAAAAAEAAAAAAAAACnByb2R1Y3RfaWQAAAAAAAQAAAABAAAD6gAAB9AAAAAMQ29udHJpYnV0aW9u',
  'AAAAAAAAABpHZXQgbWlsZXN0b25lcyBmb3IgcHJvZHVjdAAAAAAADmdldF9taWxlc3RvbmVzAAAAAAABAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAA+oAAAfQAAAACU1pbGVzdG9uZQAAAA==',
  'AAAAAAAAABxHZXQgcmV3YXJkIHRpZXJzIGZvciBwcm9kdWN0AAAAEGdldF9yZXdhcmRfdGllcnMAAAABAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAA+oAAAfQAAAAClJld2FyZFRpZXIAAA==',
  'AAAAAAAAABVHZXQgc3RhdHVzIG9mIHByb2R1Y3QAAAAAAAASZ2V0X3Byb2R1Y3Rfc3RhdHVzAAAAAAABAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAAAQ=',
  'AAAAAAAAABFHZXQgYWRtaW4gYWRkcmVzcwAAAAAAAAlnZXRfYWRtaW4AAAAAAAAAAAAAAQAAABM=',
  'AAAAAAAAABVTZXQgbmV3IGFkbWluIGFkZHJlc3MAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=',
  'AAAAAAAAABRDaGVjayBpZiBpbml0aWFsaXplZAAAAA5pc19pbml0aWFsaXplZAAAAAAAAAAAAAEAAAAB',
];

/**
 * Interface representing all typed methods available on Client
 */
export interface Client {
  /**
   * Initializes the contract with an admin address
   */
  initialize: (
    args: InitializeParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Pledges funds to the campaign
   */
  pledge: (
    args: PledgeParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Withdraws collected funds when campaign reaches its target
   */
  withdraw: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Issues refund to backer if campaign failed
   */
  refund: (
    args: RefundParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Retrieves current status of the campaign
   */
  get_campaign_status: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<number>>>;

  /**
   * Retrieves total amount pledged across campaign
   */
  get_total_pledged: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Creates a new collective product listing with reward tiers and milestones
   */
  create_product: (
    args: CreateProductParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Contributes funds toward a product
   */
  contribute: (
    args: {
      contributor: string;
      product_id: u32 | number;
      amount: u64 | bigint;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Distributes collected product funds to creator upon milestone completion
   */
  distribute_funds: (
    args: { caller: string; product_id: u32 | number },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Refunds all contributors if funding period ended without reaching goal
   */
  refund_contributors: (
    args: { caller: string; product_id: u32 | number },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Claims a reward tier for eligible contributor
   */
  claim_reward: (
    args: { contributor: string; product_id: u32 | number },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Creator updates product milestone completion status
   */
  update_milestone: (
    args: {
      creator: string;
      product_id: u32 | number;
      milestone_id: u32 | number;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Fetches product details by ID
   */
  get_product: (
    args: GetProductParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Product>>>;

  /**
   * Returns list of all contributions for a product
   */
  get_contributions: (
    args: { product_id: u32 | number },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Contribution[]>>>;

  /**
   * Returns list of all milestones for a product
   */
  get_milestones: (
    args: { product_id: u32 | number },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Milestone[]>>>;

  /**
   * Returns list of all reward tiers for a product
   */
  get_reward_tiers: (
    args: { product_id: u32 | number },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<RewardTier[]>>>;

  /**
   * Retrieves status enum of a product
   */
  get_product_status: (
    args: GetProductStatusParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<number>>>;

  /**
   * Retrieves current admin address of the contract
   */
  get_admin: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Updates admin address
   */
  set_admin: (
    args: SetAdminParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Checks whether contract has been initialized
   */
  is_initialized: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Convenience alias: create_campaign -> create_product
   */
  create_campaign?: (
    args: CreateCampaignParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Convenience alias: get_campaign -> get_product
   */
  get_campaign?: (
    args: GetCampaignParams,
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Product>>>;
}

/**
 * Main TypeScript client for interacting with the Crowdfunding Collective Soroban Contract
 */
export class Client extends ContractClient {
  /**
   * Static deploy helper method
   */
  static async deploy<T = Client>(
    options: MethodOptions &
      Omit<ContractClientOptions, 'contractId'> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: 'hex' | 'base64';
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }

  constructor(public readonly options: ContractClientOptions) {
    super(new ContractSpec(CROWDFUNDING_SPEC_ENTRIES), options);

    // Wire convenience aliases
    const self = this as any;
    self.create_campaign = (
      args: CreateCampaignParams,
      opts?: MethodOptions
    ) => {
      return self.create_product(args, opts);
    };

    self.get_campaign = (args: GetCampaignParams, opts?: MethodOptions) => {
      return self.get_product({ product_id: args.campaign_id }, opts);
    };
  }

  /**
   * JSON deserializers for transaction responses
   */
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
    pledge: this.txFromJSON<Result<void>>,
    withdraw: this.txFromJSON<Result<void>>,
    refund: this.txFromJSON<Result<void>>,
    get_campaign_status: this.txFromJSON<Result<number>>,
    get_total_pledged: this.txFromJSON<Result<u64>>,
    create_product: this.txFromJSON<Result<u32>>,
    contribute: this.txFromJSON<Result<void>>,
    distribute_funds: this.txFromJSON<Result<void>>,
    refund_contributors: this.txFromJSON<Result<void>>,
    claim_reward: this.txFromJSON<Result<void>>,
    update_milestone: this.txFromJSON<Result<void>>,
    get_product: this.txFromJSON<Result<Product>>,
    get_contributions: this.txFromJSON<Result<Contribution[]>>,
    get_milestones: this.txFromJSON<Result<Milestone[]>>,
    get_reward_tiers: this.txFromJSON<Result<RewardTier[]>>,
    get_product_status: this.txFromJSON<Result<number>>,
    get_admin: this.txFromJSON<Result<string>>,
    set_admin: this.txFromJSON<Result<void>>,
    is_initialized: this.txFromJSON<Result<boolean>>,
  };
}

export { Client as CrowdfundingCollectiveClient };
export default Client;
