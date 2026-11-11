"use client";

import { motion } from "motion/react";
import { formatCompactMoney } from "@/lib/format";

export interface StageValue {
  label: string;
  value: number;
  dealCount: number;
}

/** White bars on a black card: open deal value per stage, in pipeline order, value at each bar tip. */
export function StageValueChart({ stages }: { stages: StageValue[] }) {
  const maxValue = Math.max(1, ...stages.map((stage) => stage.value));
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <figure>
      <figcaption className="mb-6">
        <span className="block text-lg font-medium tracking-tight">Open pipeline</span>
        <span className="mt-1 block text-4xl font-light tracking-tight tabular-nums">{formatCompactMoney(totalValue)}</span>
      </figcaption>
      <ul className="group/bars space-y-3.5">
        {stages.map((stage, index) => (
          <li
            key={stage.label}
            tabIndex={0}
            aria-label={`${stage.label}: ${formatCompactMoney(stage.value)}, ${stage.dealCount} deals`}
            className="group relative grid grid-cols-[96px_1fr] items-center gap-3 outline-none"
          >
            <span className="truncate text-xs text-neutral-400">{stage.label}</span>
            <div className="flex items-center gap-2">
              {stage.value > 0 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 + index * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
                  className="h-3 origin-left rounded-full bg-white transition-opacity duration-200 group-hover/bars:opacity-35 group-hover:opacity-100! group-focus-visible:opacity-100!"
                  style={{ width: `${(stage.value / maxValue) * 78}%` }}
                />
              )}
              <span className="text-xs font-medium whitespace-nowrap tabular-nums">{stage.value > 0 ? formatCompactMoney(stage.value) : <span className="text-neutral-600">—</span>}</span>
            </div>
            <span className="pointer-events-none absolute -top-7 left-[108px] z-10 rounded-full bg-white px-2.5 py-1 text-[11px] whitespace-nowrap text-black opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {stage.dealCount} {stage.dealCount === 1 ? "deal" : "deals"} · {formatCompactMoney(stage.value)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
