"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Users, Key, Clock, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserRow {
  id: string;
  status: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 403) { setForbidden(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setUsers(d.users ?? []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (forbidden) router.push("/dashboard");
  }, [forbidden, router]);

  const total = users?.length ?? 0;
  const active = users?.filter((u) => u.status === "active").length ?? 0;
  const pending = users?.filter((u) => u.status?.startsWith("pending")).length ?? 0;

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      <div className="mb-10 flex items-center gap-3">
        <ShieldCheck className="size-6 text-champagne" />
        <div>
          <div className="text-label text-champagne mb-1">Admin</div>
          <h1 className="text-display-lg text-ivory">
            Control <span className="italic text-champagne">panel.</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {users === null ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <div className="p-6 rounded-2xl bg-smoke border border-champagne/10">
              <div className="text-label text-ivory/50 mb-2">Total Users</div>
              <div className="font-headline text-4xl text-ivory">{total}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-burgundy/20 to-smoke border border-champagne/20">
              <div className="text-label text-ivory/50 mb-2">Active Members</div>
              <div className="font-headline text-4xl text-champagne">{active}</div>
            </div>
            <div className="p-6 rounded-2xl bg-smoke border border-champagne/10">
              <div className="text-label text-ivory/50 mb-2">Pending Verification</div>
              <div className="font-headline text-4xl text-ivory">{pending}</div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/invitations"
          className="group p-8 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-colors"
        >
          <Key className="size-6 text-champagne/60 group-hover:text-champagne mb-4 transition-colors" />
          <h2 className="font-headline text-2xl text-ivory mb-2">Invitations</h2>
          <p className="text-body-sm text-ivory/40">Generate and revoke invitation codes.</p>
        </Link>
        <Link
          href="/admin/users"
          className="group p-8 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-colors"
        >
          <Users className="size-6 text-champagne/60 group-hover:text-champagne mb-4 transition-colors" />
          <h2 className="font-headline text-2xl text-ivory mb-2">Users</h2>
          <p className="text-body-sm text-ivory/40">View, suspend, and manage members.</p>
        </Link>
        <Link
          href="/admin/applications"
          className="group p-8 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-colors"
        >
          <FileText className="size-6 text-champagne/60 group-hover:text-champagne mb-4 transition-colors" />
          <h2 className="font-headline text-2xl text-ivory mb-2">Applications</h2>
          <p className="text-body-sm text-ivory/40">Review and approve mommy applications.</p>
        </Link>
        <Link
          href="/mommy-dashboard"
          className="group p-8 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-colors"
        >
          <Clock className="size-6 text-champagne/60 group-hover:text-champagne mb-4 transition-colors" />
          <h2 className="font-headline text-2xl text-ivory mb-2">Mommy Dashboard</h2>
          <p className="text-body-sm text-ivory/40">Earnings, spotlight, and badges.</p>
        </Link>
      </div>
    </div>
  );
}
