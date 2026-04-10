"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";

const TOKEN_PACKS = [
  { id: "pack_5", amount: 5, price: 5, label: "Intro" },
  { id: "pack_12", amount: 12, price: 10, label: "Standard", savings: "Save 17%" },
  { id: "pack_30", amount: 30, price: 20, label: "Premium", featured: true, savings: "Save 33%" },
  { id: "pack_100", amount: 100, price: 60, label: "Power", savings: "Save 40%" },
];

export default function TokensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const tokenBalance = useUserStore((s) => s.tokenBalance);

  async function purchase(packId: string) {
    setLoading(packId);

    try {
      const res = await fetch("/api/stripe/purchase-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="font-headline text-5xl text-ivory mb-2">
              {pack.amount}
            </div>
            <div className="text-label text-ivory/40 mb-1">tokens</div>
            <div className="font-headline text-2xl text-champagne mt-4">
              ${pack.price}
            </div>
            {pack.savings && (
              <div className="text-label text-rose mt-1">{pack.savings}</div>
            )}
            <Button
              variant={pack.featured ? "gold" : "gold-outline"}
              className="w-full mt-6 h-11 rounded-full text-xs"
              disabled={loading === pack.id}
              onClick={() => purchase(pack.id)}
            >
              {loading === pack.id ? "Redirecting..." : "Buy"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
