"use client";

import { createContext, useContext } from "react";
import { useStreamChat } from "@/hooks/use-stream-chat";
import type { StreamChat } from "stream-chat";

interface StreamChatContextValue {
  client: StreamChat | null;
  userId: string | null;
  connected: boolean;
  error: string | null;
}

const StreamChatContext = createContext<StreamChatContextValue>({
  client: null,
  userId: null,
  connected: false,
  error: null,
});

export function StreamProvider({ children }: { children: React.ReactNode }) {
  const chatState = useStreamChat();
  return (
    <StreamChatContext.Provider value={chatState}>
      {children}
    </StreamChatContext.Provider>
  );
}

export function useStreamChatContext() {
  return useContext(StreamChatContext);
}
