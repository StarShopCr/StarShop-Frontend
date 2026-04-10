import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
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
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "PLACEHOLDER_CONTRACT_ID",
  }
} as const

export enum ProductStatus {
  Active = 0,
  Funded = 1,
  Expired = 2,
  Distributed = 3,
  Refunded = 4,
}

export const Errors = {
  1: {message:"NotAuthorized"},
  2: {message:"ProductNotFound"},
  3: {message:"ProductExpired"},
  4: {message:"ProductAlreadyFunded"},
  5: {message:"InsufficientFunds"},
  6: {message:"FundingGoalNotReached"},
  7: {message:"DeadlineNotReached"},
  8: {message:"AlreadyDistributed"},
  9: {message:"AlreadyRefunded"},
  10: {message:"MilestoneNotFound"},
  11: {message:"RewardAlreadyClaimed"},
  12: {message:"NoContribution"},
  13: {message:"InvalidAmount"},
  14: {message:"InvalidDeadline"},
}


export interface RewardTier {
  amount: u64;
  description: string;
  max_contributors: u32;
  name: string;
}


export interface Milestone {
  completed: boolean;
  description: string;
  id: u32;
  target_amount: u64;
}


export interface Product {
  contributions: Map<string, u64>;
  creator: string;
  current_amount: u64;
  deadline: u64;
  description: string;
  funding_goal: u64;
  id: u32;
  milestones: Array<Milestone>;
  name: string;
  reward_tiers: Array<RewardTier>;
  status: ProductStatus;
}


export interface Contribution {
  amount: u64;
  contributor: string;
  product_id: u32;
  reward_claimed: boolean;
  timestamp: u64;
}


