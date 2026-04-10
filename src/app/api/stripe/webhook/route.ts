import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Central Stripe webhook handler — verifies signature, dispatches on event type.
export async function POST(req: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
  ) {
    return NextResponse.json({ received: true, mode: "stub" });
  }

  const { stripe } = await import("@/lib/stripe/server");
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) break;

      if (session.mode === "subscription" && session.customer) {
        // Ensure customer ID is stored
        await supabase
          .from("users")
          .update({ stripe_customer_id: session.customer as string })
          .eq("id", userId);
      } else if (
        session.mode === "payment" &&
        session.metadata?.tokenAmount
      ) {
        // Credit token purchase
        const amount = Number(session.metadata.tokenAmount);
        await supabase.rpc("credit_tokens", {
          p_user_id: userId,
          p_amount: amount,
          p_reason: "token_purchase",
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      if (customerId) {
        await supabase
          .from("users")
          .update({ last_active_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      if (customerId) {
        // Mark subscription as past_due — could add a status column
        console.warn("[stripe webhook] payment failed for customer:", customerId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customerId = sub.customer as string;
      if (customerId) {
        await supabase
          .from("users")
          .update({ member_tier: null })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const { giftId, senderId, recipientId, message } = pi.metadata ?? {};
      if (giftId && senderId && recipientId) {
        await supabase.from("gifts_sent").insert({
          sender_id: senderId,
          recipient_id: recipientId,
          gift_id: giftId,
          message: message ?? null,
          paid_with_tokens: false,
          amount_cents: pi.amount,
          stripe_payment_intent_id: pi.id,
        });
        // Record mommy earnings
        const platformFee = Math.round(pi.amount * 0.2);
        await supabase.from("mommy_earnings").insert({
          mommy_id: recipientId,
          source_type: "gift",
          gross_amount_cents: pi.amount,
          platform_fee_cents: platformFee,
          net_amount_cents: pi.amount - platformFee,
          gift_id: giftId,
          payout_status: "pending",
        });
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object;
      const supabaseUserId = account.metadata?.supabase_user_id;
      if (supabaseUserId && account.charges_enabled) {
        await supabase
          .from("users")
          .update({ stripe_connect_account_id: account.id })
          .eq("id", supabaseUserId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
