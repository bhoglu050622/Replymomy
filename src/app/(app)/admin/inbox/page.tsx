"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageCircle, ChevronLeft, User } from "lucide-react";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  matchId: string;
  otherUserId: string;
  otherName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSenderId: string | null;
}

interface ManagedProfile {
  userId: string;
  displayName: string;
  headline: string | null;
  city: string | null;
  role: string;
  tier: string | null;
  conversations: Conversation[];
}

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
  edited_at: string | null;
  sender?: { id: string; profiles: { display_name: string } | null } | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminInboxPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<ManagedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"profiles" | "convs" | "chat">("profiles");

  // Load managed profiles
  useEffect(() => {
    fetch("/api/admin/managed-profiles")
      .then((r) => r.json())
      .then((d) => {
        setProfiles(d.profiles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConv) return;
    setMsgLoading(true);
    setMessages([]);
    fetch(`/api/admin/managed-chat/${selectedConv.matchId}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? []);
        setMsgLoading(false);
      })
      .catch(() => setMsgLoading(false));
  }, [selectedConv]);

  // Realtime subscription for the open chat
  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`admin-inbox-${selectedConv.matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.match-${selectedConv.matchId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConv?.matchId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    if (!input.trim() || !selectedProfile || !selectedConv || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`/api/admin/managed-chat/${selectedConv.matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sendAsUserId: selectedProfile.userId }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Failed to send");
        setInput(text);
      }
    } catch {
      toast.error("Failed to send");
      setInput(text);
    } finally {
      setSending(false);
    }
  }, [input, selectedProfile, selectedConv, sending]);

  function selectProfile(p: ManagedProfile) {
    setSelectedProfile(p);
    setSelectedConv(null);
    setMessages([]);
    setView("convs");
  }

  function selectConv(conv: Conversation) {
    setSelectedConv(conv);
    setView("chat");
  }

  const totalConvs = profiles.reduce((sum, p) => sum + p.conversations.length, 0);

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* ── Left: Profile list ─────────────────────────────────────────── */}
      <div className={cn(
        "w-full lg:w-72 flex-shrink-0 border-r border-champagne/10 flex flex-col bg-obsidian",
        "lg:flex", view !== "profiles" && "hidden lg:flex"
      )}>
        <div className="px-5 py-4 border-b border-champagne/10">
          <h2 className="font-headline text-xl text-ivory">Managed Inbox</h2>
          <p className="text-label text-ivory/30 mt-0.5">
            {loading ? "Loading…" : `${profiles.length} profiles · ${totalConvs} active chats`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-smoke animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-smoke rounded-full animate-pulse w-3/4" />
                    <div className="h-2.5 bg-smoke rounded-full animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-body-sm text-ivory/30">No managed profiles yet.</p>
              <p className="text-label text-ivory/20 mt-1">
                Run: node --env-file=.env.local scripts/seed-bangalore-profiles.mjs
              </p>
            </div>
          ) : (
            <div className="py-2">
              {profiles.map((p) => (
                <button
                  key={p.userId}
                  onClick={() => selectProfile(p)}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3.5 hover:bg-smoke/60 transition-colors text-left",
                    selectedProfile?.userId === p.userId && "bg-smoke/60 border-r-2 border-champagne"
                  )}
                >
                  <div className="relative size-10 rounded-full overflow-hidden shrink-0 border border-champagne/20">
                    <ProfilePlaceholder seed={p.userId} width={40} height={40} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-ivory font-medium truncate">{p.displayName}</span>
                      {p.conversations.length > 0 && (
                        <span className="text-[10px] text-champagne bg-champagne/15 px-1.5 py-0.5 rounded-full ml-2 shrink-0">
                          {p.conversations.length}
                        </span>
                      )}
                    </div>
                    <p className="text-label text-ivory/30 capitalize">{p.role} · {p.city}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Middle: Conversations list ─────────────────────────────────── */}
      <div className={cn(
        "w-full lg:w-72 flex-shrink-0 border-r border-champagne/10 flex flex-col bg-obsidian",
        "lg:flex", view !== "convs" && "hidden lg:flex"
      )}>
        {selectedProfile ? (
          <>
            <div className="px-5 py-4 border-b border-champagne/10 flex items-center gap-3">
              <button
                onClick={() => setView("profiles")}
                className="lg:hidden text-ivory/40 hover:text-ivory"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="relative size-8 rounded-full overflow-hidden border border-champagne/20 shrink-0">
                <ProfilePlaceholder seed={selectedProfile.userId} width={32} height={32} className="w-full h-full" />
              </div>
              <div>
                <div className="text-body-sm text-ivory font-medium">{selectedProfile.displayName}</div>
                <div className="text-label text-ivory/30 capitalize">{selectedProfile.role}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedProfile.conversations.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <MessageCircle className="size-8 text-ivory/10 mx-auto" />
                  <p className="text-body-sm text-ivory/30">No active conversations yet.</p>
                  <p className="text-label text-ivory/20">
                    Matches happen daily via the cron job.
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {selectedProfile.conversations.map((conv) => (
                    <button
                      key={conv.matchId}
                      onClick={() => selectConv(conv)}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-3.5 hover:bg-smoke/60 transition-colors text-left",
                        selectedConv?.matchId === conv.matchId && "bg-smoke/60 border-r-2 border-champagne"
                      )}
                    >
                      <div className="relative size-9 rounded-full overflow-hidden shrink-0 border border-champagne/20">
                        <ProfilePlaceholder seed={conv.otherUserId ?? conv.matchId} width={36} height={36} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm text-ivory font-medium truncate">{conv.otherName}</div>
                        <p className="text-label text-ivory/40 truncate">
                          {conv.lastMessage
                            ? (conv.lastSenderId === selectedProfile.userId ? "You: " : "") + conv.lastMessage
                            : "No messages yet"}
                        </p>
                      </div>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-ivory/25 shrink-0">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="size-8 text-ivory/10 mx-auto mb-2" />
              <p className="text-body-sm text-ivory/30">Select a profile</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Chat thread ──────────────────────────────────────────── */}
      <div className={cn(
        "flex-1 flex flex-col bg-obsidian",
        view !== "chat" && "hidden lg:flex"
      )}>
        {selectedConv && selectedProfile ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-champagne/10 shrink-0">
              <button
                onClick={() => setView("convs")}
                className="lg:hidden text-ivory/40 hover:text-ivory"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="relative size-9 rounded-full overflow-hidden border border-champagne/20">
                <ProfilePlaceholder seed={selectedConv.otherUserId ?? selectedConv.matchId} width={36} height={36} className="w-full h-full" />
              </div>
              <div className="flex-1">
                <div className="text-body-sm text-ivory font-medium">{selectedConv.otherName}</div>
                <div className="text-label text-ivory/30">
                  Replying as <span className="text-champagne">{selectedProfile.displayName}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {msgLoading ? (
                <div className="flex justify-center py-10">
                  <div className="size-5 border-2 border-champagne/20 border-t-champagne rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-body-sm text-ivory/30">No messages yet. Send the first one.</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isFromManaged = msg.sender_id === selectedProfile.userId;
                    const name = isFromManaged
                      ? selectedProfile.displayName
                      : (msg.sender as { profiles: { display_name?: string } | null } | null)?.profiles?.display_name ?? selectedConv.otherName;

                    return (
                      <div key={msg.id} className={`flex ${isFromManaged ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[70%] space-y-1">
                          <p className={cn("text-label", isFromManaged ? "text-right text-champagne/50" : "text-ivory/30")}>
                            {name}
                          </p>
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-body-md",
                            isFromManaged
                              ? "bg-gradient-to-br from-champagne-600 to-champagne text-obsidian rounded-br-md"
                              : "bg-smoke text-ivory border border-champagne/20 rounded-bl-md"
                          )}>
                            {msg.content}
                          </div>
                          <p className={cn("text-[10px]", isFromManaged ? "text-right text-ivory/30" : "text-ivory/30")}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Reply input */}
            <div className="px-6 py-4 border-t border-champagne/10 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded-full overflow-hidden border border-champagne/30">
                  <ProfilePlaceholder seed={selectedProfile.userId} width={24} height={24} className="w-full h-full" />
                </div>
                <span className="text-label text-champagne/70">Sending as {selectedProfile.displayName}</span>
              </div>
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={`Reply as ${selectedProfile.displayName}…`}
                  rows={1}
                  className="flex-1 bg-smoke border border-champagne/20 text-ivory rounded-2xl px-4 py-3 text-body-md resize-none focus:outline-none focus:border-champagne/50 transition-colors placeholder:text-ivory/30"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
                <Button
                  variant="gold"
                  size="icon"
                  className="rounded-full shrink-0"
                  onClick={send}
                  disabled={!input.trim() || sending}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <MessageCircle className="size-10 text-ivory/10 mx-auto" />
              <p className="text-body-md text-ivory/30">Select a conversation to respond</p>
              <p className="text-label text-ivory/20">
                Managed profiles auto-appear here once matched and chatted.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
