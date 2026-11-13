"use client";

/**
 * Mock CRM store. Holds the sample data in the browser and simulates what the
 * backend AI agents do (create a quote, send it after approval). When the
 * FastAPI endpoints are ready, each action becomes an API call.
 */
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { ROLES, ROLE_LABEL, scopeDataForRole } from "@/config/roles";
import { APPROVAL_WINDOW_HOURS, findProduct } from "@/config/settings";
import { nextStageOf, stageLabel } from "@/config/stages";
import { createMockData } from "@/data/mock-data";
import { canAdvance } from "@/lib/lead-flow";
import { latestQuote } from "@/lib/quote";
import type { Activity, CrmData, Lead, Quote, Role } from "@/lib/types";

const DATA_STORAGE_KEY = "arifaa-crm-data-v2";
const ROLE_STORAGE_KEY = "arifaa-crm-role";
const HOUR = 3_600_000;
const DAY = 86_400_000;

export type QuoteDecisionType = "APPROVE" | "REJECT" | "CORRECTION";

interface CrmContextValue {
  data: CrmData | null;
  role: Role;
  setRole: (role: Role) => void;
  moveToNextStage: (leadId: string) => void;
  markLost: (leadId: string, reason: string) => void;
  decideQuote: (quoteId: string, decision: QuoteDecisionType, comment: string) => void;
  reassignOwner: (leadId: string, owner: string) => void;
  resetData: () => void;
}

const CrmContext = createContext<CrmContextValue | null>(null);

interface StoreState {
  data: CrmData | null;
  role: Role;
}

/** The server always renders with no data, so the first HTML matches and data appears after hydration. */
const SERVER_STATE: StoreState = { data: null, role: "TEAM" };
let clientState: StoreState | null = null;
const listeners = new Set<() => void>();

function loadState(): StoreState {
  let data: CrmData | null = null;
  let role: Role = "TEAM";
  try {
    const savedData = localStorage.getItem(DATA_STORAGE_KEY);
    data = savedData ? (JSON.parse(savedData) as CrmData) : null;
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as Role | null;
    if (savedRole && ROLES.includes(savedRole)) role = savedRole;
  } catch {
    // Storage blocked: fall back to fresh sample data.
  }
  return { data: data ?? createMockData(Date.now()), role };
}

const crmStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): StoreState {
    clientState ??= loadState();
    return clientState;
  },
  getServerSnapshot(): StoreState {
    return SERVER_STATE;
  },
  set(patch: Partial<StoreState>) {
    clientState = { ...crmStore.getSnapshot(), ...patch };
    try {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(clientState.data));
      localStorage.setItem(ROLE_STORAGE_KEY, clientState.role);
    } catch {
      // Storage blocked: changes live until the tab closes.
    }
    listeners.forEach((notify) => notify());
  },
};

function updateData(change: (data: CrmData) => CrmData) {
  const currentData = crmStore.getSnapshot().data;
  if (currentData) crmStore.set({ data: change(currentData) });
}

const toIso = (ms: number) => new Date(ms).toISOString();

let activitySequence = 0;
function createActivity(leadId: string, actor: string, text: string, offsetMs = 0): Activity {
  return { id: `A-${Date.now()}-${++activitySequence}`, leadId, at: toIso(Date.now() + offsetMs), actor, text };
}

function patchLead(leads: Lead[], leadId: string, patch: Partial<Lead>): Lead[] {
  return leads.map((lead) => (lead.id === leadId ? { ...lead, ...patch } : lead));
}

