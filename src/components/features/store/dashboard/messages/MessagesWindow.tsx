import { Paperclip, Send, User } from "lucide-react";
import Input from "@/components/ui/input";

export default function ChatInterface() {
  return (
    <div className="w-full max-w-7xl mx-auto rounded-lg overflow-hidden text-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.2)] bg-opacity-80 border border-zinc-800">
      <div className="p-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-zinc-700 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
            <div className="font-medium">John Doe</div>
            <div className="text-xs text-zinc-400">Online</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <div className="max-w-[80%] rounded-lg bg-opacity-30 bg-zinc-800 p-3">
            Hi! I just received my order and wanted to thank you for the quick
            delivery!
          </div>
          <div className="text-xs text-zinc-500 pl-2">2:30 PM</div>
        </div>

        <div className="space-y-1 text-right">
          <div className="max-w-[80%] ml-auto rounded-lg bg-opacity-60 bg-[#2A1B47] p-3">
            You&apos;re welcome! We&apos;re glad you received your order. How do
            you like the product?
          </div>
          <div className="text-xs text-zinc-500 pr-2">2:31 PM</div>
        </div>

        <div className="space-y-1">
          <div className="max-w-[80%] rounded-lg bg-opacity-30 bg-zinc-800 p-3">
            It&apos;s perfect! Exactly what I was looking for.
          </div>
          <div className="text-xs text-zinc-500 pl-2">2:32 PM</div>
        </div>

        <div className="space-y-1 text-right">
          <div className="max-w-[80%] ml-auto rounded-lg bg-opacity-60 bg-[#2A1B47] p-3">
            That&apos;s great to hear! Don&apos;t forget to leave a review if
            you&apos;re satisfied with your purchase.
          </div>
          <div className="text-xs text-zinc-500 pr-2">2:33 PM</div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <button className="flex-shrink-0 p-3 rounded-lg text-white hover:bg-zinc-800 transition">
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Input
              label=""
              id="message"
              type="text"
              placeholder="Type a message..."
              name="message"
              className=" border-b-4 border-primary-purple placeholder:text-white"
            />
          </div>
          <button className="flex-shrink-0 bg-[#9039E4] p-3 rounded-lg text-white hover:bg-purple-700 transition">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}