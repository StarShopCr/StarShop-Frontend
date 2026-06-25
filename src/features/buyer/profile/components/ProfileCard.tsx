import { useUser } from '@/shared/stores/userStore';

export function ProfileCard() {
  const { name, email } = useUser();

  return (
    <div className="bg-custom-card-background rounded-lg p-6 border border-white/30 shadow-[0_0_10px_0_rgba(255,255,255,0.1)] flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gray-700 mb-4 border-4 border-white/20" />
      <div className="text-white text-xl font-semibold mb-1">
        {name || 'User Name'}
      </div>
      <div className="text-gray-400 text-sm mb-2">
        {email || 'user@example.com'}
      </div>
      <div className="text-purple-400 text-sm mb-4">Premium Member</div>
      <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white hover:bg-gray-800">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 10.34V6.5A2.5 2.5 0 0018.5 4h-13A2.5 2.5 0 003 6.5v11A2.5 2.5 0 005.5 20h13a2.5 2.5 0 002.5-2.5v-3.84l-4.76 2.38a2.5 2.5 0 01-2.24 0l-4.76-2.38"
          />
        </svg>
      </button>
      <div className="mt-4 text-gray-400 text-xs">Active March, 2024</div>
    </div>
  );
}
