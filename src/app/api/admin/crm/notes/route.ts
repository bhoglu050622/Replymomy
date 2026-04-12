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
  const entityType = searchParams.get("entity_type");
  const entityId = searchParams.get("entity_id");

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entity_type and entity_id required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("admin_notes")
    .select("id, content, author_id, created_at, updated_at, users:author_id(display_name, email)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

const createSchema = z.object({
  entity_type: z.enum(["user", "application", "member_application", "mommy_application"]),
  entity_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin, userId } = result;

  try {
    const body = createSchema.parse(await req.json());

    const { data, error } = await admin
      .from("admin_notes")
      .insert({ ...body, author_id: userId })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await admin.from("admin_activity_log").insert({
      actor_id: userId,
      action: "note_created",
      entity_type: body.entity_type,
      entity_id: body.entity_id as unknown as string,
      metadata: { note_id: data.id },
    });

    return NextResponse.json({ note: data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin, userId } = result;

  try {
    const { id, content } = patchSchema.parse(await req.json());

    const { data, error } = await admin
      .from("admin_notes")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await admin.from("admin_activity_log").insert({
      actor_id: userId,
      action: "note_updated",
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      metadata: { note_id: id },
    });

    return NextResponse.json({ note: data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin, userId } = result;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Fetch note before deleting for activity log
  const { data: note } = await admin
    .from("admin_notes")
    .select("entity_type, entity_id")
    .eq("id", id)
    .single();

  const { error } = await admin.from("admin_notes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (note) {
    await admin.from("admin_activity_log").insert({
      actor_id: userId,
      action: "note_deleted",
      entity_type: note.entity_type,
      entity_id: note.entity_id,
      metadata: { note_id: id },
    });
  }

  return NextResponse.json({ success: true });
}
