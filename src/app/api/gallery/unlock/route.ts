import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  galleryItemId: z.string().optional(),
  ownerId: z.string(),
  unlockType: z.enum(["single_item", "full_gallery"]),
});

const TOKEN_COST = { single_item: 5, full_gallery: 20 };

export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const data = schema.parse(await req.json());
    const tokenCost = TOKEN_COST[data.unlockType];

    // Deduct tokens
    const { error: deductError } = await supabase.rpc("deduct_tokens", {
      p_user_id: user!.id,
      p_amount: tokenCost,
      p_reason: `gallery_${data.unlockType}`,
    });

    if (deductError) {
      return NextResponse.json(
        { error: "Insufficient token balance" },
        { status: 402 }
      );
    }

    // Record unlock
    await supabase.from("gallery_unlocks").insert({
      user_id: user!.id,
      owner_id: data.ownerId,
      gallery_item_id: data.galleryItemId ?? null,
      unlock_type: data.unlockType,
      token_cost: tokenCost,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
