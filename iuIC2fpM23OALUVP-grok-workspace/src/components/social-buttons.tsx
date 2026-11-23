import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export function SocialButtons({ callbackURL = "/" }: { callbackURL?: string }) {
  if (!authEnabled) return null;
  return (
    <div className="space-y-3">
      {GROK_PROVIDERS.map((p) => (
        <button
          key={p.providerId}
          type="button"
          onClick={() => signIn(p.providerId, { callbackURL })}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-sm)] border border-border bg-elevated text-sm hover:border-border-strong"
        >
          {p.idp === "google" ? <GoogleMark /> : <XMark />}
          Continue with {p.label}
        </button>
      ))}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42z"
        opacity="0.95"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.97-.9 6.63-2.35l-3.23-2.5c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.58A10 10 0 0 0 12 22z"
        opacity="0.75"
      />
      <path
        fill="currentColor"
        d="M6.39 13.98A6.01 6.01 0 0 1 6.08 12c0-.69.12-1.35.31-1.98V7.44H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.56l3.33-2.58z"
        opacity="0.75"
      />
      <path
        fill="currentColor"
        d="M12 5.94c1.47 0 2.78.5 3.82 1.49l2.86-2.86C16.96 2.97 14.7 2 12 2A10 10 0 0 0 3.06 7.44l3.33 2.58C7.18 7.7 9.39 5.94 12 5.94z"
        opacity="0.9"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-6.77 7.74L23 22h-6.4l-5.02-6.56L6 22H2.98l7.24-8.28L1 2h6.56l4.54 6.02L18.9 2Zm-1.12 18h1.78L6.33 3.89H4.42L17.78 20Z" />
    </svg>
  );
}
