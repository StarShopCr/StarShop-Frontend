'use client';
import Hero from '@/features/common/landing/content/hero';
import { FeaturesShowcase } from '@/features/common/landing/content/features-showcase/FeaturesShowcase';
import ExperienceCta from '@/features/common/landing/content/experience-cta';

export default function LandingPage() {
  return (
    <main className="flex flex-col justify-center items-center mt-[7rem]">
      <Hero />
      <FeaturesShowcase />
      <ExperienceCta />
    </main>
  );
}
