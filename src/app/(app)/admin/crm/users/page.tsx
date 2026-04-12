"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Search,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Tag,
  StickyNote,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  status: string;
  member_tier: string | null;
  mommy_tier: string | null;
  verification_status: string | null;
  token_balance: number | null;
  last_active_at: string | null;
  is_spotlight: boolean | null;
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  users: { display_name: string | null; email: string } | null;
}

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  reason: string | null;
  created_at: string;
  changer: { display_name: string | null; email: string } | null;
}

interface TagRow {
  id: string;
  tag: string;
  created_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === "active") return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
  if (status === "suspended") return "bg-red-400/10 text-red-400 border-red-400/20";
  if (status === "banned") return "bg-red-600/10 text-red-400 border-red-600/20";
  if (status?.startsWith("pending")) return "bg-amber-400/10 text-amber-400 border-amber-400/20";
  return "bg-ivory/5 text-ivory/40 border-ivory/10";
}

function roleColor(role: string) {
  if (role === "mommy") return "bg-burgundy/30 text-rose border-burgundy/40";
  if (role === "admin") return "bg-champagne/15 text-champagne border-champagne/25";
  return "bg-ivory/5 text-ivory/40 border-ivory/10";
}

function tierColor(tier: string | null) {
  if (!tier) return "";
  if (tier === "gold") return "bg-champagne/10 text-champagne border-champagne/20";
  if (tier === "platinum") return "bg-graphite text-ivory/60 border-ivory/10";
  if (tier === "black_card") return "bg-obsidian text-ivory border-champagne/30";
  return "bg-ivory/5 text-ivory/30 border-ivory/10";
}

