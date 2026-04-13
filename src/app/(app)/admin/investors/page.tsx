"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TrendingUp, Mail, Building2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Investor {
  id: string;
  name: string;
  email: string;
  company: string | null;
  investment_type: string;
  investment_range: string;
  message: string | null;
  status: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  angel: "Angel",
  vc: "VC",
  strategic: "Strategic",
  friends_family: "F&F",
  other: "Other",
};

const RANGE_LABELS: Record<string, string> = {
  under_50l: "< ₹50L",
  "50l_250l": "₹50L–₹2.5Cr",
  "250l_1cr": "₹2.5Cr–₹10Cr",
  "1cr_plus": "₹10Cr+",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "interested", label: "Interested" },
  { value: "passed", label: "Passed" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-ivory/[0.06] text-ivory/50",
  reviewed: "bg-blue-500/10 text-blue-400",
  interested: "bg-champagne/10 text-champagne",
  passed: "bg-red-500/10 text-red-400/70",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<Investor[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/investors")
      .then((r) => r.json())
      .then((d) => setInvestors(d.investors ?? []))
      .catch(() => setInvestors([]));
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/investors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setInvestors((prev) =>
        prev ? prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)) : prev
      );
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-9 rounded-xl bg-champagne/10 border border-champagne/20 flex items-center justify-center">
          <TrendingUp className="size-4 text-champagne" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ivory">Investors</h1>
          <p className="text-xs text-ivory/40">
            {investors == null
              ? "Loading..."
              : `${investors.length} submission${investors.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Table / Cards */}
      {investors == null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-ivory/[0.04]" />
          ))}
        </div>
      ) : investors.length === 0 ? (
        <div className="text-center py-24">
          <TrendingUp className="size-8 text-ivory/10 mx-auto mb-3" />
          <p className="text-ivory/30 text-sm">No investor submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investors.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-ivory/[0.07] bg-ivory/[0.02] p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Left — identity */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ivory">{inv.name}</span>
                    {/* Type badge */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-champagne/10 text-champagne/80 border border-champagne/20">
                      {TYPE_LABELS[inv.investment_type] ?? inv.investment_type}
                    </span>
                    {/* Range badge */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-ivory/[0.06] text-ivory/60 border border-ivory/[0.08]">
                      {RANGE_LABELS[inv.investment_range] ?? inv.investment_range}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ivory/40">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {inv.email}
                    </span>
                    {inv.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {inv.company}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(inv.created_at)}
                    </span>
                  </div>

                  {inv.message && (
                    <p className="text-xs text-ivory/35 leading-relaxed line-clamp-2">
                      &ldquo;{inv.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right — status */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-medium",
                      STATUS_STYLES[inv.status] ?? STATUS_STYLES.pending
                    )}
                  >
                    {STATUS_OPTIONS.find((s) => s.value === inv.status)?.label ?? inv.status}
                  </span>
                  <select
                    value={inv.status}
                    disabled={updating === inv.id}
                    onChange={(e) => updateStatus(inv.id, e.target.value)}
                    className="text-xs bg-ivory/[0.04] border border-ivory/[0.08] text-ivory/60 rounded-lg px-2 py-1.5 focus:outline-none focus:border-champagne/30 disabled:opacity-50 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
