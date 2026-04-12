"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface LuxuryScrollTriggerProps {
  children: ReactNode;
  className?: string;
  fromY?: number;
  delay?: number;
}

export function LuxuryScrollTrigger({
  children,
  className,
  fromY = 48,
  delay = 0,
}: LuxuryScrollTriggerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!rootRef.current || reduced) return;

      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        rootRef.current,
        { y: fromY, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 82%",
            once: true,
          },
        }
      );
    },
    { scope: rootRef, dependencies: [reduced, fromY, delay] }
  );

  return (
    <div ref={rootRef} className={cn(reduced ? "" : "opacity-0", className)}>
      {children}
    </div>
  );
}
