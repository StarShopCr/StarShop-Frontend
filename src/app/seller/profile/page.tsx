'use client';

import ProfileHeader from '@/features/seller/profile/components/profile-header';
import MetricsCard from '@/features/seller/profile/components/metrics-card';
import StoreCategories from '@/features/seller/profile/components/store-categories';
import Achievements from '@/features/seller/profile/components/achievements';

export default function SellerProfilePage() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto lg:space-y-11 space-y-6">
        {/* Store Profile Header */}
        <ProfileHeader />
        {/* Metrics Cards */}
        <MetricsCard />
        {/* Store Categories */}
        <StoreCategories />
        {/* Achievements */}
        <Achievements />
      </div>
    </div>
  );
}
