"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const TIERS = [
  {
    id: "gold",
    name: "Gold",
    price: 99,
    features: ["One match per day.", "5 tokens monthly.", "Direct messaging."],
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 299,
    features: ["Two matches per day.", "20 tokens monthly.", "Event invitations."],
  },
  {
    id: "black_card",
    name: "Black Card",
    price: 999,
    features: ["Personal matchmaking.", "100 tokens monthly.", "Private IRL experiences.", "Dedicated host."],
  },
];

interface Props {
  currentTier: string | null;
}

export function SubscriptionClient({ currentTier }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleManage() {
    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed"); return; }
      router.push(data.url);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleUpgrade(tierId: string) {
    setLoading(tierId);
    try {
      const priceEnvMap: Record<string, string> = {
        gold: "STRIPE_PRICE_GOLD",
        platinum: "STRIPE_PRICE_PLATINUM",
        black_card: "STRIPE_PRICE_BLACK_CARD",
      };
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceEnvMap[tierId], mode: "subscription" }),
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

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Membership</div>
        <h1 className="text-display-lg text-ivory">
          Your <span className="italic text-champagne">tier.</span>
        </h1>
      </div>

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
                  <div className="text-label text-champagne">${tier.price}/month</div>
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
