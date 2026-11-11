"use client";

import { Bell, CalendarDays, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { can } from "@/config/roles";
import { formatRelative } from "@/lib/format";
import type { CrmData, Role } from "@/lib/types";
import { useDismiss } from "@/hooks/useDismiss";
import { useCrm, useNow } from "@/store/crm-store";
import { openCommandPalette } from "@/components/CommandPalette";
import { Avatar } from "@/components/ui";

const ATTENTION_LIMIT = 6;

interface AttentionItem {
  key: string;
  leadId: string;
  company: string;
  detail: string;
  dueAt: string;
}

/** Things that need someone now: quotes waiting for approval and overdue follow-ups. */
function attentionItems(data: CrmData, role: Role, now: number): AttentionItem[] {
  const companyById = new Map(data.leads.map((lead) => [lead.id, lead.company]));
  const approvals = data.quotes
    .filter((quote) => quote.status === "PENDING_APPROVAL")
    .map((quote) => ({
      key: quote.id,
      leadId: quote.leadId,
      company: companyById.get(quote.leadId) ?? "",
      detail: can(role, "APPROVE_QUOTES") ? `${quote.number} needs your approval` : `${quote.number} waiting for approval`,
      dueAt: quote.approvalDeadline,
    }));
  const overdueFollowUps = data.leads
    .filter((lead) => lead.nextAction && new Date(lead.nextAction.dueAt).getTime() < now)
    .map((lead) => ({ key: lead.id, leadId: lead.id, company: lead.company, detail: `Overdue · ${lead.nextAction!.text}`, dueAt: lead.nextAction!.dueAt }));
  return [...approvals, ...overdueFollowUps].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

function AttentionBell() {
  const { data, role } = useCrm();
  const now = useNow();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(containerRef, isOpen, useCallback(() => setIsOpen(false), []));
  const items = data && now !== null ? attentionItems(data, role, now) : [];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${items.length} items need attention`}
        className="group/bell relative z-40 press glass grid size-11 place-items-center rounded-full shadow-sm hover:bg-white"
      >
        <Bell className="size-4 origin-top transition-transform group-hover/bell:animate-[ring_0.6s_ease-in-out]" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1.5 text-[10px] font-semibold text-white ring-2 ring-white tabular-nums">
            {items.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Needs attention"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            className="absolute top-full right-0 z-40 mt-2 w-80 rounded-3xl bg-white/85 p-2 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5"
          >
            <p className="px-3 pt-2 pb-2 text-sm font-semibold">Needs attention</p>
            {items.slice(0, ATTENTION_LIMIT).map((item) => (
              <Link
                key={item.key}
                href={`/leads/${item.leadId}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-full px-2 py-1.5 transition-all hover:translate-x-1 hover:bg-neutral-100"
              >
                <Avatar name={item.company} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.company}</span>
                  <span className="block truncate text-xs text-neutral-500">{item.detail}</span>
                </span>
                {now !== null && <span className="shrink-0 pr-2 text-[11px] text-neutral-400">{formatRelative(item.dueAt, now)}</span>}
              </Link>
            ))}
            {items.length === 0 && <p className="px-3 pb-4 text-sm text-neutral-400">Nothing needs you right now.</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DatePill() {
  const now = useNow();
  return (
    <div className="lift glass hidden h-11 items-center gap-2.5 rounded-full px-4 text-sm shadow-sm sm:flex">
      <CalendarDays className="size-4" />
      {now !== null && (
        <span className="tabular-nums">
          {new Date(now).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          <span className="text-neutral-400"> · {new Date(now).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
        </span>
      )}
    </div>
  );
}

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-2 px-1 pt-1 pb-5 md:px-4 md:pb-7">
      <DatePill />
      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          onClick={openCommandPalette}
          aria-label="Search (Ctrl+K)"
          className="group press glass flex h-11 flex-1 items-center gap-3 rounded-full py-1.5 pr-4 pl-1.5 text-sm text-neutral-400 shadow-sm hover:bg-white hover:text-black sm:w-80 sm:flex-none"
        >
          <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-90">
            <Search className="size-3.5" />
          </span>
          <span className="flex-1 text-left">Search leads…</span>
          <kbd className="hidden rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500 sm:inline">Ctrl K</kbd>
        </button>
        <AttentionBell />
      </div>
    </header>
  );
}
