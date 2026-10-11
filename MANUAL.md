# LoveHub: Production Deployment & Manual Setup Guide

This guide gives you exact, step-by-step instructions for everything you need to configure manually:
1. Setting up your free PostgreSQL database (Neon / Supabase)
2. Getting your Google Gemini Flash AI API Key
3. Pointing your Hostinger domain (`lovehub.in`) to Vercel (DNS settings)
4. Adding Environment Variables into Vercel
5. Configuring Cashfree Payments (To be set up later)
6. Post-Launch Verification

---

## 📋 Quick Checklist of Accounts You Need

| Service | Purpose | Free Tier Available? |
|---|---|---|
| **Vercel** ([vercel.com](https://vercel.com)) | Hosting Next.js App | Yes (Hobby plan is 100% free) |
| **Hostinger** ([hostinger.in](https://hostinger.in)) | Domain Registrar (`lovehub.in`) | You already have the domain |
| **Google AI Studio** ([aistudio.google.com](https://aistudio.google.com)) | Gemini Flash AI API Key | Yes (Free tier with generous limits) |
| **Neon** ([neon.tech](https://neon.tech)) | Serverless PostgreSQL Database | Yes (Free tier forever) |
| **Cashfree** ([cashfree.com](https://cashfree.com)) | Indian & International Payments | To be configured later |

---

## 🗄️ Step 1: Set Up Free PostgreSQL Database (Neon)

You need a live PostgreSQL database for storing user accounts, sessions, proposals, and subscriptions.

1. Go to **[neon.tech](https://neon.tech)** and click **Sign Up** (sign in with GitHub or Google).
2. Click **Create Project**:
   - Project Name: `lovehub`
   - Region: Choose the closest region (e.g., `AWS Asia Pacific (Singapore / Mumbai)` or `US East`).
   - PostgreSQL version: `16` or `17` (default is fine).
3. Once created, you will see your **Connection Details**:
   - Select **Connection string** (Direct or Pooled).
   - It looks like:
     ```
     postgresql://neondb_owner:npg_abc123xyz@ep-cool-flower-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
4. **Copy this string.** This will be your `DATABASE_URL`.
5. Apply database tables:
   - On your local machine, create or open your `.env.local` file and paste:
     ```env
     DATABASE_URL="your-neon-connection-string-here"
     ```
   - In your terminal, run:
     ```bash
     npm run db:migrate
     ```
   - All 8 tables (`user`, `session`, `account`, `verification`, `proposals`, `subscriptions`, `usage`, `webhook_events`) are now created in your database!

---

## 🤖 Step 2: Get Google Gemini Flash AI Key

LoveHub generates personalized love letters server-side using Gemini Flash.

1. Go to **[aistudio.google.com](https://aistudio.google.com)**.
2. Sign in with your Google account.
3. Click the **"Get API key"** button in the left sidebar.
4. Click **"Create API key"** (you can create it in a new project or select an existing one).
5. Copy the generated key. It starts with `AIzaSy...`.
6. Save this:
   - Variable name: `AI_API_KEY`
   - Model name: `AI_MODEL=gemini-2.0-flash` (or `gemini-1.5-flash`)

> **Note:** If you don't provide an API key, LoveHub will automatically fall back to its curated romantic templates without crashing. But adding your Gemini key unlocks unlimited real-time AI personalization.

---

## 🌐 Step 3: Connect Hostinger Domain (`lovehub.in`) to Vercel

### 3.1. Add Domain in Vercel
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your `lovehub` project.
3. Go to **Settings** → **Domains**.
4. Enter `lovehub.in` and click **Add**.
5. Vercel will prompt you to add both:
   - `lovehub.in` (Recommended as canonical)
   - `www.lovehub.in` (Redirect to `lovehub.in`)
   Select **Add both** with redirect.

### 3.2. Add DNS Records in Hostinger
1. Log in to your **[Hostinger Control Panel (hPanel)](https://hpanel.hostinger.com)**.
2. Go to **Domains** → Click on **`lovehub.in`**.
3. In the left menu, select **DNS / Nameservers** (or **DNS Zone**).
4. You will see a list of DNS records. Add or edit these two records:

#### Record 1: The Root Domain (A Record)
- **Type**: `A`
- **Name / Host**: `@` (or leave blank if `@` is default)
- **Points to / Value**: `76.76.21.21` (This is Vercel's global Anycast IP)
- **TTL**: `3600` (or 14400 / default)
- Click **Save** or **Add Record**.

*(If Hostinger already has an existing `A` record pointing `@` to a Hostinger parking IP like `185.x.x.x`, click **Edit** and replace it with `76.76.21.21`, or delete the old one).*

#### Record 2: The WWW Subdomain (CNAME Record)
- **Type**: `CNAME`
- **Name / Host**: `www`
- **Points to / Target**: `cname.vercel-dns.com.`
- **TTL**: `3600`
- Click **Save** or **Add Record**.

*(If Hostinger already has a CNAME record for `www`, edit it to point to `cname.vercel-dns.com`)*.

### 3.3. Wait for DNS & SSL Activation
- DNS propagation usually takes **5 to 30 minutes** (rarely up to 24 hours).
- Go back to your Vercel Dashboard under **Settings → Domains**.
- Once DNS propagates, Vercel will show a **Valid Configuration** green checkmark and automatically issue a free **Let's Encrypt SSL certificate (HTTPS)**.

---

## 🔐 Step 4: Configure Vercel Environment Variables

In your Vercel Project Dashboard:
Go to **Settings** → **Environment Variables**. Add each of the following variables for **Production**, **Preview**, and **Development**:

| Variable Name | Example / Recommended Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://lovehub.in` | Your primary domain |
| `DATABASE_URL` | `postgresql://...` (from Neon in Step 1) | Connection string with SSL |
| `BETTER_AUTH_SECRET` | Generate a 32+ character random string (see below) | Secret for signing auth tokens |
| `BETTER_AUTH_URL` | `https://lovehub.in` | Base URL for auth callbacks |
| `AI_API_KEY` | `AIzaSy...` (from Google AI Studio in Step 2) | Gemini API Key |
| `AI_MODEL` | `gemini-3.8-flash` | Fast, high-quality romantic model |
| `CASHFREE_APP_ID` | `...` | From Cashfree Dashboard (To be configured later) |
| `CASHFREE_SECRET_KEY` | `...` | From Cashfree Dashboard (To be configured later) |

### How to Generate `BETTER_AUTH_SECRET`:
You can generate a secure random string using Node.js:
Run this in any terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the 64-character output and paste it as `BETTER_AUTH_SECRET`.

---

## 💳 Step 5: Cashfree Payments (To be set up later)

We will configure Cashfree Payment Gateway (supporting UPI, Cards, Netbanking, Wallets) when ready:
1. Sign up at **[cashfree.com](https://cashfree.com)**.
2. Obtain Merchant App ID and Secret Key.
3. Configure webhook endpoint: `https://lovehub.in/api/webhooks/payments`.

---

## 🚀 Step 6: Deploy to Vercel

### Option A: Via GitHub (Recommended)
1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete production rebuild with DB, auth, and AI"
   git push origin main
   ```
2. In Vercel, click **Import Git Repository**, choose your repo, and ensure all environment variables from Step 4 are added.
3. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

---

## 🔍 Step 7: Post-Launch Smoke Test Checklist

Once deployed to `https://lovehub.in`:

- [ ] **Domain Check**: Visit `https://lovehub.in` and `https://www.lovehub.in` (verify HTTPS lock icon and automatic www redirect).
- [ ] **Robots & Sitemap**:
  - Open `https://lovehub.in/robots.txt`
  - Open `https://lovehub.in/sitemap.xml`
  - Open `https://lovehub.in/llms.txt`
- [ ] **404 Check**: Visit `https://lovehub.in/random-page-does-not-exist` (verify custom branded 404 page).
- [ ] **Create Flow**:
  - Go to `https://lovehub.in/create`
  - Enter names, click "Generate Message with AI", upload 1-2 photos, and click Submit.
  - Test the unique proposal URL on your smartphone!
- [ ] **Account Flow**:
  - Go to `https://lovehub.in/signup`, create an account.
  - Visit `https://lovehub.in/dashboard` to see your saved proposals.
- [ ] **Google Search Console**:
  - Visit [search.google.com/search-console](https://search.google.com/search-console).
  - Add property `https://lovehub.in`.
  - Under **Sitemaps**, submit `https://lovehub.in/sitemap.xml`.
