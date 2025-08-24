import { CtaButton } from '../constants/experience-cta';

interface ExperienceCtaButtonsProps {
  buttons: CtaButton[];
}

export function ExperienceCtaButtons({ buttons }: ExperienceCtaButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {buttons.map((button, index) => (
        <button key={index} className={button.className}>
          {button.text}
        </button>
      ))}
    </div>
  );
}
