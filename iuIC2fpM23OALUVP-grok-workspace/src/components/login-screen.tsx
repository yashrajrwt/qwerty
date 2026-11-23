import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth-shell";
import { PasswordField } from "@/components/password-field";
import { SocialButtons } from "@/components/social-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markLogin, prepareEmailAuth } from "@/lib/account";
import { authClient, authEnabled, signOut } from "@/lib/auth/client";
import { rememberNestSession } from "@/lib/nest-user";
import { friendlyAuthError, isEmail } from "@/lib/password";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isEmail(email) || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      await prepareEmailAuth({ data: { action: "login", email } });
      const { data, error: authError } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: remember,
      });
      if (authError) {
        setError(friendlyAuthError(authError.message));
        return;
      }
      rememberNestSession(data?.token);
      await authClient.getSession().catch(() => undefined);
      try {
        await markLogin();
      } catch (err) {
        await signOut("/").catch(() => undefined);
        setError(friendlyAuthError(err instanceof Error ? err.message : undefined));
        return;
      }
      window.location.href = "/";
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : undefined));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      kicker="Sign in with the email you registered. Google and X work too."
    >
      {authEnabled ? (
        <>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-muted">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
              />
            </div>
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="inline-flex items-center gap-2 text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 accent-[var(--color-accent)]"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-muted underline decoration-border-strong underline-offset-4 hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            {error ? <p className="text-sm text-loss">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="my-6 text-center text-xs tracking-[0.18em] text-subtle uppercase">
            or
          </p>
          <SocialButtons callbackURL="/" />
          <p className="mt-6 text-sm text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-foreground underline decoration-border-strong underline-offset-4"
            >
              Create account
            </Link>
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">Sign-in is disabled.</p>
      )}
    </AuthShell>
  );
}
