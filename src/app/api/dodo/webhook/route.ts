import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  // Stub mode
  const secret = process.env.DODO_WEBHOOK_SECRET ?? "";
  if (!secret || secret === "placeholder") {
    return NextResponse.json({ received: true, mode: "stub" });
  }

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
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        void fetch(`${siteUrl}/api/concierge/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }).catch(() => {});
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
