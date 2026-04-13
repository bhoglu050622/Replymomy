"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Wallet,
  Plus,
  X,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PayoutRequest {
  id: string;
  mommy_id: string;
  amount_cents: number;
  status: "pending" | "processing" | "completed" | "rejected";
  method: string;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
  transaction_reference: string | null;
  mommy: { display_name: string | null; email: string } | null;
}

interface PendingEarning {
  id: string;
  source_type: string;
  gross_amount_cents: number;
  platform_fee_cents: number;
  net_amount_cents: number;
  payout_status: string;
  created_at: string;
}

interface MommyWithPending {
  mommy_id: string;
  total_cents: number;
  user: { display_name: string | null; email: string } | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusConfig(status: string) {
  switch (status) {
    case "pending":
      return { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Clock };
    case "processing":
      return { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: RefreshCw };
    case "completed":
      return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 };
    case "rejected":
      return { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle };
    default:
      return { color: "text-ivory/40 bg-ivory/5 border-ivory/10", icon: Clock };
  }
}

// ─── Payout Detail Sheet ─────────────────────────────────────────────────────

function PayoutSheet({
  payoutId,
  onClose,
  onUpdated,
}: {
  payoutId: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [data, setData] = useState<{ payout: PayoutRequest; earnings: PendingEarning[] } | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [txRef, setTxRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/payouts/${payoutId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setNewStatus(d.payout.status);
        setTxRef(d.payout.transaction_reference ?? "");
        setNotes(d.payout.notes ?? "");
      });
  }, [payoutId]);

  async function updatePayout() {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus !== data.payout.status ? newStatus : undefined,
          transaction_reference: txRef || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Payout updated.");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update payout.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-obsidian border-l border-champagne/20 flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-champagne/[0.08] sticky top-0 bg-obsidian">
          <div>
            <div className="text-sm font-semibold text-ivory">Payout Detail</div>
            {data && (
              <div className="text-xs text-ivory/40">
                {data.payout.mommy?.display_name ?? data.payout.mommy?.email ?? "Unknown"}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ivory/40 hover:text-ivory hover:bg-champagne/[0.08] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {!data ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl bg-smoke" />
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-champagne/10 to-champagne/[0.03] border border-champagne/20 text-center">
              <div className="font-headline text-4xl text-champagne">
                {fmtCents(data.payout.amount_cents)}
              </div>
              <div className="text-xs text-ivory/40 mt-1 uppercase tracking-widest">
                Payout Amount
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Mommy", data.payout.mommy?.display_name ?? data.payout.mommy?.email ?? "—"],
                ["Requested", new Date(data.payout.requested_at).toLocaleDateString()],
                ["Method", data.payout.method.toUpperCase()],
                ["Processed", data.payout.processed_at ? new Date(data.payout.processed_at).toLocaleDateString() : "—"],
                ["Tx Reference", data.payout.transaction_reference ?? "—"],
                ["Status", <span key="s" className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border", statusConfig(data.payout.status).color)}>{data.payout.status}</span>],
              ].map(([label, val]) => (
                <div key={label as string} className="p-3 rounded-xl bg-smoke/80 border border-champagne/[0.06]">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-ivory/25 mb-1">{label}</div>
                  <div className="text-xs text-ivory/70">{val}</div>
                </div>
              ))}
            </div>

            {/* Update form */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-ivory/30">
                Update Status
              </h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder="Transaction reference..."
                className="w-full h-10 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 placeholder:text-ivory/30 focus:outline-none focus:border-champagne/40"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes..."
                rows={2}
                className="w-full rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm p-3 placeholder:text-ivory/30 focus:outline-none focus:border-champagne/40 resize-none"
              />
              <Button variant="gold" size="sm" onClick={updatePayout} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Update Payout"}
              </Button>
            </div>

            {/* Linked earnings */}
            {data.earnings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-ivory/30">
                  Linked Earnings ({data.earnings.length})
                </h3>
                <div className="space-y-2">
                  {data.earnings.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-smoke/80 border border-champagne/[0.06]"
                    >
                      <div>
                        <div className="text-xs text-ivory/60 capitalize">
                          {e.source_type?.replace(/_/g, " ") ?? "—"}
                        </div>
                        <div className="text-[10px] text-ivory/30">
                          {new Date(e.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-champagne">{fmtCents(e.net_amount_cents)}</div>
                        <div className="text-[10px] text-ivory/30">net</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Create Payout Dialog ────────────────────────────────────────────────────

function CreatePayoutDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [mommies, setMommies] = useState<MommyWithPending[]>([]);
  const [selectedMommy, setSelectedMommy] = useState("");
  const [earnings, setEarnings] = useState<PendingEarning[]>([]);
  const [selectedEarnings, setSelectedEarnings] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/admin/payouts/pending-earnings")
        .then((r) => r.json())
        .then((d) => setMommies(d.mommies ?? []));
    }
  }, [open]);

  useEffect(() => {
    if (!selectedMommy) {
      setEarnings([]);
      setSelectedEarnings(new Set());
      return;
    }
    setLoadingEarnings(true);
    fetch(`/api/admin/payouts/pending-earnings?mommy_id=${selectedMommy}`)
      .then((r) => r.json())
      .then((d) => {
        setEarnings(d.earnings ?? []);
        setSelectedEarnings(new Set((d.earnings ?? []).map((e: PendingEarning) => e.id)));
      })
      .finally(() => setLoadingEarnings(false));
  }, [selectedMommy]);

  const totalSelected = earnings
    .filter((e) => selectedEarnings.has(e.id))
    .reduce((s, e) => s + e.net_amount_cents, 0);

  function toggleEarning(id: string) {
    setSelectedEarnings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createPayout() {
    if (!selectedMommy || selectedEarnings.size === 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mommy_id: selectedMommy,
          amount_cents: totalSelected,
          notes: notes || undefined,
          earning_ids: Array.from(selectedEarnings),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      toast.success("Payout request created.");
      setOpen(false);
      onCreated();
      // Reset
      setSelectedMommy("");
      setEarnings([]);
      setSelectedEarnings(new Set());
      setNotes("");
    } catch {
      toast.error("Failed to create payout.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="gold" size="sm" className="gap-2">
            <Plus className="size-3.5" />
            Create Payout
          </Button>
        }
      />
      <DialogContent className="bg-obsidian border-champagne/20 max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="text-ivory font-headline text-xl">
            Create Payout Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Select mommy */}
          <div>
            <label className="text-xs font-semibold tracking-widest uppercase text-ivory/40 mb-2 block">
              Select Mommy
            </label>
            {mommies.length === 0 ? (
              <div className="text-sm text-ivory/30 py-4 text-center">
                No mommies with pending earnings.
              </div>
            ) : (
              <select
                value={selectedMommy}
                onChange={(e) => setSelectedMommy(e.target.value)}
                className="w-full h-10 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
              >
                <option value="">Choose a mommy...</option>
                {mommies.map((m) => (
                  <option key={m.mommy_id} value={m.mommy_id}>
                    {m.user?.display_name ?? m.user?.email ?? m.mommy_id} —{" "}
                    {fmtCents(m.total_cents)} pending
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Earnings list */}
          {selectedMommy && (
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-ivory/40 mb-2 block">
                Pending Earnings
              </label>
              {loadingEarnings ? (
                <Skeleton className="h-24 rounded-xl bg-smoke" />
              ) : earnings.length === 0 ? (
                <div className="text-sm text-ivory/30 py-4 text-center">
                  No pending earnings.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {earnings.map((e) => (
                    <label
                      key={e.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                        selectedEarnings.has(e.id)
                          ? "border-champagne/30 bg-champagne/[0.06]"
                          : "border-champagne/[0.08] bg-smoke/60"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEarnings.has(e.id)}
                        onChange={() => toggleEarning(e.id)}
                        className="size-3.5 accent-champagne"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-ivory/60 capitalize">
                          {e.source_type?.replace(/_/g, " ") ?? "—"}
                        </div>
                        <div className="text-[10px] text-ivory/30">
                          {new Date(e.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-champagne shrink-0">
                        {fmtCents(e.net_amount_cents)}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Total */}
          {selectedEarnings.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-champagne/[0.08] border border-champagne/20">
              <span className="text-xs font-semibold tracking-widest uppercase text-ivory/40">
                Total ({selectedEarnings.size} earnings)
              </span>
              <span className="text-lg font-headline text-champagne">
                {fmtCents(totalSelected)}
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold tracking-widest uppercase text-ivory/40 mb-2 block">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={2}
              className="w-full rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm p-3 placeholder:text-ivory/30 focus:outline-none focus:border-champagne/40 resize-none"
            />
          </div>

          {/* Create button */}
          <Button
            variant="gold"
            size="sm"
            onClick={createPayout}
            disabled={creating || !selectedMommy || selectedEarnings.size === 0}
            className="w-full"
          >
            {creating ? "Creating..." : `Create Request — ${fmtCents(totalSelected)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Payouts Table ───────────────────────────────────────────────────────────

function PayoutsTable({
  statusFilter,
  onRefreshNeeded,
}: {
  statusFilter: string;
  onRefreshNeeded: number;
}) {
  const [payouts, setPayouts] = useState<PayoutRequest[] | null>(null);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchPayouts = useCallback(async () => {
    const params = new URLSearchParams({ page: "0" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/payouts?${params}`);
    const d = await res.json();
    setPayouts(d.payouts ?? []);
    setTotal(d.total ?? 0);
  }, [statusFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPayouts(); }, [fetchPayouts, onRefreshNeeded]);

  if (payouts === null) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-smoke" />
        ))}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-ivory/30">
        No {statusFilter} payout requests.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-champagne/[0.06]">
        {payouts.map((p) => {
          const { color, icon: Icon } = statusConfig(p.status);
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="w-full text-left px-6 py-4 hover:bg-champagne/[0.04] transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-ivory truncate">
                      {p.mommy?.display_name ?? p.mommy?.email ?? "Unknown"}
                    </span>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0", color)}>
                      <Icon className="size-2.5" />
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs text-ivory/30">
                    {new Date(p.requested_at).toLocaleDateString()}
                    {p.transaction_reference && (
                      <span className="ml-2 font-mono">{p.transaction_reference}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-champagne">
                      {fmtCents(p.amount_cents)}
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-ivory/20" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="px-6 py-3 border-t border-champagne/[0.06] text-xs text-ivory/30">
        {total} total
      </div>

      {selectedId && (
        <PayoutSheet
          payoutId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={() => { setSelectedId(null); fetchPayouts(); }}
        />
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PayoutsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [refreshKey, setRefreshKey] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState({
    pendingTotal: 0,
    pendingCount: 0,
    processedThisMonth: 0,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSummaryLoading(true);
    Promise.all([
      fetch("/api/admin/payouts?status=pending&page=0").then((r) => r.json()),
      fetch("/api/admin/payouts?status=completed&page=0").then((r) => r.json()),
    ])
      .then(([pending, completed]) => {
        const pendingPayouts: PayoutRequest[] = pending.payouts ?? [];
        const completedPayouts: PayoutRequest[] = completed.payouts ?? [];

        const pendingTotal = pendingPayouts.reduce((s, p) => s + p.amount_cents, 0);
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);
        const processedThisMonth = completedPayouts
          .filter((p) => p.processed_at && new Date(p.processed_at) >= thisMonthStart)
          .reduce((s, p) => s + p.amount_cents, 0);

        setSummary({
          pendingTotal,
          pendingCount: pending.total ?? 0,
          processedThisMonth,
        });
      })
      .finally(() => setSummaryLoading(false));
  }, [refreshKey]);

  function refresh() { setRefreshKey((k) => k + 1); }

  const TAB_STATUS: Record<string, string> = {
    pending: "pending",
    processing: "processing",
    completed: "completed",
    all: "",
  };

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-label text-champagne/70 mb-2">Admin</div>
          <h1 className="text-display-lg text-ivory">
            Payouts <span className="italic text-champagne">management.</span>
          </h1>
        </div>
        <CreatePayoutDialog onCreated={refresh} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summaryLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-smoke" />
          ))
        ) : (
          <>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-400/10 to-amber-400/[0.03] border border-amber-400/20">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="size-4 text-amber-400" />
                <span className="text-xs font-semibold tracking-widest uppercase text-amber-400/60">
                  Pending Total
                </span>
              </div>
              <div className="font-headline text-3xl text-amber-400">
                {fmtCents(summary.pendingTotal)}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-smoke/80 border border-champagne/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="size-4 text-ivory/40" />
                <span className="text-xs font-semibold tracking-widest uppercase text-ivory/30">
                  Pending Count
                </span>
              </div>
              <div className="font-headline text-3xl text-ivory">
                {summary.pendingCount}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-emerald-400/[0.03] border border-emerald-400/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400/60">
                  Processed This Month
                </span>
              </div>
              <div className="font-headline text-3xl text-emerald-400">
                {fmtCents(summary.processedThisMonth)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl bg-smoke/80 border border-champagne/[0.08] overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-5 border-b border-champagne/[0.08]">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </div>

          {["pending", "processing", "completed", "all"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <PayoutsTable statusFilter={TAB_STATUS[tab]} onRefreshNeeded={refreshKey} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
