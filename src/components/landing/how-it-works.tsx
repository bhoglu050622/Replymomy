"use client";

import { motion } from "motion/react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";

const STEPS = [
  {
    number: "01",
    title: "Apply",
    body: "Every application is reviewed by hand to protect the quality of the community.",
  },
  {
    number: "02",
    title: "Get Verified",
    body: "Real identity verification means real people only. No bots, no catfish.",
  },
  {
    number: "03",
    title: "Match",
    body: "Receive curated introductions based on chemistry, intent, and compatibility.",
  },
  {
    number: "04",
    title: "Connect",
    body: "Chat privately and meet through thoughtful, intentional introductions.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="experience"
      className="luxury-section bg-gradient-to-b from-obsidian-soft to-obsidian"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,194,123,0.1),transparent_55%)]" />
      </div>

      {/* Decorative numeral */}
      <div
        aria-hidden="true"
        className="section-numeral absolute right-[-3%] bottom-10 pointer-events-none hidden sm:block"
      >
        03
      </div>

      <div className="container mx-auto relative">
        <LuxuryScrollTrigger>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-kicker">How It Works</p>
            <h2 className="mt-5 text-display-lg text-ivory">
              Less swiping. Better chemistry.
            </h2>
            <p className="mt-6 text-body-lg text-ivory/60 font-light">
              Four steps. Designed to get you from application to real
              connection as smoothly as possible.
            </p>
          </div>
        </LuxuryScrollTrigger>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="mt-14 relative">
          {/* Connecting line — desktop only */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[2.6rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent pointer-events-none"
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="flex flex-col items-center text-center lg:items-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                {/* Number badge */}
                <div className="relative mb-6">
                  <div className="size-[4.5rem] rounded-full border border-champagne/25 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="font-headline text-xl text-champagne tracking-tight">
                      {step.number}
                    </span>
                  </div>
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-full bg-champagne/[0.06] blur-md" />
                </div>

                <h3 className="text-display-sm text-ivory mb-3">{step.title}</h3>
                <p className="text-body-sm text-ivory/52 font-light leading-relaxed max-w-[22ch] mx-auto">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
