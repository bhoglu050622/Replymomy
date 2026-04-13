"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { cn } from "@/lib/utils";

const SPECIALTIES = [
  "Fine Dining",
  "Travel",
  "Arts & Culture",
  "Wellness",
  "Fashion",
  "Motorsport",
  "Aviation",
  "Yachting",
  "Events",
  "Intellectual",
  "Adventure",
  "Business",
];

export default function MommyProfilePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleSpecialty(s: string) {
    setSpecialties((prev) =>
      prev.includes(s)
        ? prev.filter((x) => x !== s)
        : prev.length < 4
          ? [...prev, s]
          : prev
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (specialties.length < 1) { setError("Select at least one specialty."); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          headline,
          desires: specialties,
          photo_urls: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile.");
        setLoading(false);
        return;
      }

      router.push("/mommy-preferences");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="text-label text-champagne">Step 03</div>
        <h1 className="text-display-lg text-ivory">
          Your
          <br />
          <span className="italic text-champagne">presence.</span>
        </h1>
        <p className="text-body-sm text-ivory/50 max-w-xs mx-auto">
          This is how the guild sees you. Make it count.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Display name */}
        <div>
          <label className="text-label text-ivory/50 mb-2 block">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How the guild knows you"
            required
            className="h-12 bg-smoke border-champagne/30 text-ivory rounded-full px-5"
          />
        </div>

        {/* Headline */}
        <div>
          <label className="text-label text-ivory/50 mb-2 block">
            Headline <span className="text-ivory/30">(shown on your card)</span>
          </label>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value.slice(0, 80))}
            placeholder="Art collector. Tokyo & NYC."
            className="h-12 bg-smoke border-champagne/30 text-ivory rounded-full px-5"
          />
          <div className="text-right text-label text-ivory/30 mt-1">{headline.length}/80</div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-label text-ivory/50 mb-2 block">About You</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the guild who you are. Your story, your world, your terms..."
            rows={5}
            className="bg-smoke border-champagne/30 text-ivory rounded-2xl p-4"
          />
        </div>

        {/* Specialties */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">
            Specialties <span className="text-ivory/30">(up to 4)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => {
              const active = specialties.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={cn(
                    "px-4 py-2 rounded-full text-body-sm border transition-all",
                    active
                      ? "bg-champagne text-obsidian border-champagne"
                      : "bg-smoke text-ivory/70 border-champagne/20 hover:border-champagne/50"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-body-sm text-red-400 text-center">{error}</p>
        )}

        <GoldCtaButton
          type="submit"
          disabled={loading || !displayName || specialties.length === 0}
          className="w-full"
        >
          {loading ? "Saving..." : "Continue"}
        </GoldCtaButton>
      </form>
    </div>
  );
}
