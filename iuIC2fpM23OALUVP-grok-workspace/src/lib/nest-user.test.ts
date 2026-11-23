import assert from "node:assert/strict";
import { test } from "node:test";
import { isNestMember, isPlatformViewerEmail } from "./nest-identity.ts";

test("flags Grok viewer synthetic emails", () => {
  assert.equal(
    isPlatformViewerEmail("5469f8b4-d830-4bc1-b172-6b91ac9984cb@viewer.grok.invalid"),
    true,
  );
  assert.equal(isPlatformViewerEmail("yash@gmail.com"), false);
  assert.equal(isPlatformViewerEmail(null), false);
});

test("NestInvest members are not platform viewers", () => {
  assert.equal(
    isNestMember({
      id: "1",
      displayName: "Yash",
      primaryEmail: "yash@gmail.com",
      profileImageUrl: null,
      isDevFallback: false,
    }),
    true,
  );
  assert.equal(
    isNestMember({
      id: "gate",
      displayName: "Grok user",
      primaryEmail: "abc@viewer.grok.invalid",
      profileImageUrl: null,
      isDevFallback: false,
    }),
    false,
  );
});
