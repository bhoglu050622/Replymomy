import { createClient } from "@/lib/supabase/server";
import { MatchesClient } from "./matches-client";

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [matchesRes, userRes] = await Promise.all([
    supabase
      .from("matches")
      .select("id, status, created_at, mommy_id, member_id, profiles!matches_mommy_id_fkey(display_name)")
      .or(`member_id.eq.${authUser!.id},mommy_id.eq.${authUser!.id}`)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("users")
      .select("role")
      .eq("id", authUser!.id)
      .single(),
  ]);

  type MatchRow = {
    id: string;
    status: string;
    created_at: string;
    mommy_id: string;
    member_id: string;
    profiles: { display_name: string } | null;
  };

  const matches = (matchesRes.data ?? []) as unknown as MatchRow[];
  const role = userRes.data?.role ?? "member";

  return (
    <MatchesClient
      matches={matches}
      role={role}
      userId={authUser!.id}
    />
  );
}
