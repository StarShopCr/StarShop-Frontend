import { Search, User } from "lucide-react";
import Input from "@/components/ui/input";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timeAgo: string;
  isOnline?: boolean;
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Thanks for the quick deliv...",
    timeAgo: "2m ago",
    isOnline: true,
  },
  {
    id: "2",
    name: "Sarah Smith",
    lastMessage: "Is this item still available?",
    timeAgo: "1h ago",
  },
  {
    id: "3",
    name: "Mike Johnson",
    lastMessage: "Perfect, I'll place the order",
    timeAgo: "3h ago",
  },
];

export default function ChatConversations() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden text-zinc-100 min-h-[590px] flex flex-col shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-opacity-30 border border-zinc-800">
      <div className="p-4 space-y-4 border-b border-zinc-900">
        <div className="relative">
          <Input
            label=""
            id="search"
            type="text"
            placeholder="Search conversations..."
            name="search"
            icon={Search}
            className=" border-b-4 border-primary-purple placeholder:text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation, index) => (
          <div
            key={conversation.id}
            className={`flex items-center gap-3 p-4 bg-opacity-30 transition cursor-pointer border-b border-zinc-800 ${
              index === 0
                ? "bg-purple-900/40 rounded-lg m-2"
                : "hover:bg-zinc-800/50"
            }`}
          >
            <div className="relative flex items-center justify-center h-10 w-10 bg-zinc-700 rounded-full">
              <User className="h-6 w-6 text-zinc-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{conversation.name}</p>
                <span className="text-xs text-zinc-400 flex-shrink-0">
                  {conversation.timeAgo}
                </span>
              </div>
              <p className="text-sm text-zinc-400 truncate">
                {conversation.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
