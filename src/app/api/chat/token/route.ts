import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { isConfigured } from "@/lib/env";

// POST /api/chat/token — generates a Stream Chat token for the authenticated user.
// Only active users receive a token; suspended or pending users are rejected.
export async function POST() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  // Verify user is active before issuing a chat token
  const { data: userRecord } = await supabase
    .from("users")
    .select("status")
    .eq("id", user!.id)
    .single();

  if (!userRecord || userRecord.status !== "active") {
    return NextResponse.json({ error: "Account not active" }, { status: 403 });
  }

  if (!isConfigured.stream) {
    return NextResponse.json({
      token: "stub-token",
      userId: user!.id,
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY ?? "",
    });
  }

  const { getStreamServer } = await import("@/lib/stream/server");
  const server = getStreamServer();
  // Token expires in 1 hour; client must refresh before expiry
  const expiration = Math.floor(Date.now() / 1000) + 3600;
  const token = server.createToken(user!.id, expiration);

  return NextResponse.json({
    token,
    userId: user!.id,
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY ?? "",
  });
}
