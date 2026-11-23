alter table user_profile drop constraint if exists user_profile_role_chk;
alter table user_profile add constraint user_profile_role_chk
  check (role in ('user', 'admin'));

alter table user_profile drop constraint if exists user_profile_status_chk;
alter table user_profile add constraint user_profile_status_chk
  check (status in ('active', 'disabled'));
