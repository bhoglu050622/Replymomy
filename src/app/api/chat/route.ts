import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/chat — list all mutual matches with last message preview
export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  const admin = createAdminClient();

  // Mutual matches for this user
  const { data: matches, error } = await admin
    .from("matches")
    .select(`
      id, created_at,
      member:users!matches_member_id_fkey(id, profiles(display_name)),
      mommy:users!matches_mommy_id_fkey(id, profiles(display_name))
    `)
    .or(`member_id.eq.${user!.id},mommy_id.eq.${user!.id}`)
    .eq("status", "mutual")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!matches?.length) return NextResponse.json({ chats: [] });

  // Fetch last message for each match in one query
  const chatIds = matches.map((m) => `match-${m.id}`);
  const { data: lastMsgs } = await admin
    .from("messages")
    .select("chat_id, content, created_at, sender_id")
    .in("chat_id", chatIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Group: keep only latest per chat_id
  const latestByChat: Record<string, typeof lastMsgs extends (infer T)[] | null ? T : never> = {};
  for (const msg of lastMsgs ?? []) {
    if (!latestByChat[msg.chat_id]) latestByChat[msg.chat_id] = msg;
  }

  type MatchUser = { id: string; profiles: { display_name: string }[] } | null;
  const chats = matches.map((m) => {
    const member = (m.member as unknown as MatchUser);
    const mommy = (m.mommy as unknown as MatchUser);
    const isMe = member?.id === user!.id;
    const other = isMe ? mommy : member;
    const otherProfile = other?.profiles?.[0] ?? null;
    const last = latestByChat[`match-${m.id}`];

    return {
      matchId: m.id,
      otherName: otherProfile?.display_name ?? "Match",
      lastMessage: last?.content ?? null,
      lastMessageAt: last?.created_at ?? m.created_at,
    };
  }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return NextResponse.json({ chats });
}
