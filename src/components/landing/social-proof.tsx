"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";

const PAIN_LINES = ["More matches.", "More ghosting.", "More wasted time."];

const COMPARISON = [
  { old: "Endless swiping", next: "Curated matches" },
  { old: "Fake profiles", next: "Verified only" },
  { old: "Dry conversations", next: "Better chemistry" },
  { old: "Quantity over quality", next: "Standards first" },
];

export function SocialProof() {
  return (
    <section
      id="why"
      className="luxury-section bg-gradient-to-b from-obsidian to-obsidian-soft"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(74,14,26,0.28),transparent_50%)]" />
      </div>

      <div className="container mx-auto relative">
        {/* Heading */}
        <LuxuryScrollTrigger>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-kicker">The Problem</p>
            <h2 className="mt-5 text-display-lg text-ivory">
              Dating apps got louder.
              <br />
              <em className="text-gradient-gold not-italic font-accent">
                We got smarter.
              </em>
            </h2>
            <p className="mt-6 text-body-lg text-ivory/55 font-light">
              Most apps are built to keep you swiping — not help you connect.
            </p>
          </div>
        </LuxuryScrollTrigger>

        {/* Pain lines */}
        <div className="mt-10 flex flex-col items-center gap-3">
          {PAIN_LINES.map((line, i) => (
            <motion.p
              key={line}
              className="text-display-sm text-ivory/50 font-light"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.14, duration: 0.5 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <LuxuryScrollTrigger delay={0.2}>
          <p className="mt-8 text-center text-body-lg text-champagne font-medium">
            ReplyMommy was built for people who want chemistry, not chaos.
          </p>
        </LuxuryScrollTrigger>

        {/* Comparison */}
        <LuxuryScrollTrigger delay={0.28}>
          <div className="mt-14 mx-auto max-w-xl">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_20px_1fr] items-center mb-5 px-1">
              <p className="text-label text-ivory/35 text-center">Other apps</p>
              <div />
              <p className="text-label text-champagne text-center">ReplyMommy</p>
            </div>

            <div className="space-y-2.5">
              {COMPARISON.map((row, i) => (
                <motion.div
                  key={row.old}
                  className="grid grid-cols-[1fr_20px_1fr] items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09 }}
                >
                  <div className="luxury-glass rounded-2xl px-4 py-3 flex items-center gap-2.5">
                    <X className="size-3 text-ivory/25 shrink-0" />
                    <span className="text-body-sm text-ivory/38">{row.old}</span>
                  </div>
                  <div className="size-1.5 rounded-full bg-champagne/25 mx-auto" />
                  <div className="luxury-glass rounded-2xl px-4 py-3 flex items-center gap-2.5 border border-champagne/[0.18]">
                    <Check className="size-3 text-champagne shrink-0" />
                    <span className="text-body-sm text-ivory/85">{row.next}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </LuxuryScrollTrigger>
      </div>
    </section>
  );
}
