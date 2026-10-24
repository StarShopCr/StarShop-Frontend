import { Metadata } from 'next';
import { BuyerCalendar } from '@/features/buyer/calendar';

export const metadata: Metadata = {
  title: 'Buyer Activity Calendar | StarShop',
  description:
    'Track scheduled orders, delivery milestones, and dispatch activity on Stellar.',
};

export default function BuyerCalendarPage() {
  return (
    <div className="min-h-screen bg-transparent py-6">
      <BuyerCalendar />
    </div>
  );
}
