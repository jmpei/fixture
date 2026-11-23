# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, Next.js core-web-vitals + TypeScript rules)

No test runner is configured yet.

## Architecture

- Next.js 16.4.6 App Router with React 19.3 and TypeScript (strict). Source lives in `src/`; `@/*` maps to `src/*`.
- `next.config.ts` enables `cacheComponents` and `partialPrefetching`, and loads Tailwind CSS v4 through the `@tailwindcss/turbopack` loader instead of PostCSS.
- `src/app/layout.tsx` sets up the Geist fonts; `src/app/page.tsx` is the starter page.
- This Next.js version differs from older releases: read the matching guide in `node_modules/next/dist/docs/` before writing Next.js code (see `AGENTS.md`).
