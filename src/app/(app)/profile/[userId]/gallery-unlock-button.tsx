"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  ownerId: string;
  tokenCost: number;
}

export function GalleryUnlockButton({ ownerId, tokenCost }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function unlock() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gallery/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, unlockType: "full_gallery" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to unlock. Check your token balance.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {error && <p className="text-body-sm text-red-400 text-center mb-2">{error}</p>}
      <Button variant="gold" className="w-full h-12 rounded-full" onClick={unlock} disabled={loading}>
        {loading ? "Unlocking..." : `Unlock for ${tokenCost} tokens`}
      </Button>
    </div>
  );
}
