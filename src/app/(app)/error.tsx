"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
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
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-label text-champagne">⸻ Error ⸻</div>
        <h2 className="font-headline text-4xl text-ivory">
          Something went <span className="italic text-champagne">wrong.</span>
        </h2>
        <p className="text-body-md text-ivory/60">
          We couldn&apos;t load this page. Try again or return to your dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full border border-champagne/30 text-champagne text-label hover:border-champagne transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full bg-champagne text-obsidian text-label hover:bg-champagne/90 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
