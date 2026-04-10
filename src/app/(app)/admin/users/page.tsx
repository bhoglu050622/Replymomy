"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  status: string;
  member_tier: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  async function toggleStatus(user: UserRow) {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setUpdating(user.id);
    const prev = users;
    setUsers((u) => u?.map((r) => (r.id === user.id ? { ...r, status: newStatus } : r)) ?? null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"}.`);
    } catch {
      setUsers(prev);
      toast.error("Failed to update user.");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = users?.filter((u) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.display_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="text-label text-champagne mb-1">Admin / Users</div>
          <h1 className="text-display-lg text-ivory">
            Members & <span className="italic text-champagne">mommies.</span>
          </h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ivory/30" />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-10 pr-4 rounded-full bg-smoke border border-champagne/20 text-ivory text-sm placeholder:text-ivory/30 focus:outline-none focus:border-champagne/50 w-full sm:w-64"
          />
        </div>
      </div>

      {users === null ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : !filtered?.length ? (
        <p className="text-body-md text-ivory/40 text-center py-16">
          {query ? "No users match your search." : "No users yet."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered!.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-smoke border border-champagne/10 gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-body-md text-ivory truncate">
                    {user.display_name ?? "—"}
                  </span>
                  <span
                    className={cn(
                      "text-label px-2 py-0.5 rounded-full shrink-0",
                      user.role === "admin"
                        ? "bg-champagne/20 text-champagne"
                        : user.role === "mommy"
                        ? "bg-burgundy/30 text-rose"
                        : "bg-smoke text-ivory/40 border border-champagne/10"
                    )}
                  >
                    {user.role}
                  </span>
                  {user.member_tier && (
                    <span className="text-label text-ivory/30 shrink-0">
                      {user.member_tier.replace("_", " ")}
                    </span>
                  )}
                </div>
                <div className="text-label text-ivory/30 truncate">{user.email}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={cn(
                    "text-label px-2 py-0.5 rounded-full hidden sm:block",
                    user.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : user.status === "suspended"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-ivory/5 text-ivory/30"
                  )}
                >
                  {user.status}
                </span>
                {user.role !== "admin" && (
                  <button
                    onClick={() => toggleStatus(user)}
                    disabled={updating === user.id}
                    className={cn(
                      "text-label px-3 py-1.5 rounded-full border transition-colors",
                      user.status === "active"
                        ? "border-red-400/30 text-red-400 hover:bg-red-400/10"
                        : "border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                    )}
                  >
                    {updating === user.id
                      ? "..."
                      : user.status === "active"
                      ? "Suspend"
                      : "Activate"}
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
