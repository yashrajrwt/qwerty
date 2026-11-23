import assert from "node:assert/strict";
import { test } from "node:test";
import { emailIsAdmin, parseAdminEmails } from "./rbac.ts";

test("admin allowlist is server-parsed and case-insensitive", () => {
  const list = parseAdminEmails(" yash@gmail.com, other@nestinvest.app ");
  assert.deepEqual(list, ["yash@gmail.com", "other@nestinvest.app"]);
  assert.equal(emailIsAdmin("Yash@gmail.com", list), true);
  assert.equal(emailIsAdmin("stranger@gmail.com", list), false);
  assert.equal(emailIsAdmin("yash@gmail.com", []), false);
});
