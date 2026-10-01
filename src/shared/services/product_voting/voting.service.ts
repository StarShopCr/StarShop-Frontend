import { ethers } from 'ethers';
import { VOTING_CONTRACT_ADDRESS, VOTING_ABI, VOTING_ERROR_CODES } from './constants/voting.constants';
import { VoteData, VotingResults, VotingStats, UserVoteHistory } from './types/voting.types';
import { ProductRanking, RankingHistory } from './types/ranking.types';
import { VotingLimits } from './types/limits.types';
import { validateVoteRange } from './utils/voting.utils';

export class VotingService {
  private contract: ethers.Contract;

  constructor(signerOrProvider: ethers.Signer | ethers.Provider) {
    this.contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, signerOrProvider);
  }

  // --- Voting Operations ---

  async voteForProduct(productId: string | number, user: string, vote: number): Promise<string> {
    if (!validateVoteRange(vote)) throw new Error(VOTING_ERROR_CODES.INVALID_VOTE_VALUE);
    const tx = await this.contract.voteForProduct(productId, vote);
    return await tx.wait();
  }

  async updateVote(productId: string | number, user: string, newVote: number): Promise<string> {
    if (!validateVoteRange(newVote)) throw new Error(VOTING_ERROR_CODES.INVALID_VOTE_VALUE);
    const tx = await this.contract.updateVote(productId, newVote);
    return await tx.wait();
  }

  async removeVote(productId: string | number, user: string): Promise<string> {
    const tx = await this.contract.removeVote(productId);
    return await tx.wait();
  }

  async getVote(productId: string | number, user: string): Promise<number> {
    return await this.contract.getVote(productId, user);
  }

  async getVotingResults(productId: string | number): Promise<VotingResults> {
    const [totalScore, voteCount] = await this.contract.getVotingResults(productId);
    return {
      totalScore: Number(totalScore),
      voteCount: Number(voteCount),
      averageScore: voteCount > 0 ? Number(totalScore) / Number(voteCount) : 0
    };
  }

  // --- Ranking Management ---

  async getProductRanking(productId: string | number): Promise<number> {
    return await this.contract.getProductRanking(productId);
  }

  async getTopProducts(limit: number, category: string = ''): Promise<string[]> {
    return await this.contract.getTopProducts(limit, category);
  }

  async updateRanking(productId: string | number): Promise<string> {
    // Assuming the contract has a trigger to recalculate ranking
    const tx = await this.contract.updateRanking(productId);
    return await tx.wait();
  }

  async getRankingHistory(productId: string | number): Promise<RankingHistory[]> {
    // This would typically be fetched from an indexer or a specific contract event log
    // Implementation depends on how history is stored in the contract
    return []; 
  }

  // --- Voting Limits & Validation ---

  async checkVotingLimits(user: string): Promise<VotingLimits> {
    const power = await this.getVotingPower(user);
    // Logic to determine if user can vote based on power and current usage
    return {
      maxVotesPerUser: 10, // Example constant
      currentVotes: 0,    // Would be fetched from contract
      votingPower: Number(power),
      canVote: Number(power) > 0
    };
  }

  async getVotingPower(user: string): Promise<number> {
    return await this.contract.getVotingPower(user);
  }

  validateVote(vote: number): boolean {
    return validateVoteRange(vote);
  }

  async getVotingStats(productId: string | number): Promise<VotingStats> {
    const [totalVotes, averageScore] = await this.contract.getVotingStats(productId);
    return {
      totalVotes: Number(totalVotes),
      averageScore: Number(averageScore)
    };
  }

  // --- Community Features ---

  async getVotingLeaderboard(): Promise<ProductRanking[]> {
    const topIds = await this.getTopProducts(10);
    const leaderboard: ProductRanking[] = [];
    
    for (let i = 0; i < topIds.length; i++) {
      const rank = await this.getProductRanking(topIds[i]);
      const results = await this.getVotingResults(topIds[i]);
      leaderboard.push({
        productId: topIds[i],
        rank: Number(rank),
        score: results.totalScore
      });
    }
    return leaderboard;
  }

  async getUserVotingHistory(user: string): Promise<UserVoteHistory[]> {
    const [productIds, votes] = await this.contract.getUserVotingHistory(user);
    return productIds.map((id: any, index: number) => ({
      productId: id.toString(),
      vote: Number(votes[index])
    }));
  }

  async getVotingTrends(timeframe: '24h' | '7d' | '30d'): Promise<any> {
    // Trends usually require an off-chain indexer (The Graph)
    // Returning a placeholder for the service structure
    return { timeframe, trend: 'stable' };
  }
}
