"use client";

import { AlarmClock, ArrowRight, CalendarClock, CircleCheck, FileClock, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { can } from "@/config/roles";
import { STAGES, isClosedStage } from "@/config/stages";
import { createDailyEnquiries } from "@/data/mock-analytics";
import { formatCompactMoney, formatCount, formatRelative } from "@/lib/format";
import { dealValue, latestQuote, quoteTotal } from "@/lib/quote";
import type { CrmData, Lead } from "@/lib/types";
import { useCrm, useNow } from "@/store/crm-store";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ApprovalTimerRing } from "@/components/charts/ApprovalTimerRing";
import { EnquiryTrendChart } from "@/components/charts/EnquiryTrendChart";
import { FollowUpTimeline, timelineFollowUps } from "@/components/FollowUpTimeline";
import { showToast } from "@/components/Toaster";
import { type StageValue, StageValueChart } from "@/components/charts/StageValueChart";
import { Avatar, LoadingState, StatCard, enterDelay } from "@/components/ui";

const FOLLOW_UP_LIMIT = 6;
const AI_FEED_LIMIT = 8;
const AI_FEED_PREVIEW = 3;
const LIST_SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;

function greetingFor(now: number): string {
  const hour = new Date(now).getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function isDueToday(iso: string, now: number): boolean {
  return new Date(iso).toDateString() === new Date(now).toDateString();
}

function Panel({ title, count, index, children }: { title: string; count?: number; index: number; children: ReactNode }) {
  return (
    <section className="animate-enter lift panel" style={enterDelay(index)}>
      <header className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {count !== undefined && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-black px-2 text-xs font-semibold text-white tabular-nums transition-transform hover:scale-110">{count}</span>}
      </header>
      {children}
    </section>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 px-6 pt-1 pb-6 text-sm text-neutral-400">
      <CircleCheck className="size-4" /> {text}
    </p>
  );
}

interface LeadRowProps {
  lead: Lead;
  detail: string;
  trailing: ReactNode;
  isUrgent?: boolean;
  leading?: ReactNode;
  /** Quick action shown on hover, so common work is done without opening the lead. */
  action?: { label: string; onClick: () => void };
}

/** One clickable row that leads to a lead page. */
function LeadRow({ lead, detail, trailing, isUrgent = false, leading, action }: LeadRowProps) {
  return (
    <motion.li layout transition={LIST_SPRING} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="group relative">
      <Link
        href={`/leads/${lead.id}`}
        className={`flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5 transition-all duration-200 group-hover:translate-x-1 group-hover:bg-white/70 group-hover:shadow-sm ${isUrgent ? "border-black" : "border-neutral-200 group-hover:border-neutral-400"}`}
      >
        {leading ?? <Avatar name={lead.company} size="md" inverted={isUrgent} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{lead.company}</p>
          <p className="truncate text-xs text-neutral-500">{detail}</p>
        </div>
        <span className={`shrink-0 text-xs tabular-nums transition-opacity ${isUrgent ? "font-semibold" : "text-neutral-500"} ${action ? "group-hover:opacity-0" : ""}`}>
          {trailing}
        </span>
        <ArrowRight className="size-4 shrink-0 -translate-x-1 text-neutral-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </Link>
      {action && (
        <button
          onClick={action.onClick}
          className="absolute top-1/2 right-11 -translate-y-1/2 press rounded-full bg-black px-3.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-neutral-800 focus-visible:opacity-100"
        >
          {action.label}
        </button>
      )}
    </motion.li>
  );
}

function ApprovalsPanel({ data, now }: { data: CrmData; now: number }) {
  const { role, decideQuote } = useCrm();
  const pendingQuotes = data.quotes.filter((quote) => quote.status === "PENDING_APPROVAL").sort((a, b) => a.approvalDeadline.localeCompare(b.approvalDeadline));
  return (
    <Panel title="Waiting for approval" count={pendingQuotes.length} index={5}>
      <ul className="space-y-2 px-4 pb-4">
        <AnimatePresence initial={false}>
          {pendingQuotes.map((quote) => {
            const lead = data.leads.find((item) => item.id === quote.leadId)!;
            const isOverdue = new Date(quote.approvalDeadline).getTime() < now;
            return (
              <LeadRow
                key={quote.id}
                lead={lead}
                detail={`${quote.number} v${quote.version} · ${formatCompactMoney(quoteTotal(quote))}`}
                trailing={isOverdue ? "Overdue" : formatRelative(quote.approvalDeadline, now)}
                isUrgent={isOverdue}
                leading={
                  <span className="grid size-8 place-items-center">
                    <ApprovalTimerRing deadline={quote.approvalDeadline} now={now} />
                  </span>
                }
                action={
                  can(role, "APPROVE_QUOTES")
                    ? {
                        label: "Approve",
                        onClick: () => {
                          decideQuote(quote.id, "APPROVE", "");
                          showToast(`${lead.company}: quote approved and sent`);
                        },
                      }
                    : undefined
                }
              />
            );
          })}
        </AnimatePresence>
      </ul>
      {pendingQuotes.length === 0 && <EmptyRow text="Nothing waiting" />}
    </Panel>
  );
}

/** Follow-ups the timeline does not already show. */
function otherFollowUps(leads: Lead[], now: number): Lead[] {
  const onTimeline = new Set(timelineFollowUps(leads, now).map(({ lead }) => lead.id));
  return leads
    .filter((lead) => lead.nextAction && lead.stage !== "WON" && !onTimeline.has(lead.id))
    .sort((a, b) => a.nextAction!.dueAt.localeCompare(b.nextAction!.dueAt))
    .slice(0, FOLLOW_UP_LIMIT);
}

/** One small line instead of an empty card when there is nothing else to follow up. */
function CaughtUpNote() {
  return (
    <p className="animate-enter glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm text-neutral-500 shadow-sm">
      <CircleCheck className="size-4" /> Other follow-ups: all caught up
    </p>
  );
}

function FollowUpsPanel({ followUps, now }: { followUps: Lead[]; now: number }) {
  return (
    <Panel title="Other follow-ups" index={6}>
      <ul className="space-y-2 px-4 pb-4">
        <AnimatePresence initial={false}>
          {followUps.map((lead) => {
            const isOverdue = new Date(lead.nextAction!.dueAt).getTime() < now;
            return (
              <LeadRow
                key={lead.id}
                lead={lead}
                detail={lead.nextAction!.text}
                trailing={isOverdue ? `Overdue ${formatRelative(lead.nextAction!.dueAt, now)}` : formatRelative(lead.nextAction!.dueAt, now)}
                isUrgent={isOverdue}
              />
            );
          })}
        </AnimatePresence>
      </ul>
    </Panel>
  );
}

function NewLeadsPanel({ leads, now }: { leads: Lead[]; now: number }) {
  const { moveToNextStage } = useCrm();
  const newLeads = leads.filter((lead) => lead.stage === "NEW").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <Panel title="New leads" count={newLeads.length} index={7}>
      <ul className="space-y-2 px-4 pb-4">
        <AnimatePresence initial={false}>
          {newLeads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              detail={`${lead.product} · ${formatCount(lead.quantity)} pcs`}
              trailing={formatRelative(lead.createdAt, now)}
              action={{
                label: "Qualify",
                onClick: () => {
                  moveToNextStage(lead.id);
                  showToast(`${lead.company} moved to Qualified`);
                },
              }}
            />
          ))}
        </AnimatePresence>
      </ul>
      {newLeads.length === 0 && <EmptyRow text="No new leads" />}
    </Panel>
  );
}

