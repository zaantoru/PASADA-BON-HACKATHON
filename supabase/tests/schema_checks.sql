-- Run as postgres AFTER all migrations, preferably in a disposable database.
-- All fixtures are synthetic and rolled back. No external test extension needed.
begin;

do $$
declare n integer;
begin
  for n in 1..8 loop
    perform set_config('ligtas.test_user_' || n, gen_random_uuid()::text, true);
    insert into auth.users(id) values (current_setting('ligtas.test_user_' || n)::uuid);
  end loop;
  perform set_config('ligtas.test_facility', gen_random_uuid()::text, true);
  perform set_config('ligtas.test_area', gen_random_uuid()::text, true);
  perform set_config('ligtas.test_incident', gen_random_uuid()::text, true);
  perform set_config('ligtas.test_incident_other', gen_random_uuid()::text, true);
  perform set_config('ligtas.test_incident_same_owner', gen_random_uuid()::text, true);
  perform set_config('ligtas.test_document', gen_random_uuid()::text, true);
  perform set_config('ligtas.test_visit', gen_random_uuid()::text, true);
end;
$$;

insert into public.facilities(id, name, facility_type, city, address, source_url, source_checked_on, is_published)
values (current_setting('ligtas.test_facility')::uuid, 'SYNTHETIC TEST CLINIC', 'abtc', 'TEST CITY', 'TEST ONLY', 'https://example.invalid', current_date, true);
insert into public.hotspot_areas(id, city, barangay, latitude, longitude, source_url, source_checked_on, is_published)
values (current_setting('ligtas.test_area')::uuid, 'TEST CITY', 'SYNTHETIC AREA', 14.5, 121.0, 'https://example.invalid', current_date, true);
insert into public.incidents(id, user_id, incident_date, city, animal_type)
values (current_setting('ligtas.test_incident_other')::uuid, current_setting('ligtas.test_user_2')::uuid, current_date, 'TEST CITY', 'dog');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('ligtas.test_user_1'), 'role', 'authenticated')::text, true);
insert into public.incidents(id, incident_date, city, animal_type)
values (current_setting('ligtas.test_incident')::uuid, current_date, 'TEST CITY', 'cat');
insert into public.incidents(id, incident_date, city, animal_type)
values (current_setting('ligtas.test_incident_same_owner')::uuid, current_date, 'TEST CITY', 'dog');

do $$
begin
  if (select user_id <> auth.uid() or share_for_map from public.incidents where id = current_setting('ligtas.test_incident')::uuid) then
    raise exception 'Owner/default opt-out failed';
  end if;
  if exists (select 1 from public.incidents where id = current_setting('ligtas.test_incident_other')::uuid) then
    raise exception 'Another user incident leaked';
  end if;
  update public.incidents set city = 'UNAUTHORIZED' where id = current_setting('ligtas.test_incident_other')::uuid;
  if found then raise exception 'Another user incident was updated'; end if;
  delete from public.incidents where id = current_setting('ligtas.test_incident_other')::uuid;
  if found then raise exception 'Another user incident was deleted'; end if;
  begin
    insert into public.incidents(user_id, incident_date, city, animal_type)
    values (current_setting('ligtas.test_user_2')::uuid, current_date, 'TEST CITY', 'cat');
    raise exception 'Forged owner accepted';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.treatment_documents(incident_id)
    values (current_setting('ligtas.test_incident_other')::uuid);
    raise exception 'Cross-owner document link accepted';
  exception when foreign_key_violation then null;
  end;
  begin
    insert into public.incidents(incident_date, city, animal_type, latitude, longitude)
    values (current_date, 'TEST CITY', 'cat', 91, 121);
    raise exception 'Invalid coordinate accepted';
  exception when check_violation then null;
  end;
end;
$$;

insert into public.treatment_documents(id, incident_id, raw_ocr_text, corrected_text)
values (current_setting('ligtas.test_document')::uuid, current_setting('ligtas.test_incident')::uuid, 'TEST ONLY', 'TEST ONLY');
update public.treatment_documents set ai_explanation = 'TEST explanation', reviewed_fields = '{"medicine_as_written":"TEST ONLY"}', reviewed_at = now()
where id = current_setting('ligtas.test_document')::uuid;
insert into public.treatment_visits(id, incident_id, document_id, scheduled_date, schedule_source, schedule_confirmed_at)
values (current_setting('ligtas.test_visit')::uuid, current_setting('ligtas.test_incident')::uuid,
  current_setting('ligtas.test_document')::uuid, current_date + 1, 'card', now());
