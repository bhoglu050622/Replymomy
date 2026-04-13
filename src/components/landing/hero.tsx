"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowDownRight, Check } from "lucide-react";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { AuroraBackground } from "@/components/animations/aurora-background";
import { LuxuryMarquee } from "@/components/landing/luxury-marquee";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/button";

const MARQUEE_ITEMS = [
  "Private Beta 2026",
  "Manually Reviewed Applications",
  "Verified Members Only",
  "Invitation Only",
  "No Public Sign-Up",
  "Real People. Real Conversations.",
];

const TRUST_PILLS = [
  "Verified Profiles Only",
  "Human Reviewed",
  "Private Beta 2026",
  "No Bots Ever",
];


export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.28, 0.72]);
  const layerY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const gradientY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 70, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 }
      )
        .fromTo(
          copyRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.85 },
          "-=0.65"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        );
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  const scrollToMembership = () =>
    document.getElementById("membership")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden pt-20 md:pt-24"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* CSS Fallback background - always visible behind iframe */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(74, 14, 26, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(232, 194, 123, 0.15) 0%, transparent 50%), linear-gradient(to bottom, #0A0A0A 0%, #1A1A1A 100%)",
          }}
        />

        <motion.div className="absolute inset-0 will-change-transform z-10" style={{ y: layerY }}>
          <iframe
            src="https://www.unicorn.studio/embed/yGkBPF6rvy3oxuiGYvBf"
            className="w-full h-full border-0"
            style={{
              filter: reduced
                ? "brightness(0.28) saturate(0.8)"
                : "brightness(0.48) saturate(1.1)",
              transform: "scale(1.06)",
            }}
            allow="autoplay; fullscreen"
            loading="eager"
          />
        </motion.div>

        {reduced && <AuroraBackground className="absolute inset-0 z-20 opacity-40" />}

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-obsidian/50 via-obsidian/30 to-obsidian"
          style={{ opacity: overlayOpacity }}
        />

        <motion.div className="absolute inset-0" style={{ y: gradientY }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(232,194,123,0.22),transparent_40%),radial-gradient(circle_at_32%_82%,rgba(74,14,26,0.36),transparent_52%)]" />
        </motion.div>
      </div>

      {/* Hero content — single column, left on desktop, centred copy on mobile */}
      <div className="container relative z-20 mx-auto min-h-[88svh] flex items-center px-6 lg:px-12">
        <div className="w-full max-w-2xl mx-auto lg:mx-0 py-16 text-center lg:text-left">
          <p className="text-kicker tracking-[0.28em] text-ivory/50 mb-8 uppercase">
            Private Dating, Done Better.
          </p>

          <h1
            ref={titleRef}
            className="font-headline text-display-xl text-ivory leading-[0.92] tracking-[-0.028em]"
          >
            Meet people{" "}
            <em className="text-gradient-gold not-italic font-accent">worth</em>
            <br />
            replying to.
          </h1>

          <p
            ref={copyRef}
            className="mt-8 text-body-lg text-ivory/56 font-light leading-[1.82]"
          >
            Dating for attractive, ambitious people tired of boring chats,
            ghosting, and endless swiping.
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center justify-center lg:justify-start"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
            >
              <Link href="/apply">
                <GoldCtaButton className="h-12 px-8 text-xs w-full sm:w-auto">
                  Request Invitation <ArrowDownRight className="size-4" />
                </GoldCtaButton>
              </Link>
            </motion.div>

            <Button
              variant="gold-outline"
              className="h-12 rounded-full border-champagne/25 px-7 text-xs text-ivory/78 hover:text-champagne"
              onClick={scrollToMembership}
            >
              Explore Membership
            </Button>
          </div>

          {/* Trust pills */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
            {TRUST_PILLS.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-champagne/[0.07] border border-champagne/[0.15] text-label text-ivory/52"
              >
                <Check className="size-3 text-champagne/65 shrink-0" />
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom marquee ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-champagne/[0.08] py-3.5">
        <LuxuryMarquee items={MARQUEE_ITEMS} speed={55} />
      </div>
    </section>
  );
}
