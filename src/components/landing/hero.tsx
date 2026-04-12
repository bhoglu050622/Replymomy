"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowDownRight, Check } from "lucide-react";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { AuroraBackground } from "@/components/animations/aurora-background";
import { LuxuryMarquee } from "@/components/landing/luxury-marquee";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MARQUEE_ITEMS = [
  "Private Beta 2026",
  "Manually Reviewed Applications",
  "Verified Members Only",
  "Invitation Preferred",
  "No Public Sign-Up",
  "Real People. Real Conversations.",
];

const TRUST_PILLS = [
  "Verified Profiles Only",
  "Human Reviewed",
  "Private Beta 2026",
  "No Bots Ever",
];

const MOCK_PROFILES = [
  {
    name: "Sofia",
    age: 27,
    city: "New York",
    tags: ["Art", "Travel"],
    gradient: "from-rose-300/25 to-[#4A0E1A]/70",
    floatDelay: 0,
    position: "left-[2%] top-[12%] z-30",
  },
  {
    name: "Isabelle",
    age: 29,
    city: "London",
    tags: ["Fashion", "Culture"],
    gradient: "from-amber-200/20 to-[#C9A84C]/35",
    floatDelay: 0.8,
    position: "left-[28%] top-[28%] z-20",
  },
  {
    name: "Maya",
    age: 26,
    city: "Los Angeles",
    tags: ["Creative", "Wellness"],
    gradient: "from-violet-300/20 to-purple-800/55",
    floatDelay: 1.6,
    position: "left-[54%] top-[8%] z-10",
  },
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
  const cardsY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

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

  const scrollToWaitlist = () =>
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  const scrollToMembership = () =>
    document.getElementById("membership")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden pt-20 md:pt-24"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: layerY }}>
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

        {reduced && <AuroraBackground className="absolute inset-0 z-0 opacity-40" />}

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-obsidian/50 via-obsidian/30 to-obsidian"
          style={{ opacity: overlayOpacity }}
        />

        <motion.div className="absolute inset-0" style={{ y: gradientY }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(232,194,123,0.22),transparent_40%),radial-gradient(circle_at_32%_82%,rgba(74,14,26,0.36),transparent_52%)]" />
        </motion.div>
      </div>

      {/* Hero content — two-column grid */}
      <div className="container relative z-20 mx-auto min-h-[88svh] flex items-center px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full py-16">

          {/* ── Left column: copy ── */}
          <div className="max-w-xl">
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
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <GoldCtaButton className="h-12 px-8 text-xs" onClick={scrollToWaitlist}>
                  Apply for Early Access <ArrowDownRight className="size-4" />
                </GoldCtaButton>
              </motion.div>

              <Button
                variant="gold-outline"
                className="h-12 rounded-full border-champagne/25 px-7 text-xs text-ivory/78 hover:text-champagne"
                onClick={scrollToMembership}
              >
                Join Founding Cohort
              </Button>
            </div>

            {/* Trust pills */}
            <div className="mt-8 flex flex-wrap gap-2">
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

          {/* ── Right column: floating profile cards ── */}
          <motion.div
            className="relative hidden lg:block h-[480px]"
            style={{ y: cardsY }}
            aria-hidden="true"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,194,123,0.07),transparent_65%)] pointer-events-none" />

            {/* Profile cards */}
            {MOCK_PROFILES.map((profile) => (
              <motion.div
                key={profile.name}
                className={cn(
                  "absolute luxury-glass-deep rounded-3xl p-5 w-[195px]",
                  profile.position
                )}
                animate={reduced ? {} : { y: [0, -10, 0] }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: profile.floatDelay,
                }}
              >
                {/* Avatar area */}
                <div
                  className={cn(
                    "size-12 rounded-2xl bg-gradient-to-br mb-3 flex items-center justify-center",
                    profile.gradient
                  )}
                >
                  <span className="text-ivory/70 font-headline text-lg">
                    {profile.name[0]}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-body-md text-ivory font-medium">{profile.name}</span>
                  <span className="text-body-sm text-ivory/32">{profile.age}</span>
                </div>
                <p className="text-body-sm text-ivory/38 mb-3">{profile.city}</p>

                <div className="flex flex-wrap gap-1">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-champagne/10 border border-champagne/[0.18] text-[10px] text-champagne/60 tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* "New match!" floating badge */}
            <motion.div
              className="absolute bottom-[18%] right-[2%] z-40 luxury-glass rounded-2xl px-4 py-2.5 flex items-center gap-2.5 border border-champagne/25"
              animate={reduced ? {} : { y: [0, -7, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-champagne opacity-60 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-champagne" />
              </span>
              <span className="text-body-sm text-champagne font-medium">New match!</span>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Bottom marquee ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-champagne/[0.08] py-3.5">
        <LuxuryMarquee items={MARQUEE_ITEMS} speed={55} />
      </div>
    </section>
  );
}
