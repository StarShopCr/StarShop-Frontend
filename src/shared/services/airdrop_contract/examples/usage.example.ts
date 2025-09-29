/**
 * Example usage of the AirdropService
 * This file demonstrates how to use the comprehensive airdrop service layer
 */

import { 
  AirdropService, 
  NETWORKS, 
  METRIC_TYPES, 
  TOKEN_ADDRESSES,
  AirdropEventType,
  type AirdropEventConfig,
  type BatchDistributionParams
} from '../index';

// ==================== SERVICE INITIALIZATION ====================

/**
 * Initialize the airdrop service
 */
async function initializeService() {
  const airdropService = new AirdropService({
    network: NETWORKS.testnet,
    timeoutInSeconds: 30,
    fee: 100000,
    simulate: true,
    retryConfig: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true
    }
  });

  try {
    await airdropService.initialize();
    console.log('Airdrop service initialized successfully');
    return airdropService;
  } catch (error) {
    console.error('Failed to initialize service:', error);
    throw error;
  }
}

// ==================== CONTRACT ADMINISTRATION ====================

/**
 * Example: Initialize the contract
 */
async function initializeContract(airdropService: AirdropService) {
  const adminAddress = 'GABC123...'; // Replace with actual admin address
  
  const result = await airdropService.initializeAirdropContract(
    adminAddress,
    new Map([
      [METRIC_TYPES.PURCHASES, 'CPURCHASE123...'], // Provider contract address
      [METRIC_TYPES.TOTAL_SPENT, 'CSPENT123...'],
      [METRIC_TYPES.TEAM_SIZE, 'CTEAM123...']
    ])
  );

  if (result.success) {
    console.log('Contract initialized:', result.data);
  } else {
    console.error('Failed to initialize contract:', result.error);
  }
}

/**
 * Example: Register a new metric provider
 */
async function registerProvider(airdropService: AirdropService) {
  const result = await airdropService.registerProvider(
    METRIC_TYPES.LOYALTY_POINTS,
    'CLOYALTY123...' // Provider contract address
  );

  if (result.success) {
    console.log('Provider registered successfully');
  } else {
    console.error('Failed to register provider:', result.error);
  }
}

/**
 * Example: Update admin address
 */
async function updateAdmin(airdropService: AirdropService) {
  const currentAdmin = 'GABC123...';
  const newAdmin = 'GDEF456...';

  const result = await airdropService.setAdmin(currentAdmin, newAdmin);

  if (result.success) {
    console.log('Admin updated successfully');
  } else {
    console.error('Failed to update admin:', result.error);
  }
}

// ==================== EVENT MANAGEMENT ====================

/**
 * Example: Create a new airdrop event
 */
async function createAirdropEvent(airdropService: AirdropService) {
  const eventConfig: AirdropEventConfig = {
    name: 'Loyalty Rewards - Q1 2024',
    description: 'Reward loyal customers with tokens based on their purchase history and team size',
    conditions: new Map([
      [METRIC_TYPES.PURCHASES, 5n], // Minimum 5 purchases
      [METRIC_TYPES.TOTAL_SPENT, 1000n], // Minimum 1000 tokens spent
      [METRIC_TYPES.TEAM_SIZE, 3n] // Minimum team size of 3
    ]),
    amount: 1000000000n, // 100 tokens (with 7 decimals)
    tokenAddress: TOKEN_ADDRESSES.USDC,
    startTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // Start in 1 hour
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), // End in 30 days
    maxUsers: 1000n, // Maximum 1000 users
    maxTotalAmount: 100000000000n // Maximum 100,000 tokens total
  };

  const result = await airdropService.createAirdropEvent(eventConfig);

  if (result.success) {
    console.log('Airdrop event created with ID:', result.data);
    return result.data;
  } else {
    console.error('Failed to create airdrop event:', result.error);
    return null;
  }
}

/**
 * Example: Get event details
 */
