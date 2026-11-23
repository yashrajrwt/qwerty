import { createHash } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  consumeAuthToken,
  issueAuthToken,
  newSecretToken,
  type TokenPurpose,
} from "@/lib/auth-tokens";
import { getSql } from "@/lib/db";
import {
  emailChangeHtml,
  emailChangeNoticeHtml,
  passwordChangedHtml,
  resetEmailHtml,
  sendTransactionalEmail,
  verificationEmailHtml,
} from "@/lib/mail";
import { isPlatformViewerEmail } from "@/lib/nest-identity";
import { isEmail, NAME_MAX, passwordIssues, validateRegister } from "@/lib/password";
import { AUTH_LIMITS, AUTH_WINDOW_MS, type AuthAction } from "@/lib/rate-limit";
import { configuredAdminEmails, emailIsAdmin } from "@/lib/rbac";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeOrigin(raw: string | undefined) {
  const fallback = process.env.BETTER_AUTH_URL?.trim() || "http://localhost:8080";
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    const host = url.hostname;
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "[::1]" ||
      host.endsWith(".grok-sandbox.com") ||
      host.endsWith(".grok.me")
    ) {
      return url.origin;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

async function enforceRate(action: AuthAction, subject: string) {
  const sql = await getSql();
  const subjectHash = sha256(subject.trim().toLowerCase());
  const since = new Date(Date.now() - AUTH_WINDOW_MS).toISOString();
  await sql.query(`delete from auth_attempt where created_at < $1`, [since]);
  const rows = await sql.query<{ n: number }>(
    `select count(*)::int as n from auth_attempt where action = $1 and subject_hash = $2 and created_at > $3`,
    [action, subjectHash, since],
  );
  const count = rows[0]?.n ?? 0;
  if (count >= AUTH_LIMITS[action]) {
    throw new Error("Too many attempts. Please try again later.");
  }
  await sql.query(
    `insert into auth_attempt (action, subject_hash) values ($1, $2)`,
    [action, subjectHash],
  );
}

async function clearRate(action: AuthAction, subject: string) {
  const sql = await getSql();
  await sql.query(`delete from auth_attempt where action = $1 and subject_hash = $2`, [
    action,
    sha256(subject.trim().toLowerCase()),
  ]);
}

async function syncAdminRole(userId: string, email: string) {
  const allowlist = configuredAdminEmails();
  if (!allowlist.length) return;
  const sql = await getSql();
  const next = emailIsAdmin(email, allowlist) ? "admin" : "user";
  await sql.query(`update user_profile set role = $1, updated_at = now() where user_id = $2`, [
    next,
    userId,
  ]);
}

async function ensureProfile(userId: string) {
  const sql = await getSql();
  await sql.query(
    `insert into user_profile (user_id) values ($1) on conflict (user_id) do nothing`,
    [userId],
  );
}

async function logEvent(userId: string | null, action: string) {
  const sql = await getSql();
  await sql.query(`insert into security_event (id, user_id, action) values ($1, $2, $3)`, [
    newSecretToken(),
    userId,
    action,
  ]);
}

async function requireNestMember(userId: string) {
  const sql = await getSql();
  await ensureProfile(userId);
  const rows = await sql.query<{ email: string; name: string; status: string }>(
    `select u.email, u.name, p.status
     from "user" u
     join user_profile p on p.user_id = u.id
     where u.id = $1`,
    [userId],
  );
  const row = rows[0];
  if (!row) throw new Error("Unauthorized");
  if (isPlatformViewerEmail(row.email)) throw new Error("Unauthorized");
  if (row.status !== "active") throw new Error("This account is disabled.");
  return row;
}

async function issueToken(userId: string, purpose: TokenPurpose, ttlMs: number) {
  return issueAuthToken(await getSql(), userId, purpose, ttlMs);
}

async function consumeToken(token: string, purpose: TokenPurpose) {
  return consumeAuthToken(await getSql(), token, purpose);
}

export const prepareEmailAuth = createServerFn({ method: "POST" })
  .validator((input: { action: AuthAction; email: string }) => input)
  .handler(async ({ data }) => {
    if (!isEmail(data.email) && data.action !== "reset") {
      throw new Error("Enter a valid email address.");
    }
    await enforceRate(data.action, data.email || "anon");
    return { ok: true as const };
  });

export const startEmailVerification = createServerFn({ method: "POST" })
  .validator((input: { origin?: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const member = await requireNestMember(context.userId);
    const sql = await getSql();
    const users = await sql.query<{ name: string; email: string; emailVerified: boolean }>(
      `select name, email, "emailVerified" as "emailVerified" from "user" where id = $1`,
      [context.userId],
    );
    const user = users[0];
    if (!user) throw new Error("Unauthorized");
    if (user.emailVerified) return { ok: true as const, already: true as const };
    await enforceRate("verify", member.email);
    const token = await issueToken(context.userId, "verify", 24 * 60 * 60 * 1000);
    const origin = safeOrigin(data.origin);
    const url = `${origin}/verify-email?token=${encodeURIComponent(token)}`;
    const delivered = await sendTransactionalEmail({
      to: user.email,
      subject: "Verify your NestInvest email",
      html: verificationEmailHtml(user.name, url),
    });
    return {
      ok: true as const,
      already: false as const,
      delivered,
      previewUrl: delivered ? undefined : url,
    };
  });

export const verifyEmailToken = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const token = data.token.trim();
    if (!token) throw new Error("This verification link is invalid or has expired.");
    await enforceRate("verify", token.slice(0, 12));
    const userId = await consumeToken(token, "verify");
    if (!userId) throw new Error("This verification link is invalid or has expired.");
    const sql = await getSql();
    await sql.query(
      `update "user" set "emailVerified" = true, "updatedAt" = now() where id = $1`,
      [userId],
    );
    await logEvent(userId, "email_verified").catch(() => undefined);
    return { ok: true as const };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((input: { email: string; origin?: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    await enforceRate("forgot", isEmail(email) ? email : "invalid");
    const generic = {
      ok: true as const,
      message: "If that email is registered, we sent a reset link.",
    };
    if (!isEmail(email)) return generic;
    const sql = await getSql();
    const users = await sql.query<{ id: string; name: string; email: string }>(
      `select id, name, email from "user" where lower(email) = $1 limit 1`,
      [email],
    );
    const user = users[0];
    if (!user) return generic;
    const token = await issueToken(user.id, "reset", 30 * 60 * 1000);
    const origin = safeOrigin(data.origin);
    const url = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
    await sendTransactionalEmail({
      to: user.email,
      subject: "Reset your NestInvest password",
      html: resetEmailHtml(url),
    });
    return generic;
  });

export const completePasswordReset = createServerFn({ method: "POST" })
  .validator((input: { token: string; password: string; confirm: string }) => input)
  .handler(async ({ data }) => {
    await enforceRate("reset", data.token.slice(0, 12) || "anon");
    const issues = passwordIssues(data.password);
    if (issues.length || data.password !== data.confirm) {
      throw new Error("Choose a stronger password and confirm it.");
    }
    const userId = await consumeToken(data.token.trim(), "reset");
    if (!userId) throw new Error("This reset link is invalid or has expired.");
    const hashed = await hashPassword(data.password);
    const sql = await getSql();
    const updated = await sql.query<{ id: string }>(
      `update account set password = $1, "updatedAt" = now()
       where "userId" = $2 and "providerId" = 'credential'
       returning id`,
      [hashed, userId],
    );
    if (!updated[0]) throw new Error("This reset link is invalid or has expired.");
    await sql.query(`delete from session where "userId" = $1`, [userId]);
    const users = await sql.query<{ email: string }>(`select email from "user" where id = $1`, [
      userId,
    ]);
    if (users[0]?.email) {
      await sendTransactionalEmail({
        to: users[0].email,
        subject: "Your NestInvest password was changed",
        html: passwordChangedHtml(),
      });
    }
    await logEvent(userId, "password_reset").catch(() => undefined);
    return { ok: true as const };
  });

export const getAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const member = await requireNestMember(context.userId);
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      createdAt: string;
      status: string;
      role: string;
      last_login: string | null;
      pending_email: string | null;
    }>(
      `select u.id, u.name, u.email, u."emailVerified" as "emailVerified", u."createdAt" as "createdAt",
              p.status, p.role, p.last_login, p.pending_email
       from "user" u
       join user_profile p on p.user_id = u.id
       where u.id = $1`,
      [context.userId],
    );
    const row = rows[0];
    if (!row) throw new Error("Unauthorized");
    await syncAdminRole(context.userId, member.email);
    const refreshed = await sql.query<{ role: string }>(
      `select role from user_profile where user_id = $1`,
      [context.userId],
    );
    return { ...row, role: refreshed[0]?.role ?? row.role };
  });

