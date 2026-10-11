import { ProposalData, PlanType } from "./proposal-types";

const STORAGE_KEY = "lovehub_proposals";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function saveProposal(data: Omit<ProposalData, "id" | "createdAt">): string {
  const proposals = getAllProposals();
  
  const newProposal: ProposalData = {
    ...data,
    id: data.customSlug || generateId(),
    createdAt: new Date()
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
