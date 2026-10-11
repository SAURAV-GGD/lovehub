# LoveHub Birthdays: Landing Page and Implementation Plan

Reference design and build plan for `/birthdays` in the LoveHub repo (SAURAV-GGD/lovehub). Written for the Antigravity agent. Prepared 11 October 2026.

## How to use this doc

- Attach the landing page image in the same chat as this plan. The image is the visual reference. This doc is the source of truth for structure, behaviour and constraints.
- The first task is **Phase 1 only**: the landing page at `/birthdays`. Do not build the create flow or the wishes backend in the same change.
- Hex values below were estimated by eye from the render. Sample exact colors from the image with an eyedropper before finalizing.

Prompt to paste into the agent chat together with the image:

```
Read the attached implementation plan and the attached landing page image.
Implement Phase 1 only: the /birthdays landing page in this Next.js 15 repo.
Use the image as the visual reference, not as a pixel copy. Keep all text as
real HTML. Follow the file list, tokens and acceptance criteria in the plan.
Run lint, typecheck, tests and build before you finish, and show the results.
```

## 1. What the reference image shows

| Section | What is in the image | Build it as |
| --- | --- | --- |
| Header | Teal heart logo with LoveHub in a serif face. Nav: Proposals, Birthdays (active, teal underline), Pricing. Teal pill button Create a page with a gold edge. | Shared `SiteHeader` with an `active` prop. Active link gets `aria-current="page"`. |
| Hero copy | Teal kicker BIRTHDAY PAGES. H1: One page. Every wish, kept in one place. Short paragraph. Coral pill button Create a birthday page. Text link See an example with a play icon. | Server-rendered HTML. One H1 only. |
| Hero art | Gold notebook cover reading TURNING 26 · 14 MARCH, Riya and a one-line message. Two overlapping wish cards: a white one from Meera with a heart doodle, a mint one from Aarav with a small cake. Party hats, teal and coral balloons, bunting, torn paper, stamps, confetti. | Decorative illustration as an image with empty alt text. The notebook text and the two wish cards are live HTML laid over it. |
| How it works | Heading plus three columns. Large teal numerals 1, 2, 3 with a gold starburst behind each. Small illustration beside each: a browser window with a person typing, a link icon sending to chat bubbles and avatars, an open gift box with hearts. | Ordered list of three steps. Each step is an image plus a heading plus one sentence. |
| Closing band | Full-width dark green band with scattered gold stars and confetti. Cream serif heading: Start a page before the day gets here. Marigold pill button Create a birthday page. | Full-bleed section. Stars and confetti as a background image or inline SVG. |

**Leave out these image artifacts.** There is a black four-point sparkle in the bottom-right corner of the dark band and a grey star next to it. These are leftovers from the image generator. Do not recreate them. The tiny unreadable text inside the step 1 browser mock should also be dropped.

## 2. Design tokens

| Token | Estimated value | Used for |
| --- | --- | --- |
| Ground | Cream `#FDF4E7` | Page background |
| Ink | `#14231F` | Text, closing band background |
| Muted | `#55655F` | Secondary text |
| Line | `#E6DCC6` | Borders and dividers |
| Teal | `#0E6B5E` | Kicker, numerals, active nav, header button |
| Marigold | `#F2B134` | Closing CTA, header button edge |
| Coral | `#FF6B45` | Hero primary CTA |
| Gold | `#D9A441` | Notebook cover |
| Mint | `#CDEBE0` | Second wish card |

**Contrast warning.** White text on the bright coral button is roughly 3:1, which fails the 4.5:1 target for body-size text. Either use ink text `#14231F` on the coral button, which passes comfortably, or darken the coral to about `#C94419` and keep white text. Decide this before building.

Scope the tokens so the main LoveHub site stays rose. Do not override `:root`.

```css
.theme-birthday {
  --bd-ground: #FDF4E7;
  --bd-ink: #14231F;
  --bd-muted: #55655F;
  --bd-line: #E6DCC6;
  --bd-teal: #0E6B5E;
  --bd-marigold: #F2B134;
  --bd-coral: #FF6B45;
  --bd-gold: #D9A441;
  --bd-mint: #CDEBE0;
}
```

Expose them to Tailwind v4 inside the existing `@theme inline` block in `src/app/globals.css`, for example `--color-bd-teal: var(--bd-teal);`, so classes like `bg-bd-teal` work.

