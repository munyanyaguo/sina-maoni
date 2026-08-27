# Sina Maoni — Build Plan

**Solo build · 4 hrs/day · Next.js web + React Native mobile + Tauri desktop**
**490 working days ≈ 16.3 months**

Tick each box as it is completed. One PR per checked group.

---

## Stack Decisions (locked)

### Monorepo

| Tool                | Choice                                 |
| ------------------- | -------------------------------------- |
| Workspace manager   | pnpm 11 workspaces                     |
| Build orchestration | Turborepo 2                            |
| Language            | TypeScript 5.9 strict                  |
| Runtime             | Node 22 LTS (pnpm 11 requires ≥ 22.13) |
| Linting             | ESLint 9 flat config                   |
| Formatting          | Prettier 3                             |
| Git hooks           | Husky + lint-staged                    |

### Backend API

| Layer            | Choice                                                      |
| ---------------- | ----------------------------------------------------------- |
| Framework        | Fastify v5                                                  |
| ORM              | Drizzle ORM                                                 |
| Database         | PostgreSQL 16 (Docker local, managed PG in prod)            |
| Auth             | Self-issued JWT behind a swappable `AuthProvider` interface |
| Authorization    | App-level policy layer (no Supabase RLS)                    |
| API docs         | @fastify/swagger + Scalar                                   |
| Logging          | Pino                                                        |
| Error tracking   | Sentry (Node)                                               |
| Job queue        | BullMQ + Redis                                              |
| Rules engine     | axe-core, wrapped in our own service                        |
| Headless browser | Playwright                                                  |
| Validation       | Zod, shared via `packages/core`                             |

### Web

| Layer         | Choice                |
| ------------- | --------------------- |
| Framework     | Next.js 15 App Router |
| Styling       | Tailwind CSS v4       |
| Components    | shadcn/ui             |
| State         | Zustand               |
| Data fetching | TanStack Query        |
| Charts        | Recharts              |
| Forms         | React Hook Form + Zod |
| E2E           | Playwright            |
| Unit          | Vitest                |

### Other surfaces

| Surface   | Choice                                                                                 |
| --------- | -------------------------------------------------------------------------------------- |
| Extension | WXT + React + Tailwind (Chrome, Edge, Firefox)                                         |
| Mobile    | React Native + Expo SDK 52, Expo Router v3, NativeWind v4, React Native Paper, Maestro |
| Desktop   | Tauri v2 + Vite/React shell, `windows-rs` / `atspi` for Phase 7B                       |
| CI/CD     | GitHub Actions, Turborepo remote cache, Docker, Fly.io, Vercel, EAS Build              |

**React versions:** web / desktop / extension run React 19. Mobile is pinned to React 18.3.1 by Expo 52. Shared React components must not be imported into mobile until Expo ships React 19.

---

## Monorepo Structure

```
sina-maoni/
├── apps/
│   ├── web/                    # Next.js 15 dashboard
│   ├── api/                    # Fastify v5 backend
│   ├── extension/              # WXT browser extension
│   ├── mobile/                 # React Native + Expo
│   └── desktop/                # Tauri v2
├── packages/
│   ├── core/                   # Shared domain types, Zod schemas, env validation
│   ├── db/                     # Drizzle schema + migrations
│   ├── rules-engine/           # axe-core wrapper + custom rules
│   ├── ui/                     # Shared React components (web)
│   ├── config-eslint/
│   ├── config-typescript/
│   └── config-tailwind/
├── tooling/
│   └── ci/                     # @sina-maoni/ci npm package
├── .github/workflows/
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Database Schema

Postgres + Drizzle. Authorization enforced in the API policy layer, plus foreign keys and
unique constraints at the DB level.

```
organizations         (id, name, slug, plan, timestamps)
users                 (id, email, name, password_hash, email_verified_at, timestamps)
organization_members  (organization_id, user_id, role)            PK(org, user)
projects              (id, organization_id, name, slug, default_url, target_wcag_level, archived_at)
project_members       (project_id, user_id, role)                 PK(project, user)
api_keys              (id, organization_id, name, prefix, hashed_key, last_used_at, revoked_at)

rules                 (id, engine, description, help, help_url, default_impact,
                       wcag_level, wcag_criteria[], tags[])
scans                 (id, project_id, triggered_by_id, root_url, source, status, wcag_level,
                       commit_sha, branch, pull_request_url, started_at, finished_at, error_message)
