# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Fixture schedules university intramural leagues. A coordinator sets up divisions, venues and time slots, generates a fair round-robin season, and reschedules only the affected games when something is cancelled. Captains report scores; anyone can view schedules and standings without signing in.

@docs/PRD.md
@docs/league-rules.md
@AGENTS.md

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` (http://localhost:3200; ports 3000 and 3100 are taken on the main dev machine) |
| Production build | `npm run build`, then `npm run start` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests | `npm run test` |
| Integration tests (needs the local database) | `npm run test:integration` |
| One test file | `npx vitest run tests/unit/round-robin.test.ts` |
| One test by name | `npx vitest run -t "pairs every team with every other team once"` |
| E2E tests (starts or reuses the dev server) | `npm run test:e2e` |
| Local database | `docker compose up -d db` (host port 5434); first time: `cp .env.example .env`, create `fixture_test`, then `npm run db:migrate` |
| Migrate the test database | `DATABASE_URL=<TEST_DATABASE_URL> npx prisma migrate deploy` |

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.4.6, App Router, React 19.3, TypeScript strict |
| Styling | Tailwind CSS v4 through the Turbopack loader in `next.config.ts` (no `tailwind.config`) |
| Database | PostgreSQL 17 (Docker locally, Neon in production) through Prisma 7.10.1 with `@prisma/adapter-pg` |
| Dates | `date-fns` 4 with `@date-fns/tz` |
| Validation | zod |
| Tests | Vitest (unit and integration), Playwright (E2E) |
| Hosting | Vercel |

## Architecture decisions

| Decision | Why |
|---|---|
| Scheduling and standings live in `src/domain/` as pure functions over plain data (team IDs, local dates, scores); no Prisma, no `Date.now()`, no I/O | They are the core of the product; pure functions test fast and exactly against `docs/league-rules.md` |
| Database access lives only in `src/server/`; pages and Server Actions call `src/server/`, never Prisma directly | One place to enforce who may change what |
| Rule checks take local `YYYY-MM-DD` dates and `HH:mm` times; conversion to UTC happens only in `src/server/` and the UI | Back-to-back and late-game rules are about the local calendar; keeping offsets out of the domain avoids DST bugs |
| Store timestamps in UTC with the league's time zone on the `League` row | One league, one time zone; display and rule input convert at the edge |
| Reschedule proposals are drafts until the coordinator approves them | Story 4 requires that nothing changes publicly without approval |
| The plain-English change (story 8) asks an LLM only to turn text into a structured change; the same reschedule code then runs on it | The model never writes to the database, and its output is validated with zod like any other input |
| Schedules and standings pages are public and read-only | Story 7: anyone can view them without signing in |

## Conventions

- Rule checks return a list of violations `{ ruleId, message }`; an empty list means the schedule follows the rule. `ruleId` is an ID from `docs/league-rules.md`.
- Name a domain file and its test after what it does: `src/domain/round-robin.ts` and `tests/unit/round-robin.test.ts`.
- Teams are referred to by ID inside `src/domain/`; names are looked up only for display.
- Before writing Next.js code, read the matching guide in `node_modules/next/dist/docs/` (this version differs from older Next.js).
- Cache Components is on: wrap any component that reads the database, `params` or `searchParams` in `<Suspense>`, and call `refresh()` from `next/cache` at the end of a Server Action that changes data.
- Forms for Server Actions use `ActionForm` (`src/app/action-form.tsx`): it submits from `onSubmit` so React 19 doesn't reset a rejected entry, and remounts empty after a save.
- Server Actions throw `LeagueInputError` (from `src/server/`) for messages the user may see; anything else is a bug and is rethrown.
- In E2E tests, wait for `networkidle` before typing: before hydration a form posts natively and comes back with server defaults.
- tzdata 2026e moved `America/Vancouver` to permanent UTC-7 on 2026-03-08, so tests must not assume PST.

## Testing strategy

- TDD for every rule and every server function: commit the failing test first (`test(red): …`), then the minimum code to pass (`feat(green): …`), then any cleanup (`refactor: …`). Never edit a red test in the green commit.
- Each rule test names its rule ID and covers both sides of every boundary (a 21:00 game is late, 20:59 is not).
- Unit tests (`tests/unit/`) cover `src/domain/`; integration tests (`tests/integration/`) run `src/server/` against the Docker Postgres; Playwright covers the coordinator's main flows.

## Do

- Add a new rule by first adding its row to `docs/league-rules.md`.
- Keep commits small and named by type: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.

## Don't

- Don't edit a migration under `prisma/migrations/` once committed; add a new one.
- Don't read or print `.env` values; use `.env.example` for names.
- Don't `git push`; the owner pushes after review.
- Don't invent a scheduling rule or tiebreaker that isn't in `docs/league-rules.md`.

## Security (OWASP Top 10)

- Broken access control (A01): every write in `src/server/` checks the caller's role for that league; public pages only read published data.
- Injection (A03): all database access goes through Prisma; no raw SQL with interpolated input. LLM output is parsed with zod before use.
- Secrets: live in Vercel and `.env` only; never in code or prompts.
- Vulnerable components (A06): `npm audit` runs in CI.
