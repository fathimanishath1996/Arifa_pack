import type { CrmData, Role } from "@/lib/types";

export const ROLES: Role[] = ["TEAM", "MANAGER", "MD"];

export const ROLE_LABEL: Record<Role, string> = {
  TEAM: "Sales team",
  MANAGER: "Manager",
  MD: "MD",
};

/** Who is "logged in" for each role in the demo. Real names come from login later. */
export const DEMO_USER_NAME: Record<Role, string> = {
  TEAM: "Divya",
  MANAGER: "Suresh Kumar",
  MD: "Ravi Shankar",
};

/** Sales people a deal can be assigned to. */
export const SALES_OWNERS = ["Divya", "Arun", "Meena"];

export type Permission = "APPROVE_QUOTES" | "SEE_PROFIT" | "REASSIGN_DEALS" | "SEE_ALL_DEALS";

const PERMISSIONS: Record<Permission, Role[]> = {
  APPROVE_QUOTES: ["MANAGER", "MD"],
  SEE_PROFIT: ["MANAGER", "MD"],
  REASSIGN_DEALS: ["MANAGER", "MD"],
  SEE_ALL_DEALS: ["MANAGER", "MD"],
};

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(role);
}

/** Trims the data to what this role may see. The backend must apply the same rule. */
export function scopeDataForRole(data: CrmData, role: Role): CrmData {
  if (can(role, "SEE_ALL_DEALS")) return data;
  const ownLeads = data.leads.filter((lead) => lead.owner === DEMO_USER_NAME[role]);
  const ownLeadIds = new Set(ownLeads.map((lead) => lead.id));
  return {
    leads: ownLeads,
    quotes: data.quotes.filter((quote) => ownLeadIds.has(quote.leadId)),
    activities: data.activities.filter((activity) => ownLeadIds.has(activity.leadId)),
  };
}
