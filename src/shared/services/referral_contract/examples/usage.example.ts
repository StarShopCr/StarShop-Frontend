import { ReferralService, UserLevel, ReferralEventType } from '../index';

/**
 * Example usage of the ReferralService
 */
export class ReferralServiceExample {
  private service: ReferralService;

  constructor() {
    this.service = new ReferralService({
      network: {
        networkPassphrase: 'Test SDF Network ; September 2015',
        contractId: 'CCHXSA6WFERL3VE4K4TEHFYOYIEFIP5CXWY6OGMKUHXBQG3HTRCMZRO6',
        rpcUrl: 'https://soroban-testnet.stellar.org',
        isTestnet: true
      },
      timeoutInSeconds: 30,
      fee: 100000,
      simulate: true,
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000
      }
    });
  }

  /**
   * Initialize the service and contract
   */
  async initializeService(): Promise<void> {
    try {
      // Initialize the service
      await this.service.initialize();
      console.log('✅ Service initialized successfully');

      // Initialize the contract (if not already initialized)
      const initResult = await this.service.initializeReferralContract(
        'GABC1234567890123456789012345678901234567890123456789012345678901234', // Admin address
        'GDEF4567890123456789012345678901234567890123456789012345678901234567'  // Reward token address
      );

      if (initResult.success) {
        console.log('✅ Contract initialized successfully');
      } else {
        console.log('ℹ️ Contract already initialized or error:', initResult.error);
      }
    } catch (error) {
      console.error('❌ Failed to initialize service:', error);
      throw error;
    }
  }

  /**
   * Example: Complete user registration and verification flow
   */
  async userRegistrationFlow(): Promise<void> {
    console.log('\n=== User Registration Flow ===');

    const userAddress = 'GUSER1234567890123456789012345678901234567890123456789012345678901234';
    const referrerAddress = 'GREFER4567890123456789012345678901234567890123456789012345678901234567';
    const identityProof = 'identity_proof_hash_12345';

    try {
      // 1. Register user with referrer
      console.log('1. Registering user...');
      const registerResult = await this.service.registerWithReferral({
        user: userAddress,
        referrerAddress: referrerAddress,
        identityProof: identityProof
      });

      if (registerResult.success) {
        console.log('✅ User registered successfully');
      } else {
        console.log('❌ Registration failed:', registerResult.error);
        return;
      }

      // 2. Submit verification request
      console.log('2. Submitting verification request...');
      const verifyResult = await this.service.submitVerification(userAddress, identityProof);
      
      if (verifyResult.success) {
        console.log('✅ Verification request submitted');
      } else {
        console.log('❌ Verification submission failed:', verifyResult.error);
        return;
      }

      // 3. Check verification status
      console.log('3. Checking verification status...');
      const statusResult = await this.service.getVerificationStatus(userAddress);
      
      if (statusResult.success) {
        console.log('📋 Verification status:', statusResult.data);
      }

      // 4. Approve verification (admin only)
      console.log('4. Approving verification...');
      const approveResult = await this.service.approveVerification(userAddress);
      
      if (approveResult.success) {
        console.log('✅ Verification approved');
      } else {
        console.log('❌ Verification approval failed:', approveResult.error);
      }

      // 5. Get user information
      console.log('5. Getting user information...');
      const userInfoResult = await this.service.getUserInfo(userAddress);
      
      if (userInfoResult.success) {
        console.log('👤 User info:', {
          address: userInfoResult.data.address,
          level: userInfoResult.data.level,
          teamSize: userInfoResult.data.team_size,
          totalRewards: userInfoResult.data.total_rewards,
          verificationStatus: userInfoResult.data.verification_status
        });
      }

    } catch (error) {
      console.error('❌ User registration flow failed:', error);
    }
  }

  /**
   * Example: Referral management and analytics
   */
  async referralManagementFlow(): Promise<void> {
    console.log('\n=== Referral Management Flow ===');

    const userAddress = 'GUSER1234567890123456789012345678901234567890123456789012345678901234';

    try {
      // 1. Get direct referrals
      console.log('1. Getting direct referrals...');
      const referralsResult = await this.service.getDirectReferrals(userAddress);
      
      if (referralsResult.success) {
        console.log('🔗 Direct referrals:', referralsResult.data);
      }

      // 2. Get team size
      console.log('2. Getting team size...');
      const teamSizeResult = await this.service.getTeamSize(userAddress);
      
      if (teamSizeResult.success) {
        console.log('👥 Team size:', teamSizeResult.data);
      }

      // 3. Get user level
      console.log('3. Getting user level...');
      const levelResult = await this.service.getUserLevel(userAddress);
      
      if (levelResult.success) {
        console.log('🏆 User level:', levelResult.data);
      }

      // 4. Get conversion rate
      console.log('4. Getting conversion rate...');
      const conversionResult = await this.service.getReferralConversionRate(userAddress);
      
      if (conversionResult.success) {
        console.log('📊 Conversion rate:', conversionResult.data + '%');
      }

    } catch (error) {
      console.error('❌ Referral management flow failed:', error);
    }
  }

  /**
   * Example: Reward management
   */
  async rewardManagementFlow(): Promise<void> {
    console.log('\n=== Reward Management Flow ===');

    const userAddress = 'GUSER1234567890123456789012345678901234567890123456789012345678901234';
    const rewardAmount = BigInt('1000000000'); // 1000 tokens

    try {
      // 1. Get pending rewards
      console.log('1. Getting pending rewards...');
      const pendingResult = await this.service.getPendingRewards(userAddress);
      
      if (pendingResult.success) {
        console.log('💰 Pending rewards:', pendingResult.data);
      }

      // 2. Get total rewards
      console.log('2. Getting total rewards...');
      const totalResult = await this.service.getTotalRewards(userAddress);
      
      if (totalResult.success) {
        console.log('💎 Total rewards:', totalResult.data);
      }

      // 3. Distribute rewards
      console.log('3. Distributing rewards...');
      const distributeResult = await this.service.distributeRewards(userAddress, rewardAmount);
      
      if (distributeResult.success) {
        console.log('✅ Rewards distributed successfully');
      } else {
        console.log('❌ Reward distribution failed:', distributeResult.error);
      }

      // 4. Claim rewards
      console.log('4. Claiming rewards...');
      const claimResult = await this.service.claimRewards(userAddress);
      
      if (claimResult.success) {
        console.log('🎉 Rewards claimed:', claimResult.data);
      } else {
        console.log('❌ Reward claim failed:', claimResult.error);
      }

    } catch (error) {
      console.error('❌ Reward management flow failed:', error);
    }
  }

  /**
   * Example: Milestone management
   */
  async milestoneManagementFlow(): Promise<void> {
    console.log('\n=== Milestone Management Flow ===');

    const userAddress = 'GUSER1234567890123456789012345678901234567890123456789012345678901234';

    try {
      // 1. Add a new milestone
      console.log('1. Adding new milestone...');
      const milestone = {
        description: 'Refer 10 users to unlock this achievement',
        required_level: UserLevel.Basic,
        requirement: { tag: 'DirectReferrals', values: [10] } as const,
        reward_amount: BigInt('5000000000') // 5000 tokens
      };

      const addResult = await this.service.addMilestone(milestone);
      
      if (addResult.success) {
        console.log('✅ Milestone added successfully');
      } else {
        console.log('❌ Milestone addition failed:', addResult.error);
      }

      // 2. Check and reward milestones
      console.log('2. Checking and rewarding milestones...');
      const checkResult = await this.service.checkAndRewardMilestone(userAddress);
      
      if (checkResult.success) {
        console.log('✅ Milestone check completed');
      } else {
        console.log('❌ Milestone check failed:', checkResult.error);
      }

    } catch (error) {
      console.error('❌ Milestone management flow failed:', error);
    }
  }

  /**
   * Example: System analytics
   */
  async systemAnalyticsFlow(): Promise<void> {
    console.log('\n=== System Analytics Flow ===');

    try {
      // 1. Get total users
      console.log('1. Getting total users...');
      const totalUsersResult = await this.service.getTotalUsers();
      
      if (totalUsersResult.success) {
        console.log('👥 Total users:', totalUsersResult.data);
      }

      // 2. Get total distributed rewards
      console.log('2. Getting total distributed rewards...');
      const totalRewardsResult = await this.service.getTotalDistributedRewards();
      
      if (totalRewardsResult.success) {
        console.log('💎 Total distributed rewards:', totalRewardsResult.data);
      }

      // 3. Get system metrics
      console.log('3. Getting system metrics...');
      const metricsResult = await this.service.getSystemMetrics();
      
      if (metricsResult.success) {
        console.log('📊 System metrics:', {
          totalUsers: metricsResult.data.totalUsers,
          totalDistributedRewards: metricsResult.data.totalDistributedRewards,
          averageRewardPerUser: metricsResult.data.averageRewardPerUser,
          conversionRate: metricsResult.data.conversionRate
        });
      }

    } catch (error) {
      console.error('❌ System analytics flow failed:', error);
    }
  }

  /**
   * Example: Event handling
   */
  setupEventHandlers(): void {
    console.log('\n=== Setting up Event Handlers ===');

    // Add event listener for user registration
    const registrationSubscription = this.service.addEventListener(
      [ReferralEventType.USER_REGISTERED],
      (event) => {
        console.log('🎉 New user registered:', event.user);
      }
    );

    // Add event listener for reward distribution
    const rewardSubscription = this.service.addEventListener(
      [ReferralEventType.REWARD_DISTRIBUTED],
      (event) => {
        console.log('💰 Rewards distributed:', {
          user: event.user,
          amount: event.rewardAmount
        });
      }
    );

    // Add event listener for milestone achievements
    const milestoneSubscription = this.service.addEventListener(
      [ReferralEventType.MILESTONE_ACHIEVED],
      (event) => {
        console.log('🏆 Milestone achieved:', {
          user: event.user,
          milestone: event.milestone
        });
      }
    );

    // Add event listener for errors
    const errorSubscription = this.service.addEventListener(
      [ReferralEventType.ERROR],
      (event) => {
        console.error('❌ Service error:', {
          operation: event.operation,
          error: event.error
        });
      }
    );

    console.log('✅ Event handlers set up successfully');
    console.log('📋 Subscription IDs:', {
      registration: registrationSubscription,
      reward: rewardSubscription,
      milestone: milestoneSubscription,
      error: errorSubscription
    });
  }

  /**
   * Example: Performance monitoring
   */
  async performanceMonitoring(): Promise<void> {
    console.log('\n=== Performance Monitoring ===');

    try {
      // Get performance metrics
      const metrics = this.service.getPerformanceMetrics();
      console.log('📈 Performance metrics:', {
        averageResponseTime: metrics.averageResponseTime + 'ms',
        totalOperations: metrics.totalOperations,
        successfulOperations: metrics.successfulOperations,
        failedOperations: metrics.failedOperations,
        successRate: ((metrics.successfulOperations / metrics.totalOperations) * 100).toFixed(2) + '%',
        cacheHitRate: (metrics.cacheHitRate * 100).toFixed(2) + '%'
      });

      // Health check
      const health = await this.service.healthCheck();
      console.log('🏥 Health check:', {
        isHealthy: health.isHealthy,
        contractConnected: health.contractConnected,
        networkConnected: health.networkConnected,
        walletConnected: health.walletConnected,
        errors: health.errors
      });

    } catch (error) {
      console.error('❌ Performance monitoring failed:', error);
    }
  }

  /**
   * Example: Error handling patterns
   */
  async errorHandlingExample(): Promise<void> {
    console.log('\n=== Error Handling Example ===');

    try {
      // Example of handling a failed operation
      const result = await this.service.getUserInfo('INVALID_ADDRESS');
      
      if (!result.success) {
        console.log('❌ Operation failed:', {
          error: result.error,
          errorCode: result.errorCode
        });
        
        // Handle specific error types
        switch (result.errorCode) {
          case 'VALIDATION_ERROR':
            console.log('🔧 Validation error - check input format');
            break;
          case 'USER_ERROR':
            console.log('👤 User error - user not found or invalid');
            break;
          case 'NETWORK_ERROR':
            console.log('🌐 Network error - check connection');
            break;
          default:
            console.log('❓ Unknown error - check logs');
        }
      }

    } catch (error) {
      console.error('💥 Unexpected error:', error);
    }
  }

  /**
   * Example: Cleanup and resource management
   */
  async cleanup(): Promise<void> {
    console.log('\n=== Cleanup ===');

    try {
      // Clear cache
      this.service.clearCache();
      console.log('🗑️ Cache cleared');

      // Reset performance metrics
      this.service.resetPerformanceMetrics();
      console.log('📊 Performance metrics reset');

      // Destroy service (cleanup resources)
      this.service.destroy();
      console.log('🧹 Service destroyed');

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Run all examples
   */
  async runAllExamples(): Promise<void> {
    try {
      console.log('🚀 Starting ReferralService Examples\n');

      // Initialize service
      await this.initializeService();

      // Setup event handlers
      this.setupEventHandlers();

      // Run example flows
      await this.userRegistrationFlow();
      await this.referralManagementFlow();
      await this.rewardManagementFlow();
      await this.milestoneManagementFlow();
      await this.systemAnalyticsFlow();
      await this.performanceMonitoring();
      await this.errorHandlingExample();

      // Cleanup
      await this.cleanup();

      console.log('\n✅ All examples completed successfully!');

    } catch (error) {
      console.error('❌ Examples failed:', error);
    }
  }
}

// Export for use in other files
export default ReferralServiceExample;

// Example usage if running this file directly
if (require.main === module) {
  const example = new ReferralServiceExample();
  example.runAllExamples().catch(console.error);
}
