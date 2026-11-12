# Import the LIGTAS database

Target supplied by the team: [Supabase project bnhsxxilmjnlaterhucw](https://supabase.com/dashboard/project/bnhsxxilmjnlaterhucw).

Imported into this project on **12 November 2026** through the Supabase SQL Editor, after confirming the public schema was empty and no LIGTAS objects conflicted. The hosted database runs PostgreSQL **17.11**. No credentials are included. This replaces the earlier MySQL proposal.

**Do not rerun the initial migration on this project.** It has already succeeded. All 10 hosted catalog/privilege checks passed: six application tables, RLS on all six, nine application policies, four upload policies, one private restricted bucket, nine triggers, ten foreign keys, no anonymous private-table read grants, no client moderation/directory write grants, and two public RPCs with the intended permissions and fixed search path. No patient, clinic or demo records were seeded.

## Import

1. Open the intended project and select **SQL Editor → New query**.
2. Paste all of [`migrations/202611120001_ligtas.sql`](migrations/202611120001_ligtas.sql) and run it once as the project database administrator. It creates six application tables, RLS policies, two read RPCs, validation/invalidation triggers and one private Storage bucket.
3. Verify the six tables in Table Editor and the private `treatment-cards` bucket in Storage. Existing tables/buckets with the same names cause the transaction to fail instead of being overwritten. If that happens, inspect the existing schema before adapting this migration; do not drop existing tables to force it through.
4. Configure Supabase Auth for the chosen sign-in flow and deployment redirect URL. Recoverable email sign-in is the pilot baseline. Anonymous sign-in is optional and must be explicitly enabled if used; the public/anon API key by itself does not create a user.
5. Configure the frontend with the project URL and public/publishable key. Keep Lumen credentials and Supabase secret/service-role keys only on the server. Use a user's token for normal private data operations.
6. Add **verified** facility and area records through Table Editor/admin SQL. They default to unpublished. Publishing requires evidence fields; unknown fees/stock must stay unknown. No clinic, patient, review, GPS pin or hotspot is seeded automatically.
7. Run [`tests/schema_checks.sql`](tests/schema_checks.sql) as postgres in a disposable/staging database after the migration. It inserts synthetic fixtures inside a transaction and rolls them back. The final row should say `PASS`.

Do **not** run `tests/bootstrap_local.sql` or `tests/local_storage_checks.sql` in Supabase. They mimic/test the Auth/Storage prerequisites in a fresh local PostgreSQL test database. Supabase already manages those schemas; real file operations must use its Storage API.

## Important behavior

- `incidents` owns the episode; documents and visits carry the incident ID and matching owner. Supabase Auth is the user directory, so there is no duplicate `users` table.
- Public users can read published facilities/area centers and call the two narrow RPCs. Raw medical records and review authors are not part of public output.
- Facilities, map areas and review moderation are managed through a trusted administrator, not a public client. Review edits automatically return to pending.
- Private uploads use `<user-id>/<incident-id>/<document-id>/<filename>` inside `treatment-cards`, with a 10 MiB limit and JPEG/PNG/PDF MIME allowlist. The app must also validate actual files before Lumen processing. Storing a PDF does not establish that Lumen can process it.
- Creating a signed URL makes a temporary bearer link: avoid logging or publishing it. A file cannot be treated as fully revoked while an already-issued signed link remains valid.
- Changing a document's file/OCR/corrected text clears its review and the confirmation on linked visits. Changing a visit's date/document/source also clears confirmation. Save corrections and confirmations in separate writes. The displayed dates stay available for review; they are never silently recomputed.
- `get_facility_reviews(uuid)` returns at most the 50 newest published reviews for a published facility, without user IDs. It is not an overall rating aggregate.
- `get_bite_hotspots()` returns fixed-window, opted-in area bands after at least five distinct accounts. Repeated reports from one account count once. No arbitrary date/animal filters or exact patient locations are exposed. Five accounts are not necessarily five people; this is not an anonymity guarantee or a rabies surveillance system.
- `hotspot_areas` are curated circles. Unpublish an area instead of deleting one referenced by incidents. An incident's optional private coordinates are never used as public map pins.
- Deleting SQL rows does **not** delete Storage objects. Remove files through the Storage API before removing metadata; use a verified server cleanup flow for account deletion and any retention policy. No scheduled cleanup is installed here.
- The migration does not install application screens, reminders, API credentials, rate limits, a cron job or geolocation code. Those are owned by the modules in [`../docs/BUILD_PLAN.md`](../docs/BUILD_PLAN.md).

## Validation performed

Executed the migration and rollback-based assertions on local PostgreSQL 18 using minimal Auth/Storage stand-ins. Checked owner isolation, forged owner rejection, cross-owner document links, cross-incident visit links, invalid coordinates, OCR/date invalidation, moderation/public projection, hotspot opt-in and time boundaries, duplicate-account suppression, row cascades, RLS enablement and bucket settings. Local Storage-policy checks also passed for owner reads/deletes, rejected cross-owner uploads/moves, and hidden file paths. The isolated test server was stopped afterward.

Hosted schema installation and PostgreSQL version are now verified. Still required: actual Supabase Auth sessions, private Storage upload/download/delete with two accounts, Security Advisor review, and the live Lumen/mobile flow. Catalog checks and local stand-ins do not prove those end-to-end integrations.
