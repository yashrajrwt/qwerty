export type AppRole = "user" | "admin";

export function parseAdminEmails(raw: string | undefined) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function configuredAdminEmails() {
  return parseAdminEmails(process.env.ADMIN_EMAILS);
}

export function emailIsAdmin(email: string, allowlist: string[]) {
  if (!allowlist.length) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}
