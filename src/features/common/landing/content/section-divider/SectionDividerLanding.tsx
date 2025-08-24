import React from 'react';
import SectionDivider from './components/SectionDivider';

export default function SectionDividerLanding() {
  return (
    <section className="w-full">
      <SectionDivider
        variant="wave"
        direction="down"
        color="gradient"
        height="md"
      />
    </section>
  );
}
