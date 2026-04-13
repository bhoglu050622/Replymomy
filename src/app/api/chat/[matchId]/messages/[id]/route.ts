import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const patchSchema = z.object({
  content: z.string().max(4000).optional(),
  reaction: z.string().optional(),
});

// PATCH /api/chat/[matchId]/messages/[id] — edit text or add reaction
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ matchId: string; id: string }> }
) {
  const { user, response } = await requireAuth();
  if (response) return response;
  const { id } = await params;

  const body = patchSchema.parse(await req.json());
  const admin = createAdminClient();

  if (body.reaction) {
    // Toggle reaction
    const { data: msg } = await admin
      .from("messages")
      .select("reactions, sender_id")
      .eq("id", id)
      .single();
    if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const reactions = (msg.reactions as Record<string, string[]>) ?? {};
    const users = reactions[body.reaction] ?? [];
    const uid = user!.id;
    const updated = users.includes(uid)
      ? users.filter((u) => u !== uid)
      : [...users, uid];

    const newReactions = { ...reactions, [body.reaction]: updated };
    if (updated.length === 0) delete newReactions[body.reaction];

    await admin.from("messages").update({ reactions: newReactions }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (body.content !== undefined) {
    // Edit — only own messages
    const { error } = await admin
      .from("messages")
      .update({ content: body.content.trim(), edited_at: new Date().toISOString() })
      .eq("id", id)
      .eq("sender_id", user!.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

// DELETE /api/chat/[matchId]/messages/[id] — soft delete own message
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ matchId: string; id: string }> }
) {
  const { user, response } = await requireAuth();
  if (response) return response;
  const { id } = await params;

  const admin = createAdminClient();
  const { data: msg } = await admin
    .from("messages")
    .select("attachments")
    .eq("id", id)
    .eq("sender_id", user!.id)
    .single();

  if (!msg) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  // Soft-delete media assets
  const atts = (msg.attachments as { asset_id?: string }[]) ?? [];
  const assetIds = atts.map((a) => a.asset_id).filter(Boolean) as string[];
  if (assetIds.length > 0) {
    await admin
      .from("media_assets")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", assetIds);
  }

  await admin
    .from("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("sender_id", user!.id);

  return NextResponse.json({ ok: true });
}
