-- PASADA: LIGTAS | Run once in a new Supabase project's SQL Editor.
-- Existing names cause the transaction to fail; this never drops existing tables.
begin;

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 200),
  facility_type text not null check (facility_type in ('hospital', 'abtc', 'health_center')),
  ownership text not null default 'unknown' check (ownership in ('public', 'private', 'ngo', 'unknown')),
  city text not null check (length(trim(city)) > 0),
  barangay text,
  address text not null check (length(trim(address)) > 0),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  location_confirmed boolean not null default false,
  phone text,
  hours_notes text,
  cost_status text not null default 'unknown' check (cost_status in ('unknown', 'free_with_conditions', 'paid')),
  cost_notes text,
  assistance_notes text,
  service_notes text,
  source_url text check (source_url ~ '^https?://'),
  source_checked_on date,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'source_listed', 'confirmed')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null)),
  check (not location_confirmed or latitude is not null),
  check (not is_published or (source_url is not null and source_checked_on is not null)),
  check (cost_status = 'unknown' or nullif(trim(cost_notes), '') is not null)
);

-- Curated approximate area centers, never patient locations or confirmed rabies zones.
create table public.hotspot_areas (
  id uuid primary key default gen_random_uuid(),
  city text not null check (length(trim(city)) > 0),
  barangay text not null check (length(trim(barangay)) > 0),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  radius_m integer not null default 500 check (radius_m between 100 and 5000),
  source_url text not null check (source_url ~ '^https?://'),
  source_checked_on date not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city, barangay)
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  incident_date date not null,
  city text not null check (length(trim(city)) > 0),
  barangay text,
  location_notes text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  animal_type text not null check (animal_type in ('dog', 'cat', 'other', 'unknown')),
  animal_notes text,
  body_site text,
  clinician_recorded_category text check (clinician_recorded_category in ('I', 'II', 'III')),
  medical_notes text,
  hotspot_area_id uuid references public.hotspot_areas(id) on delete restrict,
  share_for_map boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check ((latitude is null) = (longitude is null)),
  check (not share_for_map or hotspot_area_id is not null)
);

create table public.treatment_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  incident_id uuid not null,
  storage_path text unique,
  raw_ocr_text text,
  corrected_text text,
  ai_explanation text,
  reviewed_fields jsonb check (jsonb_typeof(reviewed_fields) = 'object'),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, incident_id, user_id),
  foreign key (incident_id, user_id) references public.incidents(id, user_id) on delete cascade,
  check (storage_path is null or storage_path like user_id::text || '/' || incident_id::text || '/' || id::text || '/%'),
  check (reviewed_at is null or (corrected_text is not null and reviewed_fields is not null))
);

-- A row is a clinic visit, not necessarily one injection or one vaccine dose.
create table public.treatment_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  incident_id uuid not null,
  facility_id uuid references public.facilities(id) on delete set null,
  document_id uuid,
  scheduled_date date,
  schedule_source text not null check (schedule_source in ('card', 'clinic_instruction')),
  schedule_confirmed_at timestamptz,
  attended_date date,
  recorded_treatments text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (incident_id, user_id) references public.incidents(id, user_id) on delete cascade,
  foreign key (document_id, incident_id, user_id)
    references public.treatment_documents(id, incident_id, user_id) on delete set null (document_id),
  check (scheduled_date is not null or attended_date is not null),
  check (schedule_confirmed_at is null or scheduled_date is not null)
);

create table public.facility_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (length(trim(review_text)) between 1 and 1000),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facility_id, user_id)
);

create index incidents_owner_date_idx on public.incidents(user_id, incident_date desc);
create index incidents_map_idx on public.incidents(hotspot_area_id, incident_date, user_id) where share_for_map;
create index documents_owner_incident_idx on public.treatment_documents(user_id, incident_id);
create index documents_incident_idx on public.treatment_documents(incident_id);
create index visits_owner_date_idx on public.treatment_visits(user_id, scheduled_date);
create index visits_incident_idx on public.treatment_visits(incident_id);
create index visits_document_idx on public.treatment_visits(document_id, incident_id, user_id);
create index visits_facility_idx on public.treatment_visits(facility_id);
create index facilities_city_idx on public.facilities(city, ownership) where is_published;
create index reviews_owner_idx on public.facility_reviews(user_id);
create index reviews_published_idx on public.facility_reviews(facility_id, created_at desc) where moderation_status = 'published';

