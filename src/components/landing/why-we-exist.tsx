"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { LetterReveal } from "@/components/animations/letter-reveal";

export function WhyWeExist() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-obsidian py-28 md:py-36 px-6 lg:px-12"
    >
      {/* Decorative gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(74,14,26,0.22), transparent)",
        }}
      />

      {/* Animated vertical rule */}
      <motion.div
        className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-champagne/[0.08] to-transparent"
        style={{ y: lineY }}
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-3xl relative">
        <LuxuryScrollTrigger>
          <p className="text-kicker text-center mb-8">Why We Exist</p>
        </LuxuryScrollTrigger>

        <LuxuryScrollTrigger delay={0.08}>
          <h2 className="text-display-lg text-ivory text-center leading-[1.1] tracking-[-0.02em]">
            <LetterReveal
              text="Dating apps got louder. We got more intentional."
              stagger={0.016}
            />
          </h2>
        </LuxuryScrollTrigger>

        <LuxuryScrollTrigger delay={0.18}>
          <div className="mt-10 space-y-6 text-body-lg text-ivory/62 font-light leading-[1.78] text-center max-w-2xl mx-auto">
            <p>
              More swipes, more matches, less meaning. Apps are built to keep
              you scrolling — not to help you actually meet someone.
            </p>
            <p>
              Built for people who want better conversations, real chemistry,
              and introductions that actually go somewhere.
            </p>
          </div>
        </LuxuryScrollTrigger>

        {/* Decorative rule */}
        <LuxuryScrollTrigger delay={0.28}>
          <div className="mt-12 flex items-center justify-center gap-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-champagne/30" />
            <span className="text-champagne/35 text-[10px] tracking-[0.3em] uppercase">
              Private beta begins 2026
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-champagne/30" />
          </div>
        </LuxuryScrollTrigger>
      </div>
    </section>
  );
}
