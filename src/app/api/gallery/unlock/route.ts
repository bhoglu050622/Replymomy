import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { getPostHogClient } from "@/lib/posthog-server";

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

    // Single atomic DB function — deducts tokens AND records unlock in one transaction.
    const { data: result, error } = await supabase.rpc("unlock_gallery", {
      p_user_id: user!.id,
      p_owner_id: data.ownerId,
      p_unlock_type: data.unlockType,
      p_token_cost: tokenCost,
      p_item_id: data.galleryItemId ?? null,
    });

    if (error) {
      return NextResponse.json({ error: "Unlock failed" }, { status: 500 });
    }

    const res = result as { success: boolean; error?: string };
    if (!res.success) {
      if (res.error === "insufficient_balance") {
        return NextResponse.json({ error: "Insufficient token balance" }, { status: 402 });
      }
      if (res.error === "already_unlocked") {
        return NextResponse.json({ error: "Already unlocked" }, { status: 409 });
      }
      return NextResponse.json({ error: "Unlock failed" }, { status: 400 });
    }

    getPostHogClient().capture({
      distinctId: user!.id,
      event: "gallery_unlocked",
      properties: {
        unlock_type: data.unlockType,
        token_cost: tokenCost,
        owner_id: data.ownerId,
      },
    });

    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