function relativeTime(dateStr: string | null) {
  if (!dateStr) return "Never";
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

// ─── User Detail Sheet ───────────────────────────────────────────────────────

function UserSheet({
  user,
  onClose,
  onStatusUpdated,
}: {
  user: UserRow;
  onClose: () => void;
  onStatusUpdated: (userId: string, newStatus: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[] | null>(null);
  const [tags, setTags] = useState<TagRow[] | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [newStatus, setNewStatus] = useState(user.status);
  const [statusReason, setStatusReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [savingTag, setSavingTag] = useState(false);

  useEffect(() => {
    // Load notes
    fetch(`/api/admin/crm/notes?entity_type=user&entity_id=${user.id}`)
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []));

    // Load tags
    fetch(`/api/admin/crm/tags?user_id=${user.id}`)
      .then((r) => r.json())
      .then((d) => setTags(d.tags ?? []));

    // Load history
    fetch(`/api/admin/crm/status-history?user_id=${user.id}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []));
  }, [user.id]);

  async function saveStatusChange() {
    if (newStatus === user.status) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, status: newStatus, reason: statusReason }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Status updated to ${newStatus}`);
      onStatusUpdated(user.id, newStatus);
      setStatusReason("");
      // Refresh history
      fetch(`/api/admin/crm/status-history?user_id=${user.id}`)
        .then((r) => r.json())
        .then((d) => setHistory(d.history ?? []));
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/admin/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_type: "user", entity_id: user.id, content: noteInput }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      setNotes((prev) => [d.note, ...(prev ?? [])]);
      setNoteInput("");
      toast.success("Note added.");
    } catch {
      toast.error("Failed to add note.");
    } finally {
      setSavingNote(false);
    }
  }

  async function deleteNote(noteId: string) {
    try {
      await fetch(`/api/admin/crm/notes?id=${noteId}`, { method: "DELETE" });
      setNotes((prev) => prev?.filter((n) => n.id !== noteId) ?? null);
      toast.success("Note deleted.");
    } catch {
      toast.error("Failed to delete note.");
    }
  }

  async function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    setSavingTag(true);
    try {
      const res = await fetch("/api/admin/crm/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, tag: t }),
      });
      const d = await res.json();
      if (res.status === 409) { toast.error("Tag already exists."); return; }
      if (!res.ok) throw new Error(d.error ?? "Failed");
      setTags((prev) => [...(prev ?? []), d.tag]);
      setTagInput("");
    } catch {
      toast.error("Failed to add tag.");
    } finally {
      setSavingTag(false);
    }
  }

  async function removeTag(tag: string) {
    try {
      await fetch(`/api/admin/crm/tags?user_id=${user.id}&tag=${encodeURIComponent(tag)}`, {
        method: "DELETE",
      });
      setTags((prev) => prev?.filter((t) => t.tag !== tag) ?? null);
    } catch {
      toast.error("Failed to remove tag.");
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-obsidian border-l border-champagne/20 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-champagne/[0.08]">
          <div className="min-w-0">
            <div className="text-base font-semibold text-ivory truncate">
              {user.display_name ?? "Unnamed User"}
            </div>
            <div className="text-xs text-ivory/40 truncate">{user.email}</div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-xl text-ivory/40 hover:text-ivory hover:bg-champagne/[0.08] transition-colors shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mt-4 shrink-0">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notes">
              Notes{notes !== null && notes.length > 0 ? ` (${notes.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Basic info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-ivory/30">
                User Info
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Role", <span key="role" className={cn("text-xs px-2 py-0.5 rounded-full border", roleColor(user.role))}>{user.role}</span>],
                  ["Status", <span key="status" className={cn("text-xs px-2 py-0.5 rounded-full border", statusColor(user.status))}>{user.status}</span>],
                  ["Member Tier", user.member_tier ? <span key="mtier" className={cn("text-xs px-2 py-0.5 rounded-full border", tierColor(user.member_tier))}>{user.member_tier.replace("_", " ")}</span> : <span key="notier" className="text-xs text-ivory/30">—</span>],
                  ["Verification", <span key="verif" className="text-xs text-ivory/50">{user.verification_status ?? "—"}</span>],
                  ["Tokens", <span key="tokens" className="text-xs text-champagne">{user.token_balance ?? 0}</span>],
                  ["Spotlight", <span key="spot" className={cn("text-xs", user.is_spotlight ? "text-champagne" : "text-ivory/30")}>{user.is_spotlight ? "Yes" : "No"}</span>],
                  ["Joined", <span key="joined" className="text-xs text-ivory/50">{new Date(user.created_at).toLocaleDateString()}</span>],
                  ["Last Active", <span key="active" className="text-xs text-ivory/50">{relativeTime(user.last_active_at)}</span>],
                ].map(([label, val]) => (
                  <div key={label as string} className="p-3 rounded-xl bg-smoke/80 border border-champagne/[0.06]">
                    <div className="text-[10px] font-semibold tracking-wider uppercase text-ivory/25 mb-1">
                      {label}
                    </div>
                    <div>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status change */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-ivory/30">
                Change Status
              </h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="pending_profile">Pending Profile</option>
              </select>
              <textarea
                placeholder="Reason for change (optional)"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm p-3 placeholder:text-ivory/30 focus:outline-none focus:border-champagne/40 resize-none"
              />
              <Button
                variant="gold"
                size="sm"
                onClick={saveStatusChange}
                disabled={saving || newStatus === user.status}
                className="w-full"
              >
                {saving ? "Saving..." : "Update Status"}
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-ivory/30">
                Tags
              </h3>
              {tags === null ? (
                <Skeleton className="h-8 w-full bg-smoke rounded-xl" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-champagne/10 text-champagne border border-champagne/20"
                    >
                      <Tag className="size-2.5" />
                      {t.tag}
                      <button
                        onClick={() => removeTag(t.tag)}
                        className="ml-0.5 hover:text-red-400 transition-colors"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-ivory/30">No tags yet.</span>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag..."
                  className="flex-1 h-9 rounded-xl bg-smoke border border-champagne/20 text-ivory text-xs px-3 placeholder:text-ivory/30 focus:outline-none focus:border-champagne/40"
                />
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={addTag}
                  disabled={savingTag || !tagInput.trim()}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {/* Add note */}
            <div className="space-y-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add a note about this user..."
                rows={3}
                className="w-full rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm p-3 placeholder:text-ivory/30 focus:outline-none focus:border-champagne/40 resize-none"
              />
              <Button
                variant="gold"
                size="sm"
                onClick={addNote}
                disabled={savingNote || !noteInput.trim()}
                className="w-full"
              >
                {savingNote ? "Saving..." : "Add Note"}
              </Button>
            </div>

            {/* Notes list */}
            <div className="space-y-3">
              {notes === null ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl bg-smoke" />
                ))
              ) : notes.length === 0 ? (
                <div className="py-8 text-center text-sm text-ivory/30">
                  <StickyNote className="size-8 mx-auto mb-2 opacity-20" />
                  No notes yet.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl bg-smoke/80 border border-champagne/[0.06] group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-xs text-ivory/30">
                        {note.users?.display_name ?? note.users?.email ?? "Admin"} ·{" "}
                        {relativeTime(note.created_at)}
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 text-ivory/30 hover:text-red-400 transition-all"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-ivory/80 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-y-auto px-6 py-4">
            {history === null ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl bg-smoke" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-sm text-ivory/30">
                <Clock className="size-8 mx-auto mb-2 opacity-20" />
                No status changes recorded.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-champagne/10" />
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex gap-4 relative">
                      <div className="size-3.5 rounded-full bg-champagne/20 border border-champagne/40 shrink-0 mt-1 z-10" />
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {entry.old_status && (
                            <>
                              <span
                                className={cn(
                                  "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                                  statusColor(entry.old_status)
                                )}
                              >
                                {entry.old_status}
                              </span>
                              <ChevronRight className="size-3 text-ivory/30" />
                            </>
                          )}
                          <span
                            className={cn(
                              "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                              statusColor(entry.new_status)
                            )}
                          >
                            {entry.new_status}
                          </span>
                        </div>
                        <div className="text-xs text-ivory/30">
                          by {entry.changer?.display_name ?? entry.changer?.email ?? "Admin"} ·{" "}
                          {relativeTime(entry.created_at)}
                        </div>
                        {entry.reason && (
                          <div className="mt-1 text-xs text-ivory/50 italic">{entry.reason}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CRMUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const LIMIT = 50;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const d = await res.json();
      setUsers(d.users ?? []);
      setTotal(d.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  }

  function handleStatusUpdated(userId: string, newStatus: string) {
    setUsers((prev) =>
      prev?.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)) ?? null
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-label text-champagne/70 mb-2">Admin / CRM</div>
        <h1 className="text-display-lg text-ivory">
          Users <span className="italic text-champagne">CRM.</span>
        </h1>
        <p className="text-body-sm text-ivory/40 mt-1">
          {total.toLocaleString()} total users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ivory/30" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm placeholder:text-ivory/30 focus:outline-none focus:border-champagne/40"
            />
          </div>
          <Button variant="gold-outline" size="sm" type="submit">Search</Button>
        </form>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="h-9 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
          >
            <option value="">All Roles</option>
            <option value="member">Member</option>
            <option value="mommy">Mommy</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="h-9 rounded-xl bg-smoke border border-champagne/20 text-ivory text-sm px-3 focus:outline-none focus:border-champagne/40"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="pending_profile">Pending Profile</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-smoke/80 border border-champagne/[0.08] overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-champagne/[0.08]">
          {["Name / Email", "Role", "Status", "Tier", "Last Active", "Tags"].map((h) => (
            <div key={h} className="text-[10px] font-semibold tracking-widest uppercase text-ivory/25">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="divide-y divide-champagne/[0.06]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4 items-center">
                <Skeleton className="h-4 flex-1 bg-smoke" />
                <Skeleton className="h-4 w-16 bg-smoke" />
                <Skeleton className="h-4 w-20 bg-smoke" />
              </div>
            ))}
          </div>
        ) : !users?.length ? (
          <div className="py-16 text-center text-sm text-ivory/30">
            {search || roleFilter || statusFilter ? "No users match your filters." : "No users yet."}
          </div>
        ) : (
          <div className="divide-y divide-champagne/[0.06]">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full text-left px-6 py-4 hover:bg-champagne/[0.04] transition-colors"
              >
                <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
                  {/* Name / Email */}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ivory truncate">
                      {user.display_name ?? "—"}
                    </div>
                    <div className="text-xs text-ivory/30 truncate">{user.email}</div>
                  </div>

                  {/* Role */}
                  <div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                        roleColor(user.role)
                      )}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                        statusColor(user.status)
                      )}
                    >
                      {user.status.replace("pending_", "")}
                    </span>
                  </div>

                  {/* Tier */}
                  <div>
                    {user.member_tier ? (
                      <span
                        className={cn(
                          "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                          tierColor(user.member_tier)
                        )}
                      >
                        {user.member_tier.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="text-xs text-ivory/20">—</span>
                    )}
                  </div>

                  {/* Last active */}
                  <div className="text-xs text-ivory/40">
                    {relativeTime(user.last_active_at)}
                  </div>

                  {/* Tags placeholder — loaded in sheet */}
                  <div className="text-xs text-ivory/20">
                    <Tag className="size-3.5" />
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="lg:hidden flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-ivory truncate">{user.display_name ?? user.email}</div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", roleColor(user.role))}>
                        {user.role}
                      </span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", statusColor(user.status))}>
                        {user.status.replace("pending_", "")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-ivory/20 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-ivory/30">
            Page {page + 1} of {totalPages} · {total.toLocaleString()} users
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

      {/* User detail sheet */}
      {selectedUser && (
        <UserSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
