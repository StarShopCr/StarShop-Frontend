export interface AccessControl {
  userAddress: string;
  hasAccess: boolean;
  grantedAt?: number;
  accessLevel: 'WHITELIST' | 'VIP' | 'PUBLIC';
}

export interface AccessRequest {
  dropId: string;
  userAddress: string;
}

export interface AccessResponse {
  success: boolean;
  message: string;
  txHash?: string;
}
