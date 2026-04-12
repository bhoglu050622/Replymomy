"use client";

import { motion } from "motion/react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";

const TESTIMONIALS = [
  {
    quote: "Finally feels like dating for adults.",
    attr: "A founding member, New York",
    delay: 0,
  },
  {
    quote: "The quality difference is insane.",
    attr: "Early access member, London",
    delay: 0.1,
  },
  {
    quote: "Every person here actually puts effort in.",
    attr: "Beta member, Los Angeles",
    delay: 0.2,
  },
];

export function Testimonials() {
  return (
    <section className="luxury-section bg-obsidian">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(74,14,26,0.22),transparent_50%)]" />
      </div>

      <div className="container mx-auto relative">
        <LuxuryScrollTrigger>
          <div className="mx-auto max-w-xl text-center mb-12">
            <p className="text-kicker">Early Members</p>
            <h2 className="mt-5 text-display-lg text-ivory">
              Real people. Better connections.
            </h2>
          </div>
        </LuxuryScrollTrigger>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.quote}
              className="luxury-glass-deep rounded-3xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: t.delay, duration: 0.6 }}
            >
              {/* Decorative open-quote */}
              <span
                aria-hidden="true"
                className="absolute -top-2 left-4 font-headline text-[5rem] leading-none text-champagne/[0.07] select-none pointer-events-none"
              >
                &ldquo;
              </span>

              <p className="font-accent italic text-ivory/85 leading-[1.55] text-[1.1rem] relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-champagne/[0.1]" />
                <cite className="text-label text-champagne/50 not-italic">{t.attr}</cite>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Microcopy strip */}
        <LuxuryScrollTrigger delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/28">
            <span>No dry texters allowed.</span>
            <span className="size-1 rounded-full bg-champagne/30" />
            <span>Verified vibes only.</span>
            <span className="size-1 rounded-full bg-champagne/30" />
            <span>Where chemistry meets standards.</span>
          </div>
        </LuxuryScrollTrigger>
      </div>
    </section>
  );
}
