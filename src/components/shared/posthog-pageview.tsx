"use client";

import { usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { isUsablePostHogKey } from "@/lib/posthog-env";

export function PostHogPageView() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  useEffect(() => {
    if (!isUsablePostHogKey(key) || !posthog) return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname, posthog, key]);

  return null;
}