**Typography.** Fraunces (serif) for headings, names and wish text. Hanken Grotesk for body and UI. Load both with `next/font/google`. Suggested scale: H1 72px with 1.02 line height on desktop and 40px on mobile, section headings 36px, body 17 to 19px, kicker 13px bold with wide letter spacing.

## 3. Codebase facts that shape the plan

- Next.js 15 App Router, Tailwind v4 (`@import "tailwindcss"` and `@theme inline` in `src/app/globals.css`), shadcn components in `src/components/ui`, lucide-react, framer-motion.
- The current landing header is written inline inside `src/app/page.tsx`. There is no shared header component yet.
- `globals.css` references `--font-geist-sans`, but no font is ever loaded, so the whole site renders in the browser default font. Fixing that site-wide is a separate task. For this work, scope the fonts to the birthdays section.
- SEO helpers already exist: `constructMetadata` in `src/lib/seo.ts`, JSON-LD components in `src/components/seo`, `src/app/sitemap.ts`, `src/app/robots.ts` and `public/llms.txt`.
- `src/middleware.ts` protects only `/dashboard` and `/checkout`.
- The main site brand is rose. Birthdays uses teal, marigold and coral.

## 4. Phase 1: the landing page

### 4.1 Files

```
src/app/birthdays/
  layout.tsx            fonts + .theme-birthday wrapper
  page.tsx              server component, static
  opengraph-image.tsx   OG image for /birthdays
src/components/
  site-header.tsx       shared header, active prop
  birthdays/
    hero.tsx
    wish-card.tsx
    how-it-works.tsx
    closing-cta.tsx
public/birthdays/
  hero-notebook.webp
  step-1-setup.webp
  step-2-share.webp
  step-3-open.webp
  closing-confetti.webp
```

Also edit: `src/app/globals.css` (tokens), `src/app/page.tsx` (use `SiteHeader`, add the Birthdays link), `src/app/sitemap.ts` and `public/llms.txt`.

### 4.2 Steps

1. **Fonts.** In `src/app/birthdays/layout.tsx`, load Fraunces and Hanken Grotesk with `next/font/google`, expose them as CSS variables, and wrap children in a div with the `theme-birthday` class and the font variables.
2. **Tokens.** Add the `.theme-birthday` block and the Tailwind color mappings to `globals.css`.
3. **Shared header.** Extract the header from `src/app/page.tsx` into `src/components/site-header.tsx`. Props: `active` (`proposals`, `birthdays` or `pricing`) and an optional theme. Add a Birthdays link to the nav on both sections. Keep the main site header looking exactly as it does now.
4. **Page and metadata.** Create `src/app/birthdays/page.tsx` as a server component. Use `constructMetadata` with a unique title, a 120 to 160 character description and canonical `/birthdays`.
5. **Hero.** Two-column grid, roughly 1.1fr and 0.9fr, inside a 1200px container with 32px side padding. Left: kicker, H1, paragraph, the two actions. Right: the illustration with the notebook text and two `WishCard` components positioned over it with small rotations (about -2, +1.5 and -1 degrees).
6. **How it works.** Heading plus an ordered list of three steps. Numerals in Fraunces, teal, with an inline SVG starburst behind them. Copy: Set up the page, Share one link, Open on the day.
7. **Closing band.** Ink background, cream heading, marigold button, decorative confetti as a background image with empty alt text.
8. **Assets.** See 4.3.
9. **SEO.** Add `/birthdays` to the sitemap with a sensible priority, add one short line about it to `llms.txt`, add a JSON-LD `WebPage` block, and create `opengraph-image.tsx` using the same palette.
10. **Links.** Create a birthday page goes to `/signup?callbackUrl=/birthdays/new` until Phase 2 exists. See an example goes to `#how-it-works` for now. Add the `id` to the section. Do not link to routes that return 404.

### 4.3 Assets

The reference image is a single flattened render, so it cannot be cropped into usable assets without baked-in text and blurry edges. Export these as separate transparent files from the image generator, or ask a designer for SVGs:

- Hero notebook illustration with party hats, balloons, bunting, stamps and confetti, **with no text on it**. About 1200 by 1000.
- Three step illustrations, about 480 by 360 each.
- Closing band confetti, or build it from CSS dots and a few inline SVG stars.

