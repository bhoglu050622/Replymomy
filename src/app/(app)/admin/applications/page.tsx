"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X, Copy, Clock, MapPin, AtSign, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
  id: string;
  full_name: string;
  email: string;
  age: number;
  city: string;
  instagram: string | null;
  motivation: string;
  photo_urls: string[];
  status: "pending" | "approved" | "rejected";
  invitation_code: string | null;
  created_at: string;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedMotivation, setExpandedMotivation] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((r) => {
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setApps(d.applications ?? []); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionLoading(id + action);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      if (action === "approve") {
        toast.success(`Approved. Code: ${data.code}`, { duration: 8000 });
        setApps((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "approved", invitation_code: data.code } : a
          )
        );
      } else {
        toast.success("Application rejected.");
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)));
      }
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = apps.filter((a) => filter === "all" || a.status === filter);
  const pendingCount = apps.filter((a) => a.status === "pending").length;

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-label text-champagne mb-3">
          Admin — Applications
        </div>
        <h1 className="text-display-lg text-ivory mb-1">
          Mommy <span className="italic text-champagne">applications.</span>
        </h1>
        {pendingCount > 0 && (
          <p className="text-body-sm text-champagne/70">{pendingCount} awaiting review</p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-body-sm border capitalize transition-all ${
              filter === f
                ? "bg-champagne text-obsidian border-champagne"
                : "bg-smoke text-ivory/60 border-champagne/20 hover:border-champagne/40"
            }`}
          >
            {f}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-burgundy text-ivory text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-smoke" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-ivory/40">No {filter} applications.</div>
      ) : (
        <div className="space-y-5">
          {filtered.map((app) => (
            <div
              key={app.id}
              className={`p-6 rounded-2xl border transition-all ${
                app.status === "pending"
                  ? "bg-smoke border-champagne/20"
                  : app.status === "approved"
                    ? "bg-smoke border-emerald-500/20"
                    : "bg-smoke border-ivory/5 opacity-60"
              }`}
            >
              <div className="flex gap-5">
                {/* Photos */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {app.photo_urls.slice(0, 3).map((url, i) => (
                    <div key={i} className="size-16 rounded-xl overflow-hidden relative border border-champagne/10 shrink-0">
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-body-lg font-medium text-ivory">{app.full_name}</h3>
                      <div className="flex items-center gap-3 text-label text-ivory/40 mt-1">
                        <span>{app.age} yrs</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />{app.city}
                        </span>
                        {app.instagram && (
                          <span className="flex items-center gap-1">
                            <AtSign className="size-3" />{app.instagram}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-label text-ivory/30 mt-0.5">{app.email}</div>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-label border flex-shrink-0 ${
                        app.status === "pending"
                          ? "text-champagne bg-champagne/10 border-champagne/20"
                          : app.status === "approved"
                            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                            : "text-ivory/30 bg-smoke border-ivory/10"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* Motivation */}
                  <div className="mt-3">
                    <p className={`text-body-sm text-ivory/60 ${expandedMotivation === app.id ? "" : "line-clamp-2"}`}>
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

                  {/* Approved: show code */}
                  {app.status === "approved" && app.invitation_code && (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/20">
                      <code className="text-body-sm text-emerald-400 font-mono">{app.invitation_code}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(app.invitation_code!);
                          toast.success("Code copied.");
                        }}
                        className="ml-auto text-ivory/40 hover:text-ivory transition-colors"
                      >
                        <Copy className="size-4" />
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  {app.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAction(app.id, "approve")}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-body-sm hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <Check className="size-3.5" />
                        {actionLoading === app.id + "approve" ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(app.id, "reject")}
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
                        className={`ml-auto flex items-center gap-1 text-label text-ivory/30 hover:text-ivory transition-colors ${!app.instagram ? "invisible" : ""}`}
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
      )}
    </div>
  );
}
