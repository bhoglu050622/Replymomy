"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface VaultDoorProps {
  children: ReactNode;
}

export function VaultDoor({ children }: VaultDoorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const leftX = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-105%"]);
  const rightX = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "105%"]);
  const contentOpacity = useTransform(scrollYProgress, [0.4, 0.95], [0, 1]);

  if (reduced) {
    return (
      <div ref={ref} className="relative">
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative min-h-[600px] overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: contentOpacity }}
      >
        {children}
      </motion.div>

      {/* Left vault door half */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 z-10"
        style={{
          x: leftX,
          background:
            "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)",
          borderRight: "1px solid rgba(201, 168, 76, 0.3)",
          boxShadow: "inset -20px 0 40px rgba(0,0,0,0.6)",
        }}
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 size-16 rounded-full border-2 border-champagne/40 flex items-center justify-center">
          <div className="size-3 rounded-full bg-champagne" />
        </div>
      </motion.div>

      {/* Right vault door half */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 z-10"
        style={{
          x: rightX,
          background:
            "linear-gradient(225deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)",
          borderLeft: "1px solid rgba(201, 168, 76, 0.3)",
          boxShadow: "inset 20px 0 40px rgba(0,0,0,0.6)",
        }}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 size-16 rounded-full border-2 border-champagne/40 flex items-center justify-center">
          <div className="size-3 rounded-full bg-champagne" />
        </div>
      </motion.div>
    </div>
  );
}
