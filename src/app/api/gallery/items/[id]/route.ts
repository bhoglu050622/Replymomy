import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const patchSchema = z.object({
  is_premium: z.boolean(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;

  try {
    const body = patchSchema.parse(await req.json());

    const { data, error } = await supabase
      .from("gallery_items")
      .update({ is_premium: body.is_premium })
      .eq("id", id)
      .eq("owner_id", user!.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
