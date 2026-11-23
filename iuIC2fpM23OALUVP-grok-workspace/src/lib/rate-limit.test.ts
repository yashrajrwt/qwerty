import assert from "node:assert/strict";
import { test } from "node:test";
import { AUTH_LIMITS, rateLimited } from "./rate-limit.ts";

test("rate limiter trips at the configured ceiling", () => {
  assert.equal(rateLimited(AUTH_LIMITS.login - 1, "login"), false);
  assert.equal(rateLimited(AUTH_LIMITS.login, "login"), true);
  assert.equal(rateLimited(AUTH_LIMITS.forgot, "forgot"), true);
});
