import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            width={48}
            height={40}
            className="h-11 w-auto object-contain"
          />
          <span className="font-display text-3xl leading-none tracking-tight">
            <span className="italic">Nest</span>Invest
          </span>
        </Link>
        <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">
          Hatch · hold · grow
        </p>
        <h1 className="font-display mt-3 text-3xl tracking-tight">{title}</h1>
        {kicker ? <p className="mt-2 text-sm leading-relaxed text-muted">{kicker}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
