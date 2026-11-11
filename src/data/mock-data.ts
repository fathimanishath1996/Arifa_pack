import { APPROVAL_WINDOW_HOURS, findProduct } from "@/config/settings";
import type { Activity, Channel, CrmData, Lead, Quote, QuoteStatus, StageId } from "@/lib/types";

const HOUR = 3_600_000;
const DAY = 86_400_000;

interface LeadSeed {
  id: string;
  company: string;
  contactName: string;
  phone: string;
  channel: Channel;
  location: string;
  product: string;
  quantity: number;
  stage: StageId;
  owner: string;
  aiAgent: string;
  createdDaysAgo: number;
  nextAction?: { text: string; dueInHours: number };
  quotes?: { unitPrice?: number; status: QuoteStatus; ageHours: number }[];
  requestedPrice?: number;
  lossReason?: string;
  history: string[][];
}

/** Sample deals across every stage, based on the examples in the client document. */
const LEAD_SEEDS: LeadSeed[] = [
  {
    id: "L-1001", company: "Sri Balaji Caterers", contactName: "Ramesh Kumar", phone: "+91 98410 22341", channel: "WhatsApp",
    location: "Chennai", product: "450ml Foil Container", quantity: 20000, stage: "NEW", owner: "Divya", aiAgent: "Factory Concierge AI",
    createdDaysAgo: 0, nextAction: { text: "Confirm delivery date", dueInHours: 2 },
    history: [["Factory Concierge AI", "Started chat on website"], ["Product Intelligence AI", "Matched 450ml foil container"]],
  },
  {
    id: "L-1002", company: "Green Leaf Restaurants", contactName: "Priya Nair", phone: "+91 99860 11872", channel: "Email",
    location: "Bengaluru", product: "660ml Foil Container", quantity: 15000, stage: "NEW", owner: "Arun", aiAgent: "Contact Capture AI",
    createdDaysAgo: 1, nextAction: { text: "Get phone number", dueInHours: 5 },
    history: [["Factory Concierge AI", "Enquiry received by email"]],
  },
  {
    id: "L-1003", company: "Madurai Mess Foods", contactName: "Selvam P", phone: "+91 94433 76120", channel: "WhatsApp",
    location: "Madurai", product: "500ml Rectangular Container", quantity: 30000, stage: "QUALIFIED", owner: "Meena", aiAgent: "Lead Qualification AI",
    createdDaysAgo: 2, nextAction: { text: "Prepare quotation", dueInHours: 20 },
    history: [["Factory Concierge AI", "Started chat on website"], ["Lead Qualification AI", "Qualified — score 82"]],
  },
  {
    id: "L-1004", company: "Kovai Cloud Kitchens", contactName: "Vignesh R", phone: "+91 90031 55408", channel: "WhatsApp",
    location: "Coimbatore", product: "1000ml Round Container", quantity: 25000, stage: "QUOTATION", owner: "Divya", aiAgent: "Quotation AI",
    createdDaysAgo: 3, nextAction: { text: "MD to approve quote", dueInHours: 1 },
    quotes: [{ status: "PENDING_APPROVAL", ageHours: 2 }],
    history: [["Lead Qualification AI", "Qualified — score 76"], ["Quotation AI", "Created quote, waiting for approval"]],
  },
  {
    id: "L-1005", company: "FreshBox Meals", contactName: "Sneha Reddy", phone: "+91 98490 30217", channel: "Email",
    location: "Hyderabad", product: "750ml Round Container", quantity: 40000, stage: "QUOTATION", owner: "Arun", aiAgent: "Follow-up AI",
    createdDaysAgo: 5, nextAction: { text: "Follow up on quote", dueInHours: -6 },
    quotes: [{ status: "SENT", ageHours: 50 }],
    history: [["Quotation AI", "Created quote"], ["MD", "Approved quote"], ["Communication AI", "Sent quote by email"]],
  },
  {
    id: "L-1045", company: "Annapoorna Ready Foods", contactName: "Karthik Raman", phone: "+91 97890 41256", channel: "WhatsApp",
    location: "Coimbatore", product: "750ml Round Container", quantity: 50000, stage: "NEGOTIATION", owner: "Divya", aiAgent: "Negotiation AI",
    createdDaysAgo: 6, nextAction: { text: "MD to approve ₹8.70 counter-offer", dueInHours: 2 }, requestedPrice: 8.5,
    quotes: [{ status: "SENT", ageHours: 70 }, { unitPrice: 8.7, status: "PENDING_APPROVAL", ageHours: 1 }],
    history: [
      ["Communication AI", "Sent quote on WhatsApp"],
      ["Customer", "Asked for ₹8.50 per piece"],
      ["Negotiation AI", "Below AI limit — sent ₹8.70 counter-offer for approval"],
    ],
  },
  {
    id: "L-1007", company: "Spice Route Catering", contactName: "Joseph Mathew", phone: "+91 94470 66231", channel: "Phone",
    location: "Kochi", product: "450ml Foil Container", quantity: 60000, stage: "READY_TO_CLOSE", owner: "Meena", aiAgent: "Deal Closer AI",
    createdDaysAgo: 9, nextAction: { text: "Send proforma invoice", dueInHours: 4 },
    quotes: [{ unitPrice: 6.6, status: "ACCEPTED", ageHours: 30 }],
    history: [["Negotiation AI", "Agreed at ₹6.60"], ["Customer", "Accepted the quote"]],
  },
  {
    id: "L-1008", company: "Tiffin Express", contactName: "Amit Deshpande", phone: "+91 98220 47195", channel: "WhatsApp",
    location: "Pune", product: "250ml Sauce Cup", quantity: 100000, stage: "PAYMENT", owner: "Arun", aiAgent: "Deal Closer AI",
    createdDaysAgo: 12, nextAction: { text: "Confirm 50% advance", dueInHours: 26 },
    quotes: [{ status: "ACCEPTED", ageHours: 80 }],
    history: [["Customer", "Accepted the quote"], ["Sales team", "Sent proforma invoice"]],
  },
  {
    id: "L-1009", company: "Royal Feast Banquets", contactName: "Farhan Ali", phone: "+91 98840 90314", channel: "Phone",
    location: "Chennai", product: "660ml Foil Container", quantity: 35000, stage: "WON", owner: "Meena", aiAgent: "Repeat Sales AI",
    createdDaysAgo: 20, nextAction: { text: "Reorder check-in", dueInHours: 24 * 52 },
    quotes: [{ status: "ACCEPTED", ageHours: 300 }],
    history: [["Sales team", "Payment received"], ["Repeat Sales AI", "Reorder check-in set for 2 months"]],
  },
  {
    id: "L-1010", company: "QuickBite Foods", contactName: "Rohit Shah", phone: "+91 98200 58831", channel: "Email",
    location: "Mumbai", product: "500ml Rectangular Container", quantity: 18000, stage: "LOST", owner: "Divya", aiAgent: "—",
    createdDaysAgo: 15, lossReason: "Price too high",
    quotes: [{ status: "SENT", ageHours: 200 }],
    history: [["Communication AI", "Sent quote by email"], ["Sales team", "Marked lost: price too high"]],
  },
];

