"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";
import { Check, X, Copy, Clock, MapPin, AtSign, ExternalLink, Briefcase, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AiReviewPanel } from "@/components/admin/ai-review-panel";
import type { AiApplicationReview } from "@/lib/ai/gemini";
import { cn } from "@/lib/utils";

interface MommyApplication {
  id: string;
  full_name: string;
  email: string;
  age: number;
  city: string;
  instagram: string | null;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  invitation_code: string | null;
  ai_review: AiApplicationReview | null;
  created_at: string;
}

interface MemberApplication {
  id: string;
  full_name: string;
  email: string;
  age: number;
  city: string;
  occupation: string;
  income_bracket: "200k_500k" | "500k_1m" | "1m_plus";
  motivation: string;
  status: "pending" | "approved" | "rejected";
  invitation_code: string | null;
  ai_review: AiApplicationReview | null;
  created_at: string;
}

const INCOME_LABEL: Record<string, string> = {
  "200k_500k": "$200k–$500k",
  "500k_1m": "$500k–$1M",
  "1m_plus": "$1M+",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-label border flex-shrink-0",
        status === "pending"
          ? "text-champagne bg-champagne/10 border-champagne/20"
          : status === "approved"
            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
            : "text-ivory/30 bg-smoke border-ivory/10"
      )}
    >
      {status}
    </span>
  );
}

