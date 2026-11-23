import { Link } from "@tanstack/react-router";
import { COLLABORATIVE, TEAM } from "@/lib/team";

export function ContributionsPanel() {
  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="font-display text-lg tracking-tight">Contributions</p>
        <p className="mt-1 max-w-prose text-sm text-muted">
          The work each developer completed on the original NestInvest console, plus the tasks all three finished together.
        </p>
      </div>
      {TEAM.map((member) => (
        <section key={member.slug} className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <img src={member.photo} alt="" className="size-14 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl tracking-tight">{member.name}</h3>
              <p className="text-sm text-muted">{member.role}</p>
            </div>
            <Link
              to="/team/$slug"
              params={{ slug: member.slug }}
              className="inline-flex h-10 items-center rounded-[var(--radius-sm)] border border-border px-3 text-sm text-muted"
            >
              Full page
            </Link>
          </div>
          <ul className="grid gap-3 lg:grid-cols-2">
            {member.contributions.map((item) => (
              <li key={item.title} className="nest-card rounded-[var(--radius-lg)] p-4">
                <h4 className="text-sm">{item.title}</h4>
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
      ))}
      <section className="space-y-3">
        <div>
          <h3 className="font-display text-xl tracking-tight">Collaborative team contributions</h3>
          <p className="mt-1 text-sm text-muted">
            Completed by Yash Sharma, Yashraj Rawat, and Vivek Rana together.
          </p>
        </div>
        <ul className="grid gap-3 lg:grid-cols-2">
          {COLLABORATIVE.map((item) => (
            <li key={item.title} className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
              <h4 className="text-sm">{item.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
