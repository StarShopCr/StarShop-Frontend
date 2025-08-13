'use client';
import Hero from '@/features/common/landing/content/hero';
import { FeaturesShowcase } from '@/features/common/landing/content/features-showcase/FeaturesShowcase';
import NetworkPerformance from '@/features/common/landing/components/network-performance/network-performance';

export default function LandingPage() {
  return (
    <main className="flex flex-col justify-center items-center mt-[7rem]">
      <Hero />
      <FeaturesShowcase />
      <NetworkPerformance />
    </main>
  );
}
