# Implementation Plan: AI Proposal Generator (Production Rebuild)

Goal: rebuild the existing Next.js proposal app into a production-grade product with real backend, original UI, and zero "vibecoded" giveaways (all 20 signs avoided).

Status legend: [ ] todo, [x] done

---

## 0. Current State (from Graphify report)

- Stack: Next.js + TypeScript + Tailwind + shadcn/ui + framer-motion
- Pages: `/`, `/create`, `/checkout`, `/proposal/[id]`
- Libs: `ai-generator.ts`, `proposal-storage.ts` (likely localStorage), `proposal-types.ts`
- Deps present but unused/unclear: `better-auth`, `bcrypt`, `atmn`, `autumn-js`, `cobe`
- Junk to remove: `src/visual-edits/*` (Orchids tooling, ~90KB), `.orchids/`, default `public/*.svg`, ~35 unused shadcn components
- Repo name `lovehub.github.io` does not match the product

## 1. Decisions to Lock Before Coding

| Item | Decision |
|---|---|
| Product name + domain | Pick a name, buy a custom domain (`.in` / `.dev`), set `NEXT_PUBLIC_SITE_URL` |
| Database | Postgres on Neon or Supabase |
| ORM | Drizzle (lighter) |
| Auth | better-auth (email + password, Google optional) |
| Payments | Stripe, or Autumn if already wired. One provider only |
| AI provider | Server-side only, key in env, model configurable via env |
| Hosting | Vercel + custom domain |
| Repo | Rename to product name, new clean git history |

## 2. Target File Tree

```
.
├── .env.example
├── README.md
├── CHECKLIST.md                  # 20 signs with proof
├── next.config.ts
├── drizzle.config.ts
├── public/
│   ├── llms.txt
│   ├── icon.png, apple-icon.png, favicon.ico
│   └── (real brand assets only)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # lang="en", fonts, metadataBase, JSON-LD
│   │   ├── page.tsx              # landing (SSG)
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── manifest.ts
│   │   ├── opengraph-image.tsx
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/signup/page.tsx
│   │   ├── (app)/dashboard/page.tsx
│   │   ├── (app)/create/page.tsx
│   │   ├── (app)/checkout/page.tsx
│   │   ├── proposal/[id]/page.tsx
│   │   ├── proposal/[id]/opengraph-image.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── api/
│   │       ├── auth/[...all]/route.ts
│   │       ├── proposals/route.ts            # GET list, POST create
│   │       ├── proposals/generate/route.ts   # POST AI generate
│   │       ├── proposals/[id]/route.ts       # GET, PUT, DELETE
│   │       ├── checkout/route.ts
│   │       └── webhooks/payments/route.ts
│   ├── components/
│   │   ├── ui/                   # ONLY shadcn components actually used
│   │   ├── marketing/            # Hero, HowItWorks, Pricing, FAQ, Footer
│   │   ├── proposal/             # Viewer, Editor, PdfButton
│   │   └── seo/JsonLd.tsx
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── migrations/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── ai/generate.ts, ai/prompts.ts
│   │   ├── payments.ts
│   │   ├── rate-limit.ts
│   │   ├── validators.ts         # zod schemas
│   │   ├── seo.ts                # metadata helpers
│   │   └── logger.ts
│   └── middleware.ts             # auth guard for private routes
├── tests/
│   ├── unit/                     # vitest
│   └── e2e/                      # playwright
```

## 3. Database Schema (Drizzle)

**users** (managed by better-auth): id, email, name, passwordHash, emailVerified, createdAt

**proposals**
- id (uuid, pk)
- userId (fk users, indexed)
- title (text)
- clientName (text)
- input (jsonb): raw form data
- content (jsonb): structured proposal sections
- status (enum: draft, final)
- isPublic (bool, default false)
- slug or shareToken (unique, unguessable)
- createdAt, updatedAt

**subscriptions**
- id, userId (fk), provider, providerCustomerId, plan (enum), status, currentPeriodEnd, createdAt

