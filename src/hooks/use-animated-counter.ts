"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface UseAnimatedCounterOptions {
  target: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  format?: (n: number) => string;
}

export function useAnimatedCounter<T extends HTMLElement = HTMLElement>({
  target,
  duration = 1.8,
  delay = 0,
  suffix = "",
  format,
}: UseAnimatedCounterOptions) {
  const formatFn = format ?? ((n: number) => n.toLocaleString());
  const ref = useRef<T>(null);
  const [displayValue, setDisplayValue] = useState(() => formatFn(0) + suffix);
  const reduced = useReducedMotion();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplayValue(formatFn(target) + suffix);
      return;
    }

    if (!ref.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const obj = { val: 0 };
          const tween = gsap.to(obj, {
            val: target,
            duration,
            delay,
            ease: "power2.out",
            onUpdate() {
              setDisplayValue(formatFn(Math.round(obj.val)) + suffix);
            },
            onComplete() {
              setDisplayValue(formatFn(target) + suffix);
            },
          });

          return () => {
            tween.kill();
          };
        }
      },
      { threshold: 0.1, rootMargin: "-60px 0px" }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  // format function is intentionally stable — callers should memoize if needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, target, duration, delay, suffix]);

  return { ref, displayValue };
}
