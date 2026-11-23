-- Extra account-security fields. Better Auth tables stay untouched.

alter table user_profile add column if not exists pending_email text;
alter table user_profile add column if not exists pending_email_at timestamptz;

alter table auth_token drop constraint if exists auth_token_purpose_chk;
alter table auth_token add constraint auth_token_purpose_chk
  check (purpose in ('verify', 'reset', 'email_change'));

create table if not exists security_event (
  id text primary key,
  user_id text references "user" ("id") on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists security_event_user_idx
  on security_event (user_id, created_at desc);
