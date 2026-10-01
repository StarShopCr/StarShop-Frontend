import { ethers, Contract } from 'ethers';
import { LOYALTY_CONTRACT_ADDRESS, LOYALTY_ERROR_CODES } from './constants/loyalty.constants';
import { LoyaltyLevel, LoyaltyUserState } from './types/loyalty.types';
import { Reward, RedemptionRequest } from './types/rewards.types';
import { UserPoints } from './types/points.types';
import { formatPoints } from './utils/loyalty.utils';

export class LoyaltyService {
  private contract: Contract;

  constructor(signerOrProvider: ethers.Signer | ethers.Provider) {
    // O ABI seria importado de um arquivo JSON gerado pelo Hardhat/Foundry
    const ABI = [
      'function initializeLoyaltyContract(address admin) external',
      'function updateAdmin(address newAdmin) external',
      'function setPointsExpiry(uint256 days) external',
      'function setMaxRedemptionPercentage(uint256 percentage) external',
      'function setPointsRatio(uint256 ratio) external',
      'function registerUser(address user) external',
      'function getPointsBalance(address user) external view returns (uint256)',
      'function getLifetimePoints(address user) external view returns (uint256)',
      'function recordPurchasePoints(address user, uint256 amount) external',
      'function addPoints(address user, uint256 amount, string memory description) external',
      'function initLevelRequirements(uint256[] requirements) external',
      'function checkAndUpdateLevel(address user) external',
      'function getUserLevel(address user) external view returns (uint256)',
      'function awardAnniversaryBonus(address user) external',
      'function createMilestone(string memory title, uint256 rewardPoints) external',
      'function completeMilestone(address user, uint256 milestoneId) external',
      'function checkAndCompleteMilestones(address user) external',
      'function createReward(string memory name, uint256 cost, uint256 discount) external',
      'function redeemReward(address user, uint256 rewardId, uint256 purchaseAmount) external',
      'function getAvailableRewards() external view returns (tuple(uint256 id, string name, uint256 cost, uint256 discount, bool active)[])',
    ];
    this.contract = new Contract(LOYALTY_CONTRACT_ADDRESS, ABI, signerOrProvider);
  }

  // --- Admin Management ---
  async initializeLoyaltyContract(admin: string) {
    return await this.contract.initializeLoyaltyContract(admin);
  }

  async updateAdmin(newAdmin: string) {
    return await this.contract.updateAdmin(newAdmin);
  }

  async setPointsExpiry(days: number) {
    return await this.contract.setPointsExpiry(days);
  }

  async setMaxRedemptionPercentage(percentage: number) {
    return await this.contract.setMaxRedemptionPercentage(percentage);
  }

  async setPointsRatio(ratio: number) {
    return await this.contract.setPointsRatio(ratio);
  }

  // --- Points Management ---
  async registerUser(user: string) {
    return await this.contract.registerUser(user);
  }

  async getPointsBalance(user: string): Promise<number> {
    const balance = await this.contract.getPointsBalance(user);
    return formatPoints(balance);
  }

  async getLifetimePoints(user: string): Promise<number> {
    const lifetime = await this.contract.getLifetimePoints(user);
    return formatPoints(lifetime);
  }

  async recordPurchasePoints(user: string, amount: number) {
    return await this.contract.recordPurchasePoints(user, amount);
  }

  async addPoints(user: string, amount: number, description: string) {
    return await this.contract.addPoints(user, amount, description);
  }

  // --- Level Management ---
  async initLevelRequirements(requirements: number[]) {
    return await this.contract.initLevelRequirements(requirements);
  }

  async checkAndUpdateLevel(user: string) {
    return await this.contract.checkAndUpdateLevel(user);
  }

  async getUserLevel(user: string): Promise<number> {
    const level = await this.contract.getUserLevel(user);
    return formatPoints(level);
  }

  async awardAnniversaryBonus(user: string) {
    return await this.contract.awardAnniversaryBonus(user);
  }

  // --- Milestone Management ---
  async createMilestone(milestone: { title: string; rewardPoints: number }) {
    return await this.contract.createMilestone(milestone.title, milestone.rewardPoints);
  }

  async completeMilestone(user: string, milestoneId: number) {
    return await this.contract.completeMilestone(user, milestoneId);
  }

  async checkAndCompleteMilestones(user: string) {
    return await this.contract.checkAndCompleteMilestones(user);
  }

  // --- Rewards Management ---
  async createReward(reward: { name: string; cost: number; discount: number }) {
    return await this.contract.createReward(reward.name, reward.cost, reward.discount);
  }

  async redeemReward(request: RedemptionRequest) {
    return await this.contract.redeemReward(
      request.userAddress, 
      request.rewardId, 
      request.purchaseAmount || 0
    );
  }

  async getAvailableRewards(): Promise<Reward[]> {
    const rewards = await this.contract.getAvailableRewards();
    return rewards.map((r: any) => ({
      id: r.id.toString(),
      name: r.name,
      pointsCost: formatPoints(r.cost),
      discountPercentage: formatPoints(r.discount),
      isActive: r.active,
      description: ''
    }));
  }

  async calculateDiscount(rewardId: string, purchaseAmount: number): Promise<number> {
    const rewards = await this.getAvailableRewards();
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || !reward.discountPercentage) return 0;
    
    return (purchaseAmount * reward.discountPercentage) / 100;
  }
}