scan_pages            (id, scan_id, url, title, status_code, duration_ms)
findings              (id, scan_id, scan_page_id, rule_id, impact, status, selector,
                       html, failure_summary, fingerprint, metadata)

issues                (id, project_id, rule_id, title, description, status, impact,
                       assignee_id, external_url, due_at, resolved_at)
issue_findings        (issue_id, finding_id)                      PK(issue, finding)

audits                (id, project_id, auditor_id, name, status, wcag_level,
                       started_at, completed_at)
audit_items           (id, audit_id, criterion, level, result, conformance, notes, is_manual)
```

---

## Phase 0 — Foundation & CI/CD Architecture

**Days 1–20 · 80 hrs**

### Days 1–3: Monorepo scaffold

- [x] `pnpm-workspace.yaml` covering `apps/*`, `packages/*`, `tooling/*`
- [x] `allowBuilds` / `onlyBuiltDependencies` allowlist for dependency build scripts
- [x] `turbo.json` with `dev`, `build`, `lint`, `test`, `type-check` tasks
- [x] Root `package.json` with shared dev dependencies and Node 22 engine
- [x] All `apps/` and `packages/` directories with valid `package.json` files
- [x] Shared `tsconfig.base.json` + `library.json` / `react.json` / `nextjs.json`
- [x] Shared ESLint flat config in `packages/config-eslint`
- [x] Shared Prettier config + `.prettierignore` at root
- [x] Shared Tailwind v4 theme in `packages/config-tailwind`
- [x] `docker-compose.yml` with Postgres 16
- [x] Husky + lint-staged wired via `.husky/pre-commit`
- [x] `pnpm install` completes with zero errors
- [x] `pnpm lint:repo` passes
- [x] `pnpm type-check:repo` passes
- [x] `pnpm test:repo` passes
- [x] `pnpm build:repo` passes
- [x] `pnpm format:check` passes
- [x] Lockfile committed

### Days 4–6: GitHub Actions CI pipeline

- [x] `ci.yml` triggers on push to all branches and on PRs
- [x] Node 22 + pnpm via `packageManager` field
- [x] Postgres 16 service container
- [x] Steps: install → format → lint → type-check → test → build
- [x] Separate `pnpm audit --audit-level high` job
- [x] Concurrency group cancels superseded runs
- [x] `deploy-api.yml` gated to manual dispatch until Phase 1
- [x] `deploy-web.yml` gated to manual dispatch until Phase 3
- [x] First CI run is green on GitHub
- [ ] Branch protection on `main`: CI required before merge
- [ ] Turborepo remote cache enabled (`TURBO_TOKEN`, `TURBO_TEAM`)
- [x] Repository secrets created

### Days 7–10: Database + Drizzle setup

- [x] `packages/db` with Drizzle ORM + `postgres` driver + `drizzle-kit` + `tsx`
- [x] Full schema in `schema.ts`: 14 tables, enums, FKs, indexes, relations
- [x] Inferred `$inferSelect` / `$inferInsert` types exported
- [x] `drizzle.config.ts` reading `DATABASE_URL`
- [x] `client.ts` with pooled and single-connection factories
- [x] Seed script with demo org, user, project, scan, findings
- [x] `pnpm db:up` starts Postgres
- [x] `pnpm db:generate` produces a migration
- [x] `pnpm db:migrate` applies cleanly to an empty database
- [x] `pnpm db:seed` runs successfully
- [x] `pnpm db:studio` opens
- [x] Migration files committed

### Days 11–13: Shared core package

- [x] `packages/core` with Zod
- [x] Shared enums: `WcagLevel`, `Impact`, `ScanSource`, `ScanStatus`, `FindingStatus`, `IssueStatus`
- [x] Scan contracts: `createScanRequestSchema`, `scanResultSchema`, `findingSchema`
- [x] Scoring helpers: `calculateScore`, `countByImpact`, `shouldFailBuild` + unit tests
- [ ] Zod schemas mirroring every remaining DB table
- [ ] Shared types: `Organization`, `Project`, `User`, `Scan`, `Finding`, `Issue`, `Audit`
- [ ] Role and plan enums shared with the API

### Days 14–17: Environment and secrets management

- [x] `.env.example` at root documenting every variable
- [ ] `packages/core/env.ts` — Zod-validated env schema, fails fast at startup
- [ ] Per-app `.env` loading wired through `packages/core`
- [ ] GitHub Actions secrets: `DATABASE_URL`, `JWT_SECRET`, `FLY_API_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SENTRY_DSN`, `TURBO_TOKEN`, `TURBO_TEAM`
- [ ] Secret rotation procedure written down

### Days 18–20: Architecture documentation

- [ ] `docs/architecture.md` — system diagram, data flow, auth flow
- [ ] `docs/contributing.md` — local setup, branch strategy, commit conventions
- [ ] `CHANGELOG.md` in Conventional Commits format
- [ ] ADR per major stack choice (Postgres over Supabase, Fastify over Next API routes, Tauri over Electron, source-only workspace packages)

**Phase 0 exit criteria**

- [ ] `pnpm turbo run build test lint type-check` passes from repo root
- [ ] A PR from a feature branch triggers CI and requires passing checks before merge
- [ ] Database migrates cleanly from empty
- [ ] `pnpm dev` starts every app

---

## Phase 1 — Core API Backend

**Days 21–70 · 200 hrs**

### Days 21–25: Fastify v5 server bootstrap

- [ ] `apps/api` Fastify v5 app with `tsup` bundling
- [ ] Plugins: `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `@fastify/swagger`
- [ ] Scalar UI for API docs at `/docs`
- [ ] Pino structured logging
- [ ] Sentry integration
- [ ] `GET /health` with a real DB ping
- [ ] Graceful shutdown on SIGINT/SIGTERM
- [ ] `Dockerfile` + local `docker-compose` service for API + Redis

### Days 26–33: Authentication

- [ ] `AuthProvider` interface in `packages/core` so the implementation stays swappable
- [ ] JWT issue / verify / refresh with rotating refresh tokens
- [ ] Password hashing with argon2
- [ ] Email verification and password reset token flows
- [ ] Google OAuth authorization-code flow
- [ ] Fastify `preHandler` decorator attaching `request.user`

### Days 34–42: Organizations and Projects API

- [ ] Full CRUD for organizations, org members, projects, project members
- [ ] Zod validation on every body, query and param
- [ ] Authorization policy layer enforcing org and project roles
- [ ] API key issue / revoke endpoints
- [ ] Vitest: 80%+ coverage on route handlers

### Days 43–58: Scans, Findings and Issues API

- [ ] `POST /v1/projects/:projectId/scans` enqueues a BullMQ job
- [ ] `GET /v1/projects/:projectId/scans` with pagination
- [ ] `GET /v1/scans/:scanId/findings` with filters
- [ ] `PATCH /v1/findings/:findingId` status updates
- [ ] `GET /v1/projects/:projectId/issues` with filters
- [ ] `PATCH /v1/issues/:issueId` status and assignee
- [ ] BullMQ worker: dequeue → scan → persist findings → group into issues → mark complete
- [ ] Redis connection and health check

### Days 59–65: Rules configuration API

- [ ] `rule_configs` table and migration
- [ ] List all rules with per-project config
- [ ] Enable / disable per rule per project
- [ ] Severity override
- [ ] Seed axe-core rule IDs with WCAG mappings

### Days 66–70: API hardening

- [ ] Rate limiting per IP and per authenticated user
- [ ] Consistent error shape `{ error: { code, message, details } }`
- [ ] `/v1/` versioning prefix on every route
- [ ] Integration test suite against the CI Postgres service
- [ ] Postman collection exported from Swagger

**Phase 1 exit criteria**

- [ ] Every endpoint documented in Swagger UI
- [ ] Authenticated user can create org → project → trigger scan → view findings
- [ ] API test suite runs in under 90 seconds in CI

---

## Phase 2 — Rules Engine Service

**Days 71–95 · 100 hrs**

### Days 71–78: axe-core wrapper

- [ ] `packages/rules-engine` with axe-core and `@axe-core/playwright`
- [ ] `RulesEngineService`: URL + rule config + viewport in, normalized findings out
- [ ] WCAG success-criterion lookup table from axe tags
- [ ] Stable finding fingerprint for cross-scan de-duplication
- [ ] Unit tests on result mapping

### Days 79–87: Playwright scanning engine

- [ ] `PageScanner`: navigate → inject axe → wait for idle → analyse → return
- [ ] Auth-gated pages via injected cookies
- [ ] SPA support: wait for hydration before scanning
- [ ] Timeout and crash handling with guaranteed browser teardown
- [ ] Multi-page crawl up to `maxPages`

### Days 88–92: Custom rule framework

- [ ] `CustomRule` interface extending the axe shape
- [ ] Rule registry pattern
- [ ] Starter rules: touch target size 44×44, duplicate page titles, lang attribute validity

### Days 93–95: Worker integration

- [ ] Worker flow: running → scan → persist → group → completed/failed
- [ ] 3 retries with exponential backoff
- [ ] Failure details surfaced on the scan record

**Phase 2 exit criteria**

- [ ] A scan on a real URL produces findings in the DB within 60 seconds
- [ ] Custom rules run alongside axe-core rules
- [ ] Failed scans retry and surface error details

---

## Phase 3 — Web Dashboard

**Days 96–185 · 360 hrs**

### Days 96–101: Next.js bootstrap

- [ ] App Router, strict TypeScript, Tailwind v4, shadcn/ui
- [ ] API client generated from the OpenAPI schema
- [ ] Middleware protecting `/dashboard/*`
- [ ] Import types from `packages/core` — no redefinition in web

### Days 102–110: Auth flows

- [ ] Email/password sign-up and sign-in
- [ ] Google OAuth
- [ ] Email confirmation and password reset
- [ ] HTTP-only cookie session, SSR-compatible
- [ ] Refresh token rotation on the client

### Days 111–120: Organization + Project management

- [ ] Org home, project list, org settings
- [ ] Member management with role changes
- [ ] Create project form
- [ ] Project settings: URL, WCAG level, rules config
- [ ] API key management UI

### Days 121–138: Scan runner and findings UI

- [ ] Run scan button with optimistic UI
- [ ] Live scan status polling
- [ ] Findings list filtered by impact, WCAG SC, rule, status
- [ ] Finding card: selector, snippet, help text, WCAG badge
- [ ] Bulk status actions
- [ ] Finding detail drawer with remediation guidance

### Days 139–152: Issues and issue tracking

- [ ] Issues list grouped by rule, sortable by impact / count / age
- [ ] Issue detail: linked findings, activity log, assignee, status timeline
- [ ] Status workflow Open → In Progress → Fixed → Verified

### Days 153–165: Analytics dashboard

- [ ] Overview cards: total issues, critical count, scan count, pass rate
- [ ] Trend chart of issues over time
- [ ] WCAG coverage chart
- [ ] Impact breakdown chart
- [ ] Per-rule violation leaderboard

### Days 166–176: Rules configuration UI

- [ ] Rules table with enable toggle and severity override
- [ ] WCAG level filter
- [ ] CI threshold settings

### Days 177–185: Polish, a11y, deployment

- [ ] Dogfood: dashboard passes its own axe-core scan with zero violations
- [ ] WCAG 2.1 AA: skip nav, landmarks, keyboard nav, focus management
- [ ] Mobile responsive layout
- [ ] Dark mode
- [ ] Loading skeletons and error boundaries
- [ ] Sentry browser SDK
- [ ] axe-core Playwright check added to CI as a required job
- [ ] `deploy-web.yml` switched from manual to push-on-main
- [ ] Vercel production deployment

**Phase 3 exit criteria**

- [ ] Full end-to-end flow works in production
- [ ] Dashboard passes its own axe-core scan with zero violations
- [ ] Playwright e2e covers the happy path
- [ ] Version tagged `1.0.0`

---

## Phase 4 — CI/CD Integration Package

**Days 186–215 · 120 hrs**

### Days 186–196: `@sina-maoni/ci` package

- [ ] CLI `sina-maoni scan --project-id <id> --url <url> --token <token>`
- [ ] `sina-maoni.config.json` config file
- [ ] Sends `source: "ci"` with commit SHA and branch
- [ ] Polls until complete, prints a summary table
- [ ] Exits 1 on threshold violations
- [ ] Writes `sina-maoni-report.json` for artifact upload

### Days 197–205: GitHub Actions integration

- [ ] Official reusable workflow template
- [ ] Runs on PR against the preview deployment URL
- [ ] Posts a PR comment with the findings summary
- [ ] Fails the check on threshold violations
- [ ] `action.yml` published to GitHub Marketplace

### Days 206–210: GitLab CI + generic CI

- [ ] `.gitlab-ci.yml` template
- [ ] CircleCI config snippet
- [ ] Env-var-only configuration path for any CI

### Days 211–215: Documentation + publish

- [ ] `docs/ci-integration.md`
- [ ] Threshold configuration reference
- [ ] Flip `private: false` and publish to npm

**Phase 4 exit criteria**

- [ ] A PR on a real repo fails due to a critical a11y issue
- [ ] The PR receives a comment linking to the dashboard
- [ ] Package published to npm

---

## Phase 5 — Browser Extension

**Days 216–260 · 180 hrs**

### Days 216–222: WXT setup

- [ ] TypeScript + React + Tailwind shared from the monorepo
- [ ] Background service worker, content script, popup, sidebar entrypoints

### Days 223–235: Core scanning UI

- [ ] Scan this page from the popup
- [ ] Full findings list in the sidebar
- [ ] Content script injects axe-core and posts to the background worker
- [ ] Background worker calls the API with `source: "extension"`
- [ ] Element highlight overlay on finding click

### Days 236–245: Platform sync

- [ ] OAuth flow from the popup
- [ ] Findings create real records via the API
- [ ] Issue status changes sync to the dashboard
- [ ] Open in dashboard button per finding

### Days 246–252: Extension-specific features

- [ ] DevTools panel integration
- [ ] Re-scan on SPA route change
- [ ] Keyboard shortcut to toggle the sidebar

### Days 253–260: Build and publish

- [ ] CI builds signed `.zip` for Chrome and Firefox
- [ ] Chrome Web Store submission
- [ ] Firefox Add-ons submission

**Phase 5 exit criteria**

- [ ] Extension scan appears in the dashboard within 5 seconds
- [ ] Status changes sync bidirectionally
- [ ] Installable from the Chrome Web Store

---

## Phase 6 — Mobile App

**Days 261–360 · 400 hrs**

### Days 261–270: Expo bootstrap

- [ ] Resolve pnpm/Metro module resolution (Expo needs hoisted linking or equivalent) so
      `expo export` works from the workspace — mobile has no bundler build until this is done
- [ ] Expo Router v3 + NativeWind v4
- [ ] EAS Build profiles: development, preview, production
- [ ] GitHub Actions triggers EAS build on push to `main`
- [ ] Sentry React Native SDK

### Days 271–282: Auth flows

- [ ] Email/password and Google OAuth via `AuthSession`
- [ ] `expo-secure-store` token storage
- [ ] Session persists across restarts

### Days 283–298: Core screens

- [ ] Home, project list, project detail
- [ ] Scan list and scan detail
- [ ] Findings list with filters, finding detail
- [ ] Issue detail with assign and status change
- [ ] Settings: account, notifications, sign out

### Days 299–318: Mobile accessibility scanner

- [ ] Hidden WebView scanner injecting axe-core
- [ ] Native checks via `react-native-accessibility-info`
- [ ] Touch target, missing label and contrast checks
- [ ] Results posted with `source: "mobile_app"`

### Days 319–330: Push notifications

- [ ] Expo Notifications + EAS push
- [ ] Notify on scan complete and critical issue assignment
- [ ] Notification preferences screen

### Days 331–340: App accessibility audit

- [ ] Full VoiceOver pass on iOS
- [ ] Full TalkBack pass on Android
- [ ] Dynamic type support
- [ ] Reduced motion support
- [ ] High contrast support

### Days 341–350: Polish

- [ ] App icon, splash screen, onboarding
- [ ] Offline error handling and empty states
- [ ] TestFlight build
- [ ] Android Internal Testing build

### Days 351–360: Beta and submission

- [ ] Triage Sentry crash reports
- [ ] Performance profiling on low-end Android
- [ ] App Store submission
- [ ] Play Store submission

**Phase 6 exit criteria**

- [ ] App live in TestFlight and Android Internal Testing
- [ ] Mobile scan creates findings visible in the web dashboard
- [ ] App passes manual VoiceOver and TalkBack audits

---

## Phase 7A — Desktop App

**Days 361–420 · 240 hrs**

### Days 361–368: Tauri v2 setup

- [ ] Vite + React shell embedding the dashboard
- [ ] System tray: Open, Run scan, Quit
- [ ] Auto-updater plugin
- [ ] GitHub Actions builds for macOS, Windows, Linux

### Days 369–382: Desktop-specific features

- [ ] Local HTML folder scanning without a live server
- [ ] `localhost` scanning without a public URL
- [ ] Tray notification on scan complete
- [ ] Global hotkey to scan the frontmost browser window

### Days 383–395: Native shell integration

- [ ] macOS menu bar, Windows tray, Linux AppIndicator
- [ ] Native file picker for local scanning
- [ ] OS toast notifications

### Days 396–410: Packaging and distribution

- [ ] Code-signed macOS `.dmg`
- [ ] Code-signed Windows NSIS installer
- [ ] Linux AppImage and `.deb`
- [ ] GitHub Releases carrying all three platforms
- [ ] Auto-update endpoint served by the API

### Days 411–420: Polish

- [ ] `sina-maoni://` deep link protocol handler
- [ ] Offline mode caching the last scan results
- [ ] Preferences window

**Phase 7A exit criteria**

- [ ] Installed on all three platforms from GitHub Releases
- [ ] Local HTML folder scan produces dashboard findings
- [ ] Auto-update delivers a new version without reinstalling

---

## Phase 7B — OS Accessibility Tree Inspection

**Days 421–450 · 120 hrs**

Start only when a paying client explicitly requires it.

- [ ] Windows UIA via the `windows-rs` crate
- [ ] macOS NSAccessibility via an Objective-C bridge in the Tauri Rust layer
- [ ] Linux AT-SPI via the `atspi` crate
- [ ] Native accessibility tree snapshot mapped to the `findings` schema
- [ ] Scanning of native desktop apps (Electron, .NET WinForms, SwiftUI)

---

## Phase 8 — VPAT/ACR and Consulting Features

**Days 451–490 · 160 hrs**

### Days 451–462: Conformance snapshots

- [ ] Per-criterion status: supports / partially supports / does not support / N/A
- [ ] Auto-populate from current issue statuses
- [ ] Manual override per criterion with notes and evidence URL
- [ ] Snapshot history

### Days 463–475: VPAT/ACR generator

- [ ] VPAT 2.4 template: Section 508, WCAG 2.1 AA, EN 301 549
- [ ] Generate a filled DOCX from a conformance snapshot
- [ ] Shareable public conformance page
- [ ] Manual review step before export

### Days 476–485: Audit import

- [ ] CSV/JSON import mapping to `audit_items`
- [ ] Support WAVE, Deque WorldSpace and spreadsheet formats
- [ ] Imported findings appear in issues and conformance snapshots

### Days 486–490: Client portal

- [ ] Read-only project view via a share token
- [ ] Client can view issues, trends and download the VPAT/ACR
- [ ] White-label CNAME support

---

## Quality Standards

**TypeScript**

- [ ] `strict: true` everywhere
- [ ] No `any` — use `unknown` and narrow
- [ ] No `@ts-ignore` without an explanatory comment

**Testing**

- [ ] Unit + integration test on every API route
- [ ] 80%+ Vitest coverage on every utility package
- [ ] Playwright e2e on every web flow happy path
- [ ] axe-core runs against the dashboard in CI before every merge to `main`

**Security**

- [ ] Authorization enforced in the API policy layer on every route
- [ ] JWT verification on every authenticated route
- [ ] Helmet on Fastify: CSP, HSTS, X-Frame-Options
- [ ] No secrets in code
- [ ] `pnpm audit` runs in CI and fails on high severity

**Performance**

- [ ] API P95 under 200ms on reads, under 500ms on scan triggers
- [ ] Web LCP under 2.5s, CLS under 0.1
- [ ] Mobile 60fps scrolling on low-end Android

**Git discipline**

- [ ] Conventional Commits
- [ ] One PR per feature
- [ ] Squash merge to `main`
- [ ] Semantic versioning, `1.0.0` at Phase 3 completion

---

## Timeline

| Phase | Focus                 | Days | Cumulative |
| ----- | --------------------- | ---- | ---------- |
| 0     | Foundation + CI/CD    | 20   | 20         |
| 1     | Core API Backend      | 50   | 70         |
| 2     | Rules Engine          | 25   | 95         |
| 3     | Web Dashboard         | 90   | 185        |
| 4     | CI/CD Package         | 30   | 215        |
| 5     | Browser Extension     | 45   | 260        |
| 6     | Mobile                | 100  | 360        |
| 7A    | Desktop               | 60   | 420        |
| 7B    | OS Tree Inspection    | 30   | 450        |
| 8     | VPAT/ACR + Consulting | 40   | 490        |
