"use client";

import { useEffect } from "react";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">
        <div className="text-label text-champagne">⸻ Something went wrong ⸻</div>
        <h1 className="text-display-lg text-ivory">
          An error <span className="italic text-champagne">occurred.</span>
        </h1>
        <p className="text-body-md text-ivory/60">
          We&apos;re sorry about that. Please try again.
        </p>
        <GoldCtaButton onClick={reset}>Try again</GoldCtaButton>
      </div>
    </div>
  );
}
