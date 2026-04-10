import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// POST /api/chat/token — generates a Stream Chat token for the authenticated user.
export async function POST() {
  const { user, response } = await requireAuth();
  if (response) return response;

  if (
    !process.env.STREAM_API_SECRET ||
    process.env.STREAM_API_SECRET === "your-stream-api-secret"
  ) {
    return NextResponse.json({
      token: "stub-token",
      userId: user!.id,
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY ?? "",
    });
  }

  const { getStreamServer } = await import("@/lib/stream/server");
  const server = getStreamServer();
  const token = server.createToken(user!.id);

  return NextResponse.json({
    token,
    userId: user!.id,
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY ?? "",
  });
}
