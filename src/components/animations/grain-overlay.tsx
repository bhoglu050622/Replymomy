"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface GrainOverlayProps {
  opacity?: number;
  animated?: boolean;
  className?: string;
}

export function GrainOverlay({
  opacity = 0.08,
  animated = true,
  className,
}: GrainOverlayProps) {
  const reduced = useReducedMotion();
  const shouldAnimate = animated && !reduced;

  return (
    <>
      {/* Hidden SVG filter — must be in DOM for url(#grain-filter) to resolve */}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter
            id="grain-filter"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[100] pointer-events-none select-none",
          shouldAnimate && "animate-grain",
          className
        )}
        style={{
          filter: "url(#grain-filter)",
          mixBlendMode: "overlay",
          opacity,
        }}
      />
    </>
  );
}
