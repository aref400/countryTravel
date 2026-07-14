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

   If `apps/api/.env` is missing, tell the user which variables are required and stop — do not invent secrets or a database URL.

2. If this is the first run, or the user mentions schema/migration errors, run migrations from `apps/api`:
   ```
   npx prisma migrate dev
   ```
   If the database looks empty (e.g. `GET /countries` returns no results once the API is up), offer to run the seed scripts (`apps/api/prisma/seed.ts`, `seed-all.ts`, `seed-criteria.ts`) — ask before seeding, since it writes to the database.

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
