import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <AuthShell title="Terms">
      <div className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          NestInvest is an educational market desk. Forecasts are statistical
          sketches, not advice. Do not trade solely on what you see here.
        </p>
        <p>
          You are responsible for the email and password you choose. We hash
          passwords, never store them in the clear, and never ask for them by
          email except through the official reset page.
        </p>
        <p>
          Social sign-in uses Google or X through the platform broker. Facebook
          is not available.
        </p>
      </div>
      <Link
        to="/register"
        className="mt-8 inline-block text-sm underline decoration-border-strong underline-offset-4"
      >
        Back to registration
      </Link>
    </AuthShell>
  );
}
