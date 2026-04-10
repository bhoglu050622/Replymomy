"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { cn } from "@/lib/utils";

const CITIES = ["NYC", "Miami", "LA", "London", "Paris", "Dubai", "Tokyo", "Singapore", "Sydney"];
const MEMBER_TIERS = [
  { value: "gold", label: "Gold", desc: "Founding members" },
  { value: "platinum", label: "Platinum", desc: "Most popular" },
  { value: "black_card", label: "Black Card", desc: "Ultra premium" },
];
const MAX_MATCHES = [
  { value: 1, label: "1", desc: "Exclusive focus" },
  { value: 3, label: "3", desc: "Balanced" },
  { value: 5, label: "5", desc: "Open" },
  { value: 99, label: "∞", desc: "Unlimited" },
];
const RESPONSE = [
  { value: "same_day", label: "Same Day", desc: "High commitment" },
  { value: "24h", label: "24h", desc: "Standard" },
  { value: "48h", label: "48h", desc: "Relaxed" },
];

export default function MommyPreferencesPage() {
  const router = useRouter();
  const [ageMin, setAgeMin] = useState(28);
  const [ageMax, setAgeMax] = useState(50);
  const [tiers, setTiers] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [maxMatches, setMaxMatches] = useState(3);
  const [responseTime, setResponseTime] = useState("24h");
  const [loading, setLoading] = useState(false);

  function toggleTier(v: string) {
    setTiers((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  }
  function toggleCity(v: string) {
    setCities((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const profileRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferred_age_min: ageMin,
          preferred_age_max: ageMax,
          preferred_locations: cities,
          preferred_member_tiers: tiers.length > 0 ? tiers : ["gold", "platinum", "black_card"],
          max_active_matches: maxMatches,
          response_commitment: responseTime,
        }),
      });

      if (!profileRes.ok) {
        setLoading(false);
        return;
      }

      await fetch("/api/user/activate", { method: "POST" });
      router.push("/welcome?role=mommy");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="text-label text-champagne">Step 04</div>
        <h1 className="text-display-lg text-ivory">
          Your
          <br />
          <span className="italic text-champagne">terms.</span>
        </h1>
        <p className="text-body-sm text-ivory/50 max-w-xs mx-auto">
          Set the conditions under which you operate. You are in control.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Member age range */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">
            Preferred member age: {ageMin}–{ageMax}
          </label>
          <div className="flex gap-4">
            <input
              type="range" min="21" max="75"
              value={ageMin}
              onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax - 1))}
              className="flex-1 accent-champagne"
            />
            <input
              type="range" min="21" max="75"
              value={ageMax}
              onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin + 1))}
              className="flex-1 accent-champagne"
            />
          </div>
        </div>

        {/* Member tier preference */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">
            Accept members from <span className="text-ivory/30">(leave blank for all tiers)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MEMBER_TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTier(t.value)}
                className={cn(
                  "p-3 rounded-2xl border-2 text-center transition-all",
                  tiers.includes(t.value)
                    ? "bg-champagne/10 border-champagne text-champagne"
                    : "bg-smoke border-champagne/20 hover:border-champagne/40 text-ivory/70"
                )}
              >
                <div className="text-body-sm font-medium">{t.label}</div>
                <div className="text-[10px] text-current/60 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Available cities */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">Your cities</label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCity(c)}
                className={cn(
                  "px-4 py-2 rounded-full text-body-sm border transition-all",
                  cities.includes(c)
                    ? "bg-champagne text-obsidian border-champagne"
                    : "bg-smoke text-ivory/70 border-champagne/20 hover:border-champagne/50"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Max active matches */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">Max active matches</label>
          <div className="grid grid-cols-4 gap-2">
            {MAX_MATCHES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMaxMatches(m.value)}
                className={cn(
                  "p-3 rounded-2xl border-2 text-center transition-all",
                  maxMatches === m.value
                    ? "bg-champagne/10 border-champagne text-champagne"
                    : "bg-smoke border-champagne/20 hover:border-champagne/40 text-ivory/70"
                )}
              >
                <div className="font-headline text-xl">{m.label}</div>
                <div className="text-[10px] mt-0.5 text-current/60">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Response commitment */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">Response commitment</label>
          <div className="grid grid-cols-3 gap-2">
            {RESPONSE.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setResponseTime(r.value)}
                className={cn(
                  "p-3 rounded-2xl border-2 text-center transition-all",
                  responseTime === r.value
                    ? "bg-champagne/10 border-champagne text-champagne"
                    : "bg-smoke border-champagne/20 hover:border-champagne/40 text-ivory/70"
                )}
              >
                <div className="text-body-sm font-medium">{r.label}</div>
                <div className="text-[10px] mt-0.5 text-current/60">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <GoldCtaButton type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Enter the Guild"}
        </GoldCtaButton>
      </form>
    </div>
  );
}
