'use client';

import { Mail } from 'lucide-react';
import { useUser } from '@/shared/stores/userStore';

export function ProfileCard() {
  const { name, email } = useUser();

  return (
    <div className="bg-custom-card-background rounded-lg p-6 border border-white/30 shadow-[0_0_10px_0_rgba(255,255,255,0.1)] flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gray-700 mb-4 border-4 border-white/20" />
      <div className="text-white text-xl font-semibold mb-1">
        {name || 'User Name'}
      </div>
      <div className="text-gray-400 text-sm mb-1">
        {email || 'user@example.com'}
      </div>
      <div className="text-purple-400 text-sm mb-4">Premium Member</div>
      <button
        type="button"
        aria-label="Contact user"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white hover:bg-gray-800"
      >
        <Mail className="w-5 h-5" />
      </button>
      <div className="mt-4 text-gray-400 text-xs">Active March, 2024</div>
    </div>
  );
}
