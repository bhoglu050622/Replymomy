"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Heart, MessageCircle, Gift, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { TextScramble } from "@/components/animations/text-scramble";
import { MagneticText } from "@/components/animations/magnetic-text";

const FEATURES = [
  { icon: Heart, label: "Curated Introductions", delay: 0 },
  { icon: MessageCircle, label: "Encrypted Dialogue", delay: 1 },
  { icon: Gift, label: "Meaningful Exchange", delay: 2 },
  { icon: Sparkles, label: "Private Gatherings", delay: 3 },
];

export function TheExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Scroll-linked animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Phone 3D transforms
  const phoneY = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const phoneRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const phoneRotateY = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.9]);

  // Feature orbiting animations
  const orbitProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative py-32 lg:py-48 px-6 lg:px-12 bg-obsidian overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-champagne/5 blur-3xl"
          style={{
            scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]),
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]),
          }}
        />
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <div className="text-label text-champagne mb-6 tracking-widest uppercase">
              <TextScramble text="Inside" delay={0.1} />
            </div>
            <h2 className="text-display-lg text-ivory mb-6">
              The{" "}
              <MagneticText
                as="span"
                className="italic text-champagne"
                strength={6}
                radius={80}
                staggerDelay={0.03}
                initialDelay={0.2}
              >
                experience
              </MagneticText>
            </h2>
            <p className="text-body-lg text-ivory/60 max-w-xl mx-auto">
              Built for depth, not volume.
            </p>
          </div>
        </ScrollReveal>

        {/* 3D Phone with orbiting features */}
        <ScrollReveal>
          <div className="relative max-w-md mx-auto h-[600px] flex items-center justify-center">
            {/* Orbit paths for features */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer orbit ring */}
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full border border-champagne/10"
                style={{ opacity: useTransform(scrollYProgress, [0.2, 0.5], [0, 1]) }}
              />
            </div>

            {/* Floating feature badges - orbiting */}
            {FEATURES.map((feature, i) => {
              const angle = (i * 90 + 45) * (Math.PI / 180);
              const radius = 220;

              return (
                <motion.div
                  key={feature.label}
                  className="absolute hidden md:block"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                    top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                    translateX: "-50%",
                    translateY: "-50%",
                    opacity: useTransform(
                      orbitProgress,
                      [0, 0.3 + i * 0.15, 0.6 + i * 0.1],
                      [0, 0, 1]
                    ),
                    scale: useTransform(
                      orbitProgress,
                      [0, 0.3 + i * 0.15, 0.6 + i * 0.1],
                      [0.5, 0.8, 1]
                    ),
                  }}
                >
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-smoke/80 border border-champagne/30 backdrop-blur-xl"
                    animate={{
                      y: [0, -8, 0],
                      boxShadow: [
                        "0 0 0 rgba(201, 168, 76, 0)",
                        "0 0 20px rgba(201, 168, 76, 0.2)",
                        "0 0 0 rgba(201, 168, 76, 0)",
                      ],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                    whileHover={{ scale: 1.1, borderColor: "rgba(201, 168, 76, 0.6)" }}
                  >
                    <feature.icon className="size-4 text-champagne" />
                    <span className="text-label text-ivory whitespace-nowrap">{feature.label}</span>
                  </motion.div>
                </motion.div>
              );
            })}

            {/* 3D Phone mockup */}
            <motion.div
              ref={phoneRef}
              className="relative"
              style={{
                y: phoneY,
                rotateX: phoneRotateX,
                rotateY: phoneRotateY,
                scale: phoneScale,
                perspective: 1000,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Phone frame */}
              <div className="relative w-72 mx-auto">
                {/* Phone body with 3D depth */}
                <div
                  className="relative aspect-[9/19] rounded-[3rem] border-[12px] border-smoke bg-gradient-to-b from-obsidian to-smoke overflow-hidden shadow-2xl"
                  style={{
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(201, 168, 76, 0.1)",
                  }}
                >
                  {/* Screen content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-smoke to-obsidian">
                    {/* Status bar */}
                    <div className="h-8 flex items-center justify-center">
                      <div className="w-20 h-5 rounded-full bg-smoke/80" />
                    </div>

                    {/* App content */}
                    <div className="px-6 py-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <motion.span
                          className="font-headline text-champagne text-lg"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          Tonight
                        </motion.span>
                        <span className="text-[10px] text-ivory/40 uppercase tracking-widest">
                          3 matches
                        </span>
                      </div>

                      {/* Match card with shimmer */}
                      <motion.div
                        className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-burgundy/50 to-smoke border border-champagne/20 relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Shimmer overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />

                        <div className="absolute inset-0 backdrop-blur-md bg-obsidian/30" />

                        {/* Profile placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-champagne/20 to-transparent" />
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="text-ivory font-headline text-xl">Anonymous</div>
                          <div className="text-ivory/60 text-xs">Reveal at midnight</div>
                        </div>
                      </motion.div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <motion.div
                          className="flex-1 h-10 rounded-full border border-ivory/20 flex items-center justify-center"
                          whileHover={{ borderColor: "rgba(201, 168, 76, 0.4)" }}
                        >
                          <span className="text-xs text-ivory/50">Pass</span>
                        </motion.div>
                        <motion.div
                          className="flex-1 h-10 rounded-full bg-gradient-to-r from-champagne-500 to-champagne-400 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-xs text-obsidian font-medium">Connect</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Screen reflection */}
                  <div
                    className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)",
                    }}
                  />
                </div>

                {/* Phone shadow */}
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-8 rounded-full blur-xl"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                  }}
                />
              </div>
            </motion.div>

            {/* Mobile feature badges (simpler layout) */}
            <div className="absolute -bottom-8 left-0 right-0 flex flex-wrap justify-center gap-3 md:hidden">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-smoke/80 border border-champagne/30"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <feature.icon className="size-3 text-champagne" />
                  <span className="text-[10px] text-ivory">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom tagline */}
        <ScrollReveal delay={0.3}>
          <motion.p
            className="text-center text-accent-quote text-ivory/40 mt-16 md:mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            One introduction can change everything.
          </motion.p>
        </ScrollReveal>
      </div>
    </section>
  );
}
