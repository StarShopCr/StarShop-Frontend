import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
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
} from "@stellar/stellar-sdk/contract";

export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  },
} as const;

export enum ProductStatus {
  Active = 1,
  Funded = 2,
  Expired = 3,
  Cancelled = 4,
}

export enum MilestoneStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export interface RewardTier {
  id: u32;
  title: string;
  description: string;
  min_amount: u64;
  max_contributors?: Option<u32>;
  current_contributors: u32;
}

export interface Milestone {
  id: u32;
  title: string;
  description: string;
  target_amount: u64;
  status: MilestoneStatus;
}

export interface Contribution {
  contributor: string;
  product_id: u32;
  amount: u64;
  timestamp: u64;
}

export interface Product {
  id: u32;
  creator: string;
  name: string;
  description: string;
  funding_goal: u64;
  deadline: u64;
  reward_tiers: Array<RewardTier>;
  milestones: Array<Milestone>;
  status: ProductStatus;
}

export interface Client {
  initialize: (
    { admin }: { admin: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<null>>;

  create_product: (
    {
      creator,
      name,
      description,
      funding_goal,
      deadline,
      reward_tiers,
      milestones,
    }: {
      creator: string;
      name: string;
      description: string;
      funding_goal: u64;
      deadline: u64;
      reward_tiers: Array<RewardTier>;
      milestones: Array<Milestone>;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<u32>>;

  contribute: (
    {
      contributor,
      product_id,
      amount,
    }: { contributor: string; product_id: u32; amount: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<null>>;

  distribute_funds: (
    { caller, product_id }: { caller: string; product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<null>>;

  refund_contributors: (
    { caller, product_id }: { caller: string; product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<null>>;

  claim_reward: (
    { contributor, product_id }: { contributor: string; product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<null>>;

  update_milestone: (
    {
      creator,
      product_id,
      milestone_id,
    }: { creator: string; product_id: u32; milestone_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<null>>;

  get_product: (
    { product_id }: { product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Product>>;

  get_contributions: (
    { product_id }: { product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Array<Contribution>>>;

  get_milestones: (
    { product_id }: { product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Array<Milestone>>>;

  get_reward_tiers: (
    { product_id }: { product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Array<RewardTier>>>;

  get_product_status: (
    { product_id }: { product_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<ProductStatus>>;
}

export class Client extends ContractClient {
  static async deploy<T = Client>(
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }

  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([]),
      options
    );
  }
}

export default Client;
