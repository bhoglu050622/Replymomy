import type { User } from "@supabase/supabase-js";

/**
 * Strict admin enforcement is ALWAYS on.
 * Only the allowlisted email signed in via email/password may access /admin.
 * Google OAuth and any other identity provider are blocked unconditionally.
 *
 * To temporarily disable (e.g. emergency local debugging only):
 *   ADMIN_ENFORCE_EMAIL=false
 */
export function isAdminStrictEnforcement(): boolean {
  if (process.env.ADMIN_ENFORCE_EMAIL === "false") return false;
  return true;
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
