"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

interface TextScrambleProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  speed?: number;
  delay?: number;
  once?: boolean;
  trigger?: "inView" | "hover" | "mount";
}

export function TextScramble({
  text,
  className,
  as: Component = "span",
  speed = 40,
  delay = 0,
  once = true,
  trigger = "inView",
}: TextScrambleProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-100px" });
  const [displayText, setDisplayText] = useState(text);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (reduced) return;

    let shouldTrigger = false;

    switch (trigger) {
      case "inView":
        shouldTrigger = isInView;
        break;
      case "hover":
        shouldTrigger = isHovering;
        break;
      case "mount":
        shouldTrigger = true;
        break;
    }

    if (!shouldTrigger || (once && hasTriggered)) return;

    setHasTriggered(true);

    const chars = text.split("");
    const totalDuration = chars.length * speed;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;

      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / totalDuration, 1);
      const revealedIndex = Math.floor(progress * chars.length);

      const newText = chars
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedIndex) return text[i];

          // Scramble characters not yet revealed
          const scrambleIntensity = 1 - (i - revealedIndex) / (chars.length - revealedIndex);
          if (Math.random() > scrambleIntensity * 0.5) {
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          return text[i];
        })
        .join("");

      setDisplayText(newText);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    // Initial scramble
    setDisplayText(
      chars
        .map((char) =>
          char === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        )
        .join("")
    );

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, isHovering, text, speed, delay, once, trigger, hasTriggered, reduced]);

  if (reduced) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseEnter={() => trigger === "hover" && setIsHovering(true)}
      onMouseLeave={() => trigger === "hover" && setIsHovering(false)}
      initial={{ opacity: 0 }}
      animate={isInView || trigger !== "inView" ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Component>{displayText}</Component>
    </motion.div>
  );
}

interface ScrambleRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function ScrambleReveal({ children, className, delay = 0 }: ScrambleRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [displayText, setDisplayText] = useState(children);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (reduced || !isInView || hasAnimated) return;

    setHasAnimated(true);
    const chars = children.split("");
    const speed = 40;
    const totalDuration = chars.length * speed;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;

      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / totalDuration, 1);
      const revealedIndex = Math.floor(progress * chars.length);

      const newText = chars
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedIndex) return children[i];

          const scrambleIntensity = 1 - (i - revealedIndex) / (chars.length - revealedIndex);
          if (Math.random() > scrambleIntensity * 0.5) {
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          return children[i];
        })
        .join("");

      setDisplayText(newText);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayText(children);
      }
    };

    setDisplayText(
      chars
        .map((char) =>
          char === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        )
        .join("")
    );

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, children, delay, hasAnimated, reduced]);

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {reduced ? children : displayText}
    </motion.span>
  );
}
