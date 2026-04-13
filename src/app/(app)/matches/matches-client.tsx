"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MessageCircle, Check, X } from "lucide-react";

interface MatchRow {
  id: string;
  status: string;
  created_at: string;
  mommy_id: string;
  member_id: string;
  profiles: { display_name: string } | null;
}

interface IncomingRequest {
  matchId: string;
  requestedAt: string;
  member: {
    userId: string;
    displayName: string;
    city: string | null;
    dateOfBirth: string | null;
    desires: string[];
    headline: string | null;
  };
  giftName: string | null;
}

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function statusStyle(s: string) {
  if (s === "mutual") return "bg-champagne/20 text-champagne";
  if (s === "pending") return "bg-smoke border border-champagne/20 text-ivory/60";
  return "bg-smoke text-ivory/30";
}

interface Props {
  matches: MatchRow[];
  role: string;
  userId: string;
}

export function MatchesClient({ matches, role, userId }: Props) {
  const [tab, setTab] = useState<"matches" | "requests">("matches");
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);

  const isMommy = role === "mommy";

  const loadRequests = useCallback(async () => {
    if (!isMommy) return;
    setReqLoading(true);
    try {
      const res = await fetch("/api/matches/incoming");
      const d = await res.json();
      setRequests(d.requests ?? []);
    } finally {
      setReqLoading(false);
    }
  }, [isMommy]);

  useEffect(() => {
    if (tab === "requests") loadRequests();
  }, [tab, loadRequests]);

  async function respond(matchId: string, response: "accepted" | "declined") {
    setResponding(matchId);
    try {
      const res = await fetch("/api/matches/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, response }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? "Failed");
        return;
      }
      if (response === "accepted") {
        toast.success("Match accepted! Chat is now open.");
      }
      // Optimistically remove from requests list
      setRequests((prev) => prev.filter((r) => r.matchId !== matchId));
    } finally {
      setResponding(null);
    }
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">History</div>
        <h1 className="text-display-lg text-ivory">
          All <span className="italic text-champagne">matches.</span>
        </h1>
      </div>

      {/* Tabs — only shown for mommies */}
      {isMommy && (
        <div className="flex items-center gap-1 mb-8 border-b border-champagne/10">
          <button
            onClick={() => setTab("matches")}
            className={cn(
              "px-5 py-3 text-body-sm border-b-2 transition-all -mb-px",
              tab === "matches"
                ? "border-champagne text-champagne"
                : "border-transparent text-ivory/50 hover:text-ivory"
            )}
          >
            My Matches
          </button>
          <button
            onClick={() => setTab("requests")}
            className={cn(
              "px-5 py-3 text-body-sm border-b-2 transition-all -mb-px flex items-center gap-2",
              tab === "requests"
                ? "border-champagne text-champagne"
                : "border-transparent text-ivory/50 hover:text-ivory"
            )}
          >
            Requests
            {requests.length > 0 && (
              <span className="size-4 rounded-full bg-champagne text-obsidian text-[10px] font-bold flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {tab === "matches" && (
          <motion.div
            key="matches"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {matches.length === 0 ? (
              <EmptyState variant="matches" />
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all"
                  >
                    <div className="relative size-14 rounded-full border border-champagne/30 overflow-hidden shrink-0">
                      <ProfilePlaceholder seed={m.id} width={56} height={56} className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-headline text-xl text-ivory">
                        {m.profiles?.display_name ?? "Anonymous"}
                      </div>
                      <div className="text-label text-ivory/40">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className={`text-label px-3 py-1 rounded-full ${statusStyle(m.status)}`}>
                      {m.status}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "requests" && (
          <motion.div
            key="requests"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {reqLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-smoke animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-24">
                <MessageCircle className="size-10 text-ivory/10 mx-auto mb-3" />
                <p className="text-body-md text-ivory/30">No pending requests.</p>
                <p className="text-label text-ivory/20 mt-1">
                  Members who find you in Discover can send connect requests here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => {
                  const age = getAge(r.member.dateOfBirth);
                  return (
                    <motion.div
                      key={r.matchId}
                      layout
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/10"
                    >
                      <div className="relative size-14 rounded-full border border-champagne/30 overflow-hidden shrink-0">
                        <ProfilePlaceholder seed={r.member.userId} width={56} height={56} className="w-full h-full" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-xl text-ivory">
                            {r.member.displayName}
                            {age ? `, ${age}` : ""}
                          </span>
                          {r.giftName && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-champagne/15 border border-champagne/30 text-champagne">
                              🎁 {r.giftName}
                            </span>
                          )}
                        </div>
                        <div className="text-label text-ivory/40">
                          {[r.member.city, r.member.headline].filter(Boolean).join(" · ")}
                        </div>
                        <div className="text-[10px] text-ivory/20 mt-0.5">
                          {formatDistanceToNow(new Date(r.requestedAt), { addSuffix: true })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => respond(r.matchId, "declined")}
                          disabled={responding === r.matchId}
                          className="size-10 rounded-full border border-champagne/10 hover:border-red-500/40 hover:bg-red-500/10 flex items-center justify-center text-ivory/30 hover:text-red-400 transition-all"
                        >
                          <X className="size-4" />
                        </button>
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => respond(r.matchId, "accepted")}
                          disabled={responding === r.matchId}
                          className="rounded-full px-4"
                        >
                          <Check className="size-3.5 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
