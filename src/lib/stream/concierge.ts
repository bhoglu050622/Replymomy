import { getStreamServer } from "@/lib/stream/server";
import { isConfigured } from "@/lib/env";

/**
 * Activates a dedicated concierge (liaison) channel for a Principal-tier member.
 * Called directly by the DodoPayments webhook — NOT via HTTP self-call.
 */
export async function activateConcierge(userId: string): Promise<{ channelId: string }> {
  if (!isConfigured.stream) {
    return { channelId: `concierge-${userId}` };
  }

  const serverClient = getStreamServer();
  const channelId = `concierge-${userId}`;

  await serverClient.upsertUser({
    id: "guild-liaison",
    name: "Your Liaison",
    role: "admin",
    image: undefined,
  });

  const channel = serverClient.channel("messaging", channelId, {
    members: [userId, "guild-liaison"],
    created_by_id: "guild-liaison",
  });

  await channel.create();

  await channel.sendMessage({
    user_id: "guild-liaison",
    text: "Welcome to The Midnight Guild, Principal member. I'm your personal liaison — available around the clock for scheduling, discretion, and anything in between. How may I assist you today?",
  });

  return { channelId };
}