function AiActivityFeed({ data, now }: { data: CrmData; now: number }) {
  const companyById = new Map(data.leads.map((lead) => [lead.id, lead.company]));
  const [isExpanded, setIsExpanded] = useState(false);
  const allActivities = data.activities
    .filter((activity) => activity.actor.endsWith("AI"))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, AI_FEED_LIMIT);
  const aiActivities = isExpanded ? allActivities : allActivities.slice(0, AI_FEED_PREVIEW);

  return (
    <Panel title="AI activity" index={8}>
      <ol className="space-y-1 px-3 pb-4">
        <AnimatePresence initial={false}>
          {aiActivities.map((activity) => (
            <motion.li
              key={activity.id}
              layout
              transition={LIST_SPRING}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 rounded-2xl p-2.5 transition-all duration-200 hover:translate-x-1 hover:bg-white/70"
            >
              <Avatar name={activity.actor} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.actor}</span> <span className="text-neutral-400">· {formatRelative(activity.at, now)}</span>
                </p>
                <p className="mt-0.5 text-sm text-neutral-600">{activity.text}</p>
                <Link href={`/leads/${activity.leadId}`} className="mt-1 inline-block text-xs text-neutral-500 underline-offset-2 hover:text-black hover:underline">
                  {companyById.get(activity.leadId)}
                </Link>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {allActivities.length > AI_FEED_PREVIEW && (
        <button onClick={() => setIsExpanded((expanded) => !expanded)} className="press mx-6 mb-5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-black/5 hover:text-black">
          {isExpanded ? "Show less" : `Show all ${allActivities.length}`}
        </button>
      )}
    </Panel>
  );
}

function openValueByStage(data: CrmData): StageValue[] {
  return STAGES.filter((stage) => !isClosedStage(stage.id)).map((stage) => {
    const leads = data.leads.filter((lead) => lead.stage === stage.id);
    const value = leads.reduce((sum, lead) => sum + dealValue(lead, latestQuote(data.quotes, lead.id)), 0);
    return { label: stage.label, value, dealCount: leads.length };
  });
}

function ChartCard({ index, className = "", isDark = false, children }: { index: number; className?: string; isDark?: boolean; children: ReactNode }) {
  return (
    <section className={`animate-enter lift p-6 ${isDark ? "panel-dark" : "panel"} ${className}`} style={enterDelay(index)}>
      {children}
    </section>
  );
}

export function TodayDashboard() {
  const { data, role } = useCrm();
  const now = useNow();
  if (!data || now === null) return <LoadingState />;

  const overdueCount = data.leads.filter((lead) => lead.nextAction && new Date(lead.nextAction.dueAt).getTime() < now).length;
  const dueTodayCount = data.leads.filter((lead) => lead.nextAction && isDueToday(lead.nextAction.dueAt, now) && new Date(lead.nextAction.dueAt).getTime() >= now).length;
  const pendingCount = data.quotes.filter((quote) => quote.status === "PENDING_APPROVAL").length;
  const newLeadCount = data.leads.filter((lead) => lead.stage === "NEW").length;
  const taskCount = overdueCount + dueTodayCount + (can(role, "APPROVE_QUOTES") ? pendingCount : 0);
  const dailyEnquiries = createDailyEnquiries(now);
  const laterFollowUps = otherFollowUps(data.leads, now);
  const hasLaterFollowUps = laterFollowUps.length > 0;

  return (
    <div className="space-y-4 md:space-y-5">
      <header className="animate-enter mb-2">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">{greetingFor(now)}</h1>
        <p className="mt-2 text-sm text-neutral-500">{taskCount > 0 ? `You have ${taskCount} things to do today.` : "You're all caught up."}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={1} icon={CalendarClock} label="Due today" value={<AnimatedNumber value={dueTodayCount} />} />
        <StatCard index={2} icon={AlarmClock} label="Overdue" value={<AnimatedNumber value={overdueCount} />} />
        <StatCard index={3} icon={FileClock} label="Waiting for approval" value={<AnimatedNumber value={pendingCount} />} />
        <StatCard index={4} icon={UserPlus} label="New leads" value={<AnimatedNumber value={newLeadCount} />} />
      </div>

      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FollowUpTimeline leads={data.leads} now={now} index={5} />
        </div>
        <ApprovalsPanel data={data} now={now} />
      </div>

      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        <ChartCard index={6} className="lg:col-span-2">
          <EnquiryTrendChart days={dailyEnquiries} />
        </ChartCard>
        <ChartCard index={7} isDark>
          <StageValueChart stages={openValueByStage(data)} />
        </ChartCard>
      </div>

      {!hasLaterFollowUps && <CaughtUpNote />}
      <div className={`grid items-start gap-4 md:gap-5 ${hasLaterFollowUps ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {hasLaterFollowUps && <FollowUpsPanel followUps={laterFollowUps} now={now} />}
        <NewLeadsPanel leads={data.leads} now={now} />
        <AiActivityFeed data={data} now={now} />
      </div>
    </div>
  );
}
