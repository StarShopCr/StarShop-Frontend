import type { u32 } from '@stellar/stellar-sdk';
import type { DropId, DropLifecycleStatus, UserAccessLevel, UserAddress } from './drop.types';

export interface AccessCheckResult {
  dropId: DropId;
  user: UserAddress;
  hasAccess: boolean;
  reason?: string;
  userLevel?: UserAccessLevel;
  dropStatus: DropLifecycleStatus;
  isWithinDropWindow: boolean;
  hasAvailableSupply: boolean;
}

export interface AccessGrantRequest {
  dropId: DropId;
  user: UserAddress;
  admin?: UserAddress;
  level?: UserAccessLevel;
}

export interface AccessRevokeRequest {
  dropId: DropId;
  user: UserAddress;
  admin?: UserAddress;
}

export interface AccessList {
  dropId: DropId;
  users: UserAddress[];
  total: u32;
  source: 'contract_buyers' | 'local_cache';
}

export interface UserLevelUpdateRequest {
  user: UserAddress;
  admin?: UserAddress;
  level: UserAccessLevel;
}
