"use client";

import { useState, useEffect } from "react";
import { Plus, X, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface GalleryItem {
  id: string;
  url: string;
  is_premium: boolean;
  token_cost: number;
  type: string;
}

export function GalleryUploader() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/gallery/items")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const url = prompt("Enter image URL (dev mode):");
      if (!url) return;
      await saveItem(url, null);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("upload_preset", uploadPreset);
        formData.append("file", file);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          await saveItem(data.secure_url, data.public_id);
        }
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function saveItem(url: string, publicId: string | null) {
    const res = await fetch("/api/gallery/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, cloudinary_public_id: publicId, is_premium: true, token_cost: 10 }),
    });
    const data = await res.json();
    if (data.item) {
      setItems((prev) => [data.item, ...prev]);
    }
  }

  async function togglePremium(item: GalleryItem) {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_premium: !i.is_premium } : i))
    );
    try {
      const res = await fetch(`/api/gallery/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_premium: !item.is_premium }),
      });
      if (!res.ok) {
        // Revert optimistic update
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_premium: item.is_premium } : i))
        );
        toast.error("Failed to update.");
      }
    } catch {
      // Revert on network error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_premium: item.is_premium } : i))
      );
      toast.error("Failed to update.");
    }
  }

  async function removeItem(id: string) {
    await fetch(`/api/gallery/items?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-label text-champagne">Gallery</div>
        <Button
          variant="gold-outline"
          className="h-9 rounded-full px-4 text-xs"
          onClick={handleUpload}
          disabled={uploading}
        >
          <Plus className="size-3 mr-1" />
          {uploading ? "Uploading..." : "Add Photo"}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-smoke animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          className="border-2 border-dashed border-champagne/20 rounded-2xl p-10 text-center cursor-pointer hover:border-champagne/40 transition-colors"
          onClick={handleUpload}
        >
          <Plus className="size-8 text-champagne/30 mx-auto mb-2" />
          <p className="text-body-sm text-ivory/40">Add your first gallery photo</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="aspect-square rounded-xl overflow-hidden relative group border border-champagne/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => togglePremium(item)}
                  className="size-8 rounded-full bg-champagne/20 border border-champagne/40 flex items-center justify-center hover:bg-champagne/30 transition-colors"
                  title={item.is_premium ? "Make free" : "Make premium"}
                >
                  {item.is_premium ? (
                    <Lock className="size-3 text-champagne" />
                  ) : (
                    <Unlock className="size-3 text-champagne" />
                  )}
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="size-8 rounded-full bg-red-900/30 border border-red-400/30 flex items-center justify-center hover:bg-red-900/50 transition-colors"
                >
                  <X className="size-3 text-red-400" />
                </button>
              </div>
              {item.is_premium && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-champagne/30 border border-champagne/50 flex items-center justify-center">
                  <Lock className="size-2.5 text-champagne" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
