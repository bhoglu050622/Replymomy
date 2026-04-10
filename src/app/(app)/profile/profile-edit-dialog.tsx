"use client";

import { useState } from "react";
import { Edit, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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
  initialBio: string;
  initialDesires: string[];
  initialPhotoUrls: string[];
}

export function ProfileEditDialog({
  initialName,
  initialBio,
  initialDesires,
  initialPhotoUrls,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [desires, setDesires] = useState(initialDesires);
  const [photoUrls, setPhotoUrls] = useState(initialPhotoUrls);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  function toggleDesire(d: string) {
    setDesires((prev) =>
      prev.includes(d)
        ? prev.filter((x) => x !== d)
        : prev.length < 3
          ? [...prev, d]
          : prev
    );
  }

  async function handlePhotoClick(idx: number) {
    if (photoUrls[idx]) {
      setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const url = prompt("Enter image URL (dev mode):");
      if (url) setPhotoUrls((prev) => [...prev, url]);
      return;
    }

    setUploadingIdx(idx);
    const formData = new FormData();
    formData.append("upload_preset", uploadPreset);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { setUploadingIdx(null); return; }
      formData.append("file", file);
      try {
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
      } finally {
        setUploadingIdx(null);
      }
    };
    input.click();
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: name,
          bio,
          desires,
          photo_urls: photoUrls,
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
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-smoke border border-champagne/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl text-ivory">Edit Profile</h2>
              <button onClick={() => setOpen(false)} className="text-ivory/40 hover:text-ivory">
                <X className="size-5" />
              </button>
            </div>

            {/* Photos */}
            <div>
              <label className="text-label text-ivory/50 mb-3 block">Photos</label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePhotoClick(i)}
                    disabled={uploadingIdx === i}
                    className={cn(
                      "aspect-[3/4] rounded-xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden",
                      photoUrls[i] ? "border-champagne" : "border-champagne/20 hover:border-champagne/50"
                    )}
                  >
                    {photoUrls[i] ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoUrls[i]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 hover:opacity-100 transition-opacity">
                          <X className="size-4 text-ivory" />
                        </div>
                      </>
                    ) : uploadingIdx === i ? (
                      <div className="size-4 rounded-full border-2 border-champagne/40 border-t-champagne animate-spin" />
                    ) : (
                      <Camera className="size-4 text-champagne/40" />
                    )}
                  </button>
                ))}
              </div>
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
              <label className="text-label text-ivory/50 mb-3 block">Interests (pick 3)</label>
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
    </>
  );
}
