"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
}

interface Props { userId: string }

export function ConciergeChat({ userId }: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatId = `concierge-${userId}`;

  useEffect(() => {
    supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .eq("chat_id", chatId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(60)
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`concierge:${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      }, (p) => setMessages((prev) => [...prev, p.new as Message]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: userId,
      content: text,
    });
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[420px] rounded-2xl border border-champagne/20 overflow-hidden bg-smoke">
      <div className="px-4 py-3 border-b border-champagne/10 text-xs text-ivory/40 font-medium tracking-widest uppercase">
        Liaison Chat
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-body-sm text-ivory/30 pt-8">Your liaison will respond here.</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                isOwn
                  ? "bg-champagne text-obsidian rounded-br-sm"
                  : "bg-ivory/10 text-ivory border border-champagne/10 rounded-bl-sm"
              }`}>
                {msg.content}
                <p className={`text-[10px] mt-0.5 ${isOwn ? "text-obsidian/50" : "text-ivory/30"}`}>
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-champagne/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Message your liaison..."
          className="flex-1 bg-ivory/5 border border-champagne/20 text-ivory rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-champagne/40 placeholder:text-ivory/20"
        />
        <Button variant="gold" size="icon" onClick={send} disabled={!input.trim() || sending} className="rounded-xl shrink-0">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
