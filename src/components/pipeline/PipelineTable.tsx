"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { stageLabel } from "@/config/stages";
import { formatCompactMoney, formatCount, formatRelative, formatUnitPrice } from "@/lib/format";
import type { PipelineCard } from "@/lib/pipeline-cards";
import { useNow } from "@/store/crm-store";
import { Avatar } from "@/components/ui";

/** Fixed widths keep every column lined up, whatever the text length. */
const COLUMNS = [
  { label: "Company", width: "24%" },
  { label: "Stage", width: "14%" },
  { label: "Requirement", width: "20%" },
  { label: "Value", width: "10%", alignRight: true },
  { label: "Owner", width: "12%" },
  { label: "Next action", width: "20%" },
];

/** Every cell follows the same pattern: a main line, then a small grey line under it. */
function Cell({ main, sub, subIsStrong = false, alignRight = false }: { main: ReactNode; sub?: ReactNode; subIsStrong?: boolean; alignRight?: boolean }) {
  return (
    <td className={`px-4 py-3.5 align-middle ${alignRight ? "text-right" : ""}`}>
      <p className="truncate text-sm font-medium">{main}</p>
      <p className={`mt-0.5 truncate text-xs ${subIsStrong ? "font-medium text-black" : "text-neutral-500"}`}>{sub ?? " "}</p>
    </td>
  );
}

export function PipelineTable({ cards }: { cards: PipelineCard[] }) {
  const router = useRouter();
  const now = useNow();

  return (
    <div className="animate-enter lift panel overflow-x-auto p-2">
      <table className="w-full min-w-[900px] table-fixed text-sm">
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="text-left text-xs text-neutral-500">
            {COLUMNS.map((column) => (
              <th key={column.label} scope="col" className={`px-4 py-3 font-medium ${column.alignRight ? "text-right" : ""}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-neutral-200">
          {cards.map(({ lead, quote, value, needsApproval }) => {
            const isOverdue = now !== null && lead.nextAction !== null && new Date(lead.nextAction.dueAt).getTime() < now;
            return (
              <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="cursor-pointer transition-colors hover:bg-white/60">
                <Cell
                  main={
                    <Link href={`/leads/${lead.id}`} onClick={(event) => event.stopPropagation()} className="font-semibold hover:underline">
                      {lead.company}
                    </Link>
                  }
                  sub={`${lead.contactName} · ${lead.location}`}
                />
                <Cell main={stageLabel(lead.stage)} sub={needsApproval ? "Waiting for approval" : undefined} />
                <Cell main={lead.product} sub={`${formatCount(lead.quantity)} pcs`} />
                <Cell main={<span className="font-semibold tabular-nums">{formatCompactMoney(value)}</span>} sub={quote && `${formatUnitPrice(quote.unitPrice)} / pc`} alignRight />
                <Cell
                  main={
                    <span className="flex items-center gap-2">
                      <Avatar name={lead.owner} /> {lead.owner}
                    </span>
                  }
                />
                <Cell
                  main={lead.nextAction?.text ?? "—"}
                  sub={lead.nextAction && now !== null ? (isOverdue ? `Overdue ${formatRelative(lead.nextAction.dueAt, now)}` : formatRelative(lead.nextAction.dueAt, now)) : undefined}
                  subIsStrong={isOverdue}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
