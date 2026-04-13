"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SUGGESTED_DESIRES = [
  "Travel", "Fine Dining", "Motorsport", "Aviation",
  "Intellectual", "Creative", "Art", "Wellness",
];

interface Props {
  initialName: string;
  initialHeadline: string;
  initialBio: string;
  initialDesires: string[];
  initialLocation: string;
}

export function ProfileEditDialog({
  initialName,
  initialHeadline,
  initialBio,
  initialDesires,
  initialLocation,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [headline, setHeadline] = useState(initialHeadline);
  const [bio, setBio] = useState(initialBio);
  const [location, setLocation] = useState(initialLocation);
  const [desires, setDesires] = useState(initialDesires);
  const [saving, setSaving] = useState(false);

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const hasUnsavedChanges = useCallback(() => {
    return (
      name !== initialName ||
      headline !== initialHeadline ||
      bio !== initialBio ||
      location !== initialLocation ||
      JSON.stringify(desires.sort()) !== JSON.stringify(initialDesires.sort())
    );
  }, [name, headline, bio, location, desires, initialName, initialHeadline, initialBio, initialLocation, initialDesires]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (open && hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [open, hasUnsavedChanges]);

  function handleCloseAttempt() {
    if (hasUnsavedChanges()) {
      setShowUnsavedWarning(true);
    } else {
      setOpen(false);
    }
  }

  function confirmClose() {
    setShowUnsavedWarning(false);
    setOpen(false);
    setName(initialName);
    setHeadline(initialHeadline);
    setBio(initialBio);
    setLocation(initialLocation);
    setDesires(initialDesires);
  }

  function cancelClose() {
    setShowUnsavedWarning(false);
  }

  function toggleDesire(d: string) {
    setDesires((prev) =>
      prev.includes(d)
        ? prev.filter((x) => x !== d)
        : prev.length < 3
          ? [...prev, d]
          : prev
    );
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: name,
          headline,
          bio,
          location_city: location,
          desires,
          photo_urls: [],
        }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="gold-outline" className="rounded-full" onClick={() => setOpen(true)}>
        <Edit className="size-4 mr-2" />
        Edit
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={handleCloseAttempt} />
          <div className="relative bg-smoke border border-champagne/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl text-ivory">Edit Profile</h2>
              <button onClick={handleCloseAttempt} className="text-ivory/40 hover:text-ivory">
                <X className="size-5" />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="text-label text-ivory/50 mb-2 block">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-obsidian border-champagne/30 text-ivory rounded-full px-5"
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
                className="h-11 bg-obsidian border-champagne/30 text-ivory rounded-full px-5"
              />
              <div className="text-right text-label text-ivory/30 mt-1">{headline.length}/80</div>
            </div>

            {/* Location */}
            <div>
              <label className="text-label text-ivory/50 mb-2 block">City</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai, New York, London..."
                className="h-11 bg-obsidian border-champagne/30 text-ivory rounded-full px-5"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-label text-ivory/50 mb-2 block">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="bg-obsidian border-champagne/30 text-ivory rounded-2xl p-4"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="text-label text-ivory/50 mb-3 block">
                Interests ({desires.length}/3 selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_DESIRES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDesire(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-body-sm border transition-all",
                      desires.includes(d)
                        ? "bg-champagne text-obsidian border-champagne"
                        : "bg-smoke text-ivory/70 border-champagne/20 hover:border-champagne/50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="gold"
              className="w-full h-12 rounded-full"
              onClick={save}
              disabled={saving || !name.trim()}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {showUnsavedWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-sm" onClick={cancelClose} />
          <div className="relative bg-smoke border border-champagne/30 rounded-2xl w-full max-w-md p-6 text-center">
            <AlertTriangle className="size-12 text-chamber-400 mx-auto mb-4" />
            <h3 className="font-headline text-xl text-ivory mb-2">Unsaved Changes</h3>
            <p className="text-body-md text-ivory/60 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-full border-champagne/30 text-ivory"
                onClick={cancelClose}
              >
                Keep Editing
              </Button>
              <Button
                variant="gold"
                className="flex-1 h-11 rounded-full"
                onClick={confirmClose}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
