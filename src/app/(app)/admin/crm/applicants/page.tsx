"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Search,
  X,
  Plus,
  MapPin,
  Briefcase,
  TrendingUp,
  AtSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { AiApplicationReview } from "@/lib/ai/gemini";

// ─── Types ──────────────────────────────────────────────────────────────────

interface MemberApplicant {
  id: string;
  full_name: string;
  email: string;
  age: number;
  city: string;
  occupation: string;
  income_bracket: string;
  motivation: string;
  photo_url: string | null;
  referral_source: string | null;
  status: "pending" | "approved" | "rejected";
  invitation_code: string | null;
  ai_review: AiApplicationReview | null;
  created_at: string;
}

interface MommyApplicant {
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
  ai_review: AiApplicationReview | null;
  created_at: string;
}

type Applicant = MemberApplicant | MommyApplicant;

interface Note {
  id: string;
  content: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  users: { display_name: string | null; email: string } | null;
}

interface AppTag {
  id: string;
  tag: string;
  created_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const INCOME_LABEL: Record<string, string> = {
  "200k_500k": "$200k–$500k",
  "500k_1m": "$500k–$1M",
  "1m_plus": "$1M+",
};

function statusColor(status: string) {
  if (status === "approved") return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
  if (status === "rejected") return "bg-red-400/10 text-red-400 border-red-400/20";
  return "bg-amber-400/10 text-amber-400 border-amber-400/20";
}

function isMember(a: Applicant): a is MemberApplicant {
  return "occupation" in a;
}

// ─── Applicant Detail Sheet ──────────────────────────────────────────────────

function ApplicantSheet({
  applicant,
  applicationType,
  onClose,
}: {
  applicant: Applicant;
  applicationType: "member" | "mommy";
  onClose: () => void;
}) {
  const entityType = applicationType === "member" ? "member_application" : "mommy_application";

  const [notes, setNotes] = useState<Note[] | null>(null);
  const [tags, setTags] = useState<AppTag[] | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingTag, setSavingTag] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/crm/notes?entity_type=${entityType}&entity_id=${applicant.id}`)
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []));

    fetch(`/api/admin/crm/application-tags?application_type=${applicationType}&application_id=${applicant.id}`)
      .then((r) => r.json())
      .then((d) => setTags(d.tags ?? []));
  }, [applicant.id, applicationType, entityType]);

  async function addNote() {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/admin/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_type: entityType, entity_id: applicant.id, content: noteInput }),
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
      const res = await fetch("/api/admin/crm/application-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_type: applicationType, application_id: applicant.id, tag: t }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? "Failed");
        return;
      }
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
      await fetch(
        `/api/admin/crm/application-tags?application_type=${applicationType}&application_id=${applicant.id}&tag=${encodeURIComponent(tag)}`,
        { method: "DELETE" }
      );
      setTags((prev) => prev?.filter((t) => t.tag !== tag) ?? null);
    } catch {
      toast.error("Failed to remove tag.");
    }
  }

  const member = isMember(applicant) ? applicant : null;
  const mommy = !isMember(applicant) ? applicant : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-obsidian border-l border-champagne/[0.08] h-full overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-obsidian/95 backdrop-blur border-b border-champagne/[0.08] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-body-lg font-medium text-ivory">{applicant.full_name}</h2>
            <p className="text-label text-ivory/40">{applicant.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ivory/40 hover:text-ivory transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 p-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2 bg-smoke border border-champagne/10 mb-6">
              <TabsTrigger value="profile" className="data-[state=active]:bg-champagne/10 data-[state=active]:text-champagne text-xs">
                Profile
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-champagne/10 data-[state=active]:text-champagne text-xs">
                Notes & Tags
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center gap-4">
                {member?.photo_url ? (
                  <div className="size-16 rounded-xl overflow-hidden relative border border-champagne/10 flex-shrink-0">
                    <Image src={member.photo_url} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ) : mommy && mommy.photo_urls?.[0] ? (
                  <div className="size-16 rounded-xl overflow-hidden relative border border-champagne/10 flex-shrink-0">
                    <Image src={mommy.photo_urls[0]} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ) : null}
                <div>
                  <span className={cn("px-2.5 py-1 rounded-full text-label border", statusColor(applicant.status))}>
                    {applicant.status}
                  </span>
                  {applicant.invitation_code && (
                    <p className="text-label text-emerald-400/80 mt-1 font-mono">{applicant.invitation_code}</p>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                <Row label="Age">{applicant.age} yrs</Row>
                <Row label="City">{applicant.city}</Row>
                {member && (
                  <>
                    <Row label="Occupation">{member.occupation}</Row>
                    <Row label="Income">{INCOME_LABEL[member.income_bracket] ?? member.income_bracket}</Row>
                    {member.referral_source && <Row label="Referral">{member.referral_source}</Row>}
                  </>
                )}
                {mommy?.instagram && <Row label="Instagram">{mommy.instagram}</Row>}
                <Row label="Submitted">{new Date(applicant.created_at).toLocaleDateString()}</Row>
              </div>

              {/* Motivation */}
              <div>
                <p className="text-label text-ivory/38 mb-2">Their story</p>
                <p className="text-body-sm text-ivory/65 leading-relaxed bg-smoke rounded-xl p-4 border border-champagne/10">
                  {applicant.motivation}
                </p>
              </div>

              {/* Mommy additional photos */}
              {mommy && mommy.photo_urls.length > 1 && (
                <div>
                  <p className="text-label text-ivory/38 mb-2">Photos</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {mommy.photo_urls.map((url, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden relative border border-champagne/10">
                        <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Notes & Tags Tab */}
            <TabsContent value="notes" className="space-y-6">
              {/* Tags */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="size-3.5 text-champagne/60" />
                  <span className="text-label text-ivory/40">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3 min-h-6">
                  {tags === null ? (
                    <span className="text-label text-ivory/20">Loading…</span>
                  ) : tags.length === 0 ? (
                    <span className="text-label text-ivory/20">No tags yet</span>
                  ) : (
                    tags.map((t) => (
                      <span
                        key={t.id}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-champagne/10 border border-champagne/20 text-label text-champagne"
                      >
                        {t.tag}
                        <button onClick={() => removeTag(t.tag)} className="text-champagne/50 hover:text-champagne ml-0.5">
                          <X className="size-2.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag…"
                    className="flex-1 h-8 bg-smoke border border-champagne/20 rounded-full px-4 text-label text-ivory placeholder:text-ivory/25 focus:outline-none focus:border-champagne/50"
                  />
                  <Button
                    variant="gold-outline"
                    size="sm"
                    onClick={addTag}
                    disabled={savingTag || !tagInput.trim()}
                    className="h-8 rounded-full px-3"
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote className="size-3.5 text-champagne/60" />
                  <span className="text-label text-ivory/40">Notes</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a note…"
                    rows={2}
                    className="flex-1 bg-smoke border border-champagne/20 rounded-xl px-4 py-2 text-body-sm text-ivory placeholder:text-ivory/25 focus:outline-none focus:border-champagne/50 resize-none"
                  />
                  <Button
                    variant="gold-outline"
                    size="sm"
                    onClick={addNote}
                    disabled={savingNote || !noteInput.trim()}
                    className="self-end h-8 rounded-full px-3"
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {notes === null ? (
                    <Skeleton className="h-16 rounded-xl bg-smoke" />
                  ) : notes.length === 0 ? (
                    <p className="text-label text-ivory/20 text-center py-4">No notes yet</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="bg-smoke rounded-xl p-4 border border-champagne/[0.08] group">
                        <p className="text-body-sm text-ivory/72 whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-label text-ivory/28">
                            {note.users?.display_name ?? note.users?.email ?? "Admin"} ·{" "}
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-ivory/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-label text-ivory/35 w-24 shrink-0">{label}</span>
      <span className="text-body-sm text-ivory/70">{children}</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

export default function CrmApplicantsPage() {
  const [applicationType, setApplicationType] = useState<"member" | "mommy">("member");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [applicationType, status, debouncedSearch]);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: applicationType,
        status,
        search: debouncedSearch,
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/crm/applicants?${params}`);
      const d = await res.json();
      setApplicants(d.applicants ?? []);
      setTotal(d.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [applicationType, status, debouncedSearch, page]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Admin — CRM</div>
        <h1 className="text-display-lg text-ivory mb-1">
          Applicants <span className="italic text-champagne">CRM.</span>
        </h1>
        <p className="text-body-sm text-ivory/40">
          Manage notes and tags on applicants before they sign up.
        </p>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-6">
        {(["member", "mommy"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setApplicationType(t)}
            className={cn(
              "px-5 py-2 rounded-full text-body-sm border capitalize transition-all",
              applicationType === t
                ? "bg-champagne text-obsidian border-champagne"
                : "bg-smoke text-ivory/60 border-champagne/20 hover:border-champagne/40"
            )}
          >
            {t === "member" ? "Members" : "Mommies"}
          </button>
        ))}
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ivory/30 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-10 bg-smoke border border-champagne/20 rounded-full pl-10 pr-4 text-body-sm text-ivory placeholder:text-ivory/25 focus:outline-none focus:border-champagne/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 py-2 rounded-full text-label border capitalize transition-all",
                status === s
                  ? "bg-champagne/20 text-champagne border-champagne/40"
                  : "bg-smoke text-ivory/50 border-champagne/15 hover:border-champagne/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl bg-smoke" />)}
        </div>
      ) : applicants.length === 0 ? (
        <div className="py-20 text-center text-ivory/40">No applicants found.</div>
      ) : (
        <div className="space-y-2">
          {applicants.map((app) => {
            const member = isMember(app) ? app : null;
            const mommy = !isMember(app) ? app : null;
            return (
              <button
                key={app.id}
                onClick={() => setSelectedApplicant(app)}
                className="w-full text-left p-4 rounded-xl bg-smoke border border-champagne/[0.08] hover:border-champagne/25 transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Photo thumbnail */}
                  {(member?.photo_url || mommy?.photo_urls?.[0]) && (
                    <div className="size-10 rounded-lg overflow-hidden relative border border-champagne/10 flex-shrink-0">
                      <Image
                        src={(member?.photo_url ?? mommy?.photo_urls?.[0])!}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-body-sm font-medium text-ivory group-hover:text-champagne transition-colors truncate">
                        {app.full_name}
                      </span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] border flex-shrink-0", statusColor(app.status))}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-label text-ivory/35 flex-wrap">
                      <span>{app.email}</span>
                      <span className="flex items-center gap-1"><MapPin className="size-3" />{app.city}</span>
                      {member && (
                        <>
                          <span className="flex items-center gap-1"><Briefcase className="size-3" />{member.occupation}</span>
                          <span className="flex items-center gap-1 text-champagne/60">
                            <TrendingUp className="size-3" />{INCOME_LABEL[member.income_bracket] ?? member.income_bracket}
                          </span>
                        </>
                      )}
                      {mommy?.instagram && (
                        <span className="flex items-center gap-1"><AtSign className="size-3" />{mommy.instagram}</span>
                      )}
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock className="size-3" />{new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <span className="text-label text-ivory/40">
            {total} total · page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 rounded-full"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 rounded-full"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {selectedApplicant && (
        <ApplicantSheet
          applicant={selectedApplicant}
          applicationType={applicationType}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  );
}
