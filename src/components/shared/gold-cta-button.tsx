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
      size="primary"
      className={cn(
        "px-8 rounded-full animate-gold-pulse",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
