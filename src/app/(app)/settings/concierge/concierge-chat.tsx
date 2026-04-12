"use client";

import { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";

interface Props {
  userId: string;
}

export function ConciergeChat({ userId }: Props) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<ReturnType<StreamChat["channel"]> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let chatClient: StreamChat | null = null;

    async function init() {
      try {
        const tokenRes = await fetch("/api/chat/token");
        if (!tokenRes.ok) throw new Error("Token fetch failed");
        const { token } = await tokenRes.json();

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        if (!apiKey || apiKey === "your-stream-api-key") {
          setError("Chat not configured.");
          return;
        }

        chatClient = StreamChat.getInstance(apiKey);
        await chatClient.connectUser({ id: userId }, token);

        const ch = chatClient.channel("messaging", `concierge-${userId}`);
        await ch.watch();

        setClient(chatClient);
        setChannel(ch);
      } catch (e) {
        console.error("[ConciergeChat]", e);
        setError("Could not connect to your liaison. Try refreshing.");
      }
    }

    init();

    return () => {
      chatClient?.disconnectUser();
    };
  }, [userId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-80 text-ivory/40 text-body-sm">
        {error}
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="flex items-center justify-center h-80 text-ivory/40 text-body-sm">
        Connecting to your liaison...
      </div>
    );
  }

  return (
    <div className="h-[480px]" style={{ colorScheme: "dark" }}>
      <Chat client={client} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <Window>
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}
