"use client";

import { ArrowLeft, Bot, CalendarDays, Clock, IndianRupee, Package, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SALES_OWNERS, can } from "@/config/roles";
import { isClosedStage, nextStageOf, stageLabel } from "@/config/stages";
import { formatCompactMoney, formatCount, formatDate, formatDateTime, formatRelative } from "@/lib/format";
import { canAdvance } from "@/lib/lead-flow";
import { dealValue, quotesForLead } from "@/lib/quote";
import type { Activity, Lead, NextAction, Quote } from "@/lib/types";
import { useCrm, useNow } from "@/store/crm-store";
import { QuotePanel } from "@/components/QuotePanel";
import { StageProgress } from "@/components/StageProgress";
import { showToast } from "@/components/Toaster";
import { Avatar, Button, DetailList, LoadingState, Section, StageTag, StatCard, enterDelay } from "@/components/ui";

function NextActionBar({ nextAction }: { nextAction: NextAction }) {
  const now = useNow();
  const isOverdue = now !== null && new Date(nextAction.dueAt).getTime() < now;
  return (
    <div
      style={enterDelay(2)}
      className={`animate-enter lift flex flex-wrap items-center justify-between gap-2 rounded-3xl py-2 pr-5 pl-2 text-sm sm:rounded-full shadow-sm ${isOverdue ? "bg-black text-white" : "glass"}`}
    >
      <span className="flex items-center gap-2.5">
        <span className={`grid size-8 shrink-0 place-items-center rounded-full ${isOverdue ? "bg-white text-black" : "bg-black text-white"}`}>
          <Clock className="size-4" />
        </span>
        <span>
          <span className="font-semibold">Next:</span> {nextAction.text}
        </span>
      </span>
      {now !== null && (
        <span className={`pl-10 font-medium sm:pl-0 ${isOverdue ? "" : "text-neutral-500"}`}>
          {isOverdue ? `Overdue · ${formatRelative(nextAction.dueAt, now)}` : formatRelative(nextAction.dueAt, now)}
        </span>
      )}
    </div>
  );
}

