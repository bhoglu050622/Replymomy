/** True when NEXT_PUBLIC_POSTHOG_KEY should be passed to posthog.init (not a template value). */
export function isUsablePostHogKey(key: string | undefined): boolean {
  if (!key?.trim()) return false;
  const k = key.trim();
  if (k.startsWith("phc_xxx")) return false;
  if (k === "phc_placeholder" || /placeholder/i.test(k)) return false;
  if (k === "phc_xxxxxxxxxxxxxxxxxxxx") return false;
  return true;
}
