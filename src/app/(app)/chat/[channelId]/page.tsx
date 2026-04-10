"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Gift } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStreamChatContext } from "@/components/providers/stream-provider";
import type { Channel, LocalMessage } from "stream-chat";
import { formatDistanceToNow } from "date-fns";

export default function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = use(params);
  const router = useRouter();
  const { client, userId, connected } = useStreamChatContext();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connected || !client || !userId) return;

    let ch: Channel;

    async function init() {
      ch = client!.channel("messaging", channelId);
      await ch.watch();
      await ch.markRead();

      const members = Object.values(ch.state.members);
      const other = members.find((m) => m.user?.id !== userId);
      setOtherName(other?.user?.name ?? "Match");
      setOtherOnline(other?.user?.online ?? false);
      setOtherUserId(other?.user?.id ?? null);

      setMessages([...ch.state.messages]);
      setChannel(ch);

      ch.on("message.new", (event) => {
        if (event.message) {
          setMessages((prev) => [...prev, event.message as unknown as LocalMessage]);
          ch.markRead().catch(() => {});
        }
      });

      ch.on("typing.start", (e) => {
        if (e.user?.id !== userId) setOtherTyping(true);
      });

      ch.on("typing.stop", (e) => {
        if (e.user?.id !== userId) setOtherTyping(false);
      });

      client!.on("user.presence.changed", (e) => {
        if (other?.user?.id && e.user?.id === other.user.id) {
          setOtherOnline(e.user.online ?? false);
        }
      });
    }

    init().catch(console.error);

    return () => {
      ch?.stopWatching().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, client, userId, channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !channel || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await channel.sendMessage({ text });
    } catch {
      setInput(text);
      toast.error("Failed to send.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    channel?.keystroke().catch(() => {});
  }

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-obsidian">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-champagne/10 bg-obsidian/95 backdrop-blur-xl shrink-0">
        <button
          onClick={() => router.push("/chat")}
          className="text-ivory/60 hover:text-ivory transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="size-10 rounded-full bg-gradient-to-br from-burgundy to-smoke border border-champagne/30" />
        <div>
          <div className="font-headline text-xl text-ivory">{otherName || "Loading..."}</div>
          <div className={`text-label flex items-center gap-1.5 ${otherOnline ? "text-emerald-400" : "text-ivory/30"}`}>
            <span className={`size-1.5 rounded-full ${otherOnline ? "bg-emerald-400 animate-pulse" : "bg-ivory/20"}`} />
            {otherUserId ? (otherOnline ? "Online" : "Offline") : "Loading..."}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-body-md text-ivory/40">Say something.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user?.id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-body-md ${
                  isOwn
                    ? "bg-gradient-to-br from-champagne-600 to-champagne text-obsidian rounded-br-md"
                    : "bg-smoke text-ivory border border-champagne/20 rounded-bl-md"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                {msg.created_at && (
                  <p
                    className={`text-[10px] mt-1 ${
                      isOwn ? "text-obsidian/60" : "text-ivory/40"
                    }`}
                  >
                    {formatDistanceToNow(
                      msg.created_at instanceof Date
                        ? msg.created_at
                        : new Date(msg.created_at as string),
                      { addSuffix: true }
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {otherTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-smoke border border-champagne/20 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-champagne/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-champagne/10 bg-obsidian/95 backdrop-blur-xl shrink-0">
        <div className="flex items-end gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-ivory/40 hover:text-champagne shrink-0"
            onClick={() => router.push("/gifts")}
          >
            <Gift className="size-5" />
          </Button>
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            rows={1}
            className="flex-1 bg-smoke border border-champagne/20 text-ivory rounded-2xl px-4 py-3 text-body-md resize-none focus:outline-none focus:border-champagne/50 transition-colors placeholder:text-ivory/30"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <Button
            variant="gold"
            size="icon"
            className="rounded-full shrink-0"
            onClick={sendMessage}
            disabled={!input.trim() || sending || !channel}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
