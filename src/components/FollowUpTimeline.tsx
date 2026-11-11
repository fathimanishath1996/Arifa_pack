"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { isClosedStage } from "@/config/stages";
import type { Lead } from "@/lib/types";
import { Avatar, enterDelay } from "@/components/ui";

const HOUR = 3_600_000;
const HOURS_BEFORE_NOW = 6;
const WINDOW_HOURS = 12;
const TICK_EVERY_HOURS = 2;
const ROW_LIMIT = 6;

const hourLabel = (ms: number) => new Date(ms).toLocaleTimeString("en-IN", { hour: "numeric" });

function timelineWindow(now: number) {
  const start = new Date(now).setMinutes(0, 0, 0) - HOURS_BEFORE_NOW * HOUR;
  return { start, end: start + WINDOW_HOURS * HOUR };
}

/** The follow-ups the timeline shows, so other lists can skip them instead of repeating them. */
export function timelineFollowUps(leads: Lead[], now: number) {
  const { start, end } = timelineWindow(now);
  return leads
    .filter((lead) => lead.nextAction && !isClosedStage(lead.stage))
    .map((lead) => ({ lead, dueMs: new Date(lead.nextAction!.dueAt).getTime() }))
    .filter(({ dueMs }) => dueMs >= start && dueMs <= end)
    .sort((a, b) => a.dueMs - b.dueMs)
    .slice(0, ROW_LIMIT);
}

/** Follow-ups around "now" as black pills on a time track, one deal per row. */
export function FollowUpTimeline({ leads, now, index }: { leads: Lead[]; now: number; index: number }) {
  const { start: windowStart, end: windowEnd } = timelineWindow(now);
  const percentOf = (ms: number) => ((ms - windowStart) / (windowEnd - windowStart)) * 100;
  const ticks = Array.from({ length: WINDOW_HOURS / TICK_EVERY_HOURS + 1 }, (_, tick) => windowStart + tick * TICK_EVERY_HOURS * HOUR);
  const rows = timelineFollowUps(leads, now);

  return (
    <section className="animate-enter lift panel p-6" style={enterDelay(index)}>
      <h2 className="mb-5 text-lg font-medium tracking-tight">Follow-up timeline</h2>

      <div className="relative">
        {/* Dashed hour lines and the solid "now" line, behind the pills. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 left-20 sm:left-36" aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="absolute inset-y-0 border-l border-dashed border-neutral-200" style={{ left: `${percentOf(tick)}%` }} />
          ))}
          <span className="absolute inset-y-0 w-px bg-black" style={{ left: `${percentOf(now)}%` }}>
            <span className="absolute -top-1 -left-[3px] size-[7px] rounded-full bg-black" />
          </span>
        </div>

        <ul className="relative space-y-1">
          {rows.map(({ lead, dueMs }, rowIndex) => {
            const position = percentOf(dueMs);
            const isOverdue = dueMs < now;
            return (
              <li key={lead.id} className="group grid h-11 grid-cols-[5rem_1fr] items-center rounded-full transition-colors hover:bg-black/[0.03] sm:grid-cols-[9rem_1fr]">
                <span className="truncate pr-3 pl-2 text-xs text-neutral-500 transition-colors group-hover:font-medium group-hover:text-black">{lead.company}</span>
                <div className="relative h-full">
                  <motion.div
                    className="absolute top-1/2"
                    // Shifting by the same share as the position keeps the pill inside the track at both ends.
                    style={{ left: `${position}%`, translate: `-${position}% -50%` }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + rowIndex * 0.06 }}
                  >
                    <Link
                      href={`/leads/${lead.id}`}
                      title={`${lead.nextAction!.text} · ${hourLabel(dueMs)}`}
                      className={`flex items-center gap-2 rounded-full py-1 pr-1 pl-3 text-[11px] font-medium whitespace-nowrap shadow-md transition-all duration-200 hover:scale-[1.06] hover:shadow-lg ${isOverdue ? "bg-white text-black ring-1 ring-black" : "bg-black text-white"}`}
                    >
                      <span className="max-w-24 truncate sm:max-w-44">{isOverdue ? `Overdue · ${lead.nextAction!.text}` : lead.nextAction!.text}</span>
                      <Avatar name={lead.owner} />
                    </Link>
                  </motion.div>
                </div>
              </li>
            );
          })}
        </ul>
        {rows.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">No follow-ups in these hours</p>}

        <div className="relative mt-3 ml-20 h-4 text-[11px] text-neutral-400 sm:ml-36" aria-hidden>
          {ticks.map((tick, tickIndex) => (
            <span
              key={tick}
              className={`absolute whitespace-nowrap ${tickIndex % 2 === 1 ? "hidden sm:inline" : ""}`}
              style={{ left: `${percentOf(tick)}%`, transform: tickIndex === 0 ? "none" : tickIndex === ticks.length - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {hourLabel(tick)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
