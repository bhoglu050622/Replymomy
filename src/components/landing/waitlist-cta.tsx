"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { AuroraBackground } from "@/components/animations/aurora-background";
import { Button } from "@/components/ui/button";

export function WaitlistCta() {

  return (
    <section
      id="waitlist"
      className="relative min-h-[100svh] w-full overflow-hidden flex items-center bg-obsidian px-6 lg:px-12 py-28"
    >
      {/* Atmospheric depth layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74,14,26,0.38), transparent),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(201,168,76,0.05), transparent)
          `,
        }}
      />

      <AuroraBackground className="absolute inset-0 pointer-events-none" />

      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <LuxuryScrollTrigger>
          {/* Ornamental kicker */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-champagne/35" />
            <p className="text-kicker">Request Access</p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-champagne/35" />
          </div>

          {/* Dramatic headline */}
          <h2 className="mt-5 text-display-xl text-ivory leading-[0.9] tracking-[-0.025em] mx-auto max-w-4xl">
            Because your next relationship shouldn&apos;t start with{" "}
            <em className="text-gradient-gold not-italic font-accent">&ldquo;hey lol.&rdquo;</em>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-body-lg text-ivory/60 font-light">
            Membership is by invitation only. We review every request personally —
            if you&apos;re a good fit, you&apos;ll hear from us within 48 hours.
          </p>
        </LuxuryScrollTrigger>

        <LuxuryScrollTrigger delay={0.12}>
          <motion.div
            className="mt-10 flex justify-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <Link href="/apply">
              <Button
                variant="gold"
                size="lg"
                className="h-14 px-10 rounded-2xl text-sm animate-breathe-glow"
              >
                Apply for Early Access <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </LuxuryScrollTrigger>

        <LuxuryScrollTrigger delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/28">
            <span>No spam. Ever.</span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span>Every request reviewed by hand.</span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span>Your data is encrypted end to end.</span>
          </div>
        </LuxuryScrollTrigger>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/3 bg-gradient-to-r from-transparent via-champagne/20 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />
    </section>
  );
}
