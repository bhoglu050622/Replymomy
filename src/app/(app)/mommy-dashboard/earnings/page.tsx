"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EarningsRow {
  date: string;
  source: string;
  gross: number;
  fee: number;
  net: number;
  status: string;
}

interface EarningsData {
  available: number;
  thisMonth: number;
  lifetime: number;
  history: EarningsRow[];
}

export default function EarningsPage() {
  const router = useRouter();
  const [data, setData] = useState<EarningsData | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    fetch("/api/mommy/earnings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  async function requestPayout() {
    setPayoutLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const d = await res.json();
      if (d.url) router.push(d.url);
    } finally {
      setPayoutLoading(false);
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Earnings</div>
        <h1 className="text-display-lg text-ivory">
          Your <span className="italic text-champagne">earnings.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-burgundy/30 to-smoke border border-champagne/30">
          <div className="text-label text-ivory/50 mb-2">Available</div>
          <div className="font-headline text-4xl text-champagne">
            {data ? fmt(data.available) : "—"}
          </div>
          <Button
            variant="gold"
            className="w-full mt-4 h-11 rounded-full text-xs"
            onClick={requestPayout}
            disabled={payoutLoading || !data?.available}
          >
            {payoutLoading ? "Opening..." : "Request Payout"}
          </Button>
        </div>
        <div className="p-6 rounded-2xl bg-smoke border border-champagne/10">
          <div className="text-label text-ivory/50 mb-2">This Month</div>
          <div className="font-headline text-4xl text-ivory">
            {data ? fmt(data.thisMonth) : "—"}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-smoke border border-champagne/10">
          <div className="text-label text-ivory/50 mb-2">Lifetime</div>
          <div className="font-headline text-4xl text-ivory">
            {data ? fmt(data.lifetime) : "—"}
          </div>
          <div className="text-label text-ivory/40 mt-2">Since you joined.</div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-display-md text-ivory mb-4">Recent</h2>
        {!data ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-smoke animate-pulse" />
            ))}
          </div>
        ) : data.history.length === 0 ? (
          <p className="text-body-md text-ivory/40 py-8 text-center">
            No earnings yet. Matches and gifts will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {data.history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 rounded-2xl bg-smoke border border-champagne/10"
              >
                <div>
                  <div className="text-body-md text-ivory capitalize">{h.source}</div>
                  <div className="text-label text-ivory/40">{h.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-headline text-xl text-champagne">
                    +{fmt(h.net)}
                  </div>
                  <div className="text-label text-ivory/40">
                    {fmt(h.gross)} – {fmt(h.fee)} fee
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
