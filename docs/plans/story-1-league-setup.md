# Plan: Story 1 — coordinator sets up a league (divisions, venues, time slots)

## Context

HW4 Part 2 needs one real P3 feature built Explore → Plan → Implement → Commit in the Fixture repo (`Project 3/fixture/`). Story 1 in `docs/PRD.md` is the base every later story needs: the generator (story 3) can only run on leagues, divisions, venues and time slots stored in Postgres. The pure scheduling functions from Part 3 (`src/domain/round-robin.ts`, `standings.ts`, `fairness.ts`) stay untouched.

Explore findings that shape the plan:
- Next 16.4.6 with `cacheComponents: true`: a dynamic route's `params` is runtime data, so the page must read it inside `<Suspense>` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`, "With Cache Components"). Same for DB reads.
- After a mutating Server Action, call `refresh()` from `next/cache`; `redirect()` throws, so nothing after it runs (`01-getting-started/07-mutating-data.md`).
- Server Actions are public POST endpoints: each validates its own input with zod.
- React 19 resets a `<form action>` after the action; forms that must keep values on error submit from `onSubmit` with `startTransition(() => action(data))` (lesson from the ShiftSafe prototype, `Project 3/shiftsafe/src/app/schedule/add-shift-form.tsx`).
- Prisma 7 needs `@prisma/adapter-pg` and `prisma.config.ts`; `Project 3/shiftsafe/` (`prisma.config.ts`, `src/server/db.ts`, `tests/integration/setup.ts`) has a working pattern to copy. Local wall-clock → UTC conversion: reuse `localDateTime` from `shiftsafe/src/domain/week.ts`.

## Scope

In: League, Division, Venue, TimeSlot tables; create a league; add divisions, venues and time slots to it; a setup page listing them. A time slot ends after it starts and can't overlap another slot at the same venue.
Out (later stories): teams and blackout dates (story 2), generation (3), auth and roles (until then the pages run locally only).

## Changes

| File | Change |
|---|---|
| `package.json` | add `prisma`, `@prisma/client`, `@prisma/adapter-pg` 7.10.1; scripts `db:migrate`, `postinstall: prisma generate`; `overrides.effect` 3.22.5 (audit fix found in ShiftSafe) |
| `prisma.config.ts`, `src/server/db.ts`, `tests/integration/setup.ts`, `.env.example` | copied from ShiftSafe; DB URLs on port 5434 |
| `prisma/schema.prisma` | `League { id, name, timeZone @default("America/Vancouver") }`, `Division { leagueId, name }`, `Venue { leagueId, name }`, `TimeSlot { venueId, startsAt, endsAt }` with index `(venueId, startsAt)`; cascade deletes |
| `src/domain/local-time.ts` | `localDateTime(date, time, tz)` copied from ShiftSafe, with its unit tests |
| `src/server/leagues.ts` | `createLeague`, `addDivision`, `addVenue`, `addTimeSlot` (zod; end after start; venue belongs to the league; overlap check `startsAt < newEnd AND endsAt > newStart` inside a transaction), `getLeagueSetup(leagueId)`; `LeagueInputError` for user-facing messages |
| `src/app/leagues/new/page.tsx` + action | form for name → `createLeague` → `redirect` to the setup page |
| `src/app/leagues/[leagueId]/page.tsx` | `<Suspense>` around a component that awaits `params` and shows divisions, venues, and slots grouped by venue in local time |
| `src/app/leagues/[leagueId]/actions.ts`, `setup-forms.tsx` | three small client forms (division, venue, slot) using the `onSubmit` pattern and `useActionState`; actions call `src/server/leagues.ts` then `refresh()` |
| `src/app/page.tsx`, `layout.tsx` | link to "New league"; title "Fixture" |
| `tests/integration/leagues.test.ts` | round trip; rejects end ≤ start; rejects a venue from another league; rejects an overlapping slot at the same venue; allows the same time at another venue; allows back-to-back slots (end == next start) |
| `tests/e2e/league-setup.spec.ts`, `playwright.config.ts` | create a league, add a venue and a slot, then an overlapping slot shows the error and keeps the entered values |
| `CLAUDE.md` | database commands; form and E2E notes |

## Commits

1. `docs: plan story 1 league setup` (copy of this plan to `docs/plans/story-1-league-setup.md`)
2. `chore: add Prisma 7 with Postgres adapter and league schema`
3. `feat: read form dates and times in the league's time zone`
4. `test: league setup server functions` → `feat: create leagues with divisions, venues and time slots` (integration tests red, then green)
5. `feat: league setup pages`
6. `test: E2E for league setup and overlapping slot`
7. `docs: CLAUDE.md commands and notes for the database and forms`

## Verification

- `docker compose up -d db`, create `fixture_test`, `npm run db:migrate`, migrate the test DB
- `npm run test`, `npm run test:integration`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit` all pass
- `npm run test:e2e` passes; open `http://localhost:3200/leagues/new`, set up a league in the browser, screenshot for the HW4 log
