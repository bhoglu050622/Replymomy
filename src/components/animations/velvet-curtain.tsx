"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface VelvetCurtainProps {
  children: ReactNode;
  onComplete?: () => void;
}

export function VelvetCurtain({ children, onComplete }: VelvetCurtainProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"hold" | "exit" | "done">("hold");

  useEffect(() => {
    if (reduced) {
      setPhase("done");
      onComplete?.();
      return;
    }

    // Hold preloader for 1.8s then exit
    const holdTimer = setTimeout(() => {
      setPhase("exit");
    }, 1800);

    return () => clearTimeout(holdTimer);
  }, [reduced, onComplete]);

  useEffect(() => {
    if (phase === "exit") {
      // After exit animation (900ms), mark done
      const doneTimer = setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 900);
      return () => clearTimeout(doneTimer);
    }
  }, [phase, onComplete]);

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Content always rendered underneath */}
      {children}

      {/* Preloader overlay */}
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "#0A0A0A" }}
            initial={{ opacity: 1 }}
            animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Wordmark */}
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={
                phase === "exit"
                  ? { opacity: 0, y: -8, scale: 1.04 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={
                phase === "exit"
                  ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
            >
              {/* Top rule */}
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="h-px w-16"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #C9A84C, transparent)",
                  }}
                />
                <span className="text-champagne/60 text-xs tracking-[0.3em]">✦</span>
                <div
                  className="h-px w-16"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #C9A84C, transparent)",
                  }}
                />
              </motion.div>

              {/* Name */}
              <motion.h1
                className="font-headline text-4xl md:text-6xl text-champagne tracking-[0.25em] uppercase"
                initial={{ opacity: 0, letterSpacing: "0.1em" }}
                animate={{ opacity: 1, letterSpacing: "0.25em" }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                The Guild
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-ivory/30 text-xs tracking-[0.4em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Invitation Only
              </motion.p>

              {/* Bottom rule */}
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="h-px w-16"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #C9A84C, transparent)",
                  }}
                />
                <span className="text-champagne/60 text-xs tracking-[0.3em]">✦</span>
                <div
                  className="h-px w-16"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #C9A84C, transparent)",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Loading bar at bottom */}
            <motion.div
              className="absolute bottom-0 left-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
              initial={{ width: "0%", opacity: 0.6 }}
              animate={
                phase === "exit"
                  ? { width: "100%", opacity: 0 }
                  : { width: "60%", opacity: 0.6 }
              }
              transition={
                phase === "exit"
                  ? { duration: 0.4, ease: "easeIn" }
                  : { duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
