// @ts-ignore
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:3000',
});

// Polyfill globals for React and Testing Library
if (!('window' in global)) {
  Object.defineProperty(global, 'window', {
    value: dom.window,
    writable: true,
    configurable: true,
  });
}
if (!('document' in global)) {
  Object.defineProperty(global, 'document', {
    value: dom.window.document,
    writable: true,
    configurable: true,
  });
}
if (!('HTMLElement' in global)) {
  Object.defineProperty(global, 'HTMLElement', {
    value: dom.window.HTMLElement,
    writable: true,
    configurable: true,
  });
}
if (!('Node' in global)) {
  Object.defineProperty(global, 'Node', {
    value: dom.window.Node,
    writable: true,
    configurable: true,
  });
}

import React from 'react';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ProfileCard } from './ProfileCard';
import { useUserStore } from '@/shared/stores/userStore';

describe('ProfileCard Component — UserStore Integration', () => {
  beforeEach(() => {
    cleanup();
    useUserStore.getState().clearUser();
  });

  it('renders loading skeleton when isLoading prop is true', () => {
    render(<ProfileCard isLoading={true} />);

    const loadingCard = screen.getByTestId('profile-card-loading');
    assert.ok(loadingCard, 'Loading skeleton container should be rendered');
    assert.equal(
      screen.queryByTestId('profile-card'),
      null,
      'Main card should not be displayed when loading'
    );
  });

  it('renders loading skeleton when userStore.isLoading is true', () => {
    useUserStore.getState().setIsLoading(true);
    render(<ProfileCard />);

    const loadingCard = screen.getByTestId('profile-card-loading');
    assert.ok(
      loadingCard,
      'Loading skeleton container should be rendered from userStore.isLoading'
    );
  });

  it('renders dynamic user data correctly when populated in userStore', () => {
    useUserStore.getState().setUser({
      name: 'Matias Aguilar',
      email: 'matias@starshop.io',
      walletAddress: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVABS',
      role: 'buyer',
      isVerified: true,
      avatar: 'https://images.example.com/matias-avatar.png',
      joinedDate: 'March, 2024',
    });

    render(<ProfileCard />);

    // Name
    const nameEl = screen.getByTestId('profile-name');
    assert.equal(nameEl.textContent, 'Matias Aguilar');

    // Role
    const roleEl = screen.getByTestId('profile-role');
    assert.equal(roleEl.textContent, 'Premium Member');

    // Email
    const emailEl = screen.getByTestId('profile-email');
    assert.ok(emailEl.textContent?.includes('matias@starshop.io'));
    assert.equal(emailEl.getAttribute('href'), 'mailto:matias@starshop.io');

    // Formatted Wallet Address
    const walletEl = screen.getByTestId('profile-wallet');
    assert.ok(walletEl.textContent?.includes('GA7QYN...VABS'));

    // Verification Status
    const verifiedBadge = screen.getByTestId('profile-verified-badge');
    assert.ok(verifiedBadge.textContent?.includes('Verified'));

    // Verification Icon on Avatar
    const verIcon = screen.getByTestId('profile-verification-icon');
    assert.equal(verIcon.getAttribute('title'), 'Verified Account');

    // Avatar Image
    const avatarImg = screen.getByTestId(
      'profile-avatar-img'
    ) as HTMLImageElement;
    assert.equal(
      avatarImg.getAttribute('src'),
      'https://images.example.com/matias-avatar.png'
    );
    assert.equal(avatarImg.getAttribute('alt'), 'Matias Aguilar');

    // Joined Date
    const joinedEl = screen.getByTestId('profile-joined-date');
    assert.equal(joinedEl.textContent, 'Active March, 2024');
  });

  it('renders seller account role when user role is seller', () => {
    useUserStore.getState().setUser({
      name: 'Elena Rostova',
      role: 'seller',
    });

    render(<ProfileCard />);

    const roleEl = screen.getByTestId('profile-role');
    assert.equal(roleEl.textContent, 'Seller Account');
  });

  it('renders fallbacks gracefully when user data is empty', () => {
    useUserStore.getState().clearUser();

    render(<ProfileCard />);

    // Fallback Name
    const nameEl = screen.getByTestId('profile-name');
    assert.equal(nameEl.textContent, 'Anonymous Buyer');

    // Fallback Role
    const roleEl = screen.getByTestId('profile-role');
    assert.equal(roleEl.textContent, 'Premium Member');

    // Fallback Verification
    const verifiedBadge = screen.getByTestId('profile-verified-badge');
    assert.ok(verifiedBadge.textContent?.includes('Unverified'));

    // Fallback Wallet
    const walletEl = screen.getByTestId('profile-wallet');
    assert.ok(walletEl.textContent?.includes('No wallet connected'));

    // Fallback Email
    const emailFallback = screen.getByTestId('profile-email-empty');
    assert.ok(emailFallback.textContent?.includes('No email registered'));

    // Fallback Avatar Icon
    const avatarFallback = screen.getByTestId('profile-avatar-fallback');
    assert.ok(avatarFallback, 'Avatar fallback container should exist');

    // Fallback Joined Date
    const joinedEl = screen.getByTestId('profile-joined-date');
    assert.equal(joinedEl.textContent, 'Active Member');
  });

  it('renders user initials when avatar image is empty but name is provided', () => {
    useUserStore.getState().setUser({
      name: 'Carlos Mendez',
      avatar: '',
    });

    render(<ProfileCard />);

    const avatarFallback = screen.getByTestId('profile-avatar-fallback');
    assert.equal(avatarFallback.textContent?.trim(), 'CM');
  });

  it('handles wallet copy interaction on click', () => {
    useUserStore.getState().setUser({
      walletAddress: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVABS',
    });

    render(<ProfileCard />);

    const copyBtn = screen.getByTestId('copy-wallet-btn');
    assert.ok(copyBtn, 'Copy wallet button should be rendered');

    // Click copy button
    fireEvent.click(copyBtn);
  });
});
