import Link from "next/link";

const VARIANTS = {
  matches: {
    headline: "No matches yet.",
    description: "Your daily curation is being prepared.",
  },
  "no-matches-today": {
    headline: "Check back tonight.",
    description: "New introductions arrive each evening.",
  },
  gallery: {
    headline: "Nothing here yet.",
    description: "Photos will appear as connections form.",
  },
  chat: {
    headline: "No conversations yet.",
    description: "Accept a match to begin chatting.",
  },
  knowledge: {
    headline: "No articles available.",
    description: "The knowledge hub is being curated.",
  },
  gifts: {
    headline: "No gifts yet.",
    description: "Send or receive gifts through your matches.",
  },
  notifications: {
    headline: "No notifications.",
    description: "You're all caught up.",
  },
  tokens: {
    headline: "No token history.",
    description: "Your token transactions will appear here.",
  },
};

interface EmptyStateProps {
  variant: keyof typeof VARIANTS;
  action?: { href: string; label: string };
}

// Pre-computed arc paths for the mid ring (8 arcs at r=65, 30° span each, 45° spacing)
const MID_ARCS = [
  "M 65.0 0.0 A 65 65 0 0 1 56.3 32.5",
  "M 46.0 46.0 A 65 65 0 0 1 16.8 62.8",
  "M 0.0 65.0 A 65 65 0 0 1 -32.5 56.3",
  "M -46.0 46.0 A 65 65 0 0 1 -62.8 16.8",
  "M -65.0 0.0 A 65 65 0 0 1 -56.3 -32.5",
  "M -46.0 -46.0 A 65 65 0 0 1 -16.8 -62.8",
  "M 0.0 -65.0 A 65 65 0 0 1 32.5 -56.3",
  "M 46.0 -46.0 A 65 65 0 0 1 62.8 -16.8",
];

// Outer ring: 12 dots at r=90, every 30°
const OUTER_DOTS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  return { x: +(90 * Math.cos(angle)).toFixed(2), y: +(90 * Math.sin(angle)).toFixed(2) };
});

// Inner squares: 4 rects (20×20, centered at origin) at 0°, 22.5°, 45°, 67.5°
const INNER_ROTATIONS = [0, 22.5, 45, 67.5];

export function EmptyState({ variant, action }: EmptyStateProps) {
  const { headline, description } = VARIANTS[variant];

  return (
    <div className="py-20 flex flex-col items-center gap-8">
      {/* SVG Mandala */}
      <svg
        viewBox="-100 -100 200 200"
        className="w-48 h-48"
        aria-hidden="true"
      >
        {/* Outer ring — rotates 20s */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="20s"
            repeatCount="indefinite"
          />
          {OUTER_DOTS.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r="2"
              fill="rgba(201,168,76,0.2)"
            />
          ))}
        </g>

        {/* Mid ring — static arcs */}
        <g>
          {MID_ARCS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="rgba(74,14,26,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Inner glyph — counter-rotates 30s */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="-360 0 0"
            dur="30s"
            repeatCount="indefinite"
          />
          {INNER_ROTATIONS.map((deg, i) => (
            <rect
              key={i}
              x="-12"
              y="-12"
              width="24"
              height="24"
              fill="none"
              stroke="rgba(201,168,76,0.35)"
              strokeWidth="0.5"
              transform={`rotate(${deg})`}
            />
          ))}
        </g>

        {/* Center dot */}
        <circle cx="0" cy="0" r="3" fill="rgba(201,168,76,0.6)" />
      </svg>

      {/* Text */}
      <div className="text-center">
        <div className="text-label text-champagne mb-1 tracking-widest uppercase">
          The Guild
        </div>
        <h3 className="font-headline text-2xl text-ivory mb-2">{headline}</h3>
        <p className="text-body-sm text-ivory/40 max-w-xs">{description}</p>
        {action && (
          <Link
            href={action.href}
            className="mt-4 inline-block text-label text-champagne underline underline-offset-4 hover:text-champagne/70 transition-colors"
          >
            {action.label} →
          </Link>
        )}
      </div>
    </div>
  );
}
