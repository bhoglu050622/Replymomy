import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateConcierge } from "@/lib/stream/concierge";
import { isConfigured } from "@/lib/env";

export async function POST(req: Request) {
  if (!isConfigured.dodoWebhook) {
    if (process.env.NODE_ENV !== "development") {
      console.error("[dodo/webhook] DODO_WEBHOOK_SECRET is not set — all payment events are being silently dropped. Set this in production!");
    }
    return NextResponse.json({ received: true, mode: "stub" });
  }
  const secret = process.env.DODO_WEBHOOK_SECRET!;

  const rawBody = await req.text();
  const webhookId = req.headers.get("webhook-id") ?? "";
  const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = req.headers.get("webhook-signature") ?? "";

  let payload: {
    type: string;
    data: {
      payment_id?: string;
      metadata?: Record<string, string>;
      subscription_id?: string;
      customer?: { email?: string };
    };
  };

  try {
    const wh = new Webhook(secret);
    payload = wh.verify(rawBody, {
      "webhook-id": webhookId,
      "webhook-timestamp": webhookTimestamp,
      "webhook-signature": webhookSignature,
    }) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { type, data } = payload;
  const meta = data.metadata ?? {};
  const userId = meta.userId;

  switch (type) {
    case "payment.succeeded": {
      if (!userId) break;
      const tokenAmount = Number(meta.tokenAmount ?? 0);
      if (tokenAmount > 0) {
        await supabase.rpc("credit_tokens", {
          p_user_id: userId,
          p_amount: tokenAmount,
          p_reason: "token_purchase",
        });
      }
      break;
    }

    case "subscription.active": {
      if (!userId) break;
      const tier = meta.tier;
      if (tier) {
        await supabase.from("users").update({ member_tier: tier }).eq("id", userId);
      }
      // Activate concierge for Principal tier
      if (tier === "black_card") {
        void activateConcierge(userId).catch((err) => {
          console.error("[dodo/webhook] concierge activation failed", err);
        });
      }
      break;
    }

    case "subscription.renewed": {
      if (!userId) break;
      await supabase
        .from("users")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", userId);
      break;
    }

    case "subscription.cancelled":
    case "subscription.expired": {
      if (!userId) break;
      await supabase.from("users").update({ member_tier: null }).eq("id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
