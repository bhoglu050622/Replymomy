import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const createSchema = z.object({
  url: z.string().url(),
  cloudinary_public_id: z.string().optional(),
  is_premium: z.boolean().default(false),
  token_cost: z.number().int().min(1).max(100).default(10),
  type: z.enum(["photo", "video"]).default("photo"),
});

export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, url, is_premium, token_cost, type, created_at")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const body = createSchema.parse(await req.json());

    const { data, error } = await supabase
      .from("gallery_items")
      .insert({
        owner_id: user!.id,
        url: body.url,
        cloudinary_public_id: body.cloudinary_public_id ?? null,
        is_premium: body.is_premium,
        token_cost: body.token_cost,
        type: body.type,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("id");
  if (!itemId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("gallery_items")
    .delete()
    .eq("id", itemId)
    .eq("owner_id", user!.id);

  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ success: true });
}
