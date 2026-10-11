import { createAuthClient } from "better-auth/react";
import { dashClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://www.lovehub.in",
  plugins: [
    dashClient() as any,
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
