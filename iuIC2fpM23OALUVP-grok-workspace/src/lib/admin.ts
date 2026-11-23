import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { isPlatformViewerEmail } from "@/lib/nest-identity";
import { configuredAdminEmails, emailIsAdmin, ForbiddenError } from "@/lib/rbac";

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql.query<{ email: string; role: string; status: string }>(
    `select u.email, p.role, p.status
     from "user" u
     join user_profile p on p.user_id = u.id
     where u.id = $1`,
    [userId],
  );
  const row = rows[0];
  if (!row || row.status !== "active") throw new ForbiddenError();
  if (isPlatformViewerEmail(row.email)) throw new ForbiddenError();
  if (emailIsAdmin(row.email, configuredAdminEmails())) {
    if (row.role !== "admin") {
      await sql.query(`update user_profile set role = 'admin', updated_at = now() where user_id = $1`, [
        userId,
      ]);
    }
    return row;
  }
  if (row.role !== "admin") throw new ForbiddenError();
  return row;
}

export const getAdminDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const members = await sql.query<{
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      role: string;
      status: string;
      createdAt: string;
      last_login: string | null;
    }>(
      `select u.id, u.name, u.email, u."emailVerified" as "emailVerified",
              p.role, p.status, u."createdAt" as "createdAt", p.last_login
       from "user" u
       join user_profile p on p.user_id = u.id
       order by u."createdAt" desc
       limit 100`,
    );
    return {
      members: members.filter((row) => !isPlatformViewerEmail(row.email)),
    };
  });

export const setMemberStatus = createServerFn({ method: "POST" })
  .validator((input: { userId: string; status: "active" | "disabled" }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (data.userId === context.userId) {
      throw new Error("You cannot disable your own account.");
    }
    const sql = await getSql();
    const target = await sql.query<{ email: string }>(
      `select email from "user" where id = $1`,
      [data.userId],
    );
    if (target[0] && emailIsAdmin(target[0].email, configuredAdminEmails())) {
      throw new Error("Allowlisted admins cannot be disabled here.");
    }
    const updated = await sql.query<{ id: string }>(
      `update user_profile set status = $1, updated_at = now()
       where user_id = $2
       returning user_id as id`,
      [data.status, data.userId],
    );
    if (!updated[0]) throw new Error("Member not found.");
    if (data.status === "disabled") {
      await sql.query(`delete from session where "userId" = $1`, [data.userId]);
    }
    return { ok: true as const };
  });
