# DineNEU

DineNEU is a web app for Northeastern University students to browse live dining hall menus, log what they eat, and track nutrition over time. Campus dining menus are published through DineOnCampus with no way to filter by allergen or total up what you ate, or have a personalized view of your nutrition so DineNEU adds all three. It covers Stetson East, International Village, and 60 Belvidere dining halls.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7, Tailwind CSS 4, Recharts 3, lucide-react |
| Backend | Python 3.14, FastAPI, Pydantic 2, `curl_cffi`, `cachetools` |
| Database / Auth | Supabase (Postgres, Row Level Security, email/password auth) |
| Testing | Vitest + jsdom (API client tests) |
| Deployment | Vercel (frontend and backend as one project) |

## Key features

- **Menu browsing:** live menus for three dining halls, by meal period (breakfast, lunch, dinner), grouped by station, with search.
- **Dietary filters:** exclude allergens and require dietary preferences (e.g. Vegan, Vegetarian).
- **Allergen normalization:** upstream allergen labels vary (`Milk*`, `Milk (Sheep Milk)`). They are collapsed to a single canonical name so filters behave predictably.
- **Nutrition logging:** select items, set servings, and log them to your account.
- **Dashboard:** daily, weekly and monthly totals for calories, protein, sodium, fat and more, with a nutrient breakdown chart and a list of logged items you can delete.
- **Persisted settings:** save allergens and dietary preferences once. They are stored per user and applied automatically on the menu page.
- **Auth:** email/password sign-up and sign-in; the dashboard and settings require an account.

## Architecture

Three views of the same system: where the pieces live and what they trust, how a menu request moves through the backend, and how auth and user data bypass the backend entirely.

### System overview

```
┌──────────────────────────── USER'S BROWSER ────────────────────────────┐
│                                                                        │
│   React 19 SPA (Vite build, served as static assets)                   │
│                                                                        │
│   ┌────────────────────┐  ┌─────────────────────────────────────────┐  │
│   │ src/api.ts         │  │ src/supabase.ts                         │  │
│   │ menu client        │  │ Supabase JS client                      │  │
│   │ (no credentials)   │  │ (publishable key + user JWT)            │  │
│   └─────────┬──────────┘  └────────────────────┬────────────────────┘  │
│             │                                  │                       │
│   Runs here: allergen/preference filtering, search, serving counts,    │
│   dashboard aggregation (today / week / month), route protection       │
└─────────────┼──────────────────────────────────┼───────────────────────┘
              │                                  │
              │ HTTPS  /api/menu/*               │ HTTPS  direct,
              │ (same origin)                    │ never touches Vercel
              ▼                                  │
┌─────────────────────────────────┐              │
│ VERCEL  (one project, one       │              │
│ origin, two services)           │              │
│                                 │              │
│  rewrite /api/*  ──► backend    │              │
│  rewrite /*      ──► frontend   │              │
│                                 │              │
│  ┌───────────────────────────┐  │              │
│  │ FastAPI  (backend/)       │  │              │
│  │                           │  │              │
│  │  routers/menu.py          │  │              │
│  │  services/dining_service  │  │              │
│  │  TTL caches (in-memory)   │  │              │
│  │                           │  │              │
│  │  Holds no user data.      │  │              │
│  │  No Supabase credentials. │  │              │
│  └─────────────┬─────────────┘  │              │
└────────────────┼────────────────┘              │
                 │                               │
                 │ HTTPS                         │
                 │                               │
                 ▼                               ▼
┌─────────────────────────────────┐  ┌──────────────────────────────────┐
│ UPSTREAM                        │  │ SUPABASE                         │
│                                 │  │                                  │
│ DineOnCampus                    │  │  Auth     email/password, JWTs   │
│ apiv4.dineoncampus.com          │  │                                  │
│                                 │  │  Postgres, RLS enabled           │
│ Undocumented; can change        │  │   ├─ meal_logs                   │
│ without notice                  │  │   └─ user_dietary_settings       │
│                                 │  │                                  │
│                                 │  │  Security boundary: RLS policies │
└─────────────────────────────────┘  └──────────────────────────────────┘
```

### Menu request flow

