-- LOCAL STAND-IN ONLY, after bootstrap_local.sql and the migration.
-- Never insert fake storage.objects rows in the real Supabase Storage service.
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
insert into storage.objects(bucket_id, name)
values ('treatment-cards', '10000000-0000-0000-0000-000000000001/incident/document/test.jpg');
do $$
begin
  begin
    insert into storage.objects(bucket_id, name)
    values ('treatment-cards', '10000000-0000-0000-0000-000000000002/incident/document/test.jpg');
    raise exception 'Upload into another user folder allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    update storage.objects set name = '10000000-0000-0000-0000-000000000002/moved.jpg'
    where name = '10000000-0000-0000-0000-000000000001/incident/document/test.jpg';
    raise exception 'Move into another user folder allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
do $$
begin
  if exists (select 1 from storage.objects) then raise exception 'Private storage path leaked'; end if;
  delete from storage.objects;
  if found then raise exception 'Another user file deleted'; end if;
end;
$$;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
begin
  delete from storage.objects where bucket_id = 'treatment-cards';
  if not found then raise exception 'Owner cannot delete own file metadata'; end if;
end;
$$;
rollback;
select 'PASS: local Storage policy ownership, moves, reads and deletes (not hosted API validation)' as result;
