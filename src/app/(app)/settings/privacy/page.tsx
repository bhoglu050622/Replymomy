"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const TOGGLES = [
  { key: "show_online_status", uiKey: "online", label: "Show online status" },
  { key: "show_last_active", uiKey: "lastActive", label: "Show last active" },
  { key: "allow_direct_messages", uiKey: "directMessages", label: "Allow direct messages" },
  { key: "blur_photos_for_free", uiKey: "blurPhotos", label: "Blur photos until matched" },
];

type PrivacyState = Record<string, boolean>;

const DEFAULTS: PrivacyState = {
  online: true,
  lastActive: false,
  directMessages: true,
  blurPhotos: true,
};

export default function PrivacyPage() {
  const [state, setState] = useState<PrivacyState>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile) {
          setState({
            online: profile.show_online_status ?? true,
            lastActive: profile.show_last_active ?? false,
            directMessages: profile.allow_direct_messages ?? true,
            blurPhotos: profile.blur_photos_for_free ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          show_online_status: state.online,
          show_last_active: state.lastActive,
          allow_direct_messages: state.directMessages,
          blur_photos_for_free: state.blurPhotos,
        }),
      });
      if (res.ok) {
        toast.success("Privacy settings saved.");
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
        <div className="text-label text-champagne mb-3">Discretion</div>
        <h1 className="text-display-lg text-ivory">
          <span className="italic text-champagne">Privacy.</span>
        </h1>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-smoke animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {TOGGLES.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between p-5 rounded-2xl bg-smoke border border-champagne/10"
            >
              <span className="text-body-md text-ivory">{t.label}</span>
              <button
                role="switch"
                aria-checked={state[t.uiKey]}
                aria-label={t.label}
                onClick={() => {
                  setState({ ...state, [t.uiKey]: !state[t.uiKey] });
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  state[t.uiKey] ? "bg-champagne" : "bg-smoke border border-champagne/20"
                }`}
              >
                <div
                  className={`absolute top-0.5 size-5 rounded-full bg-obsidian transition-transform ${
                    state[t.uiKey] ? "translate-x-6" : "translate-x-0.5"
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
