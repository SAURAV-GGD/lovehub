import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Privacy Policy and photo consent terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const generateProposalSchema = z.object({
  yourName: z.string().min(1, "Your name is required").max(100),
  partnerName: z.string().min(1, "Partner's name is required").max(100),
  relationshipType: z.enum(["crush", "girlfriend", "wife", "long-distance"]),
  tone: z.enum(["cute", "emotional", "filmy", "funny", "deep-romantic"]),
  language: z.enum(["english", "hinglish"]),
  memories: z.string().max(1000).optional(),
  insideJokes: z.string().max(500).optional(),
});

export type GenerateProposalInput = z.infer<typeof generateProposalSchema>;

export const proposalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  clientName: z.string().max(100).optional(),
  input: z.record(z.string(), z.any()),
  content: z.record(z.string(), z.any()),
  status: z.enum(["draft", "final"]).default("draft"),
  isPublic: z.boolean().default(false),
  slug: z.string().min(3).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
});

export type ProposalInput = z.infer<typeof proposalSchema>;

export const checkoutSchema = z.object({
  plan: z.enum(["starter", "basic", "romantic", "premium"]).default("starter"),
  proposalId: z.string().optional().nullable(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const extractMemoriesSchema = z.object({
  text: z.string().min(5, "Chat text or memory notes required").max(10000),
  yourName: z.string().max(100).optional(),
  partnerName: z.string().max(100).optional(),
  language: z.enum(["english", "hinglish"]).default("hinglish"),
});

export type ExtractMemoriesInput = z.infer<typeof extractMemoriesSchema>;

