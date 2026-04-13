import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const sendSchema = z.object({
  content: z.string().max(4000).optional(),
  attachments: z.array(z.object({
    assetId: z.string(),
    url: z.string(),
    thumbUrl: z.string().nullable(),
  })).max(5).default([]),
});

async function verifyMember(userId: string, matchId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("matches")
    .select("id, member_id, mommy_id")
    .eq("id", matchId)
    .eq("status", "mutual")
    .single();
  if (!data) return null;
  if (data.member_id !== userId && data.mommy_id !== userId) return null;
  return data;
}

// GET /api/chat/[matchId]/messages — fetch last 60 messages
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { user, response } = await requireAuth();
  if (response) return response;
  const { matchId } = await params;

  const match = await verifyMember(user!.id, matchId);
  if (!match) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("messages")
    .select(`id, chat_id, sender_id, content, attachments, reactions, edited_at, deleted_at, created_at,
             sender:users!messages_sender_id_fkey(id, profiles(display_name, photo_url))`)
    .eq("chat_id", `match-${matchId}`)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}

// POST /api/chat/[matchId]/messages — send a message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { user, response } = await requireAuth();
  if (response) return response;
  const { matchId } = await params;

  const match = await verifyMember(user!.id, matchId);
  if (!match) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = sendSchema.parse(await req.json());
  if (!body.content?.trim() && body.attachments.length === 0) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: msg, error } = await admin
    .from("messages")
    .insert({
      chat_id: `match-${matchId}`,
      sender_id: user!.id,
      content: body.content?.trim() ?? null,
      attachments: body.attachments.map((a) => ({
        asset_id: a.assetId,
        url: a.url,
        thumb_url: a.thumbUrl,
      })),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Link media assets to this message
  if (body.attachments.length > 0) {
    await admin
      .from("media_assets")
      .update({ stream_message_id: msg.id, chat_id: `match-${matchId}` })
      .in("id", body.attachments.map((a) => a.assetId))
      .eq("owner_id", user!.id);
  }

  return NextResponse.json({ message: msg });
}
