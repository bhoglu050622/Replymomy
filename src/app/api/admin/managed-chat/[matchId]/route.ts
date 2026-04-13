import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  content: z.string().min(1).max(4000),
  sendAsUserId: z.string().uuid(),
});

// GET /api/admin/managed-chat/[matchId] — fetch messages for a match
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const admin = createAdminClient();
  const { matchId } = await params;

  const { data: userRecord } = await admin
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (userRecord?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("messages")
    .select(`
      id, sender_id, content, attachments, reactions, edited_at, deleted_at, created_at,
      sender:users!messages_sender_id_fkey(id, profiles!profiles_user_id_fkey(display_name))
    `)
    .eq("chat_id", `match-${matchId}`)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}

// POST /api/admin/managed-chat/[matchId] — send a message as a managed profile
export async function POST(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const admin = createAdminClient();
  const { matchId } = await params;

  // Verify admin role
  const { data: userRecord } = await admin
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (userRecord?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = bodySchema.parse(await req.json());

  // Verify sendAsUserId is a managed profile
  const { data: profile } = await admin
    .from("profiles")
    .select("user_id")
    .eq("user_id", body.sendAsUserId)
    .eq("response_commitment", "__managed__")
    .single();
  if (!profile) {
    return NextResponse.json({ error: "Not a managed profile" }, { status: 400 });
  }

  // Verify the match exists and the managed user is a participant
  const { data: match } = await admin
    .from("matches")
    .select("id, member_id, mommy_id, status")
    .eq("id", matchId)
    .eq("status", "mutual")
    .single();
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (match.member_id !== body.sendAsUserId && match.mommy_id !== body.sendAsUserId) {
    return NextResponse.json({ error: "Profile not in this match" }, { status: 400 });
  }

  // Insert message as the managed profile (admin client bypasses RLS)
  const { data: msg, error } = await admin
    .from("messages")
    .insert({
      chat_id: `match-${matchId}`,
      sender_id: body.sendAsUserId,
      content: body.content.trim(),
      attachments: [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: msg });
}
