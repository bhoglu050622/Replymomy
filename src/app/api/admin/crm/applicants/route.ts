import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

const MEMBER_COLS =
  "id, email, full_name, age, city, occupation, income_bracket, motivation, referral_source, status, reviewed_by, reviewed_at, invitation_code, ai_review, created_at, gender, pronouns";
const MOMMY_COLS =
  "id, email, full_name, age, instagram, city, motivation, status, reviewed_by, reviewed_at, invitation_code, ai_review, created_at, gender, pronouns";

export async function GET(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "member") as "member" | "mommy";
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = page * limit;

  if (type === "member") {
    let query = admin
      .from("member_applications")
      .select(MEMBER_COLS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search.trim()) {
      query = query.or(
        `email.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%`
      );
    }

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applicants: data ?? [], total: count ?? 0 });
  }

  let query = admin
    .from("mommy_applications")
    .select(MOMMY_COLS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (search.trim()) {
    query = query.or(
      `email.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%`
    );
  }

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applicants: data ?? [], total: count ?? 0 });
}
