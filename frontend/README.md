<<<<<<< Updated upstream
# React + TypeScript + Vite
=======
# PASADA: LIGTAS frontend

React + TypeScript + Vite frontend, integrating the team's Figma Make export.

Backend setup, endpoint paths, and adapter ownership are documented in
[`../docs/DEVELOPMENT.md`](../docs/DEVELOPMENT.md). Shared request helpers live in
`src/service/api/client.ts` and `src/service/api/paths.ts`. Vite proxies `/api`
to Express on port 3000 during development.

## Run locally

From this `frontend` directory:

```sh
npm install
npm run dev
```

Open http://localhost:5500/. Port 5500 is configured because Windows reserves
the default Vite port 5173 on the development machine. Use the URL printed by
Vite if that port is already occupied.

## Routes

- `/login` and `/register`: Kirei's existing authentication screens.
- `/#/`: imported home dashboard.
- `/#/scan`: upload a document or use a fictional sample card.
- `/#/records`: incidents and visit records.
- `/#/hospitals`: facility map, filters, reviews, and assistance information.
- `/#/hotspots`: reported-bite map and simulated entry alerts.
- `/#/documents/:id`: reviewed document, AI guide, tour, and next actions.

The imported screens retain hash-based navigation from Figma. The existing
BrowserRouter keeps the team's authentication URLs intact. Authentication UI
is preserved; importing these screens does not connect sign-in or protect the
prototype records.

## Frontend organization

- `src/pages/`: screens grouped by Home, Auth, Incidents, Documents, Tracker,
  Hospitals, Hotspots, and Records.
- `src/components/common/`: reusable controls, icons, cards, and illustrations.
- `src/components/layout/`: app navigation and screen layout.
- `src/components/documents/`: original preview and collapsible details panel.
- `src/components/maps/`: shared Leaflet map components.
- `src/features/documents/`: extraction review and educational guide/tour UI.
- `src/context/`: records, toast, and alert providers.
- `src/service/`: replaceable UI adapters; existing `api/psgc.ts` is preserved.
- `src/utils/`: formatting, hash navigation, and viewport helpers.
- `src/types/`: shared UI types.
- `src/mocks/`: fictional extraction records, facilities, and example documents.

## Prototype boundaries and backend handoff

This commit imports the UI, not a live Lumen or Supabase integration.

- OCR returns fictional sample values, regardless of an uploaded image. It is
  labeled as a simulation. Replace `service/documentService.ts` with a call to
  the team's server-side Lumen relay.
- The educational guide is a local demo adapter in `service/guideService.ts`.
  Wire it to the server using the corrected, saved document as its input.
- Records currently persist in this browser's localStorage. Replace
  `service/recordsService.ts` with authenticated private backend storage before
  using real patient records. Use fictional/de-identified documents for demos.
- Facility reviews, hotspot reports, and some directory information are demo
  data. Source links and uncertainty labels remain visible.
- A reminder preference is not a scheduled background notification. The UI
  accurately distinguishes the demo preference from an actual scheduler and
  supports calendar export.
- Maps use Leaflet with external CARTO/OpenStreetMap tiles. They show a
  recoverable state if tiles cannot load. The directory remains usable.
- Keep credentials in the backend. No Lumen secret or Supabase service-role key
  belongs in this frontend.

Existing backend, Supabase migrations, and auth/address-fetching logic are not
replaced by the Figma export. Its Figma-only tooling and pnpm lockfile are not
copied; the existing npm/Vite setup is retained.

## Checks

```sh
npm run build
npm run lint
npm test
```

Smoke-test the sample-card flow: upload sample, correct uncertain fields,
confirm the incident, save, inspect the guide, open/collapse the details panel,
walk through the tour, navigate to care options, and reload the saved record.
Also check `/login`, `/register`, and a 390px mobile viewport.

## Original template documentation

The original React + TypeScript + Vite template documentation is preserved below.
Its ESLint examples describe optional configuration changes, not settings
already enabled in this project.

### React + TypeScript + Vite
>>>>>>> Stashed changes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
