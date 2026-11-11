import { nextStageOf } from "@/config/stages";
import { canAdvance } from "@/lib/lead-flow";
import { dealValue, latestQuote } from "@/lib/quote";
import type { Lead, Quote, StageId } from "@/lib/types";

export interface PipelineCard {
  lead: Lead;
  quote: Quote | undefined;
  value: number;
  needsApproval: boolean;
}

export type PipelineSort = "DEFAULT" | "VALUE" | "DUE";

export interface PipelineFilters {
  search: string;
  owner: string;
  product: string;
  sort: PipelineSort;
}

export const EMPTY_FILTERS: PipelineFilters = { search: "", owner: "", product: "", sort: "DEFAULT" };

export function toCard(lead: Lead, quotes: Quote[]): PipelineCard {
  const quote = latestQuote(quotes, lead.id);
  return { lead, quote, value: dealValue(lead, quote), needsApproval: quote?.status === "PENDING_APPROVAL" };
}

export function hasActiveFilters(filters: PipelineFilters): boolean {
  return Boolean(filters.search || filters.owner || filters.product);
}

function matchesFilters({ lead }: PipelineCard, filters: PipelineFilters): boolean {
  if (filters.owner && lead.owner !== filters.owner) return false;
  if (filters.product && lead.product !== filters.product) return false;
  if (!filters.search) return true;
  const haystack = `${lead.company} ${lead.contactName} ${lead.product} ${lead.location} ${lead.id}`.toLowerCase();
  return haystack.includes(filters.search.toLowerCase());
}

const SORTERS: Record<PipelineSort, ((a: PipelineCard, b: PipelineCard) => number) | null> = {
  DEFAULT: null,
  VALUE: (a, b) => b.value - a.value,
  // Deals without a next action go last.
  DUE: (a, b) => (a.lead.nextAction?.dueAt ?? "~").localeCompare(b.lead.nextAction?.dueAt ?? "~"),
};

export function applyFilters(cards: PipelineCard[], filters: PipelineFilters): PipelineCard[] {
  const filtered = cards.filter((card) => matchesFilters(card, filters));
  const sorter = SORTERS[filters.sort];
  return sorter ? filtered.sort(sorter) : filtered;
}

/** Distinct, sorted values of one lead field, for filter dropdowns. */
export function distinctValues(cards: PipelineCard[], pick: (lead: Lead) => string): string[] {
  return [...new Set(cards.map((card) => pick(card.lead)))].filter((value) => value && value !== "—").sort();
}

/** Why a card can't move to `targetStage`, or null when the move is allowed. */
export function moveBlockedReason(card: PipelineCard, targetStage: StageId): string | null {
  if (targetStage === card.lead.stage) return null;
  if (targetStage === "LOST") return "Open the lead to mark it lost with a reason";
  if (targetStage !== nextStageOf(card.lead.stage)) return "Deals move one stage at a time";
  const check = canAdvance(card.lead, card.quote);
  return check.allowed ? null : check.reason;
}
