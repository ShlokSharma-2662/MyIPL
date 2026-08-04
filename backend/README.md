# MyIPL — .NET Backend

ASP.NET Core (.NET 10) Web API that adds a global leaderboard and user career
profiles to the MyIPL simulator. Authentication reuses your existing Firebase
Google login — the API verifies the Firebase ID token (a JWT) on protected
routes, so there's no second login system.

## Stack

- **ASP.NET Core 10** Web API (controllers)
- **EF Core** — SQLite for local dev, PostgreSQL for production (one config switch)
- **JWT Bearer auth** — validates Firebase ID tokens against Google's public keys

## Run locally

```bash
cd backend/MyIPL.Api
dotnet run
```

The API listens on `http://localhost:5288` (and `https://localhost:7294`). On
first run it creates `myipl.db` (SQLite) automatically. Quick check:

```bash
curl http://localhost:5288/api/health
```

### Docker

From the **repo root** (API + Postgres + frontend):

```bash
docker compose up --build
```

API-only with Postgres:

```bash
docker compose up --build db api
curl http://localhost:8080/api/health
```

The API image is `backend/MyIPL.Api/Dockerfile` (also used by Railway). Compose
sets `DATABASE_URL` to the `db` service and `PORT=8080`.

## Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET  | `/api/health` | — | Liveness probe |
| GET  | `/api/leaderboard/top?limit=50` | — | Global standings (titles, win-rate) |
| POST | `/api/leaderboard/season` | ✅ | Submit a finished season |
| GET  | `/api/profile/me` | ✅ | Signed-in user's career |
| GET  | `/api/profile/{uid}` | — | Any user's public career |
| GET  | `/api/game` | ✅ | Load the user's saved game (404 if none) |
| PUT  | `/api/game` | ✅ | Create/replace the user's saved game |
| DELETE | `/api/game` | ✅ | Delete the saved game (on reset) |

Protected routes require `Authorization: Bearer <firebase-id-token>`. The UID is
read from the verified token, never from the request body.

## How auth works

Firebase ID tokens are standard JWTs signed by Google. The JWT Bearer middleware
(`Program.cs`) fetches Google's public keys from
`https://securetoken.google.com/<projectId>` and validates the signature, issuer,
and audience. The project id (`myipl-3f6ec`) lives in `appsettings.json` under
`Firebase:ProjectId`. No service-account JSON file is needed.

## Frontend integration

Already wired up in the React app:

- `src/firebase.js` → `getIdToken()` returns the current user's JWT.
- `src/api.js` → typed client: `submitSeason()`, `getLeaderboard()`,
  `getMyProfile()`, `getProfile(uid)`, and the save game API
  `getGameState()` / `saveGameState()` / `clearGameState()`.

Game saves now persist to Postgres via the API (replacing the old Firestore
save path), so they sync across devices and can store nested-array rosters that
Firestore couldn't.
- `.env.example` → set `VITE_API_URL` (defaults to `http://localhost:5288`).

Example — submit a season when the user finishes one:

```js
import { submitSeason, getLeaderboard } from './api';

await submitSeason({
  userName, team: userTeam, champion,
  won: champion === userTeam, wins, losses, season,
  orangeCapPlayer, orangeCapRuns, purpleCapPlayer, purpleCapWickets,
  userRuns, userWickets,
});

const board = await getLeaderboard(50);
```

## PostgreSQL (Railway / Heroku / Neon / Supabase)

The app reads a single env var, **`DATABASE_URL`**, in the standard
`postgresql://user:pass@host:port/db` form. When present it auto-switches to
Postgres (SSL required) — no other config needed. Railway, Heroku, and Render
inject this variable for you on deploy.

**Local dev — keep the credential out of git** by using .NET User Secrets:

```bash
cd backend/MyIPL.Api
dotnet user-secrets set "DATABASE_URL" "postgresql://user:pass@host:port/db"
dotnet run
```

User Secrets live in your OS profile (`%APPDATA%\Microsoft\UserSecrets\…`),
never in the repo. The only thing committed is the `<UserSecretsId>` GUID in the
`.csproj`. Alternatively, set `DATABASE_URL` as a real environment variable.

> ⚠️ Never paste a live connection string into source files, chat, or commits.
> If one leaks, rotate the password in your Postgres provider immediately.

A free Postgres database is available on [Railway](https://railway.app),
[Supabase](https://supabase.com), or [Neon](https://neon.tech).

### Schema management

- **Postgres (production):** versioned **EF Core migrations** in `Migrations/`,
  applied automatically on startup (`db.Database.Migrate()`). Add a migration
  after changing an entity:
  ```bash
  dotnet ef migrations add <Name>     # commit the generated files
  ```
  It's applied on the next deploy — no manual `database update` needed.
- **Local SQLite dev:** uses `EnsureCreated()` (recreates the schema on boot),
  so migrations stay Postgres-only and you avoid multi-provider conflicts.

> Migrating an older database that was first created with `EnsureCreated` (no
> migration history) to migrations requires dropping its tables once so
> `InitialCreate` can apply cleanly.

## Deploy

Any platform that runs .NET or a container works — Railway, Azure App Service,
Render, Fly.io. Remember to:

1. Provide `DATABASE_URL` (Railway injects it automatically when you attach a
   Postgres service).
2. Add your deployed frontend origin to `Cors:AllowedOrigins` in `appsettings.json`.
