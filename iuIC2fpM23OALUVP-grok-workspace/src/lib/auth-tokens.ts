import { createHash, randomBytes } from "node:crypto";
import type { Sql } from "@/lib/db";

export type TokenPurpose = "verify" | "reset" | "email_change";

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function newSecretToken() {
  return randomBytes(32).toString("base64url");
}

export async function issueAuthToken(
  sql: Sql,
  userId: string,
  purpose: TokenPurpose,
  ttlMs: number,
) {
  const token = newSecretToken();
  const id = newSecretToken();
  await sql.query(
    `update auth_token set used_at = now() where user_id = $1 and purpose = $2 and used_at is null`,
    [userId, purpose],
  );
  await sql.query(
    `insert into auth_token (id, user_id, purpose, token_hash, expires_at) values ($1, $2, $3, $4, $5)`,
    [id, userId, purpose, hashToken(token), new Date(Date.now() + ttlMs).toISOString()],
  );
  return token;
}

/** Single-use consume. The UPDATE is the lock — two racers cannot both win. */
export async function consumeAuthToken(sql: Sql, token: string, purpose: TokenPurpose) {
  const rows = await sql.query<{ id: string; user_id: string }>(
    `update auth_token
     set used_at = now()
     where token_hash = $1 and purpose = $2 and used_at is null and expires_at > now()
     returning id, user_id`,
    [hashToken(token), purpose],
  );
  return rows[0]?.user_id ?? null;
}
