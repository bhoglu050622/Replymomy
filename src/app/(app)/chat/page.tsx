"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";

interface Chat {
  matchId: string;
  otherName: string;
  lastMessage: string | null;
  lastMessageAt: string;
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setChats(d.chats ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Messages</div>
        <h1 className="text-display-lg text-ivory">
          Your <span className="italic text-champagne">chats.</span>
        </h1>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-smoke border border-champagne/10 animate-pulse" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="size-12 text-champagne/30 mx-auto mb-4" />
          <p className="text-body-md text-ivory/40">Nothing yet.</p>
          <p className="text-body-sm text-ivory/30 mt-2">Accept a match to start chatting.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <Link
              key={chat.matchId}
              href={`/chat/${chat.matchId}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all"
            >
              <div className="relative size-14 rounded-full border border-champagne/30 shrink-0 overflow-hidden">
                <ProfilePlaceholder seed={chat.matchId} width={56} height={56} className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-headline text-xl text-ivory">{chat.otherName}</span>
                  <span className="text-label text-ivory/40">
                    {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })}
                  </span>
                </div>
                {chat.lastMessage && (
                  <p className="text-body-sm text-ivory/60 truncate">{chat.lastMessage}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
