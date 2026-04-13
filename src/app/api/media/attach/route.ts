import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// PATCH /api/media/attach
// Called after channel.sendMessage() resolves with the Stream message ID.
// Links the uploaded asset to the message so it isn't treated as an orphan.
export async function PATCH(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { assetId, streamMessageId, chatId } = await req.json() as {
    assetId: string;
    streamMessageId: string;
    chatId: string;
  };

  if (!assetId || !streamMessageId) {
    return NextResponse.json({ error: "assetId and streamMessageId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("media_assets")
    .update({ stream_message_id: streamMessageId, chat_id: chatId })
    .eq("id", assetId)
    .eq("owner_id", user.id)
    .is("stream_message_id", null); // idempotent — only update orphans

  if (error) {
    console.error("[media/attach]", error);
    return NextResponse.json({ error: "Failed to attach" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
