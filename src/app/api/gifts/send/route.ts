import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  giftId: z.string(),
  recipientId: z.string(),
  message: z.string().max(280).optional(),
  useTokens: z.boolean().default(false),
});

export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const data = schema.parse(await req.json());

    // Look up gift details
    const { data: gift, error: giftError } = await supabase
      .from("gift_catalog")
      .select("*")
      .eq("id", data.giftId)
      .single();

    if (giftError || !gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    if (data.useTokens && gift.token_cost !== null) {
      // Deduct tokens via RPC
      const { error: deductError } = await supabase.rpc("deduct_tokens", {
        p_user_id: user!.id,
        p_amount: gift.token_cost,
      });

      if (deductError) {
        return NextResponse.json(
          { error: "Insufficient token balance" },
          { status: 402 }
        );
      }

      // Record the gift
      await supabase.from("gifts_sent").insert({
        sender_id: user!.id,
        recipient_id: data.recipientId,
        gift_catalog_id: data.giftId,
        message: data.message ?? null,
        paid_with_tokens: true,
        amount_cents: gift.price_cents,
      });

      return NextResponse.json({ success: true, paidWith: "tokens" });
    }

    // For IRL gifts or cash payment, route to Stripe
    return NextResponse.json({
      success: false,
      requiresPayment: true,
      giftId: data.giftId,
      recipientId: data.recipientId,
      message: data.message,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
