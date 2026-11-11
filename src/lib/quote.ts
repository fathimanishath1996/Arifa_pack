import { findProduct } from "@/config/settings";
import type { Lead, Quote, QuoteStatus } from "@/lib/types";

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  PENDING_APPROVAL: "Waiting for approval",
  CORRECTION_REQUESTED: "Correction requested",
  REJECTED: "Rejected",
  SENT: "Sent to customer",
  ACCEPTED: "Accepted",
};

export const quoteTotal = (quote: Quote) => quote.unitPrice * quote.quantity;
export const quoteProfit = (quote: Quote) => (quote.unitPrice - quote.unitCost) * quote.quantity;
export const quoteMargin = (quote: Quote) => (quote.unitPrice - quote.unitCost) / quote.unitPrice;

export function quotesForLead(quotes: Quote[], leadId: string): Quote[] {
  return quotes.filter((quote) => quote.leadId === leadId).sort((a, b) => b.version - a.version);
}

export function latestQuote(quotes: Quote[], leadId: string): Quote | undefined {
  return quotesForLead(quotes, leadId)[0];
}

/** Deal value: the latest quote total, or quantity × list price before a quote exists. */
export function dealValue(lead: Lead, quote: Quote | undefined): number {
  return quote ? quoteTotal(quote) : lead.quantity * findProduct(lead.product).unitPrice;
}
