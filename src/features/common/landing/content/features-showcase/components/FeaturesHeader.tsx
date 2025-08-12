interface FeaturesHeaderProps {
  badge: {
    icon: string;
    text: string;
  };
  title: {
    main: string;
    highlight: string;
  };
  description: string;
}

export function FeaturesHeader({
  badge,
  title,
  description,
}: FeaturesHeaderProps) {
  return (
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 mb-8">
        <span className="text-yellow-400">{badge.icon}</span>
        <span className="text-white text-sm font-medium">{badge.text}</span>
      </div>

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        {title.main}{' '}
        <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          {title.highlight}
        </span>
      </h2>

      <p className="text-slate-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
