"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ManualPayment {
  id: string;
  tier: string;
  amount_display: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
  notes: string | null;
  user: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    status: string;
    member_tier: string | null;
  };
}

function statusColor(status: string) {
  if (status === "approved") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (status === "pending") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-ivory/30 bg-smoke border-ivory/10";
}

function tierColor(tier: string) {
  if (tier === "unlimited") return "text-champagne bg-champagne/15 border-champagne/20";
  return "text-sky-400 bg-sky-400/10 border-sky-400/20";
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/manual-payments")
      .then((r) => {
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setPayments(d.payments ?? []); })
      .finally(() => setLoading(false));
  }, [router]);

  async function act(id: string, action: "approve" | "reject") {
    setActing(id + action);
    try {
      const res = await fetch("/api/admin/manual-payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed"); return; }
      toast.success(action === "approve" ? "Tier activated." : "Payment rejected.");
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: action === "approve" ? "approved" : "rejected", approved_at: new Date().toISOString() }
            : p
        )
      );
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setActing(null);
    }
  }

  const pending = payments.filter((p) => p.status === "pending");
  const processed = payments.filter((p) => p.status !== "pending");

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-label text-champagne/70 mb-2">Admin</div>
        <h1 className="text-display-lg text-ivory">
          Manual <span className="italic text-champagne">Payments.</span>
        </h1>
        <p className="text-body-sm text-ivory/40 mt-2">
          GPay payments pending tier activation.
        </p>
      </div>

      {/* Pending section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-ivory">
            Pending{" "}
            {pending.length > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                {pending.length}
              </span>
            )}
          </h2>
        </div>

        <div className="rounded-2xl bg-smoke/80 border border-champagne/[0.08] overflow-hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-champagne/[0.06]">
                <Skeleton className="h-4 w-1/2 bg-smoke mb-2" />
                <Skeleton className="h-3 w-1/3 bg-smoke" />
              </div>
            ))
          ) : pending.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-ivory/30">
              No pending payments.
            </div>
          ) : (
            pending.map((p) => (
              <PaymentRow
                key={p.id}
                payment={p}
                acting={acting}
                onApprove={() => act(p.id, "approve")}
                onReject={() => act(p.id, "reject")}
              />
            ))
          )}
        </div>
      </div>

      {/* Processed section */}
      {processed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="size-4 text-ivory/40" />
            <h2 className="text-sm font-semibold text-ivory/60">Processed</h2>
          </div>
          <div className="rounded-2xl bg-smoke/80 border border-champagne/[0.08] overflow-hidden">
            {processed.map((p) => (
              <PaymentRow
                key={p.id}
                payment={p}
                acting={acting}
                onApprove={() => act(p.id, "approve")}
                onReject={() => act(p.id, "reject")}
                readonly
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentRow({
  payment: p,
  acting,
  onApprove,
  onReject,
  readonly = false,
}: {
  payment: ManualPayment;
  acting: string | null;
  onApprove: () => void;
  onReject: () => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-champagne/[0.06] last:border-0 hover:bg-champagne/[0.02] transition-colors gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-medium text-ivory truncate">
            {p.user.display_name ?? p.user.email}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
              tierColor(p.tier)
            )}
          >
            {p.tier}
          </span>
          <span className="text-[10px] font-medium text-ivory/40">{p.amount_display}</span>
        </div>
        <div className="text-xs text-ivory/30 truncate">{p.user.email}</div>
        <div className="text-xs text-ivory/20 mt-0.5">
          {new Date(p.created_at).toLocaleString()}
          {p.approved_at && (
            <span className="ml-2">
              · {p.status === "approved" ? "approved" : "rejected"}{" "}
              {new Date(p.approved_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!readonly && p.status === "pending" ? (
          <>
            <Button
              variant="gold"
              size="xs"
              disabled={!!acting}
              onClick={onApprove}
              className="rounded-full text-xs"
            >
              {acting === p.id + "approve" ? (
                <div className="size-3 rounded-full border-2 border-obsidian/40 border-t-obsidian animate-spin" />
              ) : (
                <><Check className="size-3 mr-1" /> Approve</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              disabled={!!acting}
              onClick={onReject}
              className="rounded-full text-xs text-ivory/40 hover:text-red-400"
            >
              {acting === p.id + "reject" ? (
                <div className="size-3 rounded-full border-2 border-ivory/20 border-t-ivory/60 animate-spin" />
              ) : (
                <><X className="size-3 mr-1" /> Reject</>
              )}
            </Button>
          </>
        ) : (
          <span
            className={cn(
              "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
              statusColor(p.status)
            )}
          >
            {p.status}
          </span>
        )}
      </div>
    </div>
  );
}
