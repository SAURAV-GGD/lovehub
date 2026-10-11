import { auth } from "@/lib/auth";
import { ensureDbTables } from "@/db";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

export async function POST(req: NextRequest) {
  await ensureDbTables();
  return handler.POST(req);
}

export async function GET(req: NextRequest) {
  await ensureDbTables();
  return handler.GET(req);
}
