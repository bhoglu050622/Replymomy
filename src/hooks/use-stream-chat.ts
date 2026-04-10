"use client";

import { useState, useEffect, useRef } from "react";
import type { StreamChat } from "stream-chat";
import { getStreamClient } from "@/lib/stream/client";

interface StreamChatState {
  client: StreamChat | null;
  userId: string | null;
  connected: boolean;
  error: string | null;
}

export function useStreamChat() {
  const [state, setState] = useState<StreamChatState>({
    client: null,
    userId: null,
    connected: false,
    error: null,
  });
  const connectingRef = useRef(false);

  useEffect(() => {
    if (connectingRef.current) return;
    connectingRef.current = true;

    let mounted = true;

    async function connect() {
      try {
        const res = await fetch("/api/chat/token", { method: "POST" });
        if (!res.ok) throw new Error("Failed to get chat token");
        const { token, userId, apiKey } = await res.json();

        if (!apiKey || apiKey === "") {
          // No API key configured — stay disconnected silently
          return;
        }

        const client = getStreamClient();

        if (client.userID === userId) {
          // Already connected
          if (mounted) setState({ client, userId, connected: true, error: null });
          return;
        }

        await client.connectUser({ id: userId }, token);
        if (mounted) setState({ client, userId, connected: true, error: null });
      } catch (err) {
        if (mounted)
          setState((s) => ({
            ...s,
            error: err instanceof Error ? err.message : "Failed to connect",
          }));
      }
    }

    connect();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
