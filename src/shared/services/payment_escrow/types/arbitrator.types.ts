import type { DisputeResolution } from './dispute.types';

export interface ArbitratorDecision {
  disputeId: string;
  arbitrator: string;
  resolution: DisputeResolution;
  splitBuyerPercentage?: number;
  rationale: string;
}
