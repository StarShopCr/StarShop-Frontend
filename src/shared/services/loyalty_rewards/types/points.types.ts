export interface UserPoints {
  address: string;
  currentBalance: number;
  lifetimePoints: number;
  lastUpdated: number;
}

export interface PointsTransaction {
  txHash: string;
  amount: number;
  type: 'EARNED' | 'REDEEMED' | 'ADJUSTED';
  timestamp: number;
  description?: string;
}
