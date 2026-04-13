import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { passesStrictAdminSession } from "@/lib/admin-strict";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/supabase/require-auth";

type AdminApiError = { error: NextResponse };
type AdminApiOk = {
  admin: ReturnType<typeof createAdminClient>;
  user: User;
  userId: string;
};

export type AdminApiResult = AdminApiError | AdminApiOk;

export async function requireAdminApi(): Promise<AdminApiResult> {
  const { user, supabase, response } = await requireAuth();
  if (response) return { error: response };

  if (!passesStrictAdminSession(user)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRecord?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return {
    admin: createAdminClient(),
    user,
    userId: user.id,
  };
}
