import type { User } from "@supabase/supabase-js";

/**
 * Strict admin (allowlisted email + email/password identity only):
 * - Explicit opt-in: ADMIN_ENFORCE_EMAIL=true
 * - Explicit opt-out: ADMIN_ENFORCE_EMAIL=false (overrides everything below)
 * - Production (e.g. Hostinger): NODE_ENV=production enables strict unless opted out above
 */
export function isAdminStrictEnforcement(): boolean {
  if (process.env.ADMIN_ENFORCE_EMAIL === "false") return false;
  if (process.env.ADMIN_ENFORCE_EMAIL === "true") return true;
  return process.env.NODE_ENV === "production";
}

export function getAdminAllowedEmail(): string {
  return (process.env.ADMIN_ALLOWED_EMAIL || "admin@replymommy.com")
    .trim()
    .toLowerCase();
}

function hasEmailPasswordIdentity(user: User): boolean {
  if (user.identities?.length) {
    return user.identities.some((i) => i.provider === "email");
  }
  const meta = user.app_metadata;
  if (meta?.provider === "email") return true;
  const providers = meta?.providers;
  return Array.isArray(providers) && providers.includes("email");
}

/**
 * When strict enforcement is on (production), only the allowlisted email
 * with an email/password identity may act as admin. Blocks Google-only (or
 * other OAuth-only) sessions even if `users.role` were `admin`.
 */
export function passesStrictAdminSession(user: User | null | undefined): boolean {
  if (!user?.email) return false;
  if (!isAdminStrictEnforcement()) return true;

  if (user.email.trim().toLowerCase() !== getAdminAllowedEmail()) {
    return false;
  }

  return hasEmailPasswordIdentity(user);
}
