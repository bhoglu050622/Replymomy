"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface LuxuryMarqueeProps {
  items: string[];
  speed?: number;
  separator?: string;
  className?: string;
}

function TrackContent({ items, separator }: { items: string[]; separator: string }) {
  return (
    <>
      {items.map((item) => (
        <span key={item} className="inline-flex items-center">
          <span className="text-kicker text-ivory/38 tracking-[0.22em] px-2">{item}</span>
          <span className="text-champagne/35 px-2 text-[10px]">{separator}</span>
        </span>
      ))}
    </>
  );
}

export function LuxuryMarquee({
  items,
  speed = 65,
  separator = "·",
  className,
}: LuxuryMarqueeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!reduced) setReady(true);
  }, [reduced]);

  useGSAP(
    () => {
      if (!ready || !innerRef.current || !measureRef.current) return;

      const naturalWidth = measureRef.current.getBoundingClientRect().width;
      if (naturalWidth === 0) return;

      gsap.to(innerRef.current, {
        x: -naturalWidth,
        ease: "none",
        duration: naturalWidth / speed,
        repeat: -1,
      });
    },
    { dependencies: [ready, speed] }
  );

  if (reduced) {
    return (
      <div aria-hidden="true" className={`flex items-center justify-center gap-4 ${className ?? ""}`}>
        {items.map((item, i) => (
          <span key={item} className="inline-flex items-center gap-4">
            <span className="text-kicker text-ivory/38 tracking-[0.22em]">{item}</span>
            {i < items.length - 1 && (
              <span className="text-champagne/35 text-[10px]">{separator}</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={`relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] ${className ?? ""}`}
    >
      <div ref={innerRef} className="flex whitespace-nowrap will-change-transform">
        <div ref={measureRef} className="flex shrink-0 items-center">
          <TrackContent items={items} separator={separator} />
        </div>
        {ready && (
          <div className="flex shrink-0 items-center" aria-hidden="true">
            <TrackContent items={items} separator={separator} />
          </div>
        )}
      </div>
    </div>
  );
}
