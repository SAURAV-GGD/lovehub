import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const isLocalhost =
  !connectionString ||
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

export const pool = new Pool({
  connectionString:
    connectionString ||
    "postgresql://postgres:postgres@localhost:5432/lovehub",
  ssl:
    !isLocalhost && connectionString
      ? { rejectUnauthorized: false }
      : undefined,
});

export const db = drizzle(pool, { schema });

let initTablesPromise: Promise<void> | null = null;

/**
 * Ensures all required PostgreSQL tables exist.
 * Safe, idempotent, and non-blocking if DB is unreachable.
 */
export async function ensureDbTables(): Promise<void> {
  if (initTablesPromise) return initTablesPromise;
  
  if (!connectionString) {
    return Promise.resolve();
  }

  initTablesPromise = (async () => {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "user" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "email" text NOT NULL UNIQUE,
            "email_verified" boolean DEFAULT false NOT NULL,
            "image" text,
            "role" text DEFAULT 'user' NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "session" (
            "id" text PRIMARY KEY NOT NULL,
            "expires_at" timestamp NOT NULL,
            "token" text NOT NULL UNIQUE,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL,
            "ip_address" text,
            "user_agent" text,
            "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS "account" (
            "id" text PRIMARY KEY NOT NULL,
            "account_id" text NOT NULL,
            "provider_id" text NOT NULL,
            "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
            "access_token" text,
            "refresh_token" text,
            "id_token" text,
            "access_token_expires_at" timestamp,
            "refresh_token_expires_at" timestamp,
            "scope" text,
            "password" text,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "verification" (
            "id" text PRIMARY KEY NOT NULL,
            "identifier" text NOT NULL,
            "value" text NOT NULL,
            "expires_at" timestamp NOT NULL,
            "created_at" timestamp DEFAULT now(),
            "updated_at" timestamp DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS "proposals" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
            "title" text NOT NULL,
            "client_name" text,
            "plan" text DEFAULT 'romantic' NOT NULL,
            "input" jsonb NOT NULL,
            "content" jsonb NOT NULL,
            "status" text DEFAULT 'draft' NOT NULL,
            "is_public" boolean DEFAULT false NOT NULL,
            "slug" text UNIQUE,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "proposal_responses" (
            "id" text PRIMARY KEY NOT NULL,
            "proposal_id" text NOT NULL REFERENCES "proposals"("id") ON DELETE CASCADE,
            "event_type" text NOT NULL,
            "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "birthday_pages" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text REFERENCES "user"("id") ON DELETE CASCADE,
            "person_name" text NOT NULL,
            "birth_date" text,
            "message" text NOT NULL,
            "tone" text DEFAULT 'celebratory',
            "language" text DEFAULT 'english',
            "photos" jsonb DEFAULT '[]'::jsonb,
            "photo_captions" jsonb DEFAULT '[]'::jsonb,
            "music" text DEFAULT 'birthday-cheer',
            "slug" text UNIQUE NOT NULL,
            "is_public" boolean DEFAULT true,
            "created_by_admin" boolean DEFAULT false,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "subscriptions" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
            "provider" text DEFAULT 'youpi' NOT NULL,
            "provider_customer_id" text,
            "plan" text DEFAULT 'free' NOT NULL,
            "status" text DEFAULT 'active' NOT NULL,
            "current_period_end" timestamp,
            "created_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "webhook_events" (
            "id" text PRIMARY KEY NOT NULL,
            "type" text NOT NULL,
            "processed_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "orders" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
            "proposal_id" text,
            "plan_id" text NOT NULL,
            "amount_paise" integer NOT NULL,
            "currency" text DEFAULT 'INR' NOT NULL,
            "status" text DEFAULT 'pending' NOT NULL,
            "payment_id" text,
            "utr" text,
            "checkout_url" text,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );
        `);
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn("DB auto-table migration skipped or non-fatal:", err);
    }
  })();

  return initTablesPromise;
}

export { schema };
