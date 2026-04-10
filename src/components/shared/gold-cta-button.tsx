"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function GoldCtaButton({
  className,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="gold"
      size="lg"
      className={cn(
        "h-12 px-8 text-sm rounded-full animate-gold-pulse",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
