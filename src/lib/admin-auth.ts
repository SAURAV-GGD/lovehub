import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: "admin";
  loginAt: number;
  expiresAt: number;
}

const ADMIN_COOKIE_NAME = "lovehub_admin_session";
const SESSION_DURATION_HOURS = 24;

// Default Admin Credentials (can be overridden via environment variables)
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@lovehub.com";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "LoveHubAdmin2026!";

const AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  "development_secret_key_at_least_32_characters_long_for_auth";

// Security Invariant: Ensure secure credentials in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "LoveHubAdmin2026!") {
    console.error("FATAL SECURITY WARNING: ADMIN_PASSWORD is unset or using default password in production!");
  }
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.includes("development_secret")) {
    console.error("FATAL SECURITY WARNING: BETTER_AUTH_SECRET is unset or using development fallback in production!");
  }
}

/**
 * Sign payload using HMAC SHA-256
 */
export function signToken(data: AdminSession): string {
  const json = JSON.stringify(data);
  const base64Data = Buffer.from(json).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Verify and decode HMAC signed token with constant-time equality check
 */
export function verifyToken(token: string): AdminSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(base64Data)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const json = Buffer.from(base64Data, "base64url").toString("utf-8");
    const session: AdminSession = JSON.parse(json);

    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Check if the provided credentials match the admin configuration using constant-time comparison
 */
export function validateAdminCredentials(email: string, pass: string): boolean {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const targetEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();

  if (normalizedEmail !== targetEmail) {
    return false;
  }

  const passBuf = Buffer.from(pass || "");
  const targetBuf = Buffer.from(DEFAULT_ADMIN_PASSWORD || "");

  if (passBuf.length !== targetBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(passBuf, targetBuf);
}

/**
 * Create a new admin session token
 */
export function createAdminSession(email = DEFAULT_ADMIN_EMAIL): {
  session: AdminSession;
  token: string;
} {
  const now = Date.now();
  const session: AdminSession = {
    id: "admin-master",
    name: "Platform Administrator",
    email,
    role: "admin",
    loginAt: now,
    expiresAt: now + SESSION_DURATION_HOURS * 60 * 60 * 1000,
  };

  const token = signToken(session);
  return { session, token };
}

/**
 * Verify admin session from NextRequest cookies or Authorization header
 */
export function getAdminSessionFromRequest(request: NextRequest | Request): AdminSession | null {
  const cookieToken = (request as any).cookies?.get?.(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken) {
    const session = verifyToken(cookieToken);
    if (session) return session;
  }

  const cookieHeader = request.headers?.get?.("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|; )${ADMIN_COOKIE_NAME}=([^;]*)`));
    if (match?.[1]) {
      const session = verifyToken(decodeURIComponent(match[1]));
      if (session) return session;
    }
  }

  const authHeader = request.headers?.get?.("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const headerToken = authHeader.substring(7);
    const session = verifyToken(headerToken);
    if (session) return session;
  }

  return null;
}

/**
 * Set the admin session cookie on a NextResponse
 */
export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
  });
}

/**
 * Clear the admin session cookie on a NextResponse
 */
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.delete(ADMIN_COOKIE_NAME);
}

export { ADMIN_COOKIE_NAME };