async function getEventDetails(airdropService: AirdropService, eventId: bigint) {
  const result = await airdropService.getEvent(eventId);

  if (result.success) {
    const event = result.data!;
    console.log('Event Details:');
    console.log('- Name:', event.name);
    console.log('- Description:', event.description.toString());
    console.log('- Amount per user:', event.amount.toString());
    console.log('- Token:', event.tokenAddress);
    console.log('- Start time:', new Date(Number(event.startTime) * 1000));
    console.log('- End time:', new Date(Number(event.endTime) * 1000));
    console.log('- Is active:', event.isActive);
    console.log('- Max users:', event.maxUsers);
    console.log('- Max total amount:', event.maxTotalAmount);
    console.log('- Conditions:', Object.fromEntries(event.conditions));
  } else {
    console.error('Failed to get event details:', result.error);
  }
}

/**
 * Example: Get event statistics
 */
async function getEventStats(airdropService: AirdropService, eventId: bigint) {
  const result = await airdropService.getEventStats(eventId);

  if (result.success) {
    const stats = result.data!;
    console.log('Event Statistics:');
    console.log('- Recipients:', stats.recipientCount.toString());
    console.log('- Total distributed:', stats.totalAmountDistributed.toString());
  } else {
    console.error('Failed to get event stats:', result.error);
  }
}

/**
 * Example: Pause an event
 */
async function pauseEvent(airdropService: AirdropService, eventId: bigint) {
  const result = await airdropService.pauseEvent(eventId);

  if (result.success) {
    console.log('Event paused successfully');
  } else {
    console.error('Failed to pause event:', result.error);
  }
}

/**
 * Example: Resume an event
 */
async function resumeEvent(airdropService: AirdropService, eventId: bigint) {
  const result = await airdropService.resumeEvent(eventId);

  if (result.success) {
    console.log('Event resumed successfully');
  } else {
    console.error('Failed to resume event:', result.error);
  }
}

/**
 * Example: Finalize an event
 */
async function finalizeEvent(airdropService: AirdropService, eventId: bigint) {
  const result = await airdropService.finalizeEvent(eventId);

  if (result.success) {
    console.log('Event finalized successfully');
  } else {
    console.error('Failed to finalize event:', result.error);
  }
}

// ==================== USER OPERATIONS ====================

/**
 * Example: Check user eligibility
 */
async function checkUserEligibility(airdropService: AirdropService, eventId: bigint, userAddress: string) {
  const result = await airdropService.checkEligibility(eventId, userAddress);

  if (result.success) {
    const status = result.data!;
    console.log('Eligibility Status:');
    console.log('- Has claimed:', status.hasClaimed);
    console.log('- Is eligible:', status.isEligible);
    console.log('- Claim amount:', status.claimAmount?.toString());
    if (status.ineligibilityReason) {
      console.log('- Reason:', status.ineligibilityReason);
    }
  } else {
    console.error('Failed to check eligibility:', result.error);
  }
}

/**
 * Example: User claims airdrop
 */
async function claimAirdrop(airdropService: AirdropService, eventId: bigint) {
  const result = await airdropService.claimAirdrop(eventId);

  if (result.success) {
    console.log('Airdrop claimed successfully:', result.data);
  } else {
    console.error('Failed to claim airdrop:', result.error);
  }
}

/**
 * Example: List claimed users
 */
async function listClaimedUsers(airdropService: AirdropService, eventId: bigint) {
  const result = await airdropService.listClaimedUsers(eventId, 50);

  if (result.success) {
    console.log('Claimed users:', result.data);
  } else {
    console.error('Failed to list claimed users:', result.error);
  }
}

// ==================== BATCH OPERATIONS ====================

/**
 * Example: Batch distribution
 */
async function batchDistribution(airdropService: AirdropService, eventId: bigint) {
  const users = [
    'GUSER123...',
    'GUSER456...',
    'GUSER789...'
  ];

  const params: BatchDistributionParams = {
    eventId,
    users,
    batchSize: 10
  };

  const result = await airdropService.distributeBatch(params);

  if (result.success) {
    console.log('Batch distribution completed:', result.data);
  } else {
    console.error('Failed to distribute batch:', result.error);
  }
}