/** Simulates Quotation AI: a new quote that waits for management approval. */
function createDraftQuote(lead: Lead, now: number): Quote {
  const product = findProduct(lead.product);
  const number = `Q-${lead.id.slice(2)}`;
  return {
    id: `${number}-v1`,
    number,
    version: 1,
    leadId: lead.id,
    unitPrice: product.unitPrice,
    unitCost: product.unitCost,
    quantity: lead.quantity,
    status: "PENDING_APPROVAL",
    createdAt: toIso(now),
    approvalDeadline: toIso(now + APPROVAL_WINDOW_HOURS * HOUR),
  };
}

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const { data: allData, role } = useSyncExternalStore(crmStore.subscribe, crmStore.getSnapshot, crmStore.getServerSnapshot);
  // Every screen reads role-scoped data, so a sales person only ever sees their own deals.
  const data = useMemo(() => allData && scopeDataForRole(allData, role), [allData, role]);
  const actor = ROLE_LABEL[role];

  const setRole = useCallback((nextRole: Role) => crmStore.set({ role: nextRole }), []);

  const moveToNextStage = useCallback(
    (leadId: string) =>
      updateData((current) => {
        const lead = current.leads.find((item) => item.id === leadId);
        const quote = latestQuote(current.quotes, leadId);
        const nextStage = lead && nextStageOf(lead.stage);
        if (!lead || !nextStage || !canAdvance(lead, quote).allowed) return current;

        const now = Date.now();
        const activities = [...current.activities, createActivity(leadId, actor, `Moved to ${stageLabel(nextStage)}`)];
        let quotes = current.quotes;
        let patch: Partial<Lead> = { stage: nextStage, nextAction: null };

        if (nextStage === "QUOTATION" && !quote) {
          const draftQuote = createDraftQuote(lead, now);
          quotes = [...quotes, draftQuote];
          activities.push(createActivity(leadId, "Quotation AI", "Created quote, waiting for approval", 1));
          patch = { ...patch, aiAgent: "Quotation AI", nextAction: { text: "MD to approve quote", dueAt: draftQuote.approvalDeadline } };
        }
        if (nextStage === "NEGOTIATION") patch.aiAgent = "Negotiation AI";
        if (nextStage === "READY_TO_CLOSE" && quote) {
          quotes = quotes.map((item) => (item.id === quote.id ? { ...item, status: "ACCEPTED" } : item));
          patch = { ...patch, aiAgent: "Deal Closer AI", nextAction: { text: "Send proforma invoice", dueAt: toIso(now + DAY) } };
        }
        if (nextStage === "PAYMENT") patch.nextAction = { text: "Confirm advance payment", dueAt: toIso(now + 2 * DAY) };
        if (nextStage === "WON") {
          patch = { ...patch, aiAgent: "Repeat Sales AI", nextAction: { text: "Reorder check-in", dueAt: toIso(now + 60 * DAY) } };
        }
        return { ...current, quotes, activities, leads: patchLead(current.leads, leadId, patch) };
      }),
    [actor],
  );

  const markLost = useCallback(
    (leadId: string, reason: string) =>
      updateData((current) => ({
        ...current,
        leads: patchLead(current.leads, leadId, { stage: "LOST", lossReason: reason, nextAction: null, aiAgent: "—" }),
        activities: [...current.activities, createActivity(leadId, actor, `Marked lost: ${reason}`)],
      })),
    [actor],
  );

  const decideQuote = useCallback(
    (quoteId: string, decisionType: QuoteDecisionType, comment: string) =>
      updateData((current) => {
        const quote = current.quotes.find((item) => item.id === quoteId);
        if (!quote || quote.status !== "PENDING_APPROVAL") return current;

        const now = Date.now();
        const lead = current.leads.find((item) => item.id === quote.leadId)!;
        const decision = { by: actor, at: toIso(now), comment };
        const label = `${quote.number} v${quote.version}`;
        const note = comment ? `: ${comment}` : "";
        let quotes = current.quotes;
        const activities = [...current.activities];
        let patch: Partial<Lead> = {};

        if (decisionType === "APPROVE") {
          // Simulates Communication AI sending the approved quote on the customer's channel.
          quotes = quotes.map((item) => (item.id === quoteId ? { ...item, status: "SENT", decision } : item));
          activities.push(createActivity(lead.id, actor, `Approved ${label}${note}`));
          activities.push(createActivity(lead.id, "Communication AI", `Sent ${label} on ${lead.channel}`, 1));
          patch = { aiAgent: "Follow-up AI", nextAction: { text: "Follow up on quote", dueAt: toIso(now + 2 * DAY) } };
        }

        if (decisionType === "REJECT") {
          quotes = quotes.map((item) => (item.id === quoteId ? { ...item, status: "REJECTED", decision } : item));
          activities.push(createActivity(lead.id, actor, `Rejected ${label}${note}`));
          patch = { nextAction: { text: "Review lead", dueAt: toIso(now + DAY) } };
        }

        if (decisionType === "CORRECTION") {
          // Simulates Quotation AI resubmitting a revised version.
          const revisedQuote: Quote = {
            ...quote,
            id: `${quote.number}-v${quote.version + 1}`,
            version: quote.version + 1,
            status: "PENDING_APPROVAL",
            createdAt: toIso(now + 1),
            approvalDeadline: toIso(now + APPROVAL_WINDOW_HOURS * HOUR),
            decision: undefined,
          };
          quotes = [...quotes.map((item) => (item.id === quoteId ? { ...item, status: "CORRECTION_REQUESTED" as const, decision } : item)), revisedQuote];
          activities.push(createActivity(lead.id, actor, `Asked for correction on ${label}${note}`));
          activities.push(createActivity(lead.id, "Quotation AI", `Created ${quote.number} v${revisedQuote.version}, waiting for approval`, 1));
          patch = { nextAction: { text: "MD to approve revised quote", dueAt: revisedQuote.approvalDeadline } };
        }

        return { ...current, quotes, activities, leads: patchLead(current.leads, lead.id, patch) };
      }),
    [actor],
  );

  const reassignOwner = useCallback(
    (leadId: string, owner: string) =>
      updateData((current) => ({
        ...current,
        leads: patchLead(current.leads, leadId, { owner }),
        activities: [...current.activities, createActivity(leadId, actor, `Reassigned to ${owner}`)],
      })),
    [actor],
  );

  const resetData = useCallback(() => crmStore.set({ data: createMockData(Date.now()) }), []);

  const value = useMemo<CrmContextValue>(
    () => ({ data, role, setRole, moveToNextStage, markLost, decideQuote, reassignOwner, resetData }),
    [data, role, setRole, moveToNextStage, markLost, decideQuote, reassignOwner, resetData],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): CrmContextValue {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside <CrmProvider>");
  return context;
}

/** Current time, refreshed every `intervalMs`. Null on the server to avoid a server/browser mismatch. */
export function useNow(intervalMs = 30_000): number | null {
  const subscribe = useCallback(
    (onTick: () => void) => {
      const timer = setInterval(onTick, intervalMs);
      return () => clearInterval(timer);
    },
    [intervalMs],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  );
}
