"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { DailyCount } from "@/data/mock-analytics";
import { SegmentedControl } from "@/components/ui";

const RANGES = [
  { id: "7", label: "Week" },
  { id: "14", label: "2 weeks" },
  { id: "30", label: "Month" },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

const PLOT_HEIGHT_PX = 160;

function niceMax(value: number): number {
  return Math.max(5, Math.ceil(value / 5) * 5);
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Daily enquiries as pill columns: past days in grey, today in black with its value on the cap. */
export function EnquiryTrendChart({ days: allDays }: { days: DailyCount[] }) {
  const [range, setRange] = useState<RangeId>("14");
  const days = allDays.slice(-Number(range));
  const maxTick = niceMax(Math.max(...days.map((day) => day.count)));
  const ticks = [maxTick, maxTick / 2, 0];
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const lastIndex = days.length - 1;

  return (
    <figure>
      <figcaption className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span>
          <span className="block text-lg font-medium tracking-tight">Enquiries</span>
          <span className="text-sm text-neutral-500">{total} in the last {range} days</span>
        </span>
        <SegmentedControl options={RANGES} value={range} onChange={setRange} label="Date range" />
      </figcaption>

      <div className="flex gap-3">
        {/* Y axis */}
        <div className="flex flex-col justify-between text-right text-[11px] text-neutral-400 tabular-nums" style={{ height: PLOT_HEIGHT_PX }} aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="-my-1.5 leading-3">
              {tick}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* Hairline gridlines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: PLOT_HEIGHT_PX }} aria-hidden>
            {ticks.map((tick) => (
              <div key={tick} className={`h-px ${tick === 0 ? "bg-neutral-300" : "bg-neutral-100"}`} />
            ))}
          </div>

          <div className="group/plot relative flex items-end" style={{ height: PLOT_HEIGHT_PX }}>
            {days.map((day, index) => {
              const isToday = index === lastIndex;
              return (
                <div
                  key={day.date}
                  tabIndex={0}
                  aria-label={`${isToday ? "Today" : shortDate(day.date)}: ${day.count} enquiries`}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                >
                  <motion.div
                    key={range}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * (0.4 / days.length), ease: [0.2, 0.7, 0.2, 1] }}
                    className={`w-full max-w-5 origin-bottom rounded-full mx-[2px] transition-[background-color,opacity] duration-200 group-hover/plot:opacity-40 group-hover:opacity-100! ${
                      isToday ? "bg-black" : "bg-black/15 group-hover:bg-black group-focus-visible:bg-black"
                    }`}
                    style={{ height: `${(day.count / maxTick) * 100}%` }}
                  />
                  {isToday && (
                    <span className="absolute text-xs font-semibold" style={{ bottom: `calc(${(day.count / maxTick) * 100}% + 6px)` }}>
                      {day.count}
                    </span>
                  )}
                  {/* Hover / focus tooltip */}
                  <span className="pointer-events-none absolute bottom-full z-10 mb-2 rounded-full bg-black px-2.5 py-1 text-[11px] whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {isToday ? "Today" : shortDate(day.date)} · {day.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* X axis: first and last day only */}
          <div className="mt-2 flex justify-between text-[11px] text-neutral-400" aria-hidden>
            <span>{shortDate(days[0].date)}</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>Enquiries per day</caption>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{shortDate(day.date)}</th>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
