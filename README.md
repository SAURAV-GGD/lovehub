# LoveHub - AI Proposal & Love Letter Website Generator

LoveHub is a production-grade web application that empowers users to create personalized, interactive proposal and love letter websites for their partners. It features server-side AI-generated messages (supporting English and Hinglish across multiple tones), photo memory galleries, ambient music players, and an interactive celebration screen with a runaway "No" button.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Database & ORM**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [better-auth](https://better-auth.com) (Email/Password & Social OAuth)
- **Payments**: [Stripe](https://stripe.com) Checkout & Webhooks
- **Validation**: [Zod](https://zod.dev)
- **Testing**: [Vitest](https://vitest.dev)
- **Animations**: Framer Motion

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ installed
- PostgreSQL database (Neon, Supabase, or local instance)

### 2. Environment Setup
Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure your `.env.local` keys:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key (minimum 32 characters)
- `BETTER_AUTH_URL`: e.g. `http://localhost:3000`
- `NEXT_PUBLIC_SITE_URL`: Base URL of your website
- `AI_API_KEY`: Google Gemini API key (optional; system includes rich fallback templates)
- `STRIPE_SECRET_KEY`: Stripe secret key (optional for checkout)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migrations
Generate and apply migrations to your database:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint 9 checks |
| `npm run typecheck` | Validates TypeScript types (`tsc --noEmit`) |
| `npm test` | Runs unit tests using Vitest |
| `npm run db:generate` | Generates Drizzle SQL migrations from schema |
| `npm run db:migrate` | Applies pending database migrations |

---

## 🔒 Security & Privacy

- **Security Headers**: Configured in `next.config.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **Input Validation**: All client and API payloads are validated with strict Zod schemas.
- **Idempotent Webhooks**: All payment webhooks check `webhook_events` prior to execution.
- **Bot Allow-list**: `robots.txt` welcomes AI crawlers for indexable content while disallowing sensitive private dashboards and checkout paths.

---

## 📄 License

MIT License. Designed with ❤️ for lovers everywhere.
