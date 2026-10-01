import React from 'react';
import { useUser } from '@/shared/stores/userStore';

const ProfileCard: React.FC = () => {
  const { name, email } = useUser();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
        {name ? name.charAt(0).toUpperCase() : 'U'}
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-800">{name || 'User Name'}</p>
        <p className="text-sm text-gray-500">{email || 'user@example.com'}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