function ApprovedCode({ code, onCopy }: { code: string; onCopy: () => void }) {
  return (
    <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/20">
      <code className="text-body-sm text-emerald-400 font-mono">{code}</code>
      <button onClick={onCopy} className="ml-auto text-ivory/40 hover:text-ivory transition-colors">
        <Copy className="size-4" />
      </button>
    </div>
  );
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<"mommy" | "member">("mommy");

  const [mommyApps, setMommyApps] = useState<MommyApplication[]>([]);
  const [memberApps, setMemberApps] = useState<MemberApplication[]>([]);
  const [mommyLoaded, setMommyLoaded] = useState(false);
  const [memberLoaded, setMemberLoaded] = useState(false);

  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedMotivation, setExpandedMotivation] = useState<string | null>(null);

  // Load mommy apps on mount
  useEffect(() => {
    fetch("/api/admin/applications?type=mommy")
      .then((r) => {
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setMommyApps(d.applications ?? []); })
      .finally(() => setMommyLoaded(true));
  }, [router]);

  // Load member apps lazily on first switch
  useEffect(() => {
    if (activeType === "member" && !memberLoaded) {
      fetch("/api/admin/applications?type=member")
        .then((r) => r.json())
        .then((d) => setMemberApps(d.applications ?? []))
        .finally(() => setMemberLoaded(true));
    }
  }, [activeType, memberLoaded]);

  async function handleAction(id: string, action: "approve" | "reject", type: "mommy" | "member") {
    setActionLoading(id + action);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, type }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      if (type === "mommy") {
        if (action === "approve") {
          toast.success(`Approved. Code: ${data.code}`, { duration: 8000 });
          setMommyApps((prev) =>
            prev.map((a) => a.id === id ? { ...a, status: "approved", invitation_code: data.code } : a)
          );
        } else {
          toast.success("Application rejected.");
          setMommyApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));
        }
      } else {
        if (action === "approve") {
          toast.success(`Approved. Code: ${data.code}`, { duration: 8000 });
          setMemberApps((prev) =>
            prev.map((a) => a.id === id ? { ...a, status: "approved", invitation_code: data.code } : a)
          );
        } else {
          toast.success("Application rejected.");
          setMemberApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));
        }
      }
    } finally {
      setActionLoading(null);
    }
  }

  const mommyPending = mommyApps.filter((a) => a.status === "pending").length;
  const memberPending = memberApps.filter((a) => a.status === "pending").length;

  const filteredMommy = mommyApps.filter((a) => filter === "all" || a.status === filter);
  const filteredMember = memberApps.filter((a) => filter === "all" || a.status === filter);

  const isLoading = activeType === "mommy" ? !mommyLoaded : !memberLoaded;

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-label text-champagne mb-3">
          Admin — Applications
        </div>
        <h1 className="text-display-lg text-ivory mb-1">
          Applications<span className="italic text-champagne">.</span>
        </h1>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6">
        {(["mommy", "member"] as const).map((t) => {
          const pending = t === "mommy" ? mommyPending : memberPending;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "px-5 py-2 rounded-full text-body-sm border capitalize transition-all",
                activeType === t
                  ? "bg-champagne text-obsidian border-champagne"
                  : "bg-smoke text-ivory/60 border-champagne/20 hover:border-champagne/40"
              )}
            >
              {t === "mommy" ? "Mommies" : "Members"}
              {pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-burgundy text-ivory text-[10px]">
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-8">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => {
          const pending = activeType === "mommy" ? mommyPending : memberPending;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-body-sm border capitalize transition-all",
                filter === f
                  ? "bg-champagne/20 text-champagne border-champagne/40"
                  : "bg-smoke text-ivory/60 border-champagne/20 hover:border-champagne/40"
              )}
            >
              {f}
              {f === "pending" && pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-burgundy text-ivory text-[10px]">
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-smoke" />)}
        </div>
      ) : activeType === "mommy" ? (
        filteredMommy.length === 0 ? (
          <div className="py-20 text-center text-ivory/40">No {filter} mommy applications.</div>
        ) : (
          <div className="space-y-5">
            {filteredMommy.map((app) => (
              <div
                key={app.id}
                className={cn(
                  "p-6 rounded-2xl border transition-all",
                  app.status === "pending"
                    ? "bg-smoke border-champagne/20"
                    : app.status === "approved"
                      ? "bg-smoke border-emerald-500/20"
                      : "bg-smoke border-ivory/5 opacity-60"
                )}
              >
                <div className="flex gap-5">
                  <div className="size-16 rounded-xl overflow-hidden relative border border-champagne/10 shrink-0">
                    <ProfilePlaceholder seed={app.id} width={64} height={64} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-body-lg font-medium text-ivory">{app.full_name}</h3>
                        <div className="flex items-center gap-3 text-label text-ivory/40 mt-1">
                          <span>{app.age} yrs</span>
                          <span className="flex items-center gap-1"><MapPin className="size-3" />{app.city}</span>
                          {app.instagram && (
                            <span className="flex items-center gap-1"><AtSign className="size-3" />{app.instagram}</span>
                          )}
                          <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-label text-ivory/30 mt-0.5">{app.email}</div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="mt-3">
                      <p className={cn("text-body-sm text-ivory/60", expandedMotivation === app.id ? "" : "line-clamp-2")}>
                        {app.motivation}
                      </p>
                      {app.motivation.length > 120 && (
                        <button
                          onClick={() => setExpandedMotivation(expandedMotivation === app.id ? null : app.id)}
                          className="text-label text-champagne mt-1 hover:underline"
                        >
                          {expandedMotivation === app.id ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                    <AiReviewPanel applicationId={app.id} existingReview={app.ai_review} type="mommy" />
                    {app.status === "approved" && app.invitation_code && (
                      <ApprovedCode
                        code={app.invitation_code}
                        onCopy={() => { navigator.clipboard.writeText(app.invitation_code!); toast.success("Code copied."); }}
                      />
                    )}
                    {app.status === "pending" && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAction(app.id, "approve", "mommy")}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-body-sm hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          <Check className="size-3.5" />
                          {actionLoading === app.id + "approve" ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(app.id, "reject", "mommy")}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-smoke border border-ivory/10 text-ivory/50 text-body-sm hover:border-red-400/30 hover:text-red-400 transition-all disabled:opacity-50"
                        >
                          <X className="size-3.5" />
                          {actionLoading === app.id + "reject" ? "Rejecting..." : "Reject"}
                        </button>
                        <a
                          href={`https://instagram.com/${app.instagram?.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn("ml-auto flex items-center gap-1 text-label text-ivory/30 hover:text-ivory transition-colors", !app.instagram ? "invisible" : "")}
                        >
                          Instagram <ExternalLink className="size-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Member applications
        filteredMember.length === 0 ? (
          <div className="py-20 text-center text-ivory/40">No {filter} member applications.</div>
        ) : (
          <div className="space-y-5">
            {filteredMember.map((app) => (
              <div
                key={app.id}
                className={cn(
                  "p-6 rounded-2xl border transition-all",
                  app.status === "pending"
                    ? "bg-smoke border-champagne/20"
                    : app.status === "approved"
                      ? "bg-smoke border-emerald-500/20"
                      : "bg-smoke border-ivory/5 opacity-60"
                )}
              >
                <div className="flex gap-5">
                  <div className="size-16 rounded-xl overflow-hidden relative border border-champagne/10 flex-shrink-0">
                    <ProfilePlaceholder seed={app.id} width={64} height={64} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-body-lg font-medium text-ivory">{app.full_name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-label text-ivory/40 mt-1">
                          <span>{app.age} yrs</span>
                          <span className="flex items-center gap-1"><MapPin className="size-3" />{app.city}</span>
                          <span className="flex items-center gap-1"><Briefcase className="size-3" />{app.occupation}</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="size-3" />
                            <span className="text-champagne/70">{INCOME_LABEL[app.income_bracket] ?? app.income_bracket}</span>
                          </span>
                          <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-label text-ivory/30 mt-0.5">{app.email}</div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="mt-3">
                      <p className={cn("text-body-sm text-ivory/60", expandedMotivation === app.id ? "" : "line-clamp-2")}>
                        {app.motivation}
                      </p>
                      {app.motivation.length > 120 && (
                        <button
                          onClick={() => setExpandedMotivation(expandedMotivation === app.id ? null : app.id)}
                          className="text-label text-champagne mt-1 hover:underline"
                        >
                          {expandedMotivation === app.id ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                    <AiReviewPanel applicationId={app.id} existingReview={app.ai_review} type="member" />
                    {app.status === "approved" && app.invitation_code && (
                      <ApprovedCode
                        code={app.invitation_code}
                        onCopy={() => { navigator.clipboard.writeText(app.invitation_code!); toast.success("Code copied."); }}
                      />
                    )}
                    {app.status === "pending" && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAction(app.id, "approve", "member")}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-body-sm hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          <Check className="size-3.5" />
                          {actionLoading === app.id + "approve" ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(app.id, "reject", "member")}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-smoke border border-ivory/10 text-ivory/50 text-body-sm hover:border-red-400/30 hover:text-red-400 transition-all disabled:opacity-50"
                        >
                          <X className="size-3.5" />
                          {actionLoading === app.id + "reject" ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
