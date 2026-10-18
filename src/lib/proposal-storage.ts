import { ProposalData, PlanType } from "./proposal-types";

const STORAGE_KEY = "lovehub_proposals";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const PREVIEW_DURATION_MS = 2 * 60 * 1000; // 120 seconds (2 minutes) temporary preview window

export function saveProposal(data: Omit<ProposalData, "id" | "createdAt">): string {
  const proposals = getAllProposals();
  
  const isPaid = Boolean(data.isPaid);
  const now = Date.now();
  const newProposal: ProposalData = {
    ...data,
    id: data.customSlug || generateId(),
    createdAt: new Date(),
    isPaid,
    expiresAt: isPaid ? undefined : (data.expiresAt || now + PREVIEW_DURATION_MS),
  };
  
  proposals.push(newProposal);
  
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
    } catch {
      // LocalStorage quota exceeded: try saving only the newest proposal
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newProposal]));
      } catch {
        // Still exceeded: save lighter copy without heavy raw photos
        try {
          const lightProposal = { ...newProposal, photos: [] };
          localStorage.setItem(STORAGE_KEY, JSON.stringify([lightProposal]));
        } catch {
          // Never throw, allow seamless progression
        }
      }
    }
  }
  
  return newProposal.id;
}

export function markProposalPaid(id: string): boolean {
  if (typeof window === "undefined") return false;
  const proposals = getAllProposals();
  const proposal = proposals.find((p) => p.id === id || p.customSlug === id);
  if (!proposal) return false;

  proposal.isPaid = true;
  delete proposal.expiresAt;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  } catch {
    // Quota safety
  }
  return true;
}

export function isProposalExpired(
  proposal: Partial<ProposalData> | { isPaid?: boolean; expiresAt?: number } | null | undefined
): boolean {
  if (!proposal) return false;
  if (proposal.isPaid) return false;
  if (!proposal.expiresAt) return false;
  return Date.now() > proposal.expiresAt;
}

export function getProposal(id: string): ProposalData | null {
  const proposals = getAllProposals();
  const proposal = proposals.find(p => p.id === id);
  
  if (proposal) {
    return {
      ...proposal,
      createdAt: new Date(proposal.createdAt)
    };
  }
  
  return null;
}

export function getAllProposals(): ProposalData[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function deleteProposal(id: string): boolean {
  const proposals = getAllProposals();
  const index = proposals.findIndex(p => p.id === id);
  
  if (index === -1) {
    return false;
  }
  
  proposals.splice(index, 1);
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  }
  
  return true;
}

export function isSlugAvailable(slug: string): boolean {
  const proposals = getAllProposals();
  return !proposals.some(p => p.id === slug);
}

export function getProposalUrl(id: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/proposal/${id}`;
  }
  return `/proposal/${id}`;
}

export function getWhatsAppShareUrl(proposalId: string, partnerName: string): string {
  const url = getProposalUrl(proposalId);
  const message = encodeURIComponent(`Hey ${partnerName}! I have something special for you. Open this link: ${url}`);
  return `https://wa.me/?text=${message}`;
}
