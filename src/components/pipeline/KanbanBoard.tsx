"use client";

import { useState } from "react";
import { STAGES, nextStageOf } from "@/config/stages";
import { formatCompactMoney } from "@/lib/format";
import { type PipelineCard, moveBlockedReason } from "@/lib/pipeline-cards";
import type { StageId } from "@/lib/types";
import { DealCard } from "@/components/pipeline/DealCard";

/** Next stage the deal may move to right now, or null when blocked. */
function quickMoveStageOf(card: PipelineCard): StageId | null {
  const nextStage = nextStageOf(card.lead.stage);
  return nextStage && !moveBlockedReason(card, nextStage) ? nextStage : null;
}

export function KanbanBoard({ cards, onMove }: { cards: PipelineCard[]; onMove: (card: PipelineCard, targetStage: StageId) => void }) {
  const [draggedCard, setDraggedCard] = useState<PipelineCard | null>(null);
  const [hoveredStage, setHoveredStage] = useState<StageId | null>(null);

  const allowedTarget = draggedCard && quickMoveStageOf(draggedCard);

  const endDrag = () => {
    setDraggedCard(null);
    setHoveredStage(null);
  };

  const dropOnStage = (targetStage: StageId) => {
    if (draggedCard && targetStage !== draggedCard.lead.stage) onMove(draggedCard, targetStage);
    endDrag();
  };

  return (
    <div className="scroll-thin -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 md:snap-none md:-mx-4 md:px-4">
      {STAGES.map((stage, stageIndex) => {
        const stageCards = cards.filter((card) => card.lead.stage === stage.id);
        const stageValue = stageCards.reduce((sum, card) => sum + card.value, 0);
        const isAllowedTarget = allowedTarget === stage.id;
        const isDimmed = draggedCard !== null && !isAllowedTarget && stage.id !== draggedCard.lead.stage;
        return (
          <section
            key={stage.id}
            onDragOver={(event) => {
              event.preventDefault();
              if (hoveredStage !== stage.id) setHoveredStage(stage.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              dropOnStage(stage.id);
            }}
            className={`flex w-[82vw] shrink-0 snap-start flex-col sm:w-[280px] rounded-[1.75rem] border border-white/60 bg-white/30 p-2.5 backdrop-blur-xl transition-all duration-200 hover:bg-white/45 ${isDimmed ? "opacity-45" : ""} ${
              isAllowedTarget ? `outline-2 outline-dashed outline-black ${hoveredStage === stage.id ? "bg-white" : "bg-white/70"}` : ""
            }`}
          >
            <header className="mb-3 flex items-center justify-between px-2.5 pt-1.5">
              <div>
                <h2 className="text-sm font-semibold">{stage.label}</h2>
                <p className="mt-0.5 text-xs text-neutral-500 tabular-nums">{stageCards.length > 0 ? formatCompactMoney(stageValue) : "—"}</p>
              </div>
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-black px-2 text-xs font-semibold text-white tabular-nums transition-transform hover:scale-110">{stageCards.length}</span>
            </header>
            <div className="flex min-h-24 flex-col gap-2.5">
              {stageCards.map((card, cardIndex) => {
                const quickMoveStage = quickMoveStageOf(card);
                return (
                  <DealCard
                    key={card.lead.id}
                    card={card}
                    index={stageIndex + cardIndex}
                    isDragging={draggedCard?.lead.id === card.lead.id}
                    quickMoveStage={quickMoveStage}
                    onQuickMove={() => quickMoveStage && onMove(card, quickMoveStage)}
                    onDragStart={() => setDraggedCard(card)}
                    onDragEnd={endDrag}
                  />
                );
              })}
              {stageCards.length === 0 && (
                <p className="rounded-2xl border border-dashed border-neutral-300 py-8 text-center text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-600">{isAllowedTarget ? "Drop here" : "No deals"}</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
