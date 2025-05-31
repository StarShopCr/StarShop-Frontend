import { useState, useEffect } from 'react';

const useNetworkStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Handle SSR case where navigator might not be available
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Default to online for SSR
  });

  useEffect(() => {
    // Event handler for when browser goes online
    const handleOnline = (): void => {
      setIsOnline(true);
    };

    // Event handler for when browser goes offline
    const handleOffline = (): void => {
      setIsOnline(false);
    };

    // Add event listeners to window
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
