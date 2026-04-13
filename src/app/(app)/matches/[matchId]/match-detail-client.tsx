"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, X, Gift, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExpiryCountdown } from "@/components/matches/expiry-countdown";
import { IcebreakerDialog } from "@/components/matches/icebreaker-dialog";
import Image from "next/image";

interface Props {
  matchId: string;
  status: string;
  expiresAt: string;
  streamChannelId: string | null;
  alreadyResponded: boolean;
  isMember: boolean;
  matchIntro: string | null;
  profile: {
    displayName: string;
    age: number;
    city: string;
    bio: string;
    desires: string[];
    photoUrls: string[];
    tier: string;
  };
}

export function MatchDetailClient({
  matchId,
  status,
  expiresAt,
  streamChannelId,
  alreadyResponded,
  isMember,
  matchIntro,
  profile,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function respond(action: "accepted" | "declined") {
    setLoading(action === "accepted" ? "accept" : "decline");

    try {
      const res = await fetch("/api/matches/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, response: action }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        return;
      }

      if (data.isMutual) {
        router.push(`/chat/${data.matchId}`);
      } else {
        router.push("/matches");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  }

  const tierLabel: Record<string, string> = {
    standard: "Standard",
    elite: "Elite",
    icon: "Icon",
  };

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="text-label text-champagne mb-2">
          Match #{matchId.slice(0, 6)}
        </div>
        <ExpiryCountdown expiresAt={expiresAt} />
      </div>

      {/* Photo */}
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-burgundy via-smoke to-obsidian border border-champagne/30 mb-8 relative overflow-hidden">
        {profile.photoUrls[0] ? (
          <Image
            src={profile.photoUrls[0]}
            alt={profile.displayName}
            fill
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-8">
          <h1 className="font-headline text-5xl text-ivory mb-2">
            {profile.displayName}
          </h1>
          <div className="flex items-center gap-3 text-body-md text-ivory/70">
            {profile.age > 0 && <span>{profile.age}</span>}
            {profile.city && (
              <>
                <span className="size-1 rounded-full bg-champagne" />
                <span>{profile.city}</span>
              </>
            )}
            {profile.tier && (
              <>
                <span className="size-1 rounded-full bg-champagne" />
                <span>{tierLabel[profile.tier] ?? profile.tier}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-8">
          <div className="text-label text-champagne mb-3">About</div>
          <p className="text-body-lg text-ivory/80 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Interests */}
      {profile.desires.length > 0 && (
        <div className="mb-10">
          <div className="text-label text-champagne mb-3">Interests</div>
          <div className="flex flex-wrap gap-2">
            {profile.desires.map((d) => (
              <span
                key={d}
                className="px-4 py-2 rounded-full text-body-sm bg-smoke border border-champagne/30 text-champagne"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Match Intro */}
      {matchIntro && isMember && (
        <div className="mb-8 p-5 rounded-2xl bg-champagne/5 border border-champagne/20">
          <p className="text-label text-champagne mb-2 uppercase tracking-widest">Why you matched</p>
          <p className="text-body-sm text-ivory/70 italic leading-relaxed">{matchIntro}</p>
        </div>
      )}

      {/* Actions */}
      {status === "mutual" && streamChannelId ? (
        <div className="space-y-3">
          <Button
            variant="gold"
            className="w-full h-14 rounded-full"
            onClick={() => router.push(`/chat/${streamChannelId}`)}
          >
            <MessageCircle className="size-4 mr-2" />
            Go to Chat
          </Button>
          {isMember && <IcebreakerDialog matchId={matchId} />}
        </div>
      ) : alreadyResponded ? (
        <div className="text-center text-label text-ivory/40 py-4">
          You&apos;ve responded. Waiting for her.
        </div>
      ) : isMember ? (
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="h-14 rounded-full border-ivory/20 text-ivory/60"
            onClick={() => respond("declined")}
            disabled={loading !== null}
          >
            <X className="size-4 mr-2" />
            {loading === "decline" ? "..." : "Pass"}
          </Button>
          <Button
            variant="outline"
            className="h-14 rounded-full border-champagne/30 text-champagne"
            onClick={() => router.push(`/gifts?recipient=${matchId}`)}
            disabled={loading !== null}
          >
            <Gift className="size-4 mr-2" />
            Gift
          </Button>
          <Button
            variant="gold"
            className="h-14 rounded-full"
            onClick={() => respond("accepted")}
            disabled={loading !== null}
          >
            <Heart className="size-4 mr-2" />
            {loading === "accept" ? "..." : "Accept"}
          </Button>
        </div>
      ) : (
        <div className="text-center text-label text-ivory/40 py-4">
          Waiting for the member to respond.
        </div>
      )}
    </div>
  );
}
