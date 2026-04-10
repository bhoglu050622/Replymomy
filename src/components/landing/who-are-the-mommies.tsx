"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { TextScramble } from "@/components/animations/text-scramble";
import { MagneticText } from "@/components/animations/magnetic-text";

export function WhoAreTheMommies() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms for layered effect
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const silhouetteY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  return (
    <section
      ref={sectionRef}
      id="icons"
      className="relative py-32 lg:py-48 px-6 lg:px-12 bg-obsidian overflow-hidden"
    >
      {/* Background gradient mesh */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(74, 14, 26, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201, 168, 76, 0.1) 0%, transparent 50%)",
          }}
        />
      </motion.div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left: Parallax silhouette image */}
        <ScrollReveal direction="left">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            {/* Background with parallax — uses generated image if available */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-burgundy via-smoke to-obsidian"
              style={{
                y: silhouetteY,
                backgroundImage: "url('/hero-texture.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Multiply overlay tints toward burgundy */}
            <div className="absolute inset-0 bg-burgundy/60" style={{ mixBlendMode: "multiply" }} />

            {/* Animated glow behind silhouette */}
            <motion.div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-champagne/20 blur-3xl"
              style={{
                scale: glowScale,
                opacity: glowOpacity,
              }}
            />

            {/* Stylized silhouette SVG */}
            <motion.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 300 400"
              preserveAspectRatio="xMidYMid slice"
              style={{ y: silhouetteY }}
            >
              <defs>
                <radialGradient id="silhouette" cx="50%" cy="40%">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#C9A84C" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Glow aura */}
              <ellipse
                cx="150"
                cy="180"
                rx="130"
                ry="200"
                fill="url(#silhouette)"
                filter="url(#glow)"
              />
              {/* Body silhouette */}
              <path
                d="M150,90 Q110,140 120,210 Q130,280 100,350 L200,350 Q170,280 180,210 Q190,140 150,90 Z"
                fill="#1A1A1A"
                opacity="0.9"
              />
              {/* Head */}
              <circle cx="150" cy="85" r="40" fill="#1A1A1A" opacity="0.9" />
              {/* Crown/halo effect */}
              <motion.ellipse
                cx="150"
                cy="60"
                rx="50"
                ry="15"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="0.5"
                strokeOpacity="0.5"
                animate={{
                  strokeOpacity: [0.3, 0.7, 0.3],
                  ry: [15, 18, 15],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.svg>

            {/* Floating gold particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute size-1 rounded-full bg-champagne/50"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />

            {/* Gold border with shimmer */}
            <div className="absolute inset-0 border border-champagne/20 rounded-2xl animate-shimmer-border" />
          </div>
        </ScrollReveal>

        {/* Right: Copy with parallax content */}
        <ScrollReveal direction="right" delay={0.2}>
          <motion.div className="space-y-8" style={{ y: contentY }}>
            <div className="text-label text-champagne tracking-widest uppercase">
              <TextScramble text="The Icons" delay={0.2} />
            </div>

            <h2 className="text-display-lg text-ivory">
              <span className="block">Who are</span>
              <MagneticText
                as="span"
                className="block italic text-champagne mt-1"
                strength={6}
                radius={80}
                staggerDelay={0.03}
                initialDelay={0.5}
              >
                the Icons?
              </MagneticText>
            </h2>

            <motion.p
              className="text-body-lg text-ivory/70 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Founders with exits. Creators with cults. Athletes with statues.
              They don&apos;t need introductions. They need peers who understand
              the weight of excellence.
            </motion.p>

            <motion.p
              className="text-accent-quote text-rose"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Earned, never bought.
            </motion.p>

            <motion.div
              className="pt-4 flex items-center gap-4 text-label text-ivory/40"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-champagne animate-pulse" />
                Verified
              </span>
              <span className="size-1 rounded-full bg-champagne/40" />
              <span>$1M+ ARR</span>
              <span className="size-1 rounded-full bg-champagne/40" />
              <span>Exceptional</span>
            </motion.div>
          </motion.div>
        </ScrollReveal>
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
