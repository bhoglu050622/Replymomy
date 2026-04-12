"use client";

import { useState } from "react";
import { Sparkles, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AiApplicationReview } from "@/lib/ai/gemini";

function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Strong", color: "text-emerald-400" };
  if (score >= 60) return { label: "Promising", color: "text-champagne" };
  if (score >= 40) return { label: "Borderline", color: "text-amber-400" };
  return { label: "Not recommended", color: "text-rose-400" };
}

interface Props {
  applicationId: string;
  existingReview: AiApplicationReview | null;
  type?: "mommy" | "member";
}

export function AiReviewPanel({ applicationId, existingReview, type = "mommy" }: Props) {
  const [review, setReview] = useState<AiApplicationReview | null>(existingReview);
  const [loading, setLoading] = useState(false);

  async function runReview() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "AI review failed");
        return;
      }
      setReview(data.review);
      toast.success("AI review complete");
    } catch {
      toast.error("AI review failed — try again");
    } finally {
      setLoading(false);
    }
  }

  if (!review) {
    return (
      <div className="mt-4 pt-4 border-t border-champagne/[0.08]">
        <Button
          variant="gold-outline"
          size="sm"
          onClick={runReview}
          disabled={loading}
          className="h-8 rounded-full text-xs gap-1.5"
        >
          {loading ? (
            <RefreshCw className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {loading ? "Reviewing…" : "AI Review"}
        </Button>
      </div>
    );
  }

  const { label, color } = scoreLabel(review.quality_score);

  return (
    <div className="mt-4 pt-4 border-t border-champagne/[0.08] space-y-4">
      {/* Score + summary row */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 text-center">
          <p className={`font-headline text-3xl leading-none ${color}`}>
            {review.quality_score}
          </p>
          <p className={`text-[10px] uppercase tracking-widest mt-1 ${color}`}>{label}</p>
        </div>
        <p className="text-body-sm text-ivory/60 italic leading-relaxed flex-1">
          {review.admin_summary}
        </p>
      </div>

      {/* Strengths */}
      {review.strengths.length > 0 && (
        <div>
          <p className="text-label text-ivory/35 mb-2">Strengths</p>
          <ul className="space-y-1">
            {review.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-body-sm text-ivory/72">
                <Check className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red flags */}
      {review.red_flags.length > 0 && (
        <div>
          <p className="text-label text-ivory/35 mb-2">Flags</p>
          <ul className="space-y-1">
            {review.red_flags.map((f) => (
              <li key={f} className="flex items-start gap-2 text-body-sm text-ivory/72">
                <AlertTriangle className="size-3 text-amber-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {review.suggested_tags.length > 0 && (
        <div>
          <p className="text-label text-ivory/35 mb-2">Suggested tags</p>
          <div className="flex flex-wrap gap-1.5">
            {review.suggested_tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-champagne/10 border border-champagne/20 text-[10px] text-champagne tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate */}
      <Button
        variant="gold-outline"
        size="sm"
        onClick={runReview}
        disabled={loading}
        className="h-7 rounded-full text-[10px] gap-1.5 opacity-60 hover:opacity-100"
      >
        <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Reviewing…" : "Regenerate"}
      </Button>
    </div>
  );
}
