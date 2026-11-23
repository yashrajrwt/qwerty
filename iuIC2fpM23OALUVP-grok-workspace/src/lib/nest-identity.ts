import type { AppUser } from "@/lib/auth/use-current-user";

/** Synthetic email minted by src/lib/auth/gate-identity.server.ts for Grok viewers. */
export const VIEWER_EMAIL_DOMAIN = "viewer.grok.invalid";

/** Must match BEARER_KEY in src/lib/auth/client.ts (that setter is not exported). */
const BEARER_KEY = "grok-auth.bearer-token";

export function isPlatformViewerEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase().endsWith(`@${VIEWER_EMAIL_DOMAIN}`);
}

export function isNestMember(user: AppUser | null) {
  return Boolean(user && !isPlatformViewerEmail(user.primaryEmail));
}

/**
 * After email sign-in/sign-up, persist the Better Auth session token the same
 * way the Google/X popup does. The gate plugin skips overwrite when
 * `Authorization: Bearer` is present, so a real NestInvest user is not replaced
 * by uuid@viewer.grok.invalid.
 */
export function rememberNestSession(token: string | null | undefined) {
  if (!token || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BEARER_KEY, token);
  } catch {
    /* ignore */
  }
}
