"use client";

import { motion } from "motion/react";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "gold" as const,
    name: "Classic",
    tagline: "Curated matches + messaging.",
    features: [
      "Curated weekly introductions",
      "Verified member profiles",
      "Encrypted direct messaging",
      "Priority support within 24h",
    ],
  },
  {
    id: "platinum" as const,
    name: "Plus",
    tagline: "Priority visibility + unlimited intros.",
    featured: true,
    features: [
      "Unlimited curated introductions",
      "Priority matching queue",
      "Concierge-assisted introductions",
      "Member-only event invitations",
      "Preferred support response",
    ],
  },
  {
    id: "black_card" as const,
    name: "Elite",
    tagline: "Concierge matchmaking + premium perks.",
    features: [
      "Dedicated personal liaison",
      "Personal matchmaking strategy",
      "Exclusive event placement",
      "Direct founder-level escalation",
      "24/7 premium support channel",
    ],
  },
];

export function ThePlans() {
  return (
    <section
      id="membership"
      className="luxury-section bg-gradient-to-b from-obsidian to-obsidian-soft"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,194,123,0.16),transparent_42%)]" />
      </div>

      {/* Decorative section numeral — peers behind heading */}
      <div
        aria-hidden="true"
        className="section-numeral absolute left-1/2 -translate-x-1/2 -top-6 pointer-events-none hidden md:block"
        style={{ opacity: 0.4 }}
      >
        04
      </div>

      <div className="container mx-auto relative">
        {/* Heading */}
        <LuxuryScrollTrigger>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-kicker">Membership</p>
            <h2 className="mt-5 text-display-lg text-ivory">
              Exclusive by design.
            </h2>
            <p className="mt-6 text-body-lg text-ivory/66 font-light">
              Every member is reviewed by hand to maintain the quality of the
              community. We care more about who joins than how many. Pricing
              is shared after acceptance.
            </p>
          </div>
        </LuxuryScrollTrigger>

        {/* Plans — mobile horizontal snap scroll, desktop grid */}
        <div
          className="mx-auto mt-12
            flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none
            md:grid md:max-w-6xl md:gap-6 md:grid-cols-3 md:overflow-visible md:pb-0"
        >
          {PLANS.map((plan, i) => (
            <LuxuryScrollTrigger
              key={plan.name}
              delay={i * 0.08}
              className="snap-center shrink-0 w-[82vw] sm:w-[60vw] md:w-auto"
            >
              <motion.article
                className={cn(
                  "h-full rounded-3xl p-7 md:p-8",
                  plan.id === "black_card"
                    ? "luxury-glass-deep shimmer-border-gold"
                    : plan.featured
                      ? "luxury-surface ring-1 ring-champagne/35"
                      : "luxury-glass"
                )}
                whileHover={{ y: plan.featured ? -14 : -7 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={
                  plan.featured
                    ? {
                        boxShadow:
                          "0 0 70px rgba(201, 168, 76, 0.09), 0 0 140px rgba(201, 168, 76, 0.04)",
                      }
                    : undefined
                }
              >
                {/* Tier badges */}
                {plan.featured && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-champagne/30 px-3 py-1.5 text-label text-champagne">
                    <ShieldCheck className="size-3.5" />
                    Most selected
                  </div>
                )}
                {plan.id === "black_card" && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-champagne/20 px-3 py-1.5 text-label text-champagne/65">
                    <span className="size-1.5 rounded-full bg-champagne/55" />
                    Concierge Access
                  </div>
                )}

                <p className="text-label text-ivory/40">{plan.tagline}</p>
                <h3 className="mt-3 text-display-md text-ivory">{plan.name}</h3>

                <div className="mt-6 border-t border-champagne/[0.08] pt-5">
                  <p className="text-body-sm text-ivory/40 font-light italic">
                    Pricing disclosed upon acceptance
                  </p>
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-body-sm text-ivory/72"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-champagne" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.featured ? "gold" : "gold-outline"}
                  className={cn(
                    "mt-8 h-11 w-full rounded-full text-xs",
                    plan.featured && "animate-breathe-glow"
                  )}
                  onClick={() =>
                    document
                      .getElementById("waitlist")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Apply for {plan.name}
                </Button>
              </motion.article>
            </LuxuryScrollTrigger>
          ))}
        </div>

        {/* Footer promise */}
        <LuxuryScrollTrigger delay={0.25}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/40">
            <span className="flex items-center gap-2">
              <Check className="size-3 text-champagne" />
              Cancel anytime
            </span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span className="flex items-center gap-2">
              <Check className="size-3 text-champagne" />
              No hidden fees
            </span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span className="flex items-center gap-2">
              <Check className="size-3 text-champagne" />
              Concierge support included
            </span>
          </div>
        </LuxuryScrollTrigger>
      </div>
    </section>
  );
}
