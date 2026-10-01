import { ethers } from 'ethers';
import { 
  AUCTION_CONTRACT_ADDRESS, 
  AUCTION_ABI 
} from './constants/auction.constants';
import { 
  Auction, 
  AuctionConfig, 
  AuctionUpdate, 
  AuctionResult 
} from './types/auction.types';
import { Bid, BidResponse } from './types/bid.types';
import { DistributionDetails, DistributionStatus } from './types/distribution.types';
import { parseEtherAmount } from './utils/auction.utils';

export class AuctionService {
  private contract: ethers.Contract;

  constructor(signerOrProvider: ethers.Signer | ethers.Provider) {
    this.contract = new ethers.Contract(
      AUCTION_CONTRACT_ADDRESS, 
      AUCTION_ABI, 
      signerOrProvider
    );
  }

  // --- Auction Management ---

  async createAuction(config: AuctionConfig): Promise<number> {
    const tx = await this.contract.createAuction({
      price: config.price,
      duration: config.duration,
      seller: config.seller
    });
    const receipt = await tx.wait();
    // Assume event parsing for auctionId
    return receipt.events[0].args.auctionId;
  }

  async getAuction(auctionId: number): Promise<Auction> {
    const data = await this.contract.getAuction(auctionId);
    return {
      id: auctionId,
      price: Number(data.price),
      duration: Number(data.duration),
      seller: data.seller,
      endTime: Number(data.endTime),
      isActive: data.active
    };
  }

  async updateAuction(auctionId: number, updates: AuctionUpdate): Promise<void> {
    const tx = await this.contract.updateAuction(auctionId, updates.price);
    await tx.wait();
  }

  async cancelAuction(auctionId: number): Promise<void> {
    const tx = await this.contract.cancelAuction(auctionId);
    await tx.wait();
  }

  async listAuctions(status?: boolean, limit?: number): Promise<Auction[]> {
    // Note: Implementation depends on contract having a getter for all IDs
    // This is a mock implementation of the listing logic
    const auctions: Auction[] = [];
    // Logic to fetch and filter auctions...
    return auctions;
  }

  // --- Bidding Operations ---

  async placeBid(auctionId: number, amount: string | number): Promise<BidResponse> {
    try {
      const tx = await this.contract.placeBid(auctionId, { 
        value: parseEtherAmount(amount) 
      });
      const receipt = await tx.wait();
      return { success: true, transactionHash: receipt.transactionHash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateBid(auctionId: number, newAmount: string | number): Promise<BidResponse> {
    // In most auction contracts, updating a bid is just placing a higher bid
    return this.placeBid(auctionId, newAmount);
  }

  async withdrawBid(auctionId: number): Promise<void> {
    const tx = await this.contract.withdrawBid(auctionId);
    await tx.wait();
  }

  async getBid(auctionId: number, bidder: string): Promise<Bid> {
    // Mock implementation as specific getter depends on contract state
    return {
      auctionId,
      bidder,
      amount: 0,
      timestamp: Date.now()
    };
  }

  async getHighestBid(auctionId: number): Promise<Bid> {
    const data = await this.contract.getHighestBid(auctionId);
    return {
      bidder: data.bidder,
      amount: Number(data.amount),
      auctionId,
      timestamp: Date.now()
    };
  }

  // --- Auction Execution ---

  async endAuction(auctionId: number): Promise<void> {
    const tx = await this.contract.endAuction(auctionId);
    await tx.wait();
  }

  async distributeAuction(auctionId: number): Promise<void> {
    const tx = await this.contract.distributeAuction(auctionId);
    await tx.wait();
  }

  async claimWinnings(auctionId: number): Promise<void> {
    const tx = await this.contract.claimWinnings(auctionId);
    await tx.wait();
  }

  async getAuctionResults(auctionId: number): Promise<AuctionResult> {
    const highestBid = await this.getHighestBid(auctionId);
    return {
      winner: highestBid.bidder,
      finalPrice: highestBid.amount,
      timestamp: Date.now()
    };
  }

  // --- Distribution Management ---

  async getDistribution(auctionId: number): Promise<DistributionDetails> {
    const auction = await this.getAuction(auctionId);
    return {
      auctionId,
      totalAmount: auction.price,
      sellerAddress: auction.seller,
      platformFee: auction.price * 0.05, // Example 5% fee
      netAmount: auction.price * 0.95,
      status: 'Pending'
    };
  }

  async processDistribution(auctionId: number): Promise<void> {
    await this.distributeAuction(auctionId);
  }

  async getDistributionStatus(auctionId: number): Promise<DistributionStatus> {
    const isProcessed = await this.contract.getDistributionStatus(auctionId);
    return {
      isProcessed,
      lastUpdated: Date.now()
    };
  }
}