```
 Browser                  FastAPI                          DineOnCampus
    │                        │                                   │
    │ GET /api/menu/         │                                   │
    │  ?location_name=…      │                                   │
    │  &period_name=…        │                                   │
    │───────────────────────►│                                   │
    │                        │                                   │
    │                 ┌──────┴────────────────┐                  │
    │                 │ menu_cache lookup     │                  │
    │                 │ key: location+period  │                  │
    │                 │      +date, TTL 2h    │                  │
    │                 └──────┬────────────────┘                  │
    │                        │                                   │
    │          hit ┌─────────┴─────────┐ miss                    │
    │      ┌───────┤                   ├───────┐                 │
    │      │       └───────────────────┘       ▼                 │
    │      │                      ┌─────────────────────────┐    │
    │      │                      │ period_cache lookup     │    │
    │      │                      │ name ──► period ID      │    │
    │      │                      │ TTL 1h                  │    │
    │      │                      └────────────┬────────────┘    │
    │      │                                   │ miss only       │
    │      │                                   │ GET /periods ──►│
    │      │                                   │◄── period list ─│
    │      │                                   ▼                 │
    │      │                      GET /menu?period=<id> ────────►│
    │      │                                   │◄── raw JSON ────│
    │      │                                   ▼                 │
    │      │                      ┌─────────────────────────┐    │
    │      │                      │ Pydantic parsing        │    │
    │      │                      │ Menu > Category > Item  │    │
    │      │                      │ Nutrients (null if      │    │
    │      │                      │ missing)                │    │
    │      │                      └────────────┬────────────┘    │
    │      │                                   │                 │
    │      │                         categories empty?           │
    │      │                         ┌─────────┴─────────┐       │
    │      │                      no │                   │ yes   │
    │      │                         │                   ▼       │
    │      │                         │      evict period_cache   │
    │      │                         │      entry, refetch ONCE  │
    │      │                         │      (back to period      │
    │      │                         │       lookup above)       │
    │      │                         ▼                   │       │
    │      │                 store in menu_cache         │       │
    │      │                 (only if non-empty)         │       │
    │      │                         │                   │       │
    │      │                         ▼                   ▼       │
    │      └───────────────────────► response ◄── (empty result  │
    │                                │          returned as-is,  │
    │                                │          not cached)      │
    │◄───────────────────────────────┘                           │
    │ JSON: categories[].items[]                                 │
    │                                                            │
    ▼ filters and search applied client-side, no further requests
```

### Auth and user data flow

```
 Browser (Supabase JS client)                       Supabase
┌───────────────────────────┐
│ 1. sign up / sign in      │ ───────────────►  Auth
│                           │ ◄───────────────  JWT session
└─────────────┬─────────────┘
              │
              │ 2. every query carries publishable key + JWT
              ▼
        ┌───────────────────────────────────────────────────────┐
        │ Postgres                                              │
        │                                                       │
        │   RLS policy check on every statement:                │
        │   auth.uid() = user_id   (decoded from the JWT)       │
        │            │                                          │
        │     pass ──┴── fail: row invisible / write rejected   │
        │      │                                                │
        │      ▼                                                │
        │   ┌──────────────────────────┐                        │
        │   │ meal_logs                │ select, insert, delete │
        │   │  user_id, hall, period   │                        │
        │   │  quantity                │                        │
        │   │  nutrients  jsonb        │ snapshot at log time   │
        │   └──────────────────────────┘                        │
        │   ┌──────────────────────────┐                        │
        │   │ user_dietary_settings    │ select, insert, update │
        │   │  allergens jsonb         │                        │
        │   │  dietary_preferences     │                        │
        │   └──────────────────────────┘                        │
        └───────────────────────────────────────────────────────┘

 What reads and writes each table

   Menu page       reads   user_dietary_settings  (pre-fills filters)
                   writes  meal_logs              (nutrients copied from the
                                                   menu item in memory)
   Settings page   reads/upserts user_dietary_settings
   Dashboard       reads   meal_logs  ──► summed in the browser by time window
                   deletes meal_logs rows
```

Without the browser-like headers, the upstream API returns degraded data (a reduced, coffee-only menu), which is why requests go through `curl_cffi` rather than a plain HTTP client.

**Two services.** The React frontend and the FastAPI backend are separate services. The frontend calls the backend at `VITE_API_URL` for menu data (`/api/menu`, `/api/menu/periods`, `/api/menu/locations`). It talks to Supabase directly with the public client for everything user-specific.

