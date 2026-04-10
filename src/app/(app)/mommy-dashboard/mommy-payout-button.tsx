"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MommyPayoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setup() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect-onboard", { method: "POST" });
      const data = await res.json();
      if (data.url) router.push(data.url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="gold" className="h-10 rounded-full px-6 text-xs shrink-0" onClick={setup} disabled={loading}>
      {loading ? "Opening..." : "Set up →"}
    </Button>
  );
}
