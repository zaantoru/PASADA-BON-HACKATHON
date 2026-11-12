-- Migration: profiles and notifications tables
-- Run after 202611120001_ligtas.sql
begin;

-- User profile (extends Supabase auth.users)
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text check (length(trim(display_name)) between 1 and 80),
  preferred_city  text,
  notify_email    boolean not null default true,
  notify_sms      boolean not null default false,
  notify_push     boolean not null default true,
  phone           text check (phone ~ '^\+?[0-9]{7,15}$'),
  push_subscription jsonb,          -- Web Push subscription object
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.ligtas_touch_updated_at();

-- Notification delivery log
alter table public.treatment_visits
  add constraint treatment_visits_id_user_key unique (id, user_id);

create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  visit_id        uuid not null,
  channel         text not null check (channel in ('in_app', 'push', 'email', 'sms')),
  scheduled_for   date not null,
  sent_at         timestamptz,
  status          text not null default 'pending'
                    check (status in ('pending', 'sent', 'failed')),
  error_message   text,
  created_at      timestamptz not null default now(),
  unique (visit_id, channel),
  foreign key (visit_id, user_id)
    references public.treatment_visits(id, user_id) on delete cascade
);

create index notifications_user_idx    on public.notifications(user_id, scheduled_for desc);
create index notifications_pending_idx on public.notifications(scheduled_for, status) where status = 'pending';

-- RLS
alter table public.profiles enable row level security;
alter table public.notifications enable row level security;

revoke all on public.profiles, public.notifications from public, anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.notifications to authenticated;
grant all on public.profiles, public.notifications to service_role;

create policy profiles_owner on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy notifications_owner on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

-- Auto-create profile on new user signup
create function public.ligtas_create_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.ligtas_create_profile() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.ligtas_create_profile();

-- Include accounts registered before this migration.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

comment on table public.profiles is 'One row per auth user. Created automatically on signup.';
comment on table public.notifications is 'One delivery log per visit per channel. Sender must check status and set sent_at after success.';
comment on column public.profiles.push_subscription is 'Web Push API PushSubscription JSON object. Null means push not enabled for this user.';
comment on column public.notifications.scheduled_for is 'The date the reminder is for (visit scheduled_date - 1). Not the time the notification was sent.';

commit;
