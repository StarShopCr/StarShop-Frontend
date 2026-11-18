import { Buffer } from "buffer";
import {
  Client as ContractClient,
  Spec as ContractSpec,
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
};

export var ProductStatus;
(function (ProductStatus) {
  ProductStatus[(ProductStatus["Active"] = 1)] = "Active";
  ProductStatus[(ProductStatus["Funded"] = 2)] = "Funded";
  ProductStatus[(ProductStatus["Expired"] = 3)] = "Expired";
  ProductStatus[(ProductStatus["Cancelled"] = 4)] = "Cancelled";
})(ProductStatus || (ProductStatus = {}));

export var MilestoneStatus;
(function (MilestoneStatus) {
  MilestoneStatus[(MilestoneStatus["Pending"] = 1)] = "Pending";
  MilestoneStatus[(MilestoneStatus["Approved"] = 2)] = "Approved";
  MilestoneStatus[(MilestoneStatus["Rejected"] = 3)] = "Rejected";
})(MilestoneStatus || (MilestoneStatus = {}));

export class Client extends ContractClient {
  static async deploy(options) {
    return ContractClient.deploy(null, options);
  }

  constructor(options) {
    super(new ContractSpec([]), options);
  }
}

export default Client;
