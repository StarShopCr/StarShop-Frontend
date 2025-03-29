import { Suspense } from "react";
import RecentActivity from "@/components/features/user/invoice/RecentActivites";
import { fetchRecentActivities } from "@/lib/activity";

export default async function InvoicePage() {
  const recentActivities = await fetchRecentActivities();

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="lg:col-span-1">
        <Suspense
          fallback={
            <div className="bg-gray-950 rounded-lg p-6 border border-gray-800 h-64 animate-pulse" />
          }
        >
          <RecentActivity events={recentActivities} />
        </Suspense>
      </div>
    </div>
  );
}
