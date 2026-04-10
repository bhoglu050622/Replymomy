import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "wordmark" | "monogram";
}

export function Logo({ className, variant = "wordmark" }: LogoProps) {
  if (variant === "monogram") {
    return (
      <div
        className={cn(
          "size-10 rounded-full border border-champagne/40 bg-obsidian flex items-center justify-center",
          className
        )}
      >
        <span className="font-headline text-champagne text-lg font-medium">
          RM
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "font-headline text-ivory text-2xl tracking-tight font-light",
        className
      )}
    >
      Reply<span className="text-champagne italic">Mommy</span>
    </span>
  );
}