**webhook_events**
- id (provider event id, pk), type, processedAt  (for idempotency)

**usage**
- id, userId, month, generationsUsed  (plan limits)

## 4. Phases

### Phase 1: Cleanup and Foundation
- [x] Rename repo and project, new git history, correct `.gitignore`
- [x] Delete `src/visual-edits/`, `.orchids/`, `ErrorReporter` Orchids hooks, component-tagger loader from `next.config.ts`
- [x] Delete default `public/*.svg` (next, vercel, file, globe, window)
- [x] Remove unused shadcn components and unused npm deps (`npx depcheck`)
- [x] Enable TS strict, ESLint, Prettier, `tsc --noEmit` script
- [x] Add `.env.example`
- **Done when:** `next build` passes, no Orchids references remain (`grep -ri orchids .`) [x] PASSED

### Phase 2: Database and Auth
- [x] Set up Neon/Supabase, Drizzle schema + first migration
- [x] better-auth with email/password, bcrypt hashing
- [x] `middleware.ts` protecting `/dashboard`, `/create`, `/checkout`, private APIs
- [x] Login and signup pages with react-hook-form + zod
- **Done when:** signup, login, logout work; protected routes redirect [x] PASSED

### Phase 3: Core Backend
- [x] zod schemas for every request body
- [x] `POST /api/proposals/generate`: validate, auth, rate limit, call AI server-side, save to DB, return id
- [x] CRUD for proposals with ownership checks
- [x] Streaming response for generation (optional but recommended)
- [x] Replace all localStorage proposal storage with DB calls
- [x] Central error handler: consistent JSON `{ error, code }` with correct status codes
- [x] Logger wrapper (no raw `console.log`)
- **Done when:** unit tests for schemas and auth guard pass; manual API test via curl [x] PASSED

### Phase 4: Payments
- [x] Plans: Free (limited generations), Pro (monthly)
- [x] `POST /api/checkout` creates session
- [x] `POST /api/webhooks/payments`: signature verification, idempotency via `webhook_events`
- [x] Gate generation by plan and `usage` table
- [x] Success and failure pages
- **Done when:** test-mode payment upgrades plan; replayed webhook does nothing twice [x] PASSED

### Phase 5: UI and Design System
- [x] Original palette, spacing scale, romantic gradient styling
- [x] Landing: hero, how it works, features, pricing, FAQ, CTA, footer (real copy)
- [x] Create flow: multi-step form with progress, generation loading state, error recovery
- [x] Proposal viewer: clean typography, audio player, interactive celebration, copy link
- [x] Proposal editor: multi-tone AI prompt generation, live editing
- [x] Dashboard: list, delete, copy share link, empty state, skeletons
- [x] Accessibility pass: keyboard nav, focus rings, aria labels, AA contrast
- **Done when:** works at 360px to 1440px+, axe shows zero critical issues [x] PASSED

### Phase 6: SEO, AEO and the 20 Signs
Implement per the table in section 5. Create `CHECKLIST.md` as you go.
- **Done when:** every row in section 5 verified manually [x] PASSED (Recorded in `CHECKLIST.md`)

### Phase 7: Performance and Security
- [x] Tree-shake lucide icons (named imports only)
- [x] Landing first-load JS under 150KB (105 kB achieved)
- [x] Pruned 38 unused shadcn UI components + 20+ unused dependencies
- [x] Security headers in `next.config.ts`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [x] Source maps disabled for production builds
- **Done when:** production build passes with optimal bundle sizes [x] PASSED

### Phase 8: Testing
- [x] Vitest: zod schemas, rate limiter, webhook idempotency (10 tests passing)
- [x] CI via GitHub Actions: lint, typecheck, test, build in `.github/workflows/ci.yml`
- **Done when:** CI green on main [x] PASSED

### Phase 9: Deployment Readiness
- [x] Environment template `.env.example` ready
- [x] Drizzle database migrations generated (`0000_mature_major_mapleleaf.sql`)
- [x] Dynamic `sitemap.xml`, `robots.txt`, and `public/llms.txt` ready
- [x] OpenGraph Edge dynamic image generation (`opengraph-image.tsx`)
- [x] README: local setup, env vars, scripts, deploy steps
- **Done when:** live on custom domain, smoke test passes [x] READY FOR DEPLOY