// ==================== EVENT MONITORING ====================

/**
 * Example: Set up event monitoring
 */
function setupEventMonitoring(airdropService: AirdropService) {
  // Listen for all events
  const subscriptionId = airdropService.addEventListener(
    [
      AirdropEventType.EVENT_CREATED,
      AirdropEventType.CLAIM_SUCCESSFUL,
      AirdropEventType.CLAIM_FAILED,
      AirdropEventType.EVENT_FINALIZED
    ],
    (event) => {
      console.log('Airdrop Event:', event);
      
      switch (event.type) {
        case AirdropEventType.EVENT_CREATED:
          console.log(`New airdrop event created: ${event.eventName} (ID: ${event.eventId})`);
          break;
        case AirdropEventType.CLAIM_SUCCESSFUL:
          console.log(`User ${event.userAddress} successfully claimed ${event.claimAmount} tokens`);
          break;
        case AirdropEventType.CLAIM_FAILED:
          console.log(`User ${event.userAddress} failed to claim: ${event.error}`);
          break;
        case AirdropEventType.EVENT_FINALIZED:
          console.log(`Event ${event.eventId} finalized with ${event.recipientCount} recipients`);
          break;
      }
    }
  );

  console.log('Event monitoring set up with subscription ID:', subscriptionId);
  return subscriptionId;
}

/**
 * Example: Remove event monitoring
 */
function removeEventMonitoring(airdropService: AirdropService, subscriptionId: string) {
  const removed = airdropService.removeEventListener(subscriptionId);
  console.log('Event monitoring removed:', removed);
}

// ==================== COMPLETE WORKFLOW EXAMPLE ====================

/**
 * Complete workflow example
 */
async function completeWorkflow() {
  try {
    // 1. Initialize service
    const airdropService = await initializeService();

    // 2. Set up event monitoring
    const subscriptionId = setupEventMonitoring(airdropService);

    // 3. Initialize contract (admin only)
    // await initializeContract(airdropService);

    // 4. Create airdrop event (admin only)
    const eventId = await createAirdropEvent(airdropService);
    if (!eventId) return;

    // 5. Get event details
    await getEventDetails(airdropService, eventId);

    // 6. Check user eligibility
    const userAddress = 'GUSER123...'; // Replace with actual user address
    await checkUserEligibility(airdropService, eventId, userAddress);

    // 7. User claims airdrop
    await claimAirdrop(airdropService, eventId);

    // 8. Get updated statistics
    await getEventStats(airdropService, eventId);

    // 9. List claimed users
    await listClaimedUsers(airdropService, eventId);

    // 10. Clean up
    removeEventMonitoring(airdropService, subscriptionId);
    airdropService.destroy();

    console.log('Complete workflow executed successfully');
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

// ==================== UTILITY EXAMPLES ====================

/**
 * Example: Using utility functions
 */
function utilityExamples() {
  // Format token amounts
  const amount = 1000000000n; // 100 tokens with 7 decimals
  console.log('Formatted amount:', formatTokenAmount(amount, 7)); // "100"

  // Parse token amounts
  const parsedAmount = parseTokenAmount('100.5', 7);
  console.log('Parsed amount:', parsedAmount.toString());

  // Format duration
  const duration = 86400; // 1 day in seconds
  console.log('Formatted duration:', formatDuration(duration)); // "1 day"

  // Validate addresses
  const stellarAddress = 'GABC123...';
  const contractAddress = 'CABC123...';
  console.log('Valid Stellar address:', isValidStellarAddress(stellarAddress));
  console.log('Valid contract address:', isValidContractAddress(contractAddress));
}

// Export examples for use
export {
  initializeService,
  initializeContract,
  registerProvider,
  updateAdmin,
  createAirdropEvent,
  getEventDetails,
  getEventStats,
  pauseEvent,
  resumeEvent,
  finalizeEvent,
  checkUserEligibility,
  claimAirdrop,
  listClaimedUsers,
  batchDistribution,
  setupEventMonitoring,
  removeEventMonitoring,
  completeWorkflow,
  utilityExamples
};
