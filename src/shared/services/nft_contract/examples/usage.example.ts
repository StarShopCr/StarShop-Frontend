import { NFTService, NFTEventType, NETWORKS } from '../index';
import type { MintRequest, TransferRequest, BurnRequest, MetadataUpdateRequest } from '../types/nft.types';

/**
 * Example usage of the NFT Service
 * 
 * This file demonstrates how to use the NFT service for various operations
 * including contract initialization, NFT minting, transfers, and metadata management.
 */

// Initialize the NFT service
const nftService = new NFTService({
  network: NETWORKS.testnet,
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true,
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000
  }
});

/**
 * Example: Initialize the service and contract
 */
export async function initializeService() {
  try {
    // Initialize the service
    await nftService.initialize();
    
    // Check if contract is already initialized
    const isInitialized = await nftService.isInitialized();
    if (!isInitialized.success || !isInitialized.data) {
      // Initialize the contract with admin address
      const adminAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Replace with actual admin address
      const initResult = await nftService.initializeNFTContract(adminAddress);
      
      if (initResult.success) {
        console.log('Contract initialized successfully:', initResult.transactionHash);
      } else {
        console.error('Failed to initialize contract:', initResult.error);
      }
    }
    
    // Get contract admin
    const adminResult = await nftService.getAdmin();
    if (adminResult.success) {
      console.log('Contract admin:', adminResult.data);
    }
    
    return true;
  } catch (error) {
    console.error('Service initialization failed:', error);
    return false;
  }
}

/**
 * Example: Mint a new NFT
 */
