"use client";

import  useNetworkStatus from "@/hooks/useNetworkStatus";

const OfflineNotice = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 text-sm z-50">
      ⚠️ You’re currently offline.
    </div>
  );
};

export default OfflineNotice;
