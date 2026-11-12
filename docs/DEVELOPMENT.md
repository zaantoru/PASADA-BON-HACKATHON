# Development handoff

The Figma UI is the starting frontend. Express API modules are mounted but return
`501` until implemented. Only `GET /api/health` and authenticated `GET /api/me`
are live. UI demo adapters and localStorage records remain active during handoff.

## Run

Use Node 22.18+ and two terminals from the repository root:

```powershell
cd backend
npm ci
Copy-Item .env.example .env # only if .env does not already exist
npm run dev
```

```powershell
cd frontend
npm ci
npm run dev
```

Backend: `http://localhost:3000`. Frontend: `http://localhost:5500`, or Vite's
printed fallback port. Vite forwards `/api` to `http://127.0.0.1:3000`, so the
same API paths work when Vite selects 5501/5502. Keep `VITE_API_URL=/api` locally.
For production, configure a same-origin `/api` reverse proxy or set the frontend
API base URL at build time. The development proxy is not a production server.

Health needs no external credentials. Private endpoints return `401` without
a bearer token, `503` when Auth cannot be reached/configured, and `501` after
verification until implemented. Put the actual Supabase URL and server-only
secret in `backend/.env`; preserve existing credentials and keep them out of
`frontend/.env`.

## Backend paths and endpoints

| File under `backend/src/` | API paths | Next implementation |
|---|---|---|
| `app.ts`, `index.ts` | configuration and listener | keep route mounting separate from startup |
| `routes/health.ts` | `GET /api/health`, `GET /api/me` | liveness and verified identity |
| `routes/auth.ts` | `GET/POST /api/auth/profile` | verified user's profile |
| `routes/scan.ts` | `POST /api/scan/ocr`, `/explain`, `/tour-step`; `PATCH /api/scan/:documentId/correction` | private upload, Lumen, correction/review |
| `routes/incidents.ts` | `GET/POST /api/incidents`; `GET/PATCH/DELETE /api/incidents/:id`; `POST /api/incidents/:id/visits` | owner-bound records and visits |
| `routes/visits.ts` | `PATCH /api/visits/:id/attended`, `/confirm-schedule` | attendance and explicit confirmation |
| `routes/facilities.ts` | `GET /api/facilities`, `/api/facilities/near` | published, verified directory |
| `routes/hotspots.ts` | `GET /api/hotspots` | only `get_bite_hotspots()` RPC |
| `routes/notifications.ts` | `POST/DELETE /api/notifications/subscribe` | subscription validation/storage |
| `config/supabase.ts` | `getSupabase()` | lazy, server-only service-role client |
| `middleware/requireAuth.ts` | protected routers | Supabase `auth.getUser(token)` verification |
| `services/README.md` | service ownership | Lumen, guide envelope, email, ESP32 SMS, push |
| `jobs/README.md` | planned `sendReminders.ts` | confirmed-visit reminders and delivery claims |

`req.user.id` is the verified identity. Never take an owner from a request body
or URL. The service-role client bypasses RLS: every private query and referenced
parent must be constrained to that owner. Validate bodies and UUIDs as each
handler is implemented; placeholders perform no writes. JSON errors use
`{ "error": "message" }`.

## Frontend paths

| Existing adapter or screen | Backend handoff |
|---|---|
| `service/api/client.ts`, `service/api/paths.ts` | shared fetch, user-token headers, relative endpoints |
| `pages/Auth/Login.tsx`, `pages/Auth/Register.tsx` | Supabase sign-in/signup/session, then profile API |
| `service/recordsService.ts` | incidents/visits; translate UI fields to schema fields here |
| `service/documentService.ts` | upload/OCR/corrections; align file validation with Storage |
| `service/guideService.ts` | structured AI tour envelope and UI actions |
| `service/facilityService.ts` | published facilities and moderated reviews |
| `service/hotspotService.ts`, `service/communityReportService.ts` | coarse RPC output and map opt-in |
| `service/reminderService.ts` | confirmed visit preferences and push subscription |
| `service/api/psgc.ts` | external address lookup; keep separate from the application API |

After Auth is connected:

```typescript
const response = await apiFetch(apiPaths.incidents, { accessToken: session.access_token })
const data = await response.json() // validate the response shape in the endpoint's adapter
```

Set JSON headers explicitly for JSON bodies. Pass `FormData` directly for
uploads; the browser generates the multipart boundary. Mock records differ
from PostgreSQL in both naming and structure. Preserve exported adapter
signatures while translating validated payloads; retain demo labels until the
real call succeeds.

The imported app uses `/#/...`; `/login` and `/register` are normal URLs.
Main's `/facilities` OpenStreetMap discovery screen is retained separately from
`/#/hospitals`. Discovery results are not verified LIGTAS directory records:
review sources and seed verified facilities before publishing through the API.

## Checks and implementation order

Run `npm run build` and `npm test` in both packages, plus `npm run lint` in
`frontend`. Backend tests use a temporary HTTP port and mocked Auth responses;
frontend tests use Node's built-in test runner and fetch mocks.

Start with Auth/profiles, owner-bound incidents/visits, private Storage and real
OCR, corrected-text guide steps, published facilities, aggregate hotspots, then
reminders. Consult `AGENTS.md` and the schema for ownership, scheduling,
publication, and notification rules. Do not reapply migrations already installed
on the configured hosted project.