export const updateAccountName = createServerFn({ method: "POST" })
  .validator((input: { name: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireNestMember(context.userId);
    const name = data.name.trim();
    if (name.length < 2 || name.length > NAME_MAX) throw new Error("Enter your name.");
    const sql = await getSql();
    await sql.query(
      `update "user" set name = $1, "updatedAt" = now() where id = $2`,
      [name, context.userId],
    );
    await sql.query(`update user_profile set updated_at = now() where user_id = $1`, [
      context.userId,
    ]);
    return { ok: true as const };
  });

export const markLogin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const member = await requireNestMember(context.userId);
    const sql = await getSql();
    await syncAdminRole(context.userId, member.email);
    await sql.query(
      `update user_profile set last_login = now(), updated_at = now() where user_id = $1`,
      [context.userId],
    );
    await clearRate("login", member.email);
    await logEvent(context.userId, "login_success").catch(() => undefined);
    return { ok: true as const };
  });

export const validateSignupInput = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; password: string; confirm: string }) => input)
  .handler(async ({ data }) => {
    const errors = validateRegister(data);
    if (errors.length) {
      throw new Error(errors.map((e) => e.issue).join(","));
    }
    await enforceRate("register", data.email);
    const sql = await getSql();
    const existing = await sql.query<{ id: string }>(
      `select id from "user" where lower(email) = $1 limit 1`,
      [data.email.trim().toLowerCase()],
    );
    if (existing[0]) throw new Error("An account with that email already exists.");
    return { ok: true as const };
  });

