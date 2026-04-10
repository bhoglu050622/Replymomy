import { NextResponse } from "next/server";
import { getStreamServer } from "@/lib/stream/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Skip if Stream is not configured
    if (!process.env.STREAM_API_KEY || process.env.STREAM_API_KEY === "your-stream-api-key") {
      return NextResponse.json({ channelId: `concierge-${userId}`, mode: "stub" });
    }

    const serverClient = getStreamServer();
    const channelId = `concierge-${userId}`;

    // Ensure the concierge bot user exists
    await serverClient.upsertUser({
      id: "guild-liaison",
      name: "Your Liaison",
      role: "admin",
      image: undefined,
    });

    // Create or update the dedicated concierge channel
    const channel = serverClient.channel("messaging", channelId, {
      members: [userId, "guild-liaison"],
      created_by_id: "guild-liaison",
    });

    await channel.create();

    // Send a welcome message from the liaison
    await channel.sendMessage({
      user_id: "guild-liaison",
      text: "Welcome to The Midnight Guild, Principal member. I'm your personal liaison — available around the clock for scheduling, discretion, and anything in between. How may I assist you today?",
    });

    return NextResponse.json({ channelId });
  } catch (err) {
    console.error("[concierge/activate]", err);
    return NextResponse.json({ error: "Failed to activate concierge" }, { status: 500 });
  }
}
