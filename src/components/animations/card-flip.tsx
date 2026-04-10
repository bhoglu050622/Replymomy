"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface CardFlipProps {
  front: ReactNode;
  back: ReactNode;
  delay?: number;
  className?: string;
}

export function CardFlip({ front, back, delay = 0, className }: CardFlipProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{back}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 180 }}
        whileInView={{ rotateY: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: 1.1,
          delay: delay + 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}
        >
          {back}
        </div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {front}
        </div>
      </motion.div>
    </motion.div>
  );
}
