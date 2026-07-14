---
name: countrytravel-new-feature
description: Scaffold a new product feature in CountryTravel end-to-end (Prisma model, NestJS module, React feature folder, tests, recette doc) following this repo's existing conventions. Use this whenever the user asks to add, build, or implement a new feature or module in CountryTravel — e.g. "ajoute la fonctionnalité reviews", "implémente le système d'amis/friendships", "je veux une carte des pays", "commence le module admin" — or references a CT-018+ roadmap ticket. Don't reinvent the module layout from scratch; this skill encodes the pattern already used by the `countries` and `recommendations` features.
---

## Why this exists

Every feature in this repo (see `apps/api/src/countries`, `apps/api/src/recommendations`, `apps/front/src/features/countries`) follows the same shape. Reusing it keeps the codebase consistent and keeps the certification deliverable (cahier de recettes) honest — a feature isn't "done" here until its test scenarios are documented, not just implemented.

This repo's `CLAUDE.md` also asks for a **teaching-mode** interaction style on React/TS work: walk through this step by step with the user rather than dumping the whole feature at once. Use the order below as your checkpoints — pause after each one if the user seems to want to follow along rather than just get the result.

## Step 1 — Data model (only if the feature needs new persisted data)

Add/extend models in `apps/api/prisma/schema.prisma`:
- snake_case table name via `@@map("...")`
- relations wired to `User`/`Country` following the existing pattern (`onDelete: Cascade` on the child side, `@@index` on foreign keys)

Then generate a migration:
```
npx prisma migrate dev --name <short_description>
```
Show the user the schema diff before running the migration — it's a structural change worth a sanity check.

## Step 2 — Backend module (`apps/api/src/<feature>/`)

Create, following `countries` or `recommendations` as the template:
- `<feature>.module.ts`
- `<feature>.controller.ts` — Swagger decorators (this repo exposes `/api/docs`), route prefix is applied globally (`/api/v1`)
- `<feature>.service.ts`
- `dto/` — one DTO class per request/response shape, every field decorated with `class-validator` decorators. The global `ValidationPipe` is `whitelist + forbidNonWhitelisted + transform`, so an undecorated or extra field gets rejected, not ignored — don't skip decorating a field because "it's obviously a string."
- Co-located `*.controller.spec.ts` and `*.service.spec.ts` (Jest) — mirror the existing spec files' mocking style for `PrismaService`.

Register the module in `apps/api/src/app.module.ts`.

## Step 3 — Frontend feature (`apps/front/src/features/<feature>/`)

- `components/` — presentational, functional components only, typed props, small and composable
- `services/` — API calls (mirror `recommendations/services/recommendations.service.ts`)
- `hooks/` — business/state logic pulled out of components (mirror `recommendations/hooks/useRecommendations.ts`)
- `types.ts`, `constants.ts` as needed
- If the feature owns its own routes/pages (like `features/auth`), add a `pages/` subfolder and a `<feature>.routes.tsx`; otherwise add a page under `apps/front/src/pages/`

Keep to this repo's standing conventions (see `CLAUDE.md`): strict typing, no prop drilling, accessibility basics (ARIA/semantic HTML) — this is also an open certification gap (C2.2.3), so don't add to the deficit.

## Step 4 — Tests

- Backend: Jest specs alongside the module (already required by Step 2)
- Frontend: Vitest + `@testing-library/react`, colocated as `*.test.ts(x)` next to the hook/service/component it covers (see `recommendations/hooks/useRecommendations.test.ts` for the pattern)

## Step 5 — Update the recette doc

Add new scenarios for this feature to `docs/cahier-recettes.md`, following its existing table format (ID prefix, scenario, préconditions, étapes, résultat attendu, statut ⏳). If the work surfaces or fixes a bug along the way, log it in `docs/plan-correction-bogues.md` too, cross-linked to the relevant scenario ID.

Don't create a roadmap ticket for the recette/doc update itself — it's part of shipping the feature, not separate quality work.
