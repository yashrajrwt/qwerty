# NestInvest authentication

## Architecture

```
Browser
  → TanStack routes (login / register / desk / account / admin)
  → Better Auth `/api/auth/*`  (email+password, Google, X)
  → App server functions (`src/lib/account.ts`, `src/lib/admin.ts`)
  → Postgres (Neon in production, PGLite in preview)
```

This app does **not** use JWTs or refresh tokens. Sessions are Better Auth
server sessions in **HttpOnly `__Host-` cookies** (SameSite=Lax, Secure).
The live preview iframe also stores a short-lived **bearer token** in
`sessionStorage` so partitioned cookies still work. That token is the session
id, not a password.

## Preview trust boundary

Grok may mint `uuid@viewer.grok.invalid` and a session token. NestInvest
**does not** treat that as a member. Product RPCs call `requireNestMember`,
which rejects viewer emails and disabled accounts. Admin RPCs also reject
viewers. The preview bearer in `sessionStorage` is the Better Auth session
id (same as the HttpOnly cookie value), used only because the preview iframe
partitions cookies. Stealing it is session theft of *that* session — it cannot
mint another user's id or set `role`.


## Flows

| Flow | What happens |
|---|---|
| Sign up | Frontend + server validate → Better Auth hashes password → `user` + `account` rows → hashed verify token emailed |
| Verify | `/verify-email?token=` consumes a single-use SHA-256 stored token (24h) |
| Login | Rate-limited → Better Auth verifies hash → session cookie (+ preview bearer) |
| Logout | `authClient.signOut()` deletes the session |
| Forgot password | Generic response; 30-minute single-use reset token; sessions deleted on reset |
| Change password | Current password required; other sessions revoked |
| Admin | Role is `user_profile.role` from the DB. Promotion only if `ADMIN_EMAILS` matches. Users cannot set `role` |

## Protected APIs

All per-user server functions use `authMiddleware` and query **only**
`context.userId`. Admin functions call `requireAdmin` against the database,
not a client flag.

## Environment (injected — never commit secrets)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres. Unset → preview PGLite |
| `BETTER_AUTH_SECRET` | Session signing |
| `BETTER_AUTH_URL` | Public origin |
| `EMAIL_API_KEY` or `RESEND_API_KEY` | Transactional mail |
| `EMAIL_FROM` | From address |
| `ADMIN_EMAILS` | Comma-separated emails granted `admin` |
| `VITE_AUTH_ENABLED` | Must stay on for real auth |

If mail keys are missing, verify/reset still work in preview via a one-time
link shown to the **signed-in** user. That is not production mail.

## Limitations

- 2FA / passkeys are not wired (Better Auth core is frozen).
- Gate viewer rows may still exist in Better Auth; the product ignores them.
- Preview bearer lives in sessionStorage by platform design.
