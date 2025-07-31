import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function EmptyTicketState() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[325px] h-[500px] rounded-lg p-4 flex flex-col items-center justify-center border border-white/10 bg-white/5">
        <div className="w-14 h-14 rounded-full bg-[#1e1b38] flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-[#a855f7]" />
        </div>

        <h3 className="text-white text-lg font-medium mt-4">
          No Ticket Selected
        </h3>
        <p className="text-gray-400 text-center text-sm max-w-xs mt-1">
          Select a ticket from the list to view its
        </p>
        <p className="text-gray-400 text-center text-sm max-w-xs mt-1">
          details and respond to customer inquiries.
        </p>

        <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white mt-5 h-9 px-4 text-sm whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Create New Ticket
        </Button>
      </div>
    </div>
  );
}
