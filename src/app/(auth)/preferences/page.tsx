"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";

const INTERESTS = [
  "Art",
  "Travel",
  "Wine",
  "Music",
  "Literature",
  "Theater",
  "Fashion",
  "Yacht",
  "Aviation",
];

const CITIES = ["NYC", "Miami", "LA", "London", "Paris", "Dubai", "Tokyo"];

export default function PreferencesPage() {
  const router = useRouter();
  const [ageMin, setAgeMin] = useState(25);
  const [ageMax, setAgeMax] = useState(45);
  const [interests, setInterests] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggle(arr: string[], v: string, set: (v: string[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
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
          preferred_interests: interests,
          preferred_locations: cities,
        }),
      });

      if (!profileRes.ok) {
        setLoading(false);
        return;
      }

      // Activate the account
      await fetch("/api/user/activate", { method: "POST" });
      router.push("/welcome");
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
          <span className="italic text-champagne">preferences.</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="text-label text-ivory/50 mb-3 block">
            Age range: {ageMin} – {ageMax}
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min="18"
              max="80"
              value={ageMin}
              onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax - 1))}
              className="flex-1 accent-champagne"
            />
            <input
              type="range"
              min="18"
              max="80"
              value={ageMax}
              onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin + 1))}
              className="flex-1 accent-champagne"
            />
          </div>
        </div>

        <div>
          <label className="text-label text-ivory/50 mb-3 block">Cities</label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggle(cities, c, setCities)}
                className={`px-4 py-2 rounded-full text-body-sm border transition-all ${
                  cities.includes(c)
                    ? "bg-champagne text-obsidian border-champagne"
                    : "bg-smoke text-ivory/70 border-champagne/20 hover:border-champagne/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-label text-ivory/50 mb-3 block">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggle(interests, i, setInterests)}
                className={`px-4 py-2 rounded-full text-body-sm border transition-all ${
                  interests.includes(i)
                    ? "bg-champagne text-obsidian border-champagne"
                    : "bg-smoke text-ivory/70 border-champagne/20 hover:border-champagne/50"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <GoldCtaButton type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Finish"}
        </GoldCtaButton>
      </form>
    </div>
  );
}