update public.treatment_documents set corrected_text = 'CORRECTED TEST ONLY' where id = current_setting('ligtas.test_document')::uuid;
do $$
begin
  if exists (select 1 from public.treatment_documents where id = current_setting('ligtas.test_document')::uuid
    and (ai_explanation is not null or reviewed_fields is not null or reviewed_at is not null)) then
    raise exception 'Correcting OCR left a stale review';
  end if;
  if exists (select 1 from public.treatment_visits where id = current_setting('ligtas.test_visit')::uuid and schedule_confirmed_at is not null) then
    raise exception 'Correcting OCR left a confirmed source-linked date';
  end if;
end;
$$;
update public.treatment_visits set schedule_confirmed_at = now() where id = current_setting('ligtas.test_visit')::uuid;
update public.treatment_visits set scheduled_date = current_date + 2 where id = current_setting('ligtas.test_visit')::uuid;
do $$
begin
  if exists (select 1 from public.treatment_visits where id = current_setting('ligtas.test_visit')::uuid and schedule_confirmed_at is not null) then
    raise exception 'Changed appointment retained old confirmation';
  end if;
  begin
    insert into public.treatment_visits(incident_id, document_id, scheduled_date, schedule_source)
    values (current_setting('ligtas.test_incident_same_owner')::uuid, current_setting('ligtas.test_document')::uuid, current_date, 'card');
    raise exception 'Cross-incident visit accepted';
  exception when foreign_key_violation then null;
  end;
  begin
    update public.facilities set is_published = false where id = current_setting('ligtas.test_facility')::uuid;
    raise exception 'Client can administer facilities';
  exception when insufficient_privilege then null;
  end;
end;
$$;

insert into public.facility_reviews(facility_id, rating, review_text)
values (current_setting('ligtas.test_facility')::uuid, 4, 'SYNTHETIC service review');
do $$
begin
  if exists (select 1 from public.get_facility_reviews(current_setting('ligtas.test_facility')::uuid)) then
    raise exception 'Unmoderated review became public';
  end if;
  begin
    update public.facility_reviews set moderation_status = 'published' where facility_id = current_setting('ligtas.test_facility')::uuid;
    raise exception 'Client can publish reviews';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
update public.facility_reviews set moderation_status = 'published' where facility_id = current_setting('ligtas.test_facility')::uuid;
set local role anon;
do $$
declare payload jsonb;
begin
  select to_jsonb(r) into payload from public.get_facility_reviews(current_setting('ligtas.test_facility')::uuid) r;
  if payload is null or payload ? 'user_id' or payload ? 'facility_id' then
    raise exception 'Public review projection failed';
  end if;
  begin
    perform * from public.incidents;
    raise exception 'Unauthenticated access to private incidents';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
set local role authenticated;
update public.facility_reviews set review_text = 'EDITED SYNTHETIC REVIEW' where facility_id = current_setting('ligtas.test_facility')::uuid;
do $$
begin
  if exists (select 1 from public.get_facility_reviews(current_setting('ligtas.test_facility')::uuid)) then
    raise exception 'Editing review bypassed moderation';
  end if;
end;
$$;
reset role;

-- Repeated reports from one account must not cross the 5-account threshold.
insert into public.incidents(user_id, incident_date, city, animal_type, hotspot_area_id, share_for_map)
select current_setting('ligtas.test_user_1')::uuid, (now() at time zone 'Asia/Manila')::date, 'TEST CITY', 'dog', current_setting('ligtas.test_area')::uuid, true
from generate_series(1, 8);
do $$
begin
  if exists (select 1 from public.get_bite_hotspots() where area_id = current_setting('ligtas.test_area')::uuid) then
    raise exception 'One reporting account created a hotspot';
  end if;
end;
$$;
insert into public.incidents(user_id, incident_date, city, animal_type, hotspot_area_id, share_for_map)
select current_setting('ligtas.test_user_' || n)::uuid, (now() at time zone 'Asia/Manila')::date, 'TEST CITY', 'cat', current_setting('ligtas.test_area')::uuid, true
from generate_series(2, 4) n;
insert into public.incidents(user_id, incident_date, city, animal_type, hotspot_area_id, share_for_map)
values
  (current_setting('ligtas.test_user_5')::uuid, (now() at time zone 'Asia/Manila')::date - 90, 'TEST CITY', 'cat', current_setting('ligtas.test_area')::uuid, true),
  (current_setting('ligtas.test_user_6')::uuid, (now() at time zone 'Asia/Manila')::date + 1, 'TEST CITY', 'cat', current_setting('ligtas.test_area')::uuid, true),
  (current_setting('ligtas.test_user_7')::uuid, (now() at time zone 'Asia/Manila')::date, 'TEST CITY', 'cat', current_setting('ligtas.test_area')::uuid, false);
