export type Role = "TEAM" | "MANAGER" | "MD";

export type StageId = "NEW" | "QUALIFIED" | "QUOTATION" | "NEGOTIATION" | "READY_TO_CLOSE" | "PAYMENT" | "WON" | "LOST";

export type Channel = "WhatsApp" | "Email" | "Phone";

export interface NextAction {
  text: string;
  dueAt: string;
}

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  channel: Channel;
  location: string;
  product: string;
  quantity: number;
  targetDate: string;
  source: string;
  stage: StageId;
  owner: string;
  aiAgent: string;
  createdAt: string;
  nextAction: NextAction | null;
  /** Unit price the customer asked for while bargaining. */
  requestedPrice?: number;
  lossReason?: string;
}

export type QuoteStatus = "PENDING_APPROVAL" | "CORRECTION_REQUESTED" | "REJECTED" | "SENT" | "ACCEPTED";

export interface QuoteDecision {
  by: string;
  at: string;
  comment: string;
}

export interface Quote {
  id: string;
  number: string;
  version: number;
  leadId: string;
  unitPrice: number;
  /** Factory cost per piece. MD only. */
  unitCost: number;
  quantity: number;
  status: QuoteStatus;
  createdAt: string;
  approvalDeadline: string;
  decision?: QuoteDecision;
}

export interface Activity {
  id: string;
  leadId: string;
  at: string;
  actor: string;
  text: string;
}

export interface CrmData {
  leads: Lead[];
  quotes: Quote[];
  activities: Activity[];
}
