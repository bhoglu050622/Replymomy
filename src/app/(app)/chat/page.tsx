"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useStreamChatContext } from "@/components/providers/stream-provider";
import type { Channel, ChannelFilters, ChannelSort } from "stream-chat";
import { formatDistanceToNow } from "date-fns";

export default function ChatPage() {
  const { client, userId, connected } = useStreamChatContext();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connected || !client || !userId) {
      setLoading(false);
      return;
    }

    const filters: ChannelFilters = { members: { $in: [userId] }, type: "messaging" };
    const sort: ChannelSort = { last_message_at: -1 };

    client
      .queryChannels(filters, sort, { watch: true, state: true, limit: 30 })
      .then((chs) => {
        setChannels(chs);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Listen for new messages to refresh order
    const handler = client.on("message.new", () => {
      client
        .queryChannels(filters, sort, { watch: false, state: true, limit: 30 })
        .then(setChannels)
        .catch(() => {});
    });

    return () => {
      handler.unsubscribe();
    };
  }, [connected, client, userId]);

  function getOtherMember(channel: Channel) {
    if (!userId) return null;
    const members = Object.values(channel.state.members);
    return members.find((m) => m.user?.id !== userId)?.user ?? null;
  }

  function getLastMessage(channel: Channel) {
    const msgs = channel.state.messages;
    return msgs.at(-1)?.text ?? "";
  }

  function getLastTime(channel: Channel) {
    const msgs = channel.state.messages;
    const last = msgs.at(-1);
    if (!last?.created_at) return "";
    return formatDistanceToNow(new Date(last.created_at), { addSuffix: false });
  }

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
      ) : channels.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="size-12 text-champagne/30 mx-auto mb-4" />
          <p className="text-body-md text-ivory/40">Nothing yet.</p>
          <p className="text-body-sm text-ivory/30 mt-2">
            Accept a match to start chatting.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((channel) => {
            const other = getOtherMember(channel);
            const preview = getLastMessage(channel);
            const time = getLastTime(channel);
            const unread = channel.countUnread();

            return (
              <Link
                key={channel.id}
                href={`/chat/${channel.id}`}
                className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all"
              >
                <div className="relative size-14 rounded-full bg-gradient-to-br from-burgundy to-smoke border border-champagne/30 shrink-0 overflow-hidden">
                  {other?.image && (
                    <Image
                      src={other.image}
                      alt={other.name ?? ""}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline text-xl text-ivory">
                      {other?.name ?? (channel.data as Record<string, unknown>)?.name as string ?? "Match"}
                    </span>
                    {time && (
                      <span className="text-label text-ivory/40">{time}</span>
                    )}
                  </div>
                  {preview && (
                    <p className="text-body-sm text-ivory/60 truncate">{preview}</p>
                  )}
                </div>
                {unread > 0 && (
                  <div className="size-6 rounded-full bg-champagne text-obsidian text-xs font-semibold flex items-center justify-center shrink-0">
                    {unread}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
