"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { isUsablePostHogKey } from "@/lib/posthog-env";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!isUsablePostHogKey(key)) return;
    posthog.init(key!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false, // handled by PostHogPageView
      persistence: "localStorage+cookie",
      session_recording: {
        maskAllInputs: true,   // privacy — mask passwords/emails
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
