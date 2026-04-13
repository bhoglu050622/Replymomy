"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Gift, MoreVertical, Trash2, Edit2, Smile, X, Check, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStreamChatContext } from "@/components/providers/stream-provider";
import type { Channel, LocalMessage } from "stream-chat";
import { formatDistanceToNow } from "date-fns";
import { MEDIA_CONFIG } from "@/lib/media/config";

type PendingAttachment = { assetId: string; url: string; thumbUrl: string | null };

const REACTIONS = ["❤️", "🔥", "👍", "😂", "😮", "🙏"];

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

  // Message actions state
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);

  // Image attachment state
  const [attachedImages, setAttachedImages] = useState<PendingAttachment[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Message actions
  async function deleteMessage(messageId: string) {
    if (!channel) return;
    try {
      // Soft-delete any tracked media assets attached to this message
      const msg = messages.find((m) => m.id === messageId);
      if (msg?.attachments?.length) {
        for (const att of msg.attachments) {
          const assetId = (att as Record<string, unknown>).asset_id as string | undefined;
          if (assetId) {
            fetch(`/api/media/delete?assetId=${assetId}`, { method: "DELETE" }).catch(() => {});
          }
        }
      }
      await client!.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
    setActiveMessageId(null);
  }

  async function editMessage(messageId: string, newText: string) {
    if (!channel || !newText.trim()) return;
    try {
      await client!.updateMessage({
        id: messageId,
        text: newText.trim(),
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, text: newText.trim() } : m
        )
      );
      toast.success("Message updated");
    } catch {
      toast.error("Failed to edit message");
    }
    setEditingMessageId(null);
    setEditText("");
    setActiveMessageId(null);
  }

  async function addReaction(messageId: string, reaction: string) {
    if (!channel) return;
    try {
      await channel.sendReaction(messageId, { type: reaction });
      toast.success("Reaction added");
    } catch {
      toast.error("Failed to add reaction");
    }
    setShowReactions(null);
    setActiveMessageId(null);
  }

  function startEditing(msg: LocalMessage) {
    setEditingMessageId(msg.id);
    setEditText(msg.text || "");
    setActiveMessageId(null);
  }

  function cancelEditing() {
    setEditingMessageId(null);
    setEditText("");
  }

  // Close actions menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".message-actions-menu")) {
        setActiveMessageId(null);
        setShowReactions(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Image upload handlers
  function handleImageClick() {
    if (attachedImages.length >= MEDIA_CONFIG.MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MEDIA_CONFIG.MAX_ATTACHMENTS} attachments per message`);
      return;
    }
    fileInputRef.current?.click();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (attachedImages.length >= MEDIA_CONFIG.MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MEDIA_CONFIG.MAX_ATTACHMENTS} attachments per message`);
      return;
    }

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("chatId", channelId);

      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      setAttachedImages((prev) => [
        ...prev,
        { assetId: data.assetId, url: data.url, thumbUrl: data.thumbUrl ?? null },
      ]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  function removeAttachedImage(assetId: string) {
    setAttachedImages((prev) => prev.filter((a) => a.assetId !== assetId));
  }

  async function sendWithAttachments() {
    if (!channel || sending || (attachedImages.length === 0 && !input.trim())) return;

    setSending(true);
    try {
      const streamMsg = await channel.sendMessage({
        text: input.trim() || "",
        attachments: attachedImages.map((img) => ({
          type: "image",
          image_url: img.url,
          thumb_url: img.thumbUrl ?? img.url,
          asset_id: img.assetId, // stored in Stream payload for soft-delete lookup
          fallback: "Image",
        })),
      });

      // Fire-and-forget: link each asset to the confirmed Stream message ID
      for (const img of attachedImages) {
        fetch("/api/media/attach", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: img.assetId,
            streamMessageId: streamMsg.message.id,
            chatId: channelId,
          }),
        }).catch(() => {});
      }

      setInput("");
      setAttachedImages([]);
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
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
          const isActive = activeMessageId === msg.id;
          const isEditing = editingMessageId === msg.id;
          const msgReactions = msg.latest_reactions || [];

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
            >
              <div className="relative flex items-end gap-2">
                {/* Message actions button (visible on hover or active) */}
                <button
                  onClick={() => setActiveMessageId(isActive ? null : msg.id)}
                  className={`transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  } ${isOwn ? "order-last" : "order-first"}`}
                >
                  <MoreVertical className="size-4 text-ivory/40 hover:text-champagne" />
                </button>

                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-body-md relative ${
                    isOwn
                      ? "bg-gradient-to-br from-champagne-600 to-champagne text-obsidian rounded-br-md"
                      : "bg-smoke text-ivory border border-champagne/20 rounded-bl-md"
                  }`}
                >
                  {isEditing ? (
                    // Edit mode
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            editMessage(msg.id, editText);
                          } else if (e.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                        className={`flex-1 bg-transparent border-b ${
                          isOwn ? "border-obsidian/30" : "border-champagne/30"
                        } focus:outline-none px-1`}
                        autoFocus
                      />
                      <button
                        onClick={() => editMessage(msg.id, editText)}
                        className={`${isOwn ? "text-obsidian/60" : "text-ivory/60"}`}
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className={`${isOwn ? "text-obsidian/60" : "text-ivory/60"}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <p className="leading-relaxed">{msg.text}</p>
                      {/* Image attachments — show thumb, link to full */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.attachments.map((attachment, idx) =>
                            attachment.type === "image" && attachment.image_url ? (
                              <a
                                key={idx}
                                href={attachment.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="relative rounded-xl overflow-hidden block"
                              >
                                <Image
                                  src={(attachment as Record<string, unknown>).thumb_url as string ?? attachment.image_url}
                                  alt="Shared image"
                                  width={160}
                                  height={120}
                                  className="object-cover rounded-xl"
                                />
                              </a>
                            ) : null
                          )}
                        </div>
                      )}
                      {/* Reactions */}
                      {msgReactions.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {msgReactions.map((reaction, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isOwn
                                  ? "bg-obsidian/20"
                                  : "bg-champagne/10 border border-champagne/20"
                              }`}
                            >
                              {reaction.type}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Timestamp */}
                  {msg.created_at && !isEditing && (
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
                      {msg.updated_at && msg.updated_at !== msg.created_at && " (edited)"}
                    </p>
                  )}
                </div>

                {/* Message actions dropdown */}
                {isActive && !isEditing && (
                  <div
                    className={`message-actions-menu absolute z-50 ${
                      isOwn ? "right-8" : "left-8"
                    } bottom-0 mb-8`}
                  >
                    <div className="bg-smoke border border-champagne/20 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                      {/* React option */}
                      <button
                        onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                        className="w-full px-4 py-2 text-left text-body-sm text-ivory hover:bg-champagne/10 flex items-center gap-2"
                      >
                        <Smile className="size-4 text-champagne" />
                        React
                      </button>
                      {isOwn && (
                        <>
                          <button
                            onClick={() => startEditing(msg)}
                            className="w-full px-4 py-2 text-left text-body-sm text-ivory hover:bg-champagne/10 flex items-center gap-2"
                          >
                            <Edit2 className="size-4 text-champagne" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="w-full px-4 py-2 text-left text-body-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>

                    {/* Reactions picker */}
                    {showReactions === msg.id && (
                      <div className="mt-2 bg-smoke border border-champagne/20 rounded-xl shadow-lg p-2">
                        <div className="flex gap-1">
                          {REACTIONS.map((reaction) => (
                            <button
                              key={reaction}
                              onClick={() => addReaction(msg.id, reaction)}
                              className="text-xl hover:scale-125 transition-transform p-1"
                            >
                              {reaction}
                            </button>
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
        {/* Attached image previews */}
        {attachedImages.length > 0 && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {attachedImages.map((img) => (
              <div key={img.assetId} className="relative">
                <Image
                  src={img.thumbUrl ?? img.url}
                  alt="Attached image"
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <button
                  onClick={() => removeAttachedImage(img.assetId)}
                  className="absolute -top-1 -right-1 size-5 bg-smoke border border-champagne/30 rounded-full flex items-center justify-center text-ivory/60 hover:text-ivory"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <span className="text-body-sm text-ivory/50">
              {attachedImages.length} / {MEDIA_CONFIG.MAX_ATTACHMENTS}
            </span>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* Image upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-ivory/40 hover:text-champagne shrink-0"
            onClick={handleImageClick}
            disabled={uploadingImage || attachedImages.length >= MEDIA_CONFIG.MAX_ATTACHMENTS}
          >
            {uploadingImage ? (
              <div className="size-4 border-2 border-champagne/40 border-t-champagne rounded-full animate-spin" />
            ) : (
              <ImageIcon className="size-5" />
            )}
          </Button>

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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (attachedImages.length > 0) {
                  sendWithAttachments();
                } else {
                  sendMessage();
                }
              }
            }}
            placeholder={attachedImages.length > 0 ? "Add a message (optional)..." : "Say something..."}
            rows={1}
            className="flex-1 bg-smoke border border-champagne/20 text-ivory rounded-2xl px-4 py-3 text-body-md resize-none focus:outline-none focus:border-champagne/50 transition-colors placeholder:text-ivory/30"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <Button
            variant="gold"
            size="icon"
            className="rounded-full shrink-0"
            onClick={attachedImages.length > 0 ? sendWithAttachments : sendMessage}
            disabled={(!input.trim() && attachedImages.length === 0) || sending || !channel}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