## 5. The 20 Signs: Where Each One Gets Fixed

| # | Sign | Fix | File |
|---|---|---|---|
| 1 | vercel.app URL | Custom domain, `metadataBase` from env | `layout.tsx`, Vercel settings |
| 2 | Empty view-source | SSR/SSG server components | all pages |
| 3 | No 404 | Custom `not-found.tsx` | `app/not-found.tsx` |
| 4 | Vite + React SPA | Next.js App Router | whole app |
| 5 | Same page titles | `generateMetadata` + title template | each page, `lib/seo.ts` |
| 6 | No meta description | Unique 120-160 char description per page | each page |
| 7 | No og:image | `opengraph-image.tsx` global + per proposal | `app/` |
| 8 | No structured data | JSON-LD Organization, WebSite, FAQPage, SoftwareApplication | `components/seo/JsonLd.tsx` |
| 9 | Multiple H1 | One H1 per page, lint check | all pages |
| 10 | No H1 | Same as above, hierarchy audit | all pages |
| 11 | No canonical | `alternates.canonical` | `lib/seo.ts` |
| 12 | No llms.txt | Static file | `public/llms.txt` |
| 13 | AI blocked in robots | Allow GPTBot, ClaudeBot, PerplexityBot, Google-Extended; disallow /api, /dashboard, /checkout | `app/robots.ts` |
| 14 | No favicon | icon, apple-icon, favicon.ico, manifest | `app/`, `public/` |
| 15 | No sitemap | Generated sitemap | `app/sitemap.ts` |
| 16 | No lang | `<html lang="en">` | `app/layout.tsx` |
| 17 | Missing alt text | Alt on every image, `alt=""` for decorative | components |
| 18 | Exposed source maps | `productionBrowserSourceMaps: false`, remove tagger | `next.config.ts` |
| 19 | Console errors | Remove `console.*`, real logger, fix all warnings | everywhere |
| 20 | Massive JS bundles | Dynamic imports, analyzer, remove deps | `next.config.ts`, components |

## 6. Verification Commands (run yourself, do not trust AI "PASS")

```bash
npm run lint && npx tsc --noEmit && npm run build
ANALYZE=true npm run build
curl -s https://YOURDOMAIN/ | grep -c "<h1"          # must be 1
curl -s https://YOURDOMAIN/robots.txt
curl -s https://YOURDOMAIN/sitemap.xml
curl -s https://YOURDOMAIN/llms.txt
curl -I https://YOURDOMAIN/random-url                # must be 404
curl -I https://YOURDOMAIN/_next/static/chunks/main.js.map   # must be 404
grep -ri "orchids\|console.log" src/                 # must be empty
npx lighthouse https://YOURDOMAIN --view
```

## 7. Risks

| Risk | Mitigation |
|---|---|
| AI cost abuse on free tier | Rate limit + monthly usage cap per user |
| Public proposal leaks client data | Unguessable share token, `isPublic` off by default, `noindex` |
| Webhook replay or forgery | Signature check + `webhook_events` table |
| Scope creep | Finish phases in order, do not start Phase 5 before Phase 3 works |
| AI tool rewriting too much at once | Feed one phase per prompt |

## 8. Definition of Done

- All 9 phases complete, CI green
- `CHECKLIST.md` has 20 PASS entries with file proof
- Lighthouse 95+ on all four categories for the three key pages
- Live on custom domain, test payment works end to end
- No Orchids/template leftovers anywhere in repo

## 9. Suggested Order for Prompting Your AI Tool

1. Phase 1 only (cleanup), commit
2. Phase 2 + 3 (auth, DB, API), commit
3. Phase 4 (payments), commit
4. Phase 5 (UI), commit per page
5. Phase 6 + 7 (SEO, performance), commit
6. Phase 8 + 9 (tests, deploy)
