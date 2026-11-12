# PASADA: LIGTAS

Animal-bite incident records, Lumen document explanation, incident-bound clinic visits, facility maps/reviews, and coarse opt-in bite reporting.

- [Module plan and Ed/Josh/AJ work split](docs/BUILD_PLAN.md)
- [Supabase import instructions](supabase/README.md)
- [Import-ready PostgreSQL schema](supabase/migrations/202611120001_ligtas.sql)
- [Rollback-based database checks](supabase/tests/schema_checks.sql)

Stack: vanilla JavaScript + Leaflet, PHP for the Lumen relay, Supabase Auth/PostgreSQL/private Storage. Application screens are not implemented yet.