export const listSessions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireNestMember(context.userId);
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      createdAt: string;
      updatedAt: string;
      expiresAt: string;
      userAgent: string | null;
    }>(
      `select id, "createdAt", "updatedAt", "expiresAt", "userAgent"
       from session where "userId" = $1
       order by "updatedAt" desc`,
      [context.userId],
    );
    return rows.map((row, i) => ({
      id: row.id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      expiresAt: row.expiresAt,
      userAgent: row.userAgent,
      recent: i === 0,
    }));
  });

export const revokeSession = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireNestMember(context.userId);
    const sql = await getSql();
    await sql.query(`delete from session where id = $1 and "userId" = $2`, [
      data.id,
      context.userId,
    ]);
    await logEvent(context.userId, "session_revoked").catch(() => undefined);
    return { ok: true as const };
  });

export const revokeOtherSessions = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireNestMember(context.userId);
    const sql = await getSql();
    const latest = await sql.query<{ id: string }>(
      `select id from session where "userId" = $1 order by "updatedAt" desc limit 1`,
      [context.userId],
    );
    const keep = latest[0]?.id;
    if (keep) {
      await sql.query(`delete from session where "userId" = $1 and id <> $2`, [
        context.userId,
        keep,
      ]);
    }
    await logEvent(context.userId, "sessions_revoked_others").catch(() => undefined);
    return { ok: true as const };
  });