export interface Client {
  /**
   * Construct and simulate an initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin}: {admin: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_product transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_product: ({creator, name, description, funding_goal, deadline, reward_tiers, milestones}: {creator: string, name: string, description: string, funding_goal: u64, deadline: u64, reward_tiers: Array<RewardTier>, milestones: Array<Milestone>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a contribute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  contribute: ({contributor, product_id, amount}: {contributor: string, product_id: u32, amount: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a distribute_funds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  distribute_funds: ({caller, product_id}: {caller: string, product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a refund_contributors transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  refund_contributors: ({caller, product_id}: {caller: string, product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a claim_reward transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_reward: ({contributor, product_id}: {contributor: string, product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate an update_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_milestone: ({creator, product_id, milestone_id}: {creator: string, product_id: u32, milestone_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_product transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_product: ({product_id}: {product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Product>>

  /**
   * Construct and simulate a get_contributions transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_contributions: ({product_id}: {product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Contribution>>>

  /**
   * Construct and simulate a get_milestones transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_milestones: ({product_id}: {product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Milestone>>>

  /**
   * Construct and simulate a get_reward_tiers transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_reward_tiers: ({product_id}: {product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RewardTier>>>

  /**
   * Construct and simulate a get_product_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_product_status: ({product_id}: {product_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<ProductStatus>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAwAAAAAAAAAAAAAADVByb2R1Y3RTdGF0dXMAAAAAAAAFAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAGRnVuZGVkAAAAAAABAAAAAAAAAAdFeHBpcmVkAAAAAAIAAAAAAAAAC0Rpc3RyaWJ1dGVkAAAAAAMAAAAAAAAAClJlZnVuZGVkAAAAAAAE",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAADgAAAAAAAAANTm90QXV0aG9yaXplZAAAAAAAAAABAAAAAAAAAA9Qcm9kdWN0Tm90Rm91bmQAAAAAAgAAAAAAAAAOUHJvZHVjdEV4cGlyZWQAAAAAAAMAAAAAAAAAE1Byb2R1Y3RBbHJlYWR5RnVuZGVkAAAAAAQAAAAAAAAAEUluc3VmZmljaWVudEZ1bmRzAAAAAAAABQAAAAAAAAATRnVuZGluZ0dvYWxOb3RSZWFjaGVkAAAAAAYAAAAAAAAAEERlYWRsaW5lTm90UmVhY2hlZAAAAAcAAAAAAAAAEkFscmVhZHlEaXN0cmlidXRlZAAAAAAACAAAAAAAAAAOQWxyZWFkeVJlZnVuZGVkAAAAAAAJAAAAAAAAABFNaWxlc3RvbmVOb3RGb3VuZAAAAAAAAAoAAAAAAAAAFFJld2FyZEFscmVhZHlDbGFpbWVkAAAACwAAAAAAAAAOTm9Db250cmlidXRpb24AAAAAAAwAAAAAAAAADUludmFsaWRBbW91bnQAAAAAAAANAAAAAAAAAA9JbnZhbGlkRGVhZGxpbmUAAAAADg==",
        "AAAAAQAAAAAAAAAAAAAAClJld2FyZFRpZXIAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAABgAAAAAAAAALZGVzY3JpcHRpb24AAAAAEQAAAAAAAAARbWF4X2NvbnRyaWJ1dG9ycwAAAAAAAAQAAAAAAAAABG5hbWUAAAAR",
        "AAAAAQAAAAAAAAAAAAAACU1pbGVzdG9uZQAAAAAAAAQAAAAAAAAAB2NvbXBsZXRlZAAAAAABAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAARAAAAAAAAAACCaWQAAAAAAAQAAAAAAAAADXRhcmdldF9hbW91bnQAAAAAAAAG",
        "AAAAAQAAAAAAAAAAAAAADENvbnRyaWJ1dGlvbgAAAAUAAAAAAAAABmFtb3VudAAAAAAABgAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAAAAAAOcmV3YXJkX2NsYWltZWQAAAAAAAEAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAY=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAANY3JlYXRlX3Byb2R1Y3QAAAAAAAAHAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAABG5hbWUAAAARAAAAAAAAAAdkZXNjcmlwdGlvbgAAAAARAAAAAAAAAAtsZnVuZGluZ19nb2FsAAAAAAYAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAMcmV3YXJkX3RpZXJzAAAD6gAAB9AAAAAKUGV3YXJkVGllcgAAAAAAAAAAAAptaWxlc3RvbmVzAAAAAAPqAAAH0AAAAAlNaWxlc3RvbmUAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAKb250cmlidXRlAAAAAAADAAAAAAAAAAtjb250cmlidXRvcgAAAAATAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAAAAAAZhbW91bnQAAAAAAAYAAAABAAAD6QAAA+0AAAAAAAAAAA==",
        "AAAAAAAAAAAAAAAQZGlzdHJpYnV0ZV9mdW5kcwAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAASY2VmdW5kX2NvbnRyaWJ1dG9ycwAAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAMY2xhaW1fcmV3YXJkAAAAAgAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAQdXBkYXRlX21pbGVzdG9uZQAAAAMAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAAAAAAMbWlsZXN0b25lX2lkAAAABAAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAALZ2V0X3Byb2R1Y3QAAAAAAQAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABAAAAAEAAAfQAAAAB1Byb2R1Y3QA",
        "AAAAAAAAAAAAAAARZ2V0X2NvbnRyaWJ1dGlvbnMAAAAAAAABAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAA+oAAAfQAAAADENvbnRyaWJ1dGlvbg==",
        "AAAAAAAAAAAAAAANZ2V0X21pbGVzdG9uZXMAAAAAAAABAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAA+oAAAfQAAAACU1pbGVzdG9uZQAAAA==",
        "AAAAAAAAAAAAAAAQZ2V0X3Jld2FyZF90aWVycwAAAAEAAAAAAAAACoByb2R1Y3RfaWQAAAAAAAQAAAABAAAD6gAAB9AAAAAKUGV3YXJkVGllcgAA",
        "AAAAAAAAAAAAAAASZ2V0X3Byb2R1Y3Rfc3RhdHVzAAAAAAABAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAEAAAAAQAAB9AAAAANUGR1Y3RTdGF0dXMAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_product: this.txFromJSON<u32>,
        contribute: this.txFromJSON<Result<void>>,
        distribute_funds: this.txFromJSON<Result<void>>,
        refund_contributors: this.txFromJSON<Result<void>>,
        claim_reward: this.txFromJSON<Result<void>>,
        update_milestone: this.txFromJSON<Result<void>>,
        get_product: this.txFromJSON<Product>,
        get_contributions: this.txFromJSON<Array<Contribution>>,
        get_milestones: this.txFromJSON<Array<Milestone>>,
        get_reward_tiers: this.txFromJSON<Array<RewardTier>>,
        get_product_status: this.txFromJSON<ProductStatus>
  }
}
