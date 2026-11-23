import assert from "node:assert/strict";
import { test } from "node:test";
import {
  friendlyAuthError,
  isEmail,
  passwordIssues,
  passwordScore,
  validateRegister,
} from "./password.ts";

test("rejects invalid emails", () => {
  assert.equal(isEmail(""), false);
  assert.equal(isEmail("not-an-email"), false);
  assert.equal(isEmail("ok@nestinvest.app"), true);
});

test("enforces password rules", () => {
  assert.deepEqual(passwordIssues("short"), ["length", "upper", "number", "special"]);
  assert.equal(passwordIssues("GoodPass1!").length, 0);
});

test("rejects oversized passwords", () => {
  assert.ok(passwordIssues(`Aa1!${"x".repeat(200)}`).includes("too_long"));
});

test("password score tracks strength", () => {
  assert.equal(passwordScore("a"), 1);
  assert.equal(passwordScore("GoodPass1!"), 5);
});

test("registration validation", () => {
  const weak = validateRegister({
    name: "Y",
    email: "bad",
    password: "weak",
    confirm: "other",
  });
  assert.ok(weak.some((e) => e.field === "name"));
  assert.ok(weak.some((e) => e.field === "email"));
  assert.ok(weak.some((e) => e.field === "password"));
  assert.ok(weak.some((e) => e.field === "confirm"));
  assert.equal(
    validateRegister({
      name: "Yash Sharma",
      email: "yash@example.com",
      password: "GoodPass1!",
      confirm: "GoodPass1!",
    }).length,
    0,
  );
});

test("hides implementation details in errors", () => {
  assert.equal(friendlyAuthError("duplicate key on user"), "An account with that email already exists.");
  assert.equal(friendlyAuthError("invalid credentials"), "Invalid email or password.");
  assert.equal(friendlyAuthError("This account is disabled."), "This account is disabled.");
  assert.equal(friendlyAuthError("Forbidden"), "You do not have access to that.");
  assert.equal(
    friendlyAuthError("relation user does not exist"),
    "Something went wrong. Please try again.",
  );
});
