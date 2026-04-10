"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AuthError({
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
    <div className="text-center space-y-8 max-w-md mx-auto py-16">
      <div className="text-label text-champagne">⸻ Error ⸻</div>
      <h2 className="font-headline text-4xl text-ivory">
        Something went <span className="italic text-champagne">wrong.</span>
      </h2>
      <p className="text-body-md text-ivory/60">
        We couldn&apos;t process your request. Please try again.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full border border-champagne/30 text-champagne text-label hover:border-champagne transition-colors"
        >
          Try again
        </button>
        <Link
          href="/login"
          className="px-6 py-3 rounded-full bg-champagne text-obsidian text-label hover:bg-champagne/90 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
