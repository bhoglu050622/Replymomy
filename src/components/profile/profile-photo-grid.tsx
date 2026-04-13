"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfilePhotoGridProps {
  initialUrls: string[];
  editable?: boolean;
}

const MAX_PHOTOS = 3;

export function ProfilePhotoGrid({ initialUrls, editable = false }: ProfilePhotoGridProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls.slice(0, MAX_PHOTOS));
  const [uploading, setUploading] = useState<number | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  async function handleUpload(slot: number, file: File) {
    setUploading(slot);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      const newUrls = [...urls];
      newUrls[slot] = data.url;
      setUrls(newUrls);
      // Persist to profile
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_urls: newUrls.filter(Boolean) }),
      });
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function handleDelete(slot: number) {
    const newUrls = urls.filter((_, i) => i !== slot);
    setUrls(newUrls);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_urls: newUrls.filter(Boolean) }),
    });
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: MAX_PHOTOS }).map((_, slot) => {
        const url = urls[slot];
        const isUploading = uploading === slot;

        return (
          <div
            key={slot}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-smoke border border-champagne/10"
          >
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-6 text-champagne animate-spin" />
              </div>
            ) : url ? (
              <>
                <img
                  src={url}
                  alt={`Photo ${slot + 1}`}
                  className="w-full h-full object-cover"
                />
                {editable && (
                  <button
                    onClick={() => handleDelete(slot)}
                    className="absolute top-2 right-2 size-7 rounded-full bg-obsidian/70 backdrop-blur-sm flex items-center justify-center text-ivory/60 hover:text-red-400 transition-colors opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
                    style={{ opacity: undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                    aria-label="Delete photo"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </>
            ) : editable ? (
              <>
                <button
                  onClick={() => inputRefs[slot].current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ivory/20 hover:text-champagne/60 transition-colors"
                  aria-label="Add photo"
                >
                  <Plus className="size-6" />
                  <span className="text-[10px] uppercase tracking-widest">Add</span>
                </button>
                <input
                  ref={inputRefs[slot]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(slot, file);
                    e.target.value = "";
                  }}
                />
              </>
            ) : (
              <div className={cn(
                "absolute inset-0 flex items-center justify-center",
                slot === 0 ? "border-2 border-dashed border-champagne/10 rounded-2xl" : ""
              )}>
                <span className="text-label text-ivory/10">—</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
