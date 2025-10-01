# Governance System Service

A comprehensive TypeScript service layer for the Governance System Contract that enables decentralized decision-making, proposal management, and voting mechanisms within the StarShop ecosystem.

## 🏗 Service Structure

```
src/shared/services/governance_system/
├── governance.service.ts            // Main service class
├── types/
│   ├── governance.types.ts         // Core governance interfaces
│   ├── proposal.types.ts           // Proposal-related types
│   └── voting.types.ts             // Voting-related types
├── utils/
│   └── governance.utils.ts         // Helper functions
├── constants/
│   └── governance.constants.ts     // Contract addresses, error codes
├── index.ts                        // Main exports
└── README.md                       // This file
```

## 🚀 Features

### Contract Initialization & Admin Management
- ✅ Initialize governance contract
- ✅ Get current admin
- ✅ Update admin rights (if supported)
- ✅ Contract status monitoring

### Proposal Management
- ✅ Create new governance proposals
- ✅ Get proposal details
- ✅ Update proposals (if supported)
- ✅ Cancel proposals
- ✅ Activate proposals
- ✅ Veto proposals
- ✅ Mark proposals as passed/rejected/executed
- ✅ List proposals with filters

### Voting Operations
- ✅ Cast votes on proposals
- ✅ Get voter's vote
- ✅ Get voting results
- ✅ Delegate voting power
- ✅ Take voting snapshots

### Execution & Weights
- ✅ Execute passed proposals
- ✅ Get voting power
- ✅ Update voting weights (if supported)

### Error Handling & Validation
- ✅ Comprehensive error handling
- ✅ Proposal validation
- ✅ Vote validation
- ✅ Input sanitization
- ✅ Type safety

## 📦 Installation

```typescript
import { GovernanceService } from '@/shared/services/governance_system';
```

## 🔧 Configuration

```typescript
import { GovernanceService, NETWORKS, DEFAULT_CONFIG } from '@/shared/services/governance_system';

const governanceService = new GovernanceService({
  network: NETWORKS.testnet,
  timeoutInSeconds: 30,
  fee: 100000,
  simulate: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000
  }
});

// Initialize the service
await governanceService.initialize();
```

## 💡 Usage Examples

### Initialize Contract

```typescript
const initResult = await governanceService.initializeGovernanceContract({
  admin: 'GABC123...',
  token: 'GXYZ789...',
  referralContract: 'GDEF456...',
  auctionContract: 'GHIJ012...',
  config: {
    duration: 604800, // 7 days
    executionDelay: 86400, // 1 day
    oneAddressOneVote: true,
    quorum: 20, // 20%
    threshold: 50 // 50%
  }
});

if (initResult.success) {
  console.log('Contract initialized:', initResult.data);
}
```

### Create Proposal

```typescript
const proposalResult = await governanceService.createProposal({
  proposer: 'GABC123...',
  title: 'Add New Feature',
  description: 'This proposal adds a new feature to the platform',
  metadataHash: 'abc123...',
  proposalType: ProposalType.FEATURE_REQUEST,
  actions: [{
    type: ActionType.UPDATE_PROPOSAL_REQUIREMENTS,
    data: {
      cooldownPeriod: 3600,
      maxVotingPower: 1000000,
      proposalLimit: 5,
      requiredStake: 100000
    }
  }],
  votingConfig: {
    duration: 604800,
    executionDelay: 86400,
    oneAddressOneVote: true,
    quorum: 20,
    threshold: 50
  }
});

if (proposalResult.success) {
  console.log('Proposal created with ID:', proposalResult.data);
}
```

### Vote on Proposal

```typescript
const voteResult = await governanceService.vote({
  voter: 'GABC123...',
  proposalId: 1,
  support: true
});

if (voteResult.success) {
  console.log('Vote cast successfully');
}
```

### Get Voting Results

```typescript
const resultsResult = await governanceService.getVotingResults(1);

if (resultsResult.success) {
  const results = resultsResult.data;
  console.log('Voting Results:', {
    totalVotes: results.totalVotes,
    votesFor: results.votesFor,
    votesAgainst: results.votesAgainst,
    participationRate: results.participationRate,
    passed: results.passed
  });
}
```

### Delegate Voting Power

```typescript
const delegateResult = await governanceService.delegateVote({
  delegator: 'GABC123...',
  delegatee: 'GXYZ789...'
});

if (delegateResult.success) {
  console.log('Voting power delegated successfully');
}
```

### Execute Proposal

```typescript
const executeResult = await governanceService.executeProposal({
  proposalId: 1,
  executor: 'GABC123...'
});

if (executeResult.success) {
  console.log('Proposal executed successfully');
}
```