**Menu pipeline.** The backend fetches from DineOnCampus's undocumented public API, the same one its own website uses. It uses `curl_cffi` to send browser-like requests (Chrome TLS impersonation plus a few `sec-fetch-*` headers), because the API returns a reduced, coffee-only menu to plain HTTP clients. Responses are parsed into typed Pydantic models, with nutrients normalized to consistent fields and `null` when a value is missing. They are cached in-memory with `cachetools` (periods for 1 hour, menus for 2 hours). Because the API is undocumented, it can change without notice.

**Auth and data.** Supabase handles authentication. The browser talks to Postgres directly through the publishable key, and Row Level Security policies restrict every row to its owner (`auth.uid() = user_id`). The backend holds no user data and needs no Supabase credentials.

## Design decisions

**jsonb nutrient snapshots.** Each `meal_logs` row stores the item's nutrients as they were at log time, rather than referencing a menu item. Menu items change or disappear from day to day, and the upstream API has no stable item ID or history, so a snapshot keeps past logs and dashboard totals accurate.

**RLS as the security boundary.** The browser queries Postgres directly, and policies restrict every row to its owner with `auth.uid() = user_id`. Because the backend holds no user data and has no Supabase credentials, there is no backend middleware that would need to enforce access, and the publishable key in the bundle is safe to expose.

**`null` means unknown, not zero.** In the `Nutrients` model, a value the upstream API does not provide is `null`, not `0`. A real zero and a missing value are different facts, and collapsing them at the parsing layer would make that distinction unrecoverable for everything downstream, including the snapshots stored in `meal_logs`.

**Stale-period-ID recovery.** Period IDs are cached for an hour, but upstream can change them, in which case a menu request comes back empty. When that happens the backend evicts the cached periods for that location, re-resolves the IDs and retries once, so a stale ID does not leave the menu empty until the cache expires. Empty results are never written to `menu_cache`, so a bad response cannot stick for two hours.

**Backend does not hold user data.** Keeping the FastAPI service stateless and credential-free means it can be deployed, scaled or replaced without touching auth, and a compromise of it exposes only public menu data. Everything user-specific goes through Supabase, where RLS applies.

**Filtering on the client.** The backend returns the full menu for a hall and period, and allergen, preference and text filters run in the browser. Menus are small, so changing a filter is instant with no extra requests, and the backend cache can be keyed only on location, period and date instead of on every filter combination.

**Allergen normalization.** Upstream labels the same allergen several ways (`Milk*`, `Milk (Sheep Milk)`). `normalizeAllergen` collapses them to one canonical name, and it is applied to both the filter options and the item allergens, so excluding "Milk" catches every variant.

**Cancellable effects and optimistic settings.** Data-loading effects set a `cancelled` flag on cleanup so a slow response for a previous hall or period cannot overwrite a newer one. Settings toggles update the UI immediately and roll back if the Supabase write fails.

## Getting started

**Prerequisites:** Node 20+ and Python 3.11+ (developed on Node 24 and Python 3.14), plus a Supabase project.

**1. Frontend**

```bash
npm install
```

Create `.env` in the repo root:

```
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

```bash
npm run dev          # http://localhost:5173
```

**2. Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend reads one optional environment variable, `FRONTEND_URL`, which sets the allowed CORS origin. It defaults to `http://localhost:5173`, so no configuration is needed locally. It does not load `.env` files automatically, so export it in your shell if you need it.

**3. Database:** apply the migrations (see [Database](#database)).

Other scripts: `npm test` (Vitest), `npm run lint`, `npm run build`.

## Deployment

Deployed on Vercel as a single project. `vercel.json` defines two services: the Vite frontend at the repo root, and the FastAPI backend in `backend/` (entrypoint `main:app`). Rewrites send `/api/*` to the backend and everything else to the frontend, so both are served from one origin. The Supabase URL and key are set as project environment variables in Vercel.

## Database

Schema lives in `supabase/migrations/`:

| Migration | Table | Purpose |
|---|---|---|
| `20260826000000_create_meal_logs.sql` | `meal_logs` | One row per logged item: hall, period, quantity, and a `jsonb` snapshot of the nutrients at log time |
| `20260929000000_create_user_dietary_settings.sql` | `user_dietary_settings` | One row per user: saved allergens and dietary preferences |

Both tables reference `auth.users` with `on delete cascade` and have RLS enabled. `meal_logs` allows users to select, insert and delete their own rows. `user_dietary_settings` allows select, insert and update.

To apply them, open your Supabase project's **SQL Editor** and run each file in filename order.
