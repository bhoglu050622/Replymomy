"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: { display_name: string | null; email: string } | null;
}

const ACTION_COLORS: Record<string, string> = {
  note_created: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  note_updated: "text-blue-300 bg-blue-300/10 border-blue-300/20",
  note_deleted: "text-red-400 bg-red-400/10 border-red-400/20",
  user_status_changed: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  payout_created: "text-champagne bg-champagne/10 border-champagne/20",
  payout_updated: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

function actionColor(action: string) {
  return ACTION_COLORS[action] ?? "text-ivory/40 bg-ivory/5 border-ivory/10";
}

function relativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

const ACTIONS = [
  "note_created",
  "note_updated",
  "note_deleted",
  "user_status_changed",
  "payout_created",
  "payout_updated",
];

const ENTITY_TYPES = ["user", "application", "payout_request"];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const LIMIT = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (actionFilter) params.set("action", actionFilter);
      if (entityTypeFilter) params.set("entity_type", entityTypeFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await fetch(`/api/admin/activity?${params}`);
      const d = await res.json();
      setLogs(d.logs ?? []);
      setTotal(d.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityTypeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-label text-champagne/70 mb-2">Admin</div>
        <h1 className="text-display-lg text-ivory">
          Activity <span className="italic text-champagne">log.</span>
        </h1>
        <p className="text-body-sm text-ivory/40 mt-1">
          {total.toLocaleString()} total entries
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="h-9 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <select
          value={entityTypeFilter}
          onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(0); }}
          className="h-9 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
        >
          <option value="">All Entity Types</option>
          {ENTITY_TYPES.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
          className="h-9 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
          className="h-9 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
        />

        {(actionFilter || entityTypeFilter || dateFrom || dateTo) && (
          <Button
            variant="gold-outline"
            size="sm"
            onClick={() => {
              setActionFilter("");
              setEntityTypeFilter("");
              setDateFrom("");
              setDateTo("");
              setPage(0);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-smoke/80 border border-champagne/[0.08] overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-champagne/[0.08]">
          {["Action", "Actor", "Entity Type", "Entity ID", "Timestamp"].map((h) => (
            <div key={h} className="text-[10px] font-semibold tracking-widest uppercase text-ivory/25">
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="divide-y divide-champagne/[0.06]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4 items-center">
                <Skeleton className="h-4 w-32 bg-smoke" />
                <Skeleton className="h-4 w-24 bg-smoke" />
                <Skeleton className="h-4 w-20 bg-smoke" />
                <Skeleton className="h-4 flex-1 bg-smoke" />
                <Skeleton className="h-4 w-20 bg-smoke" />
              </div>
            ))}
          </div>
        ) : !logs?.length ? (
          <div className="py-16 text-center">
            <Activity className="size-8 mx-auto mb-3 text-ivory/20" />
            <p className="text-sm text-ivory/30">No activity logged yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-champagne/[0.06]">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 items-center">
                  <div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                        actionColor(log.action)
                      )}
                    >
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-xs text-ivory/60 truncate">
                    {log.actor?.display_name ?? log.actor?.email ?? "System"}
                  </div>
                  <div className="text-xs text-ivory/40">
                    {log.entity_type ?? "—"}
                  </div>
                  <div className="text-xs font-mono text-ivory/30 truncate">
                    {log.entity_id ? log.entity_id.slice(0, 8) + "…" : "—"}
                  </div>
                  <div className="text-xs text-ivory/40">
                    {relativeTime(log.created_at)}
                  </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                        actionColor(log.action)
                      )}
                    >
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-ivory/30">
                      {relativeTime(log.created_at)}
                    </span>
                  </div>
                  <div className="text-xs text-ivory/40">
                    {log.actor?.display_name ?? log.actor?.email ?? "System"}
                    {log.entity_type ? ` · ${log.entity_type}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-ivory/30">
            Page {page + 1} of {totalPages} · {total.toLocaleString()} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="gold-outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="gold-outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
