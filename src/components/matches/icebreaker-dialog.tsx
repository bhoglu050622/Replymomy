"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  matchId: string;
}

export function IcebreakerDialog({ matchId }: Props) {
  const [starters, setStarters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/icebreakers?match_id=${matchId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not generate suggestions");
        return;
      }
      setStarters(data.starters ?? []);
    } catch {
      toast.error("Could not generate suggestions — try again");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (val && starters.length === 0) load();
  }

  async function copy(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="gold-outline"
          className="w-full h-12 rounded-full mt-3 text-xs gap-2"
        >
          <Sparkles className="size-4" />
          Get conversation starters
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-obsidian border-champagne/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-display-sm text-ivory">
            Conversation starters
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-ivory/50">
            <RefreshCw className="size-4 animate-spin text-champagne" />
            <span className="text-body-sm">Crafting starters…</span>
          </div>
        ) : starters.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-body-sm text-ivory/40 mb-4">
              Could not generate suggestions.
            </p>
            <Button
              variant="gold-outline"
              size="sm"
              onClick={load}
              className="rounded-full text-xs"
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {starters.map((s, i) => (
              <div
                key={i}
                className="luxury-glass rounded-2xl p-4 flex items-start gap-3"
              >
                <p className="text-body-sm text-ivory/80 leading-relaxed flex-1">{s}</p>
                <button
                  onClick={() => copy(s, i)}
                  className="shrink-0 text-ivory/30 hover:text-champagne transition-colors mt-0.5"
                  aria-label="Copy"
                >
                  {copied === i ? (
                    <Check className="size-4 text-champagne" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            ))}

            <Button
              variant="gold-outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="w-full rounded-full text-xs mt-1 gap-1.5"
            >
              <RefreshCw className="size-3" />
              Refresh
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
