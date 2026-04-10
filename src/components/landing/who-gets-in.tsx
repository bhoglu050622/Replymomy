"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { Shield, Eye, Crown, Check } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { TextScramble } from "@/components/animations/text-scramble";
import { MagneticText } from "@/components/animations/magnetic-text";
import { AuroraBackground } from "@/components/animations/aurora-background";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const CRITERIA = [
  {
    icon: Shield,
    title: "Verified Excellence",
    description:
      "Not wealth displayed, but impact proven. Annual revenue of $1M+, confirmed quietly through trusted partners.",
  },
  {
    icon: Eye,
    title: "Discretion Bond",
    description:
      "What happens here evaporates like morning fog. Your privacy isn't a feature—it's the foundation.",
  },
  {
    icon: Crown,
    title: "Sponsor Required",
    description:
      "Someone already inside must vouch for you. That's how guilds work. That's how trust scales.",
  },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const reduced = useReducedMotion();

  return (
    <motion.span
      ref={ref}
      className="font-headline text-champagne text-5xl md:text-6xl"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {isInView && !reduced ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {value.toLocaleString()}
          {suffix}
        </motion.span>
      ) : (
        <span>0{suffix}</span>
      )}
    </motion.span>
  );
}

function CriteriaCard({
  criterion,
  index,
}: {
  criterion: (typeof CRITERIA)[0];
  index: number;
}) {
  const reduced = useReducedMotion();

  return (
    <ScrollReveal delay={index * 0.15}>
      <motion.div
        className="group relative h-full p-10 rounded-2xl bg-smoke border border-champagne/10 overflow-hidden"
        whileHover={!reduced ? { borderColor: "rgba(201, 168, 76, 0.4)" } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Animated gold glow on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-champagne/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
        />

        {/* Metallic sheen sweep */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 animate-metallic-sheen" />
        </div>

        <div className="relative">
          {/* Icon with glow */}
          <motion.div
            className="size-14 rounded-full border border-champagne/30 flex items-center justify-center mb-6 group-hover:border-champagne/60 transition-colors duration-500"
            whileHover={!reduced ? { scale: 1.1 } : {}}
            transition={{ duration: 0.3 }}
          >
            <criterion.icon className="size-6 text-champagne group-hover:text-champagne-300 transition-colors duration-300" />
          </motion.div>

          <h3 className="text-display-md text-ivory mb-4 group-hover:text-ivory/90 transition-colors">
            {criterion.title}
          </h3>
          <p className="text-body-md text-ivory/60 group-hover:text-ivory/70 transition-colors">
            {criterion.description}
          </p>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
          <div className="absolute top-0 right-0 w-px h-12 bg-gradient-to-b from-champagne/40 to-transparent transform origin-top" />
          <div className="absolute top-0 right-0 h-px w-12 bg-gradient-to-l from-champagne/40 to-transparent transform origin-right" />
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export function WhoGetsIn() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Vault door scroll animation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const leftX = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-105%"]);
  const rightX = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "105%"]);
  const contentOpacity = useTransform(scrollYProgress, [0.4, 0.95], [0, 1]);
  const lockRotation = useTransform(scrollYProgress, [0.3, 0.6], [0, 360]);

  return (
    <section
      ref={sectionRef}
      id="access"
      className="relative py-32 lg:py-48 px-6 lg:px-12 bg-gradient-to-b from-obsidian via-smoke to-obsidian overflow-hidden"
    >
      {/* Background — canvas aurora */}
      <AuroraBackground className="absolute inset-0 pointer-events-none" />

      <div className="container mx-auto relative">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <div className="text-label text-champagne mb-6 tracking-widest uppercase">
              <TextScramble text="The 0.1% guild. Invitation only." delay={0.1} />
            </div>
            <h2 className="text-display-lg text-ivory mb-6">
              <span className="block">Not everyone</span>
              <MagneticText
                as="span"
                className="block italic text-champagne mt-1"
                strength={8}
                radius={100}
                staggerDelay={0.04}
                initialDelay={0.3}
              >
                gets invited.
              </MagneticText>
            </h2>
            <p className="text-body-lg text-ivory/60 max-w-xl mx-auto">
              A private guild for those who&apos;ve transcended ordinary networks.
              Some doors don&apos;t have handles.
            </p>
          </div>
        </ScrollReveal>

        {/* Vault Door Animation Container */}
        <div className="relative min-h-[600px] overflow-hidden mb-24">
          {/* Content revealed behind vault doors */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-0"
            style={{ opacity: reduced ? 1 : contentOpacity }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl px-4">
              {CRITERIA.map((criterion, i) => (
                <CriteriaCard key={criterion.title} criterion={criterion} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Vault doors - only animate if not reduced motion */}
          {!reduced && (
            <>
              {/* Left vault door half */}
              <motion.div
                className="absolute inset-y-0 left-0 w-1/2 z-10 pointer-events-none"
                style={{
                  x: leftX,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)",
                    borderRight: "1px solid rgba(201, 168, 76, 0.3)",
                    boxShadow: "inset -20px 0 40px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Metallic texture overlay */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(201,168,76,0.1)_0%,_transparent_70%)]" />

                  {/* Lock mechanism */}
                  <motion.div
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ rotate: lockRotation }}
                  >
                    <div className="size-16 rounded-full border-2 border-champagne/40 flex items-center justify-center bg-smoke/50 backdrop-blur-sm">
                      <div className="size-3 rounded-full bg-champagne animate-pulse" />
                    </div>
                    {/* Lock handle */}
                    <div className="absolute top-1/2 left-1/2 w-8 h-1 bg-champagne/60 -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>

                  {/* Door frame detail */}
                  <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-champagne/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-champagne/20 to-transparent" />
                </div>
              </motion.div>

              {/* Right vault door half */}
              <motion.div
                className="absolute inset-y-0 right-0 w-1/2 z-10 pointer-events-none"
                style={{
                  x: rightX,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(225deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)",
                    borderLeft: "1px solid rgba(201, 168, 76, 0.3)",
                    boxShadow: "inset 20px 0 40px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Metallic texture overlay */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(201,168,76,0.1)_0%,_transparent_70%)]" />

                  {/* Lock mechanism */}
                  <motion.div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ rotate: lockRotation }}
                  >
                    <div className="size-16 rounded-full border-2 border-champagne/40 flex items-center justify-center bg-smoke/50 backdrop-blur-sm">
                      <div className="size-3 rounded-full bg-champagne animate-pulse" />
                    </div>
                    {/* Lock handle */}
                    <div className="absolute top-1/2 left-1/2 w-8 h-1 bg-champagne/60 -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>

                  {/* Door frame detail */}
                  <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-l from-champagne/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-l from-champagne/20 to-transparent" />
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Waitlist counter - outside vault */}
        <ScrollReveal>
          <motion.div
            className="text-center py-12 px-8 rounded-2xl bg-smoke/50 border border-champagne/20 max-w-2xl mx-auto relative overflow-hidden"
            whileHover={{ borderColor: "rgba(201, 168, 76, 0.4)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Subtle background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-champagne/5 via-transparent to-champagne/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-baseline justify-center gap-3 mb-2">
              <AnimatedCounter value={4872} />
              <span className="text-body-md text-ivory/50">waiting.</span>
            </div>
            <div className="flex items-baseline justify-center gap-3">
              <span className="font-headline text-burgundy-300 text-2xl italic">
                312
              </span>
              <span className="text-label text-ivory/40">accepted this season.</span>
            </div>

            {/* Status indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-label text-ivory/40">Applications open</span>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