do $$
begin
  if exists (select 1 from public.get_bite_hotspots() where area_id = current_setting('ligtas.test_area')::uuid) then
    raise exception 'Old/future/opted-out incident counted';
  end if;
end;
$$;
insert into public.incidents(user_id, incident_date, city, animal_type, hotspot_area_id, share_for_map)
values (current_setting('ligtas.test_user_8')::uuid, (now() at time zone 'Asia/Manila')::date - 89, 'TEST CITY', 'cat', current_setting('ligtas.test_area')::uuid, true);
set local role anon;
do $$
begin
  if not exists (select 1 from public.get_bite_hotspots() where area_id = current_setting('ligtas.test_area')::uuid and reporting_accounts_band = '5-9') then
    raise exception '5-account hotspot or 90-day boundary failed';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('ligtas.test_user_2'), 'role', 'authenticated')::text, true);
do $$
begin
  if exists (select 1 from public.treatment_documents where id = current_setting('ligtas.test_document')::uuid)
     or exists (select 1 from public.treatment_visits where id = current_setting('ligtas.test_visit')::uuid)
     or exists (select 1 from public.facility_reviews where facility_id = current_setting('ligtas.test_facility')::uuid) then
    raise exception 'Another account can read documents, visits, or private reviews';
  end if;
end;
$$;
reset role;

-- Profiles exist for old and new accounts; notification ownership is enforced even for the service role.
do $$
begin
  if exists (select 1 from auth.users u left join public.profiles p on p.id = u.id where p.id is null) then
    raise exception 'Profile signup/backfill failed';
  end if;
  if has_function_privilege('anon', 'public.ligtas_create_profile()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.ligtas_create_profile()', 'EXECUTE')
     or has_table_privilege('anon', 'public.profiles', 'SELECT')
     or has_table_privilege('anon', 'public.notifications', 'SELECT')
     or has_table_privilege('authenticated', 'public.notifications', 'INSERT,UPDATE,DELETE') then
    raise exception 'Profile/notification privileges too broad';
  end if;
end;
$$;
set local role service_role;
insert into public.notifications(user_id, visit_id, channel, scheduled_for)
values (current_setting('ligtas.test_user_1')::uuid, current_setting('ligtas.test_visit')::uuid, 'sms', current_date);
do $$
begin
  begin
    insert into public.notifications(user_id, visit_id, channel, scheduled_for)
    values (current_setting('ligtas.test_user_2')::uuid, current_setting('ligtas.test_visit')::uuid, 'email', current_date);
    raise exception 'Cross-owner notification accepted';
  exception when foreign_key_violation then null;
  end;
  begin
    insert into public.notifications(user_id, visit_id, channel, scheduled_for)
    values (current_setting('ligtas.test_user_1')::uuid, current_setting('ligtas.test_visit')::uuid, 'sms', current_date);
    raise exception 'Duplicate visit/channel log accepted';
  exception when unique_violation then null;
  end;
end;
$$;
reset role;
set local role authenticated;
do $$
begin
  if exists (select 1 from public.profiles where id = current_setting('ligtas.test_user_1')::uuid)
     or exists (select 1 from public.notifications where visit_id = current_setting('ligtas.test_visit')::uuid) then
    raise exception 'Another account can read profiles or delivery logs';
  end if;
end;
$$;
reset role;
delete from public.incidents where id = current_setting('ligtas.test_incident')::uuid;
do $$
begin
  if exists (select 1 from public.treatment_documents where id = current_setting('ligtas.test_document')::uuid)
     or exists (select 1 from public.treatment_visits where id = current_setting('ligtas.test_visit')::uuid)
     or exists (select 1 from public.notifications where visit_id = current_setting('ligtas.test_visit')::uuid) then
    raise exception 'Incident deletion did not cascade';
  end if;
  if exists (select 1 from pg_class where oid in ('public.incidents'::regclass, 'public.treatment_documents'::regclass,
    'public.treatment_visits'::regclass, 'public.facilities'::regclass, 'public.hotspot_areas'::regclass, 'public.facility_reviews'::regclass,
    'public.profiles'::regclass, 'public.notifications'::regclass) and not relrowsecurity) then
    raise exception 'Table missing RLS';
  end if;
  if not exists (select 1 from storage.buckets where id = 'treatment-cards' and not public and file_size_limit = 10485760) then
    raise exception 'Private restricted upload bucket missing';
  end if;
end;
$$;
rollback;
select 'PASS: ownership, parent links, corrections, moderation, aggregate privacy, cascade, bucket configuration, profiles, notifications' as result;
