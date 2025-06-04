"use client";

import dynamic from 'next/dynamic';

const LanguageSwitcher = dynamic(
  () => import('@/components/LanguageSwitcher').then((mod) => mod.LanguageSwitcher),
  { ssr: false }
);

export function LanguageSwitcherWrapper() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <LanguageSwitcher />
    </div>
  );
} 