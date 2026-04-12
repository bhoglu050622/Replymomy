import { NextResponse } from "next/server";
import { activateConcierge } from "@/lib/stream/concierge";

export async function POST(req: Request) {
  // Internal-only endpoint — require the shared CRON_SECRET to prevent unauthorized use.
  const internalSecret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-internal-secret");
  if (!internalSecret || provided !== internalSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { channelId } = await activateConcierge(userId);
    return NextResponse.json({ channelId });
  } catch (err) {
    console.error("[concierge/activate]", err);
    return NextResponse.json({ error: "Failed to activate concierge" }, { status: 500 });
  }
}
