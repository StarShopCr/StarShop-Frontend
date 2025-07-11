import { LucideProps } from 'lucide-react';
import React from 'react';

interface ContentContainerProps {
  iconLarge: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function FAQContentContainer({
  iconLarge: IconLarge,
  title,
  description,
  children,
}: ContentContainerProps) {
  return (
    <div
      className="bg-transparent rounded-xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
      style={{ border: '1px solid #333', padding: '1rem' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="text-purple-500  ">
          <IconLarge className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">{title} Questions</h2>
      </div>
      <p className="text-gray-400 text-sm mb-6">{description}</p>

      <div className="space-y-4">{children}</div>
    </div>
  );
}
