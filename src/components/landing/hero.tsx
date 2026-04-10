"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { AuroraBackground } from "@/components/animations/aurora-background";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useState, useEffect } from "react";


export function Hero() {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenRevealed, setHasBeenRevealed] = useState(false);

  // Once revealed, stay revealed (optional - can remove if want re-blur on leave)
  useEffect(() => {
    if (isHovered) {
      setHasBeenRevealed(true);
    }
  }, [isHovered]);

  const showFull = isHovered || hasBeenRevealed || reduced;

  return (
    <section
      className="relative h-screen w-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Layer 1: Blurry Preview Background (always visible behind) */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={{ scale: showFull ? 1.1 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <iframe
            src="https://www.unicorn.studio/embed/yGkBPF6rvy3oxuiGYvBf"
            className="w-full h-full border-0"
            style={{
              filter: "blur(20px) brightness(0.4) saturate(0.8)",
              transform: "scale(1.1)",
            }}
            allow="autoplay; fullscreen"
            loading="eager"
          />
        </motion.div>

        {/* Dark overlay for preview state */}
        <motion.div
          className="absolute inset-0 bg-obsidian/60"
          animate={{ opacity: showFull ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Hide Unicorn Studio badge on preview layer */}
        <div className="absolute bottom-0 right-0 w-48 h-12 bg-obsidian z-10" />
      </div>

      {/* Layer 2: Full WebGL (revealed on hover) */}
      <AnimatePresence>
        {showFull && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <iframe
              src="https://www.unicorn.studio/embed/yGkBPF6rvy3oxuiGYvBf"
              className="w-full h-full border-0"
              style={{
                filter: "brightness(0.7) saturate(1.2)",
              }}
              allow="autoplay; fullscreen"
              loading="eager"
            />

            {/* Gradient overlay for text readability */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(10, 10, 10, 0.4) 50%, rgba(10, 10, 10, 0.85) 100%)",
              }}
            />

            {/* Bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />

            {/* Hide Unicorn Studio badge */}
            <div className="absolute bottom-0 right-0 w-48 h-12 bg-obsidian" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview State Content (shown when not hovered) */}
      <AnimatePresence>
        {!showFull && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Teaser text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="size-5 text-champagne/60" />
                <span className="text-label text-champagne/60 tracking-widest uppercase">
                  Hover to enter
                </span>
                <Sparkles className="size-5 text-champagne/60" />
              </div>

              <h2 className="text-display-lg text-ivory/40 italic">
                Something awaits...
              </h2>

              {/* Subtle pulse indicator */}
              <motion.div
                className="mt-8"
                animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="size-6 text-champagne/30 mx-auto" />
              </motion.div>
            </motion.div>

            {/* Ambient particles in preview state */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute size-1 rounded-full bg-champagne/20"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.1, 0.4, 0.1],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Hero Content (shown when revealed) */}
      <AnimatePresence>
        {showFull && (
          <motion.div
            className="absolute bottom-16 inset-x-0 z-30 flex justify-center px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <GoldCtaButton className="animate-breathe-glow">
              Request Access
            </GoldCtaButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback for reduced motion — canvas aurora background */}
      {reduced && (
        <AuroraBackground className="absolute inset-0 z-0" />
      )}
    </section>
  );
}
