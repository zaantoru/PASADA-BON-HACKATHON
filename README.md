# PASADA: LIGTAS

A Filipino animal-bite health companion: review treatment cards, keep incident
and clinic-visit records, find care, and view coarse opt-in community reporting.

The Figma frontend is integrated with the existing login, registration, and
facility-discovery screens. Leaflet.js renders maps with OpenStreetMap tiles.
The Express API has guarded module entry points ready for development.

Stack: React + TypeScript + Vite, Express 5 + TypeScript (ESM), Supabase
Auth/PostgreSQL/private Storage, and Lumen OCR/Chat. Database writes and external
credentials belong on the backend.

## Start development

Use Node 22.18+. Install dependencies in `backend` and `frontend` with `npm ci`.
Run `npm run dev` in each directory using two terminals. Backend defaults to
port 3000; frontend defaults to 5500 and prints a fallback port if needed.
Frontend `/api` requests are proxied to Express during development.

- [Development setup, API endpoints, and file ownership](docs/DEVELOPMENT.md)
- [Frontend screens and demo boundaries](frontend/README.md)
- [Module plan and team handoffs](docs/BUILD_PLAN.md)
- [Supabase migrations and verification](supabase/README.md)

`GET /api/health` works before credentials are configured. `GET /api/me` verifies
a Supabase user access token. Other API handlers currently return `501` after
any required authentication; the frontend still uses labeled demo adapters and
localStorage. Live Lumen, private record persistence, and reminder delivery are
the next development work.

Run `npm test` and `npm run build` in each package, plus `npm run lint` in
`frontend`. Use synthetic documents while backend integration is incomplete.
