"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { cn } from "@/lib/utils";

const SUGGESTED_INTERESTS = [
  "Travel",
  "Fine Dining",
  "Motorsport",
  "Aviation",
  "Intellectual",
  "Creative",
  "Art",
  "Wellness",
];

export default function CreateProfilePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const wordCount = bio.trim().split(/\s+/).filter(Boolean).length;

  function toggleInterest(d: string) {
    setInterests((prev) =>
      prev.includes(d)
        ? prev.filter((x) => x !== d)
        : prev.length < 3
          ? [...prev, d]
          : prev
    );
  }

  async function handlePhotoClick(idx: number) {
    if (photoUrls[idx]) {
      // Remove photo
      setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    // Check if CldUploadWidget is available
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      // Fallback: prompt for URL (dev mode)
      const url = prompt("Enter image URL (dev mode):");
      if (url) setPhotoUrls((prev) => [...prev, url]);
      return;
    }

    setUploadingIdx(idx);
    try {
      // Dynamically load next-cloudinary widget
      const { CldUploadWidget } = await import("next-cloudinary");
      void CldUploadWidget; // ensure import works
      // Use Cloudinary upload widget via fetch to unsigned upload
      const formData = new FormData();
      formData.append("upload_preset", uploadPreset);

      // Open file picker
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) { setUploadingIdx(null); return; }

        formData.append("file", file);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          setPhotoUrls((prev) => {
            const next = [...prev];
            next[idx] = data.secure_url;
            return next;
          });
        }
        setUploadingIdx(null);
      };
      input.click();
    } catch {
      setUploadingIdx(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          desires: interests,
          photo_urls: photoUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile.");
        setLoading(false);
        return;
      }

      router.push("/preferences");
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
          Build your
          <br />
          <span className="italic text-champagne">profile.</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photos */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">
            Photos (max 3)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePhotoClick(i)}
                disabled={uploadingIdx === i}
                className={cn(
                  "aspect-[3/4] rounded-2xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden",
                  photoUrls[i]
                    ? "border-champagne bg-champagne/10"
                    : "border-champagne/20 hover:border-champagne/50"
                )}
              >
                {photoUrls[i] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrls[i]}
                      alt="Upload"
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 hover:opacity-100 transition-opacity">
                      <X className="size-5 text-ivory" />
                    </div>
                  </>
                ) : uploadingIdx === i ? (
                  <div className="size-5 rounded-full border-2 border-champagne/40 border-t-champagne animate-spin" />
                ) : (
                  <Camera className="size-5 text-champagne/40" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="text-label text-ivory/50 mb-2 block">
            Display Name
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
            required
            className="h-12 bg-smoke border-champagne/30 text-ivory rounded-full px-5"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-label text-ivory/50">Bio</label>
            <span
              className={cn(
                "text-label",
                wordCount > 60 ? "text-red-400" : "text-ivory/40"
              )}
            >
              {wordCount} / 60 words
            </span>
          </div>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A glimpse, not the full story..."
            rows={4}
            className="bg-smoke border-champagne/30 text-ivory rounded-2xl p-4"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="text-label text-ivory/50 mb-3 block">
            Pick three interests.
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_INTERESTS.map((d) => {
              const active = interests.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleInterest(d)}
                  className={cn(
                    "px-4 py-2 rounded-full text-body-sm border transition-all",
                    active
                      ? "bg-champagne text-obsidian border-champagne"
                      : "bg-smoke text-ivory/70 border-champagne/20 hover:border-champagne/50"
                  )}
                >
                  {d}
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
          disabled={loading || photoUrls.length === 0 || interests.length !== 3 || wordCount > 60}
          className="w-full"
        >
          {loading ? "Saving..." : "Continue"}
        </GoldCtaButton>
      </form>
    </div>
  );
}