### List Proposals

```typescript
const proposalsResult = await governanceService.listProposals({
  status: ProposalStatus.ACTIVE,
  limit: 10,
  offset: 0
});

if (proposalsResult.success) {
  console.log('Proposals:', proposalsResult.data.proposals);
}
```

## 🎯 Event System

The service includes a comprehensive event system for monitoring governance activities:

```typescript
// Add event listener
const subscriptionId = governanceService.addEventListener(
  [GovernanceEventType.PROPOSAL_CREATED, GovernanceEventType.VOTE_CAST],
  (event) => {
    console.log('Governance event:', event);
  },
  {
    proposalId: 1 // Optional filter
  }
);

// Remove event listener
governanceService.removeEventListener(subscriptionId);
```

### Available Events

- `CONTRACT_INITIALIZED` - Contract initialization
- `ADMIN_CHANGED` - Admin address change
- `PROPOSAL_CREATED` - New proposal created
- `PROPOSAL_ACTIVATED` - Proposal activated for voting
- `PROPOSAL_CANCELLED` - Proposal cancelled
- `PROPOSAL_VETOED` - Proposal vetoed
- `PROPOSAL_PASSED` - Proposal passed
- `PROPOSAL_REJECTED` - Proposal rejected
- `PROPOSAL_EXECUTED` - Proposal executed
- `VOTE_CAST` - Vote cast
- `VOTE_DELEGATED` - Vote delegated
- `VOTING_WEIGHTS_UPDATED` - Voting weights updated
- `ERROR` - Error occurred

## 🔍 Health Monitoring

```typescript
// Perform health check
const healthCheck = await governanceService.healthCheck();

console.log('Service Health:', {
  isHealthy: healthCheck.isHealthy,
  contractConnected: healthCheck.contractConnected,
  networkConnected: healthCheck.networkConnected,
  walletConnected: healthCheck.walletConnected,
  errors: healthCheck.errors
});

// Get performance metrics
const metrics = governanceService.getPerformanceMetrics();
console.log('Performance:', metrics);
```

## 🛠 Utility Functions

The service includes many utility functions for validation and data manipulation:

```typescript
import {
  isValidStellarAddress,
  validateProposal,
  calculateVotingResults,
  formatTimeDuration,
  isProposalActive
} from '@/shared/services/governance_system';

// Validate address
const isValid = isValidStellarAddress('GABC123...');

// Validate proposal
const validation = validateProposal(proposalData);

// Calculate voting results
const results = calculateVotingResults(votes, totalPower, quorum, threshold);

// Format time duration
const formatted = formatTimeDuration(604800); // "7d 0h 0m 0s"

// Check if proposal is active
const active = isProposalActive(proposal, currentTime);
```

## 📊 Error Handling

The service provides comprehensive error handling with standardized error codes:

```typescript
const result = await governanceService.createProposal(proposalData);

if (!result.success) {
  console.error('Error:', result.error);
  console.error('Error Code:', result.errorCode);
  
  // Handle specific error types
  switch (result.errorCode) {
    case GOVERNANCE_ERROR_CODES.PROPOSAL_NOT_FOUND:
      // Handle proposal not found
      break;
    case GOVERNANCE_ERROR_CODES.INSUFFICIENT_STAKE:
      // Handle insufficient stake
      break;
    // ... other error cases
  }
}
```

## 🔒 Security Features

- Input validation and sanitization
- Address format validation
- Proposal validation
- Vote validation
- Delegation validation
- Type safety throughout

## 📈 Performance Features

- Intelligent caching system
- Retry mechanism with exponential backoff
- Performance metrics tracking
- Batch operation support
- Event-driven architecture

## 🧪 Testing

The service is designed to be easily testable with comprehensive mocking support:

```typescript
// Mock the service for testing
const mockGovernanceService = {
  createProposal: jest.fn().mockResolvedValue({
    success: true,
    data: 1
  }),
  vote: jest.fn().mockResolvedValue({
    success: true,
    data: { hash: 'mock-hash' }
  })
};
```

## 📝 TypeScript Support

Full TypeScript support with comprehensive type definitions:

- Strict type checking
- IntelliSense support
- Interface definitions for all data structures
- Enum definitions for constants
- Generic type support

## 🤝 Contributing

When contributing to this service:

1. Follow the existing code patterns
2. Add comprehensive type definitions
3. Include error handling
4. Add validation where appropriate
5. Update documentation
6. Add tests for new functionality

## 📄 License

This service is part of the StarShop ecosystem and follows the same licensing terms.
