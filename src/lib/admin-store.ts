import { db } from "@/db";
import { user, proposals, subscriptions } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { PlanType, ProposalData } from "./proposal-types";

export interface ClientItem {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: string;
  proposalCount: number;
  createdAt: string;
}

export interface ProposalRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  title: string;
  clientName: string | null;
  plan: string;
  createdByAdmin: boolean;
  status: "draft" | "final";
  isPublic: boolean;
  slug: string | null;
  createdAt: string;
  input: Record<string, unknown>;
  content: Record<string, unknown>;
}

export interface BirthdayRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  personName: string;
  birthDate?: string;
  relationship?: string;
  message: string;
  tone?: string;
  language?: string;
  photos: string[];
  photoCaptions?: string[];
  music?: string;
  slug: string;
  createdByAdmin: boolean;
  status: "published" | "draft";
  createdAt: string;
  customConfig?: {
    enableConfetti?: boolean;
    enableBalloons?: boolean;
    enableCandles?: boolean;
    vipBadge?: string;
  };
}

// Fallback in-memory store for when DB is unreachable or during local dev
interface FallbackStore {
  clients: ClientItem[];
  proposals: ProposalRecord[];
  birthdays: BirthdayRecord[];
}

const globalFallbackStore: FallbackStore = {
  birthdays: [
    {
      id: "bday_demo_1",
      userId: "cli_101",
      userName: "Rahul Verma",
      userEmail: "rahul.verma@example.com",
      personName: "Riya",
      birthDate: "14 March",
      relationship: "best-friend",
      message: "Happy 26th Birthday Riya! Thank you for being the sunshine and endless laughter in every room you walk into. Here is to another year of unforgettable adventures!",
      tone: "joyful",
      language: "english",
      photos: [
        "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80",
      ],
      photoCaptions: ["Our legendary road trip", "Making birthday wishes"],
      music: "birthday-cheer",
      slug: "riya-turns-26",
      createdByAdmin: false,
      status: "published",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      customConfig: {
        enableConfetti: true,
        enableBalloons: true,
        enableCandles: true,
        vipBadge: "Signature Birthday Celebration",
      },
    },
  ],
  clients: [
    {
      id: "cli_101",
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      role: "user",
      plan: "pro",
      proposalCount: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    },
    {
      id: "cli_102",
      name: "Emily Watson",
      email: "emily.w@example.com",
      role: "user",
      plan: "premium",
      proposalCount: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    },
    {
      id: "cli_103",
      name: "Alex Morales",
      email: "alex.m@example.com",
      role: "user",
      plan: "starter",
      proposalCount: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: "cli_104",
      name: "Saurav Gupta",
      email: "saurav@lovehub.io",
      role: "admin",
      plan: "custom",
      proposalCount: 3,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    },
    {
      id: "cli_105",
      name: "Aarav Mehta",
      email: "aarav.mehta@example.com",
      role: "user",
      plan: "pro",
      proposalCount: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
  ],
  proposals: [
    {
      id: "prop_demo_1",
      userId: "cli_101",
      userName: "Rahul Verma",
      userEmail: "rahul.verma@example.com",
      title: "Proposal for Ananya - Our Golden Journey",
      clientName: "Ananya",
      plan: "pro",
      createdByAdmin: false,
      status: "final",
      isPublic: true,
      slug: "rahul-loves-ananya",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      input: {
        yourName: "Rahul",
        partnerName: "Ananya",
        relationshipType: "girlfriend",
        tone: "deep-romantic",
        language: "english",
      },
      content: {
        yourName: "Rahul",
        partnerName: "Ananya",
        relationshipType: "girlfriend",
        tone: "deep-romantic",
        language: "english",
        message:
          "From the moment we met under the rainy skies of Marine Drive, my world found its rhythm. You are the joy in my every morning, my anchor in every storm, and the love I had always dreamed of. Will you walk beside me forever?",
        photos: [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
        ],
        photoCaptions: ["Our very first coffee date in Mumbai", "Sunset together on the beach"],
        backgroundMusic: "romantic-piano",
        plan: "pro",
      },
    },
    {
      id: "prop_demo_2",
      userId: "cli_102",
      userName: "Emily Watson",
      userEmail: "emily.w@example.com",
      title: "A Lifetime With David",
      clientName: "David",
      plan: "premium",
      createdByAdmin: false,
      status: "final",
      isPublic: true,
      slug: "emily-and-david-forever",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      input: {
        yourName: "Emily",
        partnerName: "David",
        relationshipType: "wife",
        tone: "emotional",
        language: "english",
      },
      content: {
        yourName: "Emily",
        partnerName: "David",
        relationshipType: "wife",
        tone: "emotional",
        language: "english",
        message:
          "Ten years of laughter, three cities, and countless cups of morning coffee. Every adventure with you feels like our very first. I love you more today than yesterday.",
        photos: [
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
        ],
        photoCaptions: ["Where our story began"],
        backgroundMusic: "love-ballad",
        plan: "premium",
      },
    },
    {
      id: "prop_demo_3",
      userId: "cli_104",
      userName: "Saurav Gupta",
      userEmail: "saurav@lovehub.io",
      title: "VIP Custom Proposal - Maya Special Edition",
      clientName: "Maya",
      plan: "custom",
      createdByAdmin: true,
      status: "final",
      isPublic: true,
      slug: "maya-and-saurav-vip",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      input: {
        yourName: "Saurav",
        partnerName: "Maya",
        relationshipType: "fiancee",
        tone: "poetic-vip",
        language: "hinglish",
      },
      content: {
        yourName: "Saurav",
        partnerName: "Maya",
        relationshipType: "fiancee",
        tone: "poetic-vip",
        language: "hinglish",
        message:
          "Tu meri har subah ki pehli muskaan hai aur har raat ka sukoon. In all the universes and infinite timelines, I would search for you and choose you every single time. Hamesha ke liye mere ban jao?",
        photos: [
          "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        ],
        photoCaptions: ["Under the star-lit sky", "Forever smiling together"],
        backgroundMusic: "indian-romantic",
        plan: "custom",
        customConfig: {
          enableRunawayButton: true,
          enableConfetti: true,
          enableHeartburst: true,
          enableSlideshow: true,
          vipBadge: "Executive VIP Bespoke Edition",
        },
      },
    },
    {
      id: "prop_demo_4",
      userId: "cli_103",
      userName: "Alex Morales",
      userEmail: "alex.m@example.com",
      title: "Proposal for Sophia",
      clientName: "Sophia",
      plan: "starter",
      createdByAdmin: false,
      status: "final",
      isPublic: true,
      slug: "alex-loves-sophia",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      input: {
        yourName: "Alex",
        partnerName: "Sophia",
        relationshipType: "crush",
        tone: "cute",
        language: "english",
      },
      content: {
        yourName: "Alex",
        partnerName: "Sophia",
        relationshipType: "crush",
        tone: "cute",
        language: "english",
        message:
          "Every moment spent with you is my new favorite memory. You bring a smile to my face without even trying. Will you be mine?",
        photos: [
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
        ],
        photoCaptions: ["Our weekend picnic"],
        backgroundMusic: "none",
        plan: "starter",
      },
    },
  ],
};

// Check if PostgreSQL is available
async function isDbAvailable(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false;
    // Fast ping query
    await db.select().from(user).limit(1);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch all clients with their proposals count and plan status
 */
export async function getAdminClients(): Promise<ClientItem[]> {
  try {
    if (await isDbAvailable()) {
      const dbUsers = await db.select().from(user).orderBy(desc(user.createdAt));
      const dbProposals = await db.select().from(proposals);
      const dbSubscriptions = await db.select().from(subscriptions);

      return dbUsers.map((u) => {
        const userProps = dbProposals.filter((p) => p.userId === u.id);
        const userSub = dbSubscriptions.find((s) => s.userId === u.id);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role as "user" | "admin") || "user",
          plan: userSub?.plan || "free",
          proposalCount: userProps.length,
          createdAt: u.createdAt.toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn("Falling back to in-memory clients store:", err);
  }

  // Update counts in fallback store dynamically
  return globalFallbackStore.clients.map((c) => {
    const count = globalFallbackStore.proposals.filter(
      (p) => p.userId === c.id || p.userEmail === c.email
    ).length;
    return { ...c, proposalCount: count };
  });
}

/**
 * Fetch all proposals across all clients
 */
export async function getAdminProposals(options?: {
  clientEmail?: string;
  plan?: string;
  search?: string;
}): Promise<ProposalRecord[]> {
  let list: ProposalRecord[] = [];

  try {
    if (await isDbAvailable()) {
      const dbProps = await db.select().from(proposals).orderBy(desc(proposals.createdAt));
      const dbUsers = await db.select().from(user);

      list = dbProps.map((p) => {
        const u = dbUsers.find((usr) => usr.id === p.userId);
        return {
          id: p.id,
          userId: p.userId,
          userName: u?.name || "Client",
          userEmail: u?.email,
          title: p.title,
          clientName: p.clientName,
          plan: p.plan || (p.content as Record<string, unknown>)?.plan as string || "pro",
          createdByAdmin: p.createdByAdmin || false,
          status: p.status as "draft" | "final",
          isPublic: p.isPublic,
          slug: p.slug,
          createdAt: p.createdAt.toISOString(),
          input: p.input as Record<string, unknown>,
          content: p.content as Record<string, unknown>,
        };
      });
    }
  } catch (err) {
    console.warn("DB query failed, using in-memory proposals:", err);
  }

  if (list.length === 0) {
    list = [...globalFallbackStore.proposals];
  }

  // Apply filters if provided
  if (options?.clientEmail) {
    list = list.filter((p) => p.userEmail?.toLowerCase() === options.clientEmail?.toLowerCase());
  }

  if (options?.plan && options.plan !== "all") {
    list = list.filter((p) => p.plan.toLowerCase() === options.plan?.toLowerCase());
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.clientName?.toLowerCase().includes(q) ||
        p.userName?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Get a proposal by ID or Slug from DB or Fallback Store
 */
export async function getProposalByIdOrSlug(idOrSlug: string): Promise<ProposalRecord | null> {
  try {
    if (await isDbAvailable()) {
      const [dbProp] = await db
        .select()
        .from(proposals)
        .where(or(eq(proposals.id, idOrSlug), eq(proposals.slug, idOrSlug)));

      if (dbProp) {
        const [u] = await db.select().from(user).where(eq(user.id, dbProp.userId));
        return {
          id: dbProp.id,
          userId: dbProp.userId,
          userName: u?.name || "Client",
          userEmail: u?.email,
          title: dbProp.title,
          clientName: dbProp.clientName,
          plan: dbProp.plan || (dbProp.content as Record<string, unknown>)?.plan as string || "pro",
          createdByAdmin: dbProp.createdByAdmin || false,
          status: dbProp.status as "draft" | "final",
          isPublic: dbProp.isPublic,
          slug: dbProp.slug,
          createdAt: dbProp.createdAt.toISOString(),
          input: dbProp.input as Record<string, unknown>,
          content: dbProp.content as Record<string, unknown>,
        };
      }
    }
  } catch {
    // Continue to fallback
  }

  const found = globalFallbackStore.proposals.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );

  return found || null;
}

export interface CreateAdminProposalInput {
  title?: string;
  clientName?: string;
  assignedClientId?: string;
  assignedClientEmail?: string;
  assignedClientName?: string;
  plan: PlanType;
  yourName: string;
  partnerName: string;
  relationshipType: string;
  tone: string;
  language: string;
  message: string;
  photos: string[];
  photoCaptions: string[];
  backgroundMusic: string;
  customSlug?: string;
  customConfig?: Record<string, unknown>;
  status?: "draft" | "final";
  isPublic?: boolean;
}

/**
 * Admin proposal creator: Unlimited proposals and whichever version (starter, pro, custom, premium)
 */
export async function createAdminProposal(
  input: CreateAdminProposalInput
): Promise<ProposalRecord> {
  const proposalId = `prop_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
  const slug =
    input.customSlug?.trim() ||
    `${(input.yourName || "love").toLowerCase().replace(/[^a-z0-9]/g, "-")}-and-${(input.partnerName || "forever").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.random().toString(36).substring(2, 6)}`;

  const resolvedUserId = input.assignedClientId || "admin-master";
  const resolvedUserName = input.assignedClientName || input.yourName || "Admin Superuser";
  const resolvedUserEmail = input.assignedClientEmail || "admin@lovehub.com";

  const fullContent: ProposalData = {
    id: slug,
    yourName: input.yourName,
    partnerName: input.partnerName,
    relationshipType: input.relationshipType as ProposalData["relationshipType"],
    tone: input.tone as ProposalData["tone"],
    language: input.language as ProposalData["language"],
    message: input.message,
    photos: input.photos || [],
    photoCaptions: input.photoCaptions || [],
    backgroundMusic: input.backgroundMusic || "romantic-piano",
    customSlug: slug,
    plan: input.plan,
    createdAt: new Date(),
    createdByAdmin: true,
    assignedClientEmail: resolvedUserEmail,
    customConfig: {
      enableRunawayButton: input.customConfig?.enableRunawayButton !== false,
      enableConfetti: input.customConfig?.enableConfetti !== false,
      enableHeartburst: input.customConfig?.enableHeartburst !== false,
      enableSlideshow: input.customConfig?.enableSlideshow !== false,
      vipBadge: (input.customConfig?.vipBadge as string) || (input.plan === "custom" ? "Admin VIP Custom Edition" : undefined),
      ...input.customConfig,
    },
  };

  const newRecord: ProposalRecord = {
    id: proposalId,
    userId: resolvedUserId,
    userName: resolvedUserName,
    userEmail: resolvedUserEmail,
    title: input.title || `Proposal for ${input.partnerName} (${input.plan.toUpperCase()})`,
    clientName: input.partnerName,
    plan: input.plan,
    createdByAdmin: true,
    status: input.status || "final",
    isPublic: input.isPublic !== false,
    slug,
    createdAt: new Date().toISOString(),
    input: {
      yourName: input.yourName,
      partnerName: input.partnerName,
      relationshipType: input.relationshipType,
      tone: input.tone,
      language: input.language,
      plan: input.plan,
      assignedClientEmail: resolvedUserEmail,
    },
    content: fullContent as unknown as Record<string, unknown>,
  };

  // 1. Try to save into PostgreSQL
  try {
    if (await isDbAvailable()) {
      await db.insert(proposals).values({
        id: proposalId,
        userId: resolvedUserId,
        title: newRecord.title,
        clientName: newRecord.clientName,
        plan: input.plan,
        createdByAdmin: true,
        input: newRecord.input,
        content: newRecord.content,
        status: newRecord.status,
        isPublic: newRecord.isPublic,
        slug,
      });
    }
  } catch (err) {
    console.warn("DB insert failed, saved to in-memory fallback store:", err);
  }

  // 2. Always persist into memory fallback store as well
  globalFallbackStore.proposals.unshift(newRecord);

  // If a client email was specified, update or create that client in the fallback clients list
  if (resolvedUserEmail) {
    const existingClient = globalFallbackStore.clients.find(
      (c) => c.email.toLowerCase() === resolvedUserEmail.toLowerCase()
    );
    if (existingClient) {
      existingClient.proposalCount += 1;
    } else {
      globalFallbackStore.clients.push({
        id: `cli_${Math.random().toString(36).substring(2, 7)}`,
        name: resolvedUserName,
        email: resolvedUserEmail,
        role: "user",
        plan: input.plan,
        proposalCount: 1,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return newRecord;
}

/**
 * Delete a proposal from both DB and memory store
 */
export async function deleteAdminProposal(id: string): Promise<boolean> {
  try {
    if (await isDbAvailable()) {
      await db.delete(proposals).where(or(eq(proposals.id, id), eq(proposals.slug, id)));
    }
  } catch (err) {
    console.warn("DB delete failed:", err);
  }

  const idx = globalFallbackStore.proposals.findIndex((p) => p.id === id || p.slug === id);
  if (idx !== -1) {
    globalFallbackStore.proposals.splice(idx, 1);
    return true;
  }
  return true;
}

/**
 * Update a client's plan
 */
export async function updateClientPlan(clientId: string, newPlan: string): Promise<boolean> {
  try {
    if (await isDbAvailable()) {
      await db
        .update(subscriptions)
        .set({ plan: newPlan as "free" | "pro" | "premium" })
        .where(eq(subscriptions.userId, clientId));
    }
  } catch (err) {
    console.warn("DB subscription update error:", err);
  }

  const client = globalFallbackStore.clients.find((c) => c.id === clientId);
  if (client) {
    client.plan = newPlan;
    return true;
  }
  return true;
}

/**
 * Admin Overview Statistics
 */
export async function getAdminStats() {
  const allClients = await getAdminClients();
  const allProposals = await getAdminProposals();

  const planCounts = {
    starter: 0,
    pro: 0,
    premium: 0,
    custom: 0,
  };

  let totalPhotos = 0;

  for (const p of allProposals) {
    const plan = (p.plan || "pro").toLowerCase();
    if (plan === "starter" || plan === "basic") planCounts.starter++;
    else if (plan === "pro" || plan === "romantic") planCounts.pro++;
    else if (plan === "premium") planCounts.premium++;
    else if (plan === "custom") planCounts.custom++;

    const photos = (p.content?.photos as unknown[]) || [];
    totalPhotos += photos.length;
  }

  return {
    totalClients: allClients.length,
    totalProposals: allProposals.length,
    totalBirthdays: (await getAdminBirthdays()).length,
    totalPhotos,
    planCounts,
    recentProposals: allProposals.slice(0, 5),
  };
}

/**
 * Get all birthday celebration records
 */
export async function getAdminBirthdays(): Promise<BirthdayRecord[]> {
  try {
    const { pool } = await import("@/db");
    const result = await pool.query(
      `SELECT * FROM "birthday_pages" ORDER BY "created_at" DESC`
    );
    if (result.rows && result.rows.length > 0) {
      const dbRows: BirthdayRecord[] = result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id || undefined,
        personName: row.person_name,
        birthDate: row.birth_date || undefined,
        message: row.message,
        tone: row.tone || "celebratory",
        language: row.language || "english",
        photos: Array.isArray(row.photos) ? row.photos : [],
        photoCaptions: Array.isArray(row.photo_captions) ? row.photo_captions : [],
        music: row.music || "birthday-cheer",
        slug: row.slug,
        createdByAdmin: Boolean(row.created_by_admin),
        status: (row.is_public ? "published" : "draft") as "published" | "draft",
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      }));

      // Merge with memory store
      const combined = [...dbRows];
      for (const mem of globalFallbackStore.birthdays) {
        if (!combined.some((b) => b.id === mem.id || b.slug === mem.slug)) {
          combined.push(mem);
        }
      }
      return combined;
    }
  } catch (err) {
    console.warn("DB birthday query fallback to in-memory store:", err);
  }

  return [...globalFallbackStore.birthdays];
}

/**
 * Create a new Birthday Celebration Page (Admin or User)
 */
export async function createAdminBirthday(data: {
  personName: string;
  birthDate?: string;
  relationship?: string;
  message: string;
  tone?: string;
  language?: string;
  photos: string[];
  photoCaptions?: string[];
  music?: string;
  customSlug?: string;
  createdByAdmin?: boolean;
  userId?: string;
  customConfig?: BirthdayRecord["customConfig"];
}): Promise<BirthdayRecord> {
  const id = "bday_" + Math.random().toString(36).substring(2, 9);
  const baseSlug =
    data.customSlug ||
    data.personName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
      "-birthday";
  const slug = baseSlug || "celebration-" + id;

  const record: BirthdayRecord = {
    id,
    userId: data.userId || "admin-master",
    userName: data.createdByAdmin ? "Admin Love Architect" : "Valued Member",
    userEmail: data.createdByAdmin ? "admin@lovehub.com" : undefined,
    personName: data.personName,
    birthDate: data.birthDate,
    relationship: data.relationship || "friend",
    message: data.message,
    tone: data.tone || "celebratory",
    language: data.language || "english",
    photos: data.photos || [],
    photoCaptions: data.photoCaptions || [],
    music: data.music || "birthday-cheer",
    slug,
    createdByAdmin: data.createdByAdmin !== false,
    status: "published",
    createdAt: new Date().toISOString(),
    customConfig: data.customConfig || {
      enableConfetti: true,
      enableBalloons: true,
      enableCandles: true,
      vipBadge: data.createdByAdmin ? "VIP Executive Birthday Edition" : "Celebration Edition",
    },
  };

  try {
    const { pool } = await import("@/db");
    await pool.query(
      `INSERT INTO "birthday_pages" (
        id, user_id, person_name, birth_date, message, tone, language,
        photos, photo_captions, music, slug, is_public, created_by_admin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT ("slug") DO UPDATE SET
        person_name = EXCLUDED.person_name,
        message = EXCLUDED.message,
        photos = EXCLUDED.photos,
        updated_at = NOW()`,
      [
        record.id,
        record.userId,
        record.personName,
        record.birthDate || null,
        record.message,
        record.tone,
        record.language,
        JSON.stringify(record.photos),
        JSON.stringify(record.photoCaptions),
        record.music,
        record.slug,
        true,
        record.createdByAdmin,
      ]
    );
  } catch (err) {
    console.warn("DB birthday insert error, keeping in memory store:", err);
  }

  globalFallbackStore.birthdays.unshift(record);
  return record;
}

/**
 * Delete a birthday record
 */
export async function deleteAdminBirthday(idOrSlug: string): Promise<boolean> {
  try {
    const { pool } = await import("@/db");
    await pool.query(
      `DELETE FROM "birthday_pages" WHERE id = $1 OR slug = $1`,
      [idOrSlug]
    );
  } catch (err) {
    console.warn("DB birthday delete error:", err);
  }

  globalFallbackStore.birthdays = globalFallbackStore.birthdays.filter(
    (b) => b.id !== idOrSlug && b.slug !== idOrSlug
  );
  return true;
}

/**
 * Get single birthday record by slug or id
 */
export async function getBirthdayBySlug(slugOrId: string): Promise<BirthdayRecord | null> {
  const all = await getAdminBirthdays();
  return (
    all.find(
      (b) =>
        b.slug?.toLowerCase() === slugOrId.toLowerCase() ||
        b.id.toLowerCase() === slugOrId.toLowerCase()
    ) || null
  );
}

