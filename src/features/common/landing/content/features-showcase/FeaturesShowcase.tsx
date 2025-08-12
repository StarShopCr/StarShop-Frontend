import { FEATURES, FEATURES_HEADER } from './constants/features';
import { FeaturesHeader } from './components/FeaturesHeader';
import { FeaturesGrid } from './components/FeaturesGrid';

export function FeaturesShowcase() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-6 py-8">
        <FeaturesHeader
          badge={FEATURES_HEADER.badge}
          title={FEATURES_HEADER.title}
          description={FEATURES_HEADER.description}
        />
        <FeaturesGrid features={FEATURES} />
      </div>
    </section>
  );
}
