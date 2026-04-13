"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Gift, Zap, Check, Coins } from "lucide-react";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";
import { Button } from "@/components/ui/button";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface DiscoverProfile {
  user_id: string;
  display_name: string;
  headline: string | null;
  location_city: string | null;
  date_of_birth: string | null;
  desires: string[] | null;
}

interface GiftItem {
  id: string;
  name: string;
  type: string;
  price_cents: number;
  token_cost: number | null;
  animation_key: string | null;
}

interface ConnectGiftModalProps {
  open: boolean;
  onClose: () => void;
  profile: DiscoverProfile;
  tokenBalance: number;
  onSuccess: (matchId: string) => void;
}

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const GIFT_EMOJI: Record<string, string> = {
  rose: "🌹",
  champagne: "🥂",
  diamond: "💎",
  default: "🎁",
};

function giftEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("rose")) return GIFT_EMOJI.rose;
  if (lower.includes("champagne")) return GIFT_EMOJI.champagne;
  if (lower.includes("diamond") || lower.includes("whisper")) return GIFT_EMOJI.diamond;
  return GIFT_EMOJI.default;
}

export function ConnectGiftModal({
  open,
  onClose,
  profile,
  tokenBalance,
  onSuccess,
}: ConnectGiftModalProps) {
  const [step, setStep] = useState<"intent" | "gift" | "done">("intent");
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [sending, setSending] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("intent");
      setSelectedGift(null);
      setSending(false);
      setMatchId(null);
    }
  }, [open]);

  // Load virtual gifts when entering gift step
  useEffect(() => {
    if (step === "gift" && gifts.length === 0) {
      fetch("/api/gifts/catalog")
        .then((r) => r.json())
        .then((d) => setGifts((d.gifts ?? []).filter((g: GiftItem) => g.type === "virtual")));
    }
  }, [step, gifts.length]);

  const sendRequest = useCallback(async (withGift: GiftItem | null) => {
    setSending(true);
    try {
      // 1. Create the connect request
      const res = await fetch("/api/matches/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profile.user_id }),
      });
      const d = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.info("You already have a connection with this profile.");
          onClose();
          return;
        }
        if (res.status === 429) {
          toast.error(d.error ?? "Daily limit reached. Upgrade to continue.");
          onClose();
          return;
        }
        toast.error(d.error ?? "Failed to send request.");
        return;
      }

      const mid: string = d.matchId;
      setMatchId(mid);

      // 2. Send gift if selected
      if (withGift) {
        const giftRes = await fetch("/api/gifts/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftId: withGift.id,
            recipientId: profile.user_id,
            useTokens: true,
          }),
        });
        if (!giftRes.ok) {
          const gd = await giftRes.json();
          toast.error(gd.error ?? "Request sent, but gift failed.");
        }
      }

      setStep("done");
      onSuccess(mid);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSending(false);
    }
  }, [profile.user_id, onClose, onSuccess]);

  const age = getAge(profile.date_of_birth);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 bg-[#111] border border-champagne/20 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full overflow-hidden border border-champagne/20">
                  <ProfilePlaceholder seed={profile.user_id} width={40} height={40} className="w-full h-full" />
                </div>
                <div>
                  <div className="text-body-sm text-ivory font-medium">{profile.display_name}</div>
                  <div className="text-label text-ivory/40">
                    {[age ? `${age}` : null, profile.location_city].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-ivory/30 hover:text-ivory transition-colors">
                <X className="size-5" />
              </button>
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
              {step === "intent" && (
                <motion.div
                  key="intent"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="px-6 pb-6 space-y-3"
                >
                  <p className="text-body-sm text-ivory/60 pb-1">
                    How would you like to reach out?
                  </p>

                  <button
                    onClick={() => sendRequest(null)}
                    disabled={sending}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-champagne/20 hover:border-champagne/40 hover:bg-smoke/60 transition-all text-left group"
                  >
                    <div className="size-10 rounded-full bg-smoke flex items-center justify-center shrink-0">
                      <Zap className="size-4 text-ivory/50 group-hover:text-champagne transition-colors" />
                    </div>
                    <div>
                      <div className="text-body-sm text-ivory font-medium">Just Connect</div>
                      <div className="text-label text-ivory/40">Send a standard connect request</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep("gift")}
                    disabled={sending}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-champagne/30 bg-champagne/5 hover:bg-champagne/10 hover:border-champagne/50 transition-all text-left group"
                  >
                    <div className="size-10 rounded-full bg-champagne/15 flex items-center justify-center shrink-0">
                      <Gift className="size-4 text-champagne" />
                    </div>
                    <div>
                      <div className="text-body-sm text-champagne font-medium">Send with a Gift →</div>
                      <div className="text-label text-ivory/40">Get priority response · Stand out</div>
                    </div>
                  </button>
                </motion.div>
              )}

              {step === "gift" && (
                <motion.div
                  key="gift"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="px-6 pb-6 space-y-4"
                >
                  {/* Token balance */}
                  <div className="flex items-center justify-between">
                    <p className="text-body-sm text-ivory/60">Choose a gift</p>
                    <div className="flex items-center gap-1.5 text-label text-champagne">
                      <Coins className="size-3.5" />
                      <span>{tokenBalance} tokens</span>
                      {tokenBalance === 0 && (
                        <Link href="/tokens" onClick={onClose} className="text-ivory/30 hover:text-ivory underline ml-1">
                          Get tokens
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Gift grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {gifts.length === 0
                      ? [1, 2, 3].map((i) => (
                          <div key={i} className="h-20 rounded-xl bg-smoke animate-pulse" />
                        ))
                      : gifts.map((g) => {
                          const canAfford = tokenBalance >= (g.token_cost ?? 0);
                          const selected = selectedGift?.id === g.id;
                          return (
                            <button
                              key={g.id}
                              onClick={() => setSelectedGift(selected ? null : g)}
                              disabled={!canAfford}
                              className={cn(
                                "flex flex-col items-center gap-1 px-2 py-3 rounded-xl border transition-all",
                                selected
                                  ? "border-champagne bg-champagne/10"
                                  : canAfford
                                  ? "border-champagne/20 hover:border-champagne/40 hover:bg-smoke/60"
                                  : "border-champagne/10 opacity-40 cursor-not-allowed"
                              )}
                            >
                              <span className="text-2xl">{giftEmoji(g.name)}</span>
                              <span className="text-[11px] text-ivory/70 text-center leading-tight">{g.name}</span>
                              <span className="text-[10px] text-champagne">{g.token_cost}T</span>
                              {selected && <Check className="size-3 text-champagne" />}
                            </button>
                          );
                        })}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <GoldCtaButton
                      className="w-full"
                      onClick={() => sendRequest(selectedGift)}
                      disabled={sending || !selectedGift}
                    >
                      {sending ? "Sending…" : selectedGift ? `Send ${selectedGift.name} + Connect` : "Select a gift"}
                    </GoldCtaButton>
                    <button
                      onClick={() => sendRequest(null)}
                      disabled={sending}
                      className="w-full text-label text-ivory/40 hover:text-ivory/70 transition-colors py-1"
                    >
                      Skip gift, just connect
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-6 pb-8 text-center space-y-3"
                >
                  <div className="text-4xl py-2">✨</div>
                  <div className="text-body-md text-ivory font-medium">Request sent!</div>
                  <p className="text-body-sm text-ivory/50">
                    {profile.display_name} will be notified. You'll both be matched if she accepts.
                  </p>
                  <div className="pt-2 space-y-2">
                    <Link href="/matches">
                      <Button variant="outline" className="w-full border-champagne/30 text-ivory/70 rounded-full" onClick={onClose}>
                        View in Matches
                      </Button>
                    </Link>
                    <button onClick={onClose} className="w-full text-label text-ivory/30 hover:text-ivory/50 transition-colors py-1">
                      Continue browsing
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