create function public.ligtas_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.ligtas_touch_updated_at() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['facilities', 'hotspot_areas', 'incidents', 'treatment_documents', 'treatment_visits', 'facility_reviews'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.ligtas_touch_updated_at()', table_name);
  end loop;
end;
$$;

-- A corrected source must not leave an old explanation or date looking verified.
create function public.ligtas_invalidate_document_review()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.raw_ocr_text is distinct from old.raw_ocr_text
     or new.corrected_text is distinct from old.corrected_text
     or new.storage_path is distinct from old.storage_path then
    new.ai_explanation := null;
    new.reviewed_fields := null;
    new.reviewed_at := null;
    update public.treatment_visits
      set schedule_confirmed_at = null
      where document_id = old.id and incident_id = old.incident_id and user_id = old.user_id;
  end if;
  return new;
end;
$$;
revoke all on function public.ligtas_invalidate_document_review() from public, anon, authenticated;
create trigger invalidate_document_review before update on public.treatment_documents
for each row execute function public.ligtas_invalidate_document_review();

create function public.ligtas_invalidate_visit_confirmation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.scheduled_date is distinct from old.scheduled_date
     or new.document_id is distinct from old.document_id
     or new.schedule_source is distinct from old.schedule_source then
    new.schedule_confirmed_at := null;
  end if;
  return new;
end;
$$;
revoke all on function public.ligtas_invalidate_visit_confirmation() from public, anon, authenticated;
create trigger invalidate_visit_confirmation before update on public.treatment_visits
for each row execute function public.ligtas_invalidate_visit_confirmation();

create function public.ligtas_requeue_review()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.rating is distinct from old.rating or new.review_text is distinct from old.review_text then
    new.moderation_status := 'pending';
  end if;
  return new;
end;
$$;
revoke all on function public.ligtas_requeue_review() from public, anon, authenticated;
create trigger requeue_review before update on public.facility_reviews
for each row execute function public.ligtas_requeue_review();

alter table public.facilities enable row level security;
alter table public.hotspot_areas enable row level security;
alter table public.incidents enable row level security;
alter table public.treatment_documents enable row level security;
alter table public.treatment_visits enable row level security;
alter table public.facility_reviews enable row level security;

revoke all on public.facilities, public.hotspot_areas, public.incidents,
  public.treatment_documents, public.treatment_visits, public.facility_reviews from public, anon, authenticated;
grant select on public.facilities, public.hotspot_areas to anon, authenticated;
grant select, insert, update, delete on public.incidents, public.treatment_documents, public.treatment_visits to authenticated;
grant select, delete on public.facility_reviews to authenticated;
grant insert (facility_id, rating, review_text) on public.facility_reviews to authenticated;
grant update (rating, review_text) on public.facility_reviews to authenticated;
grant all on public.facilities, public.hotspot_areas, public.incidents,
  public.treatment_documents, public.treatment_visits, public.facility_reviews to service_role;

create policy facilities_public_read on public.facilities for select to anon, authenticated using (is_published);
create policy hotspot_areas_public_read on public.hotspot_areas for select to anon, authenticated using (is_published);
create policy incidents_owner on public.incidents for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy documents_owner on public.treatment_documents for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy visits_owner on public.treatment_visits for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reviews_owner_read on public.facility_reviews for select to authenticated using (user_id = (select auth.uid()));
create policy reviews_owner_insert on public.facility_reviews for insert to authenticated
  with check (user_id = (select auth.uid()) and moderation_status = 'pending'
    and exists (select 1 from public.facilities f where f.id = facility_id and f.is_published));
create policy reviews_owner_update on public.facility_reviews for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reviews_owner_delete on public.facility_reviews for delete to authenticated using (user_id = (select auth.uid()));

-- Deliberately privileged projection: only moderated public content, never author IDs.
create function public.get_facility_reviews(p_facility_id uuid)
returns table (id uuid, rating smallint, review_text text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.id, r.rating, r.review_text, r.created_at
  from public.facility_reviews r
  join public.facilities f on f.id = r.facility_id
  where r.facility_id = p_facility_id and r.moderation_status = 'published' and f.is_published
  order by r.created_at desc, r.id limit 50;
$$;
revoke all on function public.get_facility_reviews(uuid) from public, anon, authenticated;
grant execute on function public.get_facility_reviews(uuid) to anon, authenticated, service_role;

-- Fixed 90-day window and 5-account minimum cannot be weakened by RPC arguments.
-- shortcut: approximate circles and self-reported accounts, use reviewed boundaries and abuse controls before a public pilot.
create function public.get_bite_hotspots()
returns table (area_id uuid, city text, barangay text, latitude double precision,
  longitude double precision, radius_m integer, reporting_accounts_band text)
language sql stable security definer set search_path = '' as $$
  select a.id, a.city, a.barangay, a.latitude, a.longitude, a.radius_m,
    case when count(distinct i.user_id) >= 20 then '20+'
         when count(distinct i.user_id) >= 10 then '10-19' else '5-9' end
  from public.hotspot_areas a
  join public.incidents i on i.hotspot_area_id = a.id
  where a.is_published and i.share_for_map
    and i.incident_date between (now() at time zone 'Asia/Manila')::date - 89
                            and (now() at time zone 'Asia/Manila')::date
  group by a.id
  having count(distinct i.user_id) >= 5;
$$;
revoke all on function public.get_bite_hotspots() from public, anon, authenticated;
grant execute on function public.get_bite_hotspots() to anon, authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('treatment-cards', 'treatment-cards', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf']);

-- Paths: <auth user ID>/<incident ID>/<document ID>/<random filename>.
-- SQL row deletion does not delete a Storage file: use the Storage API first.
create policy ligtas_cards_read on storage.objects for select to authenticated
using (bucket_id = 'treatment-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy ligtas_cards_insert on storage.objects for insert to authenticated
with check (bucket_id = 'treatment-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy ligtas_cards_update on storage.objects for update to authenticated
using (bucket_id = 'treatment-cards' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'treatment-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy ligtas_cards_delete on storage.objects for delete to authenticated
using (bucket_id = 'treatment-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);

comment on table public.incidents is 'Private self-reported incidents. Opt-in map output is available only through get_bite_hotspots().';
comment on table public.treatment_visits is 'Visits belong to one incident. Dates come from the card or clinic, never an AI-generated treatment regimen.';
comment on column public.treatment_visits.schedule_confirmed_at is 'User checked the clinic instruction; not proof of clinician sign-off. Null means do not send a due-date reminder.';
comment on column public.treatment_visits.attended_date is 'Self-reported attendance, not proof of vaccination or medical completion.';
comment on function public.get_bite_hotspots() is 'Coarse, opted-in, self-reported bite reporting; not confirmed rabies, prevalence, or a safe/unsafe classification.';

commit;
