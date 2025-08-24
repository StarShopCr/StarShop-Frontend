export interface CtaButton {
  text: string;
  variant: 'primary' | 'secondary';
  className: string;
}

export interface ExperienceCtaContent {
  title: string;
  description: string;
  buttons: CtaButton[];
}

export const EXPERIENCE_CTA_CONTENT: ExperienceCtaContent = {
  title: 'Ready to Experience the Future?',
  description:
    'Join thousands of businesses and customers who trust StarShop for their blockchain commerce needs.',
  buttons: [
    {
      text: 'Start Selling',
      variant: 'primary',
      className:
        'px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors duration-300',
    },
    {
      text: 'Explore Products',
      variant: 'secondary',
      className:
        'px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-colors duration-300',
    },
  ],
};
