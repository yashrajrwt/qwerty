-- App-owned security tables. Do not alter Better Auth's "user"/session/account.

create table if not exists user_profile (
  user_id text primary key references "user" ("id") on delete cascade,
  role text not null default 'user',
  status text not null default 'active',
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists auth_token (
  id text primary key,
  user_id text not null references "user" ("id") on delete cascade,
  purpose text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint auth_token_purpose_chk check (purpose in ('verify', 'reset'))
);

create index if not exists auth_token_user_id_idx on auth_token (user_id);
create index if not exists auth_token_expires_idx on auth_token (expires_at);

create table if not exists auth_attempt (
  id serial primary key,
  action text not null,
  subject_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_attempt_lookup_idx on auth_attempt (action, subject_hash, created_at);
