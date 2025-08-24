import { Feature } from '../constants/features';

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const IconComponent = feature.icon;

  return (
    <div className="bg-[#252433] border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/70 transition-colors duration-300">
      <div
        className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6`}
      >
        <IconComponent className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-4">{feature.title}</h3>

      <p className="text-slate-400 text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}
