"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Heart, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";

interface MatchCardPreviewProps {
  matchId: string;
  name: string;
  age: number;
  city: string;
  desire: string;
  matchScore: number;
  photoUrl?: string | null;
  alreadyResponded?: boolean;
  status?: string;
}

export function MatchCardPreview({
  matchId,
  name,
  age,
  city,
  desire,
  matchScore,
  photoUrl,
  alreadyResponded,
  status,
}: MatchCardPreviewProps) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [responding, setResponding] = useState<"accept" | "decline" | null>(null);

  async function respond(action: "accepted" | "declined") {
    setResponding(action === "accepted" ? "accept" : "decline");
    try {
      const res = await fetch("/api/matches/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, response: action }),
      });
      const data = await res.json();
      if (data.isMutual) {
        router.push(`/chat/${data.streamChannelId}`);
      } else {
        router.push(`/matches/${matchId}`);
      }
    } finally {
      setResponding(null);
    }
  }

  if (status === "mutual") {
    return (
      <motion.div
        className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-champagne/40 bg-gradient-to-b from-burgundy via-smoke to-obsidian"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill className="object-cover" />
        ) : (
          <ProfilePlaceholder seed={matchId} width={300} height={400} className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-champagne text-obsidian text-label">
          Mutual
        </div>
        <div className="absolute bottom-0 inset-x-0 p-6 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl text-ivory">{name}</span>
            <span className="text-body-md text-ivory/60">{age}</span>
          </div>
          <div className="flex items-center gap-2 text-label text-champagne">
            <span>{city}</span>
            {desire && (
              <>
                <span className="size-1 rounded-full bg-champagne" />
                <span>{desire}</span>
              </>
            )}
          </div>
          <Button
            variant="gold"
            className="w-full h-11 rounded-full"
            onClick={() => router.push(`/matches/${matchId}`)}
          >
            <MessageCircle className="size-4 mr-2" />
            Chat
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-champagne/20 bg-gradient-to-b from-burgundy via-smoke to-obsidian"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={revealed ? name : "Tonight's match"}
          fill
          className={cn("object-cover transition-all duration-700", !revealed && "blur-xl")}
        />
      ) : (
        <ProfilePlaceholder
          seed={matchId}
          width={300}
          height={400}
          className={cn("w-full h-full transition-all duration-700", !revealed && "blur-xl")}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

      {/* Top: match score */}
      <motion.div
        className={cn(
          "absolute top-4 right-4 px-3 py-1 rounded-full bg-champagne/20 backdrop-blur-md border",
          matchScore >= 80 ? "border-champagne/60 shadow-gold-glow" : "border-champagne/40"
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-label text-champagne">{matchScore}% match</span>
      </motion.div>

      {/* Bottom: info */}
      <div className="absolute bottom-0 inset-x-0 p-6 space-y-3">
        {!revealed ? (
          <>
            <div className="font-headline text-2xl text-ivory italic">
              Tonight&apos;s curation
            </div>
            <p className="text-body-sm text-ivory/60">
              Reveal her — if you&apos;re ready.
            </p>
            <Button
              onClick={() => setRevealed(true)}
              variant="gold-outline"
              className="w-full h-10 rounded-full text-xs"
            >
              Reveal
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl text-ivory">{name}</span>
              <span className="text-body-md text-ivory/60">{age}</span>
            </div>
            <div className="flex items-center gap-2 text-label text-champagne">
              <span>{city}</span>
              {desire && (
                <>
                  <span className="size-1 rounded-full bg-champagne" />
                  <span>{desire}</span>
                </>
              )}
            </div>
            {alreadyResponded ? (
              <Button
                variant="gold-outline"
                className="w-full h-11 rounded-full text-xs"
                onClick={() => router.push(`/matches/${matchId}`)}
              >
                View Details
              </Button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="flex-1 h-11 rounded-full border-ivory/20 text-ivory/60 hover:text-ivory"
                  onClick={() => respond("declined")}
                  disabled={responding !== null}
                >
                  <X className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="gold"
                  className="flex-1 h-11 rounded-full"
                  onClick={() => respond("accepted")}
                  disabled={responding !== null}
                >
                  <Heart className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
