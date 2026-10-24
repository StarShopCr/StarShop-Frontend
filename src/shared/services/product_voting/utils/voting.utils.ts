/**
 * Product Voting Contract Service - Utility Functions
 * Stellar validation, hash generation, quorum verification, and ranking calculations.
 */

import type { UserVoteEntry } from '../types/voting.types';
import type { ProductRank } from '../types/ranking.types';
import type { VoterRewardEntry } from '../types/reward.types';
import { VOTE_WEIGHTS } from '../constants/voting.constants';

/**
 * Validates whether a string is a valid Stellar/Soroban public key or EVM address.
 * Stellar accounts start with 'G', contracts start with 'C' followed by 55 Base32 chars.
 */
export function isValidStellarAddress(address?: string | null): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  const stellarRegex = /^[GC][A-Z2-7]{55}$/i;
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  return stellarRegex.test(trimmed) || evmRegex.test(trimmed);
}

/**
 * Generates pseudo-random 64-character hex transaction hash for simulated blockchain transactions.
 */
export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Generates unique identifiers with prefixes (e.g., round_..., vote_...).
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Validates and clamps vote weight within allowed range [min, max].
 */
export function sanitizeVoteWeight(rawWeight?: number, min = VOTE_WEIGHTS.MIN, max = VOTE_WEIGHTS.MAX): number {
  if (rawWeight === undefined || rawWeight === null || Number.isNaN(rawWeight)) {
    return VOTE_WEIGHTS.DEFAULT;
  }
  const rounded = Math.floor(rawWeight);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

/**
 * Checks whether total votes or total weight meets the round's quorum requirement.
 */
export function checkQuorum(totalWeight: number, requiredQuorum: number): boolean {
  if (requiredQuorum <= 0) return true;
  return totalWeight >= requiredQuorum;
}

/**
 * Computes product rankings based on active votes and eligible products.
 */
export function calculateRankings(
  votes: UserVoteEntry[],
  eligibleProducts: string[] = [],
  category?: string
): ProductRank[] {
  const productStats = new Map<string, { voteCount: number; totalWeight: number }>();

  // Ensure all eligible products are represented even with 0 votes
  for (const prod of eligibleProducts) {
    if (!productStats.has(prod)) {
      productStats.set(prod, { voteCount: 0, totalWeight: 0 });
    }
  }

  // Aggregate active votes
  let grandTotalWeight = 0;
  for (const vote of votes) {
    if (!vote.active) continue;
    grandTotalWeight += vote.weight;

    const current = productStats.get(vote.productId) || { voteCount: 0, totalWeight: 0 };
    current.voteCount += 1;
    current.totalWeight += vote.weight;
    productStats.set(vote.productId, current);
  }

  // Convert to array and sort: descending totalWeight, descending voteCount, ascending productId
  const entries: ProductRank[] = Array.from(productStats.entries()).map(([productId, stats]) => {
    const percentage = grandTotalWeight > 0 ? (stats.totalWeight / grandTotalWeight) * 100 : 0;
    const rankEntry: ProductRank = {
      productId,
      rank: 0,
      voteCount: stats.voteCount,
      totalWeight: stats.totalWeight,
      percentage: Math.round(percentage * 100) / 100,
    };
    if (category) {
      rankEntry.category = category;
    }
    return rankEntry;
  });

  entries.sort((a, b) => {
    if (b.totalWeight !== a.totalWeight) return b.totalWeight - a.totalWeight;
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    return a.productId.localeCompare(b.productId);
  });

  // Assign ranks (1-indexed)
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
  }

  return entries;
}

/**
 * Calculates reward distribution for voters based on weight contributed.
 */
export function calculateRewards(votes: UserVoteEntry[], totalRewardPool: number): VoterRewardEntry[] {
  if (totalRewardPool <= 0) return [];

  // Group weights by voter
  const voterWeights = new Map<string, number>();
  let totalWeight = 0;

  for (const vote of votes) {
    if (!vote.active) continue;
    const current = voterWeights.get(vote.voter) || 0;
    voterWeights.set(vote.voter, current + vote.weight);
    totalWeight += vote.weight;
  }

  if (totalWeight <= 0) return [];

  const results: VoterRewardEntry[] = [];
  for (const [voter, weight] of Array.from(voterWeights.entries())) {
    const fraction = weight / totalWeight;
    const rewardAmount = Math.round(fraction * totalRewardPool * 100) / 100;
    results.push({
      voter,
      weightContributed: weight,
      rewardAmount,
      percentageOfPool: Math.round(fraction * 10000) / 100,
    });
  }

  return results.sort((a, b) => b.rewardAmount - a.rewardAmount);
}
