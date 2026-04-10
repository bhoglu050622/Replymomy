"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";

export function UserStoreHydrator() {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then(({ balance, tier, role }) => setUser(balance, tier, role))
      .catch(() => {});
  }, [setUser]);

  return null;
}
