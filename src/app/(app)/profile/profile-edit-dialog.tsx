"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Edit, X, Camera, GripVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SUGGESTED_DESIRES = [
  "Travel", "Fine Dining", "Motorsport", "Aviation",
  "Intellectual", "Creative", "Art", "Wellness",
];

interface Props {
  initialName: string;
  initialBio: string;
  initialDesires: string[];
  initialPhotoUrls: string[];
}

export function ProfileEditDialog({
  initialName,
  initialBio,
  initialDesires,
  initialPhotoUrls,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [desires, setDesires] = useState(initialDesires);
  const [photoUrls, setPhotoUrls] = useState(initialPhotoUrls);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Unsaved changes warning state
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return (
      name !== initialName ||
      bio !== initialBio ||
      JSON.stringify(desires.sort()) !== JSON.stringify(initialDesires.sort()) ||
      JSON.stringify(photoUrls) !== JSON.stringify(initialPhotoUrls)
    );
  }, [name, bio, desires, photoUrls, initialName, initialBio, initialDesires, initialPhotoUrls]);

  // Warn about unsaved changes when leaving page
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (open && hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [open, hasUnsavedChanges]);

  function handleCloseAttempt() {
    if (hasUnsavedChanges()) {
      setShowUnsavedWarning(true);
      setPendingClose(true);
    } else {
      setOpen(false);
    }
  }

  function confirmClose() {
    setShowUnsavedWarning(false);
    setPendingClose(false);
    setOpen(false);
    // Reset to initial values
    setName(initialName);
    setBio(initialBio);
    setDesires(initialDesires);
    setPhotoUrls(initialPhotoUrls);
  }

  function cancelClose() {
    setShowUnsavedWarning(false);
    setPendingClose(false);
  }

  function toggleDesire(d: string) {
    setDesires((prev) =>
      prev.includes(d)
        ? prev.filter((x) => x !== d)
        : prev.length < 3
          ? [...prev, d]
          : prev
    );
  }

  async function handlePhotoClick(idx: number) {
    if (photoUrls[idx]) {
      setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    setUploadingIdx(idx);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { setUploadingIdx(null); return; }
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          setPhotoUrls((prev) => {
            const next = [...prev];
            next[idx] = data.url;
            return next;
          });
        }
      } finally {
        setUploadingIdx(null);
      }
    };
    input.click();
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: name,
          bio,
          desires,
          photo_urls: photoUrls,
        }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="gold-outline" className="rounded-full" onClick={() => setOpen(true)}>
        <Edit className="size-4 mr-2" />
        Edit
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={handleCloseAttempt} />
          <div className="relative bg-smoke border border-champagne/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl text-ivory">Edit Profile</h2>
              <button onClick={handleCloseAttempt} className="text-ivory/40 hover:text-ivory">
                <X className="size-5" />
              </button>
            </div>

            {/* Photos */}
            <div>
              <label className="text-label text-ivory/50 mb-3 block">
                Photos
                {photoUrls.length > 0 && (
                  <span className="text-ivory/30 ml-2 text-xs">(drag to reorder)</span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    draggable={!!photoUrls[i]}
                    onDragStart={() => {
                      if (photoUrls[i]) setDraggedIdx(i);
                    }}
                    onDragEnd={() => {
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedIdx !== null && draggedIdx !== i) {
                        setDragOverIdx(i);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIdx !== null && draggedIdx !== i) {
                        // Swap photos
                        setPhotoUrls((prev) => {
                          const newUrls = [...prev];
                          const draggedUrl = newUrls[draggedIdx];
                          const targetUrl = newUrls[i];
                          newUrls[i] = draggedUrl;
                          newUrls[draggedIdx] = targetUrl;
                          return newUrls;
                        });
                      }
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                    }}
                    className={cn(
                      "aspect-[3/4] rounded-xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden",
                      photoUrls[i] ? "border-champagne cursor-move" : "border-champagne/20",
                      dragOverIdx === i && "border-champagne-400 bg-champagne/10",
                      draggedIdx === i && "opacity-50"
                    )}
                  >
                    {photoUrls[i] ? (
                      <>
                        <Image
                          src={photoUrls[i]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 150px"
                          draggable={false}
                        />
                        {/* Reorder hint */}
                        <div className="absolute top-1 left-1 p-1 bg-obsidian/60 rounded">
                          <GripVertical className="size-3 text-ivory/70" />
                        </div>
                        {/* Delete overlay */}
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoUrls((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          <X className="size-4 text-ivory" />
                        </div>
                      </>
                    ) : uploadingIdx === i ? (
                      <div className="size-4 rounded-full border-2 border-champagne/40 border-t-champagne animate-spin" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePhotoClick(i)}
                        className="w-full h-full flex items-center justify-center hover:border-champagne/50 transition-colors"
                      >
                        <Camera className="size-4 text-champagne/40" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-label text-ivory/50 mb-2 block">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-obsidian border-champagne/30 text-ivory rounded-full px-5"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-label text-ivory/50 mb-2 block">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="bg-obsidian border-champagne/30 text-ivory rounded-2xl p-4"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="text-label text-ivory/50 mb-3 block">
                Interests ({desires.length}/3 selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_DESIRES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDesire(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-body-sm border transition-all",
                      desires.includes(d)
                        ? "bg-champagne text-obsidian border-champagne"
                        : "bg-smoke text-ivory/70 border-champagne/20 hover:border-champagne/50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="gold"
              className="w-full h-12 rounded-full"
              onClick={save}
              disabled={saving || !name.trim()}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning Dialog */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-sm" onClick={cancelClose} />
          <div className="relative bg-smoke border border-champagne/30 rounded-2xl w-full max-w-md p-6 text-center">
            <AlertTriangle className="size-12 text-chamber-400 mx-auto mb-4" />
            <h3 className="font-headline text-xl text-ivory mb-2">Unsaved Changes</h3>
            <p className="text-body-md text-ivory/60 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-full border-champagne/30 text-ivory"
                onClick={cancelClose}
              >
                Keep Editing
              </Button>
              <Button
                variant="gold"
                className="flex-1 h-11 rounded-full"
                onClick={confirmClose}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
