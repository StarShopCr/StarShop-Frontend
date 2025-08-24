interface ExperienceCtaHeaderProps {
  title: string;
  description: string;
}

export function ExperienceCtaHeader({
  title,
  description,
}: ExperienceCtaHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h3 className="text-3xl font-bold mb-6">{title}</h3>
      <p className="text-xl opacity-90">{description}</p>
    </div>
  );
}