Use `next/image` with explicit width and height. Hero image gets `priority`. Everything below the fold stays lazy. Decorative images use `alt=""`. Prefer WebP or AVIF and keep each file under about 150 KB.

### 4.4 Responsive behaviour

- Design for 360px to 1440px and above.
- Below 1024px the hero becomes one column: text first, then the illustration.
- On phones the two wish cards stack under the notebook instead of overlapping it.
- How it works becomes a single column with the illustration above each sentence.
- The header collapses to the logo, the Create a page button and a menu button.

### 4.5 Accessibility and performance

- One H1 per page, a logical H2 and H3 hierarchy.
- Real links and buttons with visible focus rings. Touch targets at least 44px.
- Text contrast at least 4.5:1, including the coral button (see section 2).
- Respect `prefers-reduced-motion`. Any confetti or floating animation must switch off.
- Keep the page a server component with no client JavaScript unless something needs it. Target first-load JS close to the current landing page (about 105 kB).

### 4.6 Acceptance criteria

- `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass.
- `/birthdays` renders at 360px, 768px and 1440px without horizontal scroll.
- The main landing page at `/` looks unchanged apart from the new Birthdays nav link.
- The page matches the reference image in layout, color and type, without the generator artifacts.
- Lighthouse accessibility score of 95 or higher on `/birthdays`.
- No links that lead to a 404.

## 5. Phase 2: create flow and wishes (plan only)

Do not start this until Phase 1 is merged and the decisions in section 7 are made.

**Routes**

- `/birthdays/new`: create wizard (details, message, settings). Protected by middleware.
- `/birthdays/[slug]`: the page the birthday person opens, plus the form where friends add a wish.
- `/birthdays/example`: a static sample page so See an example has a real destination.

**Data model (Drizzle)**

| Table | Columns |
| --- | --- |
| `birthday_pages` | id, userId (fk, cascade), slug (unique), personName, birthDate, message, tone, language, unlockAt (nullable), isPublic, wishesOpen, createdAt, updatedAt |
| `birthday_wishes` | id, pageId (fk, cascade), authorName (max 60), body (max 500), imageUrl (nullable), status (pending, approved, hidden), createdAt, ipHash |

Generate and apply with `npm run db:generate` and `npm run db:migrate`.

**API**

- `POST /api/birthdays` and `PUT/DELETE /api/birthdays/[id]`: owner only, validated with Zod, ownership checked the same way as `/api/proposals/[id]`.
- `POST /api/birthdays/[slug]/wishes`: no login for friends. Validate with Zod, add a honeypot field, and rate limit. The current in-memory limiter resets between serverless instances, so move it to a shared store first.

**Rules that matter**

- The unlock check runs on the server. Do not send wishes to the browser before `unlockAt` has passed.
- Photos go to object storage (Vercel Blob or S3) with a size and type limit. Never store base64 images inside a JSON column, which is the mistake in the current proposal flow.
- New wishes start as `pending`. The owner approves or hides them from the dashboard. Reuse the existing photo-consent wording from the proposal creator.

## 6. Phase 3: polish

- Dashboard list of birthday pages with copy link and WhatsApp share.
- Per-page Open Graph image showing the person's name.
- Email or WhatsApp reminder on the day.
- Pricing and plan limits for birthday pages.

## 7. Risks and decisions needed

1. **Copy promises features that do not exist yet.** The landing says the page unlocks on the birthday and that friends can leave a photo or a note. Either build those in Phase 2 or soften the copy before launch.
2. **CTA color.** Bright coral with white text fails contrast. Pick ink text on coral, or a darker coral.
3. **Auth for `/birthdays/new`.** Decide whether creating a page requires an account. The proposal flow lets anonymous users create pages but silently fails to save them to the database. Do not repeat that.
4. **Existing bugs.** The payment bypass through `?paid=true`, the split between localStorage and the database, and base64 photos should be fixed or avoided before any paid birthday feature.
5. **Two brands in one site.** Proposals use rose and birthdays use teal. Keep the tokens scoped, or agree on a shared neutral base with a per-section accent.
6. **Pricing** for birthday pages is not defined yet.

## 8. Suggested pull requests

1. Fonts, scoped tokens and the shared `SiteHeader`.
2. The `/birthdays` landing page and its assets.
3. SEO: metadata, sitemap, `llms.txt`, JSON-LD, Open Graph image.
4. Phase 2, split into schema, API, create wizard and public page.
