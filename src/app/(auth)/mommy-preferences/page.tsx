"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { cn } from "@/lib/utils";
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
  const [maxMatches, setMaxMatches] = useState(3);
  const [responseTime, setResponseTime] = useState("24h");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: {
        preferred_age_min: number;
        preferred_age_max: number;
        max_active_matches: number;
        response_commitment: string;
      } = {
        preferred_age_min: ageMin,
        preferred_age_max: ageMax,
        max_active_matches: maxMatches,
        response_commitment: responseTime,
      };

      const profileRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!profileRes.ok) {
        const d = await profileRes.json().catch(() => ({}));
        setError(d.error ?? "Failed to save preferences. Try again.");
        setLoading(false);
        return;
      }

      const activateRes = await fetch("/api/user/activate", { method: "POST" });
      if (!activateRes.ok) {
        const d = await activateRes.json().catch(() => ({}));
        setError(d.error ?? "Failed to activate account. Try again.");
        setLoading(false);
        return;
      }

      router.push("/welcome?role=mommy");
    } catch {
      setError("Something went wrong. Try again.");
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

        {error && (
          <p className="text-body-sm text-red-400 text-center">{error}</p>
        )}

        <GoldCtaButton type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Enter the Guild"}
        </GoldCtaButton>
      </form>
    </div>
  );
}
