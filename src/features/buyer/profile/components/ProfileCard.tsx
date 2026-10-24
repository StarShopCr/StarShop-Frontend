'use client';

import React, { useState, useCallback } from 'react';
import {
  Mail,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
} from 'lucide-react';
import copy from 'copy-to-clipboard';
import { useUserStore } from '@/shared/stores/userStore';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/utils';

export interface ProfileCardProps {
  isLoading?: boolean;
  className?: string;
}

export function ProfileCard({ isLoading, className }: ProfileCardProps = {}) {
  const walletAddress = useUserStore(state => state.walletAddress);
  const name = useUserStore(state => state.name);
  const email = useUserStore(state => state.email);
  const role = useUserStore(state => state.role);
  const avatar = useUserStore(state => state.avatar);
  const isVerified = useUserStore(state => state.isVerified);
  const joinedDate = useUserStore(state => state.joinedDate);
  const storeLoading = useUserStore(state => state.isLoading);

  const effectiveLoading =
    isLoading !== undefined ? isLoading : Boolean(storeLoading);

  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatAddress = useCallback((addr: string) => {
    if (!addr) return 'No wallet connected';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const handleCopyWallet = useCallback(() => {
    if (!walletAddress) return;
    try {
      const success = copy(walletAddress, {
        format: 'text/plain',
        onCopy: () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
      });
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy wallet address:', err);
    }
  }, [walletAddress]);

  const getInitials = useCallback((rawName: string) => {
    if (!rawName) return '';
    return rawName
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, []);

  if (effectiveLoading) {
    return (
      <div
        data-testid="profile-card-loading"
        className={cn(
          'bg-custom-card-background rounded-lg p-6 border border-white/30 shadow-[0_0_10px_0_rgba(255,255,255,0.1)] flex flex-col items-center w-full',
          className
        )}
      >
        <Skeleton className="w-24 h-24 rounded-full mb-4 bg-white/10 border-4 border-white/20" />
        <Skeleton className="h-6 w-36 mb-2 bg-white/10" />
        <Skeleton className="h-4 w-28 mb-3 bg-white/10" />
        <Skeleton className="h-5 w-24 mb-4 rounded-full bg-white/10" />
        <Skeleton className="h-8 w-44 mb-3 rounded-lg bg-white/10" />
        <Skeleton className="h-4 w-40 mb-4 bg-white/10" />
        <Skeleton className="h-3 w-28 bg-white/10" />
      </div>
    );
  }

  const displayName = name || 'Anonymous Buyer';
  const displayRole = role === 'seller' ? 'Seller Account' : 'Premium Member';
  const initials = getInitials(name);
  const verified = Boolean(isVerified);
  const activeDate = joinedDate ? `Active ${joinedDate}` : 'Active Member';

  return (
    <div
      data-testid="profile-card"
      className={cn(
        'bg-custom-card-background rounded-lg p-6 border border-white/30 shadow-[0_0_10px_0_rgba(255,255,255,0.1)] flex flex-col items-center w-full transition-all duration-200',
        className
      )}
    >
      {/* User Avatar */}
      <div className="relative mb-4">
        {avatar && !imageError ? (
          <img
            src={avatar}
            alt={displayName}
            data-testid="profile-avatar-img"
            onError={() => setImageError(true)}
            className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-md"
          />
        ) : (
          <div
            data-testid="profile-avatar-fallback"
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 border-4 border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-md select-none"
          >
            {initials ? (
              initials
            ) : (
              <UserIcon className="w-10 h-10 text-white/80" />
            )}
          </div>
        )}

        {/* Verification Icon Badge on Avatar */}
        <div
          data-testid="profile-verification-icon"
          title={verified ? 'Verified Account' : 'Unverified Account'}
          className={cn(
            'absolute bottom-0 right-0 p-1 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-sm',
            verified
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-500 text-slate-950'
          )}
        >
          {verified ? (
            <ShieldCheck className="w-4 h-4" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* User Name */}
      <div
        data-testid="profile-name"
        className="text-white text-xl font-semibold mb-1 text-center truncate max-w-full"
      >
        {displayName}
      </div>

      {/* Membership & Role */}
      <div
        data-testid="profile-role"
        className="text-purple-400 text-sm font-medium mb-3 text-center"
      >
        {displayRole}
      </div>

      {/* Verification Status Pill */}
      <div className="mb-4">
        <span
          data-testid="profile-verified-badge"
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border transition-colors',
            verified
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          )}
        >
          {verified ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              Unverified
            </>
          )}
        </span>
      </div>

      {/* Wallet Address Bar with Copy */}
      <div
        data-testid="profile-wallet"
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10 mb-3"
      >
        <span
          className="text-xs font-mono text-gray-300 truncate"
          title={walletAddress || 'No wallet connected'}
        >
          {formatAddress(walletAddress)}
        </span>
        {walletAddress ? (
          <button
            type="button"
            onClick={handleCopyWallet}
            data-testid="copy-wallet-btn"
            title={copied ? 'Copied!' : 'Copy wallet address'}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        ) : null}
      </div>

      {/* Email Contact Button / Text */}
      {email ? (
        <a
          href={`mailto:${email}`}
          data-testid="profile-email"
          title={`Send email to ${email}`}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10 transition-colors mb-2"
        >
          <Mail className="w-4 h-4 text-purple-300 shrink-0" />
          <span className="truncate">{email}</span>
        </a>
      ) : (
        <div
          data-testid="profile-email-empty"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-dashed border-white/10 text-gray-500 text-xs mb-2"
        >
          <Mail className="w-4 h-4 shrink-0 text-gray-600" />
          <span>No email registered</span>
        </div>
      )}

      {/* Active Membership Date */}
      <div
        data-testid="profile-joined-date"
        className="mt-2 text-gray-400 text-xs text-center"
      >
        {activeDate}
      </div>
    </div>
  );
}