function StageActions({ lead, latestQuote }: { lead: Lead; latestQuote: Quote | undefined }) {
  const { moveToNextStage, markLost } = useCrm();
  const [isMarkingLost, setIsMarkingLost] = useState(false);
  const [lossReason, setLossReason] = useState("");

  if (isClosedStage(lead.stage)) return null;

  const nextStage = nextStageOf(lead.stage);
  const advanceCheck = canAdvance(lead, latestQuote);

  if (isMarkingLost) {
    return (
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!lossReason.trim()) return;
          markLost(lead.id, lossReason.trim());
          showToast(`${lead.company} marked lost`);
          setIsMarkingLost(false);
        }}
      >
        <input
          autoFocus
          value={lossReason}
          onChange={(event) => setLossReason(event.target.value)}
          placeholder="Reason, e.g. price too high"
          className="h-10 w-64 glass rounded-full transition-shadow focus:shadow-md px-4 text-sm shadow-sm outline-none placeholder:text-neutral-400 focus:border-black"
        />
        <Button type="submit" disabled={!lossReason.trim()}>
          Mark lost
        </Button>
        <Button type="button" variant="secondary" onClick={() => setIsMarkingLost(false)}>
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      {/* Why moving is blocked shows on hover; the Next bar below already says what is pending. */}
      <div className="flex gap-2" title={advanceCheck.allowed ? undefined : advanceCheck.reason}>
        <Button variant="secondary" onClick={() => setIsMarkingLost(true)}>
          Mark lost
        </Button>
        {nextStage && (
          <Button
            onClick={() => {
              moveToNextStage(lead.id);
              showToast(`Moved to ${stageLabel(nextStage)}`);
            }}
            disabled={!advanceCheck.allowed}
          >
            Move to {stageLabel(nextStage)}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Owner name; Manager and MD can reassign the deal right here. */
function OwnerValue({ lead }: { lead: Lead }) {
  const { role, reassignOwner } = useCrm();
  if (!can(role, "REASSIGN_DEALS")) {
    return (
      <span className="flex items-center gap-2">
        <Avatar name={lead.owner} /> {lead.owner}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <Avatar name={lead.owner} />
      <select
        value={lead.owner}
        onChange={(event) => {
          reassignOwner(lead.id, event.target.value);
          showToast(`${lead.company} reassigned to ${event.target.value}`);
        }}
        aria-label="Reassign owner"
        className="-ml-1 min-w-0 cursor-pointer rounded-full bg-transparent px-2 font-semibold outline-none transition-colors hover:bg-black/5"
      >
        {!SALES_OWNERS.includes(lead.owner) && (
          <option value={lead.owner} disabled>
            {lead.owner}
          </option>
        )}
        {SALES_OWNERS.map((owner) => (
          <option key={owner} value={owner}>
            {owner}
          </option>
        ))}
      </select>
    </span>
  );
}

function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <Section title="Activity" index={5}>
      <ol className="relative space-y-5 before:absolute before:top-1.5 before:bottom-1.5 before:left-[3px] before:w-px before:bg-neutral-200">
        {activities.map((activity, index) => (
          <li key={activity.id} className="group relative -mx-2 rounded-2xl py-1 pr-2 pl-7 transition-colors hover:bg-black/[0.04]">
            <span className={`absolute top-2.5 left-2 size-[7px] rounded-full transition-transform group-hover:scale-150 ${index === 0 ? "bg-black" : "bg-neutral-300"}`} />
            <p className="text-sm font-medium">{activity.actor}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{activity.text}</p>
            <p className="mt-1 text-xs text-neutral-400">{formatDateTime(activity.at)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function LeadDetail({ id }: { id: string }) {
  const { data } = useCrm();
  if (!data) return <LoadingState />;

  const lead = data.leads.find((item) => item.id === id);
  if (!lead) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-neutral-500">This lead doesn&apos;t exist or isn&apos;t assigned to you.</p>
        <Link href="/pipeline" className="mt-3 inline-block text-sm font-medium underline">
          Back to pipeline
        </Link>
      </div>
    );
  }

  const quotes = quotesForLead(data.quotes, lead.id);
  const activities = data.activities.filter((activity) => activity.leadId === lead.id).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="mx-auto max-w-6xl space-y-4 md:space-y-5">
      <Link href="/pipeline" className="group press glass inline-flex h-10 items-center gap-2 rounded-full pr-4 pl-3 text-sm font-medium shadow-sm transition-colors hover:bg-white">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Pipeline
      </Link>

      <header className="animate-enter flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={lead.company} size="lg" inverted />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-light tracking-tight md:text-5xl">{lead.company}</h1>
              <StageTag stage={lead.stage} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {lead.contactName} · {lead.location} · {lead.product}
            </p>
          </div>
        </div>
        <StageActions lead={lead} latestQuote={quotes[0]} />
      </header>

      <div className="animate-enter lift panel px-6 py-5" style={enterDelay(1)}>
        <StageProgress stage={lead.stage} />
      </div>

      {lead.nextAction && <NextActionBar nextAction={lead.nextAction} />}
      {lead.lossReason && (
        <p className="animate-enter lift rounded-full bg-black px-5 py-3 text-sm text-white shadow-sm" style={enterDelay(2)}>
          <span className="font-semibold">Lost:</span> {lead.lossReason}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={3} icon={IndianRupee} label="Deal value" value={formatCompactMoney(dealValue(lead, quotes[0]))} />
        <StatCard index={4} icon={Package} label="Quantity" value={formatCount(lead.quantity)} />
        <StatCard index={5} icon={CalendarDays} label="Delivery by" value={formatDate(lead.targetDate)} />
        <StatCard index={6} icon={UserRound} label="Owner" value={<OwnerValue lead={lead} />} />
      </div>

      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        <div className="space-y-4 md:space-y-5 lg:col-span-2">
          <QuotePanel lead={lead} quotes={quotes} />
          <Section title="Contact" index={5}>
            <DetailList
              items={[
                ["Name", lead.contactName],
                ["Phone", lead.phone],
                ["Email", lead.email],
                ["Prefers", lead.channel],
              ]}
            />
          </Section>
        </div>
        <div className="space-y-4 md:space-y-5">
          <div className="group animate-enter lift panel-dark flex items-center gap-4 p-5" style={enterDelay(3)}>
            <span className="grid size-12 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-10deg]">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="text-xs text-neutral-400">Handled by</p>
              <p className="mt-0.5 text-lg font-light tracking-tight">{lead.aiAgent}</p>
            </div>
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
}
