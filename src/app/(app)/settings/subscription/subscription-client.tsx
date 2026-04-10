"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DODO_PRODUCTS, REGIONAL_PRICES, PRICE_SENSITIVE } from "@/lib/dodo/prices";
import { useRegionalPrices } from "@/hooks/use-regional-price";

const TIERS = [
  {
    id: "gold" as const,
    name: "Patron",
    features: ["One curated introduction daily.", "5 Rose Tokens monthly.", "Direct encrypted messaging."],
  },
  {
    id: "platinum" as const,
    name: "Fellow",
    features: ["Unlimited daily introductions.", "Priority queue access.", "20 Rose Tokens monthly.", "Event invitations."],
  },
  {
    id: "black_card" as const,
    name: "Principal",
    features: ["Personal matchmaking.", "100 Rose Tokens monthly.", "Private IRL experiences.", "Personal Liaison.", "Dedicated host."],
  },
];

interface Props {
  currentTier: string | null;
}

export function SubscriptionClient({ currentTier }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const { prices, isRegional, country } = useRegionalPrices();

  // Handle manage=true: show cancel instructions
  const showManage = searchParams.get("manage") === "true";

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      router.replace("/join-confirmed");
    }
  }, [searchParams, router]);

  async function handleManage() {
    setLoading("manage");
    try {
      const res = await fetch("/api/dodo/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed"); return; }
      router.push(data.url);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleUpgrade(tierId: "gold" | "platinum" | "black_card") {
    setLoading(tierId);
    try {
      const product = DODO_PRODUCTS[tierId];
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.productId,
          mode: "subscription",
          tier: tierId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed"); return; }
      router.push(data.url);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  const priceMap: Record<string, string> = {
    gold: prices.gold,
    platinum: prices.platinum,
    black_card: prices.black_card,
  };

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Membership</div>
        <h1 className="text-display-lg text-ivory">
          Your <span className="italic text-champagne">tier.</span>
        </h1>
        {isRegional && (
          <p className="text-label text-champagne/60 mt-2">
            Prices shown in your local currency.
          </p>
        )}
      </div>

      {showManage && (
        <div className="mb-6 p-5 rounded-2xl bg-smoke border border-champagne/20">
          <p className="text-body-sm text-ivory/70">
            To cancel your subscription, email{" "}
            <a href="mailto:support@replymommy.com" className="text-champagne underline">
              support@replymommy.com
            </a>{" "}
            at least 24 hours before your renewal date. Subscriptions are non-refundable after access is granted.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {TIERS.map((tier) => {
          const isCurrent = tier.id === currentTier;
          return (
            <div
              key={tier.id}
              className={`p-6 rounded-2xl border ${
                isCurrent
                  ? "bg-gradient-to-b from-burgundy/20 to-smoke border-champagne"
                  : "bg-smoke border-champagne/10"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-headline text-2xl text-ivory">{tier.name}</div>
                  <div className="text-label text-champagne">{priceMap[tier.id]}/month</div>
                </div>
                {isCurrent && (
                  <span className="text-label px-3 py-1 rounded-full bg-champagne text-obsidian">
                    Current
                  </span>
                )}
              </div>
              <ul className="space-y-2 mb-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body-sm text-ivory/70">
                    <Check className="size-4 text-champagne" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button
                  variant="gold-outline"
                  className="w-full h-11 rounded-full text-xs"
                  onClick={handleManage}
                  disabled={loading === "manage"}
                >
                  {loading === "manage" ? "Opening..." : "Manage"}
                </Button>
              ) : (
                <Button
                  variant="gold"
                  className="w-full h-11 rounded-full text-xs"
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={loading === tier.id}
                >
                  {loading === tier.id ? "Redirecting..." : `Upgrade to ${tier.name}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
