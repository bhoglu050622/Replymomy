"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowLeft, Clock, Mail, Star, Zap, Infinity } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DODO_PRODUCTS, REGIONAL_PRICES } from "@/lib/dodo/prices";
import { useRegionalPrices } from "@/hooks/use-regional-price";
import { cn } from "@/lib/utils";
import posthog from "posthog-js";

// ─── Plan config ─────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: null as null,
    name: "Free",
    tagline: "Get started",
    features: [
      "Browse up to 20 mommy profiles.",
      "View basic profile info.",
      "No curated matches.",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    tagline: "Most popular",
    features: [
      "Unlimited profile browsing.",
      "1 curated match per day.",
      "10 tokens per month.",
      "Full gallery access.",
    ],
  },
  {
    id: "unlimited" as const,
    name: "Unlimited",
    tagline: "All access",
    features: [
      "Everything in Pro.",
      "Unlimited curated matches.",
      "50 tokens per month.",
      "Priority in matching queue.",
      "Send gifts.",
    ],
  },
];

// Top 3 selling points per tier shown in the upgrade overlay
const UPGRADE_HIGHLIGHTS: Record<"pro" | "unlimited", Array<{ icon: React.ComponentType<{ className?: string }>; title: string; desc: string }>> = {
  pro: [
    { icon: Zap, title: "Unlimited browsing", desc: "Every mommy profile, no cap, no waiting." },
    { icon: Star, title: "1 curated match daily", desc: "We handpick your best match every morning." },
    { icon: Check, title: "10 tokens / month", desc: "Spend on gallery unlocks, gifts, and more." },
  ],
  unlimited: [
    { icon: Infinity, title: "Unlimited matches", desc: "Every curated match we find for you, every day." },
    { icon: Zap, title: "50 tokens / month", desc: "5× more tokens — send gifts, unlock galleries." },
    { icon: Star, title: "Priority queue", desc: "You appear first. Mommies notice you sooner." },
  ],
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  currentTier: string | null;
  browsedCount?: number;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SubscriptionClient({ currentTier, browsedCount = 0 }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { prices, isRegional, country } = useRegionalPrices();

  const showManage = searchParams.get("manage") === "true";
  const highlight = searchParams.get("highlight");

  // Upgrade overlay state
  const [upgradeTarget, setUpgradeTarget] = useState<"pro" | "unlimited" | null>(null);
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  // Normalise legacy tiers
  const activeTier = ["gold", "platinum", "black_card"].includes(currentTier ?? "")
    ? "unlimited"
    : currentTier;

  function priceFor(tierId: "pro" | "unlimited"): string {
    return prices[tierId] ?? REGIONAL_PRICES.DEFAULT[tierId];
  }

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

  async function handlePaymentDone() {
    if (!upgradeTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: upgradeTarget,
          amount_display: priceFor(upgradeTarget),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to record. Email us if this persists.");
        return;
      }
      setPaid(true);
    } catch {
      toast.error("Something went wrong. Email hello@replymommy.com for help.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Upgrade overlay ────────────────────────────────────────────────────────

  if (upgradeTarget) {
    const highlights = UPGRADE_HIGHLIGHTS[upgradeTarget];
    const price = priceFor(upgradeTarget);
    const tierName = upgradeTarget === "pro" ? "Pro" : "Unlimited";

    if (paid) {
      // ── Confirmation state ──
      return (
        <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-md mx-auto">
          <div className="rounded-3xl border border-champagne/20 bg-smoke/80 p-8 text-center space-y-6"
            style={{ boxShadow: "0 0 0 1px rgba(232,194,123,0.06), 0 24px 64px rgba(0,0,0,0.4)" }}
          >
            <div className="size-16 rounded-full bg-champagne/10 border border-champagne/30 flex items-center justify-center mx-auto">
              <Clock className="size-7 text-champagne" />
            </div>
            <div>
              <h2 className="text-display-md text-ivory mb-2">Payment received.</h2>
              <p className="text-body-sm text-ivory/50">
                We&apos;ll verify your payment and activate your{" "}
                <span className="text-champagne">{tierName}</span> plan within 5 minutes.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-obsidian/60 border border-champagne/[0.08] text-body-sm text-ivory/50 leading-relaxed">
              Need help?{" "}
              <a href="mailto:hello@replymommy.com" className="text-champagne underline">
                hello@replymommy.com
              </a>
            </div>
            <button
              onClick={() => { setUpgradeTarget(null); setPaid(false); }}
              className="text-label text-ivory/30 hover:text-ivory/60 transition-colors"
            >
              Back to plans
            </button>
          </div>
        </div>
      );
    }

    // ── QR payment state ──
    return (
      <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-md mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => setUpgradeTarget(null)}
          className="flex items-center gap-2 text-label text-ivory/40 hover:text-ivory/70 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to plans
        </button>

        <div
          className="rounded-3xl border border-champagne/15 bg-smoke/80 overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(232,194,123,0.06), 0 24px 64px rgba(0,0,0,0.4)" }}
        >
          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-champagne/[0.08]">
            <div className="text-label text-champagne mb-1">Upgrading to {tierName}</div>
            <h2 className="text-display-md text-ivory">
              Thank you for helping us build the{" "}
              <span className="italic text-champagne">best curated experience.</span>
            </h2>
            <p className="text-body-sm text-ivory/50 mt-2 leading-relaxed">
              Every upgrade goes directly into making ReplyMommy more exclusive, more curated, and more worth your time. You&apos;re not just a subscriber — you&apos;re a founding member who shapes what this becomes.
            </p>
          </div>

          {/* Top 3 highlights */}
          <div className="px-7 py-5 space-y-3 border-b border-champagne/[0.08]">
            <div className="text-label text-ivory/40 mb-3">What you get</div>
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-champagne/[0.08] border border-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
                  <h.icon className="size-3.5 text-champagne" />
                </div>
                <div>
                  <div className="text-body-sm font-medium text-ivory">{h.title}</div>
                  <div className="text-body-sm text-ivory/40">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* QR + payment */}
          <div className="px-7 py-6 space-y-5">
            <div className="text-center">
              <div className="text-label text-ivory/40 mb-1">Pay via Google Pay</div>
              <div className="font-headline text-3xl text-champagne">{price}</div>
              <div className="text-label text-ivory/30">/ month</div>
            </div>

            <p className="text-center text-body-sm text-ivory/50 px-2">
              Complete payment using your usual method, then tap the button below to record it.
            </p>

            <Button
              variant="gold"
              className="w-full h-12 rounded-full"
              disabled={submitting}
              onClick={handlePaymentDone}
            >
              {submitting ? "Recording..." : "Payment completed ✓"}
            </Button>

            <p className="text-center text-[11px] text-ivory/25 leading-relaxed">
              After payment, your plan activates within 5 minutes.
              Questions?{" "}
              <a href="mailto:hello@replymommy.com" className="text-champagne/50 underline">
                hello@replymommy.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Plan list ──────────────────────────────────────────────────────────────

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Membership</div>
        <h1 className="text-display-lg text-ivory">
          Choose your <span className="italic text-champagne">plan.</span>
        </h1>
        {isRegional && (
          <p className="text-label text-champagne/60 mt-2">
            Prices shown in your local currency ({country}).
          </p>
        )}
      </div>

      {showManage && (
        <div className="mb-6 p-5 rounded-2xl bg-smoke border border-champagne/20">
          <p className="text-body-sm text-ivory/70">
            To cancel, email{" "}
            <a href="mailto:hello@replymommy.com" className="text-champagne underline">
              hello@replymommy.com
            </a>{" "}
            at least 24 hours before your renewal date.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {TIERS.map((tier) => {
          const isCurrent = tier.id === activeTier || (tier.id === null && activeTier === null);
          const isHighlighted = highlight === tier.id;

          return (
            <div
              key={tier.id ?? "free"}
              className={cn(
                "p-6 rounded-2xl border transition-all",
                isCurrent
                  ? "bg-gradient-to-b from-burgundy/20 to-smoke border-champagne"
                  : isHighlighted
                    ? "bg-smoke border-champagne/50 ring-1 ring-champagne/30"
                    : "bg-smoke border-champagne/10"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-headline text-2xl text-ivory">{tier.name}</div>
                    {tier.id !== null && (
                      <span className="text-label text-ivory/40">{tier.tagline}</span>
                    )}
                  </div>
                  {tier.id !== null ? (
                    <div className="text-label text-champagne">
                      {priceFor(tier.id)}/month
                    </div>
                  ) : (
                    <div className="text-label text-ivory/30">Always free</div>
                  )}
                </div>
                {isCurrent && (
                  <span className="text-label px-3 py-1 rounded-full bg-champagne text-obsidian">
                    Current
                  </span>
                )}
              </div>

              {/* Free tier usage bar */}
              {tier.id === null && browsedCount > 0 && (
                <div className="mt-3 mb-4">
                  <div className="w-full h-1 bg-champagne/10 rounded-full">
                    <div
                      className="h-1 bg-champagne rounded-full transition-all"
                      style={{ width: `${Math.min(100, (browsedCount / 20) * 100)}%` }}
                    />
                  </div>
                  <p className="text-label text-ivory/30 mt-1.5">
                    {browsedCount} / 20 profiles viewed
                  </p>
                </div>
              )}

              <ul className="space-y-2 mt-4 mb-5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body-sm text-ivory/70">
                    <Check className="size-4 text-champagne shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                tier.id !== null ? (
                  <Button
                    variant="gold-outline"
                    className="w-full h-11 rounded-full text-xs"
                    onClick={handleManage}
                    disabled={loading === "manage"}
                  >
                    {loading === "manage" ? "Opening..." : "Manage subscription"}
                  </Button>
                ) : (
                  <div className="h-11 flex items-center justify-center text-label text-ivory/20">
                    Your current plan
                  </div>
                )
              ) : tier.id !== null ? (
                <Button
                  variant="gold"
                  className="w-full h-11 rounded-full text-xs"
                  onClick={() => {
                    posthog.capture("upgrade_clicked", { tier: tier.id, tier_name: tier.name });
                    setUpgradeTarget(tier.id!);
                  }}
                  disabled={!!loading}
                >
                  Upgrade to {tier.name}
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Support footer */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-label text-ivory/30">
        <Mail className="size-3" />
        <span>
          Questions?{" "}
          <a href="mailto:hello@replymommy.com" className="text-champagne/60 hover:text-champagne transition-colors">
            hello@replymommy.com
          </a>
        </span>
      </div>
    </div>
  );
}
