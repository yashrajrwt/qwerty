import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeAuthToken, hashToken, issueAuthToken, type TokenPurpose } from "./auth-tokens.ts";
import type { Sql } from "./db.ts";

function memorySql() {
  const tokens: {
    id: string;
    user_id: string;
    purpose: TokenPurpose;
    token_hash: string;
    expires_at: Date;
    used_at: Date | null;
  }[] = [];
  const sql = {
    query: async (text: string, params: unknown[] = []) => {
      if (text.startsWith("update auth_token set used_at = now() where user_id")) {
        const [userId, purpose] = params as [string, TokenPurpose];
        for (const row of tokens) {
          if (row.user_id === userId && row.purpose === purpose && !row.used_at) {
            row.used_at = new Date();
          }
        }
        return [];
      }
      if (text.startsWith("insert into auth_token")) {
        const [id, userId, purpose, tokenHash, expires] = params as [
          string,
          string,
          TokenPurpose,
          string,
          string,
        ];
        tokens.push({
          id,
          user_id: userId,
          purpose,
          token_hash: tokenHash,
          expires_at: new Date(expires),
          used_at: null,
        });
        return [];
      }
      if (text.includes("returning id, user_id")) {
        const [tokenHash, purpose] = params as [string, TokenPurpose];
        const row = tokens.find(
          (item) =>
            item.token_hash === tokenHash &&
            item.purpose === purpose &&
            !item.used_at &&
            item.expires_at > new Date(),
        );
        if (!row) return [];
        row.used_at = new Date();
        return [{ id: row.id, user_id: row.user_id }];
      }
      return [];
    },
  };
  return { sql: sql as unknown as Sql, tokens };
}

test("issued tokens are hashed and single-use", async () => {
  const { sql } = memorySql();
  const token = await issueAuthToken(sql, "user-a", "verify", 60_000);
  assert.notEqual(token, hashToken(token));
  assert.equal(await consumeAuthToken(sql, token, "verify"), "user-a");
  assert.equal(await consumeAuthToken(sql, token, "verify"), null);
  assert.equal(await consumeAuthToken(sql, "forged", "verify"), null);
  assert.equal(await consumeAuthToken(sql, token, "reset"), null);
});

test("expired tokens cannot be consumed", async () => {
  const { sql, tokens } = memorySql();
  const token = await issueAuthToken(sql, "user-a", "reset", 60_000);
  tokens[0]!.expires_at = new Date(Date.now() - 1000);
  assert.equal(await consumeAuthToken(sql, token, "reset"), null);
});

test("injection strings stay data, not SQL", () => {
  const payload = "x'; drop table user_profile; --";
  assert.equal(hashToken(payload).length, 64);
  assert.doesNotMatch(hashToken(payload), /drop table/i);
});