export async function mintNFTExample() {
  try {
    const mintRequest: MintRequest = {
      to: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with recipient address
      name: 'StarShop Digital Art #1',
      description: 'A beautiful digital artwork created for the StarShop marketplace',
      attributes: [
        'Artist: DigitalCreator',
        'Medium: Digital',
        'Year: 2024',
        'Style: Abstract',
        'Rarity: Rare',
        'Collection: StarShop Art'
      ]
    };

    const result = await nftService.mintNFT(mintRequest);
    
    if (result.success) {
      console.log('NFT minted successfully!');
      console.log('Token ID:', result.data);
      console.log('Transaction hash:', result.transactionHash);
      return result.data;
    } else {
      console.error('Failed to mint NFT:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Mint operation failed:', error);
    return null;
  }
}

/**
 * Example: Get NFT metadata
 */
export async function getNFTMetadata(tokenId: number) {
  try {
    const result = await nftService.getMetadata(tokenId);
    
    if (result.success) {
      console.log('NFT Metadata:');
      console.log('Name:', result.data!.name);
      console.log('Description:', result.data!.description);
      console.log('Attributes:', result.data!.attributes);
      return result.data;
    } else {
      console.error('Failed to get metadata:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Get metadata operation failed:', error);
    return null;
  }
}

/**
 * Example: Get NFT owner
 */
export async function getNFTOwner(tokenId: number) {
  try {
    const result = await nftService.getOwner(tokenId);
    
    if (result.success) {
      console.log(`NFT #${tokenId} owner:`, result.data);
      return result.data;
    } else {
      console.error('Failed to get owner:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Get owner operation failed:', error);
    return null;
  }
}

/**
 * Example: Transfer NFT
 */
export async function transferNFTExample(tokenId: number, fromAddress: string, toAddress: string) {
  try {
    const transferRequest: TransferRequest = {
      from: fromAddress,
      to: toAddress,
      tokenId: tokenId
    };

    const result = await nftService.transferNFT(transferRequest);
    
    if (result.success) {
      console.log('NFT transferred successfully!');
      console.log('Transaction hash:', result.transactionHash);
      return true;
    } else {
      console.error('Failed to transfer NFT:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Transfer operation failed:', error);
    return false;
  }
}

/**
 * Example: Update NFT metadata (admin only)
 */
export async function updateMetadataExample(tokenId: number, adminAddress: string) {
  try {
    const updateRequest: MetadataUpdateRequest = {
      tokenId: tokenId,
      admin: adminAddress,
      name: 'Updated StarShop Digital Art #1',
      description: 'Updated description for this beautiful digital artwork',
      attributes: [
        'Artist: DigitalCreator',
        'Medium: Digital',
        'Year: 2024',
        'Style: Abstract',
        'Rarity: Epic', // Updated rarity
        'Collection: StarShop Art',
        'Updated: true' // New attribute
      ]
    };

    const result = await nftService.updateMetadata(updateRequest);
    
    if (result.success) {
      console.log('Metadata updated successfully!');
      console.log('Transaction hash:', result.transactionHash);
      return true;
    } else {
      console.error('Failed to update metadata:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Update metadata operation failed:', error);
    return false;
  }
}

/**
 * Example: Burn NFT
 */
export async function burnNFTExample(tokenId: number, ownerAddress: string) {
  try {
    const burnRequest: BurnRequest = {
      owner: ownerAddress,
      tokenId: tokenId
    };

    const result = await nftService.burnNFT(burnRequest);
    
    if (result.success) {
      console.log('NFT burned successfully!');
      console.log('Transaction hash:', result.transactionHash);
      return true;
    } else {
      console.error('Failed to burn NFT:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Burn operation failed:', error);
    return false;
  }
}

/**
 * Example: Get supply information
 */
export async function getSupplyInfoExample() {
  try {
    const result = await nftService.getSupplyInfo();
    
    if (result.success) {
      const supplyInfo = result.data!;
      console.log('Supply Information:');
      console.log('Max Supply:', supplyInfo.maxSupply);
      console.log('Current Supply:', supplyInfo.currentSupply);
      console.log('Remaining Supply:', supplyInfo.remainingSupply);
      console.log('Supply Percentage:', supplyInfo.supplyPercentage + '%');
      return supplyInfo;
    } else {
      console.error('Failed to get supply info:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Get supply info operation failed:', error);
    return null;
  }
}

/**
 * Example: Set maximum supply (admin only)
 */
export async function setMaxSupplyExample(adminAddress: string, maxSupply: number) {
  try {
    const result = await nftService.setMaxSupply(maxSupply);
    
    if (result.success) {
      console.log('Max supply updated successfully!');
      console.log('New max supply:', maxSupply);
      console.log('Transaction hash:', result.transactionHash);
      return true;
    } else {
      console.error('Failed to set max supply:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Set max supply operation failed:', error);
    return false;
  }
}

/**
 * Example: Event listener setup
 */
export function setupEventListeners() {
  // Listen for NFT minted events
  const mintListenerId = nftService.addEventListener(
    [NFTEventType.NFT_MINTED],
    (event) => {
      console.log('🎨 New NFT minted!');
      console.log('Token ID:', event.tokenId);
      console.log('Owner:', event.owner);
      console.log('Transaction:', event.transactionHash);
    }
  );

  // Listen for NFT transfer events
  const transferListenerId = nftService.addEventListener(
    [NFTEventType.NFT_TRANSFERRED],
    (event) => {
      console.log('🔄 NFT transferred!');
      console.log('Token ID:', event.tokenId);
      console.log('From:', event.from);
      console.log('To:', event.to);
      console.log('Transaction:', event.transactionHash);
    }
  );

  // Listen for metadata update events
  const metadataListenerId = nftService.addEventListener(
    [NFTEventType.METADATA_UPDATED],
    (event) => {
      console.log('📝 Metadata updated!');
      console.log('Token ID:', event.tokenId);
      console.log('Admin:', event.admin);
      console.log('Transaction:', event.transactionHash);
    }
  );

  // Listen for all error events
  const errorListenerId = nftService.addEventListener(
    [NFTEventType.ERROR],
    (event) => {
      console.error('❌ NFT Service Error:', event.error);
      console.log('Operation:', event.error);
    }
  );

  console.log('Event listeners set up with IDs:', {
    mintListenerId,
    transferListenerId,
    metadataListenerId,
    errorListenerId
  });

  // Return listener IDs for cleanup
  return {
    mintListenerId,
    transferListenerId,
    metadataListenerId,
    errorListenerId
  };
}

/**
 * Example: Health check
 */
export async function performHealthCheck() {
  try {
    const healthCheck = await nftService.healthCheck();
    
    console.log('🏥 Health Check Results:');
    console.log('Overall Health:', healthCheck.isHealthy ? '✅ Healthy' : '❌ Unhealthy');
    console.log('Contract Connected:', healthCheck.contractConnected ? '✅' : '❌');
    console.log('Network Connected:', healthCheck.networkConnected ? '✅' : '❌');
    console.log('Wallet Connected:', healthCheck.walletConnected ? '✅' : '❌');
    
    if (healthCheck.errors.length > 0) {
      console.log('Errors:', healthCheck.errors);
    }
    
    return healthCheck;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
}

/**
 * Example: Performance metrics
 */
export function getPerformanceMetrics() {
  const metrics = nftService.getPerformanceMetrics();
  
  console.log('📊 Performance Metrics:');
  console.log('Average Response Time:', metrics.averageResponseTime + 'ms');
  console.log('Total Operations:', metrics.totalOperations);
  console.log('Successful Operations:', metrics.successfulOperations);
  console.log('Failed Operations:', metrics.failedOperations);
  console.log('Success Rate:', ((metrics.successfulOperations / metrics.totalOperations) * 100).toFixed(2) + '%');
  
  return metrics;
}

/**
 * Example: Complete workflow
 */
export async function completeWorkflowExample() {
  console.log('🚀 Starting NFT Service Complete Workflow Example');
  
  try {
    // 1. Initialize service
    console.log('\n1. Initializing service...');
    const initialized = await initializeService();
    if (!initialized) {
      throw new Error('Service initialization failed');
    }

    // 2. Setup event listeners
    console.log('\n2. Setting up event listeners...');
    const listeners = setupEventListeners();

    // 3. Perform health check
    console.log('\n3. Performing health check...');
    await performHealthCheck();

    // 4. Get current supply info
    console.log('\n4. Getting supply information...');
    await getSupplyInfoExample();

    // 5. Mint a new NFT
    console.log('\n5. Minting new NFT...');
    const tokenId = await mintNFTExample();
    if (!tokenId) {
      throw new Error('NFT minting failed');
    }

    // 6. Get NFT metadata
    console.log('\n6. Getting NFT metadata...');
    await getNFTMetadata(tokenId);

    // 7. Get NFT owner
    console.log('\n7. Getting NFT owner...');
    await getNFTOwner(tokenId);

    // 8. Get performance metrics
    console.log('\n8. Getting performance metrics...');
    getPerformanceMetrics();

    console.log('\n✅ Complete workflow example finished successfully!');

    // Cleanup: Remove event listeners
    Object.values(listeners).forEach(id => {
      nftService.removeEventListener(id);
    });

    return true;
  } catch (error) {
    console.error('❌ Workflow example failed:', error);
    return false;
  }
}

// Export the service instance for external use
export { nftService };
