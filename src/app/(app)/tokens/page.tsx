"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { TOKEN_PACKS } from "@/lib/dodo/prices";

export default function TokensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const tokenBalance = useUserStore((s) => s.tokenBalance);

  async function purchase(pack: typeof TOKEN_PACKS[number]) {
    setLoading(pack.id);
    try {
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: pack.productId,
          mode: "payment",
          tokenAmount: pack.tokens,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Purchase failed.");
        return;
      }
      router.push(data.url);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-display-lg text-ivory mb-4">
          <span className="italic text-champagne">Top up.</span>
        </h1>
        <div className="inline-block px-6 py-3 rounded-full bg-smoke border border-champagne/20">
          <span className="text-label text-ivory/40 mr-3">Balance</span>
          <span className="font-headline text-2xl text-champagne">
            {tokenBalance ?? "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TOKEN_PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`relative p-8 rounded-2xl border text-center ${
              pack.featured
                ? "bg-gradient-to-b from-burgundy/20 via-smoke to-smoke border-champagne shadow-gold-glow"
                : "bg-smoke border-champagne/10"
            }`}
          >
            {pack.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-champagne text-obsidian text-[10px] uppercase tracking-widest">
                Most popular.
              </div>
            )}
            <div className="text-label text-champagne mb-3">{pack.label}</div>
            <div className="font-headline text-5xl text-ivory mb-2">{pack.tokens}</div>
            <div className="text-label text-ivory/40 mb-1">tokens</div>
            <div className="font-headline text-2xl text-champagne mt-4">${pack.price}</div>
            {"savings" in pack && pack.savings && (
              <div className="text-label text-rose mt-1">{pack.savings}</div>
            )}
            <Button
              variant={pack.featured ? "gold" : "gold-outline"}
              className="w-full mt-6 h-11 rounded-full text-xs"
              disabled={loading === pack.id}
              onClick={() => purchase(pack)}
            >
              {loading === pack.id ? "Redirecting..." : "Buy"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
