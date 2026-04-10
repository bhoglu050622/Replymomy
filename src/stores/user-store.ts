import { create } from "zustand";

interface UserStore {
  tokenBalance: number | null;
  memberTier: string | null;
  role: string | null;
  setUser: (balance: number, tier: string | null, role: string | null) => void;
  decrementTokens: (amount: number) => void;
  incrementTokens: (amount: number) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  tokenBalance: null,
  memberTier: null,
  role: null,
  setUser: (balance, tier, role) =>
    set({ tokenBalance: balance, memberTier: tier, role }),
  decrementTokens: (amount) =>
    set((s) => ({ tokenBalance: Math.max(0, (s.tokenBalance ?? 0) - amount) })),
  incrementTokens: (amount) =>
    set((s) => ({ tokenBalance: (s.tokenBalance ?? 0) + amount })),
}));
