"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, Trash2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CodeRow {
  id: string;
  code: string;
  role: string;
  max_uses: number;
  use_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminInvitationsPage() {
  const [codes, setCodes] = useState<CodeRow[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/invitations")
      .then((r) => r.json())
      .then((d) => setCodes(d.codes ?? []))
      .catch(() => setCodes([]));
  }, []);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/invitations", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      setCodes((prev) => (prev ? [d.code, ...prev] : [d.code]));
      toast.success("Code generated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate code.");
    } finally {
      setGenerating(false);
    }
  }

  async function revoke(id: string) {
    const prev = codes;
    setCodes((c) => c?.map((r) => (r.id === id ? { ...r, is_active: false } : r)) ?? null);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Code revoked.");
    } catch {
      setCodes(prev);
      toast.error("Failed to revoke code.");
    }
  }

  async function copy(code: string, id: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-label text-champagne mb-1">Admin / Invitations</div>
          <h1 className="text-display-lg text-ivory">
            Invitation <span className="italic text-champagne">codes.</span>
          </h1>
        </div>
        <Button
          variant="gold"
          className="h-11 rounded-full text-xs px-6"
          onClick={generate}
          disabled={generating}
        >
          <Plus className="size-4 mr-2" />
          {generating ? "Generating..." : "Generate Code"}
        </Button>
      </div>

      {codes === null ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : codes.length === 0 ? (
        <p className="text-body-md text-ivory/40 text-center py-16">
          No codes yet. Generate one above.
        </p>
      ) : (
        <div className="space-y-3">
          {codes.map((row) => (
            <div
              key={row.id}
              className={cn(
                "flex items-center justify-between p-5 rounded-2xl border transition-opacity",
                row.is_active
                  ? "bg-smoke border-champagne/10"
                  : "bg-smoke/50 border-champagne/5 opacity-50"
              )}
            >
              <div className="flex items-center gap-4 min-w-0">
                <code className="font-mono text-champagne text-sm">{row.code}</code>
                <span
                  className={cn(
                    "text-label px-2 py-0.5 rounded-full",
                    row.is_active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-ivory/5 text-ivory/30"
                  )}
                >
                  {row.is_active ? "Active" : "Revoked"}
                </span>
                <span className="text-label text-ivory/30 hidden sm:block">
                  {row.use_count}/{row.max_uses} used
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copy(row.code, row.id)}
                  className="p-2 rounded-xl text-ivory/40 hover:text-champagne transition-colors"
                  aria-label="Copy code"
                >
                  {copiedId === row.id ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
                {row.is_active && (
                  <button
                    onClick={() => revoke(row.id)}
                    className="p-2 rounded-xl text-ivory/40 hover:text-red-400 transition-colors"
                    aria-label="Revoke code"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
