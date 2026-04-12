"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { Gem, Crown, Sparkles } from "lucide-react";

const SALON_COLUMNS = [
  {
    icon: Crown,
    title: "Founders and builders",
    copy: "People growing something significant who want their personal life to reflect the same intentionality as their work.",
  },
  {
    icon: Gem,
    title: "Creatives and professionals",
    copy: "Ambitious individuals in creative fields, media, and culture who want real chemistry — not a follower count.",
  },
  {
    icon: Sparkles,
    title: "Investors and operators",
    copy: "High-trust people who value discretion, clear intent, and conversations worth having.",
  },
];

export function WhoAreTheMommies() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const panelY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section ref={sectionRef} id="salon" className="luxury-section">
      {/* Background parallax layer */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div
          className="absolute inset-0 opacity-55"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(232, 194, 123, 0.16), transparent 34%), radial-gradient(circle at 84% 74%, rgba(74, 14, 26, 0.3), transparent 48%)",
          }}
        />
      </motion.div>

      {/* Decorative section numeral */}
      <div
        aria-hidden="true"
        className="section-numeral absolute right-[-4%] top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block"
      >
        01
      </div>

      <div className="container mx-auto grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left panel — deep glass */}
        <LuxuryScrollTrigger>
          <motion.div
            className="luxury-glass-deep relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{ y: panelY }}
          >
            {/* Editorial gold rule above kicker */}
            <div className="mb-5 h-px w-10 bg-gradient-to-r from-champagne/50 to-transparent" />
            <p className="text-kicker">Who It&apos;s For</p>

            <h2 className="mt-5 text-display-lg text-ivory">
              Built for people who know what they want.
            </h2>

            <p className="mt-6 max-w-2xl text-body-lg text-ivory/68 font-light">
              Whether you&apos;re building your career, your business, or your
              future — ReplyMommy is for people looking for connection with
              substance. Ambitious, thoughtful individuals who value chemistry,
              intention, and quality over quantity.
            </p>

            {/* Editorial stats */}
            <div className="mt-8 border-t border-champagne/15">
              <div className="grid grid-cols-3 divide-x divide-champagne/10">
                {[
                  { value: "Founding", label: "Cohort now accepting applications" },
                  { value: "Verified", label: "Every member approved by hand" },
                  { value: "Private", label: "No public profiles. No public directory." },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={["py-5", i === 0 ? "pr-5" : i === 2 ? "pl-5" : "px-5"].join(" ")}
                  >
                    <p className="font-headline text-[2.2rem] leading-none tracking-tight text-champagne">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-body-sm text-ivory/45 font-light leading-snug">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </LuxuryScrollTrigger>

        {/* Right column — category cards with ordinal */}
        <div className="space-y-4">
          {SALON_COLUMNS.map((column, index) => (
            <LuxuryScrollTrigger key={column.title} delay={index * 0.09}>
              <article className="luxury-glass rounded-2xl p-6 relative overflow-hidden">
                {/* Faint background ordinal */}
                <span
                  aria-hidden="true"
                  className="absolute top-3 right-5 font-headline text-[3.5rem] leading-none text-champagne/[0.07] select-none pointer-events-none"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl border border-champagne/30 bg-obsidian/65">
                  <column.icon className="size-5 text-champagne" />
                </div>
                <h3 className="text-display-sm text-ivory">{column.title}</h3>
                <p className="mt-2 text-body-md text-ivory/64">{column.copy}</p>
              </article>
            </LuxuryScrollTrigger>
          ))}
        </div>
      </div>
    </section>
  );
}
