import { NextResponse } from "next/server";

// Concierge activation — no longer creates a Stream channel.
// The concierge chat (concierge-{userId}) is created automatically on first message
// via the ConciergeChat component using Supabase Realtime.
export async function POST(req: Request) {
  const internalSecret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-internal-secret");
  if (!internalSecret || provided !== internalSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  return NextResponse.json({ chatId: `concierge-${userId}` });
}
