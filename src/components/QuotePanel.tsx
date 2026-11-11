"use client";

import { useState } from "react";
import { can } from "@/config/roles";
import { formatCount, formatMoney, formatPercent, formatRelative, formatUnitPrice } from "@/lib/format";
import { QUOTE_STATUS_LABEL, quoteMargin, quoteProfit, quoteTotal } from "@/lib/quote";
import type { Lead, Quote } from "@/lib/types";
import { type QuoteDecisionType, useCrm, useNow } from "@/store/crm-store";
import { showToast } from "@/components/Toaster";
import { Button, DetailList, Section } from "@/components/ui";

const DECISION_MESSAGE: Record<QuoteDecisionType, string> = {
  APPROVE: "Quote approved and sent to customer",
  CORRECTION: "Correction requested, Quotation AI is revising",
  REJECT: "Quote rejected",
};

function ApprovalDeadline({ quote }: { quote: Quote }) {
  const now = useNow();
  if (now === null) return null;
  const isOverdue = new Date(quote.approvalDeadline).getTime() < now;
  return (
    <p className={`text-sm ${isOverdue ? "font-semibold" : "text-neutral-600"}`}>
      {isOverdue ? `Approval overdue · due ${formatRelative(quote.approvalDeadline, now)}` : `Approve ${formatRelative(quote.approvalDeadline, now)}`}
    </p>
  );
}

function ApprovalActions({ quote }: { quote: Quote }) {
  const { role, decideQuote } = useCrm();
  const [comment, setComment] = useState("");

  if (!can(role, "APPROVE_QUOTES")) return null;

  const decide = (decision: QuoteDecisionType) => {
    decideQuote(quote.id, decision, comment.trim());
    showToast(DECISION_MESSAGE[decision]);
    setComment("");
  };

  return (
    <div className="space-y-3">
      <input
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Comment (optional)"
        className="h-10 w-full rounded-full border border-neutral-200 bg-white px-4 text-sm transition-[border-color,box-shadow] outline-none hover:border-neutral-400 focus:shadow-md placeholder:text-neutral-400 focus:border-black"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => decide("APPROVE")}>Approve</Button>
        <Button variant="secondary" onClick={() => decide("CORRECTION")}>
          Ask for correction
        </Button>
        <Button variant="secondary" onClick={() => decide("REJECT")}>
          Reject
        </Button>
      </div>
    </div>
  );
}

export function QuotePanel({ lead, quotes }: { lead: Lead; quotes: Quote[] }) {
  const { role } = useCrm();
  const [currentQuote, ...olderQuotes] = quotes;

  if (!currentQuote) {
    return (
      <Section title="Quote">
        <p className="text-sm text-neutral-500">No quote yet. Quotation AI creates one when the lead moves to Quotation.</p>
      </Section>
    );
  }

  const canSeeProfit = can(role, "SEE_PROFIT");
  const isPending = currentQuote.status === "PENDING_APPROVAL";

  return (
    <Section title="Quote">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {currentQuote.number} <span className="text-neutral-400">v{currentQuote.version}</span>
        </p>
        <span className={`rounded-full px-3 py-1 text-xs font-medium transition-transform hover:scale-105 ${isPending ? "bg-black text-white" : "bg-neutral-100"}`}>{QUOTE_STATUS_LABEL[currentQuote.status]}</span>
      </div>

      <DetailList
        items={[
          ["Unit price", formatUnitPrice(currentQuote.unitPrice)],
          ["Quantity", currentQuote.quantity !== lead.quantity && `${formatCount(currentQuote.quantity)} pcs`],
          ["Total", <span key="total" className="font-semibold">{formatMoney(quoteTotal(currentQuote))}</span>],
          ["Customer asked", lead.requestedPrice && formatUnitPrice(lead.requestedPrice)],
          ["Cost per piece", canSeeProfit && formatUnitPrice(currentQuote.unitCost)],
          ["Profit", canSeeProfit && `${formatMoney(quoteProfit(currentQuote))} · ${formatPercent(quoteMargin(currentQuote))}`],
        ]}
      />

      {isPending && (
        <div className="mt-5 space-y-3 border-t border-dashed border-neutral-200 pt-4">
          <ApprovalDeadline quote={currentQuote} />
          <ApprovalActions quote={currentQuote} />
        </div>
      )}

      {currentQuote.decision?.comment && <p className="mt-4 text-sm text-neutral-600">“{currentQuote.decision.comment}” — {currentQuote.decision.by}</p>}

      {olderQuotes.length > 0 && (
        <ul className="mt-5 space-y-1 border-t border-dashed border-neutral-200 pt-4 text-xs text-neutral-500">
          {olderQuotes.map((quote) => (
            <li key={quote.id} className="-mx-2 flex justify-between rounded-full px-2 py-1 transition-colors hover:bg-black/[0.04] hover:text-black">
              <span>
                v{quote.version} · {formatUnitPrice(quote.unitPrice)}
              </span>
              <span>{QUOTE_STATUS_LABEL[quote.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
