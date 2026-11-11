import { isClosedStage, nextStageOf } from "@/config/stages";
import type { Lead, Quote } from "@/lib/types";

export type AdvanceCheck = { allowed: true } | { allowed: false; reason: string };

/** Business rules for moving a lead forward. The backend must enforce the same rules. */
export function canAdvance(lead: Lead, quote: Quote | undefined): AdvanceCheck {
  if (isClosedStage(lead.stage) || !nextStageOf(lead.stage)) return { allowed: false, reason: "Deal is closed" };

  const needsSentQuote = lead.stage === "QUOTATION" || lead.stage === "NEGOTIATION";
  if (!needsSentQuote || quote?.status === "SENT") return { allowed: true };

  if (quote?.status === "PENDING_APPROVAL") return { allowed: false, reason: "Waiting for MD approval" };
  if (quote?.status === "REJECTED") return { allowed: false, reason: "Quote was rejected" };
  return { allowed: false, reason: "Quote not sent yet" };
}
