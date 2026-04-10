"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOTS = ["Morning", "Afternoon", "Evening", "Late Night"];

export default function CalendarPage() {
  const [grid, setGrid] = useState<boolean[][]>(
    DAYS.map(() => SLOTS.map(() => false))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/mommy/calendar")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.slots) && data.slots.length === 7) {
          setGrid(data.slots);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(d: number, s: number) {
    setSaved(false);
    setGrid((g) => {
      const next = g.map((r) => [...r]);
      next[d][s] = !next[d][s];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/mommy/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: grid }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Availability</div>
        <h1 className="text-display-lg text-ivory">
          Your <span className="italic text-champagne">hours.</span>
        </h1>
        <p className="text-body-md text-ivory/60 mt-2">
          Set when you&apos;re available.
        </p>
      </div>

      {loading ? (
        <div className="h-48 rounded-2xl bg-smoke animate-pulse mb-10" />
      ) : (
        <div className="grid grid-cols-8 gap-2 mb-10">
          <div />
          {DAYS.map((d) => (
            <div key={d} className="text-label text-ivory/40 text-center">
              {d}
            </div>
          ))}

          {SLOTS.map((slot, sIdx) => (
            <>
              <div
                key={`${slot}-label`}
                className="text-label text-ivory/40 self-center text-right pr-2"
              >
                {slot}
              </div>
              {DAYS.map((d, dIdx) => (
                <button
                  key={`${slot}-${d}`}
                  onClick={() => toggle(dIdx, sIdx)}
                  className={`aspect-square rounded-lg border transition-all ${
                    grid[dIdx]?.[sIdx]
                      ? "bg-champagne border-champagne"
                      : "bg-smoke border-champagne/10 hover:border-champagne/30"
                  }`}
                />
              ))}
            </>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="gold"
          className="h-11 rounded-full px-8 text-xs"
          onClick={save}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        {saved && <span className="text-label text-champagne">Saved.</span>}
      </div>
    </div>
  );
}
