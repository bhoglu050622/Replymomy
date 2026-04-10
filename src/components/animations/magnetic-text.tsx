"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useEffect, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface MagneticTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  strength?: number;
  radius?: number;
  staggerDelay?: number;
  initialDelay?: number;
}

function MagneticChar({
  char,
  index,
  mouseX,
  mouseY,
  strength,
  radius,
  staggerDelay,
  initialDelay,
}: {
  char: string;
  index: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  strength: number;
  radius: number;
  staggerDelay: number;
  initialDelay: number;
}) {
  const charRef = useRef<HTMLSpanElement>(null);

  const x = useTransform(mouseX, (latest) => {
    if (!charRef.current) return 0;
    const rect = charRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const distance = latest - centerX;
    const absDistance = Math.abs(distance);

    if (absDistance > radius) return 0;
    const factor = 1 - absDistance / radius;
    return (distance / radius) * strength * factor;
  });

  const y = useTransform(mouseY, (latest) => {
    if (!charRef.current) return 0;
    const rect = charRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distance = latest - centerY;
    const absDistance = Math.abs(distance);

    if (absDistance > radius) return 0;
    const factor = 1 - absDistance / radius;
    return (distance / radius) * strength * factor;
  });

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  return (
    <motion.span
      ref={charRef}
      className="inline-block"
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: initialDelay + index * staggerDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export function MagneticText({
  children,
  className,
  as: Component = "span",
  strength = 12,
  radius = 120,
  staggerDelay = 0.03,
  initialDelay = 0,
}: MagneticTextProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (reduced) {
    return (
      <Component className={className}>
        {children.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: initialDelay + i * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </Component>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn("inline-block", className)}
    >
      {children.split("").map((char, i) => (
        <MagneticChar
          key={i}
          char={char}
          index={i}
          mouseX={mouseX}
          mouseY={mouseY}
          strength={strength}
          radius={radius}
          staggerDelay={staggerDelay}
          initialDelay={initialDelay}
        />
      ))}
    </motion.div>
  );
}

interface MagneticWordProps {
  children: string;
  className?: string;
  strength?: number;
  radius?: number;
}

export function MagneticWord({
  children,
  className,
  strength = 15,
  radius = 150,
}: MagneticWordProps) {
  const reduced = useReducedMotion();
  const wordRef = useRef<HTMLSpanElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const x = useTransform(mouseX, (latest) => {
    if (!wordRef.current || reduced) return 0;
    const rect = wordRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const distance = latest - centerX;
    const absDistance = Math.abs(distance);

    if (absDistance > radius) return 0;
    const factor = 1 - absDistance / radius;
    return (distance / radius) * strength * factor;
  });

  const y = useTransform(mouseY, (latest) => {
    if (!wordRef.current || reduced) return 0;
    const rect = wordRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distance = latest - centerY;
    const absDistance = Math.abs(distance);

    if (absDistance > radius) return 0;
    const factor = 1 - absDistance / radius;
    return (distance / radius) * strength * factor;
  });

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={wordRef}
      className={cn("inline-block cursor-default", className)}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.span>
  );
}
