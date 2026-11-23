import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COLLABORATIVE, TEAM, memberBySlug } from "@/lib/team";

export const Route = createFileRoute("/team/$slug")({
  loader: ({ params }) => {
    const member = memberBySlug(params.slug);
    if (!member) throw notFound();
    return member;
  },
  component: MemberPage,
  notFoundComponent: MissingMember,
});

function MemberPage() {
  const member = Route.useLoaderData();
  const others = TEAM.filter((person) => person.slug !== member.slug);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          hash="contributions"
          className="text-sm text-muted underline decoration-border-strong underline-offset-4"
        >
          Back to team
        </Link>
        <header className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <img src={member.photo} alt="" className="size-28 rounded-full object-cover sm:size-36" />
          <div>
            <h1 className="font-display text-4xl tracking-tight">{member.name}</h1>
            <p className="mt-1 text-sm text-muted">{member.role}</p>
            <p className="mt-3 max-w-prose text-sm leading-relaxed">{member.intro}</p>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-tight">My contributions to NestInvest</h2>
          <p className="mt-1 text-sm text-muted">Individual contributions</p>
          <ul className="mt-4 space-y-3">
            {member.contributions.map((item) => (
              <li key={item.title} className="nest-card rounded-[var(--radius-lg)] p-4">
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.tech.map((tag) => (
                    <li key={tag} className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-subtle">
                      {tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-tight">Collaborative team contributions</h2>
          <p className="mt-1 text-sm text-muted">Completed by Yash Sharma, Yashraj Rawat, and Vivek Rana together. Not one person’s work alone.</p>
          <ul className="mt-4 space-y-3">
            {COLLABORATIVE.map((item) => (
              <li key={item.title} className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.tech.map((tag) => (
                    <li key={tag} className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-subtle">
                      {tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-2">
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-foreground"
          >
            Return to NestInvest
          </Link>
          {others.map((person) => (
            <Link
              key={person.slug}
              to="/team/$slug"
              params={{ slug: person.slug }}
              className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-border px-4 text-sm text-muted"
            >
              {person.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MissingMember() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-sm">
      <p>That team page does not exist.</p>
      <Link to="/" hash="contributions" className="mt-4 inline-block underline">
        Back to team
      </Link>
    </div>
  );
}
