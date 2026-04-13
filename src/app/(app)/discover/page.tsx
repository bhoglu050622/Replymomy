"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Compass, Sparkles } from "lucide-react";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";
import { ConnectGiftModal, type DiscoverProfile } from "@/components/discover/connect-gift-modal";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { differenceInDays } from "date-fns";

const NEW_THRESHOLD_DAYS = 7;

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

interface Profile extends DiscoverProfile {
  bio: string | null;
  photo_urls: string[] | null;
  created_at: string;
}

export default function DiscoverPage() {
  const tier = useUserStore((s) => s.memberTier);
  const tokenBalance = useUserStore((s) => s.tokenBalance) ?? 0;
  const role = useUserStore((s) => s.role);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newOnly, setNewOnly] = useState(false);

  // Modal state
  const [modalProfile, setModalProfile] = useState<Profile | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const fetchProfiles = useCallback(async (cur?: string) => {
    const params = new URLSearchParams();
    if (cur) params.set("cursor", cur);
    const res = await fetch(`/api/discover?${params}`);
    const d = await res.json();
    return d as { profiles: Profile[]; nextCursor: string | null };
  }, []);

  useEffect(() => {
    fetchProfiles().then((d) => {
      setProfiles(d.profiles);
      setCursor(d.nextCursor);
      setHasMore(!!d.nextCursor);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetchProfiles]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const d = await fetchProfiles(cursor);
    setProfiles((prev) => [...prev, ...d.profiles]);
    setCursor(d.nextCursor);
    setHasMore(!!d.nextCursor);
    setLoadingMore(false);
  }

  function onConnected(matchId: string) {
    if (modalProfile) {
      setConnectedIds((prev) => new Set([...prev, modalProfile.user_id]));
    }
    void matchId;
  }

  const filtered = newOnly
    ? profiles.filter((p) => differenceInDays(new Date(), new Date(p.created_at)) <= NEW_THRESHOLD_DAYS)
    : profiles;

  const isFree = role === "member" && !tier;

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 pb-28 lg:pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-label text-champagne mb-3">
          <Compass className="size-3.5" />
          <span>Discovery</span>
        </div>
        <h1 className="text-display-lg text-ivory">
          New <span className="italic text-champagne">faces.</span>
        </h1>
        <p className="text-body-sm text-ivory/40 mt-2">
          Recently joined — reach out before everyone else does.
        </p>
      </div>

      {/* Free user upgrade banner */}
      {isFree && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-champagne/5 border border-champagne/20 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="size-4 text-champagne shrink-0" />
            <div>
              <p className="text-body-sm text-ivory font-medium">Unlock daily curated matches</p>
              <p className="text-label text-ivory/40">You can send up to 5 requests/day on free. Upgrade for unlimited + curated matches.</p>
            </div>
          </div>
          <Link href="/settings/subscription" className="shrink-0">
            <Button variant="gold" size="sm" className="rounded-full text-xs px-4">
              Upgrade
            </Button>
          </Link>
        </motion.div>
      )}

      {/* "NEW only" filter toggle */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setNewOnly(false)}
          className={cn(
            "text-label px-4 py-1.5 rounded-full border transition-all",
            !newOnly
              ? "bg-champagne/10 border-champagne/30 text-champagne"
              : "border-champagne/10 text-ivory/40 hover:border-champagne/20 hover:text-ivory/60"
          )}
        >
          All recent
        </button>
        <button
          onClick={() => setNewOnly(true)}
          className={cn(
            "text-label px-4 py-1.5 rounded-full border transition-all flex items-center gap-1.5",
            newOnly
              ? "bg-champagne/10 border-champagne/30 text-champagne"
              : "border-champagne/10 text-ivory/40 hover:border-champagne/20 hover:text-ivory/60"
          )}
        >
          <span className="size-1.5 rounded-full bg-current" />
          New this week
        </button>
      </div>

      {/* Profile grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-smoke animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Compass className="size-10 text-ivory/10 mx-auto mb-3" />
          <p className="text-body-md text-ivory/30">
            {newOnly ? "No new profiles this week." : "No profiles to discover yet."}
          </p>
          {newOnly && (
            <button onClick={() => setNewOnly(false)} className="text-label text-champagne/70 hover:text-champagne mt-2 transition-colors">
              Show all recent
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p, i) => {
              const isNew = differenceInDays(new Date(), new Date(p.created_at)) <= NEW_THRESHOLD_DAYS;
              const age = getAge(p.date_of_birth);
              const connected = connectedIds.has(p.user_id);

              return (
                <motion.div
                  key={p.user_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="relative rounded-3xl bg-smoke border border-champagne/10 overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Photo / placeholder */}
                  <div className="aspect-[3/4] relative overflow-hidden bg-obsidian">
                    {p.photo_urls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photo_urls[0]}
                        alt={p.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProfilePlaceholder
                        seed={p.user_id}
                        width={400}
                        height={533}
                        className="w-full h-full"
                      />
                    )}

                    {/* NEW badge */}
                    {isNew && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-champagne text-obsidian text-[10px] font-bold uppercase tracking-widest">
                        New
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent" />

                    {/* Name + info */}
                    <div className="absolute bottom-0 inset-x-0 p-4 space-y-1">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-body-sm text-ivory font-semibold leading-tight">
                            {p.display_name}{age ? `, ${age}` : ""}
                          </div>
                          {p.location_city && (
                            <div className="text-[11px] text-ivory/50">{p.location_city}</div>
                          )}
                        </div>
                      </div>

                      {/* Desires chips */}
                      {p.desires && p.desires.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.desires.slice(0, 2).map((d) => (
                            <span
                              key={d}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-champagne/10 border border-champagne/20 text-champagne/80"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connect button */}
                  <div className="p-3">
                    {connected ? (
                      <div className="w-full py-2.5 rounded-xl bg-smoke border border-champagne/20 text-label text-champagne/60 text-center">
                        Request sent ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => setModalProfile(p)}
                        className="w-full py-2.5 rounded-xl bg-champagne/10 border border-champagne/30 hover:bg-champagne/20 hover:border-champagne/50 text-label text-champagne transition-all font-medium"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="border-champagne/20 text-ivory/60 rounded-full px-8"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Connect + Gift modal */}
      {modalProfile && (
        <ConnectGiftModal
          open={!!modalProfile}
          onClose={() => setModalProfile(null)}
          profile={modalProfile}
          tokenBalance={tokenBalance}
          onSuccess={onConnected}
        />
      )}
    </div>
  );
}
