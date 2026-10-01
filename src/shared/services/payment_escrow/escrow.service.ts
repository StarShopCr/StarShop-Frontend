import { ethers } from 'ethers';
import { 
  EscrowConfig, 
  EscrowDetails, 
  EscrowUpdate 
} from './types/escrow.types';
import { 
  DisputeDetails, 
  DisputeResolution 
} from './types/dispute.types';
import { 
  Arbitrator, 
  ArbitratorDecision 
} from './types/arbitrator.types';
import { 
  ESCROW_CONTRACT_ADDRESS, 
  ESCROW_STATUS 
} from './constants/escrow.constants';

class EscrowService {
  private contract: any;

  constructor(signerOrProvider: ethers.Signer | ethers.Provider) {
    // O ABI seria importado de um arquivo JSON de artefatos do contrato
    const ESCROW_ABI = [
      "function createEscrow(address _seller, uint256 _amount, string memory _orderId) public payable returns (bytes32)",
      "function getEscrow(bytes32 _escrowId) public view returns (address, address, uint256, string, string)",
      "function releasePayment(bytes32 _escrowId) public",
      "function refundPayment(bytes32 _escrowId) public",
      "function createDispute(bytes32 _escrowId, string memory _reason) public",
      "function resolveDispute(bytes32 _disputeId, uint8 _resolution) public",
      "function assignArbitrator(bytes32 _escrowId, address _arbitrator) public",
      "function arbitratorDecision(bytes32 _disputeId, uint8 _decision) public"
    ];
    
    this.contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signerOrProvider);
  }

  // 1. Escrow Creation & Management
  async createEscrow(config: EscrowConfig): Promise<string> {
    const tx = await this.contract.createEscrow(
      config.seller, 
      ethers.utils.parseEther(config.amount), 
      config.orderId, 
      { value: ethers.utils.parseEther(config.amount) }
    );
    const receipt = await tx.wait();
    return receipt.transactionHash; // Simplificado: retornando hash ou evento ID
  }

  async getEscrow(escrowId: string): Promise<EscrowDetails> {
    const data = await this.contract.getEscrow(escrowId);
    return {
      id: escrowId,
      buyer: data[0],
      seller: data[1],
      amount: ethers.utils.formatEther(data[2]),
      status: data[4] as ESCROW_STATUS,
      orderId: data[3],
      createdAt: Date.now(), // Mocked: contrato deveria prover timestamp
      updatedAt: Date.now(),
    };
  }

  async updateEscrow(escrowId: string, updates: EscrowUpdate): Promise<void> {
    // Lógica de atualização via contrato (se disponível) ou API de indexação
    console.log(`Updating escrow ${escrowId}`, updates);
  }

  async cancelEscrow(escrowId: string): Promise<void> {
    const tx = await this.contract.refundPayment(escrowId);
    await tx.wait();
  }

  // 2. Payment Operations
  async depositPayment(escrowId: string, amount: string): Promise<void> {
    // Geralmente o depósito ocorre na criação, mas implementado para flexibilidade
    const tx = await this.contract.createEscrow(ethers.constants.AddressZero, ethers.utils.parseEther(amount), escrowId, { value: ethers.utils.parseEther(amount) });
    await tx.wait();
  }

  async releasePayment(escrowId: string): Promise<void> {
    const tx = await this.contract.releasePayment(escrowId);
    await tx.wait();
  }

  async refundPayment(escrowId: string): Promise<void> {
    const tx = await this.contract.refundPayment(escrowId);
    await tx.wait();
  }

  async getPaymentStatus(escrowId: string): Promise<ESCROW_STATUS> {
    const escrow = await this.getEscrow(escrowId);
    return escrow.status;
  }

  // 3. Dispute Management
  async createDispute(escrowId: string, reason: string): Promise<string> {
    const tx = await this.contract.createDispute(escrowId, reason);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async getDispute(disputeId: string): Promise<DisputeDetails> {
    // Mocked: Implementação depende de funções de leitura do contrato
    return {
      id: disputeId,
      escrowId: '0x...',
      reason: 'Item not received',
      status: 'OPEN',
      createdAt: Date.now(),
    };
  }

  async resolveDispute(disputeId: string, resolution: DisputeResolution): Promise<void> {
    const resolutionMap: Record<DisputeResolution, number> = {
      'REFUND_BUYER': 0,
      'RELEASE_TO_SELLER': 1,
      'PARTIAL_REFUND': 2
    };
    const tx = await this.contract.resolveDispute(disputeId, resolutionMap[resolution]);
    await tx.wait();
  }

  async getDisputeStatus(disputeId: string): Promise<string> {
    const dispute = await this.getDispute(disputeId);
    return dispute.status;
  }

  // 4. Arbitrator Operations
  async assignArbitrator(escrowId: string, arbitrator: string): Promise<void> {
    const tx = await this.contract.assignArbitrator(escrowId, arbitrator);
    await tx.wait();
  }

  async getArbitrator(escrowId: string): Promise<Arbitrator> {
    // Mocked: Implementação de leitura do contrato
    return {
      address: '0x...',
      reputation: 100,
      isVerified: true,
    };
  }

  async arbitratorDecision(disputeId: string, decision: ArbitratorDecision): Promise<void> {
    const decisionMap: Record<ArbitratorDecision, number> = {
      'BUYER_WIN': 0,
      'SELLER_WIN': 1,
      'SPLIT': 2
    };
    const tx = await this.contract.arbitratorDecision(disputeId, decisionMap[decision]);
    await tx.wait();
  }
}

export default new EscrowService(null as any); // Singleton pattern, provider injected at runtime
