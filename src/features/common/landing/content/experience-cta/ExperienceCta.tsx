import { EXPERIENCE_CTA_CONTENT } from './constants/experience-cta';
import { ExperienceCtaHeader } from './components/ExperienceCtaHeader';
import { ExperienceCtaButtons } from './components/ExperienceCtaButtons';

export function ExperienceCta() {
  return (
    <div className="mt-20 text-center">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
        <ExperienceCtaHeader
          title={EXPERIENCE_CTA_CONTENT.title}
          description={EXPERIENCE_CTA_CONTENT.description}
        />
        <ExperienceCtaButtons buttons={EXPERIENCE_CTA_CONTENT.buttons} />
      </div>
    </div>
  );
}
