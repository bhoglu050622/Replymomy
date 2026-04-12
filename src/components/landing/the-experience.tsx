"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Gift, Sparkles } from "lucide-react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "Introductions",
    headline: "Handpicked matches — not an algorithm doing the guessing.",
    detail:
      "You receive a small, personally curated set of introductions each week. Every match is based on compatibility, intent, and mutual standards. Quality, not quantity.",
  },
  {
    label: "Verification",
    headline: "Every member is reviewed before you ever see their name.",
    detail:
      "We verify identity, review intent, and approve every application by hand. The people you meet here have cleared the same bar you did.",
  },
  {
    label: "Concierge",
    headline: "Real humans helping you make real connections.",
    detail:
      "Our concierge team is available to help you navigate introductions, coordinate meetups, and make sure every interaction stays comfortable and on your terms.",
  },
];

const FEATURES = [
  {
    icon: Heart,
    label: "Curated introductions",
    detail: "Handpicked matches based on compatibility, intent, and mutual standards — not volume.",
  },
  {
    icon: MessageCircle,
    label: "Secure messaging",
    detail: "Clean, distraction-free conversation. No spam, no noise, no unsolicited messages.",
  },
  {
    icon: Gift,
    label: "Concierge support",
    detail: "Real humans available to help coordinate introductions, answer questions, and keep things smooth.",
  },
  {
    icon: Sparkles,
    label: "Exclusive events",
    detail: "Meet members in person through invite-only experiences and gatherings in select cities.",
  },
];

export function TheExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const cardY = useTransform(scrollYProgress, [0, 1], ["14%", "-12%"]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="luxury-section bg-gradient-to-b from-obsidian-soft to-obsidian"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(232,194,123,0.18),transparent_36%),radial-gradient(circle_at_20%_80%,rgba(74,14,26,0.24),transparent_40%)]" />
      </div>

      {/* Decorative section numeral */}
      <div
        aria-hidden="true"
        className="section-numeral absolute right-[-3%] bottom-10 pointer-events-none hidden sm:block"
      >
        05
      </div>

      <div className="container mx-auto">
        {/* Heading */}
        <LuxuryScrollTrigger>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-kicker">The Platform</p>
            <h2 className="mt-5 text-display-lg text-ivory">
              Designed for modern dating, not dopamine addiction.
            </h2>
            <p className="mt-6 text-body-lg text-ivory/66 font-light">
              Every feature is built to help you connect with the right person —
              not to keep you scrolling. That&apos;s the whole difference.
            </p>
          </div>
        </LuxuryScrollTrigger>

        <div className="mt-14 grid gap-6 grid-cols-1 lg:grid-cols-[1.12fr_0.88fr]">
          {/* Left panel — tab-based viewer */}
          <LuxuryScrollTrigger>
            <motion.div
              className="luxury-glass-deep relative overflow-hidden rounded-3xl p-7 md:p-10"
              style={{ y: cardY }}
            >
              {/* Tab pills */}
              <div className="flex gap-2 flex-wrap mb-6">
                {TABS.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-label transition-all duration-300 border",
                      activeTab === i
                        ? "bg-champagne/[0.14] text-champagne border-champagne/28"
                        : "text-ivory/35 hover:text-ivory/62 border-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Animated tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="min-h-[9rem]"
                >
                  <h3 className="text-display-md text-ivory leading-tight mb-3">
                    {TABS[activeTab].headline}
                  </h3>
                  <p className="text-body-md text-ivory/58 font-light">
                    {TABS[activeTab].detail}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </LuxuryScrollTrigger>

          {/* Right column — numbered feature cards */}
          <div className="space-y-4">
            {FEATURES.map((feature, index) => (
              <LuxuryScrollTrigger key={feature.label} delay={index * 0.08}>
                <article className="luxury-glass rounded-2xl p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-headline text-[1.05rem] text-champagne/55 tabular-nums leading-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="h-px flex-1 bg-champagne/[0.1]" />
                    <feature.icon className="size-4 text-champagne/45" />
                  </div>
                  <h3 className="text-display-sm text-ivory">{feature.label}</h3>
                  <p className="mt-2 text-body-sm text-ivory/62">{feature.detail}</p>
                </article>
              </LuxuryScrollTrigger>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
