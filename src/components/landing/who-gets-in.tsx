"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Shield, Eye, Crown, Check, LockKeyhole } from "lucide-react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { LetterReveal } from "@/components/animations/letter-reveal";
import { AuroraBackground } from "@/components/animations/aurora-background";

const CRITERIA = [
  {
    icon: Shield,
    title: "Identity verified",
    description:
      "We confirm who you are before anyone sees your profile. Real identity, real people — no catfishing, no guessing.",
  },
  {
    icon: Eye,
    title: "Privacy protected",
    description:
      "Every member signs a confidentiality agreement. Your profile is never public, and your data never leaves the platform.",
  },
  {
    icon: Crown,
    title: "Genuine intent required",
    description:
      "We look for people who are actually here to connect — not to collect matches or fill a feed.",
  },
];

export function WhoGetsIn() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const shieldScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 1.14]);
  const shieldRotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);

  return (
    <section
      ref={sectionRef}
      id="protocol"
      className="luxury-section bg-gradient-to-b from-obsidian to-obsidian-soft"
    >
      <AuroraBackground className="absolute inset-0 pointer-events-none" />

      {/* Decorative section numeral */}
      <div
        aria-hidden="true"
        className="section-numeral absolute left-[-4%] top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block"
      >
        02
      </div>

      <div className="container relative mx-auto">
        {/* Centered heading */}
        <LuxuryScrollTrigger>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-kicker">How We Keep It Good</p>
            <h2 className="mt-5 text-display-lg text-ivory">
              <LetterReveal
                text="We care more about who joins than how many."
                stagger={0.018}
              />
            </h2>
            <p className="mt-6 text-body-lg text-ivory/68 font-light">
              No bots. Invitation-only. The people you meet here cleared
              the same bar you did.
            </p>
          </div>
        </LuxuryScrollTrigger>

        <div className="mt-14 grid items-center gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Pull-quote card */}
          <LuxuryScrollTrigger fromY={24}>
            <motion.div
              className="luxury-glass-deep relative overflow-hidden rounded-3xl p-8 md:p-10 border-l-2 border-champagne/25"
              style={{ scale: shieldScale }}
            >
              {/* Decorative large open-quote mark */}
              <span
                aria-hidden="true"
                className="absolute -top-4 left-3 font-headline text-[8rem] leading-none text-champagne/[0.07] select-none pointer-events-none"
              >
                &ldquo;
              </span>

              {/* Rotating lock icon */}
              <motion.div
                className="absolute -right-8 top-6 rounded-full border border-champagne/20 bg-smoke/70 p-4 backdrop-blur-md"
                style={{ rotate: shieldRotate }}
              >
                <LockKeyhole className="size-7 text-champagne" />
              </motion.div>

              <p
                className="font-accent italic text-ivory/90 leading-[1.35] relative z-10"
                style={{ fontSize: "clamp(1.45rem, 2.6vw, 2.1rem)" }}
              >
                &ldquo;We didn&rsquo;t build another app. We built a place where the bar actually means something.&rdquo;
              </p>

              <div className="mt-8 border-t border-champagne/15">
                <div className="grid grid-cols-2 divide-x divide-champagne/10">
                  {[
                    { label: "Applications reviewed personally", value: "100%" },
                    { label: "Typical decision window", value: "48h" },
                    { label: "Identity verification steps", value: "7" },
                    { label: "Confidentiality agreement required", value: "Always" },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className={[
                        "py-5",
                        i % 2 === 0 ? "pr-6" : "pl-6",
                        i >= 2 ? "border-t border-champagne/10" : "",
                      ].join(" ")}
                    >
                      <p className="font-headline text-[2.6rem] leading-none tracking-tight text-champagne">
                        {item.value}
                      </p>
                      <p className="mt-2 text-body-sm text-ivory/45 font-light leading-snug">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </LuxuryScrollTrigger>

          {/* Criteria cards with ordinal */}
          <div className="space-y-4">
            {CRITERIA.map((criterion, index) => (
              <LuxuryScrollTrigger key={criterion.title} delay={index * 0.08}>
                <article className="luxury-glass rounded-2xl p-6 relative overflow-hidden">
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-5 font-headline text-[3.5rem] leading-none text-champagne/[0.07] select-none pointer-events-none"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl border border-champagne/30 bg-obsidian/60">
                    <criterion.icon className="size-5 text-champagne" />
                  </div>
                  <h3 className="text-display-sm text-ivory">{criterion.title}</h3>
                  <p className="mt-2 text-body-md text-ivory/64">{criterion.description}</p>
                </article>
              </LuxuryScrollTrigger>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <LuxuryScrollTrigger delay={0.25}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-label text-ivory/40">
            {[
              "Invitation preferred",
              "No public directory",
              "End-to-end encrypted",
              "Privacy by design",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-champagne/20 px-4 py-2"
              >
                <Check className="size-3 text-champagne" />
                {item}
              </span>
            ))}
          </div>
        </LuxuryScrollTrigger>
      </div>
    </section>
  );
}
