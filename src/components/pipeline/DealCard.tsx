"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { DragEvent } from "react";
import { stageLabel } from "@/config/stages";
import { formatCompactMoney, formatCount } from "@/lib/format";
import type { PipelineCard } from "@/lib/pipeline-cards";
import type { StageId } from "@/lib/types";
import { Avatar, enterDelay } from "@/components/ui";

const CARD_SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;

interface DealCardProps {
  card: PipelineCard;
  index: number;
  isDragging: boolean;
  /** The stage this deal can move to right now, or null when it is blocked. */
  quickMoveStage: StageId | null;
  onQuickMove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function DealCard({ card, index, isDragging, quickMoveStage, onQuickMove, onDragStart, onDragEnd }: DealCardProps) {
  const { lead, value, needsApproval } = card;
  return (
    <motion.div
      layout
      layoutId={lead.id}
      transition={CARD_SPRING}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: isDragging ? 0.97 : 1 }}
      className="group relative"
    >
      <Link
        href={`/leads/${lead.id}`}
        draggable
        onDragStart={(event: DragEvent) => {
          event.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        style={enterDelay(index)}
        className="animate-enter block cursor-grab rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur-md transition-[box-shadow,translate] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-snug font-semibold">{lead.company}</p>
          {needsApproval && <span className="shrink-0 rounded-full bg-black transition-transform group-hover:scale-105 px-2.5 py-1 text-[10px] font-semibold text-white">Approval</span>}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {lead.product} · {formatCount(lead.quantity)} pcs
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-neutral-200 pt-3">
          <span className="text-sm font-semibold tabular-nums">{formatCompactMoney(value)}</span>
          <span className={`transition-opacity ${quickMoveStage ? "group-hover:opacity-0" : ""}`}>
            <Avatar name={lead.owner} />
          </span>
        </div>
      </Link>

      {/* Quick action: appears on hover, sits where the owner avatar is. */}
      {quickMoveStage && (
        <button
          onClick={onQuickMove}
          className="press absolute right-3.5 bottom-3.5 flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:opacity-100 hover:bg-neutral-800 focus-visible:opacity-100"
          aria-label={`Move ${lead.company} to ${stageLabel(quickMoveStage)}`}
        >
          {stageLabel(quickMoveStage)} <ArrowRight className="size-3" />
        </button>
      )}
    </motion.div>
  );
}
