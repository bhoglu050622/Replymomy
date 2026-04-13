"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Gift, MoreVertical, Trash2, Edit2,
  Smile, X, Check, FileText, Camera,
} from "lucide-react";
import { CameraCapture } from "@/components/chat/camera-capture";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { MEDIA_CONFIG } from "@/lib/media/config";

interface Attachment {
  asset_id: string;
  url: string;
  thumb_url: string | null;
  mime_type?: string;
}
interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  attachments: Attachment[];
  reactions: Record<string, string[]>;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  sender?: { id: string; profiles: { display_name: string } | null } | null;
}
interface PendingAttachment { assetId: string; url: string; thumbUrl: string | null; mimeType: string }

const REACTIONS = ["❤️", "🔥", "👍", "😂", "😮", "🙏"];

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("Match");
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
   const [attachedFiles, setAttachedFiles] = useState<PendingAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load user + messages
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      // Fetch messages
      const res = await fetch(`/api/chat/${matchId}/messages`);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages ?? []);

        // Get other user name from first message or match data
        const other = (d.messages ?? []).find((m: Message) => m.sender_id !== user.id);
        if (other?.sender?.profiles) {
          setOtherName(other.sender.profiles.display_name ?? "Match");
        }

        // Also fetch from chat list for name
        const chatRes = await fetch("/api/chat");
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          const chat = chatData.chats?.find((c: { matchId: string }) => c.matchId === matchId);
          if (chat) {
            setOtherName(chat.otherName);
          }
        }
      }
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.match-${matchId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.match-${matchId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.deleted_at) {
            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
          } else {
            setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".msg-menu")) {
        setActiveMessageId(null);
        setShowReactions(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const send = useCallback(async () => {
    if ((!input.trim() && attachedFiles.length === 0) || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    const imgs = attachedFiles;
    setAttachedFiles([]);

    try {
      const res = await fetch(`/api/chat/${matchId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text || null,
          attachments: imgs.map((i) => ({ assetId: i.assetId, url: i.url, thumbUrl: i.thumbUrl, mimeType: i.mimeType })),
        }),
      });
      if (!res.ok) {
        setInput(text);
        setAttachedFiles(imgs);
        toast.error("Failed to send.");
      }
    } catch {
      setInput(text);
      setAttachedFiles(imgs);
      toast.error("Failed to send.");
    } finally {
      setSending(false);
    }
  }, [input, attachedFiles, sending, matchId]);

  async function deleteMessage(id: string) {
    const res = await fetch(`/api/chat/${matchId}/messages/${id}`, { method: "DELETE" });
    if (!res.ok) toast.error("Failed to delete.");
    setActiveMessageId(null);
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return;
    const res = await fetch(`/api/chat/${matchId}/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText }),
    });
    if (!res.ok) toast.error("Failed to edit.");
    setEditingId(null);
    setEditText("");
    setActiveMessageId(null);
  }

  async function react(id: string, emoji: string) {
    await fetch(`/api/chat/${matchId}/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction: emoji }),
    });
    setShowReactions(null);
    setActiveMessageId(null);
  }

  async function uploadFile(file: File) {
    if (attachedFiles.length >= MEDIA_CONFIG.MAX_ATTACHMENTS) {
      toast.error(`Max ${MEDIA_CONFIG.MAX_ATTACHMENTS} attachments`);
      return;
    }
    setUploadingFile(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("chatId", `match-${matchId}`);
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Upload failed"); return; }
      setAttachedFiles((prev) => [...prev, { assetId: data.assetId, url: data.url, thumbUrl: data.thumbUrl ?? null, mimeType: data.mimeType ?? "application/octet-stream" }]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    await uploadFile(file);
  }

  async function handleCameraCapture(file: File) {
    await uploadFile(file);
  }

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-obsidian">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-champagne/10 bg-obsidian/95 backdrop-blur-xl shrink-0">
        <button onClick={() => router.push("/chat")} className="text-ivory/60 hover:text-ivory transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <div className="relative size-10 rounded-full border border-champagne/30 overflow-hidden shrink-0">
          <ProfilePlaceholder seed={matchId} width={40} height={40} className="w-full h-full" />
        </div>
        <div className="font-headline text-xl text-ivory">{loading ? "Loading..." : otherName}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {!loading && messages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-body-md text-ivory/40">Say something.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === myUserId;
          const isActive = activeMessageId === msg.id;
          const isEditing = editingId === msg.id;
          const reactions = msg.reactions ?? {};

          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
              <div className="relative flex items-end gap-2">
                <button
                  onClick={() => setActiveMessageId(isActive ? null : msg.id)}
                  className={`transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} ${isOwn ? "order-last" : "order-first"}`}
                >
                  <MoreVertical className="size-4 text-ivory/40 hover:text-champagne" />
                </button>

                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-body-md relative ${
                  isOwn
                    ? "bg-gradient-to-br from-champagne-600 to-champagne text-obsidian rounded-br-md"
                    : "bg-smoke text-ivory border border-champagne/20 rounded-bl-md"
                }`}>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(msg.id);
                          if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                        }}
                        className={`flex-1 bg-transparent border-b ${isOwn ? "border-obsidian/30" : "border-champagne/30"} focus:outline-none px-1`}
                        autoFocus
                      />
                      <button onClick={() => saveEdit(msg.id)} className={isOwn ? "text-obsidian/60" : "text-ivory/60"}><Check className="size-4" /></button>
                      <button onClick={() => { setEditingId(null); setEditText(""); }} className={isOwn ? "text-obsidian/60" : "text-ivory/60"}><X className="size-4" /></button>
                    </div>
                  ) : (
                    <>
                      {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                      {(msg.attachments ?? []).length > 0 && (
                        <div className="mt-2 flex flex-col gap-2">
                          {(msg.attachments ?? []).map((att, i) => {
                            const mime = att.mime_type ?? "";
                            if (mime.startsWith("image/")) {
                              return (
                                <img
                                  key={i}
                                  src={att.thumb_url ?? att.url}
                                  alt="Image"
                                  className="rounded-xl max-w-[240px] cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(att.url, "_blank")}
                                />
                              );
                            }
                            if (mime.startsWith("video/")) {
                              return (
                                <video
                                  key={i}
                                  src={att.url}
                                  controls
                                  playsInline
                                  className="rounded-xl max-w-[280px] max-h-[200px]"
                                />
                              );
                            }
                            return (
                              <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-body-sm underline text-champagne/90 hover:text-champagne"
                              >
                                <FileText className="size-4 shrink-0" />
                                Attachment {i + 1}
                              </a>
                            );
                          })}
                        </div>
                      )}
                      {Object.keys(reactions).length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {Object.entries(reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => react(msg.id, emoji)}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                users.includes(myUserId ?? "")
                                  ? "bg-champagne/20 border border-champagne/40"
                                  : isOwn ? "bg-obsidian/20" : "bg-champagne/10 border border-champagne/20"
                              }`}
                            >
                              {emoji} {users.length > 1 && users.length}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {!isEditing && (
                    <p className={`text-[10px] mt-1 ${isOwn ? "text-obsidian/60" : "text-ivory/40"}`}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      {msg.edited_at && " (edited)"}
                    </p>
                  )}
                </div>

                {/* Actions menu */}
                {isActive && !isEditing && (
                  <div className={`msg-menu absolute z-50 ${isOwn ? "right-8" : "left-8"} bottom-0 mb-8`}>
                    <div className="bg-smoke border border-champagne/20 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                      <button
                        onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                        className="w-full px-4 py-2 text-left text-body-sm text-ivory hover:bg-champagne/10 flex items-center gap-2"
                      >
                        <Smile className="size-4 text-champagne" /> React
                      </button>
                      {isOwn && (
                        <>
                          <button
                            onClick={() => { setEditingId(msg.id); setEditText(msg.content ?? ""); setActiveMessageId(null); }}
                            className="w-full px-4 py-2 text-left text-body-sm text-ivory hover:bg-champagne/10 flex items-center gap-2"
                          >
                            <Edit2 className="size-4 text-champagne" /> Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="w-full px-4 py-2 text-left text-body-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                          >
                            <Trash2 className="size-4" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                    {showReactions === msg.id && (
                      <div className="mt-2 bg-smoke border border-champagne/20 rounded-xl shadow-lg p-2">
                        <div className="flex gap-1">
                          {REACTIONS.map((r) => (
                            <button key={r} onClick={() => react(msg.id, r)} className="text-xl hover:scale-125 transition-transform p-1">{r}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-champagne/10 bg-obsidian/95 backdrop-blur-xl shrink-0">
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {attachedFiles.map((f) => (
              <div key={f.assetId} className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-smoke border border-champagne/20 text-body-sm text-ivory">
                {f.mimeType.startsWith("image/") ? (
                  <img src={f.url} alt="" className="size-8 rounded-lg object-cover" />
                ) : f.mimeType.startsWith("video/") ? (
                  <div className="size-8 rounded-lg bg-champagne/10 flex items-center justify-center">
                    <Camera className="size-4 text-champagne" />
                  </div>
                ) : (
                  <FileText className="size-4 text-champagne" />
                )}
                <button
                  type="button"
                  onClick={() => setAttachedFiles((prev) => prev.filter((a) => a.assetId !== f.assetId))}
                  className="ml-1 text-ivory/50 hover:text-ivory"
                  aria-label="Remove attachment"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <span className="text-body-sm text-ivory/50">{attachedFiles.length}/{MEDIA_CONFIG.MAX_ATTACHMENTS}</span>
          </div>
        )}

        <div className="flex items-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf"
            className="hidden"
          />
          <Button
            variant="ghost" size="icon"
            className="text-ivory/40 hover:text-champagne shrink-0"
            onClick={() => {
              if (attachedFiles.length >= MEDIA_CONFIG.MAX_ATTACHMENTS) { toast.error(`Max ${MEDIA_CONFIG.MAX_ATTACHMENTS} attachments`); return; }
              fileInputRef.current?.click();
            }}
            disabled={uploadingFile || attachedFiles.length >= MEDIA_CONFIG.MAX_ATTACHMENTS}
          >
            {uploadingFile
              ? <div className="size-4 border-2 border-champagne/40 border-t-champagne rounded-full animate-spin" />
              : <FileText className="size-5" />}
          </Button>
          <Button
            variant="ghost" size="icon"
            className="text-ivory/40 hover:text-champagne shrink-0"
            onClick={() => {
              if (attachedFiles.length >= MEDIA_CONFIG.MAX_ATTACHMENTS) { toast.error(`Max ${MEDIA_CONFIG.MAX_ATTACHMENTS} attachments`); return; }
              setCameraOpen(true);
            }}
            disabled={uploadingFile || attachedFiles.length >= MEDIA_CONFIG.MAX_ATTACHMENTS}
            aria-label="Open camera"
          >
            <Camera className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-ivory/40 hover:text-champagne shrink-0" onClick={() => router.push("/gifts")}>
            <Gift className="size-5" />
          </Button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={attachedFiles.length > 0 ? "Add a message (optional)..." : "Say something..."}
            rows={1}
            className="flex-1 bg-smoke border border-champagne/20 text-ivory rounded-2xl px-4 py-3 text-body-md resize-none focus:outline-none focus:border-champagne/50 transition-colors placeholder:text-ivory/30"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <Button
            variant="gold" size="icon" className="rounded-full shrink-0"
            onClick={send}
            disabled={(!input.trim() && attachedFiles.length === 0) || sending}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