const toIso = (ms: number) => new Date(ms).toISOString();

function buildQuotes(seed: LeadSeed, now: number): Quote[] {
  const product = findProduct(seed.product);
  const quoteNumber = `Q-${seed.id.slice(2)}`;
  return (seed.quotes ?? []).map((quoteSeed, index) => {
    const createdAt = now - quoteSeed.ageHours * HOUR;
    return {
      id: `${quoteNumber}-v${index + 1}`,
      number: quoteNumber,
      version: index + 1,
      leadId: seed.id,
      unitPrice: quoteSeed.unitPrice ?? product.unitPrice,
      unitCost: product.unitCost,
      quantity: seed.quantity,
      status: quoteSeed.status,
      createdAt: toIso(createdAt),
      approvalDeadline: toIso(createdAt + APPROVAL_WINDOW_HOURS * HOUR),
      decision: quoteSeed.status === "PENDING_APPROVAL" ? undefined : { by: "MD", at: toIso(createdAt + HOUR), comment: "" },
    };
  });
}

function buildActivities(seed: LeadSeed, createdAt: number, now: number): Activity[] {
  // Spread entries evenly so the latest one lands an hour ago.
  const step = (now - HOUR - createdAt) / seed.history.length;
  return seed.history.map(([actor, text], index) => ({
    id: `A-${seed.id}-${index}`,
    leadId: seed.id,
    at: toIso(createdAt + step * (index + 1)),
    actor,
    text,
  }));
}

export function createMockData(now: number): CrmData {
  const data: CrmData = { leads: [], quotes: [], activities: [] };
  for (const seed of LEAD_SEEDS) {
    const createdAt = now - seed.createdDaysAgo * DAY - 3 * HOUR;
    const lead: Lead = {
      id: seed.id,
      company: seed.company,
      contactName: seed.contactName,
      phone: seed.phone,
      email: `${seed.contactName.split(" ")[0].toLowerCase()}@${seed.company.toLowerCase().replace(/[^a-z]/g, "")}.in`,
      channel: seed.channel,
      location: seed.location,
      product: seed.product,
      quantity: seed.quantity,
      targetDate: toIso(createdAt + 30 * DAY),
      source: seed.channel === "Email" ? "Email" : "Website chat",
      stage: seed.stage,
      owner: seed.owner,
      aiAgent: seed.aiAgent,
      createdAt: toIso(createdAt),
      nextAction: seed.nextAction ? { text: seed.nextAction.text, dueAt: toIso(now + seed.nextAction.dueInHours * HOUR) } : null,
      requestedPrice: seed.requestedPrice,
      lossReason: seed.lossReason,
    };
    data.leads.push(lead);
    data.quotes.push(...buildQuotes(seed, now));
    data.activities.push(...buildActivities(seed, createdAt, now));
  }
  return data;
}

export const MOCK_LEAD_IDS = LEAD_SEEDS.map((seed) => seed.id);
