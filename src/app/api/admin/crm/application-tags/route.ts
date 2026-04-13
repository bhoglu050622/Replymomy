import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

export async function GET(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const application_type = searchParams.get("application_type");
  const application_id = searchParams.get("application_id");
  if (!application_type || !application_id) {
    return NextResponse.json({ error: "application_type and application_id required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("application_tags")
    .select("id, tag, created_at, added_by")
    .eq("application_type", application_type)
    .eq("application_id", application_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tags: data ?? [] });
}

const postSchema = z.object({
  application_type: z.enum(["member", "mommy"]),
  application_id: z.string().uuid(),
  tag: z.string().min(1).max(50).trim(),
});

export async function POST(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin, userId } = result;

  try {
    const body = postSchema.parse(await req.json());
    const normalizedTag = body.tag.toLowerCase().replace(/\s+/g, "-");

    const { data, error } = await admin
      .from("application_tags")
      .insert({
        application_type: body.application_type,
        application_id: body.application_id,
        tag: normalizedTag,
        added_by: userId,
      })
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
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const application_type = searchParams.get("application_type");
  const application_id = searchParams.get("application_id");
  const tag = searchParams.get("tag");
  if (!application_type || !application_id || !tag) {
    return NextResponse.json(
      { error: "application_type, application_id and tag required" },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from("application_tags")
    .delete()
    .eq("application_type", application_type)
    .eq("application_id", application_id)
    .eq("tag", tag);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