export const listSecurityEvents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireNestMember(context.userId);
    const sql = await getSql();
    return sql.query<{ id: string; action: string; created_at: string }>(
      `select id, action, created_at from security_event
       where user_id = $1 order by created_at desc limit 20`,
      [context.userId],
    );
  });

export const requestEmailChange = createServerFn({ method: "POST" })
  .validator((input: { email: string; origin?: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const member = await requireNestMember(context.userId);
    await enforceRate("email_change", context.userId);
    const email = data.email.trim().toLowerCase();
    if (!isEmail(email)) throw new Error("Enter a valid email address.");
    if (member.email.toLowerCase() === email) {
      throw new Error("That is already your email.");
    }
    const sql = await getSql();
    const taken = await sql.query<{ id: string }>(
      `select id from "user" where lower(email) = $1 and id <> $2 limit 1`,
      [email, context.userId],
    );
    if (taken[0]) throw new Error("Could not change email.");
    await sql.query(
      `update user_profile set pending_email = $1, pending_email_at = now(), updated_at = now() where user_id = $2`,
      [email, context.userId],
    );
    const token = await issueToken(context.userId, "email_change", 2 * 60 * 60 * 1000);
    const origin = safeOrigin(data.origin);
    const url = `${origin}/confirm-email?token=${encodeURIComponent(token)}`;
    const delivered = await sendTransactionalEmail({
      to: email,
      subject: "Confirm your new NestInvest email",
      html: emailChangeHtml(url),
    });
    await sendTransactionalEmail({
      to: member.email,
      subject: "Email change requested on NestInvest",
      html: emailChangeNoticeHtml(),
    });
    await logEvent(context.userId, "email_change_requested").catch(() => undefined);
    return {
      ok: true as const,
      delivered,
      previewUrl: delivered ? undefined : url,
    };
  });

export const confirmEmailChange = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const token = data.token.trim();
    if (!token) throw new Error("This confirmation link is invalid or has expired.");
    await enforceRate("email_change", token.slice(0, 12));
    const userId = await consumeToken(token, "email_change");
    if (!userId) throw new Error("This confirmation link is invalid or has expired.");
    const sql = await getSql();
    const rows = await sql.query<{ pending_email: string | null }>(
      `select pending_email from user_profile where user_id = $1`,
      [userId],
    );
    const next = rows[0]?.pending_email?.trim().toLowerCase();
    if (!next || !isEmail(next)) {
      throw new Error("This confirmation link is invalid or has expired.");
    }
    const taken = await sql.query<{ id: string }>(
      `select id from "user" where lower(email) = $1 and id <> $2 limit 1`,
      [next, userId],
    );
    if (taken[0]) throw new Error("Could not change email.");
    await sql.query(
      `update "user" set email = $1, "emailVerified" = true, "updatedAt" = now() where id = $2`,
      [next, userId],
    );
    await sql.query(
      `update user_profile set pending_email = null, pending_email_at = null, updated_at = now() where user_id = $1`,
      [userId],
    );
    await logEvent(userId, "email_changed").catch(() => undefined);
    return { ok: true as const };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .validator((input: { password?: string; confirm: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireNestMember(context.userId);
    await enforceRate("delete", context.userId);
    if (data.confirm.trim().toUpperCase() !== "DELETE") {
      throw new Error("Type DELETE to confirm.");
    }
    const sql = await getSql();
    const creds = await sql.query<{ password: string | null }>(
      `select password from account where "userId" = $1 and "providerId" = 'credential' limit 1`,
      [context.userId],
    );
    const hash = creds[0]?.password;
    if (hash) {
      const ok = await verifyPassword({
        hash,
        password: data.password ?? "",
      });
      if (!ok) throw new Error("Invalid email or password.");
    }
    await logEvent(context.userId, "account_deleted").catch(() => undefined);
    await sql.query(`delete from "user" where id = $1`, [context.userId]);
    return { ok: true as const };
  });
