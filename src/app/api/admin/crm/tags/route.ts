import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { user, supabase, response } = await requireAuth();
  if (response) return { error: response };
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (userRecord?.role !== "admin")
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { admin: createAdminClient(), userId: user!.id };
}

export async function GET(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, error } = await admin
    .from("user_tags")
    .select("id, tag, created_at, added_by")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tags: data ?? [] });
}

const postSchema = z.object({
  user_id: z.string().uuid(),
  tag: z.string().min(1).max(50).trim(),
});

export async function POST(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin, userId } = result;

  try {
    const body = postSchema.parse(await req.json());
    const normalizedTag = body.tag.toLowerCase().replace(/\s+/g, "-");

    const { data, error } = await admin
      .from("user_tags")
      .insert({ user_id: body.user_id, tag: normalizedTag, added_by: userId })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tag: data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const tag = searchParams.get("tag");
  if (!userId || !tag) return NextResponse.json({ error: "user_id and tag required" }, { status: 400 });

  const { error } = await admin
    .from("user_tags")
    .delete()
    .eq("user_id", userId)
    .eq("tag", tag);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
