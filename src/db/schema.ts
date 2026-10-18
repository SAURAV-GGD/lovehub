import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ==========================================
// 1. Better-Auth Tables
// ==========================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// 2. Proposal Management
// ==========================================

export const proposals = pgTable(
  "proposals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    clientName: text("client_name"),
    plan: text("plan").notNull().default("romantic"),
    createdByAdmin: boolean("created_by_admin").notNull().default(false),
    input: jsonb("input").notNull(),
    content: jsonb("content").notNull(),
    status: text("status", { enum: ["draft", "final"] }).notNull().default("draft"),
    isPublic: boolean("is_public").notNull().default(false),
    slug: text("slug").unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("proposals_user_id_idx").on(table.userId),
    uniqueIndex("proposals_slug_idx").on(table.slug),
  ]
);

export const proposalResponses = pgTable(
  "proposal_responses",
  {
    id: text("id").primaryKey(),
    proposalId: text("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").default({}).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("proposal_responses_proposal_id_idx").on(table.proposalId),
    index("proposal_responses_event_type_idx").on(table.eventType),
  ]
);

// ==========================================
// 3. Subscriptions & Payments
// ==========================================

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("cashfree"),
  providerCustomerId: text("provider_customer_id"),
  plan: text("plan", { enum: ["free", "pro", "premium"] }).notNull().default("free"),
  status: text("status").notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(), // provider event ID for idempotency
  type: text("type").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(), // unique merchant orderId, e.g. "order_..."
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    proposalId: text("proposal_id"),
    planId: text("plan_id").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    status: text("status", { enum: ["pending", "paid", "failed", "cancelled"] }).notNull().default("pending"),
    paymentId: text("payment_id"), // YouPI-PG session UUID
    utr: text("utr"),
    checkoutUrl: text("checkout_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("orders_proposal_id_idx").on(table.proposalId),
    index("orders_user_id_idx").on(table.userId),
  ]
);

// ==========================================
// 4. Usage Limits
// ==========================================

export const usage = pgTable(
  "usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // format: "YYYY-MM"
    generationsUsed: integer("generations_used").notNull().default(0),
  },
  (table) => [
    uniqueIndex("usage_user_month_idx").on(table.userId, table.month),
  ]
);
