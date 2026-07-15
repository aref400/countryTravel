---
name: run
description: Launch the CountryTravel dev environment (NestJS API on :3000 + React/Vite front on :5173). Use this whenever the user asks to run, start, launch, or preview the CountryTravel app, wants to check that a change works in the browser, or says things like "lance le projet", "démarre l'app", "je veux voir le rendu". Always use this instead of guessing dev commands or ports for this repo.
---

## Prerequisites

1. Check `apps/api/.env` exists. It must define at minimum:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `FRONTEND_URL` (defaults to `http://localhost:5173` if unset — only needed if the front runs on a different port)
   - `PORT` (defaults to `3000` if unset)

   If `apps/api/.env` is missing, copy `apps/api/.env.example` as a starting point (its default `DATABASE_URL` targets the local Docker database below) and tell the user to fill in real JWT secrets — do not invent secrets.

2. If no PostgreSQL is reachable, `docker compose up -d` from the repo root starts a local one matching `.env.example` (requires Docker; Lucas develops against a hosted Railway DB, so his own `.env` won't need this).

3. If this is the first run, or the user mentions schema/migration errors, or the database looks empty (e.g. `GET /countries` returns no results once the API is up), run from the repo root:
   ```
   npm run db:setup
   ```
   (= `prisma migrate deploy && prisma db seed` in `apps/api`; the seed is `prisma/seed-all.ts`, which chains countries then criteria, and is idempotent). Ask before running it against a database that isn't a fresh local one, since it writes.

## Starting the servers

From the repo root, `npm run dev` starts both apps concurrently (`dev:api` + `dev:front`). Prefer starting them so their logs stay inspectable:

- Run `npm run dev` via Bash with `run_in_background: true`, or start `dev:api` and `dev:front` separately if you need to watch one in isolation.
- If you need to interact with the front in the Browser pane (visual check, clicking through a flow), use `mcp__Claude_Browser__preview_start` instead of Bash for the front process. If `.claude/launch.json` doesn't have a front entry yet, create one:
  ```json
  {
    "version": "0.0.1",
    "configurations": [
      { "name": "front", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev:front"], "port": 5173 }
    ]
  }
  ```
  The API itself has no browser UI, so keep it on plain Bash/`run_in_background`.

## Reporting back

Once both are up, tell the user:
- Front: http://localhost:5173
- API: http://localhost:3000/api/v1
- Swagger docs: http://localhost:3000/api/docs

If either process fails to start, read its output before retrying — a Prisma client out of sync (`npx prisma generate`) and a missing/wrong `.env` are the two most common causes in this repo.
