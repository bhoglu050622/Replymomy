import { createClient } from "@/lib/supabase/server";
import { SubscriptionClient } from "./subscription-client";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: userRecord } = await supabase
    .from("users")
    .select("member_tier, profiles_browsed_count")
    .eq("id", authUser!.id)
    .single();

  return (
    <SubscriptionClient
      currentTier={userRecord?.member_tier ?? null}
      browsedCount={userRecord?.profiles_browsed_count ?? 0}
    />
  );
}
