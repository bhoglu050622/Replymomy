"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface LetterRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function LetterReveal({
  text,
  className,
  delay = 0,
  stagger = 0.04,
}: LetterRevealProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return (
      <span className={cn(className, "animate-fade-in-up")}>{text}</span>
    );
  }

  let charIndex = 0;
  return (
    <span className={cn("inline-block", className)} aria-label={text}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {word.split("").map((char) => {
            const index = charIndex++;
            return (
              <motion.span
                key={index}
                className="inline-block"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: delay + index * stagger,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {char}
              </motion.span>
            );
          })}
          {wordIdx < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}
