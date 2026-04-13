import Link from "next/link";

interface Props {
  currentTier: string | null;
  limit: number;
}

export function ProfileBrowseLimitWall({ currentTier, limit }: Props) {
  const isFree = currentTier === null;

  return (
    <div className="px-6 lg:px-12 py-16 lg:py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-10">
      <div className="size-20 rounded-full bg-smoke border border-champagne/30 flex items-center justify-center">
        {/* Lock icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-champagne/60"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <div className="space-y-3">
        <div className="text-label text-champagne">Limit reached</div>
        <h1 className="text-display-lg text-ivory">
          You&apos;ve browsed
          <br />
          <span className="italic text-champagne">{limit} profiles.</span>
        </h1>
        <p className="text-body-md text-ivory/60 max-w-sm mx-auto">
          Free members can browse 20 profiles. Upgrade to Pro or Unlimited for unrestricted access.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/settings/subscription?highlight=pro"
          className="flex items-center justify-center gap-2 w-full h-14 rounded-full bg-gradient-to-r from-champagne to-champagne/80 text-obsidian font-medium text-body-sm hover:opacity-90 transition-opacity"
        >
          Upgrade to Pro — from ₹499/mo
        </Link>
        <Link
          href="/settings/subscription"
          className="flex items-center justify-center w-full h-12 rounded-full border border-champagne/30 text-champagne text-body-sm hover:border-champagne/60 transition-colors"
        >
          View all plans
        </Link>
        <Link
          href="/dashboard"
          className="block text-label text-ivory/30 hover:text-ivory/50 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
