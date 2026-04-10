"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const NOTIFICATION_SETTINGS = [
  { key: "newMatch", label: "New match", desc: "When you receive a daily match" },
  { key: "mutualMatch", label: "Mutual match", desc: "When they accept too." },
  { key: "newMessage", label: "New message", desc: "When a match sends you a message" },
  { key: "giftReceived", label: "Gift received", desc: "When someone sends you a gift" },
  { key: "spotlight", label: "Spotlight", desc: "When you're featured as Mommy of the Week" },
  { key: "payoutReady", label: "Payout ready", desc: "When earnings are available to withdraw" },
];

const DEFAULTS: Record<string, boolean> = {
  newMatch: true,
  mutualMatch: true,
  newMessage: true,
  giftReceived: true,
  spotlight: true,
  payoutReady: true,
};

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile?.notification_preferences) {
          setSettings({ ...DEFAULTS, ...profile.notification_preferences });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(key: string) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_preferences: settings }),
      });
      if (res.ok) {
        toast.success("Notification preferences saved.");
      } else {
        toast.error("Failed to save.");
      }
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Alerts</div>
        <h1 className="text-display-lg text-ivory">
          <span className="italic text-champagne">Notifications.</span>
        </h1>
      </div>

      {loading ? (
        <div className="space-y-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-smoke animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {NOTIFICATION_SETTINGS.map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between p-5 rounded-2xl bg-smoke border border-champagne/10"
            >
              <div>
                <div className="text-body-md text-ivory">{n.label}</div>
                <div className="text-label text-ivory/40">{n.desc}</div>
              </div>
              <button
                role="switch"
                aria-checked={settings[n.key]}
                aria-label={n.label}
                onClick={() => toggle(n.key)}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                  settings[n.key]
                    ? "bg-champagne"
                    : "bg-smoke border border-champagne/20"
                }`}
              >
                <div
                  className={`absolute top-0.5 size-5 rounded-full bg-obsidian transition-transform ${
                    settings[n.key] ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || loading}
        className="px-8 py-3 rounded-full bg-champagne text-obsidian text-label hover:bg-champagne/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
